import { Navbar } from "@/components/marketing/Navbar";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-24 pb-12 lg:pt-32">
                <div className="container mx-auto max-w-4xl px-6 lg:px-12">
                    {children}
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
