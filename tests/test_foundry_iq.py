import json
import unittest
from unittest.mock import MagicMock, patch

from app.config import Settings, get_settings
from app.services.foundry_iq import FoundryIQClient, FoundryIQError, get_foundry_iq_client
from app.services.rag_engine import RagEngine
from app.services.vectorstore import VectorStoreService


FAKE_RESPONSE = {
    "response": [
        {
            "role": "assistant",
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(
                        [
                            {
                                "ref_id": 0,
                                "title": "story_bible.md",
                                "content": "Zara Veyne has piercing blue eyes.",
                            }
                        ]
                    ),
                }
            ],
        }
    ],
    "references": [
        {
            "type": "AzureSearchDoc",
            "id": "0",
            "docKey": "doc-123:0",
            "sourceData": {
                "filename": "story_bible.md",
                "document_id": "doc-123",
                "content": "Zara Veyne has piercing blue eyes.",
            },
        }
    ],
}


def _unconfigured_client() -> FoundryIQClient:
    get_settings.cache_clear()
    client = FoundryIQClient()
    client.settings = Settings(
        azure_search_endpoint="",
        azure_search_api_key="",
        azure_search_knowledge_base="",
        azure_search_knowledge_source="",
    )
    return client


def _configured_client() -> FoundryIQClient:
    client = FoundryIQClient()
    client.settings = Settings(
        azure_search_endpoint="https://example.search.windows.net",
        azure_search_api_key="test-key",
        azure_search_knowledge_base="lorekeeper-kb",
        azure_search_knowledge_source="lorekeeper-ks",
    )
    return client


class FoundryIQClientTests(unittest.TestCase):
    def test_not_configured_by_default(self):
        client = _unconfigured_client()
        self.assertFalse(client.is_configured)
        with self.assertRaises(FoundryIQError):
            client.retrieve("hello")

    @patch("app.services.foundry_iq.requests.post")
    def test_retrieve_maps_response_to_source_chunks(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = FAKE_RESPONSE
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        client = _configured_client()
        self.assertTrue(client.is_configured)

        sources = client.retrieve("What color are Zara's eyes?")

        self.assertEqual(len(sources), 1)
        source = sources[0]
        self.assertEqual(source.filename, "story_bible.md")
        self.assertEqual(source.document_id, "doc-123")
        self.assertIn("blue eyes", source.chunk_text)

        # Verify the request hit the expected agentic-retrieval endpoint.
        called_url = mock_post.call_args.args[0]
        self.assertIn("/knowledgebases/lorekeeper-kb/retrieve", called_url)


class RagEngineFallbackTests(unittest.TestCase):
    def test_falls_back_to_vector_store_when_not_configured(self):
        fake_vector_store = MagicMock(spec=VectorStoreService)
        fake_vector_store.search.return_value = []

        engine = RagEngine(fake_vector_store, foundry_iq=_unconfigured_client())
        engine._retrieve("query", user_id="user-1")

        fake_vector_store.search.assert_called_once_with("query", None, None, user_id="user-1")

    @patch("app.services.foundry_iq.requests.post")
    def test_uses_foundry_iq_when_configured(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = FAKE_RESPONSE
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        fake_vector_store = MagicMock(spec=VectorStoreService)
        engine = RagEngine(fake_vector_store, foundry_iq=_configured_client())

        sources = engine._retrieve("What color are Zara's eyes?")

        self.assertEqual(len(sources), 1)
        fake_vector_store.search.assert_not_called()


if __name__ == "__main__":
    unittest.main()
