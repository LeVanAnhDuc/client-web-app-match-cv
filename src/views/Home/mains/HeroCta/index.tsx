import { Link } from "@tanstack/react-router";
import { Button } from "antd";
import { FileSearch, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Hero CTA — the single most eye-catching element on the Home dashboard;
 * primary entry point into the matching wizard.
 * Mock: docs/ui-designs/home-dashboard-library/home.html.
 */
const HeroCta = () => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
      <div className="relative z-10 max-w-md">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("home.hero.title")}
        </h1>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          {t("home.hero.subtitle")}
        </p>
        <Link to="/wizard">
          <Button type="primary" size="large" icon={<Sparkles size={18} />}>
            {t("home.hero.cta")}
          </Button>
        </Link>
      </div>
      <FileSearch
        className="pointer-events-none absolute -right-4 -bottom-8 hidden text-slate-100 md:block dark:text-slate-700/30"
        size={160}
      />
    </div>
  );
};

export default HeroCta;
