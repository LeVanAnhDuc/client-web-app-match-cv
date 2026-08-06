import { expect, test, type Page } from "@playwright/test";
import { cleanDocuments } from "../db-cleanup";
import {
  backButton,
  gotoWizard,
  nextButton,
  pasteText,
  stepperStep,
  STUB_MATCH_RESULT,
  stubMatchApi,
  switchToPasteTab,
  turnSaveOff
} from "./helpers";

// design.md §7 (Plan 2 extension) — step 3 (Review) + step 4 (Result).
// `POST /match` and `GET /match/:id` are route-stubbed throughout this file:
// the matching engine calls OpenRouter and no OPENROUTER_API_KEY is configured
// here (and there is no runtime mock by design), so a real call would either
// fail (503) or cost real API credits. Step 1-2 document creation still hits
// the REAL backend (no OpenRouter dependency there), giving StepReview real
// jdDocId/cvDocId to fetch via GET /documents/:id.
//
// LIVE (real-OpenRouter) smoke of this same flow is a deferred gate-B item,
// pending OPENROUTER_API_KEY — see e2e.md "Deferred / notes".
test.beforeEach(async () => {
  await cleanDocuments();
});

const JD_TEXT =
  "We are hiring a senior backend engineer with NestJS experience.";
const CV_TEXT =
  "Senior backend engineer, 6 years experience with Node.js and NestJS.";

/** Drive the wizard from a fresh load through step 1 (JD) + step 2 (CV) paste-text, landing on step 3. */
async function advanceToReview(page: Page): Promise<void> {
  await gotoWizard(page);

  await switchToPasteTab(page);
  await pasteText(page, JD_TEXT);
  await turnSaveOff(page);
  await nextButton(page).click();

  await expect(
    page.getByRole("heading", { name: "Candidate CV / Resume" })
  ).toBeVisible();
  await switchToPasteTab(page);
  await pasteText(page, CV_TEXT);
  await turnSaveOff(page);
  await nextButton(page).click();

  await expect(
    page.getByRole("heading", { name: "Review Parsed Data" })
  ).toBeVisible();
  // Wait for the async GET /documents/:id prefill to actually land in the
  // textareas before returning — clicking "Run match" while a pane is still
  // '' would make StepReview treat it as user-edited and POST a fresh (empty)
  // document instead of reusing jdDocId/cvDocId, which is not what these
  // tests exercise.
  await expect(
    page.getByRole("textbox", { name: "Job Description" })
  ).toHaveValue(JD_TEXT);
  await expect(page.getByRole("textbox", { name: "CV / Resume" })).toHaveValue(
    CV_TEXT
  );
}

test.describe.fixme("step 3 — Review", () => {
  test("renders both review panes prefilled with the entered text; stepper marks step 3 active; Back returns to step 2", async ({
    page
  }) => {
    await advanceToReview(page);

    await expect(stepperStep(page, 3)).toHaveAttribute("data-status", "active");
    await expect(stepperStep(page, 1)).toHaveAttribute("data-status", "done");
    await expect(stepperStep(page, 2)).toHaveAttribute("data-status", "done");

    const jdPane = page.getByRole("textbox", { name: "Job Description" });
    const cvPane = page.getByRole("textbox", { name: "CV / Resume" });
    await expect(jdPane).toHaveValue(JD_TEXT);
    await expect(cvPane).toHaveValue(CV_TEXT);

    await backButton(page).click();
    await expect(
      page.getByRole("heading", { name: "Candidate CV / Resume" })
    ).toBeVisible();
    await expect(stepperStep(page, 2)).toHaveAttribute("data-status", "active");
  });
});

test.describe.fixme("step 3 -> 4 — Run match (route-stubbed)", () => {
  test("Run match advances to step 4 and renders the stubbed result report", async ({
    page
  }) => {
    await stubMatchApi(page);
    await advanceToReview(page);

    await page.getByRole("button", { name: "Run match" }).click();

    // Step 4 (Result).
    await expect(
      page.getByRole("heading", { name: "Review Parsed Data" })
    ).toBeHidden();
    await expect(stepperStep(page, 4)).toHaveAttribute("data-status", "active");
    await expect(stepperStep(page, 3)).toHaveAttribute("data-status", "done");

    // Overall % gauge + sub-scores (design.md / StepResult.tsx).
    await expect(
      page.getByText(`${STUB_MATCH_RESULT.overallScore}%`)
    ).toBeVisible();
    await expect(page.getByText("Overall match")).toBeVisible();
    await expect(page.getByText("Semantic match")).toBeVisible();
    await expect(
      page.getByText(`${STUB_MATCH_RESULT.semanticScore}%`)
    ).toBeVisible();
    await expect(page.getByText("Keyword / Skills match")).toBeVisible();
    await expect(
      page.getByText(`${STUB_MATCH_RESULT.keywordScore}%`)
    ).toBeVisible();

    // Strengths / gaps / suggestions lists from the stubbed report.
    await expect(page.getByText("Matched strengths")).toBeVisible();
    for (const strength of STUB_MATCH_RESULT.report.strengths) {
      await expect(page.getByText(strength)).toBeVisible();
    }
    await expect(page.getByText("Gaps / Missing")).toBeVisible();
    for (const gap of STUB_MATCH_RESULT.report.gaps) {
      await expect(page.getByText(gap)).toBeVisible();
    }
    await expect(page.getByText("How to improve your CV")).toBeVisible();
    for (const suggestion of STUB_MATCH_RESULT.report.suggestions) {
      await expect(page.getByText(suggestion)).toBeVisible();
    }
  });

  test("i18n: step-4 result labels render translated VI copy via the dev __i18n hook", async ({
    page
  }) => {
    await stubMatchApi(page);
    await advanceToReview(page);
    await page.getByRole("button", { name: "Run match" }).click();
    await expect(page.getByText("Overall match")).toBeVisible();

    await page.evaluate(() =>
      (
        window as unknown as { __i18n: { changeLanguage: (l: string) => void } }
      ).__i18n.changeLanguage("vi")
    );

    await expect(page.getByText("Mức khớp tổng")).toBeVisible();
    await expect(page.getByText("Khớp ngữ nghĩa")).toBeVisible();
    await expect(page.getByText("Điểm mạnh khớp")).toBeVisible();
    await expect(page.getByRole("button", { name: "Làm lại" })).toBeVisible();
  });

  test("Start over on step 4 resets the wizard back to step 1", async ({
    page
  }) => {
    await stubMatchApi(page);
    await advanceToReview(page);
    await page.getByRole("button", { name: "Run match" }).click();
    await expect(page.getByText("Overall match")).toBeVisible();

    await page.getByRole("button", { name: "Start over" }).click();

    await expect(
      page.getByRole("heading", { name: "Input Job Description" })
    ).toBeVisible();
    await expect(stepperStep(page, 1)).toHaveAttribute("data-status", "active");
    await expect(backButton(page)).toBeDisabled();
  });
});
