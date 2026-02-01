export default function DesignerDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Designer Overview</h1>
                <p className="text-neutral-400">Welcome back to the studio. Here's what needs your attention.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stat Card 1 */}
                <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-neutral-400">Active Ad Campaigns</h3>
                    </div>
                    <div className="text-2xl font-bold text-white">12</div>
                    <p className="text-xs text-neutral-500 mt-1">+2 launched this week</p>
                </div>

                {/* Stat Card 2 */}
                <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-neutral-400">Pending Creatives</h3>
                    </div>
                    <div className="text-2xl font-bold text-white">4</div>
                    <p className="text-xs text-neutral-500 mt-1">Due within 24 hours</p>
                </div>

                {/* Stat Card 3 */}
                <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-neutral-400">Asset Library</h3>
                    </div>
                    <div className="text-2xl font-bold text-white">142</div>
                    <p className="text-xs text-neutral-500 mt-1">Images, Icons, & Fonts</p>
                </div>
            </div>

            <div className="min-h-[300px] rounded-xl border border-white/10 bg-neutral-900/20 flex flex-col items-center justify-center text-neutral-500 border-dashed">
                <p>Recent activity stream coming soon...</p>
            </div>
        </div>
    );
}
