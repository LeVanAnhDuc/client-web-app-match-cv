// Types mirror the API Contract in docs/specs/cv-jd-matching-wizard/plan.md
// ("API Contract (Plan 2)"). Keep in sync with server DTOs.

import type { AiProvider } from "#/types/AiCredentials";

export interface MatchReport {
  strengths: Array<string>;
  gaps: Array<string>;
  suggestions: Array<string>;
}

export interface MatchResultDto {
  id: string;
  cvDocumentId: string;
  jdDocumentId: string;
  overallScore: number;
  semanticScore: number;
  keywordScore: number;
  report: MatchReport;
  /** null = the match ran on the system key. */
  credentialId: string | null;
  provider: AiProvider;
  chatModel: string;
  embedModel: string;
  createdAt: string;
}

export interface CreateMatchInput {
  cvDocumentId: string;
  jdDocumentId: string;
  /** Omit to run on the system key. */
  credentialId?: string;
}

export interface MatchSummaryDto {
  id: string;
  cvTitle: string;
  jdTitle: string;
  overallScore: number;
  createdAt: string;
}
