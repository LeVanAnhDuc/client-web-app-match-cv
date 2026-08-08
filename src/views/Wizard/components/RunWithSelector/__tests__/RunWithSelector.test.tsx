import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import "#/i18n/config";
import {
  useAiCredentials,
  useProviders,
  useTestCredential
} from "#/hooks/useAiCredentials";
import type { AiCredentialDto, ProviderInfoDto } from "#/types/AiCredentials";
import RunWithSelector from "../index";

vi.mock("#/hooks/useAiCredentials");
vi.mock("#/components/CredentialFormModal", () => ({
  default: () => <div data-testid="credential-form-modal" />
}));

function asQuery<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null
  } as UseQueryResult<T>;
}

const providers: Array<ProviderInfoDto> = [
  {
    id: "openrouter",
    label: "OpenRouter",
    defaultChatModel: "openai/gpt-4o-mini",
    defaultEmbedModel: "openai/text-embedding-3-small"
  },
  {
    id: "gemini",
    label: "Google Gemini",
    defaultChatModel: "gemini-2.5-flash",
    defaultEmbedModel: "gemini-embedding-001"
  }
];

const base: AiCredentialDto = {
  id: "cred-1",
  provider: "openrouter",
  label: "Mine",
  keyLast4: "1234",
  chatModel: null,
  embedModel: null,
  lastTestStatus: "ok",
  lastTestedAt: "2026-08-01T00:00:00.000Z",
  lastUsedAt: null,
  createdAt: "2026-08-01T00:00:00.000Z"
};

function mockCredentials(credentials: Array<AiCredentialDto>) {
  vi.mocked(useAiCredentials).mockReturnValue(asQuery(credentials));
  vi.mocked(useProviders).mockReturnValue(asQuery(providers));
  vi.mocked(useTestCredential).mockReturnValue({
    mutate: vi.fn(),
    isPending: false
  } as unknown as UseMutationResult<never, Error, string>);
}

describe("RunWithSelector", () => {
  beforeEach(() => vi.clearAllMocks());

  it("defaults to the most recently used credential", async () => {
    mockCredentials([
      { ...base, id: "a", label: "Older", lastUsedAt: "2026-08-01T00:00:00Z" },
      { ...base, id: "b", label: "Newer", lastUsedAt: "2026-08-05T00:00:00Z" }
    ]);
    const onChange = vi.fn();
    render(<RunWithSelector value={null} onChange={onChange} />);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("b"));
  });

  it("stays on the system key when the user has no credentials", async () => {
    mockCredentials([]);
    const onChange = vi.fn();
    render(<RunWithSelector value={null} onChange={onChange} />);
    expect(await screen.findByText("System key")).toBeInTheDocument();
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(null));
  });

  it("falls back when the selected credential no longer exists", async () => {
    mockCredentials([{ ...base, id: "a" }]);
    const onChange = vi.fn();
    render(<RunWithSelector value="deleted-id" onChange={onChange} />);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("a"));
  });

  it("warns without blocking when the selected credential is untested", () => {
    mockCredentials([{ ...base, id: "a", lastTestStatus: null }]);
    render(<RunWithSelector value="a" onChange={vi.fn()} />);
    expect(
      screen.getByText("This credential has not been tested yet.")
    ).toBeInTheDocument();
  });

  it("warns when the last test did not pass", () => {
    mockCredentials([{ ...base, id: "a", lastTestStatus: "no_quota" }]);
    render(<RunWithSelector value="a" onChange={vi.fn()} />);
    expect(
      screen.getByText("The last test for this credential did not pass.")
    ).toBeInTheDocument();
  });

  it("stays quiet when the last test passed", () => {
    mockCredentials([{ ...base, id: "a", lastTestStatus: "ok" }]);
    render(<RunWithSelector value="a" onChange={vi.fn()} />);
    expect(screen.queryByText(/has not been tested/)).not.toBeInTheDocument();
    expect(screen.queryByText(/did not pass/)).not.toBeInTheDocument();
  });

  it("names the provider the documents will be sent to", () => {
    mockCredentials([{ ...base, id: "a", provider: "gemini" }]);
    render(<RunWithSelector value="a" onChange={vi.fn()} />);
    expect(
      screen.getByText("Your CV and JD text will be sent to Google Gemini.")
    ).toBeInTheDocument();
  });

  it("names the system key in the privacy notice when nothing is selected", () => {
    mockCredentials([]);
    render(<RunWithSelector value={null} onChange={vi.fn()} />);
    expect(
      screen.getByText(
        "Your CV and JD text will be sent to OpenRouter using the system key."
      )
    ).toBeInTheDocument();
  });

  it("gives the select an accessible name", () => {
    mockCredentials([{ ...base, id: "a" }]);
    render(<RunWithSelector value="a" onChange={vi.fn()} />);
    expect(
      screen.getByRole("combobox", { name: "Run with" })
    ).toBeInTheDocument();
  });
});
