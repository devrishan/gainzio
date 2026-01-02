import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community Guidelines - Gainzio",
    description: "Rules for fair play and task completion on Gainzio.",
};

export default function GuidelinesPage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-foreground">Community & Content Guidelines</h1>
            <p className="text-sm text-muted-foreground">Effective Date: January 2, 2025</p>

            <div className="mt-8 space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground">1. Fair Play Policy</h2>
                    <p>
                        Gainzio is a platform for real users completing real tasks. To ensure a fair ecosystem for everyone, we enforce a strict zero-tolerance policy against manipulation.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">2. Task Completion Rules</h2>
                    <ul className="list-disc pl-5">
                        <li><strong>Genuine Interactions:</strong> Only complete tasks you are genuinely interested in. Do not uninstall apps immediately after tracking—this invalidates the task.</li>
                        <li><strong>Accurate Proof:</strong> Upload clear, unedited screenshots when requested. Blurry, cropped, or fake screenshots result in immediate rejection.</li>
                        <li><strong>One Device, One Account:</strong> Do not use multiple devices or parallel space apps to complete the same task multiple times.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">3. Referral Integrity</h2>
                    <p>
                        Referrals must be genuine users. "Self-referring" using your own secondary SIM cards or emulators is prohibited and will lead to a permanent ban.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">4. Zero Tolerance for Fraud</h2>
                    <p>
                        We use automated systems to detect VPNs, proxy servers, and rooted devices. Accounts flagged by these systems are automatically suspended to protect our advertisers and payout efficiency.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">5. Respectful Conduct</h2>
                    <p>
                        Do not use abusive language in support tickets or disputes. We are here to help, but harassment of our support staff will result in account restriction.
                    </p>
                </section>
            </div>
        </div>
    );
}
