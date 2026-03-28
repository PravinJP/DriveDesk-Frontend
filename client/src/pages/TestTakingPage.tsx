// client/src/pages/TestTakingPage.tsx
// Full-screen test experience for students.
// Route: /student/test/:testId  (add to App.tsx)

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ProctoringBar   from "../components/student/ProctoringBar";
import QuestionSidebar from "../components/student/QuestionSidebar";
import McqCard         from "../components/student/McqCard";
import CodingCard      from "../components/student/CodingCard";

import {
  useTabDetection, useFullscreen,
  useMicDetection, useFaceDetection,
} from "../hooks/useProctoringHooks";

import {
  getTestWithQuestions, startAttempt, submitTest,
} from "../services/testApi";

import type {
  TestInfo, Question, AnswerPayload,
  Language, SubmitResult,
  McqQuestion, CodingQuestion,
} from "../types/test.types";

// ── Auth: replace with your real AuthContext if available ───────
const getStudentId = () => Number(localStorage.getItem("userId") || "1");

const MAX_TAB_SWITCHES = 3;

type Phase = "loading" | "instructions" | "permissions" | "taking" | "submitting" | "result";

/* ═══════════════════════════════════════════════════════════════ */

const TestTakingPage: React.FC = () => {
  const { testId: rawId } = useParams<{ testId: string }>();
  const navigate           = useNavigate();
  const testId             = Number(rawId);
  const studentId          = getStudentId();

  // ── Core state ────────────────────────────────────────────────
  const [phase, setPhase]         = useState<Phase>("loading");
  const [testInfo, setTestInfo]   = useState<TestInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [result, setResult]       = useState<SubmitResult | null>(null);

  // Answers: questionId → payload
  const [answers, setAnswers] = useState<Map<number, AnswerPayload>>(new Map());

  // ── Timer ─────────────────────────────────────────────────────
  const [secsLeft, setSecsLeft] = useState(0);

  // ── Proctoring ────────────────────────────────────────────────
  const [tabCount, setTabCount]   = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [micCount, setMicCount]   = useState(0);
  const [warning, setWarning]     = useState("");
  const [forced, setForced]       = useState(false);
  const [forceReason, setForceReason] = useState("");

  // ── Confirm modal ─────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);

  const videoRef   = useRef<HTMLVideoElement>(null);
  const submitting = useRef(false);

  // ── Load test on mount ────────────────────────────────────────
  useEffect(() => {
    getTestWithQuestions(testId)
      .then(({ test, questions }) => {
        setTestInfo(test);
        setQuestions(questions);
        setSecsLeft(test.duration * 60);
        setPhase("instructions");
      })
      .catch(e => {
        alert("Could not load test: " + e.message);
        navigate(-1);
      });
  }, [testId]);

  // ── Submit handler ────────────────────────────────────────────
  const doSubmit = useCallback(async (isForced = false, reason = "") => {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("submitting");
    try {
      const res = await submitTest({
        testId, studentId,
        answers: Array.from(answers.values()),
        forcedEnd: isForced, forceEndReason: reason,
        tabSwitchCount: tabCount, faceViolationCount: faceCount, micViolationCount: micCount,
      });
      setResult(res);
      setPhase("result");
    } catch (e) {
      console.error(e);
      submitting.current = false;
      setPhase("taking");
    }
  }, [testId, studentId, answers, tabCount, faceCount, micCount]);

  const forceEnd = useCallback((reason: string) => {
    setForced(true); setForceReason(reason);
    setWarning(`⛔ ${reason}`);
    doSubmit(true, reason);
  }, [doSubmit]);

  // ── Timer countdown ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== "taking") return;
    if (secsLeft <= 0) { forceEnd("Time expired"); return; }
    const t = setInterval(() => {
      setSecsLeft(s => {
        if (s <= 1) { clearInterval(t); forceEnd("Time expired"); }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]); // eslint-disable-line

  // ── Proctoring callbacks ──────────────────────────────────────
  const onTabViolation = useCallback((c: number) => {
    setTabCount(c);
    setWarning(`⚠️ Tab switch detected (${c}/${MAX_TAB_SWITCHES})`);
    if (c >= MAX_TAB_SWITCHES) forceEnd("Too many tab switches");
  }, [forceEnd]);

  const onFaceViolation = useCallback((c: number) => {
    setFaceCount(c); setWarning("⚠️ Face not visible — look at the camera");
  }, []);

  const onMicViolation = useCallback((c: number) => {
    setMicCount(c); setWarning("⚠️ Noise detected — please stay quiet");
  }, []);

  const onFsExit = useCallback(() => {
    if (phase === "taking") setWarning("⚠️ You left fullscreen — please return to fullscreen");
  }, [phase]);

  useTabDetection(phase === "taking" ? attemptId : null, onTabViolation);
  useMicDetection(phase === "taking" ? attemptId : null, onMicViolation);
  useFaceDetection(phase === "taking" ? attemptId : null, videoRef,
    () => forceEnd("Multiple faces detected in camera"), onFaceViolation);
  const { enterFullscreen } = useFullscreen(onFsExit);

  // ── Start test ────────────────────────────────────────────────
  const handleStart = async () => {
    try {
      const id = await startAttempt(testId, studentId);
      setAttemptId(id);
      enterFullscreen();
      setPhase("taking");
    } catch (e: unknown) {
      alert("Failed to start test: " + (e instanceof Error ? e.message : ""));
    }
  };

  // ── Answer helpers ────────────────────────────────────────────
  const setMcqAns = (qId: number, opt: number) =>
    setAnswers(p => { const m = new Map(p); m.set(qId, { questionId: qId, questionType: "MCQ", selectedOptionIndex: opt }); return m; });

  const setCodingAns = (qId: number, code: string, lang: Language) =>
    setAnswers(p => { const m = new Map(p); m.set(qId, { questionId: qId, questionType: "CODING", codeSubmission: code, language: lang }); return m; });

  const getAns = (qId: number) => answers.get(qId);

  // ── Split question lists ───────────────────────────────────────
  const mcqQs    = questions.filter(q => q.questionType === "MCQ")    as McqQuestion[];
  const codingQs = questions.filter(q => q.questionType === "CODING") as CodingQuestion[];

  // ── Phase: loading ─────────────────────────────────────────────
  if (phase === "loading") return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col items-center justify-center gap-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-10 h-10 border-2 border-[#21262d] border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-[#8b949e] text-sm">Loading test…</p>
    </div>
  );

  // ── Phase: instructions ────────────────────────────────────────
  if (phase === "instructions" && testInfo) return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl w-full max-w-xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1c2333] to-[#0d1117] p-8 border-b border-[#30363d]">
          <div className="flex flex-wrap gap-2 mb-4">
            {testInfo.mcqCount > 0    && <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">{testInfo.mcqCount} MCQ</span>}
            {testInfo.codingCount > 0 && <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">{testInfo.codingCount} Coding</span>}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-4">{testInfo.title}</h1>
          <div className="flex flex-wrap gap-5 text-sm text-[#8b949e]">
            <span>⏱ <strong className="text-white">{testInfo.duration}</strong> min</span>
            <span>📝 <strong className="text-white">{testInfo.numberOfQuestions}</strong> questions</span>
            <span>🏆 <strong className="text-white">{testInfo.totalMarks}</strong> marks</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Teacher instructions */}
          {testInfo.instructions && (
            <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-5">
              <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-2">Instructions</p>
              <p className="text-[#cdd9e5] text-sm leading-relaxed">{testInfo.instructions}</p>
            </div>
          )}

          {/* Proctoring rules */}
          <div>
            <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-4">Proctoring Rules</p>
            <ul className="space-y-3">
              {[
                ["🔒", "Test runs in fullscreen — do not exit"],
                [`🚫`, `Maximum ${MAX_TAB_SWITCHES} tab switches — exceeding this ends your test`],
                ["📷", "Camera will be active — keep your face clearly visible"],
                ["🎙", "Microphone is monitored — maintain silence"],
                ["👁", "Multiple faces in camera = immediate force end"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-start gap-3 text-sm text-[#8b949e]">
                  <span className="text-base shrink-0 leading-5">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={() => setPhase("permissions")}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/20"
          >
            Proceed to Camera Check →
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── Phase: permissions ─────────────────────────────────────────
  if (phase === "permissions") return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl w-full max-w-md p-8 space-y-6"
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📷</div>
          <h2 className="text-2xl font-black text-white mb-2">Camera & Mic Check</h2>
          <p className="text-[#8b949e] text-sm">Click <strong className="text-white">Allow</strong> when your browser asks for camera and microphone access.</p>
        </div>

        {/* Live camera preview */}
        <div className="relative rounded-xl overflow-hidden bg-[#0d1117] border border-[#21262d] aspect-video">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
            📷 Live Preview
          </div>
        </div>

        <ul className="space-y-2">
          {["Well-lit room", "Face clearly visible", "Only you in frame", "Quiet environment"].map(tip => (
            <li key={tip} className="flex items-center gap-2 text-sm text-[#8b949e]">
              <span className="text-emerald-500 font-bold">✓</span> {tip}
            </li>
          ))}
        </ul>

        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/20"
        >
          🚀 Start Test Now
        </button>
      </motion.div>
    </div>
  );

  // ── Phase: submitting ──────────────────────────────────────────
  if (phase === "submitting") return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col items-center justify-center gap-5"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-12 h-12 border-2 border-[#21262d] border-t-emerald-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-bold mb-1">Submitting your test…</p>
        <p className="text-[#8b949e] text-sm">Grading your answers, please wait.</p>
      </div>
    </div>
  );

  // ── Phase: result ──────────────────────────────────────────────
  if (phase === "result" && result) {
    const pct = Math.round((result.totalScore / result.maxScore) * 100);
    const emoji = pct >= 75 ? "🎉" : pct >= 50 ? "📊" : "📝";
    const grade = pct >= 75 ? "Excellent!" : pct >= 50 ? "Good effort!" : "Keep practising!";
    return (
      <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#161b22] border border-[#30363d] rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl space-y-6"
        >
          <div className="text-5xl">{emoji}</div>
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              {forced ? "Test Ended Early" : "Submitted!"}
            </h2>
            <p className="text-[#8b949e] text-sm">{forced ? "" : grade}</p>
            {forced && (
              <p className="mt-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{forceReason}</p>
            )}
          </div>

          {/* Score circle */}
          <div className="w-36 h-36 rounded-full bg-emerald-500/10 border-4 border-emerald-500/25 flex flex-col items-center justify-center mx-auto">
            <span className="text-4xl font-black text-emerald-400">{result.totalScore}</span>
            <span className="text-[#6e7681] text-sm">/ {result.maxScore}</span>
          </div>

          <p className="text-3xl font-black text-white">{pct}%</p>

          {/* Proctoring summary */}
          <div className="flex justify-center gap-4 text-xs text-[#484f58] font-semibold">
            <span>👁 Tabs: {tabCount}</span>
            <span>📷 Face: {faceCount}</span>
            <span>🎙 Noise: {micCount}</span>
          </div>

          <button
            onClick={() => navigate("/student")}
            className="w-full py-3 bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] text-white font-bold rounded-xl transition-all text-sm"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Phase: taking ──────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Hidden face-detection video (small pip in corner) */}
      <video
        ref={videoRef}
        autoPlay muted playsInline
        className="fixed bottom-3 right-3 w-20 h-16 rounded-lg border border-[#30363d] object-cover z-50 opacity-80"
      />

      {/* Top proctoring bar */}
      <ProctoringBar
        testTitle={testInfo?.title ?? ""}
        secondsLeft={secsLeft}
        tabCount={tabCount}
        faceCount={faceCount}
        micCount={micCount}
        onSubmit={() => setShowConfirm(true)}
      />

      {/* Warning banner */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-6 py-2.5 bg-amber-500/8 border-b border-amber-500/20 text-amber-400 text-sm font-semibold shrink-0 overflow-hidden"
          >
            <span>{warning}</span>
            <button onClick={() => setWarning("")} className="ml-4 text-amber-500 hover:text-amber-300 text-base">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <QuestionSidebar
          questions={questions}
          answers={answers}
          onSubmit={() => setShowConfirm(true)}
        />

        {/* Questions scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* MCQ section */}
          {mcqQs.length > 0 && (
            <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.12em] pb-3 border-b border-[#21262d]">
              Multiple Choice Questions
            </div>
          )}
          {mcqQs.map((q, i) => (
            <McqCard
              key={q.id}
              question={q}
              index={i}
              selected={getAns(q.id)?.selectedOptionIndex}
              onChange={opt => setMcqAns(q.id, opt)}
            />
          ))}

          {/* Coding section */}
          {codingQs.length > 0 && (
            <div className="text-xs font-bold text-violet-400 uppercase tracking-[0.12em] py-3 border-b border-[#21262d]">
              Coding Problems
            </div>
          )}
          {codingQs.map((q, i) => {
            const a = getAns(q.id);
            return (
              <CodingCard
                key={q.id}
                question={q}
                index={mcqQs.length + i}
                code={a?.codeSubmission ?? ""}
                language={(a?.language ?? "python3") as Language}
                onCodeChange={code => setCodingAns(q.id, code, (a?.language ?? "python3") as Language)}
                onLanguageChange={lang => setCodingAns(q.id, a?.codeSubmission ?? "", lang)}
              />
            );
          })}

          {/* Bottom submit */}
          <div className="flex justify-center pb-10">
            <button
              onClick={() => setShowConfirm(true)}
              className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all hover:shadow-2xl hover:shadow-emerald-500/20 text-base"
            >
              🏁 Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* ── Confirm Submit Modal ── */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5"
            >
              <div className="text-4xl">🏁</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Submit Test?</h3>
                <p className="text-[#8b949e] text-sm">
                  You have answered <strong className="text-white">{answers.size}</strong> of <strong className="text-white">{questions.length}</strong> questions.
                  <br />This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] text-white font-semibold rounded-xl transition-all text-sm"
                >
                  Keep Going
                </button>
                <button
                  onClick={() => { setShowConfirm(false); doSubmit(); }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Yes, Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestTakingPage;
