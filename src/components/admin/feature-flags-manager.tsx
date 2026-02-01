"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AlertCircle, Plus, Trash2, Zap, Radio, Activity, Terminal } from "lucide-react";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

export function FeatureFlagsManager({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flags, isLoading, error } = useQuery<FeatureFlag[]>({
    queryKey: ["featureFlags"],
    queryFn: getFeatureFlags,
    initialData: initialFlags,
  });

  const createMutation = useMutation({
    mutationFn: createFeatureFlag,
    onSuccess: () => {
      toast({
        title: "System Update",
        description: "New protocol initialized successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Protocol Error",
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
        title: "System Update",
        description: "Protocol parameters adjusted",
      });
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Protocol Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeatureFlag,
    onSuccess: () => {
      toast({
        title: "System Purge",
        description: "Protocol successfully terminated",
      });
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purge Failed",
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

  if (isLoading) return <LoadingSkeleton className="h-96" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-red-500/20 bg-red-500/5 rounded-2xl">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-red-400 font-mono uppercase tracking-widest">System Failure</h3>
        <p className="text-sm text-red-500/70 mt-2 font-mono">{error instanceof Error ? error.message : "Critical Error detected"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between p-6 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 blur-[100px]" />

        <div className="relative z-10 space-y-1">
          <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3">
            <Zap className="w-6 h-6 animate-pulse" />
            System Protocols
          </h2>
          <p className="text-xs font-mono text-cyan-600/80">
            ACTIVE_NODES: <span className="text-cyan-400">{flags?.length || 0}</span> | STATUS: <span className="text-emerald-400">OPERATIONAL</span>
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold font-mono text-xs uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:text-cyan-300 relative group overflow-hidden">
              <span className="relative z-10 flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Init New Protocol
              </span>
              <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-950 border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 font-mono uppercase">Initialize Feature Flag</DialogTitle>
              <DialogDescription className="text-cyan-600/70 font-mono text-xs">
                Define parameters for new system capability rollout.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
                className="space-y-4 font-mono"
              >
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs uppercase">Protocol Key</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. QUANTUM_COMPUTE_V2" className="bg-black/50 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-900 focus-visible:ring-cyan-500/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-cyan-400 text-xs uppercase">Active State</FormLabel>
                        <div className="text-[10px] text-cyan-600">
                          Initial deployment status
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-cyan-500" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rolloutPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-500 text-xs uppercase">Deployment Vector (0-100%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="bg-black/50 border-cyan-500/30 text-cyan-400 font-bold"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    className="text-neutral-500 hover:text-white hover:bg-white/5"
                  >
                    Abort
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-wide">
                    {createMutation.isPending ? "Initializing..." : "Execute Init"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {flags && flags.length > 0 ? (
          flags.map((flag, idx) => (
            <motion.div
              key={flag.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              {/* Tech decoration lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-[80%] bg-cyan-500 transition-all duration-300" />

              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md hover:bg-cyan-950/10 hover:border-cyan-500/30 transition-all ml-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-mono font-bold text-neutral-300 group-hover:text-cyan-100 tracking-tight text-lg">{flag.key}</span>
                    <Badge variant="outline" className={cn("font-mono text-[10px] h-5 border-0", flag.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/10 text-red-500")}>
                      {flag.enabled ? "ONLINE" : "OFFLINE"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-cyan-900/60 group-hover:text-cyan-600/80">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      ROLLOUT: {flag.rolloutPercentage}%
                    </span>
                    {flag.targetUsers?.length ? <span>TARGET_USERS: [{flag.targetUsers.length}]</span> : null}
                    {flag.targetRoles?.length ? <span>TARGET_ROLES: [{flag.targetRoles.join(",")}]</span> : null}
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 md:mt-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase">Vector</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={flag.rolloutPercentage}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                        updateMutation.mutate({ key: flag.key, updates: { rolloutPercentage: value } });
                      }}
                      className="w-12 h-6 p-0 text-center bg-transparent border-none text-cyan-200 text-xs font-mono focus-visible:ring-0"
                      disabled={updateMutation.isPending}
                    />
                    <span className="text-xs text-cyan-700">%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Radio className={cn("w-4 h-4", flag.enabled ? "text-emerald-500 animate-pulse" : "text-neutral-700")} />
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(enabled) =>
                        updateMutation.mutate({ key: flag.key, updates: { enabled } })
                      }
                      disabled={updateMutation.isPending}
                      className="data-[state=checked]:bg-cyan-500"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(flag.key)}
                    disabled={deleteMutation.isPending}
                    className="hover:bg-red-500/20 hover:text-red-400 text-neutral-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
            <p className="font-mono text-sm text-neutral-500 uppercase">System Idle. No active protocols.</p>
          </div>
        )}
      </div>
    </div>
  );
}
