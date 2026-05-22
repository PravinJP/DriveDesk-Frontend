// client/src/components/TestResultsPanel.tsx
// FIXED:
//   1. No longer blanks the dashboard — uses a proper overlay/modal pattern
//   2. Fetches data correctly and shows loading/empty/error states
//   3. Full leaderboard with rank, score bar, violation badges

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Attempt {
  attemptId: number; studentId: number; status: string;
  totalScore: number; maxScore: number; percentage: number;
  startedAt: string; submittedAt: string | null;
  tabSwitchCount: number; faceViolationCount: number; micViolationCount: number;
  forcedEnd: boolean; forceEndReason: string | null;
}
interface Summary {
  testTitle: string; totalMarks: number; totalAttempts: number;
  submitted: number; forcedEnded: number; passCount: number;
  passRate: number; averageScore: number; highestScore: number; lowestScore: number;
}
interface Props { testId: number; testTitle: string; onClose: () => void; }

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });
const BASE  = "http://localhost:8080/api/results";

const TestResultsPanel: React.FC<Props> = ({ testId, testTitle, onClose }) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [sortBy,   setSortBy]   = useState<"score" | "student">("score");

  useEffect(() => {
    setLoading(true); setError("");
    Promise.all([
      fetch(`${BASE}/test/${testId}`,         { headers: authH() }),
      fetch(`${BASE}/test/${testId}/summary`, { headers: authH() }),
    ])
    .then(async ([aRes, sRes]) => {
      if (!aRes.ok) throw new Error(`Attempts: HTTP ${aRes.status}`);
      if (!sRes.ok) throw new Error(`Summary: HTTP ${sRes.status}`);
      const [att, sum] = await Promise.all([aRes.json(), sRes.json()]);
      setAttempts(att);
      setSummary(sum);
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, [testId]);

  const sorted = [...attempts].sort((a, b) =>
    sortBy === "score" ? b.totalScore - a.totalScore : a.studentId - b.studentId
  );

  const scoreColor = (pct: number) =>
    pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400";
  const barColor = (pct: number) =>
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  const rankEmoji = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;

  return (
    // Full-screen modal overlay — does NOT replace the dashboard DOM
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity:0, scale:0.95, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }}
        className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#30363d] shrink-0">
          <div>
            <h2 className="text-xl font-black text-white">{testTitle}</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">Test Results & Leaderboard</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#8b949e] hover:text-white bg-[#21262d] hover:bg-[#2d333b] rounded-lg transition-all font-bold text-sm">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-2 border-[#21262d] border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[#8b949e]">Loading results…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="m-8 bg-red-900/25 border border-red-700/40 text-red-400 rounded-xl p-5 text-sm">
              <p className="font-bold mb-1">⚠ Failed to load results</p>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}
                className="mt-3 px-4 py-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg font-semibold transition-all">
                Retry
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Summary stats */}
              {summary && (
                <div className="p-6 border-b border-[#21262d]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                    {[
                      { label: "Attempted",    value: summary.totalAttempts,            color: "text-white" },
                      { label: "Submitted",    value: summary.submitted,                color: "text-emerald-400" },
                      { label: "Force Ended",  value: summary.forcedEnded,              color: "text-red-400" },
                      { label: "Passed (≥50%)", value: `${summary.passCount} (${summary.passRate}%)`, color: "text-amber-400" },
                      { label: "Avg Score",    value: `${summary.averageScore}/${summary.totalMarks}`, color: "text-blue-400" },
                      { label: "Top Score",    value: `${summary.highestScore}/${summary.totalMarks}`, color: "text-violet-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3 text-center">
                        <p className={`text-xl font-black ${color}`}>{value}</p>
                        <p className="text-[10px] text-[#6e7681] mt-1 font-semibold uppercase tracking-widest">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Class average bar */}
                  {summary.submitted > 0 && (
                    <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
                      <div className="flex justify-between text-xs text-[#6e7681] font-semibold mb-2">
                        <span>Class Performance Range</span>
                        <span>{summary.lowestScore} – {summary.highestScore} / {summary.totalMarks}</span>
                      </div>
                      <div className="h-3 bg-[#21262d] rounded-full overflow-hidden relative mb-2">
                        <div className="absolute h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full"
                          style={{
                            left: `${summary.totalMarks > 0 ? (summary.lowestScore / summary.totalMarks) * 100 : 0}%`,
                            width: `${summary.totalMarks > 0 ? ((summary.highestScore - summary.lowestScore) / summary.totalMarks) * 100 : 0}%`,
                          }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6e7681]">Class avg:</span>
                        <div className="flex-1 h-1.5 bg-[#21262d] rounded-full">
                          <div className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${summary.totalMarks > 0 ? (summary.averageScore / summary.totalMarks) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-blue-400 font-bold">{summary.averageScore}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🏆 Leaderboard
                    <span className="text-[#6e7681] font-normal text-sm">({attempts.length} students)</span>
                  </h3>
                  <div className="flex gap-2">
                    {(["score","student"] as const).map(s => (
                      <button key={s} onClick={() => setSortBy(s)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all capitalize ${
                          sortBy === s ? "bg-[#21262d] text-white border border-[#30363d]" : "text-[#6e7681] hover:text-white"
                        }`}>
                        Sort by {s}
                      </button>
                    ))}
                  </div>
                </div>

                {attempts.length === 0 ? (
                  <div className="text-center py-16 text-[#484f58]">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="font-semibold text-base mb-1">No attempts yet</p>
                    <p className="text-sm">Students haven't taken this test yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sorted.map((a, idx) => (
                      <motion.div key={a.attemptId}
                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`bg-[#0d1117] border rounded-xl p-4 transition-all ${
                          idx === 0 && sortBy === "score" ? "border-amber-500/30 bg-amber-500/5"
                          : a.forcedEnd ? "border-red-900/40" : "border-[#21262d]"
                        }`}>
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 bg-[#21262d] text-[#6e7681]">
                            {sortBy === "score" ? rankEmoji(idx) : `#${idx+1}`}
                          </div>

                          {/* Avatar */}
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {String(a.studentId).slice(-2)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-white font-semibold text-sm">Student #{a.studentId}</span>
                              {a.forcedEnd && (
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                  Force Ended
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                a.status === "SUBMITTED"   ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                : a.status === "FORCE_ENDED" ? "text-red-400 bg-red-500/10 border border-red-500/20"
                                                             : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                              }`}>{a.status}</span>
                            </div>
                            {/* Score bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-[#21262d] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor(a.percentage)}`}
                                  style={{ width: `${a.percentage}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right shrink-0 ml-2">
                            <p className={`text-2xl font-black ${scoreColor(a.percentage)}`}>
                              {a.totalScore}
                              <span className="text-[#484f58] text-sm font-normal">/{a.maxScore}</span>
                            </p>
                            <p className={`text-xs font-bold ${scoreColor(a.percentage)}`}>{a.percentage}%</p>
                          </div>

                          {/* Violations */}
                          <div className="text-right text-xs text-[#484f58] font-semibold space-y-0.5 shrink-0 w-20">
                            {a.tabSwitchCount > 0     && <p>👁 {a.tabSwitchCount} tabs</p>}
                            {a.faceViolationCount > 0 && <p>📷 {a.faceViolationCount} face</p>}
                            {a.micViolationCount > 0  && <p>🎙 {a.micViolationCount} noise</p>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TestResultsPanel;
