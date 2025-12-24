"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

type UserSession = {
  id: number;
  username: string;
  email: string;
  role: "member" | "admin";
  referral_code: string;
};

type SessionContextValue = {
  user: UserSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refetch: () => void;
  signOut: () => void;
};

const SessionContext = React.createContext<SessionContextValue | undefined>(undefined);

async function fetchSession(): Promise<UserSession | null> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user ?? null;
}

async function logoutRequest() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, status, refetch } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const value: SessionContextValue = React.useMemo(() => {
    const signOut = () =>
      mutation.mutate(undefined, {
        onSuccess: () => {
          queryClient.removeQueries({ queryKey: ["session"] });
          window.location.href = "/login";
        },
      });

    return {
      user: data ?? null,
      status: status === "pending" ? "loading" : data ? "authenticated" : "unauthenticated",
      refetch,
      signOut,
    };
  }, [data, status, refetch, mutation, queryClient]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

