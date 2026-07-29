import { Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWizardStore } from "#/stores";
import Stepper from "./components/Stepper";
import StepCV from "./mains/StepCV";
import StepJD from "./mains/StepJD";
import StepResult from "./mains/StepResult";
import StepReview from "./mains/StepReview";

/**
 * Wizard shell: brand header + step badge + 4-step Stepper + current step body.
 * Step 1 (JD) and 2 (CV) use DocumentInputStep; step 3 (Review) and step 4
 * (Result) are wired to the matching engine (Plan 2).
 */
const Wizard = () => {
  const { t } = useTranslation();
  const step = useWizardStore((s) => s.step);

  return (
    // Shell locked to the viewport (100vh) — no outer scroll. Left rail holds
    // brand + vertical stepper; the right column fills the height and each
    // step scrolls its own body internally, keeping the footer/Next in view.
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <aside className="flex w-72 shrink-0 flex-col gap-10 overflow-y-auto border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 dark:bg-indigo-600">
            <Wand2 className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("appName")}
          </h1>
        </div>
        <div className="self-start rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-400">
          {t("stepper.progress", { n: step })}
        </div>
        <Stepper current={step} orientation="vertical" />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-6 md:p-6">
        {step === 1 && <StepJD />}
        {step === 2 && <StepCV />}
        {step === 3 && <StepReview />}
        {step === 4 && <StepResult />}
      </main>
    </div>
  );
};

export default Wizard;
