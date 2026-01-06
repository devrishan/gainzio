import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminTasks } from "@/services/admin";
import { format } from "date-fns";
import { Plus, Target, Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const { tasks, pagination } = await getAdminTasks();

  return (
    <div className="space-y-8 relative">
      {/* Background Decor */}
      <div className="absolute -top-40 right-40 h-[600px] w-[600px] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-60 left-20 h-[400px] w-[400px] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-500" />
            <h1 className="text-3xl font-black italic tracking-tight uppercase text-white/90">Task Missions</h1>
          </div>
          <p className="text-sm font-medium text-zinc-500 max-w-lg">
            Deploy new earning protocols, configure rewards, and monitor completion rates.
          </p>
        </div>
        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[10px] h-9 px-4 rounded-full shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] border border-white/10">
          <Plus className="h-3 w-3" />
          Deploy Mission
        </Button>
      </header>

      <Card className="relative z-10 border-white/5 bg-zinc-950/40 backdrop-blur-2xl p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-6">Mission Details</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Sector</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Payout</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Class</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">State</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500 tracking-widest">Completions</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500 tracking-widest pr-6">Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">{task.title}</span>
                      <span className="text-[10px] text-zinc-500 truncate max-w-[200px]">{task.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-[9px] uppercase tracking-wider text-zinc-400">
                      {task.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-400 text-xs">₹{task.rewardAmount}</span>
                      <span className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1">
                        <Trophy className="h-2 w-2" />
                        +{task.rewardCoins} XP
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${task.difficulty === 'Easy' ? 'text-emerald-500' :
                        task.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                      }`}>{task.difficulty}</span>
                  </TableCell>
                  <TableCell>
                    <div className={`h-2 w-2 rounded-full ${task.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-600"}`} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-white/80">
                    {task.submissionCount}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-wider hover:bg-white/10 hover:text-white" asChild>
                      <Link href={`/admin/tasks/${task.id}`}>Configure</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-600">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Target className="h-8 w-8" />
                      <span className="text-xs font-bold uppercase tracking-widest">No Missions Deployed</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="text-xs font-mono text-zinc-600 text-center uppercase tracking-widest">
        Displaying {tasks.length} active mission protocols
      </div>
    </div>
  );
}
