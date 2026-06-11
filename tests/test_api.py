import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.models.schemas import ChatResponse, DocumentInfo
from app.services.rag_engine import NOT_FOUND_ANSWER, get_rag_engine
from app.services.vectorstore import get_vector_store
from main import app


class FakeVectorStore:
    def __init__(self) -> None:
        self.documents: dict[str, DocumentInfo] = {}

    def add_document(self, filename, chunks, document_id=None, user_id=None):
        self.documents[document_id] = DocumentInfo(
            document_id=document_id,
            filename=filename,
            uploaded_at="2026-06-09T00:00:00+00:00",
            chunk_count=len(chunks),
        )
        return document_id

    def list_documents(self, user_id=None):
        return list(self.documents.values())

    def delete_document(self, document_id, user_id=None):
        return self.documents.pop(document_id, None) is not None


class FakeRagEngine:
    def answer(self, query, document_ids=None, history=None, user_id=None):
        return ChatResponse(answer=NOT_FOUND_ANSWER, sources=[], query=query)


class ApiTests(unittest.TestCase):
    def tearDown(self):
        app.dependency_overrides.clear()

    def test_health(self):
        with TestClient(app) as client:
            response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_document_lifecycle_and_chat(self):
        with tempfile.TemporaryDirectory() as directory:
            tmp_path = Path(directory)
            fake_store = FakeVectorStore()
            settings = Settings(
                gemini_api_key="",
                upload_dir=str(tmp_path / "uploads"),
                chroma_persist_dir=str(tmp_path / "chroma"),
            )
            app.dependency_overrides[get_settings] = lambda: settings
            app.dependency_overrides[get_vector_store] = lambda: fake_store
            app.dependency_overrides[get_rag_engine] = lambda: FakeRagEngine()

            with TestClient(app) as client:
                upload = client.post(
                    "/api/documents",
                    files={"file": ("zara.md", b"# Zara\nZara has blue eyes.", "text/markdown")},
                )
                self.assertEqual(upload.status_code, 201)
                document_id = upload.json()["document_id"]
                self.assertEqual(upload.json()["chunks_created"], 1)

                listed = client.get("/api/documents")
                self.assertEqual(listed.status_code, 200)
                self.assertEqual(listed.json()["total"], 1)

                chat = client.post("/api/chat", json={"query": "What color are Zara's eyes?"})
                self.assertEqual(chat.status_code, 200)
                self.assertEqual(chat.json()["answer"], NOT_FOUND_ANSWER)

                deleted = client.delete(f"/api/documents/{document_id}")
                self.assertEqual(deleted.status_code, 200)
                self.assertEqual(client.get("/api/documents").json()["total"], 0)

    def test_rejects_unsupported_upload(self):
        with tempfile.TemporaryDirectory() as directory:
            settings = Settings(upload_dir=str(Path(directory) / "uploads"))
            app.dependency_overrides[get_settings] = lambda: settings
            app.dependency_overrides[get_vector_store] = lambda: FakeVectorStore()
            with TestClient(app) as client:
                response = client.post(
                    "/api/documents",
                    files={"file": ("notes.docx", b"not supported", "application/octet-stream")},
                )
            self.assertEqual(response.status_code, 415)


if __name__ == "__main__":
    unittest.main()
