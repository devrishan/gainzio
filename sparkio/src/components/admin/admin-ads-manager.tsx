"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Edit2, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

import type { AdminAd } from "@/services/admin";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const adSchema = z.object({
  name: z.string().min(3),
  ad_placement_id: z.string().min(3),
  ad_code_snippet: z.string().min(5),
  is_active: z.boolean().optional(),
});

type AdFormValues = z.infer<typeof adSchema>;

interface AdminAdsManagerProps {
  ads: AdminAd[];
}

export function AdminAdsManager({ ads }: AdminAdsManagerProps) {
  const router = useRouter();
  const [selectedAd, setSelectedAd] = useState<AdminAd | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      name: "",
      ad_placement_id: "",
      ad_code_snippet: "",
      is_active: true,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      ad_placement_id: "",
      ad_code_snippet: "",
      is_active: true,
    });
    setSelectedAd(null);
  };

  const createMutation = useMutation({
    mutationFn: async (values: AdFormValues) => {
      const response = await fetch("/api/admin/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({ success: false, error: "Unable to create ad." }));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to create ad.");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Ad created");
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Create failed", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: AdFormValues & { id: number }) => {
      const response = await fetch("/api/admin/ads/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({ success: false, error: "Unable to update ad." }));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to update ad.");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Ad updated");
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Update failed", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch("/api/admin/ads/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({ success: false, error: "Unable to delete ad." }));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to delete ad.");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Ad deleted");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
    },
  });

  const onSubmit = (values: AdFormValues) => {
    if (selectedAd) {
      updateMutation.mutate({ ...values, id: selectedAd.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const openForEdit = (ad: AdminAd) => {
    setSelectedAd(ad);
    form.reset({
      name: ad.name,
      ad_placement_id: ad.ad_placement_id,
      ad_code_snippet: ad.ad_code_snippet,
      is_active: ad.is_active,
    });
    setIsDialogOpen(true);
  };

  const openForCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <Card className="border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 p-4 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Ad Placements</h2>
          <p className="text-sm text-muted-foreground">Manage snippets that appear across the Sparkio platform.</p>
        </div>
        <Button onClick={openForCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Ad
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Placement</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No ads configured yet. Create your first placement.
              </TableCell>
            </TableRow>
          ) : (
            ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.name}</TableCell>
                <TableCell className="text-muted-foreground">{ad.ad_placement_id}</TableCell>
                <TableCell>
                  {ad.is_active ? (
                    <span className="text-sm font-medium text-success">Active</span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">Inactive</span>
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openForEdit(ad)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(ad.id)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent onEscapeKeyDown={resetForm} onCloseAutoFocus={resetForm}>
          <DialogHeader>
            <DialogTitle>{selectedAd ? "Edit Ad" : "Create Ad"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dashboard Sidebar Promo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ad_placement_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement ID</FormLabel>
                    <FormControl>
                      <Input placeholder="dashboard_sidebar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ad_code_snippet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Snippet</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="<div class='ad-card'>...</div>" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                      <p className="text-xs text-muted-foreground">Toggle to activate or pause this placement.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedAd ? "Save changes" : "Create ad"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

