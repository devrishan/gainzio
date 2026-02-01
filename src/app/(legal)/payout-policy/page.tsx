import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payout & Dispute Policy - Gainzio",
    description: "Policy regarding user payouts, withdrawal methods, and dispute resolution.",
};

export default function PayoutPolicyPage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-foreground">Payout & Dispute Policy</h1>
            <p className="text-sm text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="mt-8 space-y-8 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground">1. Withdrawal Eligibility</h2>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Minimum Payout:</strong> The minimum amount eligible for withdrawal is ₹50.</li>
                        <li><strong>Account Status:</strong> Users must have a verified phone number and email address.</li>
                        <li><strong>Activity:</strong> Accounts flagged for suspicious activity or policy violations are not eligible for payouts.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">2. Payout Methods & Timelines</h2>
                    <p className="mt-2">
                        We currently support payouts via <strong>UPI (Unified Payments Interface)</strong>.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Processing Time:</strong> Most UPI withdrawals are processed instantly using IMPS/NEFT rails.</li>
                        <li><strong>Delays:</strong> In rare cases, bank disputes or server downtime may cause delays of up to 24-48 hours.</li>
                        <li><strong>Charges:</strong> Gainzio does not charge a withdrawal fee, but standard banking limits apply.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">3. Task Validation & Earnings</h2>
                    <p className="mt-2">
                        Earnings are credited to your wallet only after successful task verification.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Automated Verification:</strong> Instant for API-integrated tasks.</li>
                        <li><strong>Manual Review:</strong> Screenshot-based tasks are reviewed within 6-24 hours.</li>
                        <li><strong>Rejection:</strong> Earnings may be revoked if proof is found to be fake, duplicate, or manipulated.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">4. Dispute Resolution</h2>
                    <p className="mt-2">
                        If a withdrawal fails or is stuck, please follow these steps:
                    </p>
                    <div className="rounded-xl border border-white/10 bg-muted/5 p-6 mt-4">
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Wait for at least <strong>24 hours</strong> as banking networks often auto-reverse failed transactions.</li>
                            <li>Check your <strong>Transaction History</strong> in the dashboard for the specific error code.</li>
                            <li>Contact support with your <strong>Transaction ID references</strong>.</li>
                        </ol>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">5. Fraud Prevention</h2>
                    <p className="mt-2">
                        Gainzio maintains a strict zero-tolerance policy towards fraud.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Multiple accounts by a single user are strictly prohibited.</li>
                        <li>Use of VPNs, emulators, or automation scripts will lead to a permanent ban.</li>
                        <li>Any attempt to manipulate the referral system will result in wallet forfeiture.</li>
                    </ul>
                </section>

                <section className="pt-4 border-t border-white/10">
                    <p className="text-sm">
                        For further assistance, please reach out to our support team at <a href="mailto:support@gainzio.app" className="text-primary hover:underline">support@gainzio.app</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
