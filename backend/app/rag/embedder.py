from dotenv import load_dotenv
load_dotenv()

import os
from typing import List
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from langchain_core.documents import Document

nvidia_api_key = os.getenv("NVIDIA_API_KEY")

embedding_model = NVIDIAEmbeddings(
    model="nvidia/llama-nemotron-embed-1b-v2",
    api_key=nvidia_api_key,
    truncate="NONE",
)


async def embed_documents(texts: List[str]) -> List[List[float]]:
    """Embed a list of text strings into vectors."""
    return await embedding_model.aembed_documents(texts)


async def embed_query(query: str) -> List[float]:
    """Embed a single query string into a vector."""
    return await embedding_model.aembed_query(query)
