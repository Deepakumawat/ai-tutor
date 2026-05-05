import os
from openai import OpenAI

# ── Groq (primary — fast & free) ──────────────────────────────────────────────
GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL   = "https://api.groq.com/openai/v1"

# ── Gemini (fallback — Search Grounding + Function Calling) ───────────────────
GEMINI_KEY   = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"

_groq = OpenAI(api_key=GROQ_KEY, base_url=GROQ_URL) if GROQ_KEY else None

# Native Gemini client with Search Grounding
_gemini_model = None
try:
    import google.generativeai as genai
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        _gemini_model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            tools=["google_search_retrieval"],   # Search Grounding
        )
        print("[ai_client] Gemini 2.0 Flash + Search Grounding ready")
except ImportError:
    print("[ai_client] google-generativeai not installed — Gemini unavailable")
except Exception as e:
    print(f"[ai_client] Gemini init error: {e}")


def _gemini_compat_response(text):
    """Wrap Gemini text in OpenAI-style response so callers need no changes."""
    class _Msg:
        content = text
        role    = "assistant"
    class _Choice:
        message      = _Msg()
        finish_reason = "stop"
    class _Resp:
        choices = [_Choice()]
    return _Resp()


# ── Drop-in client (client.chat.completions.create) ───────────────────────────
class _Completions:
    def create(self, *, model=None, messages=None, timeout=None, **kwargs):
        msgs = messages or []

        # 1. Try Groq (10s timeout)
        if _groq:
            try:
                return _groq.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=msgs,
                    timeout=timeout or 10,
                    **kwargs,
                )
            except Exception as e:
                print(f"[ai_client] Groq failed ({type(e).__name__}), using Gemini...")

        # 2. Fallback: Gemini with Search Grounding
        if _gemini_model:
            prompt = "\n".join(
                f"{m['role'].upper()}: {m['content']}"
                for m in msgs
                if isinstance(m.get("content"), str)
            )
            resp = _gemini_model.generate_content(prompt)
            return _gemini_compat_response(resp.text)

        raise RuntimeError("No AI provider — set GROQ_API_KEY or GEMINI_API_KEY")


class _Chat:
    completions = _Completions()


class FallbackClient:
    """
    Drop-in OpenAI client replacement.
    Primary : Groq llama-3.3-70b  (fast, free)
    Fallback : Gemini 2.0 Flash   (search grounding, function calling)
    """
    chat = _Chat()


# ── Stateful ChatSession (Interactions API) ───────────────────────────────────
class ChatSession:
    """
    Multi-turn conversation with automatic memory.
    Uses Groq history array; falls back to Gemini native chat session.
    """
    def __init__(self, system_prompt: str = "You are a helpful AI assistant."):
        self.history = [{"role": "system", "content": system_prompt}]
        self._gemini_chat = _gemini_model.start_chat() if _gemini_model else None

    def send(self, user_message: str) -> str:
        self.history.append({"role": "user", "content": user_message})

        # Try Groq with full history
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

        # Gemini native stateful chat
        if self._gemini_chat:
            resp  = self._gemini_chat.send_message(user_message)
            reply = resp.text
            self.history.append({"role": "assistant", "content": reply})
            return reply

        raise RuntimeError("No AI provider available")

    def clear(self):
        system = self.history[:1]
        self.history = system
        if _gemini_model:
            self._gemini_chat = _gemini_model.start_chat()


# ── Function Calling helper ───────────────────────────────────────────────────
def call_with_tools(prompt: str, tools: list, system: str = "") -> str:
    """
    Run prompt with function/tool calling via Gemini.
    tools: list of genai.protos.Tool or plain dicts with name/description/parameters
    Returns the final text response after tool execution.
    """
    if not _gemini_model:
        # Fall back to plain Groq if Gemini unavailable
        if _groq:
            resp = _groq.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                timeout=15,
            )
            return resp.choices[0].message.content
        raise RuntimeError("No provider for function calling")

    try:
        import google.generativeai as genai
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            tools=tools,
            system_instruction=system or "You are a helpful AI assistant.",
        )
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as e:
        print(f"[call_with_tools] error: {e}")
        return ""


# Singleton — import this everywhere
client = FallbackClient()
