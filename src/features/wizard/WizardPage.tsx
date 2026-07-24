import { Wand2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StepCV } from './StepCV'
import { StepJD } from './StepJD'
import { StepResult } from './StepResult'
import { StepReview } from './StepReview'
import { Stepper } from './Stepper'
import { useWizardStore } from './store'

/**
 * Wizard shell: brand header + step badge + 4-step Stepper + current step body.
 * Step 1 (JD) and 2 (CV) use DocumentInputStep; step 3 (Review) and step 4
 * (Result) are wired to the matching engine (Plan 2).
 */
export function WizardPage() {
  const { t } = useTranslation()
  const step = useWizardStore((s) => s.step)

  return (
    // Shell locked to the viewport (100vh) — no outer scroll. Left rail holds
    // brand + vertical stepper; the right column fills the height and each
    // step scrolls its own body internally, keeping the footer/Next in view.
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col gap-10 p-6 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 dark:bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Wand2 className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t('appName')}</h1>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-400 text-xs font-medium rounded-full self-start">
          {t('stepper.progress', { n: step })}
        </div>
        <Stepper current={step} orientation="vertical" />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col p-6 md:p-6 overflow-hidden">
        {step === 1 && <StepJD />}
        {step === 2 && <StepCV />}
        {step === 3 && <StepReview />}
        {step === 4 && <StepResult />}
      </main>
    </div>
  )
}
