import { Wand2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Stepper } from './Stepper'
import { useWizardStore } from './store'

/** Placeholder body for steps not yet implemented (Review/Result → Plan 2). */
function ComingSoonStep() {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-100 dark:border-slate-700/50 p-16 flex items-center justify-center">
      <p className="text-slate-400 dark:text-slate-500 font-medium">{t('wizard.comingSoon')}</p>
    </div>
  )
}

/**
 * Wizard shell: brand header + step badge + 4-step Stepper + current step body.
 * Step 1 (JD) and 2 (CV) are wired in DocumentInputStep-based components;
 * steps 3–4 (Review/Result) are placeholders until Plan 2.
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

        <ComingSoonStep />
      </section>
    </div>
  )
}
