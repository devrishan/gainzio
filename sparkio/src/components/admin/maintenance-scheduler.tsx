"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

type MaintenanceState = {
  enabled: boolean;
  message?: string | null;
  scheduledEnd?: string | null;
};

type MaintenanceResponse = {
  state: MaintenanceState;
};

export function MaintenanceScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [message, setMessage] = useState("");
  const [intentEnabled, setIntentEnabled] = useState(false);

  const maintenanceQuery = useQuery<MaintenanceResponse>({
    queryKey: ["admin-maintenance"],
    queryFn: async () => {
      const response = await fetch("/api/admin/maintenance", { credentials: "include" });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to load maintenance state." }));
        throw new Error(error.error);
      }
      return (await response.json()) as MaintenanceResponse;
    },
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (payload: { enabled: boolean; durationMinutes?: number; message?: string }) => {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to update maintenance state." }));
        throw new Error(error.error);
      }

      return (await response.json()) as MaintenanceResponse;
    },
    onSuccess: () => {
      toast({
        title: "Maintenance updated",
        description: "Login availability has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-maintenance"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentState = maintenanceQuery.data?.state ?? { enabled: false };

  useEffect(() => {
    if (maintenanceQuery.data?.state) {
      setIntentEnabled(maintenanceQuery.data.state.enabled);
      setMessage(maintenanceQuery.data.state.message ?? "");
    }
  }, [maintenanceQuery.data?.state?.enabled, maintenanceQuery.data?.state?.message]);

  const scheduledEndLabel = currentState.scheduledEnd
    ? `${new Date(currentState.scheduledEnd).toLocaleString()} (${formatDistanceToNow(
        new Date(currentState.scheduledEnd),
        { addSuffix: true },
      )})`
    : null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (intentEnabled && durationMinutes <= 0) {
      toast({
        title: "Invalid duration",
        description: "Please provide a duration (in minutes) greater than zero.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({
      enabled: intentEnabled,
      durationMinutes: intentEnabled ? durationMinutes : undefined,
      message: message.trim() ? message.trim() : undefined,
    });
  };

  if (maintenanceQuery.isLoading) {
    return <LoadingSkeleton className="h-72" />;
  }

  if (maintenanceQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>Failed to load maintenance state.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Mode</CardTitle>
        <CardDescription>Temporarily disable logins and configure automatic restoration.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Maintenance status</p>
              <p className="text-sm text-muted-foreground">
                {currentState.enabled ? "Login is currently disabled." : "Login is currently available."}
              </p>
              {scheduledEndLabel && (
                <p className="text-xs text-muted-foreground mt-1">Scheduled to end: {scheduledEndLabel}</p>
              )}
            </div>
            <Switch checked={intentEnabled} onCheckedChange={setIntentEnabled} disabled={mutation.isPending} />
          </div>

          {intentEnabled && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={24 * 60}
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                  disabled={mutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Login will automatically re-open after this duration.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Maintenance message</Label>
                <Textarea
                  id="message"
                  placeholder="Optionally explain what is happening..."
                  value={message}
                  maxLength={280}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={mutation.isPending}
                />
                <p className="text-xs text-muted-foreground">{280 - message.length} characters remaining</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {intentEnabled ? "Schedule maintenance" : "Restore login access"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


