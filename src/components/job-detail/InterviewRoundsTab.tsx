"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutoSaveTextarea } from "@/components/shared/AutoSaveTextarea";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

const ROUND_TYPES = ["recruiter_screen", "hiring_manager", "phone_screen", "technical", "portfolio", "behavioral", "panel", "final", "offer_call"];
const OUTCOMES = ["pending", "passed", "failed", "waiting", "cancelled"];

interface Question {
  id: string;
  question: string;
  myAnswer: string | null;
  improvements: string | null;
  category: string | null;
}

interface Round {
  id: string;
  roundNumber: number;
  roundType: string | null;
  scheduledAt: string | null;
  interviewer: string | null;
  notes: string | null;
  feedback: string | null;
  outcome: string | null;
  questions: Question[];
}

interface InterviewRoundsTabProps {
  jobId: string;
  initialRounds: Round[];
}

export function InterviewRoundsTab({ jobId, initialRounds }: InterviewRoundsTabProps) {
  const [rounds, setRounds] = useState<Round[]>(initialRounds);
  const [expandedId, setExpandedId] = useState<string | null>(rounds[rounds.length - 1]?.id ?? null);
  const [adding, setAdding] = useState(false);

  const [newRound, setNewRound] = useState({
    roundType: "recruiter_screen",
    interviewer: "",
    scheduledAt: "",
  });

  async function handleAddRound() {
    try {
      const res = await fetch(`/api/jobs/${jobId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRound),
      });
      if (!res.ok) throw new Error();
      const round = await res.json();
      setRounds((r) => [...r, round]);
      setExpandedId(round.id);
      setAdding(false);
      setNewRound({ roundType: "recruiter_screen", interviewer: "", scheduledAt: "" });
      toast({ title: "Round added" });
    } catch {
      toast({ title: "Failed to add round", variant: "destructive" });
    }
  }

  async function updateRoundField(roundId: string, field: string, value: string) {
    await fetch(`/api/jobs/${jobId}/rounds/${roundId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setRounds((rs) => rs.map((r) => r.id === roundId ? { ...r, [field]: value } : r));
  }

  async function addQuestion(roundId: string) {
    const res = await fetch(`/api/jobs/${jobId}/rounds/${roundId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "New question", category: "behavioral" }),
    });
    if (!res.ok) return;
    const q = await res.json();
    setRounds((rs) => rs.map((r) => r.id === roundId ? { ...r, questions: [...r.questions, q] } : r));
  }

  const roundTypeLabel = (t: string | null) =>
    t ? t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Round";

  return (
    <div className="space-y-3">
      {rounds.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
          No interview rounds yet. Add your first one when you get a call.
        </div>
      )}

      {rounds.map((round) => {
        const isExpanded = expandedId === round.id;
        return (
          <Card key={round.id} className={round.outcome === "passed" ? "border-emerald-200" : round.outcome === "failed" ? "border-red-200" : ""}>
            <CardHeader
              className="cursor-pointer pb-3"
              onClick={() => setExpandedId(isExpanded ? null : round.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {round.roundNumber}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{roundTypeLabel(round.roundType)}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {round.interviewer && `${round.interviewer} · `}
                      {round.scheduledAt ? formatDate(round.scheduledAt) : "Date TBD"}
                      {round.questions.length > 0 && ` · ${round.questions.length} Q`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {round.outcome && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      round.outcome === "passed" ? "bg-emerald-100 text-emerald-700" :
                      round.outcome === "failed" ? "bg-red-100 text-red-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {round.outcome}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Round type</Label>
                    <Select
                      value={round.roundType ?? ""}
                      onValueChange={(v) => updateRoundField(round.id, "roundType", v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROUND_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">{roundTypeLabel(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Outcome</Label>
                    <Select
                      value={round.outcome ?? "pending"}
                      onValueChange={(v) => updateRoundField(round.id, "outcome", v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OUTCOMES.map((o) => (
                          <SelectItem key={o} value={o} className="text-xs capitalize">{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Interviewer(s)</Label>
                    <Input
                      defaultValue={round.interviewer ?? ""}
                      onBlur={(e) => updateRoundField(round.id, "interviewer", e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Name / title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      defaultValue={round.scheduledAt ? round.scheduledAt.split("T")[0] : ""}
                      onBlur={(e) => updateRoundField(round.id, "scheduledAt", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Notes / How it went</Label>
                  <AutoSaveTextarea
                    value={round.notes ?? ""}
                    onChange={(v) => setRounds((rs) => rs.map((r) => r.id === round.id ? { ...r, notes: v } : r))}
                    onSave={(v) => updateRoundField(round.id, "notes", v)}
                    placeholder="What happened? Key moments?"
                    rows={4}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Feedback received</Label>
                  <AutoSaveTextarea
                    value={round.feedback ?? ""}
                    onChange={(v) => setRounds((rs) => rs.map((r) => r.id === round.id ? { ...r, feedback: v } : r))}
                    onSave={(v) => updateRoundField(round.id, "feedback", v)}
                    placeholder="Any feedback you received..."
                    rows={3}
                  />
                </div>

                {/* Questions */}
                {round.questions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Questions Asked
                    </Label>
                    {round.questions.map((q) => (
                      <div key={q.id} className="rounded-lg bg-muted/40 p-3 space-y-2">
                        <p className="text-sm font-medium">{q.question}</p>
                        {q.myAnswer && <p className="text-sm text-muted-foreground">My answer: {q.myAnswer}</p>}
                        {q.improvements && <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">Improve: {q.improvements}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => addQuestion(round.id)}
                >
                  <Plus className="h-3 w-3" /> Add question
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Add round form */}
      {adding ? (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Round type</Label>
                <Select value={newRound.roundType} onValueChange={(v) => setNewRound((r) => ({ ...r, roundType: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROUND_TYPES.map((t) => <SelectItem key={t} value={t} className="text-xs">{roundTypeLabel(t)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Interviewer</Label>
                <Input value={newRound.interviewer} onChange={(e) => setNewRound((r) => ({ ...r, interviewer: e.target.value }))} className="h-8 text-xs" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddRound}>Add Round</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add Interview Round
        </Button>
      )}
    </div>
  );
}
