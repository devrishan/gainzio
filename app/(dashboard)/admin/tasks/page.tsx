import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const { tasks, pagination } = await getAdminTasks();

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Task Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage earning tasks, set rewards, and toggle availability.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </header>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Diff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Subs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.category.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">₹{task.rewardAmount}</span>
                    <span className="text-xs text-muted-foreground">+{task.rewardCoins} coins</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-sm">{task.difficulty}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={task.isActive ? "default" : "secondary"}>
                    {task.isActive ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{task.submissionCount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/tasks/${task.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Showing {tasks.length} of {pagination.total} tasks
      </div>
    </section>
  );
}
