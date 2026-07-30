import { Link } from "@tanstack/react-router";
import { FileText, FileUser, LayoutDashboard, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";

interface NavItem {
  to: string;
  icon: ComponentType<{ size?: number }>;
  labelKey: string;
  exact?: boolean;
  /** Core-feature entry point — always rendered with the primary accent. */
  prominent?: boolean;
}

// Icon mapping per .claude/uiux/icon-map.md-style convention (nav/navigation).
// `/cv` and `/jd` routes ship in a later task (Task C2) — the links already
// point there so the sidebar is complete now; until then they 404 at runtime.
const NAV_ITEMS: Array<NavItem> = [
  { to: "/", icon: LayoutDashboard, labelKey: "nav.home", exact: true },
  { to: "/wizard", icon: Sparkles, labelKey: "nav.match", prominent: true },
  { to: "/cv", icon: FileUser, labelKey: "nav.savedCvs" },
  { to: "/jd", icon: FileText, labelKey: "nav.savedJds" }
];

const idleClassName =
  "flex items-center gap-3 rounded-md px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700";
const idleActiveClassName =
  "bg-slate-100 text-blue-600 dark:bg-slate-700 dark:text-indigo-400";
const prominentClassName =
  "flex items-center gap-3 rounded-md bg-blue-600 px-3 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500";
const prominentActiveClassName = "ring-2 ring-blue-300 dark:ring-indigo-400";

/** Primary nav — shared by the `>=lg` fixed aside and the `<lg` Drawer (AppShell). */
const Sidebar = () => {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-1 px-4 py-2">
      {NAV_ITEMS.map(({ to, icon: Icon, labelKey, exact, prominent }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact }}
          className={prominent ? prominentClassName : idleClassName}
          activeProps={{
            className: prominent
              ? prominentActiveClassName
              : idleActiveClassName
          }}
        >
          <Icon size={20} />
          <span>{t(labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Sidebar;
