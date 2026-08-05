import type { DocumentKind } from "#/types/Documents";
import DocumentList from "./mains/DocumentList";

/**
 * Saved-document library page — lists the current user's saved CVs (`/cv`) or
 * JDs (`/jd`) with preview / rename / download / delete. Rendered inside the
 * app shell; `kind` is supplied by the route.
 * Mock: docs/ui-designs/home-dashboard-library/library-cv.html.
 */
const DocumentLibrary = ({ kind }: { kind: DocumentKind }) => (
  <DocumentList kind={kind} />
);

export default DocumentLibrary;
