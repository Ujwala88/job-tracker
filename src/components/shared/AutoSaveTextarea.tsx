"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface AutoSaveTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onSave: (val: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  rows?: number;
  debounceMs?: number;
}

export function AutoSaveTextarea({
  value,
  onChange,
  onSave,
  placeholder,
  className,
  rows = 8,
  debounceMs = 1500,
}: AutoSaveTextareaProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValue = useRef(value);

  latestValue.current = value;

  const debouncedSave = useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await onSave(val);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } finally {
          setSaving(false);
        }
      }, debounceMs);
    },
    [onSave, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    debouncedSave(e.target.value);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={cn("resize-y font-mono text-sm leading-relaxed pr-8", className)}
      />
      <div className="absolute right-2 top-2">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {saved && !saving && <Check className="h-3.5 w-3.5 text-emerald-500" />}
      </div>
    </div>
  );
}
