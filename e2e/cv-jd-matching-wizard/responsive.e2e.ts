import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { cleanDocuments } from "../db-cleanup";
import { gotoWizard, nextButton, pasteText, stubMatchApi } from "./helpers";

// docs/specs/wizard-responsive/design.md §7 rows 6 / 11 / 13 / 14 — layout
// invariants per viewport class. This spec runs in all three projects
// (desktop / tablet / mobile); assertions derive from the actual viewport size
// so one file covers every class without duplication.

const DESKTOP_NAV_WIDTH = 288; // w-72 rail, only from lg up

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    // +1 tolerance: sub-pixel layout rounding must not read as an overflow.
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
}

const JD_TEXT = "JD text for the responsive step-3 layout check.";
const CV_TEXT = "CV text for the responsive step-3 layout check.";

/**
 * Walk step 1 -> 2 -> 3, waiting on each arrival the way
 * `review-and-result.e2e.ts` does. The intermediate waits are not decoration:
 * without them a Next click can land in the SSR->hydration window under
 * full-suite load, and the geometry assertions below then measure a step that
 * never advanced.
 */
async function advanceToReview(page: Page): Promise<void> {
  await gotoWizard(page);

  await pasteText(page, JD_TEXT);
  await nextButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Candidate CV / Resume" })
  ).toBeVisible();

  await pasteText(page, CV_TEXT);
  await nextButton(page).click();
  await expect(
    page.getByRole("heading", { name: "Review Parsed Data" })
  ).toBeVisible();

  // The panes are prefilled by an async GET /documents/:id — measure only once
  // the text has actually landed, or the stacked-height check races the fetch.
  await expect(page.getByLabel("Job Description")).toHaveValue(JD_TEXT);
  await expect(page.getByLabel("CV / Resume")).toHaveValue(CV_TEXT);
}

function navWidth(page: Page) {
  return page
    .locator("aside")
    .first()
    .boundingBox()
    .then((box) => Math.round(box?.width ?? 0));
}

test.beforeEach(async () => {
  await cleanDocuments();
});

test.describe.fixme("responsive layout", () => {
  test("step 1 has no horizontal scroll and keeps the primary CTA in view", async ({
    page
  }) => {
    await gotoWizard(page);

    expect(await hasHorizontalScroll(page)).toBe(false);
    await expect(nextButton(page)).toBeInViewport();
  });

  test("nav fills the width below lg and is a 288px rail from lg up", async ({
    page
  }) => {
    await gotoWizard(page);

    const viewport = page.viewportSize()?.width ?? 0;
    const width = await navWidth(page);

    if (viewport >= 1024) {
      expect(width).toBe(DESKTOP_NAV_WIDTH);
    } else {
      expect(width).toBe(viewport);
    }
  });

  test("the stepper exists once and its labels stay exposed to assistive tech", async ({
    page
  }) => {
    await gotoWizard(page);

    // sr-only below md keeps labels in the a11y tree (design.md §6.3), and a
    // single instance is what makes these strict-mode locators work at all.
    await expect(page.getByTestId("stepper-step-1")).toHaveCount(1);
    await expect(
      page.getByText("Job Description", { exact: true })
    ).toHaveCount(1);
    await expect(page.getByText(/step 1 of 4/i)).toHaveCount(1);
  });

  test("the nav axis flips at the 1024px boundary and 320px still fits", async ({
    page
  }) => {
    await gotoWizard(page);

    await page.setViewportSize({ width: 1023, height: 800 });
    expect(await navWidth(page)).toBe(1023);

    await page.setViewportSize({ width: 1024, height: 800 });
    expect(await navWidth(page)).toBe(DESKTOP_NAV_WIDTH);

    await page.setViewportSize({ width: 767, height: 800 });
    expect(await navWidth(page)).toBe(767);

    await page.setViewportSize({ width: 320, height: 800 });
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("advancing a step brings the new step header into view", async ({
    page
  }) => {
    await gotoWizard(page);
    await pasteText(page, "JD text for the responsive scroll-reset check.");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await nextButton(page).click();

    const heading = page.getByRole("heading", {
      name: "Candidate CV / Resume"
    });
    await expect(heading).toBeVisible();
    await expect(heading).toBeInViewport();
  });

  test("step 3 stacks both panes below lg and keeps Run match reachable", async ({
    page
  }) => {
    await stubMatchApi(page);
    await advanceToReview(page);

    const jd = page.getByLabel("Job Description");
    const cv = page.getByLabel("CV / Resume");

    const jdBox = (await jd.boundingBox())!;
    const cvBox = (await cv.boundingBox())!;
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      expect(Math.abs(jdBox.y - cvBox.y)).toBeLessThan(4); // side by side
    } else {
      expect(cvBox.y).toBeGreaterThan(jdBox.y + jdBox.height - 4); // stacked
    }

    expect(await hasHorizontalScroll(page)).toBe(false);
    await expect(
      page.getByRole("button", { name: "Run match" })
    ).toBeInViewport();
  });

  test("step 4 result fits the viewport width with the footer reachable", async ({
    page
  }) => {
    await stubMatchApi(page);
    await advanceToReview(page);

    await page.getByRole("button", { name: "Run match" }).click();

    await expect(page.getByText("Overall match")).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
    await expect(
      page.getByRole("button", { name: "Start over" })
    ).toBeInViewport();
  });
});
