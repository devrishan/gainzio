"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminSubmission } from "@/services/admin";
import { CheckCircle, Clock, ExternalLink, FileText, XCircle } from "lucide-react";
import { useState } from "react";

interface AdminSubmissionsClientProps {
  submissions: AdminSubmission[];
}

export function AdminSubmissionsClient({ submissions: initialSubmissions }: AdminSubmissionsClientProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; submission: AdminSubmission | null }>({
    open: false,
    submission: null,
  });
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const openReviewDialog = (submission: AdminSubmission, reviewAction: "approve" | "reject") => {
    setReviewDialog({ open: true, submission });
    setAction(reviewAction);
    setRejectionReason("");
    setRejectionNotes("");
  };

  const handleReview = async () => {
    if (!reviewDialog.submission || !action) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/admin/submissions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: reviewDialog.submission.id,
          action,
          rejection_reason: action === "reject" ? rejectionReason : undefined,
          rejection_notes: action === "reject" ? rejectionNotes : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to review submission");
      }

      toast({
        title: action === "approve" ? "Submission Approved" : "Submission Rejected",
        description: data.message,
      });

      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === reviewDialog.submission?.id
            ? {
                ...sub,
                status: action === "approve" ? "approved" : "rejected",
                reviewed_at: new Date().toISOString(),
                rejection_reason: action === "reject" ? rejectionReason : null,
                rejection_notes: action === "reject" ? rejectionNotes : null,
              }
            : sub,
        ),
      );

      setReviewDialog({ open: false, submission: null });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to review submission",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
    };

    const { variant, icon: Icon } = variants[status] || variants.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filterByStatus = (status: string) => submissions.filter((sub) => sub.status === status);

  const pendingSubmissions = filterByStatus("pending");
  const approvedSubmissions = filterByStatus("approved");
  const rejectedSubmissions = filterByStatus("rejected");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSubmissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedSubmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending submissions</p>
              </CardContent>
            </Card>
          ) : (
            pendingSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{submission.task_title}</CardTitle>
                      <CardDescription>
                        Submitted by {submission.user_username} ({submission.user_email})
                      </CardDescription>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rewards:</span>
                      <span>
                        ₹{submission.task_reward_money} • {submission.task_reward_coins} coins • {submission.task_reward_xp} XP
                      </span>
                    </div>
                    {submission.user_product_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product:</span>
                        <span>{submission.user_product_name} ({submission.user_product_order_id})</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 rounded-lg bg-muted p-4">
                    <h4 className="font-medium text-sm">Proof Submitted</h4>
                    {submission.proof_text && (
                      <p className="text-sm">{submission.proof_text}</p>
                    )}
                    {submission.proof_link && (
                      <a
                        href={submission.proof_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Link
                      </a>
                    )}
                    {submission.proof_notes && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {submission.proof_notes}
                      </div>
                    )}
                    {submission.proof_file_count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        {submission.proof_file_count} file(s) attached
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => openReviewDialog(submission, "approve")}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openReviewDialog(submission, "reject")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{submission.task_title}</CardTitle>
                    <CardDescription>
                      {submission.user_username} • Approved on {new Date(submission.reviewed_at!).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{submission.task_title}</CardTitle>
                    <CardDescription>
                      {submission.user_username} • Rejected on {new Date(submission.reviewed_at!).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              {(submission.rejection_reason || submission.rejection_notes) && (
                <CardContent>
                  <div className="rounded-lg bg-destructive/10 p-4 space-y-2">
                    {submission.rejection_reason && (
                      <div className="text-sm">
                        <strong>Reason:</strong> {submission.rejection_reason}
                      </div>
                    )}
                    {submission.rejection_notes && (
                      <div className="text-sm">
                        <strong>Notes:</strong> {submission.rejection_notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, submission: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve" : "Reject"} Submission</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "User will receive rewards and the submission will be marked as approved."
                : "Please provide a reason for rejection to help the user improve."}
            </DialogDescription>
          </DialogHeader>

          {action === "reject" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger id="rejection-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invalid_proof">Invalid Proof</SelectItem>
                    <SelectItem value="incomplete">Incomplete Information</SelectItem>
                    <SelectItem value="quality">Poor Quality</SelectItem>
                    <SelectItem value="duplicate">Duplicate Submission</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="rejection-notes"
                  placeholder="Provide specific feedback..."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ open: false, submission: null })}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={processing || (action === "reject" && !rejectionReason)}
              variant={action === "approve" ? "default" : "destructive"}
            >
              {processing ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
