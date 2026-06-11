from pydantic import BaseModel, Field
from typing import List, Optional


# --- Upload Models ---

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    chunks_created: int
    message: str


class DocumentInfo(BaseModel):
    document_id: str
    filename: str
    uploaded_at: str
    chunk_count: int


class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int


# --- Chat Models ---

class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    document_ids: Optional[List[str]] = None  # None = search across all docs
    session_id: Optional[str] = None  # None = stateless, no history saved


class SourceChunk(BaseModel):
    document_id: str
    filename: str
    chunk_text: str
    chunk_index: int
    page_number: Optional[int] = None
    relevance_score: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    query: str
    session_id: Optional[str] = None


class CreativeRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None


class CreativeResponse(BaseModel):
    content: str
    sources: List[SourceChunk]
    prompt: str
    session_id: Optional[str] = None


# --- Consistency Check Models ---

class ConsistencyRequest(BaseModel):
    text: str = Field(min_length=1, max_length=12000)
    document_ids: Optional[List[str]] = None


class Contradiction(BaseModel):
    issue: str
    existing_lore: str
    source_filename: str
    source_chunk_index: Optional[int] = None


class ConsistencyResponse(BaseModel):
    has_contradictions: bool
    contradictions: List[Contradiction]
    message: str


# --- Delete Models ---

class DeleteResponse(BaseModel):
    document_id: str
    message: str


# --- Chat Session Models ---

class ChatMessageOut(BaseModel):
    role: str
    content: str
    sources: List[SourceChunk] = Field(default_factory=list)
    created_at: str


class ChatSessionInfo(BaseModel):
    session_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int = 0


class ChatSessionListResponse(BaseModel):
    sessions: List[ChatSessionInfo]
    total: int


class ChatSessionDetail(BaseModel):
    session_id: str
    title: str
    messages: List[ChatMessageOut]


class CreateChatSessionRequest(BaseModel):
    title: Optional[str] = None


class MessageResponse(BaseModel):
    message: str


# --- Auth Models ---

class GoogleAuthRequest(BaseModel):
    credential: str = Field(min_length=1, description="Google ID token (JWT) from Sign in with Google")


class UserInfo(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
