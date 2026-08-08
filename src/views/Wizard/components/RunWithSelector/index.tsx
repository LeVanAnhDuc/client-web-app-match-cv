import { Button, Select, Tag } from "antd";
import { Plus, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CredentialFormModal from "#/components/CredentialFormModal";
import {
  useAiCredentials,
  useProviders,
  useTestCredential
} from "#/hooks/useAiCredentials";
import type { AiCredentialDto } from "#/types/AiCredentials";

// antd Select treats null/undefined as "nothing selected", so the system-key
// choice needs a real value; it is mapped back to null at the boundary.
const SYSTEM_KEY_VALUE = "__system__";
const MASK = "••••";

/**
 * Newest `lastUsedAt` wins. ISO timestamps sort lexicographically the same way
 * they sort chronologically, and a never-used credential ("") falls to the end.
 */
function pickDefault(credentials: Array<AiCredentialDto>): string | null {
  if (credentials.length === 0) return null;
  const sorted = [...credentials].sort((a, b) =>
    (b.lastUsedAt ?? "").localeCompare(a.lastUsedAt ?? "")
  );
  return sorted[0].id;
}

/**
 * Wizard step 3 — which key this run uses. An untested or failed credential is
 * still selectable: a test that passed yesterday says nothing about today's
 * quota, so blocking here would only create a false sense of safety.
 *
 * Mock: docs/ui-designs/ai-credentials/wizard-step3-run-with.html
 */
const RunWithSelector = ({
  value,
  onChange
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) => {
  const { t } = useTranslation();
  const credentialsQuery = useAiCredentials();
  const providersQuery = useProviders();
  const testMutation = useTestCredential();
  const [addOpen, setAddOpen] = useState(false);

  const credentials = credentialsQuery.data ?? [];
  const selected = credentials.find((c) => c.id === value) ?? null;

  // Reconcile once the list arrives: a selection that no longer exists (the
  // credential was deleted in another tab) must fall back rather than send a
  // dangling id to the server.
  useEffect(() => {
    if (!credentialsQuery.isSuccess) return;
    if (value !== null && credentials.some((c) => c.id === value)) return;
    onChange(
      value === null && credentials.length === 0
        ? null
        : pickDefault(credentials)
    );
  }, [credentialsQuery.isSuccess, credentials, value, onChange]);

  const providerLabel = (id: AiCredentialDto["provider"]) =>
    providersQuery.data?.find((p) => p.id === id)?.label ?? id;

  const options = [
    ...credentials.map((credential) => ({
      value: credential.id,
      label: (
        <span className="flex items-center gap-2">
          <Tag className="!me-0">{providerLabel(credential.provider)}</Tag>
          <span className="truncate">{credential.label}</span>
          <span className="font-mono text-xs text-muted">
            {MASK}
            {credential.keyLast4}
          </span>
        </span>
      )
    })),
    {
      value: SYSTEM_KEY_VALUE,
      label: (
        <span className="flex items-center gap-2">
          <span>{t("credentials.systemKey")}</span>
          <Tag className="!me-0">{t("credentials.systemKeyTag")}</Tag>
        </span>
      )
    }
  ];

  const warning =
    selected === null
      ? null
      : selected.lastTestStatus === null
        ? t("credentials.runWith.untestedWarning")
        : selected.lastTestStatus !== "ok"
          ? t("credentials.runWith.failedWarning")
          : null;

  return (
    <div className="space-y-2 border-b border-line px-4 py-4 md:px-6">
      <p className="text-xs font-semibold tracking-wider text-faint uppercase">
        {t("credentials.runWith.title")}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label={t("credentials.runWith.title")}
          className="min-w-64 flex-1"
          loading={credentialsQuery.isLoading}
          value={value ?? SYSTEM_KEY_VALUE}
          options={options}
          onChange={(next) => onChange(next === SYSTEM_KEY_VALUE ? null : next)}
        />
        <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          {t("credentials.add")}
        </Button>
      </div>

      {warning && (
        <p className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
          <TriangleAlert size={14} />
          {warning}
          <Button
            type="link"
            size="small"
            className="!px-0"
            loading={testMutation.isPending}
            onClick={() => selected && testMutation.mutate(selected.id)}
          >
            {t("credentials.runWith.testNow")}
          </Button>
        </p>
      )}

      <p className="flex items-center gap-2 text-sm text-muted">
        <ShieldCheck size={14} />
        {selected
          ? t("credentials.runWith.privacy", {
              provider: providerLabel(selected.provider)
            })
          : t("credentials.runWith.privacySystem")}
      </p>

      <CredentialFormModal
        open={addOpen}
        credential={null}
        onClose={() => setAddOpen(false)}
        onSaved={(saved) => onChange(saved.id)}
      />
    </div>
  );
};

export default RunWithSelector;
