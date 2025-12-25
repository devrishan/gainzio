import { AppShell } from "@/components/layout/app-shell";
import { memberNavigation } from "@/config/navigation";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebarItems={memberNavigation} fallbackRole="member">
      {children}
    </AppShell>
  );
}

