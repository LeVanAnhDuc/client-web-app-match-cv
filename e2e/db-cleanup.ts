import { Client } from "pg";

// Dev DB only. Connection is sourced from E2E_DATABASE_URL (loaded from
// client/.env by playwright.config.ts via dotenv) so no credential is
// committed. Falls back to the local placeholder from client/.env.example.
// No DELETE endpoint exists yet, so the E2E suite cleans the rows it creates
// directly via `pg` to stay idempotent and safe to re-run.
const CONNECTION_STRING =
  process.env.E2E_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/matchcv";

export async function cleanDocuments(): Promise<void> {
  const client = new Client({ connectionString: CONNECTION_STRING });
  await client.connect();
  try {
    // MatchResult has FK → Document (onDelete Restrict), so clear it first or
    // the Document delete fails once any match exists.
    await client.query('DELETE FROM "MatchResult"');
    await client.query('DELETE FROM "Document"');
  } finally {
    await client.end();
  }
}
