"use client";

import Link from "next/link";
import { useSession } from "@/components/providers/session-provider";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Categorize tasks (Mock logic for now, or based on real data pattern)
  const dailyTasks = tasks || [];
  const dirpadiTasks = tasks?.filter(t => t.title.toLowerCase().includes("dirpadi") || t.category.name.toLowerCase().includes("dirpadi")) || [];
  const specialTasks = tasks?.filter(t => t.reward_amount > 100 || t.is_locked) || [];

  const TaskGrid = ({ data }: { data: Task[] }) => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {data.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-muted">
          <p>No tasks available in this category.</p>
        </div>
      ) : (
        data.map((task) => (
          <motion.div key={task.id} variants={item}>
            <div className="group relative rounded-xl overflow-hidden glass-morphism border-white/5 bg-card/50 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-md">
              <Card className="relative border-0 bg-transparent h-full flex flex-col">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider opacity-70">
                        {task.category.name}
                      </Badge>
                      <CardTitle className="text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {task.title}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col items-end shrink-0 bg-secondary/30 px-2 py-1.5 rounded-lg">
                      <span className="text-lg font-bold text-primary">₹{task.reward_amount.toFixed(0)}</span>
                      {task.reward_coins > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Coins className="w-3 h-3" /> {task.reward_coins}</span>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 py-2 flex-1">
                  <CardDescription className="line-clamp-2 text-xs">
                    {task.description}
                  </CardDescription>

                  <div className="mt-3 flex items-center gap-2">
                    {getStatusBadge(task.user_submission_count, task.can_submit, task.is_expired)}
                    {task.max_submissions && (
                      <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded-full">
                        Limit: {task.max_submissions}x
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2">
                  {task.is_locked ? (
                    <Button variant="ghost" size="sm" className="w-full opacity-50 cursor-not-allowed h-9 text-xs" disabled>
                      <AlertCircle className="w-3 h-3 mr-2" /> Locked (Lvl {task.min_rank})
                    </Button>
                  ) : (
                    getStatusButton(task)
                    // Note: TaskSubmissionDialog might need adjustment for size="sm" if wanted, 
                    // but keeping default for touch targets on mobile
                  )}
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )))}
    </motion.div>
  );

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

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-muted/20 p-1">
          <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
          <TabsTrigger value="dirpadi">DIRPADI</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>
        <div className="mt-6 min-h-[50vh]">
          <TabsContent value="daily">
            <TaskGrid data={dailyTasks} />
          </TabsContent>
          <TabsContent value="dirpadi">
            <TaskGrid data={dirpadiTasks} />
          </TabsContent>
          <TabsContent value="special">
            <TaskGrid data={specialTasks} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
