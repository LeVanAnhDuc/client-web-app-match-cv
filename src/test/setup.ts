import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia implementation. antd's responsive helpers
// (Grid/Table breakpoints, ConfigProvider dark-mode detection) call it on
// mount, which otherwise throws "window.matchMedia is not a function" and
// crashes the render tree in any test using those components.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }) as MediaQueryList;
