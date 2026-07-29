import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "#/i18n/config";
import Home from "../index";

describe("Home", () => {
  it("renders app name", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /match cv/i })).toBeDefined();
  });

  it("renders antd primary button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /start/i })).toBeDefined();
  });

  describe("console output", () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    it("renders without console errors", () => {
      render(<Home />);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
