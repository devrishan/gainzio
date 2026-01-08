"use client";

import Link from "next/link";
import { useSession } from "@/components/providers/session-provider";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Upload, XCircle, AlertCircle, ArrowUpRight, Zap, Coins, UserPlus, ArrowRight } from "lucide-react";
import { TaskSubmissionDialog } from "@/components/member/task-submission-dialog";
import { Task, getTasksClient } from "@/services/member-client";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

function getStatusBadge(userSubmissionCount: number, canSubmit: boolean, isExpired: boolean) {
  if (isExpired) {
    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
        <XCircle className="h-3 w-3 mr-1" /> Expired
      </Badge>
    );
  }
  if (userSubmissionCount > 0) {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        <Clock className="h-3 w-3 mr-1" /> Under Review
      </Badge>
    );
  }
  if (!canSubmit) {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        <AlertCircle className="h-3 w-3 mr-1" /> Limit Reached
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
      <Zap className="h-3 w-3 mr-1" /> Active
    </Badge>
  );
}

function getStatusButton(task: Task) {
  if (task.is_expired) {
    return (
      <Button variant="secondary" className="w-full bg-muted/50" disabled>
        Task Expired
      </Button>
    );
  }
  if (task.user_submission_count > 0) {
    return (
      <Button variant="outline" className="w-full border-primary/20 text-primary" disabled>
        <Clock className="mr-2 h-4 w-4" />
        Processing
      </Button>
    );
  }
  if (!task.can_submit) {
    return (
      <Button variant="secondary" className="w-full bg-muted/50" disabled>
        Limit Reached
      </Button>
    );
  }
  return (
    <TaskSubmissionDialog taskId={task.id} taskTitle={task.title} taskType={task.task_type}>
      <Button className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
        <Upload className="h-4 w-4" />
        Submit Proof
      </Button>
    </TaskSubmissionDialog>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function MemberTasksClient() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasksClient(),
  });

  const { user } = useSession();
  const isProfileIncomplete = !user?.dob || !user?.state || !user?.district;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <LoadingSkeleton key={i} className="h-[280px] rounded-2xl glass-morphism opacity-50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center glass-morphism rounded-2xl p-8 border-destructive/20 bg-destructive/5">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Unavailable</h3>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Could not load tasks just now."}
        </p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    if (isProfileIncomplete) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-morphism rounded-2xl border-primary/20 bg-primary/5">
          <div className="bg-primary/20 p-4 rounded-full mb-4 animate-pulse">
            <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Unlock Exclusive Tasks!</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Complete your profile settings (Location & Age) to unlock high-value targeted campaigns.
          </p>
          <Link href="/member/settings">
            <Button className="shadow-lg shadow-primary/25">
              Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass-morphism rounded-2xl border-white/5">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
        <p className="text-muted-foreground max-w-sm">No new tasks available right now. Check back later for more earning opportunities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isProfileIncomplete && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-500">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-500">More Tasks Available</h4>
              <p className="text-xs text-amber-500/80">Complete your profile to see location-specific campaigns.</p>
            </div>
          </div>
          <Link href="/member/settings">
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 whitespace-nowrap">
              Update Profile
            </Button>
          </Link>
        </div>
      )}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {tasks.map((task) => (
          <motion.div key={task.id} variants={item}>
            <div className="group relative rounded-2xl overflow-hidden glass-morphism border-white/5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
              {/* Hover Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

              <Card className="relative border-0 bg-transparent h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="glass-morphism border-primary/20 text-primary-foreground bg-primary/10">
                      {task.category.name}
                    </Badge>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {task.reward_amount.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">Pts</span>
                      </div>
                      {task.reward_coins > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-500/80">
                          <Coins className="w-3 h-3" /> {task.reward_coins}
                        </div>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-300">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {task.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary" className="text-[10px] h-5 bg-muted/50">
                      {task.difficulty}
                    </Badge>
                    {task.max_submissions && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        Limit: {task.max_submissions}x
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    {task.is_locked ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Locked (Lvl {task.min_rank})
                      </div>
                    ) : (
                      getStatusBadge(task.user_submission_count, task.can_submit, task.is_expired)
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  {task.is_locked ? (
                    <Button variant="ghost" className="w-full opacity-50 cursor-not-allowed" disabled>
                      Locked
                    </Button>
                  ) : (
                    getStatusButton(task)
                  )}
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
