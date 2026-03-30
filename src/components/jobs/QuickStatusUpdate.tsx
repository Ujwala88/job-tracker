"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface QuickStatusUpdateProps {
  jobId: string;
  currentStatus: string;
  onUpdate?: (newStatus: string) => void;
}

export function QuickStatusUpdate({ jobId, currentStatus, onUpdate }: QuickStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    const prev = status;
    setStatus(newStatus); // optimistic

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      onUpdate?.(newStatus);
      toast({ title: "Status updated", description: `→ ${STATUS_CONFIG[newStatus]?.label}` });
    } catch {
      setStatus(prev); // revert
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const config = STATUS_CONFIG[status];

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger
        className={`h-7 w-36 border-0 text-xs font-medium rounded-full px-2.5 focus:ring-0 ${config?.color ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {ALL_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {STATUS_CONFIG[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
