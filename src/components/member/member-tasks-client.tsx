"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Upload, XCircle, AlertCircle } from "lucide-react";
import { TaskSubmissionDialog } from "@/components/member/task-submission-dialog";
import { Task, getTasksClient } from "@/services/member-client";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

function getStatusBadge(userSubmissionCount: number, canSubmit: boolean, isExpired: boolean) {
  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <XCircle className="h-4 w-4" />
        Expired
      </div>
    );
  }
  if (userSubmissionCount > 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <Clock className="h-4 w-4" />
        Under Review
      </div>
    );
  }
  if (!canSubmit) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        Limit Reached
      </div>
    );
  }
  return null;
}

function getStatusButton(task: Task) {
  if (task.is_expired) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Task Expired
      </Button>
    );
  }
  if (task.user_submission_count > 0) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Clock className="mr-2 h-4 w-4" />
        Awaiting Review
      </Button>
    );
  }
  if (!task.can_submit) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Submission Limit Reached
      </Button>
    );
  }
  return (
    <TaskSubmissionDialog taskId={task.id} taskTitle={task.title}>
      <Button className="w-full gap-2">
        <Upload className="h-4 w-4" />
        Upload Proof
      </Button>
    </TaskSubmissionDialog>
  );
}

export function MemberTasksClient() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasksClient(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred while loading tasks"}
        </p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks available</h3>
        <p className="text-sm text-muted-foreground">Check back later for new tasks to complete.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <Badge variant="outline">{task.category.name}</Badge>
              <div className="flex flex-col items-end gap-1">
                {task.reward_amount > 0 && (
                  <div className="text-lg font-bold text-primary">{task.reward_amount.toFixed(0)} Pts</div>
                )}
                {task.reward_coins > 0 && (
                  <div className="text-sm font-medium text-muted-foreground">{task.reward_coins} coins</div>
                )}
              </div>
            </div>
            <CardTitle className="text-xl">{task.title}</CardTitle>
            <CardDescription className="line-clamp-3">{task.description}</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {task.difficulty}
              </Badge>
              {task.max_submissions && (
                <span className="text-xs text-muted-foreground">
                  Max {task.max_submissions} submission{task.max_submissions !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {task.is_locked ? (
              <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4" />
                Locked (Requires {task.min_rank})
              </div>
            ) : (
              getStatusBadge(task.user_submission_count, task.can_submit, task.is_expired)
            )}
          </CardContent>
          <CardFooter>
            {task.is_locked ? (
              <Button variant="outline" className="w-full opacity-50" disabled>
                Locked
              </Button>
            ) : (
              getStatusButton(task)
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
