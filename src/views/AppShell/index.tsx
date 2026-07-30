import { Button, Drawer } from "antd";
import { Menu, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PropsWithChildren } from "react";
import Sidebar from "./components/Sidebar";

function Brand() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 p-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 dark:bg-indigo-600">
        <WandSparkles className="text-white" size={18} />
      </div>
      <span className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        {t("appName")}
      </span>
    </div>
  );
}

/**
 * App shell: `>=lg` fixed sidebar; `<lg` header with a hamburger opening the
 * same nav in an antd Drawer. `<main>` owns its own scroll so the shell never
 * scrolls horizontally on narrow viewports (mock: docs/ui-designs/home-dashboard-library/home.html).
 */
const AppShell = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-800">
        <Brand />
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-800">
          <Button
            type="text"
            aria-label={t("nav.openMenu")}
            icon={<Menu size={20} />}
            onClick={() => setIsDrawerOpen(true)}
            className="text-slate-600 dark:text-slate-300"
          />
          <span className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {t("appName")}
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <Drawer
        placement="left"
        closable
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={t("appName")}
        width={256}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar />
      </Drawer>
    </div>
  );
};

export default AppShell;
