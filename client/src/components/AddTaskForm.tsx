import { useState, type FormEvent } from "react";

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you need to get to?"
        aria-label="New task"
        className="w-full rounded-xl bg-ink-raised px-4 py-3.5 pr-20 text-[15px] text-white/90 placeholder:text-white/25 ring-1 ring-white/5 outline-none transition focus:ring-accent/40"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition enabled:hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-30"
      >
        Add
      </button>
    </form>
  );
}
