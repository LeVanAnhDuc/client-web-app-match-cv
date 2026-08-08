import type { PropsWithChildren } from "react";

/**
 * Shared page frame — every route body is wrapped in exactly one of these so
 * page width and padding cannot drift per view (design: §4.2). Full-bleed up
 * to 1600px, then centred so text lines stay readable on ultrawide screens.
 */
const PageContainer = ({
  children,
  className = ""
}: PropsWithChildren<{ className?: string }>) => (
  <div className={`mx-auto w-full max-w-[1600px] p-4 md:p-6 ${className}`}>
    {children}
  </div>
);

export default PageContainer;
