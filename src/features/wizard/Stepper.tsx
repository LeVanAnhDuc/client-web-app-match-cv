import { Check, CheckCircle, Eye, FileText, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ComponentType } from 'react'
import type { WizardStep } from './store'

interface StepDef {
  step: WizardStep
  icon: ComponentType<{ size?: number }>
  labelKey: string
  disabled?: boolean
}

// Icon mapping per .claude/uiux/icon-map.md §1 (wizard/navigation).
const STEPS: Array<StepDef> = [
  { step: 1, icon: FileText, labelKey: 'step.jd' },
  { step: 2, icon: User, labelKey: 'step.cv' },
  { step: 3, icon: Eye, labelKey: 'step.review', disabled: true },
  { step: 4, icon: CheckCircle, labelKey: 'step.result', disabled: true },
]

interface StepperProps {
  current: WizardStep
}

/** Horizontal 4-step wizard stepper — dot + connecting line (mock §7 Stepper). */
export function Stepper({ current }: StepperProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between w-full mb-16">
      {STEPS.map((s, idx) => {
        const isDone = s.step < current
        const isActive = s.step === current
        const Icon = isDone ? Check : s.icon

        return (
          <div key={s.step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-3 relative">
              <div
                data-testid={`stepper-step-${s.step}`}
                data-status={isActive ? 'active' : isDone ? 'done' : 'idle'}
                aria-current={isActive ? 'step' : undefined}
                aria-disabled={s.disabled ? 'true' : undefined}
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-colors',
                  isActive
                    ? 'bg-blue-600 dark:bg-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-indigo-500/40'
                    : isDone
                      ? 'bg-blue-100 text-blue-600 border border-blue-200 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-600/50'
                      : 'bg-white border-2 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600',
                  s.disabled ? 'cursor-not-allowed' : '',
                ].join(' ')}
              >
                <Icon size={18} />
              </div>
              <span
                className={
                  isActive
                    ? 'text-sm font-semibold text-slate-900 dark:text-white'
                    : 'text-sm font-medium text-slate-500 dark:text-slate-400'
                }
              >
                {t(s.labelKey)}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`step-line flex-1 h-[2px] mx-4 ${
                  s.step < current
                    ? 'bg-blue-600 dark:bg-indigo-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
