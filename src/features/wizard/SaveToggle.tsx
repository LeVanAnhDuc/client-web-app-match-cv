import { Input, Switch } from 'antd'
import { Bookmark, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DocumentKind } from '#/features/documents/types'

interface SaveToggleProps {
  kind: DocumentKind
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  title: string
  onTitleChange: (title: string) => void
}

/** Save-for-reuse switch + title input (mock §7 Save toggle). */
export function SaveToggle({
  kind,
  checked,
  onCheckedChange,
  title,
  onTitleChange,
}: SaveToggleProps) {
  const { t } = useTranslation()
  const Icon = kind === 'JD' ? Save : Bookmark
  const labelKey = kind === 'JD' ? 'save.jd' : 'save.cv'

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-400 dark:text-indigo-400/60" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t(labelKey)}
          </span>
        </div>
        <Switch checked={checked} onChange={onCheckedChange} />
      </div>
      {checked && (
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('save.title.placeholder')}
        />
      )}
    </div>
  )
}
