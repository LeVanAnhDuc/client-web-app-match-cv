import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "#/i18n/config";
import * as documentHooks from "#/hooks/useDocuments";
import * as matchHooks from "#/hooks/useMatch";
import { useWizardStore } from "#/stores";
import type { DocumentDto } from "#/types/Documents";
import type { MatchResultDto } from "#/types/Matching";
import StepReview from "../index";

function renderStep() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StepReview />
    </QueryClientProvider>
  );
}

const jdDto: DocumentDto = {
  id: "jd-1",
  kind: "JD",
  title: "Senior Product Designer",
  sourceFormat: "pdf",
  rawText: "We need a senior product designer with Figma experience.",
  isSaved: true,
  createdAt: "2023-10-12T00:00:00.000Z"
};

const cvDto: DocumentDto = {
  id: "cv-1",
  kind: "CV",
  title: "Sarah Johnson",
  sourceFormat: "pdf",
  rawText: "Sarah Johnson — 6 years of product design experience.",
  isSaved: true,
  createdAt: "2023-10-12T00:00:00.000Z"
};

const matchResult: MatchResultDto = {
  id: "match-1",
  cvDocumentId: "cv-1",
  jdDocumentId: "jd-1",
  overallScore: 75,
  semanticScore: 88,
  keywordScore: 62,
  report: { strengths: [], gaps: [], suggestions: [] },
  createdAt: "2023-10-12T00:00:00.000Z"
};

/** Both documents resolved — the precondition for step 3 rendering its panes. */
function stubLoadedDocs() {
  vi.spyOn(documentHooks, "useDocument").mockImplementation((id) => {
    const data = id === "jd-1" ? jdDto : id === "cv-1" ? cvDto : undefined;
    return { data, isLoading: false, isError: false } as ReturnType<
      typeof documentHooks.useDocument
    >;
  });
  vi.spyOn(matchHooks, "useRunMatch").mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false
  } as unknown as ReturnType<typeof matchHooks.useRunMatch>);
}

describe("StepReview", () => {
  beforeEach(() => {
    useWizardStore.setState({
      step: 3,
      jdDocId: "jd-1",
      cvDocId: "cv-1",
      matchId: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders two review panes prefilled with the CV and JD rawText", async () => {
    vi.spyOn(documentHooks, "useDocument").mockImplementation((id) => {
      const data = id === "jd-1" ? jdDto : id === "cv-1" ? cvDto : undefined;
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentHooks.useDocument
      >;
    });
    vi.spyOn(matchHooks, "useRunMatch").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as unknown as ReturnType<typeof matchHooks.useRunMatch>);

    renderStep();

    expect(await screen.findByDisplayValue(jdDto.rawText)).toBeInTheDocument();
    expect(await screen.findByDisplayValue(cvDto.rawText)).toBeInTheDocument();
  });

  it("gives each pane a fixed 40vh height below lg and full height from lg up", async () => {
    stubLoadedDocs();
    renderStep();

    const jd = await screen.findByLabelText("Job Description");
    expect(jd.className).toContain("!h-[40vh]");
    expect(jd.className).toContain("lg:!h-full");
    // The old inline style={{ height: "100%" }} would win over the responsive
    // classes below lg, collapsing the stacked panes.
    expect(jd.getAttribute("style") ?? "").not.toContain("height: 100%");
  });

  it("pins the footer actions to the viewport below lg and uses large hit-areas", async () => {
    stubLoadedDocs();
    renderStep();

    const runMatch = await screen.findByRole("button", { name: /run match/i });
    expect(runMatch.className).toContain("ant-btn-lg");
    expect(runMatch.parentElement?.className).toContain("sticky");
    expect(runMatch.parentElement?.className).toContain("lg:static");
  });

  it("Back navigates to step 2", async () => {
    vi.spyOn(documentHooks, "useDocument").mockImplementation((id) => {
      const data = id === "jd-1" ? jdDto : id === "cv-1" ? cvDto : undefined;
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentHooks.useDocument
      >;
    });
    vi.spyOn(matchHooks, "useRunMatch").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as unknown as ReturnType<typeof matchHooks.useRunMatch>);

    renderStep();
    await screen.findByDisplayValue(jdDto.rawText);

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    await waitFor(() => expect(useWizardStore.getState().step).toBe(2));
  });

  it("Run match reuses existing doc ids unchanged, sets matchId and advances to step 4", async () => {
    vi.spyOn(documentHooks, "useDocument").mockImplementation((id) => {
      const data = id === "jd-1" ? jdDto : id === "cv-1" ? cvDto : undefined;
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentHooks.useDocument
      >;
    });
    const mutateAsync = vi.fn(async () => matchResult);
    vi.spyOn(matchHooks, "useRunMatch").mockReturnValue({
      mutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof matchHooks.useRunMatch>);

    renderStep();
    await screen.findByDisplayValue(jdDto.rawText);

    fireEvent.click(screen.getByRole("button", { name: /run match/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        cvDocumentId: "cv-1",
        jdDocumentId: "jd-1"
      })
    );
    await waitFor(() =>
      expect(useWizardStore.getState().matchId).toBe("match-1")
    );
    await waitFor(() => expect(useWizardStore.getState().step).toBe(4));
  });

  it("Run match creates a fresh transient document when text was edited", async () => {
    vi.spyOn(documentHooks, "useDocument").mockImplementation((id) => {
      const data = id === "jd-1" ? jdDto : id === "cv-1" ? cvDto : undefined;
      return { data, isLoading: false, isError: false } as ReturnType<
        typeof documentHooks.useDocument
      >;
    });
    const createMutateAsync = vi.fn(async () => ({ ...jdDto, id: "jd-2" }));
    vi.spyOn(documentHooks, "useCreateDocument").mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof documentHooks.useCreateDocument>);
    const runMutateAsync = vi.fn(async () => matchResult);
    vi.spyOn(matchHooks, "useRunMatch").mockReturnValue({
      mutateAsync: runMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof matchHooks.useRunMatch>);

    renderStep();
    const jdTextarea = await screen.findByDisplayValue(jdDto.rawText);
    fireEvent.change(jdTextarea, { target: { value: "Edited JD text" } });

    fireEvent.click(screen.getByRole("button", { name: /run match/i }));

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "paste",
          kind: "JD",
          sourceText: "Edited JD text",
          save: false
        })
      )
    );
    await waitFor(() =>
      expect(runMutateAsync).toHaveBeenCalledWith({
        cvDocumentId: "cv-1",
        jdDocumentId: "jd-2"
      })
    );
  });
});
