"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_CONFIG, ALL_STATUSES, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Plus, ArrowRight } from "lucide-react";

interface StatusUpdate {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

interface TimelineTabProps {
  jobId: string;
  currentStatus: string;
  history: StatusUpdate[];
  onUpdate: (newStatus: string) => void;
}

export function TimelineTab({ jobId, currentStatus, history: initialHistory, onUpdate }: TimelineTabProps) {
  const [history, setHistory] = useState(initialHistory);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddUpdate() {
    if (!newStatus || newStatus === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: newStatus, note: note || null }),
      });
      if (!res.ok) throw new Error();

      const update: StatusUpdate = {
        id: Date.now().toString(),
        fromStatus: currentStatus,
        toStatus: newStatus,
        note: note || null,
        createdAt: new Date().toISOString(),
      };

      setHistory((h) => [...h, update]);
      onUpdate(newStatus);
      setNote("");
      toast({ title: "Status updated", description: `→ ${STATUS_CONFIG[newStatus]?.label}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick update */}
      <div className="rounded-xl border p-4 space-y-3 bg-muted/20">
        <h3 className="text-sm font-medium">Update Status</h3>
        <div className="flex gap-2 flex-wrap">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
            className="flex-1 min-w-40"
            onKeyDown={(e) => e.key === "Enter" && handleAddUpdate()}
          />
          <Button onClick={handleAddUpdate} disabled={loading || newStatus === currentStatus} size="sm">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No status history yet.</p>
        )}
        {history.map((item, idx) => {
          const isLatest = idx === history.length - 1;
          const config = STATUS_CONFIG[item.toStatus];
          return (
            <div key={item.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full mt-3 shrink-0 ${isLatest ? "bg-primary" : "bg-muted-foreground/30"}`} />
                {idx < history.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.fromStatus && (
                    <>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[item.fromStatus]?.color ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_CONFIG[item.fromStatus]?.label ?? item.fromStatus}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </>
                  )}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config?.color ?? "bg-gray-100 text-gray-600"}`}>
                    {config?.label ?? item.toStatus}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">{formatDate(item.createdAt)}</span>
                </div>
                {item.note && (
                  <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
