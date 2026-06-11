from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.config import Settings, get_settings
from app.constants import LOCAL_USER_ID
from app.models.schemas import (
    DeleteResponse,
    DocumentListResponse,
    DocumentUploadResponse,
)
from app.services.pdf_parser import (
    EmptyDocumentError,
    SUPPORTED_EXTENSIONS,
    UnsupportedFileTypeError,
    extract_documents,
    split_documents,
)
from app.services.vectorstore import VectorStoreService, get_vector_store


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    vector_store: VectorStoreService = Depends(get_vector_store),
) -> DocumentUploadResponse:
    filename = Path(file.filename or "document").name
    extension = Path(filename).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Upload a PDF, TXT, MD, or MARKDOWN file.")

    content = await file.read(settings.max_file_size_mb * 1024 * 1024 + 1)
    await file.close()
    if len(content) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {settings.max_file_size_mb} MB upload limit.",
        )
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    document_id = str(uuid4())
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    stored_path = upload_dir / f"{document_id}{extension}"
    stored_path.write_bytes(content)

    try:
        documents = extract_documents(stored_path, filename)
        chunks = split_documents(documents, settings)
        vector_store.add_document(filename, chunks, document_id=document_id, user_id=LOCAL_USER_ID)
    except (UnsupportedFileTypeError, EmptyDocumentError, ValueError) as exc:
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        stored_path.unlink(missing_ok=True)
        raise

    return DocumentUploadResponse(
        document_id=document_id,
        filename=filename,
        chunks_created=len(chunks),
        message="Document added to the story bible.",
    )


@router.get("", response_model=DocumentListResponse)
def list_documents(
    vector_store: VectorStoreService = Depends(get_vector_store),
) -> DocumentListResponse:
    documents = vector_store.list_documents(user_id=LOCAL_USER_ID)
    return DocumentListResponse(documents=documents, total=len(documents))


@router.delete("/{document_id}", response_model=DeleteResponse)
def delete_document(
    document_id: str,
    settings: Settings = Depends(get_settings),
    vector_store: VectorStoreService = Depends(get_vector_store),
) -> DeleteResponse:
    if not vector_store.delete_document(document_id, user_id=LOCAL_USER_ID):
        raise HTTPException(status_code=404, detail="Document not found.")

    for path in Path(settings.upload_dir).glob(f"{document_id}.*"):
        path.unlink(missing_ok=True)
    return DeleteResponse(document_id=document_id, message="Document deleted.")
