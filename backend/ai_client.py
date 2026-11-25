import os
from openai import OpenAI

# Groq retired the Llama 3.x models for free/dev-tier keys on 2026-08-16, and
# Google shut down Gemini 2.0 and 1.5. If an old GROQ_MODEL / GEMINI_MODEL is
# still set in the environment (e.g. on Render), ignore it and use the default.
_RETIRED_MODELS = {
    "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192",
    "llama3-8b-8192", "mixtral-8x7b-32768", "gemma2-9b-it",
    "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash-001",
    "gemini-1.5-pro", "gemini-1.5-flash",
}


def _model_from_env(name: str, default: str) -> str:
    value = os.getenv(name, "").strip()
    if not value or value in _RETIRED_MODELS:
        return default
    return value


# ── Groq (primary — fast & free) ──────────────────────────────────────────────
GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = _model_from_env("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_URL   = "https://api.groq.com/openai/v1"

# ── Gemini (fallback — Search Grounding + Function Calling) ───────────────────
GEMINI_KEY   = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = _model_from_env("GEMINI_MODEL", "gemini-2.5-flash")

_groq = OpenAI(api_key=GROQ_KEY, base_url=GROQ_URL) if GROQ_KEY else None


def _groq_extra(kwargs: dict) -> dict:
    """gpt-oss reasons before answering; keep that short so small max_tokens
    budgets still leave room for the actual answer."""
    if GROQ_MODEL.startswith("openai/gpt-oss") and "reasoning_effort" not in kwargs:
        return {**kwargs, "reasoning_effort": "low"}
    return kwargs

# Native Gemini client (new google-genai SDK)
_gemini = None
try:
    from google import genai as _genai
    from google.genai import types as _gtypes
    if GEMINI_KEY:
        _gemini = _genai.Client(api_key=GEMINI_KEY)
        print(f"[ai_client] Gemini ({GEMINI_MODEL}) + Search Grounding ready")
except ImportError:
    print("[ai_client] google-genai not installed — Gemini unavailable")
except Exception as e:
    print(f"[ai_client] Gemini init error: {e}")


def _gemini_compat_response(text):
    """Wrap Gemini text in OpenAI-style response so callers need no changes."""
    class _Msg:
        content = text
        role    = "assistant"
    class _Choice:
        message       = _Msg()
        finish_reason = "stop"
    class _Resp:
        choices = [_Choice()]
    return _Resp()


def _gemini_generate(prompt: str) -> str:
    config = _gtypes.GenerateContentConfig(
        tools=[_gtypes.Tool(google_search=_gtypes.GoogleSearch())]
    )
    resp = _gemini.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=config,
    )
    return resp.text


# ── Drop-in client (client.chat.completions.create) ───────────────────────────
class _Completions:
    def create(self, *, model=None, messages=None, timeout=None, **kwargs):
        msgs = messages or []

        if _groq:
            try:
                return _groq.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=msgs,
                    timeout=timeout or 10,
                    **_groq_extra(kwargs),
                )
            except Exception as e:
                print(f"[ai_client] Groq failed ({type(e).__name__}), using Gemini...")

        if _gemini:
            prompt = "\n".join(
                f"{m['role'].upper()}: {m['content']}"
                for m in msgs
                if isinstance(m.get("content"), str)
            )
            return _gemini_compat_response(_gemini_generate(prompt))

        raise RuntimeError("No AI provider — set GROQ_API_KEY or GEMINI_API_KEY")


class _Chat:
    completions = _Completions()


class FallbackClient:
    """
    Drop-in OpenAI client replacement.
    Primary : Groq gpt-oss-120b  (fast, free)
    Fallback : Gemini 2.0 Flash   (search grounding, function calling)
    """
    chat = _Chat()


# ── Stateful ChatSession (Interactions API) ───────────────────────────────────
class ChatSession:
    """Multi-turn conversation with automatic memory."""
    def __init__(self, system_prompt: str = "You are a helpful AI assistant."):
        self.history = [{"role": "system", "content": system_prompt}]
        self._gemini_chat = _gemini.chats.create(model=GEMINI_MODEL) if _gemini else None

    def send(self, user_message: str) -> str:
        self.history.append({"role": "user", "content": user_message})

        if _groq:
            try:
                resp = _groq.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=self.history,
                    timeout=10,
                )
                reply = resp.choices[0].message.content
                self.history.append({"role": "assistant", "content": reply})
                return reply
            except Exception as e:
                print(f"[ChatSession] Groq failed: {e}")

        if self._gemini_chat:
            resp  = self._gemini_chat.send_message(user_message)
            reply = resp.text
            self.history.append({"role": "assistant", "content": reply})
            return reply

        raise RuntimeError("No AI provider available")

    def clear(self):
        self.history = self.history[:1]
        if _gemini:
            self._gemini_chat = _gemini.chats.create(model=GEMINI_MODEL)


# ── Function Calling helper ───────────────────────────────────────────────────
def call_with_tools(prompt: str, tools: list, system: str = "") -> str:
    """Run prompt with Gemini function calling; falls back to Groq plain text."""
    if _gemini:
        try:
            from google.genai import types as _gt
            config = _gt.GenerateContentConfig(
                tools=tools,
                system_instruction=system or "You are a helpful AI assistant.",
            )
            resp = _gemini.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=config,
            )
            return resp.text
        except Exception as e:
            print(f"[call_with_tools] Gemini error: {e}")

    if _groq:
        resp = _groq.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            timeout=15,
        )
        return resp.choices[0].message.content

    raise RuntimeError("No provider for function calling")


# Singleton — import this everywhere
client = FallbackClient()
