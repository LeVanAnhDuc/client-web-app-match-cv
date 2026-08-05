import { Button, Input } from "antd";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateDocument, useDocument } from "#/hooks/useDocuments";
import { useRunMatch } from "#/hooks/useMatch";
import { useWizardStore } from "#/stores";
import type { DocumentKind } from "#/types/Documents";

const { TextArea } = Input;

/**
 * Wizard step 3 — Review parsed CV/JD rawText before matching. Two editable
 * TextAreas prefilled from GET /documents/:id. Back returns to step 2 (and
 * from there step 1) to import a new document. Run match: any pane whose
 * text differs from the originally-loaded rawText is persisted as a fresh
 * transient (save:false) document first, then POST /match is called.
 * See docs/ui-designs/cv-jd-matching-wizard/wizard-step3-review.html.
 */
const StepReview = () => {
  const { t } = useTranslation();
  const jdDocId = useWizardStore((s) => s.jdDocId);
  const cvDocId = useWizardStore((s) => s.cvDocId);
  const setMatchId = useWizardStore((s) => s.setMatchId);
  const goNext = useWizardStore((s) => s.goNext);
  const goBack = useWizardStore((s) => s.goBack);

  const jdQuery = useDocument(jdDocId);
  const cvQuery = useDocument(cvDocId);

  const [jdText, setJdText] = useState("");
  const [cvText, setCvText] = useState("");
  const jdInitialized = useRef(false);
  const cvInitialized = useRef(false);

  useEffect(() => {
    if (jdQuery.data && !jdInitialized.current) {
      setJdText(jdQuery.data.rawText);
      jdInitialized.current = true;
    }
  }, [jdQuery.data]);

  useEffect(() => {
    if (cvQuery.data && !cvInitialized.current) {
      setCvText(cvQuery.data.rawText);
      cvInitialized.current = true;
    }
  }, [cvQuery.data]);

  const createDocument = useCreateDocument();
  const runMatch = useRunMatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoadingDocs =
    jdQuery.isLoading || cvQuery.isLoading || !jdQuery.data || !cvQuery.data;

  /** Reuse the loaded document id unless its text was edited in this step. */
  async function resolveDocId(
    originalId: string | null,
    originalText: string | undefined,
    editedText: string,
    kind: DocumentKind
  ): Promise<string> {
    if (originalId && editedText === originalText) {
      return originalId;
    }
    const created = await createDocument.mutateAsync({
      mode: "paste",
      kind,
      sourceText: editedText,
      save: false
    });
    return created.id;
  }

  async function handleRunMatch() {
    setError(null);
    setIsSubmitting(true);
    try {
      const jdId = await resolveDocId(
        jdDocId,
        jdQuery.data?.rawText,
        jdText,
        "JD"
      );
      const cvId = await resolveDocId(
        cvDocId,
        cvQuery.data?.rawText,
        cvText,
        "CV"
      );
      const result = await runMatch.mutateAsync({
        cvDocumentId: cvId,
        jdDocumentId: jdId
      });
      setMatchId(result.id);
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("err.matchFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Guard: reaching step 3 without a JD/CV id (e.g. corrupted persisted state
  // or a direct setStep) → useDocument(null) is disabled and never resolves,
  // so without this the spinner below would hang forever. Offer a way back.
  if (!jdDocId || !cvDocId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-8 shadow-sm md:p-16 dark:border-slate-700/50 dark:bg-slate-800/50">
        <p
          role="alert"
          className="font-medium text-slate-500 dark:text-slate-400"
        >
          {t("review.missingDocs")}
        </p>
        <Button icon={<ArrowLeft size={16} />} onClick={goBack}>
          {t("action.back")}
        </Button>
      </div>
    );
  }

  if (isLoadingDocs) {
    return (
      <div className="flex h-full items-center justify-center gap-3 rounded-xl border border-slate-100 bg-white p-8 shadow-sm md:p-16 dark:border-slate-700/50 dark:bg-slate-800/50">
        <Loader2
          className="animate-spin text-slate-400 dark:text-slate-500"
          size={20}
        />
        <p className="font-medium text-slate-400 dark:text-slate-500">
          {t("review.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm lg:h-full lg:overflow-hidden dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-slate-100 p-4 md:flex-row md:items-center md:p-6 dark:border-slate-700/50">
        <div>
          <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">
            {t("wizard.stepReview.title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("wizard.stepReview.description")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2 text-amber-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
          <span className="text-xs font-medium">{t("review.hint")}</span>
        </div>
      </div>

      {/* Side by side at lg; stacked below, where each pane gets a fixed 40vh
          height and scrolls internally (design.md §6.4). */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-slate-700/50">
        <div className="flex flex-col p-4 md:p-6 lg:min-h-0">
          <h3 className="mb-4 shrink-0 text-sm font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
            {t("step.jd")}
          </h3>
          <TextArea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            autoSize={false}
            className="!h-[40vh] !min-h-56 !resize-none !rounded-xl lg:!h-full lg:!min-h-0 lg:!flex-1"
            aria-label={t("step.jd")}
          />
        </div>
        <div className="flex flex-col p-4 md:p-6 lg:min-h-0">
          <h3 className="mb-4 shrink-0 text-sm font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
            {t("step.cv")}
          </h3>
          <TextArea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            autoSize={false}
            className="!h-[40vh] !min-h-56 !resize-none !rounded-xl lg:!h-full lg:!min-h-0 lg:!flex-1"
            aria-label={t("step.cv")}
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="px-8 pb-6 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6 lg:static lg:bg-slate-50/50 lg:pb-6 dark:border-slate-700/50 dark:bg-slate-800 lg:dark:bg-slate-800/80">
        <Button
          type="text"
          size="large"
          icon={<ArrowLeft size={16} />}
          onClick={goBack}
          className="!text-slate-500 dark:!text-slate-300"
        >
          {t("action.back")}
        </Button>
        <Button
          type="primary"
          size="large"
          loading={isSubmitting}
          onClick={() => void handleRunMatch()}
          icon={<Sparkles size={16} />}
        >
          {t("action.runMatch")}
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
