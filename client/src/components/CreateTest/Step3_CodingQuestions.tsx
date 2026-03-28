// client/src/components/CreateTest/Step3_CodingQuestions.tsx

import React, { useState } from "react";
import type { CodingQuestionForm } from "../../types/test.types";

interface Props {
  count: number;
  onSubmit: (qs: CodingQuestionForm[]) => void;
  onBack: () => void;
  loading: boolean;
}

const mkCoding = (): CodingQuestionForm => ({
  questionType: "CODING", title: "", description: "",
  inputFormat: "", outputFormat: "", constraints: "",
  sampleInput: "", sampleOutput: "", marks: 10,
  hiddenTestCases: [{ input: "", expectedOutput: "" }],
});

const Step3_CodingQuestions: React.FC<Props> = ({ count, onSubmit, onBack, loading }) => {
  const [questions, setQs] = useState<CodingQuestionForm[]>(() => Array.from({ length: count }, mkCoding));
  const [active, setActive] = useState(0);
  const [err, setErr]       = useState("");

  const upd = (i: number, patch: Partial<CodingQuestionForm>) =>
    setQs(prev => prev.map((q, idx) => idx === i ? { ...q, ...patch } : q));

  const addTC = (qi: number) =>
    upd(qi, { hiddenTestCases: [...questions[qi].hiddenTestCases, { input: "", expectedOutput: "" }] });

  const removeTC = (qi: number, ti: number) =>
    upd(qi, { hiddenTestCases: questions[qi].hiddenTestCases.filter((_, i) => i !== ti) });

  const setTC = (qi: number, ti: number, f: "input" | "expectedOutput", v: string) =>
    upd(qi, { hiddenTestCases: questions[qi].hiddenTestCases.map((tc, i) => i === ti ? { ...tc, [f]: v } : tc) });

  const ok = (q: CodingQuestionForm) =>
    q.title.trim() && q.description.trim() && q.sampleInput.trim() && q.sampleOutput.trim() &&
    q.hiddenTestCases.length > 0 && q.hiddenTestCases.every(tc => tc.input.trim() && tc.expectedOutput.trim());

  const validate = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim())        return `Prob ${i+1}: Title required.`;
      if (!q.description.trim())  return `Prob ${i+1}: Description required.`;
      if (!q.sampleInput.trim() || !q.sampleOutput.trim()) return `Prob ${i+1}: Sample I/O required.`;
      if (q.hiddenTestCases.length === 0) return `Prob ${i+1}: Add at least 1 test case.`;
      for (let ti = 0; ti < q.hiddenTestCases.length; ti++) {
        const tc = q.hiddenTestCases[ti];
        if (!tc.input.trim() || !tc.expectedOutput.trim()) return `Prob ${i+1} TC${ti+1}: Both fields required.`;
      }
      if (q.marks < 1) return `Prob ${i+1}: Marks must be ≥ 1.`;
    }
    return "";
  };

  const handleSubmit = () => {
    const e = validate(); if (e) return setErr(e);
    setErr(""); onSubmit(questions);
  };

  const Field = ({ label, value, onChange, rows = 1, mono = false, placeholder = "" }: {
    label: string; value: string; onChange: (v: string) => void;
    rows?: number; mono?: boolean; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-2">{label}</label>
      {rows > 1 ? (
        <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm placeholder-[#484f58] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all resize-none ${mono ? "font-mono text-emerald-400" : "text-white"}`} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm placeholder-[#484f58] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all ${mono ? "font-mono text-emerald-400" : "text-white"}`} />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h2 className="text-5xl font-black text-white mb-3 tracking-tight">Coding Problems</h2>
          <p className="text-[#8b949e]">Define {count} problem{count > 1 ? "s" : ""} with hidden test cases for Judge0 auto-grading.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end max-w-xs">
          {questions.map((q, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                active === i ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" :
                ok(q)        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                               "bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:border-[#8b949e]"
              }`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {questions.map((q, qi) => qi !== active ? null : (
        <div key={qi} className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center text-white font-black text-sm">{qi + 1}</div>
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Coding Problem</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8b949e] uppercase tracking-widest">Marks</span>
                <input type="number" min={1} value={q.marks} onChange={e => upd(qi, { marks: Number(e.target.value) })}
                  className="w-16 bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5 text-white text-sm font-black text-center focus:outline-none focus:border-violet-500 transition-all" />
              </div>
            </div>

            <Field label="Problem Title *" value={q.title} onChange={v => upd(qi, { title: v })} placeholder="e.g. Two Sum, Longest Common Subsequence" />
            <Field label="Problem Description *" value={q.description} onChange={v => upd(qi, { description: v })} rows={4} placeholder="Describe clearly what the program must do, including edge cases." />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Input Format" value={q.inputFormat} onChange={v => upd(qi, { inputFormat: v })} rows={2} placeholder={"First line: N\nNext N integers"} />
              <Field label="Output Format" value={q.outputFormat} onChange={v => upd(qi, { outputFormat: v })} rows={2} placeholder="Single integer" />
            </div>

            <Field label="Constraints" value={q.constraints} onChange={v => upd(qi, { constraints: v })} placeholder="1 ≤ N ≤ 10⁵, 1 ≤ A[i] ≤ 10⁹" mono />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Sample Input *" value={q.sampleInput} onChange={v => upd(qi, { sampleInput: v })} rows={4} mono placeholder={"5\n1 2 3 4 5"} />
              <Field label="Sample Output *" value={q.sampleOutput} onChange={v => upd(qi, { sampleOutput: v })} rows={4} mono placeholder="15" />
            </div>

            {/* Hidden test cases */}
            <div className="border-t border-[#21262d] pt-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-sm font-bold text-white">Hidden Test Cases *</h4>
                  <p className="text-xs text-[#6e7681] mt-0.5">Auto-graded by Judge0 — students never see these</p>
                </div>
                <button type="button" onClick={() => addTC(qi)}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg hover:bg-violet-500/20 transition-all">
                  + Add Case
                </button>
              </div>
              <div className="space-y-4">
                {q.hiddenTestCases.map((tc, ti) => (
                  <div key={ti} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#484f58] uppercase tracking-widest">Test Case {ti + 1}</span>
                      {q.hiddenTestCases.length > 1 && (
                        <button type="button" onClick={() => removeTC(qi, ti)}
                          className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(["input", "expectedOutput"] as const).map(f => (
                        <div key={f}>
                          <label className="block text-xs font-semibold text-[#6e7681] mb-1.5 capitalize">{f === "expectedOutput" ? "Expected Output" : "Input"}</label>
                          <textarea rows={3} value={tc[f]} onChange={e => setTC(qi, ti, f, e.target.value)} placeholder={f === "input" ? "Test input" : "Expected output"}
                            className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2.5 text-emerald-400 text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-violet-500 transition-all resize-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex justify-between">
            <button onClick={() => qi > 0 ? setActive(qi - 1) : onBack()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#cdd9e5] rounded-xl font-semibold text-sm hover:bg-[#2d333b] transition-all">
              ← {qi === 0 ? "Back" : `Problem ${qi}`}
            </button>
            {qi < questions.length - 1 ? (
              <button onClick={() => setActive(qi + 1)}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all">
                Next Problem {qi + 2} →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#21262d] disabled:text-[#484f58] text-white rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:shadow-emerald-500/20 disabled:cursor-not-allowed">
                {loading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75"/></svg> Publishing…</> : "🚀 Publish Test"}
              </button>
            )}
          </div>
        </div>
      ))}

      {err && <div className="mt-6 bg-red-900/25 border border-red-700/40 text-red-400 rounded-xl px-5 py-3 text-sm font-semibold">⚠ {err}</div>}

      <div className="mt-8 pt-6 border-t border-[#21262d] flex items-center justify-between">
        <div className="flex gap-2">{questions.map((q, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${ok(q) ? "bg-emerald-500" : i === active ? "bg-violet-500" : "bg-[#30363d]"}`} />
        ))}</div>
        <span className="text-xs text-[#484f58]">{questions.filter(ok).length}/{count} completed</span>
      </div>
    </div>
  );
};

export default Step3_CodingQuestions;
