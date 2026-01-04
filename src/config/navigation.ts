export type NavigationIcon =
  | "dashboard"
  | "referrals"
  | "withdraw"
  | "ads"
  | "admins"
  | "members"
  | "security"
  | "submissions"
  | "maintenance"
  | "profile";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
};

export const memberNavigation: NavigationItem[] = [
  { href: "/member/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/member/tasks", label: "Tasks", icon: "dashboard" },
  { href: "/member/referrals", label: "Referrals", icon: "referrals" },
  { href: "/member/withdraw", label: "Withdraw", icon: "withdraw" },
  { href: "/member/settings", label: "Profile", icon: "profile" },
];

export const adminNavigation: NavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/submissions", label: "Submissions", icon: "submissions" },
  { href: "/admin/referrals", label: "Referrals", icon: "referrals" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "withdraw" },
  { href: "/admin/ads", label: "Ads", icon: "ads" },
  { href: "/admin/admins", label: "Admins", icon: "admins" },
  { href: "/admin/members", label: "Members", icon: "members" },
  { href: "/admin/security", label: "Security", icon: "security" },
  { href: "/admin/maintenance", label: "Maintenance", icon: "maintenance" },
];

