# LoreKeeper API

LoreKeeper is a grounded story-bible backend. It indexes PDF, TXT, and Markdown
documents locally with HuggingFace embeddings and ChromaDB, then uses Gemini for
grounded Q&A, lore-aware creative generation, and consistency checks.

## Run

1. Put a valid Gemini key in `.env`.
2. Start the API:

```bash
uvicorn main:app --reload
```

3. Open `http://localhost:8000/docs` for the interactive API.

The first indexed document may take longer while the local embedding model loads.

## Endpoints

- `POST /api/documents` - upload and index a document
- `GET /api/documents` - list the story bible
- `DELETE /api/documents/{document_id}` - remove a document and its chunks
- `POST /api/chat` - answer strictly from retrieved lore
- `POST /api/chat/creative` - create content constrained by retrieved lore
- `POST /api/consistency/check` - identify direct contradictions
- `GET /health` - service health

## Grounding Behavior

Q&A only answers from retrieved excerpts and returns those exact chunks as sources.
Creative generation may invent prose but is prompted not to contradict or present
new inventions as canon. Consistency checks report only direct factual conflicts.

## Foundry IQ (Azure AI Search agentic retrieval)

LoreKeeper can optionally use [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq)
(Azure AI Search's agentic retrieval layer) as its grounding source instead of
the local ChromaDB vector store. Foundry IQ treats retrieval as a reasoning
task - planning sub-queries, ranking results, and returning cited grounding
data - which plugs directly into LoreKeeper's existing "answer only from
retrieved sources, with citations" design.

To enable it:

1. Create an Azure AI Search resource (Basic tier or higher) and index your
   story-bible documents.
2. Create a knowledge source and a knowledge base for agentic retrieval (see
   [Create a Knowledge Base](https://learn.microsoft.com/azure/search/agentic-retrieval-how-to-create-knowledge-base)).
3. Set `AZURE_SEARCH_ENDPOINT`, `AZURE_SEARCH_API_KEY`,
   `AZURE_SEARCH_KNOWLEDGE_BASE`, and `AZURE_SEARCH_KNOWLEDGE_SOURCE` in `.env`.

When these are set, `RagEngine` automatically routes `chat`, `chat/creative`,
and `consistency/check` retrieval through Foundry IQ, falling back to ChromaDB
if Foundry IQ is unreachable. If they're left blank, LoreKeeper behaves exactly
as before, using only ChromaDB.
