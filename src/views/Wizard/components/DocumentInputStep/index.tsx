import { Button } from "antd";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateDocument } from "#/hooks/useDocuments";
import { FILE } from "#/constants";
import type { DocumentKind } from "#/types/Documents";
import type { InputMode } from "#/types/Wizard";
import SaveForReuseButton from "../SaveForReuseButton";
import SavedDocRadioList from "../SavedDocRadioList";
import UploadPasteTabs from "../UploadPasteTabs";

/**
 * Shared step body for wizard step 1 (JD) and step 2 (CV): Upload/Paste tabs,
 * reuse radio list, an explicit "save for reuse" button (opens a named-save
 * modal), and a Back/Next footer. Saving is optional and decoupled from Next:
 * Next uses the chosen saved doc, the just-saved doc, or a transient
 * (save:false) doc created from the current input.
 * See docs/ui-designs/cv-jd-matching-wizard/wizard-step2-cv-redesign.html.
 */
const DocumentInputStep = ({
  kind,
  onNext,
  onBack
}: {
  kind: DocumentKind;
  onNext: (docId: string) => void;
  onBack?: () => void;
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<InputMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDocument = useCreateDocument();

  const stepCopyKey = kind === "JD" ? "wizard.stepJd" : "wizard.stepCv";
  const reuseKey = kind === "JD" ? "jd" : "cv";

  const hasNewInput =
    mode === "upload" ? file !== null : pastedText.trim().length > 0;
  const canSubmit = selectedSavedId !== null || hasNewInput;

  /** Editing the input invalidates a prior save/selection from this session. */
  function resetDerived() {
    setSelectedSavedId(null);
    setSavedId(null);
    setSavedTitle(null);
    setValidationError(null);
  }

  function handleModeChange(next: InputMode) {
    setMode(next);
    resetDerived();
  }

  function handleFileChange(next: File | null) {
    if (next) {
      if (!FILE.ALLOWED_PATTERN.test(next.name)) {
        setValidationError(t("err.fileType"));
        return;
      }
      if (next.size > FILE.MAX_SIZE_BYTES) {
        setValidationError(t("err.fileSize", { max: FILE.MAX_SIZE_LABEL }));
        return;
      }
    }
    setFile(next);
    resetDerived();
  }

  function handlePastedTextChange(next: string) {
    setPastedText(next);
    resetDerived();
  }

  function handleSelectSaved(id: string) {
    setSelectedSavedId(id);
    setFile(null);
    setPastedText("");
    setSavedId(null);
    setSavedTitle(null);
    setValidationError(null);
  }

  /** Create a document from the current input (saved or transient). */
  function createFromInput(save: boolean, title?: string) {
    return mode === "upload" && file
      ? createDocument.mutateAsync({ mode: "file", kind, file, save, title })
      : createDocument.mutateAsync({
          mode: "paste",
          kind,
          sourceText: pastedText.trim(),
          save,
          title
        });
  }

  async function handleSaveForReuse(name: string) {
    const created = await createFromInput(true, name);
    setSavedId(created.id);
    setSavedTitle(name);
  }

  async function handleNext() {
    if (selectedSavedId) {
      onNext(selectedSavedId);
      return;
    }
    if (!hasNewInput) {
      setValidationError(t("err.empty", { kind: t(`step.${reuseKey}`) }));
      return;
    }
    if (savedId) {
      onNext(savedId);
      return;
    }
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const created = await createFromInput(false);
      onNext(created.id);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : t("err.parseFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm lg:h-full lg:overflow-hidden dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="shrink-0 border-b border-slate-100 p-4 md:p-6 dark:border-slate-700/50">
        <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          {t(`${stepCopyKey}.title`)}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(`${stepCopyKey}.description`)}
        </p>
      </div>

      <div className="p-4 md:p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <UploadPasteTabs
          mode={mode}
          onModeChange={handleModeChange}
          file={file}
          onFileChange={handleFileChange}
          pastedText={pastedText}
          onPastedTextChange={handlePastedTextChange}
          maxSizeLabel={FILE.MAX_SIZE_LABEL}
        />

        {hasNewInput && (
          <div className="mb-8">
            <SaveForReuseButton
              kind={kind}
              savedTitle={savedTitle}
              onSave={handleSaveForReuse}
            />
          </div>
        )}

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
            {t(`reuse.${reuseKey}.title`)}
          </h3>
          <SavedDocRadioList
            kind={kind}
            selectedId={selectedSavedId}
            onSelect={handleSelectSaved}
          />
        </div>

        {validationError && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-600 dark:text-red-400"
          >
            {validationError}
          </p>
        )}
      </div>

      {/* Sticky below lg so the primary CTA stays reachable while the page
          scrolls; static at lg where the shell locks to the viewport. */}
      <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6 lg:static lg:bg-slate-50/50 lg:pb-6 dark:border-slate-700/50 dark:bg-slate-800 lg:dark:bg-slate-800/80">
        <Button
          type="text"
          size="large"
          disabled={!onBack}
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
          className="!text-slate-500 dark:!text-slate-300"
        >
          {t("action.back")}
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={!canSubmit}
          loading={isSubmitting || createDocument.isPending}
          onClick={() => void handleNext()}
          iconPosition="end"
          icon={<ArrowRight size={16} />}
        >
          {t("action.next")}
        </Button>
      </div>
    </div>
  );
};

export default DocumentInputStep;
