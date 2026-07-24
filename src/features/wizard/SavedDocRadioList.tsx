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
 * Reuse list for saved JD/CV documents — a radio group of single-line
 * list-rows (never wrapping): radio dot (shrink-0) · middle `min-w-0 flex-1`
 * (title + meta, truncated) · format badge (shrink-0). Native radio inputs
 * (not antd Radio) to avoid the inline-flex label wrapping that broke the
 * layout. Empty-state when nothing saved. See .claude/uiux/standards.md §7.
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
      <div className="flex flex-col items-center justify-center py-10 px-6 border border-slate-200 dark:border-slate-700/60 rounded-xl bg-slate-50 dark:bg-slate-900/30">
        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-600">
          <SearchX size={22} />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t(emptyKey)}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1 max-w-[220px]">
          {t('reuse.empty.hint')}
        </p>
      </div>
    )
  }

  const groupName = `saved-${kind}`

  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {data.map((doc) => {
        const selected = doc.id === selectedId
        return (
          <label
            key={doc.id}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors',
              selected
                ? 'border-blue-500 bg-blue-50/60 dark:border-indigo-500 dark:bg-indigo-500/10'
                : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-900/40',
            ].join(' ')}
          >
            <input
              type="radio"
              name={groupName}
              value={doc.id}
              checked={selected}
              onChange={() => onSelect(doc.id)}
              className="shrink-0 size-4 accent-blue-600 dark:accent-indigo-500"
            />
            <span className="min-w-0 flex-1 flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {doc.title}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {new Date(doc.createdAt).toLocaleDateString(i18n.language)}
              </span>
            </span>
            <span className="shrink-0 text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded font-bold uppercase tracking-tight">
              {t(`format.${doc.sourceFormat}`)}
            </span>
          </label>
        )
      })}
    </div>
  )
}
