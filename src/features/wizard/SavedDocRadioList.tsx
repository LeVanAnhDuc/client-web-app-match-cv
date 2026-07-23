import { Radio } from 'antd'
import { SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSavedDocuments } from '#/features/documents/queries'
import type { DocumentKind } from '#/features/documents/types'

interface SavedDocRadioListProps {
  kind: DocumentKind
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * Reuse list for saved JD/CV documents. MUST be a radio list (not a
 * dropdown) per plan §D3, with an empty-state (icon `search-x`) when the
 * user has nothing saved yet — see .claude/uiux/frontend-reference.md §7.
 */
export function SavedDocRadioList({ kind, selectedId, onSelect }: SavedDocRadioListProps) {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useSavedDocuments(kind)

  if (isLoading) {
    return null
  }

  if (!data || data.length === 0) {
    const emptyKey = kind === 'JD' ? 'reuse.empty.jd' : 'reuse.empty.cv'
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 border border-slate-200 dark:border-slate-700/50 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-600">
          <SearchX size={22} />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">{t(emptyKey)}</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs text-center mt-1 max-w-[220px]">
          {t('reuse.empty.hint')}
        </p>
      </div>
    )
  }

  return (
    <Radio.Group
      value={selectedId}
      onChange={(e) => onSelect(e.target.value as string)}
      className="w-full flex flex-col gap-3"
    >
      {data.map((doc) => (
        <Radio
          key={doc.id}
          value={doc.id}
          className="!flex items-center !ml-0 p-4 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-blue-200 dark:hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all"
        >
          <span className="ml-2 flex-1 inline-block">
            <span className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-900 dark:text-white">{doc.title}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {new Date(doc.createdAt).toLocaleDateString(i18n.language)}
              </span>
            </span>
            <span className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-bold uppercase tracking-tight">
                {doc.sourceFormat}
              </span>
            </span>
          </span>
        </Radio>
      ))}
    </Radio.Group>
  )
}
