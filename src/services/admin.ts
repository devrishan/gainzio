import { redirect } from "next/navigation";

import { serverFetch } from "@/lib/server-api";

export interface AdminDashboardMetrics {
  metrics: {
    total_users: number;
    new_users_24h: number;
    active_users_24h: number;
    pending_withdrawals: {
      count: number;
      amount: number;
    };
    total_earnings_paid: number;
    revenue_24h: number;
  };
}

export interface AdminReferral {
  id: number;
  status: "pending" | "verified" | "rejected";
  commission_amount: number;
  created_at: string;
  updated_at: string | null;
  referrer: {
    username: string;
    email: string;
  };
  referred: {
    username: string;
    email: string;
  };
}

export interface AdminWithdrawal {
  id: number;
  amount: number;
  status: "pending" | "processed" | "failed" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED";
  upi_id: string;
  created_at: string;
  processed_at: string | null;
  user: {
    username: string;
    email: string;
  };
}

export interface AdminAd {
  id: string;
  name: string;
  ad_placement_id: string;
  ad_code_snippet: string;
  is_active: boolean;
}

export interface AdminSubmission {
  id: number;
  status: "SUBMITTED" | "REVIEWING" | "APPROVED" | "REJECTED" | "DELETED";
  task_title: string;
  task_description: string;
  task_reward_coins: number;
  task_reward_money: number;
  task_reward_xp: number;
  user_username: string;
  user_email: string;
  proof_text: string | null;
  proof_link: string | null;
  proof_notes: string | null;
  proof_file_count: number;
  user_product_name: string | null;
  user_product_order_id: string | null;
  rejection_reason: string | null;
  rejection_notes: string | null;
  coins_earned: number;
  money_earned: number;
  xp_earned: number;
  reviewed_at: string | null;
}

export interface ApiTaskSubmission {
  id: string;
  task: {
    id: string;
    title: string;
    slug: string;
    reward_amount: number;
    reward_coins: number;
  };
  user: {
    id: string;
    username: string | null;
    email: string | null;
    phone: string;
  };
  status: "SUBMITTED" | "REVIEWING" | "APPROVED" | "REJECTED" | "DELETED";
  proof_url: string;
  proof_data?: any;
  proof_type: string | null;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer: {
    id: string;
    username: string | null;
  } | null;
}

export type TaskSubmission = ApiTaskSubmission;

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export async function getAdminDashboard(): Promise<AdminDashboardMetrics> {
  try {
    const data = await serverFetch<{ success: boolean } & AdminDashboardMetrics>("/api/admin/dashboard");
    if (!data.success) {
      redirect("/login");
    }
    return {
      metrics: data.metrics,
    };
  } catch {
    redirect("/login");
  }
}

export async function getAdminReferrals(
  searchParams?: Record<string, string>,
): Promise<{
  data: AdminReferral[];
  pagination: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams(searchParams);
    const path = `/api/admin/referrals${query.toString() ? `?${query.toString()}` : ""}`;
    const data = await serverFetch<{ success: boolean; data: AdminReferral[]; pagination: PaginationMeta }>(path);
    if (!data.success) {
      redirect("/login");
    }
    return {
      data: data.data,
      pagination: data.pagination,
    };
  } catch {
    redirect("/login");
  }
}

export async function getAdminWithdrawals(status: string = "pending"): Promise<AdminWithdrawal[]> {
  try {
    const data = await serverFetch<{ success: boolean; withdrawals: AdminWithdrawal[] }>(
      `/api/admin/withdrawals?status=${encodeURIComponent(status)}`,
    );
    if (!data.success) {
      redirect("/login");
    }
    return data.withdrawals;
  } catch {
    redirect("/login");
  }
}

export async function getAdminAds(): Promise<AdminAd[]> {
  try {
    const data = await serverFetch<{ success: boolean; ads: AdminAd[] }>("/api/admin/ads");
    if (!data.success) {
      redirect("/login");
    }
    return data.ads;
  } catch {
    redirect("/login");
  }
}

export async function getAdminSubmissions(status?: string): Promise<AdminSubmission[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const data = await serverFetch<{ success: boolean; submissions: AdminSubmission[] }>(
      `/api/admin/submissions${query}`,
    );
    if (!data.success) {
      redirect("/login");
    }
    return data.submissions;
  } catch {
    redirect("/login");
  }
}

export async function getTaskSubmissions({
  status,
  page,
  per_page,
}: {
  status?: string;
  page: number;
  per_page: number;
}): Promise<{
  data: ApiTaskSubmission[];
  pagination: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    query.set("page", page.toString());
    query.set("per_page", per_page.toString());

    // Assuming existing API supports pagination or we just map standard response
    // Use the new Next.js API route for tasks
    const data = await serverFetch<{ success: boolean; data: ApiTaskSubmission[]; pagination?: PaginationMeta }>(
      `/api/admin/tasks/submissions?${query.toString()}`
    );

    if (!data.success) {
      redirect("/login");
    }

    // Handle potential variations in API response
    const submissions = data.data || [];
    const pagination = data.pagination || {
      page,
      per_page,
      total: submissions.length,
      total_pages: Math.ceil(submissions.length / per_page)
    };

    return {
      data: submissions,
      pagination,
    };
  } catch {
    redirect("/login");
  }
}

export interface AdminUser {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: "USER" | "ADMIN" | "VERIFIER" | "PAYOUT_MANAGER";
  status: string;
  walletBalance: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export async function getAdminMembers(
  searchParams?: Record<string, string>,
): Promise<{
  users: AdminUser[];
  pagination: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams(searchParams);
    const path = `/api/admin/members?${query.toString()}`;
    const data = await serverFetch<{ success: boolean; users: AdminUser[]; pagination: PaginationMeta }>(path);

    if (!data.success) {
      redirect("/login");
    }

    return {
      users: data.users,
      pagination: data.pagination,
    };
  } catch {
    redirect("/login");
  }
}

export interface AdminMemberDetail extends AdminUser {
  totalEarnings: number;
  referralCode: string | null;
  referredBy: {
    id: string;
    username: string | null;
  } | null;
  stats: {
    referrals: number;
    tasks: number;
    withdrawals: number;
  };
}

export async function getAdminMemberById(id: string): Promise<AdminMemberDetail> {
  try {
    const data = await serverFetch<{ success: boolean; user: AdminMemberDetail }>(`/api/admin/members/${id}`);

    if (!data.success) {
      // Return a dummy object or throw, but here we redirect or error handled by page
      throw new Error("Failed to fetch user");
    }

    return data.user;
  } catch {
    // In server components, this might just crash the render, 
    // but usually we want to handle 404s gracefully. 
    // For now, let's allow it to bubble or return null if we change return type.
    // But adhering to the pattern:
    redirect("/admin/members");
  }
}



export interface AdminProductSuggestion {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string | null;
    email: string | null;
  };
  productName: string;
  platform: string;
  category: string | null;
  amount: number | null; // Prism decimal
  orderId: string | null;
  status: string;
  createdAt: string;
  files: any;
}

export async function getAdminSuggestions(): Promise<AdminProductSuggestion[]> {
  try {
    const data = await serverFetch<{ success: boolean; suggestions: any[] }>('/api/admin/suggestions');

    if (!data.success) return [];

    return data.suggestions.map((s: any) => ({
      ...s,
      amount: s.amount ? Number(s.amount) : 0,
      createdAt: s.createdAt,
    }));

  } catch (error) {
    console.error("Failed to get suggestions", error);
    return [];
  }
}

export interface AdminSecurityLog {
  id: string;
  action: string;
  actor: {
    username: string | null;
    role: string;
  } | null;
  entityType: string | null;
  entityId: string | null;
  metadata: any;
  createdAt: string;
}

export async function getAdminSecurityLogs(
  page: number = 1
): Promise<{
  logs: AdminSecurityLog[];
  pagination: PaginationMeta;
}> {
  try {
    const path = `/api/admin/security?page=${page}`;
    const data = await serverFetch<{ success: boolean; logs: AdminSecurityLog[]; pagination: PaginationMeta }>(path);

    if (!data.success) {
      redirect("/login");
    }

    return {
      logs: data.logs,
      pagination: data.pagination,
    };
  } catch {
    redirect("/login");
  }
}

export interface AdminStaff {
  id: string;
  username: string | null;
  email: string | null;
  role: "ADMIN" | "VERIFIER" | "PAYOUT_MANAGER";
  lastLoginAt: string | null;
  createdAt: string;
}

export async function getAdminStaff(): Promise<AdminStaff[]> {
  try {
    const data = await serverFetch<{ success: boolean; staff: AdminStaff[] }>("/api/admin/admins");

    if (!data.success) {
      redirect("/login");
    }

    return data.staff;
  } catch {
    redirect("/login");
  }
}

export interface AdminTask {
  id: string;
  title: string;
  slug: string;
  description: string;
  rewardAmount: number;
  rewardCoins: number;
  difficulty: string;
  isActive: boolean;
  category: {
    name: string;
    slug: string;
  };
  submissionCount: number;
  createdAt: string;
}

export async function getAdminTasks(
  page: number = 1
): Promise<{
  tasks: AdminTask[];
  pagination: PaginationMeta;
}> {
  try {
    const path = `/api/admin/tasks?page=${page}`;
    const data = await serverFetch<{ success: boolean; tasks: AdminTask[]; pagination: PaginationMeta }>(path);

    if (!data.success) {
      redirect("/login");
    }

    return {
      tasks: data.tasks,
      pagination: data.pagination,
    };
  } catch {
    redirect("/login");
  }
}

export interface AdminProduct {
  id: string;
  productName: string;
  platform: string;
  category: string | null;
  amount: number;
  status: string;
  user: {
    username: string | null;
    email: string | null;
  };
  createdAt: string;
}

export async function getAdminProducts(
  searchParams?: Record<string, string>,
): Promise<{
  products: AdminProduct[];
  pagination: PaginationMeta;
}> {
  try {
    const query = new URLSearchParams(searchParams);
    const path = `/api/admin/products?${query.toString()}`;
    const data = await serverFetch<{ success: boolean; products: AdminProduct[]; pagination: PaginationMeta }>(path);

    if (!data.success) {
      redirect("/login");
    }

    return {
      products: data.products,
      pagination: data.pagination,
    };
  } catch {
    redirect("/login");
  }
}

export interface AdminMaintenanceState {
  enabled: boolean;
  message?: string;
  endsAt?: string;
}

export async function getAdminMaintenanceState(): Promise<AdminMaintenanceState> {
  try {
    const data = await serverFetch<{ success: boolean; state: AdminMaintenanceState }>("/api/admin/maintenance");

    if (!data.success) {
      redirect("/login");
    }

    return data.state;
  } catch {
    redirect("/login");
  }
}

export interface AdminFeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetRoles?: string[];
  description?: string;
  updatedAt: string;
}

export async function getAdminFeatureFlags(): Promise<AdminFeatureFlag[]> {
  try {
    const data = await serverFetch<{ success: boolean; flags: AdminFeatureFlag[] }>("/api/admin/feature-flags");

    if (!data.success) {
      redirect("/login");
    }

    return data.flags;
  } catch {
    redirect("/login");
  }
}
