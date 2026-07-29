import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "#/i18n/config";
import Stepper from "../index";

describe("Stepper", () => {
  it("renders all 4 wizard steps with their labels", () => {
    render(<Stepper current={1} />);

    expect(screen.getByText(/job description/i)).toBeDefined();
    expect(screen.getByText(/cv \/ resume/i)).toBeDefined();
    expect(screen.getByText(/review/i)).toBeDefined();
    expect(screen.getByText(/result/i)).toBeDefined();
  });

  it('marks the current step active via aria-current="step"', () => {
    render(<Stepper current={2} />);

    const activeDot = screen.getByTestId("stepper-step-2");
    expect(activeDot.getAttribute("aria-current")).toBe("step");

    const idleDot = screen.getByTestId("stepper-step-1");
    expect(idleDot.getAttribute("aria-current")).toBeNull();
  });

  it("marks steps before current as done", () => {
    render(<Stepper current={3} />);

    const doneDot = screen.getByTestId("stepper-step-1");
    expect(doneDot.getAttribute("data-status")).toBe("done");
  });

  it("does not mark any step as disabled (Review/Result are implemented in Plan 2)", () => {
    render(<Stepper current={1} />);

    expect(
      screen.getByTestId("stepper-step-3").getAttribute("aria-disabled")
    ).toBeNull();
    expect(
      screen.getByTestId("stepper-step-4").getAttribute("aria-disabled")
    ).toBeNull();
  });
});
