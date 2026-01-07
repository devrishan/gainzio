
import { getAdminMemberById } from "@/services/admin";
import { AdminUserDashboard } from "@/components/admin/admin-user-dashboard";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
    const user = await getAdminMemberById(params.id);

    if (!user) {
        return (
            <div className="p-8 text-center text-neutral-400">
                User not found.
            </div>
        )
    }

    return <AdminUserDashboard user={user} />;
}
