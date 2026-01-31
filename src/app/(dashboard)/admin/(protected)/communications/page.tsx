import { AdminNotificationCenter } from "@/components/admin/admin-notification-center";
import { MessageSquare, Users } from "lucide-react";

export const metadata = {
    title: "Communications | Admin",
    description: "Broadcast messages to users",
};

export default function CommunicationsPage() {
    return (
        <div className="space-y-8 relative">
            <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

            <header className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">Comms Relay</h1>
                </div>
                <p className="text-zinc-500 font-medium">Broadcast system-wide alerts and manage user notifications.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
                {/* Main Notification Broadcaster */}
                <div className="lg:col-span-2">
                    <AdminNotificationCenter />
                </div>

                {/* Side Panel: Audience Segments (Future Placeholder) */}
                <div className="space-y-6">
                    <div className="p-6 rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-4 w-4 text-purple-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Audience stats</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Total Reachable</span>
                                <span className="font-mono font-bold text-white">--</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Push Enabled</span>
                                <span className="font-mono font-bold text-emerald-400">100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
