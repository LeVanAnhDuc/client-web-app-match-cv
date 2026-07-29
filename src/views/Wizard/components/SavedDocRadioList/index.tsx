import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSavedDocuments } from "#/hooks/useDocuments";
import type { DocumentKind } from "#/types/Documents";

/**
 * Reuse list for saved JD/CV documents — a radio group of single-line
 * list-rows (never wrapping): radio dot (shrink-0) · middle `min-w-0 flex-1`
 * (title + meta, truncated) · format badge (shrink-0). Native radio inputs
 * (not antd Radio) to avoid the inline-flex label wrapping that broke the
 * layout. Empty-state when nothing saved. See .claude/uiux/standards.md §7.
 */
const SavedDocRadioList = ({
  kind,
  selectedId,
  onSelect
}: {
  kind: DocumentKind;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useSavedDocuments(kind);

  if (isLoading) {
    return null;
  }

  if (!data || data.length === 0) {
    const emptyKey = kind === "JD" ? "reuse.empty.jd" : "reuse.empty.cv";
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 dark:border-slate-700/60 dark:bg-slate-900/30">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600">
          <SearchX size={22} />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {t(emptyKey)}
        </p>
        <p className="mt-1 max-w-[220px] text-center text-xs text-slate-400 dark:text-slate-500">
          {t("reuse.empty.hint")}
        </p>
      </div>
    );
  }

  const groupName = `saved-${kind}`;

  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {data.map((doc) => {
        const selected = doc.id === selectedId;
        return (
          <label
            key={doc.id}
            className={[
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
              selected
                ? "border-blue-500 bg-blue-50/60 dark:border-indigo-500 dark:bg-indigo-500/10"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/60 dark:hover:border-slate-600 dark:hover:bg-slate-900/40"
            ].join(" ")}
          >
            <input
              type="radio"
              name={groupName}
              value={doc.id}
              checked={selected}
              onChange={() => onSelect(doc.id)}
              className="size-4 shrink-0 accent-blue-600 dark:accent-indigo-500"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {doc.title}
              </span>
              <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                {new Date(doc.createdAt).toLocaleDateString(i18n.language)}
              </span>
            </span>
            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-tight text-slate-500 uppercase dark:bg-slate-700 dark:text-slate-300">
              {t(`format.${doc.sourceFormat}`)}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default SavedDocRadioList;
