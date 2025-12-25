"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetRoles?: string[];
}

const flagSchema = z.object({
  key: z.string().min(1, "Key is required").max(100),
  enabled: z.boolean().default(true),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  targetUsers: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
});

type FlagFormValues = z.infer<typeof flagSchema>;

async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const response = await fetch("/api/admin/feature-flags", {
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch feature flags");
  }
  const data = await response.json();
  return data.flags;
}

async function createFeatureFlag(flag: FlagFormValues): Promise<void> {
  const response = await fetch("/api/admin/feature-flags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(flag),
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create feature flag");
  }
}

async function updateFeatureFlag(key: string, updates: Partial<FeatureFlag>): Promise<void> {
  const response = await fetch(`/api/admin/feature-flags/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update feature flag");
  }
}

async function deleteFeatureFlag(key: string): Promise<void> {
  const response = await fetch(`/api/admin/feature-flags/${key}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete feature flag");
  }
}

export function FeatureFlagsManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flags, isLoading, error } = useQuery<FeatureFlag[]>({
    queryKey: ["featureFlags"],
    queryFn: getFeatureFlags,
  });

  const createMutation = useMutation({
    mutationFn: createFeatureFlag,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feature flag created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, updates }: { key: string; updates: Partial<FeatureFlag> }) =>
      updateFeatureFlag(key, updates),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feature flag updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeatureFlag,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feature flag deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<FlagFormValues>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      key: "",
      enabled: true,
      rolloutPercentage: 100,
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-48" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load feature flags</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Feature Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag to control feature rollout
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flag Key</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., GAMIFICATION_ENABLED" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Enabled</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable this feature flag
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rolloutPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rollout Percentage (0-100)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Flag"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Manage feature flags for progressive rollout</CardDescription>
        </CardHeader>
        <CardContent>
          {flags && flags.length > 0 ? (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{flag.key}</span>
                      <Badge variant={flag.enabled ? "default" : "secondary"}>
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {flag.rolloutPercentage < 100 && (
                        <Badge variant="outline">
                          {flag.rolloutPercentage}% Rollout
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {flag.targetUsers && flag.targetUsers.length > 0 && (
                        <span>Target Users: {flag.targetUsers.length}</span>
                      )}
                      {flag.targetRoles && flag.targetRoles.length > 0 && (
                        <span className="ml-4">
                          Target Roles: {flag.targetRoles.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rollout:</span>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={flag.rolloutPercentage}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          updateMutation.mutate({ key: flag.key, updates: { rolloutPercentage: value } });
                        }}
                        className="w-20"
                        disabled={updateMutation.isPending}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(enabled) =>
                        updateMutation.mutate({ key: flag.key, updates: { enabled } })
                      }
                      disabled={updateMutation.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(flag.key)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No feature flags yet. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

