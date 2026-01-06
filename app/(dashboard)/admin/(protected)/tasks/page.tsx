
import { getAdminTasks } from "@/services/admin";
import { prisma } from "@/lib/prisma";
import TasksClient from "./tasks-client";

export const dynamic = "force-dynamic";

async function getCategories() {
  return await prisma.taskCategory.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  });
}

export default async function TasksPage() {
  const [tasksData, categories] = await Promise.all([
    getAdminTasks(),
    getCategories()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Task Matrix</h1>
        <p className="text-neutral-500 mt-1">Manage earning tasks, rewards, and compliance rules.</p>
      </div>

      <TasksClient
        initialTasks={tasksData.tasks}
        categories={categories}
      />
    </div>
  );
}
