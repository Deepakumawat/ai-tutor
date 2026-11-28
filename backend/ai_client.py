"""Groq-primary / Gemini-fallback LLM client.

Drop-in replacement for the OpenAI client: `client.chat.completions.create(...)`
returns an object with `.choices[0].message.content`, whichever provider answered.

Order:
  1. Groq GROQ_MODEL        (primary  — fast, free tier)
  2. Groq GROQ_FALLBACK     (smaller Groq model, separate quota)
  3. Gemini GEMINI_MODEL    (fallback — different vendor, survives a Groq outage)

Model IDs are env-overridable so a future retirement is a dashboard change,
not a code change. Defaults are the models that are generally available as of
2026-11-28:
  - Groq retired llama-3.3-70b-versatile / llama-3.1-8b-instant on 2026-08-16
    and gemma2-9b-it on 2025-10-08. Replacements: openai/gpt-oss-120b / -20b.
  - Google shut down gemini-2.0-flash on 2026-06-01 and gemini-1.5-pro earlier.
    Replacement: gemini-3.6-flash.
"""

import os
from openai import OpenAI

# ── Config (all env-overridable) ──────────────────────────────────────────────
GROQ_KEY      = (os.getenv("GROQ_API_KEY") or "").strip()
GROQ_MODEL    = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_FALLBACK = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")
GROQ_URL      = "https://api.groq.com/openai/v1"

GEMINI_KEY    = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_MODEL  = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

# Was 10s, which truncated long lesson/debug generations on a large model.
DEFAULT_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "60"))

# gpt-oss models are reasoning models: they spend completion tokens on a
# hidden `reasoning` field before emitting any answer, and that spend counts
# against max_tokens. Several call sites here use small budgets (200-500),
# where default-effort reasoning eats a meaningful slice of the answer.
# "low" cuts reasoning to ~30 chars instead of ~130-230. Set
# GROQ_REASONING_EFFORT="" to disable sending the param at all.
GROQ_REASONING_EFFORT = os.getenv("GROQ_REASONING_EFFORT", "low").strip()

# Try the primary first, then the smaller model (separate daily quota).
_GROQ_MODELS = [m for m in (GROQ_MODEL, GROQ_FALLBACK) if m]

_groq = OpenAI(api_key=GROQ_KEY, base_url=GROQ_URL) if GROQ_KEY else None

_gemini = None
try:
    from google import genai as _genai
    from google.genai import types as _gtypes
    if GEMINI_KEY:
        _gemini = _genai.Client(api_key=GEMINI_KEY)
        print(f"[ai_client] Gemini fallback ready ({GEMINI_MODEL})")
except ImportError:
    print("[ai_client] google-genai not installed — Gemini fallback unavailable")
except Exception as e:
    print(f"[ai_client] Gemini init error: {e}")

if _groq is None:
    print("[ai_client] WARNING: GROQ_API_KEY not set — primary provider disabled")


def _is_retryable(err: Exception) -> bool:
    """Rate limit / transient / dead-model errors: try the next model."""
    msg = str(err).lower()
    return any(s in msg for s in (
        "rate_limit", "rate limit", "429", "quota", "tokens per day", "tpd",
        "decommissioned", "model_not_found", "does not exist", "not found",
        "404", "500", "502", "503", "overloaded", "timeout", "timed out",
    ))


# ── OpenAI-shaped response wrapper ────────────────────────────────────────────
class _Msg:
    __slots__ = ("content", "role")
    def __init__(self, content, role="assistant"):
        self.content = content
        self.role = role


class _Choice:
    __slots__ = ("message", "index", "finish_reason")
    def __init__(self, content):
        self.message = _Msg(content)
        self.index = 0
        self.finish_reason = "stop"


class _Resp:
    __slots__ = ("choices", "model")
    def __init__(self, content, model):
        self.choices = [_Choice(content)]
        self.model = model


def _gemini_generate(messages, **kwargs):
    """Call Gemini with OpenAI-style messages, return an OpenAI-shaped object."""
    if _gemini is None:
        raise RuntimeError("Gemini not configured — set GEMINI_API_KEY and install google-genai")

    system_parts = [m["content"] for m in messages
                    if m.get("role") == "system" and isinstance(m.get("content"), str)]
    contents = []
    for m in messages:
        role = m.get("role", "user")
        if role == "system":
            continue
        if role == "assistant":
            role = "model"
        if role not in ("user", "model"):
            role = "user"
        contents.append({"role": role, "parts": [{"text": str(m.get("content", ""))}]})
    if not contents:
        contents = [{"role": "user", "parts": [{"text": "Hello"}]}]

    cfg = {}
    if system_parts:
        cfg["system_instruction"] = "\n\n".join(system_parts)
    if kwargs.get("temperature") is not None:
        cfg["temperature"] = kwargs["temperature"]
    if kwargs.get("max_tokens"):
        cfg["max_output_tokens"] = kwargs["max_tokens"]

    resp = _gemini.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=_gtypes.GenerateContentConfig(**cfg) if cfg else None,
    )
    return _Resp(resp.text or "", GEMINI_MODEL)


# ── Drop-in client ────────────────────────────────────────────────────────────
class _Completions:
    def create(self, *, model=None, messages=None, timeout=None, **kwargs):
        """`model` is accepted and ignored — this client picks the model."""
        msgs = messages or []
        kwargs.pop("model", None)
        last_err = None

        if _groq is not None:
            for name in _GROQ_MODELS:
                try:
                    extra = dict(kwargs)
                    # Only gpt-oss accepts reasoning_effort; sending it to a
                    # non-reasoning model would be rejected.
                    if GROQ_REASONING_EFFORT and "gpt-oss" in name:
                        extra.setdefault("reasoning_effort", GROQ_REASONING_EFFORT)
                    return _groq.chat.completions.create(
                        model=name,
                        messages=msgs,
                        timeout=timeout or DEFAULT_TIMEOUT,
                        **extra,
                    )
                except Exception as e:
                    last_err = e
                    print(f"[ai_client] Groq {name} failed ({type(e).__name__}: {e}) — next")
                    if not _is_retryable(e):
                        break

        if _gemini is not None:
            try:
                print(f"[ai_client] Falling back to Gemini {GEMINI_MODEL}")
                return _gemini_generate(msgs, **kwargs)
            except Exception as e:
                last_err = e
                print(f"[ai_client] Gemini fallback failed: {e}")

        if last_err is not None:
            raise last_err
        raise RuntimeError("No AI provider — set GROQ_API_KEY or GEMINI_API_KEY")


class _Chat:
    completions = _Completions()


class FallbackClient:
    """Drop-in OpenAI client replacement. Groq primary, Gemini fallback."""
    chat = _Chat()


# Singleton — import this everywhere
client = FallbackClient()


# ── Back-compat shims (nothing in these repos calls these today) ─────────────
class ChatSession:
    """Multi-turn conversation with automatic memory."""
    def __init__(self, system_prompt: str = "You are a helpful AI assistant."):
        self.history = [{"role": "system", "content": system_prompt}]

    def send(self, user_message: str) -> str:
        self.history.append({"role": "user", "content": user_message})
        resp = client.chat.completions.create(messages=self.history)
        reply = resp.choices[0].message.content
        self.history.append({"role": "assistant", "content": reply})
        return reply

    def clear(self):
        self.history = self.history[:1]


def call_with_tools(prompt: str, tools: list = None, system: str = "") -> str:
    """Kept for API compatibility; routes through the normal fallback chain."""
    msgs = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.append({"role": "user", "content": prompt})
    return client.chat.completions.create(messages=msgs).choices[0].message.content
