import { Button } from 'antd'
import {
  AlertTriangle,
  CircleCheck,
  Lightbulb,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMatchResult } from '#/hooks/useMatch'
import { ApiError } from '#/libs/api'
import { useWizardStore } from '#/stores'

const GAUGE_RADIUS = 70
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS

/** Sub-score bar — private presentational helper for {@link StepResult}. */
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-indigo-400">
          {value}%
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-indigo-500 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

/** Titled report list (strengths / gaps) — private helper for {@link StepResult}. */
function ReportList({
  icon,
  title,
  items,
  itemIcon,
}: {
  icon: React.ReactNode
  title: string
  items: Array<string>
  itemIcon: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            {itemIcon}
            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Wizard step 4 — Result report from GET /match/:id: overall % gauge,
 * semantic/keyword sub-score bars, matched strengths, gaps and improvement
 * suggestions. See docs/ui-designs/cv-jd-matching-wizard/wizard-step4-result.html.
 */
const StepResult = () => {
  const { t } = useTranslation()
  const matchId = useWizardStore((s) => s.matchId)
  const reset = useWizardStore((s) => s.reset)

  const { data, isLoading, isError, error } = useMatchResult(matchId)

  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-16 flex items-center justify-center gap-3">
        <Loader2
          className="animate-spin text-slate-400 dark:text-slate-500"
          size={20}
        />
        <p className="text-slate-400 dark:text-slate-500 font-medium">
          {t('result.loading')}
        </p>
      </div>
    )
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError && error.status === 503
        ? t('err.matchUnavailable')
        : t('err.matchFailed')

    return (
      <div className="h-full bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-16 flex flex-col items-center justify-center gap-4">
        <p
          role="alert"
          className="text-red-600 dark:text-red-400 font-medium text-center"
        >
          {message}
        </p>
        <Button icon={<RotateCcw size={16} />} onClick={reset}>
          {t('action.startOver')}
        </Button>
      </div>
    )
  }

  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - data.overallScore / 100)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 flex flex-col md:flex-row items-center gap-12 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative w-40 h-40 shrink-0">
            <svg className="-rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={GAUGE_RADIUS}
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="8"
              />
              <circle
                cx="80"
                cy="80"
                r={GAUGE_RADIUS}
                fill="none"
                className="stroke-blue-600 dark:stroke-indigo-500 transition-[stroke-dashoffset] duration-1000 ease-out"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                {data.overallScore}%
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t('result.overall')}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreBar
                label={t('result.semantic')}
                value={data.semanticScore}
              />
              <ScoreBar label={t('result.keyword')} value={data.keywordScore} />
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ReportList
            icon={
              <CircleCheck
                className="text-green-600 dark:text-green-500"
                size={18}
              />
            }
            title={t('result.strengths')}
            items={data.report.strengths}
            itemIcon={
              <CircleCheck
                className="text-green-500 shrink-0 mt-0.5"
                size={18}
              />
            }
          />
          <ReportList
            icon={
              <AlertTriangle
                className="text-amber-600 dark:text-amber-500"
                size={18}
              />
            }
            title={t('result.gaps')}
            items={data.report.gaps}
            itemIcon={
              <AlertTriangle
                className="text-amber-500 shrink-0 mt-0.5"
                size={18}
              />
            }
          />
        </div>

        <div className="m-10 mt-0 p-6 bg-blue-50 dark:bg-indigo-500/5 rounded-xl border border-blue-100 dark:border-indigo-500/20">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={18} /> {t('result.suggestions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.report.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700/30"
              >
                <Lightbulb
                  className="text-blue-600 dark:text-indigo-400 shrink-0 mt-0.5"
                  size={16}
                />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="px-10 pb-6 text-xs text-slate-400 dark:text-slate-500 text-center">
          {t('result.disclaimer')}
        </p>
      </div>

      <div className="shrink-0 p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
        <Button
          type="text"
          icon={<RotateCcw size={16} />}
          onClick={reset}
          className="!text-slate-500 dark:!text-slate-300"
        >
          {t('action.startOver')}
        </Button>
        <Button type="primary">{t('action.saveReport')}</Button>
      </div>
    </div>
  )
}

export default StepResult
