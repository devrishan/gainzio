"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, CheckCircle2, XCircle, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Submission {
  id: number;
  status: string;
  task_title: string;
  task_reward_coins: number;
  task_reward_money: number;
  task_reward_xp: number;
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
  submitted_at: string;
  reviewed_at: string | null;
}

interface SubmissionsResponse {
  success: boolean;
  submissions: Submission[];
}

export function MemberSubmissionsDashboard() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch("/api/member/submissions.php");
      const data: SubmissionsResponse = await response.json();

      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filterSubmissions = (status: string) => {
    return submissions.filter((sub) => sub.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
      case "REVIEWING":
        return <Clock className="h-5 w-5 text-primary" />;
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getRejectionReasonLabel = (reason: string | null) => {
    if (!reason) return null;

    const labels: Record<string, string> = {
      screenshot_unclear: "Screenshot Unclear",
      wrong_product: "Wrong Product",
      wrong_amount: "Wrong Amount",
      outside_time: "Outside Allowed Time",
      duplicate_proof: "Duplicate Proof",
      wrong_upi: "Wrong UPI",
      offer_expired: "Offer Expired",
      not_eligible: "Not Eligible",
      other: "Other Reason"
    };

    return labels[reason] || reason;
  };

  const SubmissionCard = ({ submission }: { submission: Submission }) => (
    <Card className="spark-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(submission.status)}
            <CardTitle className="text-lg">{submission.task_title}</CardTitle>
          </div>
          <Badge variant="outline">
            {submission.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
          </Badge>
        </div>
        <CardDescription>
          Submitted {new Date(submission.submitted_at).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Reward:</span>
            <span className="ml-2 font-bold text-success">₹{submission.task_reward_money}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Coins:</span>
            <span className="ml-2 font-bold text-primary">{submission.task_reward_coins}</span>
          </div>
          <div>
            <span className="text-muted-foreground">XP:</span>
            <span className="ml-2 font-bold text-accent">{submission.task_reward_xp}</span>
          </div>
        </div>

        {submission.proof_file_count > 0 && (
          <Badge variant="outline" className="bg-muted/20">
            {submission.proof_file_count} file(s) uploaded
          </Badge>
        )}

        {submission.user_product_name && (
          <p className="text-sm text-muted-foreground">
            Product: {submission.user_product_name}
            {submission.user_product_order_id && ` (${submission.user_product_order_id})`}
          </p>
        )}

        {submission.status === "REJECTED" && submission.rejection_reason && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">{getRejectionReasonLabel(submission.rejection_reason)}</p>
              {submission.rejection_notes && (
                <p className="text-sm mt-1">{submission.rejection_notes}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {submission.status === "APPROVED" && (
          <div className="rounded-lg bg-success/10 p-3 text-sm">
            <p className="font-medium text-success">Rewards Credited</p>
            <p className="text-muted-foreground mt-1">
              Earned: ₹{submission.money_earned} + {submission.coins_earned} coins + {submission.xp_earned} XP
            </p>
          </div>
        )}

        {(submission.status === "SUBMITTED" || submission.status === "REVIEWING") && (
          <p className="text-sm text-muted-foreground">
            Usually reviewed within 24-48 hours
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(sub => sub.status === "SUBMITTED" || sub.status === "REVIEWING");
  const approvedSubmissions = submissions.filter(sub => sub.status === "APPROVED");
  const rejectedSubmissions = submissions.filter(sub => sub.status === "REJECTED");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Task Status Board</h2>
        <p className="text-muted-foreground">
          Track the status of all your submitted tasks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingSubmissions.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {approvedSubmissions.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0">
                {approvedSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejectedSubmissions.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0">
                {rejectedSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No pending submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No approved submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No rejected submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rejectedSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
