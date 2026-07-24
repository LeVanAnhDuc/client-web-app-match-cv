import { expect, test } from '@playwright/test'
import { fillTitle, gotoWizard, nextButton, pasteText, switchToPasteTab } from './helpers'

// design.md §7 row 4 (Validation) + row 6 (BVA: paste length 0 vs 1).
test.describe('validation', () => {
  test('[BVA] empty paste text keeps Next disabled', async ({ page }) => {
    await gotoWizard(page)
    await switchToPasteTab(page)

    await expect(nextButton(page)).toBeDisabled()

    // Whitespace-only input must not count as content either.
    await pasteText(page, '   ')
    await expect(nextButton(page)).toBeDisabled()
  })

  test('[BVA] a single non-whitespace character enables Next', async ({ page }) => {
    await gotoWizard(page)
    await switchToPasteTab(page)

    await pasteText(page, 'x')
    await expect(nextButton(page)).toBeEnabled()
  })

  test('save toggle ON without a title blocks submission with an inline error', async ({
    page,
  }) => {
    await gotoWizard(page)
    await switchToPasteTab(page)
    await pasteText(page, 'A job description with no saved title provided.')

    // Save toggle defaults ON; leave the title blank and try to submit.
    await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    await expect(nextButton(page)).toBeEnabled()
    await nextButton(page).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toContainText(/title/i)

    // Still on step 1 — no navigation happened.
    await expect(page.getByRole('heading', { name: 'Input Job Description' })).toBeVisible()

    // Filling the title clears the block and allows submission to proceed.
    await fillTitle(page, 'Now has a title')
    await nextButton(page).click()
    await expect(page.getByRole('heading', { name: 'Candidate CV / Resume' })).toBeVisible()
  })
})
