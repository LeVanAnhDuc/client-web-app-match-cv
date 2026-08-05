import { Button, message, Skeleton } from "antd";
import { Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "#/libs/api";
import {
  useDeleteDocument,
  useDocument,
  useRenameDocument,
  useSavedDocuments
} from "#/hooks/useDocuments";
import type { DocumentKind, DocumentSummaryDto } from "#/types/Documents";
import DocumentRow from "../../components/DocumentRow";
import PreviewModal from "../../components/PreviewModal";
import RenameModal from "../../components/RenameModal";

/**
 * Saved-document library organism: lists the current user's saved CVs or JDs
 * and wires the per-row actions (preview / rename / download / delete) to the
 * documents hooks. Presentational rows + dialogs live under `components/`.
 */
const DocumentList = ({ kind }: { kind: DocumentKind }) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const savedQuery = useSavedDocuments(kind);
  const renameMutation = useRenameDocument();
  const deleteMutation = useDeleteDocument();

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<DocumentSummaryDto | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const previewQuery = useDocument(previewId);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        void messageApi.success(t("library.delete.success"));
      },
      onError: (error) => {
        const inUse = error instanceof ApiError && error.status === 409;
        void messageApi.error(
          t(inUse ? "library.delete.inUse" : "library.delete.failed")
        );
      },
      onSettled: () => setDeletingId(null)
    });
  };

  const handleRename = (title: string) => {
    if (!renameTarget) return;
    renameMutation.mutate(
      { id: renameTarget.id, title },
      {
        onSuccess: () => {
          void messageApi.success(t("library.rename.success"));
          setRenameTarget(null);
        },
        onError: () => {
          void messageApi.error(t("library.rename.failed"));
        }
      }
    );
  };

  const kindKey = kind.toLowerCase() as "cv" | "jd";
  const docs = savedQuery.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      {contextHolder}

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {t(`library.title.${kindKey}`)}
        </h1>
        {!savedQuery.isLoading && !savedQuery.isError && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("library.subtitle", { count: docs.length })}
          </p>
        )}
      </header>

      {savedQuery.isLoading && <Skeleton active paragraph={{ rows: 4 }} />}

      {savedQuery.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t("library.loadError")}
        </p>
      )}

      {!savedQuery.isLoading && !savedQuery.isError && docs.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <SearchX className="text-slate-400" size={32} />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t(`library.empty.${kindKey}`)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("library.emptyHint")}
          </p>
          <Link to="/wizard">
            <Button type="primary">{t("library.emptyCta")}</Button>
          </Link>
        </div>
      )}

      {docs.length > 0 && (
        <ul className="space-y-3">
          {docs.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              deleting={deletingId === doc.id}
              onPreview={() => setPreviewId(doc.id)}
              onRename={() => setRenameTarget(doc)}
              onDelete={() => handleDelete(doc.id)}
            />
          ))}
        </ul>
      )}

      <PreviewModal
        open={previewId !== null}
        doc={previewQuery.data}
        loading={previewQuery.isLoading}
        onClose={() => setPreviewId(null)}
      />

      <RenameModal
        open={renameTarget !== null}
        initialTitle={renameTarget?.title ?? ""}
        confirmLoading={renameMutation.isPending}
        onCancel={() => setRenameTarget(null)}
        onConfirm={handleRename}
      />
    </div>
  );
};

export default DocumentList;
