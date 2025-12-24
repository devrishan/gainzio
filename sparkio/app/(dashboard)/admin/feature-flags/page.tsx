import { FeatureFlagsManager } from "@/components/admin/feature-flags-manager";

export default function AdminFeatureFlagsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Feature Flags</h1>
        <p className="text-sm text-muted-foreground">
          Manage feature flags for progressive rollout and A/B testing.
        </p>
      </header>

      <FeatureFlagsManager />
    </section>
  );
}

