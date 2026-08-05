import { Button } from "antd";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DocumentPreview from "#/components/DocumentPreview";
import { useDocument } from "#/hooks/useDocuments";
import { useRunMatch } from "#/hooks/useMatch";
import { useWizardStore } from "#/stores";

/**
 * Wizard step 3 — Review. Renders the ORIGINAL CV and JD files read-only
 * (PDF/DOCX via DocumentPreview, or parsed text for pasted docs) so the user
 * confirms the right documents before matching. No inline editing: Run match
 * uses the already-selected document ids directly. Back returns to step 2.
 * See docs/ui-designs/home-dashboard-library/review-step.html.
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
  const runMatch = useRunMatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunMatch() {
    if (!cvDocId || !jdDocId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await runMatch.mutateAsync({
        cvDocumentId: cvDocId,
        jdDocumentId: jdDocId
      });
      setMatchId(result.id);
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("err.matchFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Guard: reaching step 3 without a JD/CV id → useDocument(null) is disabled
  // and never resolves, so offer a way back instead of hanging on the spinner.
  if (!jdDocId || !cvDocId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 bg-white p-16 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
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

  const isLoadingDocs =
    jdQuery.isLoading || cvQuery.isLoading || !jdQuery.data || !cvQuery.data;

  if (isLoadingDocs) {
    return (
      <div className="flex h-full items-center justify-center gap-3 rounded-xl border border-slate-100 bg-white p-16 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
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
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="shrink-0 border-b border-slate-100 p-6 dark:border-slate-700/50">
        <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">
          {t("wizard.stepReview.title")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("wizard.stepReview.description")}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-slate-700/50">
        <section className="flex min-h-0 flex-col p-6">
          <h3 className="mb-4 shrink-0 text-sm font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
            {t("step.cv")}
          </h3>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/50">
            <DocumentPreview
              docId={cvDocId}
              sourceFormat={cvQuery.data.sourceFormat}
              rawText={cvQuery.data.rawText}
            />
          </div>
        </section>
        <section className="flex min-h-0 flex-col p-6">
          <h3 className="mb-4 shrink-0 text-sm font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
            {t("step.jd")}
          </h3>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/50">
            <DocumentPreview
              docId={jdDocId}
              sourceFormat={jdQuery.data.sourceFormat}
              rawText={jdQuery.data.rawText}
            />
          </div>
        </section>
      </div>

      {error && (
        <p
          role="alert"
          className="px-8 pb-6 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-700/50 dark:bg-slate-800/80">
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={goBack}
          className="!text-slate-500 dark:!text-slate-300"
        >
          {t("action.back")}
        </Button>
        <Button
          type="primary"
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
