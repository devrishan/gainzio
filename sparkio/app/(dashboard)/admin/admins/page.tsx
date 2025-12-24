export default function AdminManagementPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Management</h1>
        <p className="text-sm text-muted-foreground">
          Create, update, and deactivate admin accounts to control platform access.
        </p>
      </header>

      <div className="rounded-lg border border-dashed border-muted-foreground/20 p-6 text-sm text-muted-foreground">
        Admin CRUD tooling is coming soon. In the meantime, you can seed or update admins directly in the database.
      </div>
    </section>
  );
}


