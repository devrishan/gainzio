import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Gainzio",
    description: "How Gainzio handles your data with privacy and security.",
};

export default function PrivacyPage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: January 2, 2025</p>

            <div className="mt-8 space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground">1. Data Collection</h2>
                    <p>
                        We adhere to the principle of "Data Minimization." We only collect:
                    </p>
                    <ul className="list-disc pl-5">
                        <li><strong>Phone Number</strong>: Strictly for OTP-based secure login and account uniqueness.</li>
                        <li><strong>UPI ID</strong>: Solely for processing your withdrawals.</li>
                        <li><strong>Device ID/IP Address</strong>: For fraud prevention and security logs.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">2. Data Usage</h2>
                    <p>
                        We use your data to:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>Verify your identity and prevent duplicate accounts.</li>
                        <li>Process financial payouts to your bank account.</li>
                        <li>Comply with Indian legal & regulatory requirements (including fraud prevention).</li>
                    </ul>
                    <p className="mt-2 text-foreground font-medium">
                        We DO NOT sell your personal contact number to third-party telemarketers or loan agents.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">3. Data Sharing</h2>
                    <p>
                        We may share limited data only when required by law or to trusted partners:
                    </p>
                    <ul className="list-disc pl-5">
                        <li><strong>Payment Gateways/Banks</strong>: To process your UPI withdrawals.</li>
                        <li><strong>Law Enforcement</strong>: If formally requested via valid legal process under Indian law.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
                    <p>
                        We implement standard industry encryption (SSL/TLS) to protect your data in transit. Your sensitive information is stored in secured database environments with restricted access.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
                    <p>
                        You have the right to request the deletion of your account and associated data. To exercise this right, please contact our support team or use the "Delete Account" option in your dashboard settings. Note that some transaction logs may be retained for regulatory audit trails as required by Indian financial laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">6. Contact Us</h2>
                    <p>
                        For privacy-related concerns, email us at privacy@gainzio.app.
                    </p>
                </section>
            </div>
        </div>
    );
}
