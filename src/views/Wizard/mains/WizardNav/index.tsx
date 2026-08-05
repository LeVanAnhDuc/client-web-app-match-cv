import { Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WizardStep } from "#/types/Wizard";
import Stepper from "../../components/Stepper";

/** Brand lockup — private single-use helper for {@link WizardNav}. */
function BrandMark() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 dark:bg-indigo-600">
        <Wand2 className="text-white" size={20} />
      </div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
        {t("appName")}
      </h1>
    </div>
  );
}

/**
 * Wizard nav — ONE element that reflows: a horizontal top bar on mobile/tablet,
 * a 288px vertical rail from `lg` up. Deliberately not two hidden/shown
 * variants: that would duplicate the stepper testids and the progress badge in
 * the DOM and break Playwright strict-mode locators
 * (docs/specs/wizard-responsive/design.md §4.2, §6.2).
 */
const WizardNav = ({ step }: { step: WizardStep }) => {
  const { t } = useTranslation();

  return (
    <aside className="flex shrink-0 flex-col gap-4 border-b border-slate-200 bg-white p-4 md:px-6 lg:w-72 lg:gap-10 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-6 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start lg:gap-10">
        <BrandMark />
        <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 lg:self-start dark:bg-indigo-500/10 dark:text-indigo-400">
          {t("stepper.progress", { n: step })}
        </div>
      </div>

      <Stepper current={step} />
    </aside>
  );
};

export default WizardNav;
