"""
Chat Agent (RAG Q&A)
====================
Answers user questions grounded in uploaded project documents via Qdrant retrieval + Gemini.
"""

from __future__ import annotations

import os
from dotenv import load_dotenv
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from config.qdrant import get_vector_store
from models.chat_model import ChatSession, ChatMessage, MessageRole

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2,
)

CHAT_SYSTEM_PROMPT = """You are an AI Project Intelligence Advisor for a software development team.
You have access to the team's uploaded project documents (proposals, SRS, meeting notes, progress reports, task lists).

Your role is to:
- Answer questions about project status, risks, scope, deliverables, and team progress
- Highlight risks and blockers proactively when relevant
- Give actionable, specific recommendations grounded in the documents
- Be honest when information is not available in the documents

Always ground your responses in the provided context. If the context doesn't contain enough information, say so.
Format responses with Markdown when helpful (bullet points, headers for complex answers)."""


async def chat(
    project_id: str,
    user_message: str,
    chat_history: list[ChatMessage] | None = None,
) -> tuple[str, list[str]]:
    """
    Generate a grounded response to a user query.

    Returns:
        (response_text, source_filenames)
    """
    # ── 1. Retrieve relevant chunks ──────────────────────────────────────────
    vector_store = get_vector_store(project_id)
    retrieved_docs = await vector_store.asimilarity_search(user_message, k=6)

    if not retrieved_docs:
        return (
            "I couldn't find relevant information in the uploaded project documents. "
            "Please make sure documents have been uploaded and processed for this project.",
            [],
        )

    # Collect source filenames for attribution
    sources = list({d.metadata.get("filename", "Unknown") for d in retrieved_docs})

    # Build context from retrieved chunks
    context = "\n\n---\n\n".join(
        f"[Source: {d.metadata.get('filename', 'Unknown')}]\n{d.page_content}"
        for d in retrieved_docs
    )

    # ── 2. Build message list ────────────────────────────────────────────────
    messages = [SystemMessage(content=CHAT_SYSTEM_PROMPT)]

    # Include last 6 messages of chat history for context
    if chat_history:
        for msg in chat_history[-6:]:
            if msg.role == MessageRole.USER:
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == MessageRole.ASSISTANT:
                messages.append(AIMessage(content=msg.content))

    # Add current query with retrieved context
    messages.append(
        HumanMessage(
            content=f"""RELEVANT PROJECT DOCUMENTS:{context}USER QUESTION: {user_message}"""
        )
    )

    # ── 3. Invoke LLM ────────────────────────────────────────────────────────
    response = await llm.ainvoke(messages)
    return response.content, sources
