import { AppShell } from "@/components/layout/app-shell";
import { memberNavigation } from "@/config/navigation";
import { SparkTicker } from "@/components/SparkTicker";
import { AIChatShell } from "@/components/ai/ai-chat-shell";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebarItems={memberNavigation} fallbackRole="member">
      {children}
      <SparkTicker />
      <AIChatShell />
    </AppShell>
  );
}

