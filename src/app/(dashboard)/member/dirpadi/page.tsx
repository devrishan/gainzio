import { MemberProductsClient } from "@/components/member/member-products-client";

export const dynamic = "force-dynamic";

export default function DirpadiPage() {
    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-primary">DIRPADI Winning</h1>
                <p className="text-sm text-muted-foreground">
                    Track your winnings and rewards from DIRPADI tasks.
                </p>
            </header>

            {/* Reusing Product Suggestions as 'Winnings' for now based on status mapping */}
            <MemberProductsClient />
        </section>
    );
}
