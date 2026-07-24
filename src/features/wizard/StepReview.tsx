import { Button, Input } from 'antd'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateDocument, useDocument } from '#/features/documents/queries'
import { useRunMatch } from '#/features/matching/queries'
import type { DocumentKind } from '#/features/documents/types'
import { useWizardStore } from './store'

const { TextArea } = Input

/**
 * Wizard step 3 — Review parsed CV/JD rawText before matching. Two editable
 * TextAreas prefilled from GET /documents/:id. Back returns to step 2 (and
 * from there step 1) to import a new document. Run match: any pane whose
 * text differs from the originally-loaded rawText is persisted as a fresh
 * transient (save:false) document first, then POST /match is called.
 * See docs/ui-designs/cv-jd-matching-wizard/wizard-step3-review.html.
 */
export function StepReview() {
  const { t } = useTranslation()
  const jdDocId = useWizardStore((s) => s.jdDocId)
  const cvDocId = useWizardStore((s) => s.cvDocId)
  const setMatchId = useWizardStore((s) => s.setMatchId)
  const goNext = useWizardStore((s) => s.goNext)
  const goBack = useWizardStore((s) => s.goBack)

  const jdQuery = useDocument(jdDocId)
  const cvQuery = useDocument(cvDocId)

  const [jdText, setJdText] = useState('')
  const [cvText, setCvText] = useState('')
  const jdInitialized = useRef(false)
  const cvInitialized = useRef(false)

  useEffect(() => {
    if (jdQuery.data && !jdInitialized.current) {
      setJdText(jdQuery.data.rawText)
      jdInitialized.current = true
    }
  }, [jdQuery.data])

  useEffect(() => {
    if (cvQuery.data && !cvInitialized.current) {
      setCvText(cvQuery.data.rawText)
      cvInitialized.current = true
    }
  }, [cvQuery.data])

  const createDocument = useCreateDocument()
  const runMatch = useRunMatch()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoadingDocs =
    jdQuery.isLoading || cvQuery.isLoading || !jdQuery.data || !cvQuery.data

  /** Reuse the loaded document id unless its text was edited in this step. */
  async function resolveDocId(
    originalId: string | null,
    originalText: string | undefined,
    editedText: string,
    kind: DocumentKind,
  ): Promise<string> {
    if (originalId && editedText === originalText) {
      return originalId
    }
    const created = await createDocument.mutateAsync({
      mode: 'paste',
      kind,
      sourceText: editedText,
      save: false,
    })
    return created.id
  }

  async function handleRunMatch() {
    setError(null)
    setIsSubmitting(true)
    try {
      const jdId = await resolveDocId(jdDocId, jdQuery.data?.rawText, jdText, 'JD')
      const cvId = await resolveDocId(cvDocId, cvQuery.data?.rawText, cvText, 'CV')
      const result = await runMatch.mutateAsync({ cvDocumentId: cvId, jdDocumentId: jdId })
      setMatchId(result.id)
      goNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('err.matchFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Guard: reaching step 3 without a JD/CV id (e.g. corrupted persisted state
  // or a direct setStep) → useDocument(null) is disabled and never resolves,
  // so without this the spinner below would hang forever. Offer a way back.
  if (!jdDocId || !cvDocId) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-100 dark:border-slate-700/50 p-16 flex flex-col items-center justify-center gap-4">
        <p role="alert" className="text-slate-500 dark:text-slate-400 font-medium">
          {t('review.missingDocs')}
        </p>
        <Button icon={<ArrowLeft size={16} />} onClick={goBack}>
          {t('action.back')}
        </Button>
      </div>
    )
  }

  if (isLoadingDocs) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-100 dark:border-slate-700/50 p-16 flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" size={20} />
        <p className="text-slate-400 dark:text-slate-500 font-medium">{t('review.loading')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
            {t('wizard.stepReview.title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('wizard.stepReview.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-amber-600 dark:text-indigo-400 bg-amber-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg border border-amber-100 dark:border-indigo-500/20 shrink-0">
          <span className="text-xs font-medium">{t('review.hint')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700/50">
        <div className="p-8">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            {t('step.jd')}
          </h3>
          <TextArea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={14}
            className="!rounded-xl"
            aria-label={t('step.jd')}
          />
        </div>
        <div className="p-8">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            {t('step.cv')}
          </h3>
          <TextArea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            rows={14}
            className="!rounded-xl"
            aria-label={t('step.cv')}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="px-8 pb-6 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="p-6 bg-slate-50/50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={goBack}
          className="!text-slate-500 dark:!text-slate-300"
        >
          {t('action.back')}
        </Button>
        <Button
          type="primary"
          loading={isSubmitting}
          onClick={() => void handleRunMatch()}
          icon={<Sparkles size={16} />}
        >
          {t('action.runMatch')}
        </Button>
      </div>
    </div>
  )
}
