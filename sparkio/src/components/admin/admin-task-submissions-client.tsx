"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Filter, XCircle, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import type { TaskSubmission } from "@/services/admin";

const statusBadge: Record<TaskSubmission["status"], string> = {
  SUBMITTED: "bg-primary/10 text-primary",
  REVIEWING: "bg-yellow-500/10 text-yellow-600",
  APPROVED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
  DELETED: "bg-muted/10 text-muted-foreground",
};

interface AdminTaskSubmissionsClientProps {
  submissions: TaskSubmission[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  statusFilter?: string | null;
}

export function AdminTaskSubmissionsClient({ submissions, pagination, statusFilter }: AdminTaskSubmissionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewingProof, setViewingProof] = useState<{ url: string; type: string | null } | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      submission_id,
      new_status,
    }: {
      submission_id: string;
      new_status: "APPROVED" | "REJECTED" | "REVIEWING";
    }) => {
      const response = await fetch("/api/admin/tasks/submissions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id, new_status }),
      });

      const result = await response.json().catch(() => ({ success: false, error: "Unable to update submission." }));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to update submission.");
      }
      return result;
    },
    onSuccess: (_, { new_status }) => {
      toast.success("Submission updated", {
        description: `Submission marked as ${new_status}.`,
      });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Update failed", { description: error.message });
    },
  });

  const setSearchParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    updater(params);
    router.replace(`/admin/tasks?${params.toString()}`);
  };

  const handleFilterChange = (value: string | null) => {
    setSearchParams((params) => {
      if (value) {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      params.delete("page");
    });
  };

  const navigateToPage = (page: number) => {
    setSearchParams((params) => {
      params.set("page", String(page));
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card className="border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Task Submissions</h2>
            <p className="text-sm text-muted-foreground">Review task submissions, approve rewards, and manage quality.</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={statusFilter ?? "all"}
              onChange={(event) => handleFilterChange(event.target.value === "all" ? null : event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No submissions to review right now.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{submission.user.username}</span>
                      <span className="text-xs text-muted-foreground">{submission.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{submission.task.title}</span>
                      <span className="text-xs text-muted-foreground">ID: {submission.task.id.slice(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {submission.task.reward_amount > 0 && (
                        <span className="font-semibold">₹{submission.task.reward_amount.toFixed(2)}</span>
                      )}
                      {submission.task.reward_coins > 0 && (
                        <span className="text-xs text-muted-foreground">{submission.task.reward_coins} coins</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadge[submission.status]}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{formatDate(submission.submitted_at)}</span>
                      {submission.reviewer && (
                        <span className="text-xs text-muted-foreground">by {submission.reviewer.username}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingProof({ url: submission.proof_url, type: submission.proof_type })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {submission.status === "SUBMITTED" || submission.status === "REVIEWING" ? (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={mutation.isPending || submission.status === "APPROVED"}
                            >
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Submission?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will credit ₹{submission.task.reward_amount.toFixed(2)}
                                {submission.task.reward_coins > 0 && ` and ${submission.task.reward_coins} coins`} to{" "}
                                {submission.user.username}&apos;s wallet. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => mutation.mutate({ submission_id: submission.id, new_status: "APPROVED" })}
                              >
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={mutation.isPending || submission.status === "REJECTED"}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will mark the submission as rejected. The user will not receive any rewards. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => mutation.mutate({ submission_id: submission.id, new_status: "REJECTED" })}
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" disabled>
                        {submission.status === "APPROVED" ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <span>
            Showing {(pagination.page - 1) * pagination.per_page + 1}-
            {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => navigateToPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => navigateToPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={!!viewingProof} onOpenChange={(open) => !open && setViewingProof(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Proof Submission</DialogTitle>
            <DialogDescription>View the submitted proof for this task</DialogDescription>
          </DialogHeader>
          {viewingProof && (
            <div className="mt-4">
              {viewingProof.type === "video" ? (
                <video src={viewingProof.url} controls className="w-full rounded-md" />
              ) : (
                <img src={viewingProof.url} alt="Proof" className="w-full rounded-md" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

