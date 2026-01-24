import { AdminSupportDesk } from "@/components/admin/admin-support-desk";
import { LifeBuoy } from "lucide-react";

export const metadata = {
    title: "Support Desk | Admin",
    description: "Manage member inquiries and tickets",
};

export default function SupportPage() {
    return (
        <div className="space-y-8 relative">
            <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

            <header className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <LifeBuoy className="h-6 w-6 text-indigo-500" />
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">Support Desk</h1>
                </div>
                <p className="text-zinc-500 font-medium">Resolving member issues and tracking inquiries.</p>
            </header>

            <div className="relative z-10">
                <AdminSupportDesk />
            </div>
        </div>
    );
}
