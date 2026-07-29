import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocument,
  documentQueryKey,
  fetchDocument,
  fetchSavedDocuments,
  savedDocumentsQueryKey
} from "#/requests/documents";
import type { DocumentKind } from "#/types/Documents";

/** GET /documents/:id — fetch rawText for the wizard's step 3 Review prefill. */
export function useDocument(id: string | null) {
  return useQuery({
    queryKey: documentQueryKey(id ?? ""),
    queryFn: () => fetchDocument(id as string),
    enabled: id !== null
  });
}

/** GET /documents?kind=..&saved=true — reuse list for the wizard's radio picker. */
export function useSavedDocuments(kind: DocumentKind) {
  return useQuery({
    queryKey: savedDocumentsQueryKey(kind),
    queryFn: () => fetchSavedDocuments(kind)
  });
}

/** POST /documents — upload/paste a new document (JD or CV). */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      if (data.isSaved) {
        void queryClient.invalidateQueries({
          queryKey: savedDocumentsQueryKey(data.kind)
        });
      }
    }
  });
}
