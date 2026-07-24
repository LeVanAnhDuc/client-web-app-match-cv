import { expect, type Page } from '@playwright/test'
import type { MatchResultDto } from '../../src/features/matching/types'

/** Navigate to the wizard, starting fresh (in-memory Zustand store resets on full load). */
export async function gotoWizard(page: Page): Promise<void> {
  await page.goto('/wizard')
  await expect(page.getByRole('heading', { name: 'Match CV' })).toBeVisible()
  // Wait for client hydration before interacting: the dev-only `window.__i18n`
  // hook (see src/i18n/index.ts) is attached only after the client bundle runs,
  // so its presence is a reliable "React is hydrated & interactive" signal.
  // Without this, fast clicks land on SSR markup before handlers are wired.
  await page.waitForFunction(() => '__i18n' in window, undefined, { timeout: 15000 })
}

export async function switchToPasteTab(page: Page): Promise<void> {
  // antd Segmented: click the visible item label, NOT the hidden native radio
  // (clicking the radio input toggles its checked state but does not fire
  // Segmented's onChange, so `mode` never flips). See UploadPasteTabs.tsx.
  // Retry to tolerate the SSR->hydration window: under full-suite load the
  // segment can be clicked before TanStack Start finishes hydrating, so the
  // React onChange isn't wired yet and the first click is a no-op. Re-click
  // until the paste textarea actually renders.
  await expect(async () => {
    await page.locator('.ant-segmented-item').filter({ hasText: 'Paste text' }).click()
    await expect(page.getByPlaceholder('Paste the text content here')).toBeVisible({
      timeout: 1000,
    })
  }).toPass({ timeout: 15000 })
}

export async function pasteText(page: Page, text: string): Promise<void> {
  await switchToPasteTab(page)
  await page.getByPlaceholder('Paste the text content here').fill(text)
}

export async function fillTitle(page: Page, title: string): Promise<void> {
  await page.getByPlaceholder('Enter a title for this document').fill(title)
}

/** SaveToggle defaults to ON; call this to turn it off when a test doesn't need persistence. */
export async function turnSaveOff(page: Page): Promise<void> {
  const toggle = page.getByRole('switch')
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
}

export function nextButton(page: Page) {
  return page.getByRole('button', { name: 'Next' })
}

export function backButton(page: Page) {
  return page.getByRole('button', { name: 'Back' })
}

export function stepperStep(page: Page, step: 1 | 2 | 3 | 4) {
  return page.getByTestId(`stepper-step-${step}`)
}

/** Unique title per test run so reuse-list assertions never collide across re-runs. */
export function uniqueTitle(label: string): string {
  return `E2E ${label} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`
}

/**
 * Fixed MatchResultDto used to stub the matching engine in E2E (see
 * `stubMatchApi`). No GEMINI_API_KEY is configured for this environment, so
 * step 3/4 tests MUST intercept the network rather than hit the real engine.
 */
export const STUB_MATCH_RESULT: MatchResultDto = {
  id: 'e2e-stub-match-id',
  cvDocumentId: 'e2e-stub-cv-id',
  jdDocumentId: 'e2e-stub-jd-id',
  overallScore: 82,
  semanticScore: 90,
  keywordScore: 74,
  report: {
    strengths: ['Strong backend engineering background', 'Solid Node.js fundamentals'],
    gaps: ['No direct GraphQL experience mentioned'],
    suggestions: ['Highlight any API design work with concrete, quantified impact.'],
  },
  createdAt: '2026-07-24T00:00:00.000Z',
}

/**
 * Route-stub `POST /api/v1/match` and `GET /api/v1/match/:id` so step 3 "Run
 * match" / step 4 "Result" are deterministic and never call the real
 * matching engine (which calls Google Gemini — no GEMINI_API_KEY configured
 * here). Register BEFORE navigating so the intercept is active in time.
 */
export async function stubMatchApi(
  page: Page,
  result: MatchResultDto = STUB_MATCH_RESULT,
): Promise<void> {
  await page.route('**/api/v1/match', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback()
      return
    }
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(result) })
  })

  await page.route('**/api/v1/match/*', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) })
  })
}
