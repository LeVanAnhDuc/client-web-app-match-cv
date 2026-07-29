// Types mirror the API Contract in docs/specs/cv-jd-matching-wizard/plan.md
// ("API Contract (Plan 2)"). Keep in sync with server DTOs.

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
  createdAt: string;
}

export interface CreateMatchInput {
  cvDocumentId: string;
  jdDocumentId: string;
}
