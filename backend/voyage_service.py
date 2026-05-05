"""
Voyage AI semantic search service.
Converts topics/queries into embeddings and finds semantically similar content.
"""

import os
import json
import numpy as np
import voyageai

_client = None

def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("VOYAGE_API_KEY", "")
        if not api_key:
            raise RuntimeError("VOYAGE_API_KEY not set")
        _client = voyageai.Client(api_key=api_key)
    return _client

def is_configured() -> bool:
    return bool(os.getenv("VOYAGE_API_KEY", ""))

def embed_text(text: str) -> list[float]:
    """Embed a single text string."""
    result = get_client().embed([text], model="voyage-3")
    return result.embeddings[0]

def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed multiple texts in one API call (cheaper)."""
    if not texts:
        return []
    result = get_client().embed(texts, model="voyage-3")
    return result.embeddings

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    return float(np.dot(a, b) / denom) if denom > 0 else 0.0

def rank_by_similarity(
    query_embedding: list[float],
    candidates: list[dict],          # each must have "embedding" key
    label_key: str = "topic",
    top_k: int = 5,
    min_score: float = 0.3
) -> list[dict]:
    """Return top_k candidates ranked by cosine similarity to query."""
    scored = []
    for c in candidates:
        score = cosine_similarity(query_embedding, c["embedding"])
        if score >= min_score:
            scored.append({**c, "score": round(score, 4)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]

def rank_diverse(
    query_embedding: list[float],
    candidates: list[dict],
    top_k: int = 4,
    min_score: float = 0.3,
    diversity_threshold: float = 0.82
) -> list[dict]:
    """
    Return diverse top_k results — skips candidates too similar to
    already-selected ones so you don't get 4 variants of the same topic.
    """
    scored = []
    for c in candidates:
        score = cosine_similarity(query_embedding, c["embedding"])
        if score >= min_score:
            scored.append({**c, "score": round(score, 4)})
    scored.sort(key=lambda x: x["score"], reverse=True)

    selected = []
    for candidate in scored:
        too_similar = any(
            cosine_similarity(candidate["embedding"], s["embedding"]) >= diversity_threshold
            for s in selected
        )
        if not too_similar:
            selected.append(candidate)
        if len(selected) == top_k:
            break
    return selected
