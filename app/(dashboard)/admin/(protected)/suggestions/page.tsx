
import { getAdminSuggestions } from "@/services/admin";
import SuggestionsFeed from "./suggestions-client";


export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
    const suggestions = await getAdminSuggestions();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Product Suggestions</h1>
                <p className="text-neutral-500 mt-1">Review and manage user-submitted product requests.</p>
            </div>

            <SuggestionsFeed initialData={suggestions} />
        </div>
    );
}
