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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-12 px-6">
      <section className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-indigo-600 rounded-lg flex items-center justify-center">
              <Wand2 className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t('appName')}
            </h1>
          </div>
          <div className="px-4 py-1.5 bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-400 text-sm font-medium rounded-full">
            {t('stepper.progress', { n: step })}
          </div>
        </div>

        <Stepper current={step} />

        {step === 1 && <StepJD />}
        {step === 2 && <StepCV />}
        {step === 3 && <StepReview />}
        {step === 4 && <StepResult />}
      </section>
    </div>
  )
}
