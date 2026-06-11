from functools import lru_cache

from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import get_settings
from app.models.schemas import ChatMessageOut, ChatResponse, CreativeResponse, SourceChunk
from app.services.foundry_iq import FoundryIQClient, FoundryIQError, get_foundry_iq_client
from app.services.vectorstore import VectorStoreService, get_vector_store


NOT_FOUND_ANSWER = "I couldn't find that information in the uploaded story bible."


class MissingApiKeyError(RuntimeError):
    pass


class RagEngine:
    def __init__(self, vector_store: VectorStoreService, foundry_iq: FoundryIQClient | None = None) -> None:
        self.settings = get_settings()
        self.vector_store = vector_store
        self.foundry_iq = foundry_iq or get_foundry_iq_client()
        self._llm: ChatGoogleGenerativeAI | None = None

    def _retrieve(
        self,
        query: str,
        document_ids: list[str] | None = None,
        limit: int | None = None,
        user_id: str | None = None,
    ) -> list[SourceChunk]:
        """Retrieve grounding chunks, preferring Foundry IQ when configured.

        Foundry IQ (Azure AI Search agentic retrieval) is used as the primary
        knowledge layer when Azure credentials are present; otherwise this
        falls back to the local ChromaDB vector store.
        """
        if self.foundry_iq.is_configured:
            try:
                return self.foundry_iq.retrieve(query, document_ids, limit)
            except FoundryIQError:
                # Fall back to local retrieval if Foundry IQ is unreachable.
                pass
        return self.vector_store.search(query, document_ids, limit, user_id=user_id)

    @property
    def llm(self) -> ChatGoogleGenerativeAI:
        if not self.settings.gemini_api_key or self.settings.gemini_api_key.startswith("your_"):
            raise MissingApiKeyError("Set a valid GEMINI_API_KEY in .env to use AI features.")
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model=self.settings.gemini_model,
                google_api_key=self.settings.gemini_api_key,
                temperature=0,
            )
        return self._llm

    def answer(
        self,
        query: str,
        document_ids: list[str] | None = None,
        history: list[ChatMessageOut] | None = None,
        user_id: str | None = None,
    ) -> ChatResponse:
        sources = self._retrieve(query, document_ids, user_id=user_id)
        if not sources:
            return ChatResponse(answer=NOT_FOUND_ANSWER, sources=[], query=query)

        history_block = ""
        if history:
            history_block = (
                "\nCONVERSATION SO FAR:\n"
                + self._format_history(history)
                + "\n"
            )

        prompt = f"""You are LoreKeeper, a precise story-bible assistant.
Answer the question using ONLY the supplied lore excerpts.
If the excerpts do not contain enough information, reply exactly:
{NOT_FOUND_ANSWER}
Do not use outside knowledge or invent details. Cite supporting excerpts inline as [Source N].
Use the conversation so far only to resolve references (e.g. "he", "that character") - never as a source of facts.
{history_block}
LORE EXCERPTS:
{self._format_sources(sources)}

QUESTION:
{query}
"""
        answer = self.llm.invoke(prompt).content
        return ChatResponse(answer=str(answer), sources=sources, query=query)

    def generate(
        self,
        prompt_text: str,
        document_ids: list[str] | None = None,
        history: list[ChatMessageOut] | None = None,
        user_id: str | None = None,
    ) -> CreativeResponse:
        sources = self._retrieve(prompt_text, document_ids, user_id=user_id)
        if not sources:
            return CreativeResponse(content=NOT_FOUND_ANSWER, sources=[], prompt=prompt_text)

        history_block = ""
        if history:
            history_block = (
                "\nCONVERSATION SO FAR:\n"
                + self._format_history(history)
                + "\n"
            )

        prompt = f"""You are LoreKeeper's grounded creative writing assistant.
Create the requested content while obeying every relevant fact and rule in the lore excerpts.
You may invent prose, dialogue, new characters, and connective details, but must not contradict
established lore. Build on the established characters, world, and events from the excerpts below.
Do not claim a new invention is established canon. If the request cannot be fulfilled without
contradicting the excerpts, explain the conflict instead.
{history_block}
LORE EXCERPTS:
{self._format_sources(sources)}

CREATIVE REQUEST:
{prompt_text}
"""
        content = self.llm.invoke(prompt).content
        return CreativeResponse(content=str(content), sources=sources, prompt=prompt_text)

    @staticmethod
    def _format_history(history: list[ChatMessageOut]) -> str:
        return "\n".join(
            f"{'User' if message.role == 'user' else 'Assistant'}: {message.content}"
            for message in history
        )

    @staticmethod
    def _format_sources(sources: list[SourceChunk]) -> str:
        return "\n\n".join(
            f"[Source {index}] {source.filename}, chunk {source.chunk_index}"
            + (f", page {source.page_number}" if source.page_number else "")
            + f"\n{source.chunk_text}"
            for index, source in enumerate(sources, start=1)
        )


@lru_cache
def get_rag_engine() -> RagEngine:
    return RagEngine(get_vector_store(), get_foundry_iq_client())
