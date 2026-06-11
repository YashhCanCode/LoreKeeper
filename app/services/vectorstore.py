from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any
from uuid import uuid4

import chromadb  # type: ignore[import]
from chromadb.api.models.Collection import Collection  # type: ignore[import]
from langchain_core.documents import Document

from app.config import get_settings
from app.models.schemas import DocumentInfo, SourceChunk


class VectorStoreService:
    def __init__(self) -> None:
        self.settings = get_settings()
        Path(self.settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(path=self.settings.chroma_persist_dir)
        self._collection: Collection | None = None

    @property
    def collection(self) -> Collection:
        if self._collection is None:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

            embedding_function = SentenceTransformerEmbeddingFunction(
                model_name=self.settings.embedding_model
            )
            self._collection = self._client.get_or_create_collection(
                name="lorekeeper",
                embedding_function=embedding_function,
                metadata={"hnsw:space": "cosine"},
            )
        return self._collection

    def add_document(
        self,
        filename: str,
        chunks: list[Document],
        document_id: str | None = None,
        user_id: str | None = None,
    ) -> str:
        document_id = document_id or str(uuid4())
        uploaded_at = datetime.now(timezone.utc).isoformat()
        ids: list[str] = []
        texts: list[str] = []
        metadatas: list[dict[str, Any]] = []

        for index, chunk in enumerate(chunks):
            metadata: dict[str, Any] = {
                "document_id": document_id,
                "filename": filename,
                "chunk_index": index,
                "uploaded_at": uploaded_at,
            }
            if user_id is not None:
                metadata["user_id"] = user_id
            if chunk.metadata.get("page_number") is not None:
                metadata["page_number"] = int(chunk.metadata["page_number"])
            ids.append(f"{document_id}:{index}")
            texts.append(chunk.page_content)
            metadatas.append(metadata)

        self.collection.add(ids=ids, documents=texts, metadatas=metadatas)
        return document_id

    def search(
        self,
        query: str,
        document_ids: list[str] | None = None,
        limit: int | None = None,
        user_id: str | None = None,
    ) -> list[SourceChunk]:
        collection_count = self.collection.count()
        if collection_count == 0:
            return []
        where = self._build_filter(document_ids, user_id)
        result = self.collection.query(
            query_texts=[query],
            n_results=min(limit or self.settings.top_k_results, collection_count),
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        if not result["documents"] or not result["documents"][0]:
            return []

        sources: list[SourceChunk] = []
        for text, metadata, distance in zip(
            result["documents"][0], result["metadatas"][0], result["distances"][0]
        ):
            sources.append(
                SourceChunk(
                    document_id=str(metadata["document_id"]),
                    filename=str(metadata["filename"]),
                    chunk_text=text,
                    chunk_index=int(metadata["chunk_index"]),
                    page_number=metadata.get("page_number"),
                    relevance_score=round(max(0.0, 1.0 - float(distance)), 4),
                )
            )
        return sources

    def list_documents(self, user_id: str | None = None) -> list[DocumentInfo]:
        where = {"user_id": user_id} if user_id is not None else None
        result = self.collection.get(where=where, include=["metadatas"])
        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for metadata in result["metadatas"] or []:
            grouped[str(metadata["document_id"])].append(metadata)

        documents = [
            DocumentInfo(
                document_id=document_id,
                filename=str(items[0]["filename"]),
                uploaded_at=str(items[0]["uploaded_at"]),
                chunk_count=len(items),
            )
            for document_id, items in grouped.items()
        ]
        return sorted(documents, key=lambda item: item.uploaded_at, reverse=True)

    def delete_document(self, document_id: str, user_id: str | None = None) -> bool:
        where = self._build_filter([document_id], user_id)
        existing = self.collection.get(where=where, include=["metadatas"], limit=1)
        if not existing["ids"]:
            return False
        self.collection.delete(where=where)
        return True

    @staticmethod
    def _document_filter(document_ids: list[str] | None) -> dict[str, Any] | None:
        if not document_ids:
            return None
        if len(document_ids) == 1:
            return {"document_id": document_ids[0]}
        return {"document_id": {"$in": document_ids}}

    @classmethod
    def _build_filter(
        cls, document_ids: list[str] | None, user_id: str | None
    ) -> dict[str, Any] | None:
        clauses = []
        doc_filter = cls._document_filter(document_ids)
        if doc_filter is not None:
            clauses.append(doc_filter)
        if user_id is not None:
            clauses.append({"user_id": user_id})
        if not clauses:
            return None
        if len(clauses) == 1:
            return clauses[0]
        return {"$and": clauses}


@lru_cache
def get_vector_store() -> VectorStoreService:
    return VectorStoreService()
