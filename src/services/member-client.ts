// Client-side API functions (for use in Client Components)
// This file does NOT import any server-only code

export interface Task {
  id: string;
  title: string;
  slug: string;
  description: string;
  reward_amount: number;
  reward_coins: number;
  difficulty: string;
  is_active: boolean;
  max_submissions: number | null;
  expires_at: string | null;
  created_at: string;
  category: {
    name: string;
    slug: string;
  };
  user_submission_count: number;
  can_submit: boolean;
  is_expired: boolean;
  is_locked?: boolean;
  min_rank?: string;
}

// Client-side fetch function
async function clientFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "API request failed");
  }

  return (await response.json()) as T;
}

// Client-side version (for Client Components)
export async function getTasksClient(categoryId?: string, isActive?: boolean): Promise<Task[]> {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append("category_id", categoryId);
    if (isActive !== undefined) params.append("is_active", isActive ? "1" : "0");
    const query = params.toString();
    const path = `/api/tasks${query ? `?${query}` : ""}`;
    const data = await clientFetch<{ success: boolean; tasks: Task[] }>(path);
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

