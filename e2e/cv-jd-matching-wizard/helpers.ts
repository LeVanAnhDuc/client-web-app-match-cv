import { expect, type Page } from '@playwright/test'

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
