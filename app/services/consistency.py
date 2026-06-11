from functools import lru_cache

from pydantic import BaseModel, Field

from app.models.schemas import ConsistencyResponse, Contradiction
from app.services.rag_engine import RagEngine, get_rag_engine


class DetectedContradiction(BaseModel):
    issue: str = Field(description="A concise explanation of the contradiction")
    existing_lore: str = Field(description="The conflicting established fact")
    source_number: int = Field(description="The numbered source supporting the established fact")


class ConsistencyAnalysis(BaseModel):
    contradictions: list[DetectedContradiction]


class ConsistencyService:
    def __init__(self, rag_engine: RagEngine) -> None:
        self.rag_engine = rag_engine

    def check(
        self, text: str, document_ids: list[str] | None = None, user_id: str | None = None
    ) -> ConsistencyResponse:
        sources = self.rag_engine._retrieve(text, document_ids, limit=8, user_id=user_id)
        if not sources:
            return ConsistencyResponse(
                has_contradictions=False,
                contradictions=[],
                message="No relevant established lore was found to compare against.",
            )

        prompt = f"""You are a meticulous story continuity editor.
Compare NEW TEXT against the numbered ESTABLISHED LORE excerpts.
Report only direct, factual contradictions. Do not flag missing information, ambiguity,
new compatible details, style differences, or mere possibilities.
Each contradiction must reference the one numbered source that proves the conflict.

ESTABLISHED LORE:
{self.rag_engine._format_sources(sources)}

NEW TEXT:
{text}
"""
        structured_llm = self.rag_engine.llm.with_structured_output(ConsistencyAnalysis)
        analysis = structured_llm.invoke(prompt)

        contradictions: list[Contradiction] = []
        for item in analysis.contradictions:
            source_index = item.source_number - 1
            if not 0 <= source_index < len(sources):
                continue
            source = sources[source_index]
            contradictions.append(
                Contradiction(
                    issue=item.issue,
                    existing_lore=item.existing_lore,
                    source_filename=source.filename,
                    source_chunk_index=source.chunk_index,
                )
            )

        return ConsistencyResponse(
            has_contradictions=bool(contradictions),
            contradictions=contradictions,
            message=(
                f"Found {len(contradictions)} potential contradiction(s)."
                if contradictions
                else "No direct contradictions found in the relevant lore."
            ),
        )


@lru_cache
def get_consistency_service() -> ConsistencyService:
    return ConsistencyService(get_rag_engine())
