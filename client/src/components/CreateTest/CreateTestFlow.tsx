// client/src/components/CreateTest/CreateTestFlow.tsx
// UPDATED: adds AI generation step between Step1 and Step2/Step3.
// REPLACE your existing CreateTestFlow.tsx with this file.

import React, { useState } from "react";
import { createTestMetadata, allocateQuestions } from "../../services/testApi";
import type { McqQuestionForm, CodingQuestionForm } from "../../types/test.types";
import Step1_TestInfo       from "./Step1_TestInfo";
import Step2_AiOrManual     from "./Step2_AiOrManual";   // NEW
import Step2_McqQuestions   from "./Step2_McqQuestions";
import Step3_CodingQuestions from "./Step3_CodingQuestions";

interface Props {
  teacherId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface Meta {
  title: string; mcqCount: number; codingCount: number;
  duration: number; totalMarks: number; instructions: string;
}

// Wizard steps including the new AI step
type WizardStep = "info" | "ai_or_manual" | "mcq" | "coding" | "done";

const STEP_LABELS = ["Test Info", "Add Questions", "Done"];
const STEP_MAP: Record<WizardStep, number> = {
  info: 1, ai_or_manual: 2, mcq: 2, coding: 2, done: 3,
};

const AI_URL = "http://localhost:8080/api/ai/generate-questions";

const CreateTestFlow: React.FC<Props> = ({ teacherId, onClose, onSuccess }) => {
  const [step, setStep]       = useState<WizardStep>("info");
  const [meta, setMeta]       = useState<Meta | null>(null);
  const [testId, setTestId]   = useState<number | null>(null);
  const [mcqQs, setMcqQs]     = useState<McqQuestionForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [aiStatus, setAiStatus] = useState(""); // progress message during AI gen

  const stepNum = STEP_MAP[step];

  // ── Step 1: create metadata ────────────────────────────────
  const handleStep1 = async (data: Meta) => {
    setLoading(true); setError("");
    try {
      const id = await createTestMetadata({ ...data, createdByTeacherId: teacherId });
      setTestId(id); setMeta(data);
      setStep("ai_or_manual");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create test");
    } finally { setLoading(false); }
  };

  // ── AI path: call backend → Claude generates → done ────────
  const handleAiGenerate = async (topics: {
    mcqTopic: string; codingTopic: string;
    difficulty: "easy" | "medium" | "hard";
  }) => {
    if (!testId || !meta) return;
    setLoading(true); setError("");
    setAiStatus("Sending request to Claude AI…");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId,
          mcqTopic:    topics.mcqTopic,
          codingTopic: topics.codingTopic,
          mcqCount:    meta.mcqCount,
          codingCount: meta.codingCount,
          difficulty:  topics.difficulty,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      setAiStatus("Questions generated! Publishing test…");
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "AI generation failed. Please try again.");
    } finally {
      setLoading(false);
      setAiStatus("");
    }
  };

  // ── Manual path ────────────────────────────────────────────
  const handleManual = () => {
    if (meta && meta.mcqCount > 0) setStep("mcq");
    else if (meta && meta.codingCount > 0) setStep("coding");
  };

  const handleMcqDone = (qs: McqQuestionForm[]) => {
    setMcqQs(qs);
    if (meta && meta.codingCount > 0) setStep("coding");
    else publishManual(qs, []);
  };

  const handleCodingDone = (codings: CodingQuestionForm[]) => {
    publishManual(mcqQs, codings);
  };

  const publishManual = async (mcqs: McqQuestionForm[], codings: CodingQuestionForm[]) => {
    if (!testId) return;
    setLoading(true); setError("");
    try {
      await allocateQuestions({ testId, questions: [...mcqs, ...codings] });
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to publish test");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0d1117]"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>

      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-[#161b22] border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose}
            className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors text-sm font-medium group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Dashboard
          </button>
          <div className="w-px h-4 bg-[#30363d]" />
          <span className="text-white font-bold text-base tracking-tight">Create New Test</span>
        </div>

        {/* Progress pills */}
        {step !== "done" && (
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = stepNum === n; const done = stepNum > n;
              return (
                <React.Fragment key={n}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active ? "bg-emerald-500 text-white" :
                    done   ? "bg-[#1f2937] text-emerald-400 border border-emerald-800" :
                             "bg-[#1f2937] text-[#8b949e] border border-[#30363d]"
                  }`}>
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      active ? "bg-white text-emerald-600" :
                      done   ? "bg-emerald-500 text-white" :
                               "bg-[#30363d] text-[#8b949e]"
                    }`}>{done ? "✓" : n}</span>
                    {label}
                  </div>
                  {i < 2 && <div className={`w-5 h-px ${done ? "bg-emerald-700" : "bg-[#30363d]"}`} />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </nav>

      {/* Error banner */}
      {error && (
        <div className="mx-8 mt-5 bg-red-900/30 border border-red-700/50 text-red-400 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-3">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
          </svg>
          {error}
        </div>
      )}

      {/* AI status message */}
      {aiStatus && loading && (
        <div className="mx-8 mt-5 bg-emerald-900/20 border border-emerald-700/30 text-emerald-400 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-3">
          <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75"/>
          </svg>
          {aiStatus}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {step === "info" && (
          <Step1_TestInfo onNext={handleStep1} loading={loading} />
        )}

        {step === "ai_or_manual" && meta && (
          <Step2_AiOrManual
            mcqCount={meta.mcqCount}
            codingCount={meta.codingCount}
            onAiGenerate={handleAiGenerate}
            onManual={handleManual}
            loading={loading}
          />
        )}

        {step === "mcq" && meta && (
          <Step2_McqQuestions
            count={meta.mcqCount}
            onNext={handleMcqDone}
            onBack={() => setStep("ai_or_manual")}
          />
        )}

        {step === "coding" && meta && (
          <Step3_CodingQuestions
            count={meta.codingCount}
            onSubmit={handleCodingDone}
            onBack={() => setStep(meta.mcqCount > 0 ? "mcq" : "ai_or_manual")}
            loading={loading}
          />
        )}

        {step === "done" && (
          <div className="flex items-center justify-center min-h-full py-24 px-6">
            <div className="text-center max-w-lg">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Test Published!</h2>
              <p className="text-[#8b949e] mb-1">
                Test <span className="text-emerald-400 font-bold font-mono">#{testId}</span> is now live.
              </p>
              <p className="text-[#6e7681] text-sm mb-10">Students can now take this test from their dashboard.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={onSuccess}
                  className="px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-emerald-500/20 text-sm">
                  Back to Dashboard
                </button>
                <button onClick={() => { setStep("info"); setMeta(null); setTestId(null); setMcqQs([]); setError(""); }}
                  className="px-7 py-3 bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] text-[#cdd9e5] rounded-xl font-bold transition-all text-sm">
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTestFlow;
