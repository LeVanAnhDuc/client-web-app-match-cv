import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchMatchResult,
  matchResultQueryKey,
  runMatch
} from "#/requests/match";

/** POST /match — run the hybrid (semantic + keyword) matching engine. */
export function useRunMatch() {
  return useMutation({
    mutationFn: runMatch
  });
}

/** GET /match/:id — fetch a persisted match report (step 4 Result). */
export function useMatchResult(id: string | null) {
  return useQuery({
    queryKey: matchResultQueryKey(id ?? ""),
    queryFn: () => fetchMatchResult(id as string),
    enabled: id !== null
  });
}
