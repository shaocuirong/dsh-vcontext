"""Offline lexical baseline and optional real multilingual semantic embeddings."""
import hashlib
import math
import re
from collections import Counter


def terms(text):
    # Chinese characters and bigrams, plus whole non-CJK words.
    words = re.findall(r"[^\W_]+", text.lower(), re.UNICODE)
    result = []
    for word in words:
        for part in re.findall(r"[\u3400-\u9fff]+|[^\u3400-\u9fff]+", word):
            if '\u3400' <= part[0] <= '\u9fff':
                result.extend(part)
                result.extend(part[i:i+2] for i in range(len(part)-1))
            else:
                result.append(part)
    return result


def normalize(vector):
    if not vector or any(not math.isfinite(float(x)) for x in vector):
        raise ValueError("Embedding must be a nonempty finite vector")
    norm = math.sqrt(sum(float(x)**2 for x in vector))
    return [float(x)/norm if norm else 0.0 for x in vector]


def cosine(a, b):
    if len(a) != len(b):
        raise ValueError("Embedding dimension mismatch")
    return max(-1.0, min(1.0, sum(x*y for x, y in zip(a, b))))


class LexicalEmbedder:
    """Feature hashing is lexical, NOT a neural semantic model."""
    model_id = "lexical-sha256-cjk-v1:384"

    def encode(self, text):
        vector = [0.0]*384
        for term, count in Counter(terms(text)).items():
            digest = hashlib.sha256(term.encode()).digest()
            vector[int.from_bytes(digest[:4], 'big') % 384] += 1 + math.log(count)
        return normalize(vector)


class SentenceEmbedder:
    def __init__(self, model):
        from sentence_transformers import SentenceTransformer
        self.model_id = "sentence-transformers:" + model
        self.model = SentenceTransformer(model)

    def encode(self, text):
        return normalize(self.model.encode(text, normalize_embeddings=True).tolist())
