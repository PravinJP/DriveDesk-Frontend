// client/src/components/CreateTest/Step2_McqQuestions.tsx

import React, { useState } from "react";
import type { McqQuestionForm } from "../../types/test.types";

interface Props {
  count: number;
  onNext: (qs: McqQuestionForm[]) => void;
  onBack: () => void;
}

const mkMcq = (): McqQuestionForm => ({
  questionType: "MCQ", questionText: "",
  options: ["", "", "", ""], correctOptionIndex: 0, marks: 1,
});

const OPT = [
  { active: "bg-blue-500 text-white",   idle: "bg-[#21262d] text-blue-400",   ring: "border-blue-500/40 bg-blue-500/8"  },
  { active: "bg-violet-500 text-white", idle: "bg-[#21262d] text-violet-400", ring: "border-violet-500/40 bg-violet-500/8" },
  { active: "bg-amber-500 text-white",  idle: "bg-[#21262d] text-amber-400",  ring: "border-amber-500/40 bg-amber-500/8"  },
  { active: "bg-rose-500 text-white",   idle: "bg-[#21262d] text-rose-400",   ring: "border-rose-500/40 bg-rose-500/8"    },
];

const Step2_McqQuestions: React.FC<Props> = ({ count, onNext, onBack }) => {
  const [questions, setQs] = useState<McqQuestionForm[]>(() => Array.from({ length: count }, mkMcq));
  const [active, setActive] = useState(0);
  const [err, setErr]       = useState("");

  const upd = (i: number, patch: Partial<McqQuestionForm>) =>
    setQs(prev => prev.map((q, idx) => idx === i ? { ...q, ...patch } : q));

  const setOpt = (qi: number, oi: number, val: string) => {
    const opts = [...questions[qi].options] as McqQuestionForm["options"];
    opts[oi] = val;
    upd(qi, { options: opts });
  };

  const ok = (q: McqQuestionForm) =>
    q.questionText.trim() && q.options.every(o => o.trim()) && q.marks >= 1;

  const validate = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim())         return `Q${i+1}: Question text required.`;
      if (q.options.some(o => !o.trim())) return `Q${i+1}: All 4 options required.`;
      if (q.marks < 1)                    return `Q${i+1}: Marks must be ≥ 1.`;
    }
    return "";
  };

  const handleNext = () => {
    const e = validate(); if (e) return setErr(e);
    setErr(""); onNext(questions);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header row */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h2 className="text-5xl font-black text-white mb-3 tracking-tight">MCQ Questions</h2>
          <p className="text-[#8b949e]">Fill in {count} multiple-choice question{count > 1 ? "s" : ""}.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end max-w-xs">
          {questions.map((q, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                active === i ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" :
                ok(q)        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                               "bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:border-[#8b949e]"
              }`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* One Q at a time */}
      {questions.map((q, qi) => qi !== active ? null : (
        <div key={qi} className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 space-y-7">
            {/* Q header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm">{qi + 1}</div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Multiple Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8b949e] uppercase tracking-widest">Marks</span>
                <input type="number" min={1} value={q.marks}
                  onChange={e => upd(qi, { marks: Number(e.target.value) })}
                  className="w-16 bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5 text-white text-sm font-black text-center focus:outline-none focus:border-blue-500 transition-all" />
              </div>
            </div>

            {/* Question text */}
            <div>
              <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-3">Question Text *</label>
              <textarea rows={3} value={q.questionText}
                onChange={e => upd(qi, { questionText: e.target.value })}
                placeholder="Enter your question here…"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-4 text-white placeholder-[#484f58] text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all resize-none" />
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-[#8b949e] uppercase tracking-widest">Answer Options *</label>
                <span className="text-xs text-[#484f58]">Tap the letter to mark correct answer</span>
              </div>
              <div className="space-y-3">
                {q.options.map((opt, oi) => {
                  const c = OPT[oi]; const sel = q.correctOptionIndex === oi;
                  return (
                    <div key={oi} className={`flex items-center gap-3 rounded-xl border transition-all ${sel ? c.ring : "border-[#30363d] bg-[#0d1117]"}`}>
                      <button type="button" onClick={() => upd(qi, { correctOptionIndex: oi })}
                        className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm transition-all ${sel ? c.active : c.idle}`}>
                        {sel ? "✓" : String.fromCharCode(65 + oi)}
                      </button>
                      <input value={opt} onChange={e => setOpt(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 bg-transparent py-3 pr-4 text-white text-sm placeholder-[#484f58] focus:outline-none" />
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[#484f58]">
                Correct answer: <span className="text-emerald-400 font-bold">{String.fromCharCode(65 + q.correctOptionIndex)}</span>
              </p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex justify-between">
            <button onClick={() => qi > 0 ? setActive(qi - 1) : onBack()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#cdd9e5] rounded-xl font-semibold text-sm hover:bg-[#2d333b] transition-all">
              ← {qi === 0 ? "Test Info" : `Q${qi}`}
            </button>
            {qi < questions.length - 1 ? (
              <button onClick={() => setActive(qi + 1)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
                Next Q{qi + 2} →
              </button>
            ) : (
              <button onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:shadow-emerald-500/20">
                Continue →
              </button>
            )}
          </div>
        </div>
      ))}

      {err && (
        <div className="mt-6 bg-red-900/25 border border-red-700/40 text-red-400 rounded-xl px-5 py-3 text-sm font-semibold">⚠ {err}</div>
      )}

      {/* Dots */}
      <div className="mt-8 pt-6 border-t border-[#21262d] flex items-center justify-between">
        <div className="flex gap-2">{questions.map((q, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${ok(q) ? "bg-emerald-500" : i === active ? "bg-blue-500" : "bg-[#30363d]"}`} />
        ))}</div>
        <span className="text-xs text-[#484f58]">{questions.filter(ok).length}/{count} completed</span>
      </div>
    </div>
  );
};

export default Step2_McqQuestions;
