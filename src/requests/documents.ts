import { apiFetch } from "#/libs/api";
import { ENDPOINTS } from "#/constants";
import type {
  CreateDocumentInput,
  DocumentDto,
  DocumentKind,
  DocumentSummaryDto
} from "#/types/Documents";

export function savedDocumentsQueryKey(kind: DocumentKind) {
  return ["documents", kind, "saved"] as const;
}

export function documentQueryKey(id: string) {
  return ["documents", id] as const;
}

/** GET /documents/:id — fetch rawText for the wizard's step 3 Review prefill. */
export function fetchDocument(id: string): Promise<DocumentDto> {
  return apiFetch<DocumentDto>(ENDPOINTS.documentById(id));
}

/** GET /documents?kind=..&saved=true — reuse list for the wizard's radio picker. */
export function fetchSavedDocuments(
  kind: DocumentKind
): Promise<Array<DocumentSummaryDto>> {
  return apiFetch<Array<DocumentSummaryDto>>(ENDPOINTS.savedDocuments(kind));
}

/** POST /documents — upload/paste a new document (JD or CV). */
export function createDocument(
  input: CreateDocumentInput
): Promise<DocumentDto> {
  if (input.mode === "file") {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("kind", input.kind);
    formData.append("save", String(input.save));
    if (input.title) formData.append("title", input.title);

    return apiFetch<DocumentDto>(ENDPOINTS.documents, {
      method: "POST",
      body: formData
    });
  }

  return apiFetch<DocumentDto>(ENDPOINTS.documents, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: input.kind,
      sourceText: input.sourceText,
      save: input.save,
      title: input.title
    })
  });
}
