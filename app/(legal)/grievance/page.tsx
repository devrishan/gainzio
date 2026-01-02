import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Grievance Officer - Gainzio",
    description: "Contact information for grievance redressal pursuant to Indian IT Rules.",
};

export default function GrievancePage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-foreground">Grievance Redressal</h1>
            <p className="text-sm text-muted-foreground">
                Pursuant to the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
            </p>

            <div className="mt-8 space-y-6 text-muted-foreground">
                <section>
                    <p>
                        Gainzio is committed to resolving user concerns promptly and fairly. If you have any grievance regarding content, payments, or privacy that has not been resolved by our standard support channels, you may contact our appointed Grievance Officer.
                    </p>
                </section>

                <section className="rounded-xl border border-white/10 bg-muted/5 p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Grievance Officer Details</h2>
                    <div className="space-y-2">
                        <p><span className="font-semibold text-foreground">Name:</span> Rishan Kp</p>
                        <p><span className="font-semibold text-foreground">Designation:</span> Compliance & Grievance Officer</p>
                        <p><span className="font-semibold text-foreground">Email:</span> grievance@gainzio.app</p>
                        <p><span className="font-semibold text-foreground">Address:</span> Gainzio Operations, Bangalore, Karnataka, India - 560001</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">Redressal Timeline</h2>
                    <ul className="list-disc pl-5">
                        <li><strong>Acknowledgment:</strong> We will acknowledge your complaint within 24 hours of receipt.</li>
                        <li><strong>Resolution:</strong> We aim to resolve all grievances within 15 days from the date of receipt, subject to the complexity of the issue.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">How to Report</h2>
                    <p>
                        When emailing the Grievance Officer, please include:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>Your registered Phone Number / User ID on Gainzio.</li>
                        <li>A clear description of the issue.</li>
                        <li>Any supporting evidence (screenshots, transaction IDs).</li>
                        <li>Previous Support Ticket ID (if applicable).</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
