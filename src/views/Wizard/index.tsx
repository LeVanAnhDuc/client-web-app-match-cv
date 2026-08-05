import { useWizardStore } from "#/stores";
import StepCV from "./mains/StepCV";
import StepJD from "./mains/StepJD";
import StepResult from "./mains/StepResult";
import StepReview from "./mains/StepReview";
import WizardNav from "./mains/WizardNav";

/**
 * Wizard shell: nav (brand + step badge + 4-step Stepper) + current step body.
 * Mobile/tablet: one column, nav on top, the page scrolls naturally and each
 * step pins its own footer. From `lg`: two columns locked to the viewport
 * (`h-dvh`) with the step body scrolling internally so the footer/Next stays in
 * view — the pre-existing desktop behaviour.
 * See docs/specs/wizard-responsive/design.md §6.1.
 */
const Wizard = () => {
  const step = useWizardStore((s) => s.step);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 lg:h-dvh lg:flex-row lg:overflow-hidden dark:bg-slate-900">
      <WizardNav step={step} />

      <main className="flex min-w-0 flex-1 flex-col p-4 md:p-6 lg:overflow-hidden">
        {step === 1 && <StepJD />}
        {step === 2 && <StepCV />}
        {step === 3 && <StepReview />}
        {step === 4 && <StepResult />}
      </main>
    </div>
  );
};

export default Wizard;
