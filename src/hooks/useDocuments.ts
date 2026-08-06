import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocument,
  deleteDocument,
  documentQueryKey,
  fetchDocument,
  fetchSavedDocuments,
  renameDocument,
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

/** PATCH /documents/:id — rename a saved document (library actions). */
export function useRenameDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      renameDocument(id, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });
}

/** DELETE /documents/:id — delete a saved document (409 when used by a match). */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });
}
