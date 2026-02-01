"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskClient, Task } from "@/services/member-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Upload, Zap, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskSubmissionDialog } from "@/components/member/task-submission-dialog";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface TaskDetailClientProps {
    taskId: string;
}

export function TaskDetailClient({ taskId }: TaskDetailClientProps) {
    const router = useRouter();

    // Fetch task details
    const { data: task, isLoading: taskLoading, error: taskError } = useQuery({
        queryKey: ["task", taskId],
        queryFn: () => getTaskClient(taskId),
    });

    // Fetch submissions to track status
    // Ideally this should be optimized, but for now we fetch all and filter
    const { data: submissions } = useQuery({
        queryKey: ["member-submissions"],
        queryFn: async () => {
            const res = await fetch("/api/member/submissions.php");
            const data = await res.json();
            return data.success ? data.submissions : [];
        }
    });

    const submission = submissions?.find((s: any) => s.task_id === task?.id || s.task_title === task?.title);
    // Note: Matching by title is risky if ID not available in list, ideally API returns task_id

    if (taskLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <LoadingSkeleton className="h-10 w-10 rounded-full" />
                    <LoadingSkeleton className="h-8 w-48" />
                </div>
                <LoadingSkeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (taskError || !task) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold">Task Not Found</h3>
                <Button onClick={() => router.back()} className="mt-4" variant="secondary">Go Back</Button>
            </div>
        );
    }

    // Determine progress step
    let progress = 0;
    let statusLabel = "Not Started";

    if (submission) {
        if (submission.status === "SUBMITTED") {
            progress = 33;
            statusLabel = "Under Review";
        } else if (submission.status === "REVIEWING") {
            progress = 66;
            statusLabel = "Rounding Up";
        } else if (submission.status === "APPROVED") {
            progress = 100;
            statusLabel = "Approved";
        } else if (submission.status === "REJECTED") {
            // Special case
            progress = 100; // Completed but failed
            statusLabel = "Rejected";
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold line-clamp-1">{task.title}</h1>
            </div>

            {/* Task Header Card */}
            <div className="glass-morphism rounded-2xl p-6 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary/10 px-4 py-2 rounded-bl-xl text-primary font-bold flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    ₹{task.reward_amount}
                </div>

                <div className="flex items-start gap-4">
                    {/* Icon placeholder if we had one, else category badge */}
                    <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] uppercase">{task.category.name}</Badge>
                        <h2 className="text-2xl font-bold">{task.title}</h2>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>24h Approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>{task.user_submission_count} Submissions</span>
                    </div>
                </div>
            </div>

            {/* Status Tracker */}
            {submission && (
                <Card className="border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Task Status: {statusLabel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="h-2 mb-4"
                            indicatorClassName={submission.status === 'REJECTED' ? 'bg-destructive' : 'bg-primary'}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className={progress >= 33 ? "text-primary font-medium" : ""}>Submitted</span>
                            <span className={progress >= 66 ? "text-primary font-medium" : ""}>Reviewed</span>
                            <span className={submission.status === 'APPROVED' ? "text-success font-medium" : submission.status === 'REJECTED' ? "text-destructive font-medium" : ""}>Result</span>
                        </div>

                        {submission.rejection_reason && (
                            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                                <p className="font-bold">Rejection Reason:</p>
                                <p>{submission.rejection_reason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">How to Complete</h3>
                <Card className="spark-border">
                    <CardContent className="p-6">
                        <div className="prose dark:prose-invert max-w-none text-sm">
                            <p>{task.description}</p>
                            {/* If description is short, we assume manual steps would be here if API had them. 
                          For now, we trust description contains instructions. */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Submission CTA - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/5 lg:relative lg:bg-transparent lg:border-0 lg:p-0 z-10">
                {!submission ? (
                    task.can_submit ? (
                        <TaskSubmissionDialog taskId={task.id} taskTitle={task.title} taskType={task.task_type}>
                            <Button className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20">
                                Submit Task Now
                            </Button>
                        </TaskSubmissionDialog>
                    ) : (
                        <Button disabled className="w-full h-12" variant="secondary">
                            Submission Limit Reached
                        </Button>
                    )
                ) : (
                    <div className="flex gap-2">
                        {submission.status === 'REJECTED' && task.can_submit && (
                            <TaskSubmissionDialog taskId={task.id} taskTitle={task.title} taskType={task.task_type}>
                                <Button className="w-full h-12 text-lg font-bold" variant="outline">
                                    Try Again
                                </Button>
                            </TaskSubmissionDialog>
                        )}
                        <Button disabled className="w-full h-12" variant="secondary">
                            {submission.status === 'APPROVED' ? 'Task Completed' : 'Already Submitted'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
