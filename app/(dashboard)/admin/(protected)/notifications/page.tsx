import { AdminNotificationsClient } from "@/components/admin/admin-notifications-client";

export default function AdminNotificationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Notification Center</h1>
                    <p className="text-neutral-500 mt-1 font-mono text-xs uppercase tracking-widest">
                        Broadcast alerts and messages to users.
                    </p>
                </div>
            </div>

            <AdminNotificationsClient />
        </div>
    );
}
