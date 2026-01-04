import { FeatureFlagsManager } from "@/components/admin/feature-flags-manager";
import { getAdminFeatureFlags } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  const flags = await getAdminFeatureFlags();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Feature Flags</h1>
        <p className="text-sm text-muted-foreground">
          Manage feature flags for progressive rollout and A/B testing.
        </p>
      </header>

      <FeatureFlagsManager initialFlags={flags} />
    </section>
  );
}
