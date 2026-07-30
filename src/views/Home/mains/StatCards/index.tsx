import { Card, Statistic } from "antd";
import { Award, FileText, FileUser, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSavedDocuments } from "#/hooks/useDocuments";
import { useMatchHistory } from "#/hooks/useMatch";

/** One stat tile — private presentational helper for {@link StatCards}. */
function StatTile({
  testId,
  icon,
  value,
  label,
  subtext,
  loading
}: {
  testId: string;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subtext?: string;
  loading: boolean;
}) {
  return (
    <Card
      data-testid={testId}
      loading={loading}
      className="shadow-sm"
      styles={{ body: { padding: 24 } }}
    >
      <div className="mb-4 rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
        {icon}
      </div>
      <Statistic value={value} />
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-xs font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
          {label}
        </span>
        {subtext && (
          <span className="text-xs text-slate-400 italic dark:text-slate-500">
            {subtext}
          </span>
        )}
      </div>
    </Card>
  );
}

/**
 * 4 stat cards — saved CVs/JDs counts, total matches, highest score (+avg).
 * Responsive: 1 col mobile / 2 col tablet / 4 col desktop.
 * Mock: docs/ui-designs/home-dashboard-library/home.html.
 */
const StatCards = () => {
  const { t } = useTranslation();
  const savedCvs = useSavedDocuments("CV");
  const savedJds = useSavedDocuments("JD");
  const history = useMatchHistory();

  const scores = history.data?.map((match) => match.overallScore) ?? [];
  const highest = scores.length > 0 ? Math.max(...scores) : null;
  const avg =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        )
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        testId="home-stat-saved-cvs"
        icon={<FileUser size={20} />}
        value={savedCvs.data?.length ?? 0}
        label={t("home.stat.savedCvs")}
        loading={savedCvs.isLoading}
      />
      <StatTile
        testId="home-stat-saved-jds"
        icon={<FileText size={20} />}
        value={savedJds.data?.length ?? 0}
        label={t("home.stat.savedJds")}
        loading={savedJds.isLoading}
      />
      <StatTile
        testId="home-stat-total-matches"
        icon={<Zap size={20} />}
        value={history.data?.length ?? 0}
        label={t("home.stat.totalMatches")}
        loading={history.isLoading}
      />
      <StatTile
        testId="home-stat-highest"
        icon={<Award size={20} />}
        value={highest === null ? "—" : `${highest}%`}
        label={t("home.stat.highest")}
        subtext={avg === null ? undefined : t("home.stat.avg", { value: avg })}
        loading={history.isLoading}
      />
    </div>
  );
};

export default StatCards;
