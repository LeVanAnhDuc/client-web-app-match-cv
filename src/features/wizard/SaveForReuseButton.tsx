import { Button, Input, Modal } from 'antd'
import { Bookmark, CircleCheck, Save } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DocumentKind } from '#/features/documents/types'

interface SaveForReuseButtonProps {
  kind: DocumentKind
  /** Non-null once this input has been saved this session → shows a confirmation instead of the button. */
  savedTitle: string | null
  /** Persist the current input as a reusable document under `name`; throws on failure. */
  onSave: (name: string) => Promise<void>
}

/**
 * Explicit "save for reuse" affordance: shown after a file/text is imported.
 * A clearly-labelled button opens a modal that explains what saving does and
 * asks for a name — so the user understands the action and there's no
 * ambiguity. See .claude/uiux/standards.md §7. Replaces the old inline toggle.
 */
export function SaveForReuseButton({ kind, savedTitle, onSave }: SaveForReuseButtonProps) {
  const { t } = useTranslation()
  const Icon = kind === 'JD' ? Save : Bookmark

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (savedTitle) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10">
        <CircleCheck size={16} className="shrink-0 text-green-600 dark:text-green-500" />
        <span className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-300">
          {t('save.saved', { title: savedTitle })}
        </span>
      </div>
    )
  }

  async function handleConfirm() {
    if (name.trim().length === 0) {
      setError(t('save.nameRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(name.trim())
      setOpen(false)
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('err.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button icon={<Icon size={16} />} onClick={() => setOpen(true)}>
        {t('save.button')}
      </Button>

      <Modal
        title={t('save.modal.title')}
        open={open}
        confirmLoading={saving}
        okText={t('save.modal.confirm')}
        cancelText={t('action.cancel')}
        okButtonProps={{ icon: <Icon size={16} /> }}
        onOk={() => void handleConfirm()}
        onCancel={() => {
          setOpen(false)
          setError(null)
        }}
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t('save.modal.description')}
        </p>
        <Input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          onPressEnter={() => void handleConfirm()}
          placeholder={t('save.title.placeholder')}
          aria-label={t('save.modal.nameLabel')}
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </Modal>
    </>
  )
}
