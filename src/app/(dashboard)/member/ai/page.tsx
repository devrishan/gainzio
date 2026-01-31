import { AIChatShell } from "@/components/ai/ai-chat-shell";

export const metadata = {
    title: "Gainzio AI | Premium Intelligence",
    description: "Advanced AI assistance for your workflow.",
};

export default function AIPage() {
    return (
        <div className="h-[calc(100vh-4rem)] -m-4 lg:-m-8">
            <AIChatShell />
        </div>
    );
}
