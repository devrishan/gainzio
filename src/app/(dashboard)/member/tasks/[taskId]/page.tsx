import { TaskDetailClient } from "@/components/member/task-detail-client";

interface TaskDetailPageProps {
    params: {
        taskId: string;
    };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
    return (
        <section className="min-h-screen">
            {/* The layout is handled inside the client component for better header control */}
            <TaskDetailClient taskId={params.taskId} />
        </section>
    );
}
