import { Button } from "antd";
import {
  AlertTriangle,
  CircleCheck,
  Lightbulb,
  Loader2,
  RotateCcw
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionCard from "#/components/SectionCard";
import { useMatchResult } from "#/hooks/useMatch";
import { useProviders } from "#/hooks/useAiCredentials";
import { ApiError } from "#/libs/api";
import { useWizardStore } from "#/stores";

const GAUGE_RADIUS = 70;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

/** Sub-score bar — private presentational helper for {@link StepResult}. */
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-body">{label}</span>
        <span className="text-sm font-bold text-blue-600 dark:text-indigo-400">
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-blue-600 dark:bg-indigo-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** Titled report list (strengths / gaps) — private helper for {@link StepResult}. */
function ReportList({
  icon,
  title,
  items,
  itemIcon
}: {
  icon: React.ReactNode;
  title: string;
  items: Array<string>;
  itemIcon: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-subtle">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-body">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            {itemIcon}
            <p className="text-sm text-body">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Wizard step 4 — Result report from GET /match/:id: overall % gauge,
 * semantic/keyword sub-score bars, matched strengths, gaps and improvement
 * suggestions. See docs/ui-designs/cv-jd-matching-wizard/wizard-step4-result.html.
 */
const StepResult = () => {
  const { t } = useTranslation();
  const matchId = useWizardStore((s) => s.matchId);
  const reset = useWizardStore((s) => s.reset);

  const { data, isLoading, isError, error } = useMatchResult(matchId);
  const providersQuery = useProviders();

  if (isLoading) {
    return (
      <SectionCard
        className="h-full"
        bodyClassName="flex h-full items-center justify-center gap-3 p-8 md:p-16"
      >
        <Loader2 className="animate-spin text-faint" size={20} />
        <p className="font-medium text-faint">{t("result.loading")}</p>
      </SectionCard>
    );
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError && error.status === 503
        ? t("err.matchUnavailable")
        : t("err.matchFailed");

    return (
      <SectionCard
        className="h-full"
        bodyClassName="flex h-full flex-col items-center justify-center gap-4 p-8 md:p-16"
      >
        <p
          role="alert"
          className="text-center font-medium text-red-600 dark:text-red-400"
        >
          {message}
        </p>
        <Button icon={<RotateCcw size={16} />} onClick={reset}>
          {t("action.startOver")}
        </Button>
      </SectionCard>
    );
  }

  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - data.overallScore / 100);
  // Attribution comes from the result row, not from the credential list: the
  // credential may have been deleted or re-pointed since this match ran.
  const providerLabel =
    providersQuery.data?.find((p) => p.id === data.provider)?.label ??
    data.provider;

  return (
    <SectionCard
      fill
      stickyFooter
      className="h-full"
      bodyClassName="p-0"
      footer={
        <>
          <Button
            type="text"
            size="large"
            icon={<RotateCcw size={16} />}
            onClick={reset}
            className="!text-muted"
          >
            {t("action.startOver")}
          </Button>
          <Button type="primary" size="large">
            {t("action.saveReport")}
          </Button>
        </>
      }
    >
      <>
        <div className="flex flex-col items-center gap-6 border-b border-line bg-surface-subtle p-4 md:flex-row md:gap-12 md:p-6">
          <div className="relative size-32 shrink-0 md:size-40">
            <svg className="-rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={GAUGE_RADIUS}
                fill="none"
                className="stroke-line"
                strokeWidth="8"
              />
              <circle
                cx="80"
                cy="80"
                r={GAUGE_RADIUS}
                fill="none"
                className="stroke-blue-600 transition-[stroke-dashoffset] duration-1000 ease-out dark:stroke-indigo-500"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-body">
                {data.overallScore}%
              </span>
              <span className="text-xs font-semibold tracking-wider text-faint uppercase">
                {t("result.overall")}
              </span>
            </div>
          </div>

          <p className="w-full text-center text-sm text-muted lg:text-left">
            {t("credentials.runWith.ranWith")}: {providerLabel} ·{" "}
            {data.chatModel}
          </p>

          <div className="w-full flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ScoreBar
                label={t("result.semantic")}
                value={data.semanticScore}
              />
              <ScoreBar label={t("result.keyword")} value={data.keywordScore} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 md:gap-10 md:p-6 lg:grid-cols-2">
          <ReportList
            icon={
              <CircleCheck
                className="text-green-600 dark:text-green-500"
                size={18}
              />
            }
            title={t("result.strengths")}
            items={data.report.strengths}
            itemIcon={
              <CircleCheck
                className="mt-0.5 shrink-0 text-green-500"
                size={18}
              />
            }
          />
          <ReportList
            icon={
              <AlertTriangle
                className="text-amber-600 dark:text-amber-500"
                size={18}
              />
            }
            title={t("result.gaps")}
            items={data.report.gaps}
            itemIcon={
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-500"
                size={18}
              />
            }
          />
        </div>

        <div className="m-4 mt-0 rounded-xl border border-blue-100 bg-blue-50 p-4 md:m-10 md:mt-0 md:p-6 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-white">
            <Lightbulb size={18} /> {t("result.suggestions")}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.report.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-blue-100 bg-surface p-4 shadow-sm dark:border-indigo-500/20"
              >
                <Lightbulb
                  className="mt-0.5 shrink-0 text-blue-600 dark:text-indigo-400"
                  size={16}
                />
                <p className="text-sm text-body">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="px-4 pb-6 text-center text-xs text-faint md:px-10">
          {t("result.disclaimer")}
        </p>
      </>
    </SectionCard>
  );
};

export default StepResult;
