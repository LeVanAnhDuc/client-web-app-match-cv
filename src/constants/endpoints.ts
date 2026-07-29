import type { DocumentKind } from '#/types/Documents'

/** API endpoint paths (relative to `VITE_API_BASE_URL`). Never hard-code these in callers. */
export const ENDPOINTS = {
  documents: '/documents',
  documentById: (id: string) => `/documents/${id}`,
  savedDocuments: (kind: DocumentKind) => `/documents?kind=${kind}&saved=true`,
  match: '/match',
  matchById: (id: string) => `/match/${id}`,
} as const
