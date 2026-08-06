'use client';

interface SubtaskProgressProps {
  tasks: any[];
  parentId: string;
}

export default function SubtaskProgress({ tasks, parentId }: SubtaskProgressProps) {
  const subtasks = tasks.filter(t => t.parent_id === parentId);
  if (subtasks.length === 0) return null;

  const total = subtasks.length;
  const completed = subtasks.filter(t => t.status === 'done').length;
  const inProgress = subtasks.filter(t => t.status === 'in_progress').length;
  const review = subtasks.filter(t => t.status === 'review').length;
  const percentage = total > 0 ? Math.round(((completed * 1 + inProgress * 0.5 + review * 0.75) / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 max-w-[100px] bg-muted rounded-full h-1">
        <div className="bg-indigo-500 h-1 rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">
        {completed}/{total} subtareas
      </span>
    </div>
  );
}
