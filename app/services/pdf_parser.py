from pathlib import Path

import fitz
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import Settings


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".markdown"}


class UnsupportedFileTypeError(ValueError):
    pass


class EmptyDocumentError(ValueError):
    pass


def extract_documents(path: Path, original_filename: str) -> list[Document]:
    extension = path.suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise UnsupportedFileTypeError(
            f"Unsupported file type '{extension}'. Upload PDF, TXT, MD, or MARKDOWN files."
        )

    if extension == ".pdf":
        try:
            with fitz.open(path) as pdf:
                documents = []
                for index, page in enumerate(pdf):
                    text = page.get_text("text").strip()
                    if text:
                        documents.append(
                            Document(
                                page_content=text,
                                metadata={"filename": original_filename, "page_number": index + 1},
                            )
                        )
        except (fitz.FileDataError, RuntimeError) as exc:
            raise ValueError("The uploaded PDF is invalid or corrupted.") from exc
    else:
        text = path.read_text(encoding="utf-8", errors="replace").strip()
        documents = [
            Document(page_content=text, metadata={"filename": original_filename})
        ] if text else []

    if not documents:
        raise EmptyDocumentError("The uploaded document contains no extractable text.")
    return documents


def split_documents(documents: list[Document], settings: Settings) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_documents(documents)
