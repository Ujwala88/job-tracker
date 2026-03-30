"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/utils";

interface AddJobDialogProps {
  open: boolean;
  onClose: () => void;
}

const SOURCES = ["LinkedIn", "Referral", "Company Website", "Indeed", "Glassdoor", "AngelList", "Twitter/X", "Other"];
const WORK_TYPES = ["remote", "hybrid", "onsite"];

export function AddJobDialog({ open, onClose }: AddJobDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    role: "",
    location: "",
    workType: "remote",
    source: "",
    appliedDate: "",
    status: "wishlist",
    priority: "medium",
    salaryMin: "",
    salaryMax: "",
    jobUrl: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName || !form.role) return;

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
          appliedDate: form.appliedDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create job");
      const job = await res.json();

      toast({ title: "Application added", description: `${form.role} at ${form.companyName}` });
      onClose();
      router.push(`/jobs/${job.id}`);
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Could not save application", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Company *</Label>
              <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Figma" required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Role *</Label>
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Senior Product Designer" required />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="San Francisco / Remote" />
            </div>
            <div className="space-y-1.5">
              <Label>Work type</Label>
              <Select value={form.workType} onValueChange={(v) => set("workType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger><SelectValue placeholder="Where did you find it?" /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Applied date</Label>
              <Input type="date" value={form.appliedDate} onChange={(e) => set("appliedDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Salary min (USD)</Label>
              <Input type="number" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="150000" />
            </div>
            <div className="space-y-1.5">
              <Label>Salary max (USD)</Label>
              <Input type="number" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="200000" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Job URL</Label>
              <Input value={form.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
