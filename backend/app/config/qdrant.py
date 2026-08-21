import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from langchain_qdrant import QdrantVectorStore
from rag.embedder import embedding_model

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
VECTOR_SIZE = 2048  # nvidia/llama-nemotron-embed-1b-v2 output dimension

# Shared singleton client
qdrant_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    global qdrant_client
    if qdrant_client is None:
        qdrant_client = QdrantClient(url=QDRANT_URL)
    return qdrant_client


def collection_name(project_id: str) -> str:
    """One Qdrant collection per project for full isolation."""
    return f"project_{project_id}"


def get_or_create_collection(project_id: str) -> str:
    """Ensure a Qdrant collection exists for the given project. Returns collection name."""
    client = get_qdrant_client()
    col = collection_name(project_id)
    if not client.collection_exists(col):
        client.create_collection(
            collection_name=col,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        print(f"[QDRANT] Created collection: {col}")
    return col


def get_vector_store(project_id: str) -> QdrantVectorStore:
    """Return a LangChain QdrantVectorStore bound to a project's collection."""
    col = get_or_create_collection(project_id)
    return QdrantVectorStore(
        client=get_qdrant_client(),
        collection_name=col,
        embedding=embedding_model,
    )


def delete_collection(project_id: str) -> None:
    """Delete a project's Qdrant collection (e.g. when project is deleted)."""
    client = get_qdrant_client()
    col = collection_name(project_id)
    if client.collection_exists(col):
        client.delete_collection(collection_name=col)
        print(f"[QDRANT] Deleted collection: {col}")