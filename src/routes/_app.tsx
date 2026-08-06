import { Outlet, createFileRoute } from "@tanstack/react-router";
import AppShell from "#/views/AppShell";

export const Route = createFileRoute("/_app")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  )
});
