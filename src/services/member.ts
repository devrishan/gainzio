import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverFetch } from "@/lib/server-api";
import type { Task } from "./member-client";

export type { Task } from "./member-client";
export interface MemberDashboardPayload {
  wallet: {
    balance: number;
    total_earned: number;
    coins: number;
  };
  referrals: {
    total: number;
    verified: number;
    pending: number;
    success_rate: number;
  };
  top_referrers: Array<{
    username: string;
    referral_code: string;
    verified_referrals: number;
    total_earned: number;
  }>;
  gamification: {
    xp: number;
    rank: string;
    streak: number;
    next_rank: string | null;
    xp_to_next: number;
    progress: number;
  };
}

export interface MemberReferral {
  id: string;
  referred_user: {
    id: string;
    username: string | null;
    email: string | null;
    phone: string;
    created_at: string;
  };
  level: number;
  status: string;
  commission_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  upiId: string;
  requestedAt: string;
  processedAt: string | null;
  notes: string | null;
}

export async function getWithdrawalHistory(): Promise<Withdrawal[]> {
  try {
    const data = await serverFetch<{ success: boolean; withdrawals: Withdrawal[] }>("/api/member/withdraw/history");
    if (!data.success) {
      redirect("/login");
    }
    return data.withdrawals;
  } catch {
    redirect("/login");
  }
}

export async function getMemberDashboard(): Promise<MemberDashboardPayload> {
  try {
    const data = await serverFetch<{
      success: boolean;
      wallet: MemberDashboardPayload["wallet"];
      referrals: MemberDashboardPayload["referrals"];
      top_referrers: MemberDashboardPayload["top_referrers"];
      gamification: MemberDashboardPayload["gamification"];
    }>("/api/member/dashboard");

    if (!data.success) {
      redirect("/login");
    }

    return {
      wallet: data.wallet,
      referrals: data.referrals,
      top_referrers: data.top_referrers,
      gamification: data.gamification,
    };
  } catch {
    redirect("/login");
  }
}

export interface SquadData {
  membersCount: number;
  weeklyGoal: number;
  currentTotal: number;
  remaining: number;
  progressPercent: number;
  isGoalMet: boolean;
  topContributors: Array<{
    userId: string;
    username: string;
    amount: number;
    isSelf: boolean;
  }>;
  weekEndsAt: string;
}

export async function getMemberReferrals(): Promise<MemberReferral[]> {
  try {
    const data = await serverFetch<{ success: boolean; referrals: MemberReferral[] }>("/api/member/referrals");
    if (!data.success) {
      redirect("/login");
    }
    return data.referrals;
  } catch {
    redirect("/login");
  }
}

export async function getMemberSquad(): Promise<SquadData | null> {
  try {
    const data = await serverFetch<{ success: boolean; squad: SquadData }>("/api/member/squad");
    if (!data.success) {
      return null;
    }
    return data.squad;
  } catch {
    return null;
  }
}

export async function getTasks(categoryId?: string, isActive?: boolean): Promise<import("./member-client").Task[]> {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append("category_id", categoryId);
    if (isActive !== undefined) params.append("is_active", isActive ? "1" : "0");
    const query = params.toString();
    const path = `/api/tasks${query ? `?${query}` : ""}`;
    const data = await serverFetch<{ success: boolean; tasks: Task[] }>(path, { auth: false });
    if (!data.success) {
      throw new Error("Failed to fetch tasks");
    }
    return data.tasks;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch tasks");
  }
}

export interface TaskSubmissionResponse {
  message: string;
  submission_id: string;
  task_id: string;
  status: string;
}

export async function submitTask(taskId: string, proofFile: File, notes?: string): Promise<TaskSubmissionResponse> {
  try {
    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("proof", proofFile);
    if (notes) formData.append("notes", notes);

    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/member/tasks/submit`, {
      method: "POST",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to submit task" }));
      throw new Error(error.error || "Failed to submit task");
    }

    const data = (await response.json()) as { success: boolean } & TaskSubmissionResponse;
    if (!data.success) {
      throw new Error("Failed to submit task");
    }

    return {
      message: data.message,
      submission_id: data.submission_id,
      task_id: data.task_id,
      status: data.status,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to submit task");
  }
}
