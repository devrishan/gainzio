import { MemberProductsClient } from '@/components/member/member-products-client';

export default function MemberProductsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">My Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage your product suggestions and use them in tasks.
        </p>
      </header>

      <MemberProductsClient />
    </section>
  );
}

