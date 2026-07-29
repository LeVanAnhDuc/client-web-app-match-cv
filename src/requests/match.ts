import { apiFetch } from '#/libs/api'
import { ENDPOINTS } from '#/constants'
import type { CreateMatchInput, MatchResultDto } from '#/types/Matching'

export function matchResultQueryKey(id: string) {
  return ['match', id] as const
}

/** POST /match — run the hybrid (semantic + keyword) matching engine. */
export function runMatch(input: CreateMatchInput): Promise<MatchResultDto> {
  return apiFetch<MatchResultDto>(ENDPOINTS.match, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

/** GET /match/:id — fetch a persisted match report (step 4 Result). */
export function fetchMatchResult(id: string): Promise<MatchResultDto> {
  return apiFetch<MatchResultDto>(ENDPOINTS.matchById(id))
}
