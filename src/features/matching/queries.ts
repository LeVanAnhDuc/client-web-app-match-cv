import { useMutation, useQuery } from '@tanstack/react-query'
import { apiFetch } from '#/lib/api'
import type { CreateMatchInput, MatchResultDto } from './types'

export function matchResultQueryKey(id: string) {
  return ['match', id] as const
}

/** POST /match — run the hybrid (semantic + keyword) matching engine. */
export function useRunMatch() {
  return useMutation({
    mutationFn: (input: CreateMatchInput) =>
      apiFetch<MatchResultDto>('/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
  })
}

/** GET /match/:id — fetch a persisted match report (step 4 Result). */
export function useMatchResult(id: string | null) {
  return useQuery({
    queryKey: matchResultQueryKey(id ?? ''),
    queryFn: () => apiFetch<MatchResultDto>(`/match/${id}`),
    enabled: id !== null,
  })
}
