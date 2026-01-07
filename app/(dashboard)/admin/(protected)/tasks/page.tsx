"use client";

import { TaskCreatorWizard } from "@/components/admin/task-creator-wizard";
import { getAdminTasks } from "@/services/admin"; // We might not need this if Wizard fetches its own tables.
import { useState } from "react";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">Task Matrix</h1>
        <p className="text-neutral-400">Manage daily earning tasks and campaigns.</p>
      </div>

      {/* The Wizard includes the list view, so it handles the full page UI */}
      <TaskCreatorWizard />
    </div>
  );
}
