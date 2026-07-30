import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "#/i18n/config";
import Sidebar from "../index";

function renderSidebar() {
  const rootRoute = createRootRoute({ component: Sidebar });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] })
  });
  return render(<RouterProvider router={router} />);
}

describe("Sidebar", () => {
  it("renders the 4 nav links with accessible names (en)", async () => {
    renderSidebar();

    expect(await screen.findByRole("link", { name: /home/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /match cv.jd/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /saved cvs/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /saved jds/i })).toBeDefined();
  });
});
