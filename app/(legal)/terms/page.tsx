import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Gainzio",
    description: "User agreement and terms of service for the Gainzio platform.",
};

export default function TermsPage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: January 2, 2025</p>

            <div className="mt-8 space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                    <p>
                        Welcome to Gainzio ("Platform"). By accessing or using our website and services, you agree to be bound by these Terms of Service. Gainzio is a performance-based rewards aggregator that connects users with third-party tasks. We are not a bank, investment firm, or employer.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">2. Eligibility</h2>
                    <p>
                        You must be at least 18 years old and a resident of India to use this Platform. By creating an account, you represent that you possess the legal right and ability to enter into this agreement.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">3. Earning & Withdrawals</h2>
                    <ul className="list-disc pl-5">
                        <li><strong>No Guarantee of Income:</strong> Earnings are variable and depend entirely on the availability and successful completion of tasks. We do not guarantee any minimum daily or monthly income.</li>
                        <li><strong>Wallet Balance:</strong> Credits in your Gainzio wallet represent a contingent liability and formally become yours only upon successful withdrawal to your bank account.</li>
                        <li><strong>Withdrawals:</strong> Payouts are processed via UPI. You must provide a valid UPI ID linked to your own bank account. The minimum withdrawal threshold is ₹50.</li>
                        <li><strong>Verification:</strong> All withdrawals are subject to a manual security review (up to 24 hours) to check for fraud or task automation.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">4. Prohibited Activities</h2>
                    <p>
                        You agree NOT to:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>Create multiple accounts to manipulate the referral system.</li>
                        <li>Use VPNs, emulators, or automation scripts to complete tasks.</li>
                        <li>Submit fake or edited screenshots as proof of work.</li>
                        <li>Harass other users or support staff.</li>
                    </ul>
                    <p className="mt-2">
                        Violation of these rules will result in immediate account termination and forfeiture of any wallet balance.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
                    <p>
                        Gainzio serves as an intermediary. We are not responsible for the content, privacy policies, or actions of third-party apps or websites you may visit through our tasks. Your interaction with third-party tasks is at your own risk.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">6. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
                    <p>
                        For legal inquiries, please contact us at legal@gainzio.app.
                    </p>
                </section>
            </div>
        </div>
    );
}
