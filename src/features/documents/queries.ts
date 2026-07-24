import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '#/lib/api'
import type {
  CreateDocumentInput,
  DocumentDto,
  DocumentKind,
  DocumentSummaryDto,
} from './types'

export function savedDocumentsQueryKey(kind: DocumentKind) {
  return ['documents', kind, 'saved'] as const
}

export function documentQueryKey(id: string) {
  return ['documents', id] as const
}

/** GET /documents/:id — fetch rawText for the wizard's step 3 Review prefill. */
export function useDocument(id: string | null) {
  return useQuery({
    queryKey: documentQueryKey(id ?? ''),
    queryFn: () => apiFetch<DocumentDto>(`/documents/${id}`),
    enabled: id !== null,
  })
}

/** GET /documents?kind=..&saved=true — reuse list for the wizard's radio picker. */
export function useSavedDocuments(kind: DocumentKind) {
  return useQuery({
    queryKey: savedDocumentsQueryKey(kind),
    queryFn: () =>
      apiFetch<Array<DocumentSummaryDto>>(`/documents?kind=${kind}&saved=true`),
  })
}

/** POST /documents — upload/paste a new document (JD or CV). */
export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      if (data.isSaved) {
        void queryClient.invalidateQueries({ queryKey: savedDocumentsQueryKey(data.kind) })
      }
    },
  })
}

async function createDocument(input: CreateDocumentInput): Promise<DocumentDto> {
  if (input.mode === 'file') {
    const formData = new FormData()
    formData.append('file', input.file)
    formData.append('kind', input.kind)
    formData.append('save', String(input.save))
    if (input.title) formData.append('title', input.title)

    return apiFetch<DocumentDto>('/documents', {
      method: 'POST',
      body: formData,
    })
  }

  return apiFetch<DocumentDto>('/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: input.kind,
      sourceText: input.sourceText,
      save: input.save,
      title: input.title,
    }),
  })
}
