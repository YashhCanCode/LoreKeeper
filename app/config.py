from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chroma_persist_dir: str = "./chroma_db"
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 5
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "lorekeeper"
    google_client_id: str = ""
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    # Foundry IQ (Azure AI Search agentic retrieval) - optional
    azure_search_endpoint: str = ""
    azure_search_api_key: str = ""
    azure_search_knowledge_base: str = ""
    azure_search_knowledge_source: str = ""
    azure_search_api_version: str = "2025-11-01-preview"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
