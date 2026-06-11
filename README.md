# 📖 LoreKeeper

> *Every world needs a keeper.*

You've got a universe in your head — centuries of history, a dozen factions, characters whose eye color you decided three notebooks ago and absolutely cannot remember now. LoreKeeper is the AI archivist for that universe. Feed it your notes, drafts, and timelines, and it remembers everything so you don't have to.

Ask it questions. Ask it to write. Ask it "wait, did I already kill this character off in chapter 3?" — and it'll actually check.

---

## ✨ What it does

- **Reads your world.** Upload PDFs, text files, and Markdown notes — character sheets, timelines, scrapbooks, whatever you've got. LoreKeeper parses it all and builds a searchable memory of your story.
- **Answers from your story, not its imagination.** Ask about a character, an event, a rule of magic — LoreKeeper digs through *your* material and answers using only what you've actually written, with the source passages cited.
- **Helps you write more.** Need a scene, a description, a line of dialogue? LoreKeeper generates new text that stays true to your established world instead of making things up that clash with it.
- **Catches your contradictions.** Said a character was an only child in chapter 2 and gave them a sister in chapter 9? LoreKeeper flags direct conflicts before your readers do.
- **Remembers your conversations.** Chat sessions are saved, so you can pick up a thread of research or brainstorming right where you left off.

---

## 🧰 How it's built

**Backend** — FastAPI + LangChain, with ChromaDB as a local vector store and HuggingFace sentence-transformer embeddings for indexing. Gemini 2.5 Flash powers the Q&A, creative generation, and consistency checks. MongoDB stores chat history.

**Frontend** — React 19 + TypeScript + Vite + Tailwind, a single-page workspace for uploading documents, chatting with your story, and managing sessions.

**Optional: Foundry IQ** — LoreKeeper can swap its retrieval layer for [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq) (Azure AI Search's agentic retrieval), which plans sub-queries and ranks results before handing back cited grounding data. If it's not configured, LoreKeeper just uses its local ChromaDB index — no setup required.

---

## 🚀 Getting started

### Backend

1. Drop a valid Gemini API key into `.env`.
2. Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Open `http://localhost:8000/docs` for the interactive API.

> The first document you index will take a little longer while the local embedding model wakes up.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the app in your browser and start uploading.

---

## 🔌 API at a glance

| Endpoint | What it does |
|---|---|
| `POST /api/documents` | Upload and index a document |
| `GET /api/documents` | List everything in your story bible |
| `DELETE /api/documents/{document_id}` | Remove a document and its chunks |
| `POST /api/chat` | Ask questions, answered strictly from your material |
| `POST /api/chat/creative` | Generate new content grounded in your world |
| `POST /api/consistency/check` | Find direct contradictions in your text |
| `GET /api/sessions` | List chat sessions |
| `GET /health` | Service health check |

---

## 🧭 The ground rules

LoreKeeper plays by a simple philosophy: **your world is the source of truth.**

- Q&A only answers from retrieved passages and shows you exactly where the answer came from.
- Creative generation can imagine new scenes and lines, but it's instructed never to contradict — or pass off new ideas as — established facts.
- Consistency checks report only genuine, direct conflicts — no nitpicking.

---

## ⚙️ Optional: Foundry IQ setup

Want LoreKeeper's retrieval to run on Azure AI Search's agentic retrieval instead of the local index? Here's how:

1. Create an Azure AI Search resource (Basic tier or higher) and index your story documents.
2. Create a knowledge source and knowledge base for agentic retrieval ([guide here](https://learn.microsoft.com/azure/search/agentic-retrieval-how-to-create-knowledge-base)).
3. Set `AZURE_SEARCH_ENDPOINT`, `AZURE_SEARCH_API_KEY`, `AZURE_SEARCH_KNOWLEDGE_BASE`, and `AZURE_SEARCH_KNOWLEDGE_SOURCE` in `.env`.

When configured, LoreKeeper automatically routes retrieval through Foundry IQ for chat, creative generation, and consistency checks — falling back to ChromaDB if Foundry IQ is ever unreachable. Leave these blank and nothing changes; LoreKeeper runs entirely on its local index.

---

*Built for the storytellers, world-builders, and people with way too many tabs open in their notes app.*
