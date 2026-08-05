import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchDocumentFile } from "#/requests/documents";
import type { SourceFormat } from "#/types/Documents";
// Type-only — erased by `verbatimModuleSyntax`, so this never triggers the
// real (SSR-unsafe) react-pdf module load. See PdfPreview for that guard.
import type {
  Document as PdfDocumentComponent,
  Page as PdfPageComponent
} from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/** Plain parsed-text renderer — SSR-safe, no client-only library involved. */
function TextPreview({ rawText }: { rawText: string }) {
  return (
    <pre className="h-full overflow-auto p-4 text-sm break-words whitespace-pre-wrap text-slate-700 dark:text-slate-300">
      {rawText}
    </pre>
  );
}

type PdfPreviewState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      data: ArrayBuffer;
      Document: typeof PdfDocumentComponent;
      Page: typeof PdfPageComponent;
    };

/**
 * PDF renderer via react-pdf — client-only: pdf.js touches `canvas`/
 * `DOMMatrix` at module-evaluation time and crashes SSR, so the library is
 * NEVER imported at top level. It's loaded with a dynamic `import()` inside
 * an effect (effects never run during SSR) gated behind a mount flag, which
 * also lets the server render a stable placeholder instead of the real
 * viewer (avoids a hydration mismatch).
 */
function PdfPreview({ docId }: { docId: string }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PdfPreviewState>({ status: "loading" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setState({ status: "loading" });

    async function load() {
      try {
        const [reactPdf, data] = await Promise.all([
          import("react-pdf"),
          fetchDocumentFile(docId)
        ]);
        if (cancelled) return;
        reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        setState({
          status: "ready",
          data,
          Document: reactPdf.Document,
          Page: reactPdf.Page
        });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [mounted, docId]);

  if (!mounted || state.status === "loading") {
    return (
      <div
        data-testid="pdf-preview"
        className="flex h-full items-center justify-center gap-2 p-8 text-slate-400 dark:text-slate-500"
      >
        <Loader2 className="animate-spin" size={18} />
        <span className="text-sm">{t("preview.loading")}</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        data-testid="pdf-preview"
        className="flex h-full items-center justify-center p-8"
      >
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t("preview.error")}
        </p>
      </div>
    );
  }

  const { Document, Page } = state;

  return (
    <div
      data-testid="pdf-preview"
      className="flex h-full justify-center overflow-auto p-4"
    >
      <Document file={{ data: state.data }}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}

/**
 * DOCX renderer via docx-preview — client-only: `renderAsync` reads a Blob
 * via zip/DOM APIs unavailable during SSR, so (same as {@link PdfPreview})
 * it's loaded with a dynamic `import()` inside a mount-gated effect rather
 * than imported at module top level.
 */
function DocxPreview({ docId }: { docId: string }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setStatus("loading");

    async function load() {
      try {
        const [{ renderAsync }, data] = await Promise.all([
          import("docx-preview"),
          fetchDocumentFile(docId)
        ]);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        // The DOCX is untrusted user content. Lock docx-preview to its safe
        // posture: styles scoped inside a wrapper (inWrapper) and NO
        // experimental features. docx-preview does not execute scripts by
        // default; do not enable options that would widen this surface.
        await renderAsync(new Blob([data]), containerRef.current, undefined, {
          inWrapper: true,
          experimental: false
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [mounted, docId]);

  if (status === "error") {
    return (
      <div
        data-testid="docx-preview"
        className="flex h-full items-center justify-center p-8"
      >
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t("preview.error")}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="docx-preview" className="h-full overflow-auto p-4">
      {(!mounted || status === "loading") && (
        <div className="flex items-center justify-center gap-2 p-8 text-slate-400 dark:text-slate-500">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">{t("preview.loading")}</span>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}

/**
 * Renders the original file behind a saved document: `react-pdf` for
 * `pdf`, `docx-preview` for `docx` (both client-only, dynamically imported
 * to stay SSR-safe — see {@link PdfPreview}/{@link DocxPreview}), or the
 * plain parsed text otherwise. Shared between the wizard's StepReview and
 * the Document Library preview modal — no business logic.
 */
const DocumentPreview = ({
  docId,
  sourceFormat,
  rawText
}: {
  docId: string;
  sourceFormat: SourceFormat;
  rawText: string;
}) => {
  if (sourceFormat === "pdf") return <PdfPreview docId={docId} />;
  if (sourceFormat === "docx") return <DocxPreview docId={docId} />;
  return <TextPreview rawText={rawText} />;
};

export default DocumentPreview;
