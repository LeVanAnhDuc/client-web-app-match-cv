import { createFileRoute } from "@tanstack/react-router";
import DocumentLibrary from "#/views/DocumentLibrary";

export const Route = createFileRoute("/_app/cv")({
  component: () => <DocumentLibrary kind="CV" />
});
