import { Client } from 'pg'

// Dev DB only — matches server/.env DATABASE_URL (server/CLAUDE.md TBD; see
// docs/specs/cv-jd-matching-wizard/plan.md Global Constraints: no Docker,
// local PostgreSQL, dev DB `matchcv`). No DELETE endpoint exists yet, so the
// E2E suite cleans up the rows it creates directly via `pg` to stay
// idempotent and safe to re-run.
const CONNECTION_STRING = 'postgresql://postgres:123456@localhost:5432/matchcv'

export async function cleanDocuments(): Promise<void> {
  const client = new Client({ connectionString: CONNECTION_STRING })
  await client.connect()
  try {
    await client.query('DELETE FROM "Document"')
  } finally {
    await client.end()
  }
}
