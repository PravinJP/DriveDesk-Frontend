// client/src/components/CreateTest/Step1_TestInfo.tsx

import React, { useState } from "react";

interface Meta {
  title: string; mcqCount: number; codingCount: number;
  duration: number; totalMarks: number; instructions: string;
}
interface Props { onNext: (d: Meta) => void; loading: boolean; }

const Step1_TestInfo: React.FC<Props> = ({ onNext, loading }) => {
  const [title, setTitle]           = useState("");
  const [mcqCount, setMcq]          = useState(0);
  const [codingCount, setCoding]    = useState(0);
  const [duration, setDuration]     = useState(60);
  const [totalMarks, setMarks]      = useState(100);
  const [instructions, setInstr]    = useState("");
  const [err, setErr]               = useState("");

  const totalQ = mcqCount + codingCount;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim())  return setErr("Test name is required.");
    if (totalQ === 0)   return setErr("Add at least 1 question.");
    if (duration < 1)   return setErr("Duration must be ≥ 1 minute.");
    if (totalMarks < 1) return setErr("Total marks must be positive.");
    setErr("");
    onNext({ title, mcqCount, codingCount, duration, totalMarks, instructions });
  };

  const Counter = ({ label, value, onChange, color }: {
    label: string; value: number; onChange: (v: number) => void; color: string;
  }) => (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-bold text-[#8b949e] uppercase tracking-[0.08em]">{label}</span>
      <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-12 h-12 flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-all text-xl font-bold">−</button>
        <span className={`flex-1 text-center text-3xl font-black ${color}`}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-12 h-12 flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-all text-xl font-bold">+</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h2 className="text-5xl font-black text-white mb-3 tracking-tight">Test Details</h2>
        <p className="text-[#8b949e] text-base">Configure the structure, timing, and instructions for your test.</p>
      </div>

      <form onSubmit={submit} className="space-y-7">
        {/* Test Name */}
        <div>
          <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-[0.08em] mb-3">Test Name *</label>
          <input
            autoFocus value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Python Fundamentals — Batch 2025"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-white text-lg font-semibold placeholder-[#484f58] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
          />
        </div>

        {/* Duration + Marks */}
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: "Duration (minutes) *", val: duration, set: setDuration },
            { label: "Total Marks *", val: totalMarks, set: setMarks },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-[0.08em] mb-3">{label}</label>
              <input type="number" min={1} value={val} onChange={e => set(Number(e.target.value))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-white text-xl font-black focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all" />
            </div>
          ))}
        </div>

        {/* Question counters */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <p className="text-xs font-bold text-[#8b949e] uppercase tracking-[0.08em] mb-5">Question Breakdown</p>
          <div className="grid grid-cols-3 gap-5 items-start">
            <Counter label="MCQ Questions"    value={mcqCount}    onChange={setMcq}    color="text-blue-400" />
            <Counter label="Coding Questions" value={codingCount} onChange={setCoding} color="text-violet-400" />
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#8b949e] uppercase tracking-[0.08em]">Total</span>
              <div className={`h-12 rounded-xl flex items-center justify-center text-3xl font-black border transition-all ${
                totalQ > 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#0d1117] border-[#30363d] text-[#484f58]"
              }`}>{totalQ}</div>
            </div>
          </div>
          {totalQ > 0 && (
            <div className="flex gap-2 mt-5">
              {mcqCount > 0    && <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">{mcqCount} MCQ</span>}
              {codingCount > 0 && <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">{codingCount} Coding</span>}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-[0.08em] mb-3">
            Instructions <span className="text-[#484f58] normal-case tracking-normal font-medium">(optional)</span>
          </label>
          <textarea rows={4} value={instructions} onChange={e => setInstr(e.target.value)}
            placeholder="Describe rules, allowed resources, scoring policy…"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-white text-sm placeholder-[#484f58] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all resize-none" />
        </div>

        {err && (
          <div className="bg-red-900/25 border border-red-700/40 text-red-400 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2">
            <span>⚠</span> {err}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#21262d] disabled:text-[#484f58] text-white text-base font-bold rounded-xl transition-all hover:shadow-2xl hover:shadow-emerald-500/20 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75"/>
              </svg> Creating…
            </span>
          ) : "Continue — Add Questions →"}
        </button>
      </form>
    </div>
  );
};

export default Step1_TestInfo;
