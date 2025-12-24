import { AdminAdsManager } from "@/components/admin/admin-ads-manager";
import { getAdminAds } from "@/services/admin";

export default async function AdminAdsPage() {
  const ads = await getAdminAds();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Ad Inventory</h1>
        <p className="text-sm text-muted-foreground">Manage placement snippets and activation across the app.</p>
      </header>

      <AdminAdsManager ads={ads} />
    </section>
  );
}

