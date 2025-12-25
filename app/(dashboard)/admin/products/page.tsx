import { AdminProductsClient } from '@/components/admin/admin-products-client';

export default function AdminProductsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Product Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Review and convert user product suggestions into tasks.
        </p>
      </header>

      <AdminProductsClient />
    </section>
  );
}

