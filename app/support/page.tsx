"use client";

import { FAQSection } from "@/components/marketing/FAQSection";
import React from "react";

export default function SupportPage() {
    return (
        <main className="flex min-h-screen flex-col pt-24">
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-3xl text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Browse our frequently asked questions or get in touch with our team.
                    </p>
                </div>

                {/* Reuse existing FAQ Section which already has a Support Sidebar */}
                <FAQSection />
            </div>
        </main>
    );
}
