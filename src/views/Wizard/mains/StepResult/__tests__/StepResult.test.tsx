import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "#/i18n/config";
import { ApiError } from "#/libs/api";
import * as matchHooks from "#/hooks/useMatch";
import { useWizardStore } from "#/stores";
import type { MatchResultDto } from "#/types/Matching";
import StepResult from "../index";

function renderStep() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StepResult />
    </QueryClientProvider>
  );
}

const matchResult: MatchResultDto = {
  id: "match-1",
  cvDocumentId: "cv-1",
  jdDocumentId: "jd-1",
  overallScore: 75,
  semanticScore: 88,
  keywordScore: 62,
  report: {
    strengths: ["Figma Mastery", "Cross-functional Collaboration"],
    gaps: ["Accessibility Standards (WCAG)"],
    suggestions: [
      'Quantify design impact with metrics like "Increased conversion by 15%."'
    ]
  },
  createdAt: "2023-10-12T00:00:00.000Z"
};

describe("StepResult", () => {
  beforeEach(() => {
    useWizardStore.setState({
      step: 4,
      jdDocId: "jd-1",
      cvDocId: "cv-1",
      matchId: "match-1"
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders overall/semantic/keyword scores and the three report lists", () => {
    vi.spyOn(matchHooks, "useMatchResult").mockReturnValue({
      data: matchResult,
      isLoading: false,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof matchHooks.useMatchResult>);

    renderStep();

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText("Figma Mastery")).toBeInTheDocument();
    expect(
      screen.getByText("Accessibility Standards (WCAG)")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Quantify design impact with metrics like "Increased conversion by 15%."'
      )
    ).toBeInTheDocument();
  });

  it("scales the gauge down on mobile and pins the footer actions", () => {
    vi.spyOn(matchHooks, "useMatchResult").mockReturnValue({
      data: matchResult,
      isLoading: false,
      isError: false,
      error: null
    } as ReturnType<typeof matchHooks.useMatchResult>);

    renderStep();

    const startOver = screen.getByRole("button", { name: /start over/i });
    expect(startOver.className).toContain("ant-btn-lg");
    expect(startOver.parentElement?.className).toContain("sticky");
    expect(startOver.parentElement?.className).toContain("lg:static");

    const gauge = document.querySelector("svg")?.parentElement;
    expect(gauge?.className).toContain("size-32");
    expect(gauge?.className).toContain("md:size-40");
  });

  it("shows a loading state while the match result is pending", () => {
    vi.spyOn(matchHooks, "useMatchResult").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof matchHooks.useMatchResult>);

    renderStep();

    expect(screen.getByText(/running the match/i)).toBeInTheDocument();
  });

  it("shows a friendly error message on 503 (OpenRouter unavailable)", () => {
    vi.spyOn(matchHooks, "useMatchResult").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(503, "OpenRouter API is down")
    } as unknown as ReturnType<typeof matchHooks.useMatchResult>);

    renderStep();

    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
  });

  it('"Start over" resets the wizard store back to step 1', () => {
    vi.spyOn(matchHooks, "useMatchResult").mockReturnValue({
      data: matchResult,
      isLoading: false,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof matchHooks.useMatchResult>);

    renderStep();

    fireEvent.click(screen.getByRole("button", { name: /start over/i }));

    expect(useWizardStore.getState().step).toBe(1);
    expect(useWizardStore.getState().jdDocId).toBeNull();
    expect(useWizardStore.getState().matchId).toBeNull();
  });
});
