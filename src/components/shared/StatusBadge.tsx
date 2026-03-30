import { cn, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.color)}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] ?? { label: priority, color: "bg-gray-100 text-gray-500" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.color)}>
      {config.label}
    </span>
  );
}
