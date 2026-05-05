import os
from openai import OpenAI

GROQ_KEY     = os.getenv("GROQ_API_KEY", "")
GEMINI_KEY   = os.getenv("GEMINI_API_KEY", "")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_MODEL = "gemini-1.5-flash"

_groq = OpenAI(
    api_key=GROQ_KEY,
    base_url="https://api.groq.com/openai/v1",
) if GROQ_KEY else None

_gemini = OpenAI(
    api_key=GEMINI_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
) if GEMINI_KEY else None

class _Completions:
    def create(self, *, model=None, timeout=None, **kwargs):
        if _groq:
            try:
                return _groq.chat.completions.create(
                    model=GROQ_MODEL,
                    timeout=timeout or 10,
                    **kwargs,
                )
            except Exception as e:
                print(f"[ai_client] Groq failed ({e}), switching to Gemini...")
        if _gemini:
            return _gemini.chat.completions.create(model=GEMINI_MODEL, **kwargs)
        raise RuntimeError("No AI provider available — set GROQ_API_KEY or GEMINI_API_KEY")

class _Chat:
    completions = _Completions()

class FallbackClient:
    """Drop-in OpenAI client: tries Groq first, falls back to Gemini."""
    chat = _Chat()

# Import this in place of: client = OpenAI(...)
client = FallbackClient()
