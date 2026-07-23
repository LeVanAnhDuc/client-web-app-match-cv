import { Button } from 'antd'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateDocument } from '#/features/documents/queries'
import type { DocumentKind } from '#/features/documents/types'
import { SavedDocRadioList } from './SavedDocRadioList'
import { SaveToggle } from './SaveToggle'
import { UploadPasteTabs } from './UploadPasteTabs'
import type { InputMode } from './UploadPasteTabs'

const MAX_FILE_SIZE_LABEL = '10MB' // Global Constraints (Plan 1): max 10MB, PDF/DOCX only.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_FILE_PATTERN = /\.(pdf|docx)$/i

interface DocumentInputStepProps {
  kind: DocumentKind
  onNext: (docId: string) => void
  onBack?: () => void
}

/**
 * Shared step body for wizard step 1 (JD) and step 2 (CV): Upload/Paste
 * tabs, reuse radio list, save toggle, and Back/Next footer. See
 * docs/ui-designs/cv-jd-matching-wizard/{wizard-step1-jd,wizard-step2-cv}.html.
 */
export function DocumentInputStep({ kind, onNext, onBack }: DocumentInputStepProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<InputMode>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
  const [save, setSave] = useState(true)
  const [title, setTitle] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const createDocument = useCreateDocument()

  const stepCopyKey = kind === 'JD' ? 'wizard.stepJd' : 'wizard.stepCv'
  const reuseKey = kind === 'JD' ? 'jd' : 'cv'

  const hasNewInput = mode === 'upload' ? file !== null : pastedText.trim().length > 0
  const canSubmit = selectedSavedId !== null || hasNewInput

  function handleModeChange(next: InputMode) {
    setMode(next)
    setSelectedSavedId(null)
    setValidationError(null)
  }

  function handleFileChange(next: File | null) {
    if (next) {
      if (!ALLOWED_FILE_PATTERN.test(next.name)) {
        setValidationError(t('err.fileType'))
        return
      }
      if (next.size > MAX_FILE_SIZE_BYTES) {
        setValidationError(t('err.fileSize', { max: MAX_FILE_SIZE_LABEL }))
        return
      }
    }
    setFile(next)
    setSelectedSavedId(null)
    setValidationError(null)
  }

  function handlePastedTextChange(next: string) {
    setPastedText(next)
    setSelectedSavedId(null)
    setValidationError(null)
  }

  function handleSelectSaved(id: string) {
    setSelectedSavedId(id)
    setFile(null)
    setPastedText('')
    setValidationError(null)
  }

  async function handleNext() {
    if (selectedSavedId) {
      onNext(selectedSavedId)
      return
    }

    if (!hasNewInput) {
      setValidationError(t('err.empty', { kind: t(`step.${reuseKey}`) }))
      return
    }

    if (save && title.trim().length === 0) {
      setValidationError(t('save.title.placeholder'))
      return
    }

    try {
      const created =
        mode === 'upload' && file
          ? await createDocument.mutateAsync({
              mode: 'file',
              kind,
              file,
              save,
              title: save ? title.trim() : undefined,
            })
          : await createDocument.mutateAsync({
              mode: 'paste',
              kind,
              sourceText: pastedText.trim(),
              save,
              title: save ? title.trim() : undefined,
            })

      onNext(created.id)
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : t('err.parseFailed'))
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-700/50">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {t(`${stepCopyKey}.title`)}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">{t(`${stepCopyKey}.description`)}</p>
      </div>

      <div className="p-8">
        <UploadPasteTabs
          mode={mode}
          onModeChange={handleModeChange}
          file={file}
          onFileChange={handleFileChange}
          pastedText={pastedText}
          onPastedTextChange={handlePastedTextChange}
          maxSizeLabel={MAX_FILE_SIZE_LABEL}
        />

        <div className="mb-10">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            {t(`reuse.${reuseKey}.title`)}
          </h3>
          <SavedDocRadioList kind={kind} selectedId={selectedSavedId} onSelect={handleSelectSaved} />
        </div>

        {hasNewInput && (
          <SaveToggle
            kind={kind}
            checked={save}
            onCheckedChange={setSave}
            title={title}
            onTitleChange={setTitle}
          />
        )}

        {validationError && (
          <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
            {validationError}
          </p>
        )}
      </div>

      <div className="p-6 bg-slate-50/50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
        <Button
          type="text"
          disabled={!onBack}
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
          className="!text-slate-500 dark:!text-slate-300"
        >
          {t('action.back')}
        </Button>
        <Button
          type="primary"
          disabled={!canSubmit}
          loading={createDocument.isPending}
          onClick={() => void handleNext()}
          iconPosition="end"
          icon={<ArrowRight size={16} />}
        >
          {t('action.next')}
        </Button>
      </div>
    </div>
  )
}
