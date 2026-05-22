// client/src/components/CreateTest/Step2_AiOrManual.tsx
// NEW step inserted between Step1 (test info) and question entry.
// Teacher chooses: AI Generate OR Manual entry.

import React, { useState } from "react";

interface Props {
  mcqCount: number;
  codingCount: number;
  onAiGenerate: (topics: {
    mcqTopic: string;
    codingTopic: string;
    difficulty: "easy" | "medium" | "hard";
  }) => void;
  onManual: () => void;
  loading: boolean;
}

const DIFFICULTIES = [
  { value: "easy",   label: "Easy",   desc: "Basic concepts, straightforward questions" },
  { value: "medium", label: "Medium", desc: "Intermediate level, requires understanding" },
  { value: "hard",   label: "Hard",   desc: "Advanced topics, tricky edge cases" },
] as const;

const Step2_AiOrManual: React.FC<Props> = ({
  mcqCount, codingCount, onAiGenerate, onManual, loading,
}) => {
  const [mode, setMode]         = useState<"choose" | "ai">("choose");
  const [mcqTopic, setMcqTopic]       = useState("");
  const [codingTopic, setCodingTopic] = useState("");
  const [difficulty, setDifficulty]   = useState<"easy" | "medium" | "hard">("medium");
  const [err, setErr]           = useState("");

  const handleAiSubmit = () => {
    if (mcqCount > 0 && !mcqTopic.trim())    return setErr("Enter a topic for MCQ questions.");
    if (codingCount > 0 && !codingTopic.trim()) return setErr("Enter a topic for Coding questions.");
    setErr("");
    onAiGenerate({ mcqTopic, codingTopic, difficulty });
  };

  // ── Choose mode ─────────────────────────────────────────────
  if (mode === "choose") return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Add Questions</h2>
        <p className="text-[#8b949e]">Choose how you want to fill the questions for this test.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* AI Generate card */}
        <button
          onClick={() => setMode("ai")}
          className="group flex flex-col gap-4 p-7 bg-gradient-to-br from-[#1a1f2e] to-[#161b22] border border-[#30363d] hover:border-emerald-500/50 rounded-2xl text-left transition-all hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            🤖
          </div>
          <div>
            <h3 className="text-white font-black text-xl mb-2">AI Generate</h3>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Just enter a topic — Claude AI will instantly create
              {mcqCount > 0 ? ` ${mcqCount} MCQ` : ""}
              {mcqCount > 0 && codingCount > 0 ? " +" : ""}
              {codingCount > 0 ? ` ${codingCount} coding` : ""} questions with test cases.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">⚡ Instant</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">🧠 Claude AI</span>
            <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">Auto test cases</span>
          </div>
        </button>

        {/* Manual card */}
        <button
          onClick={onManual}
          className="group flex flex-col gap-4 p-7 bg-[#161b22] border border-[#30363d] hover:border-blue-500/50 rounded-2xl text-left transition-all hover:shadow-xl hover:shadow-blue-500/10"
        >
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            ✏️
          </div>
          <div>
            <h3 className="text-white font-black text-xl mb-2">Enter Manually</h3>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Write your own questions, options, and test cases one by one. Full control over content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Full control</span>
            <span className="text-[10px] font-bold text-[#8b949e] bg-[#21262d] px-2 py-1 rounded-full">Takes time</span>
          </div>
        </button>
      </div>
    </div>
  );

  // ── AI topic input ───────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🤖</span>
          <h2 className="text-4xl font-black text-white tracking-tight">AI Generation</h2>
        </div>
        <p className="text-[#8b949e]">Tell Claude what topics to generate questions about.</p>
      </div>

      <div className="space-y-6">
        {/* MCQ topic */}
        {mcqCount > 0 && (
          <div>
            <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-3">
              MCQ Topic * <span className="text-blue-400 normal-case tracking-normal font-semibold">({mcqCount} questions)</span>
            </label>
            <input
              autoFocus
              value={mcqTopic}
              onChange={e => setMcqTopic(e.target.value)}
              placeholder="e.g. Java OOP concepts, Data Structures, Python basics"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-white text-base placeholder-[#484f58] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
            <p className="text-xs text-[#484f58] mt-2">Be specific for better questions: "Java Collections Framework - ArrayList, HashMap" works better than "Java"</p>
          </div>
        )}

        {/* Coding topic */}
        {codingCount > 0 && (
          <div>
            <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-3">
              Coding Topic * <span className="text-violet-400 normal-case tracking-normal font-semibold">({codingCount} problems)</span>
            </label>
            <input
              value={codingTopic}
              onChange={e => setCodingTopic(e.target.value)}
              placeholder="e.g. Array manipulation, String problems, Binary search"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-white text-base placeholder-[#484f58] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all"
            />
            <p className="text-xs text-[#484f58] mt-2">AI will generate the problem statement, sample I/O, and 3 hidden test cases automatically.</p>
          </div>
        )}

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-3">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all ${
                  difficulty === d.value
                    ? d.value === "easy"   ? "border-emerald-500/60 bg-emerald-500/10"
                    : d.value === "medium" ? "border-amber-500/60 bg-amber-500/10"
                                           : "border-red-500/60 bg-red-500/10"
                    : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
                }`}
              >
                <span className={`text-sm font-black ${
                  difficulty === d.value
                    ? d.value === "easy" ? "text-emerald-400" : d.value === "medium" ? "text-amber-400" : "text-red-400"
                    : "text-white"
                }`}>{d.label}</span>
                <span className="text-xs text-[#6e7681] leading-relaxed">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* What AI will generate preview */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-5">
          <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-3">AI will generate</p>
          <div className="space-y-2">
            {mcqCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-[#cdd9e5]">
                <span className="text-blue-400">●</span>
                {mcqCount} MCQ questions with 4 options each, correct answer marked
              </div>
            )}
            {codingCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-[#cdd9e5]">
                <span className="text-violet-400">●</span>
                {codingCount} coding problems with description, I/O format, and 3 hidden test cases each
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-[#cdd9e5]">
              <span className="text-emerald-400">●</span>
              Test auto-published after generation (~15-30 seconds)
            </div>
          </div>
        </div>

        {err && (
          <div className="bg-red-900/25 border border-red-700/40 text-red-400 rounded-xl px-5 py-3 text-sm font-semibold">
            ⚠ {err}
          </div>
        )}

        <button
          onClick={handleAiSubmit}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-[#21262d] disabled:to-[#21262d] disabled:text-[#484f58] text-white text-base font-bold rounded-xl transition-all hover:shadow-2xl hover:shadow-emerald-500/20 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75"/>
              </svg>
              Claude is generating questions…
            </span>
          ) : (
            "🤖 Generate Questions with AI →"
          )}
        </button>
      </div>
    </div>
  );
};

export default Step2_AiOrManual;
