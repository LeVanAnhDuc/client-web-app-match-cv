import { Check, CheckCircle, Eye, FileText, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";
import type { WizardStep } from "#/types/Wizard";

interface StepDef {
  step: WizardStep;
  icon: ComponentType<{ size?: number }>;
  labelKey: string;
}

// Icon mapping per .claude/uiux/icon-map.md §1 (wizard/navigation).
const STEPS: Array<StepDef> = [
  { step: 1, icon: FileText, labelKey: "step.jd" },
  { step: 2, icon: User, labelKey: "step.cv" },
  { step: 3, icon: Eye, labelKey: "step.review" },
  { step: 4, icon: CheckCircle, labelKey: "step.result" }
];

/** Single stepper dot — private presentational helper for {@link Stepper}. */
function Dot({
  step,
  Icon,
  isActive,
  isDone
}: {
  step: WizardStep;
  Icon: ComponentType<{ size?: number }>;
  isActive: boolean;
  isDone: boolean;
}) {
  return (
    <div
      data-testid={`stepper-step-${step}`}
      data-status={isActive ? "active" : isDone ? "done" : "idle"}
      aria-current={isActive ? "step" : undefined}
      className={[
        "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold transition-colors",
        isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:bg-indigo-600 dark:shadow-indigo-500/40"
          : isDone
            ? "border border-blue-200 bg-blue-100 text-blue-600 dark:border-indigo-600/50 dark:bg-indigo-600/20 dark:text-indigo-400"
            : "border-2 border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600"
      ].join(" ")}
    >
      <Icon size={18} />
    </div>
  );
}

/** 4-step wizard stepper — dot + connecting line (mock §7). Vertical rail (default) or horizontal. */
const Stepper = ({
  current,
  orientation = "vertical"
}: {
  current: WizardStep;
  orientation?: "horizontal" | "vertical";
}) => {
  const { t } = useTranslation();

  const labelClass = (isActive: boolean) =>
    isActive
      ? "text-sm font-semibold text-slate-900 dark:text-white"
      : "text-sm font-medium text-slate-500 dark:text-slate-400";

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col">
        {STEPS.map((s, idx) => {
          const isDone = s.step < current;
          const isActive = s.step === current;
          const Icon = isDone ? Check : s.icon;
          return (
            <div key={s.step} className="flex flex-col">
              <div className="flex items-center gap-3">
                <Dot
                  step={s.step}
                  Icon={Icon}
                  isActive={isActive}
                  isDone={isDone}
                />
                <span className={labelClass(isActive)}>{t(s.labelKey)}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`my-1 ml-5 h-8 w-[2px] ${
                    s.step < current
                      ? "bg-blue-600 dark:bg-indigo-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-16 flex w-full items-center justify-between">
      {STEPS.map((s, idx) => {
        const isDone = s.step < current;
        const isActive = s.step === current;
        const Icon = isDone ? Check : s.icon;
        return (
          <div key={s.step} className="flex flex-1 items-center last:flex-none">
            <div className="relative flex flex-col items-center gap-3">
              <Dot
                step={s.step}
                Icon={Icon}
                isActive={isActive}
                isDone={isDone}
              />
              <span className={labelClass(isActive)}>{t(s.labelKey)}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`step-line mx-4 h-[2px] flex-1 ${
                  s.step < current
                    ? "bg-blue-600 dark:bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
