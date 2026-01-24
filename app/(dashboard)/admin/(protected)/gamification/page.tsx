import { AdminShopManager } from "@/components/admin/admin-shop-manager";
import { AdminBadgeManager } from "@/components/admin/admin-badge-manager";
import { TaskCreatorWizard } from "@/components/admin/task-creator-wizard";

export const metadata = {
    title: "Gamification Console | Admin",
    description: "Manage shop items and user scores",
};

export default function GamificationPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Gamification Console</h1>
                    <p className="text-zinc-400">Manage the economy of perks and user engagement.</p>
                </div>
            </div>

            <div className="grid gap-6">
                <TaskCreatorWizard />
                <AdminBadgeManager />
                <AdminShopManager />
            </div>
        </div>
    );
}
