from __future__ import annotations

import json
from functools import lru_cache
from typing import Any
from uuid import uuid4

import requests

from app.config import get_settings
from app.models.schemas import SourceChunk


class FoundryIQError(RuntimeError):
    """Raised when the Foundry IQ (Azure AI Search) retrieval call fails."""


class FoundryIQClient:
    """Thin client around Azure AI Search's agentic retrieval (Foundry IQ) API.

    A Foundry IQ knowledge base treats retrieval as a reasoning task: it plans
    sub-queries, runs them against one or more knowledge sources, and returns a
    synthesized, cited grounding payload. When configured, this client is used
    in place of the local ChromaDB vector search so that LoreKeeper's chat,
    creative, and consistency-check flows are grounded by Foundry IQ instead.

    If no Azure AI Search credentials are configured, `is_configured` is False
    and callers should fall back to the local ChromaDB vector store.
    """

    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def is_configured(self) -> bool:
        s = self.settings
        return bool(
            s.azure_search_endpoint
            and s.azure_search_api_key
            and s.azure_search_knowledge_base
            and s.azure_search_knowledge_source
        )

    def retrieve(
        self,
        query: str,
        document_ids: list[str] | None = None,
        limit: int | None = None,
    ) -> list[SourceChunk]:
        if not self.is_configured:
            raise FoundryIQError("Foundry IQ is not configured.")

        s = self.settings
        endpoint = s.azure_search_endpoint.rstrip("/")
        url = (
            f"{endpoint}/knowledgebases/{s.azure_search_knowledge_base}/retrieve"
            f"?api-version={s.azure_search_api_version}"
        )

        knowledge_source: dict[str, Any] = {
            "knowledgeSourceName": s.azure_search_knowledge_source,
            "kind": "searchIndex",
            "includeReferences": True,
            "includeReferenceSourceData": True,
        }
        if document_ids:
            if len(document_ids) == 1:
                knowledge_source["filterAddOn"] = f"document_id eq '{document_ids[0]}'"
            else:
                ids = ", ".join(f"'{doc_id}'" for doc_id in document_ids)
                knowledge_source["filterAddOn"] = f"search.in(document_id, '{ids}', ',')"

        payload: dict[str, Any] = {
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": query}]}
            ],
            "knowledgeSourceParams": [knowledge_source],
            "maxRuntimeInSeconds": 30,
        }
        if limit:
            payload["maxOutputSize"] = max(limit * 500, 1000)

        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json", "api-key": s.azure_search_api_key},
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            raise FoundryIQError(f"Foundry IQ retrieval failed: {exc}") from exc

        return self._parse_response(response.json())

    @staticmethod
    def _parse_response(data: dict[str, Any]) -> list[SourceChunk]:
        chunks: list[dict[str, Any]] = []
        for message in data.get("response") or []:
            for item in message.get("content") or []:
                if item.get("type") != "text":
                    continue
                try:
                    parsed = json.loads(item["text"])
                except (KeyError, ValueError):
                    continue
                if isinstance(parsed, list):
                    chunks.extend(c for c in parsed if isinstance(c, dict))

        references = {ref.get("id"): ref for ref in data.get("references") or []}

        sources: list[SourceChunk] = []
        for index, chunk in enumerate(chunks):
            ref_id = chunk.get("ref_id")
            reference = references.get(str(ref_id)) or {}
            source_data = reference.get("sourceData") or {}

            filename = (
                source_data.get("filename")
                or source_data.get("title")
                or chunk.get("title")
                or reference.get("docKey")
                or "Foundry IQ source"
            )
            document_id = (
                source_data.get("document_id")
                or reference.get("docKey")
                or str(ref_id if ref_id is not None else uuid4())
            )
            content = chunk.get("content") or source_data.get("content") or ""
            page_number = source_data.get("page_number")

            sources.append(
                SourceChunk(
                    document_id=str(document_id),
                    filename=str(filename),
                    chunk_text=str(content),
                    chunk_index=index,
                    page_number=int(page_number) if page_number is not None else None,
                    relevance_score=1.0,
                )
            )

        return sources


@lru_cache
def get_foundry_iq_client() -> FoundryIQClient:
    return FoundryIQClient()
