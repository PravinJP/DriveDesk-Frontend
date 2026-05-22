// client/src/pages/TestTakingPage.tsx
// FIXES:
//   1. Face detection - proper async init, video ready check, error handling per frame
//   2. Camera stream started in permissions phase so preview works
//   3. Force end on: 3+ tab switches, 2+ faces detected, 3 no-face warnings, 5 noise
//   4. Result scorecard shown after submit
//   5. Re-attempt guard

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ProctoringBar   from "../components/student/ProctoringBar";
import QuestionSidebar from "../components/student/QuestionSidebar";
import McqCard         from "../components/student/McqCard";
import CodingCard      from "../components/student/CodingCard";

import { useTabDetection, useFullscreen, useMicDetection } from "../hooks/useProctoringHooks";
import { getTestWithQuestions, startAttempt, submitTest, recordViolation } from "../services/testApi";

import type {
  TestInfo, Question, AnswerPayload, Language,
  McqQuestion, CodingQuestion, SubmitResult,
} from "../types/test.types";

// ── Config ──────────────────────────────────────────────────────
const BASE_URL        = "http://localhost:8080/api";
const MAX_TAB_SWITCHES   = 3;
const MAX_FACE_VIOLATIONS = 3;  // "no face" warnings before force end
const MAX_MIC_VIOLATIONS  = 5;  // loud noise before force end

const getStudentId = () =>
  Number(localStorage.getItem("userId") ?? localStorage.getItem("id") ?? "0");
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

type Phase = "loading" | "instructions" | "permissions" | "taking" | "submitting" | "result";

// ════════════════════════════════════════════════════════════════

const TestTakingPage: React.FC = () => {
  const { testId: rawId } = useParams<{ testId: string }>();
  const navigate           = useNavigate();
  const testId             = Number(rawId);
  const studentId          = getStudentId();

  // Core state
  const [phase, setPhase]         = useState<Phase>("loading");
  const [testInfo, setTestInfo]   = useState<TestInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [result, setResult]       = useState<SubmitResult | null>(null);
  const [answers, setAnswers]     = useState<Map<number, AnswerPayload>>(new Map());
  const [secsLeft, setSecsLeft]   = useState(0);

  // Proctoring UI state
  const [tabCount, setTabCount]   = useState(0);
  const [faceCount, setFaceCount] = useState(0);
  const [micCount, setMicCount]   = useState(0);
  const [warning, setWarning]     = useState("");
  const [forced, setForced]       = useState(false);
  const [forceReason, setForceReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Camera / face detection
  const videoRef      = useRef<HTMLVideoElement>(null);
  const camStreamRef  = useRef<MediaStream | null>(null);
  const faceTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceApiLoaded = useRef(false);

  // Counters in refs so callbacks always see latest
  const tabRef  = useRef(0);
  const faceRef = useRef(0);
  const micRef  = useRef(0);
  const submitting = useRef(false);

  // ── 1. Load test & guard re-attempt ───────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const cRes = await fetch(`${BASE_URL}/tests/completed-by-student/${studentId}`, { headers: authH() });
        if (cRes.ok) {
          const ids: number[] = await cRes.json();
          if (ids.includes(testId)) {
            alert("You have already completed this test.");
            navigate("/student");
            return;
          }
        }
      } catch { /* silently skip — don't block test loading */ }

      getTestWithQuestions(testId)
        .then(({ test, questions }) => {
          setTestInfo(test);
          setQuestions(questions);
          setSecsLeft(test.duration * 60);
          setPhase("instructions");
        })
        .catch(e => { alert("Could not load test: " + e.message); navigate("/student"); });
    })();
  }, [testId, studentId]); // eslint-disable-line

  // ── 2. Submit helper ───────────────────────────────────────────
  const doSubmit = useCallback(async (isForced = false, reason = "") => {
    if (submitting.current) return;
    submitting.current = true;
    stopCamera();
    setPhase("submitting");
    try {
      const res = await submitTest({
        testId, studentId,
        answers: Array.from(answers.values()),
        forcedEnd: isForced, forceEndReason: reason,
        tabSwitchCount:     tabRef.current,
        faceViolationCount: faceRef.current,
        micViolationCount:  micRef.current,
      });
      setResult(res);
      setPhase("result");
    } catch (e) {
      console.error(e);
      submitting.current = false;
      setPhase("taking");
    }
  }, [testId, studentId, answers]); // eslint-disable-line

  const forceEnd = useCallback((reason: string) => {
    if (submitting.current) return;
    setForced(true); setForceReason(reason);
    setWarning(`⛔ ${reason}`);
    doSubmit(true, reason);
  }, [doSubmit]);

  // ── 3. Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "taking") return;
    if (secsLeft <= 0) { forceEnd("Time expired"); return; }
    const t = setInterval(() => setSecsLeft(s => {
      if (s <= 1) { clearInterval(t); forceEnd("Time expired"); }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]); // eslint-disable-line

  // ── 4. Camera helpers ──────────────────────────────────────────
  const stopCamera = () => {
    if (faceTimerRef.current) { clearInterval(faceTimerRef.current); faceTimerRef.current = null; }
    camStreamRef.current?.getTracks().forEach(t => t.stop());
  };

  /**
   * Starts camera preview for the permissions page.
   * Does NOT start face detection yet.
   */
  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      camStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Camera preview failed:", err);
    }
  };

  /**
   * Initialises face-api.js detection loop.
   * Called AFTER the test starts (phase = "taking").
   * Uses the existing camera stream from the permissions page.
   */
  const startFaceDetection = useCallback(async (currentAttemptId: number) => {
    try {
      // Dynamically import — zero build-time cost
      const faceapi = await import("face-api.js");

      // Load models once
      if (!faceApiLoaded.current) {
        console.log("[Proctoring] Loading face-api models from /models/ …");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        ]);
        faceApiLoaded.current = true;
        console.log("[Proctoring] Models loaded ✓");
      }

      // Ensure camera stream is still alive (it was started in permissions phase)
      if (!camStreamRef.current || camStreamRef.current.getTracks().every(t => t.readyState === "ended")) {
        console.log("[Proctoring] Restarting camera stream …");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        camStreamRef.current = stream;
      }

      // Attach stream to the pip video element
      if (videoRef.current) {
        videoRef.current.srcObject = camStreamRef.current;
        await videoRef.current.play().catch(() => {});
      }

      console.log("[Proctoring] Face detection loop started");

      // Detection loop — every 3 seconds
      faceTimerRef.current = setInterval(async () => {
        // Skip if video not ready
        if (!videoRef.current || videoRef.current.readyState < 2) {
          console.log("[Proctoring] Video not ready, skipping frame");
          return;
        }

        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          );

          console.log(`[Proctoring] Faces detected: ${detections.length}`);

          if (detections.length === 0) {
            faceRef.current += 1;
            setFaceCount(faceRef.current);
            setWarning(`⚠️ No face detected — ${faceRef.current}/${MAX_FACE_VIOLATIONS}`);
            recordViolation({
              attemptId: currentAttemptId,
              violationType: "FACE_VIOLATION",
              details: `No face detected. Count: ${faceRef.current}`,
            }).catch(() => {});
            if (faceRef.current >= MAX_FACE_VIOLATIONS) {
              forceEnd("Face not detected too many times");
            }
          } else if (detections.length >= 2) {
            recordViolation({
              attemptId: currentAttemptId,
              violationType: "FACE_VIOLATION",
              details: `${detections.length} faces — force ended`,
            }).catch(() => {});
            forceEnd(`Multiple faces detected (${detections.length} people in frame)`);
          }
          // 1 face = good, do nothing

        } catch (err) {
          // Don't crash on detection error — just log and skip frame
          console.warn("[Proctoring] Detection error on frame:", err);
        }
      }, 3000);

    } catch (err) {
      // Camera unavailable or model load failure
      // Log it but DON'T block the test — just disable face proctoring gracefully
      console.warn("[Proctoring] Face detection unavailable:", err);
    }
  }, [forceEnd]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  // ── 5. Tab + Mic proctoring ────────────────────────────────────
  const onTabViolation = useCallback((c: number) => {
    tabRef.current = c; setTabCount(c);
    setWarning(`⚠️ Tab switch detected (${c}/${MAX_TAB_SWITCHES})`);
    if (c >= MAX_TAB_SWITCHES) forceEnd("Too many tab switches");
  }, [forceEnd]);

  const onMicViolation = useCallback((c: number) => {
    micRef.current = c; setMicCount(c);
    setWarning(`⚠️ Loud noise detected (${c}/${MAX_MIC_VIOLATIONS})`);
    if (c >= MAX_MIC_VIOLATIONS) forceEnd("Too many noise violations");
  }, [forceEnd]);

  const onFsExit = useCallback(() => {
    if (phase === "taking") setWarning("⚠️ Please return to fullscreen!");
  }, [phase]);

  useTabDetection(phase === "taking" ? attemptId : null, onTabViolation);
  useMicDetection(phase === "taking" ? attemptId : null, onMicViolation);
  const { enterFullscreen } = useFullscreen(onFsExit);

  // ── 6. Start test ──────────────────────────────────────────────
  const handleStart = async () => {
    try {
      const id = await startAttempt(testId, studentId);
      setAttemptId(id);
      enterFullscreen();
      setPhase("taking");
      // Start face detection after a short delay to let layout settle
      setTimeout(() => startFaceDetection(id), 800);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("ALREADY_COMPLETED") || msg.includes("already completed")) {
        alert("You have already completed this test.");
        navigate("/student");
      } else {
        alert("Failed to start test: " + msg);
      }
    }
  };

  // ── 7. Answer helpers ──────────────────────────────────────────
  const setMcqAns = (qId: number, opt: number) =>
    setAnswers(p => { const m = new Map(p); m.set(qId, { questionId: qId, questionType: "MCQ", selectedOptionIndex: opt }); return m; });

  const setCodingAns = (qId: number, code: string, lang: Language) =>
    setAnswers(p => { const m = new Map(p); m.set(qId, { questionId: qId, questionType: "CODING", codeSubmission: code, language: lang }); return m; });

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const mcqQs    = questions.filter(q => q.questionType === "MCQ")    as McqQuestion[];
  const codingQs = questions.filter(q => q.questionType === "CODING") as CodingQuestion[];

  // ════════════════════════════════════════════════════════════════
  // RENDER PHASES
  // ════════════════════════════════════════════════════════════════

  if (phase === "loading") return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col items-center justify-center gap-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="w-10 h-10 border-2 border-[#21262d] border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-[#8b949e] text-sm">Loading test…</p>
    </div>
  );

  // ── Instructions ───────────────────────────────────────────────
  if (phase === "instructions" && testInfo) return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl w-full max-w-xl">
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
        <div className="p-8 space-y-5">
          {testInfo.instructions && (
            <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-5">
              <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-2">Instructions</p>
              <p className="text-[#cdd9e5] text-sm leading-relaxed">{testInfo.instructions}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-4">Proctoring Rules</p>
            <ul className="space-y-3">
              {[
                ["🔒", "Test runs in fullscreen — do not exit"],
                ["🚫", `Max ${MAX_TAB_SWITCHES} tab switches — test force-ends automatically`],
                ["📷", `Camera active — ${MAX_FACE_VIOLATIONS} missed face checks = force end`],
                ["🎙", `Mic monitored — ${MAX_MIC_VIOLATIONS} loud noises = force end`],
                ["👁", "2+ faces in camera = immediate force end"],
              ].map(([icon, text]) => (
                <li key={String(text)} className="flex items-start gap-3 text-sm text-[#8b949e]">
                  <span className="text-base shrink-0 leading-5">{icon}</span><span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-8 pb-8">
          <button onClick={() => { setPhase("permissions"); startCameraPreview(); }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/20">
            Proceed to Camera Check →
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── Permissions ────────────────────────────────────────────────
  if (phase === "permissions") return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📷</div>
          <h2 className="text-2xl font-black text-white mb-2">Camera Check</h2>
          <p className="text-[#8b949e] text-sm">
            You should see your face in the preview below.<br />
            If not, check that you allowed camera access.
          </p>
        </div>

        {/* Live preview — stream already started */}
        <div className="relative rounded-xl overflow-hidden bg-[#0d1117] border border-[#21262d] aspect-video">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
            📷 Live Preview
          </div>
        </div>

        <ul className="space-y-2">
          {["Well-lit room", "Face clearly visible", "Only you in frame", "Quiet environment"].map(t => (
            <li key={t} className="flex items-center gap-2 text-sm text-[#8b949e]">
              <span className="text-emerald-500 font-bold">✓</span> {t}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button onClick={() => { stopCamera(); setPhase("instructions"); }}
            className="flex-1 py-3 bg-[#21262d] border border-[#30363d] text-white font-semibold rounded-xl text-sm hover:bg-[#2d333b] transition-all">
            ← Back
          </button>
          <button onClick={handleStart}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/20">
            🚀 Start Test
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── Submitting ─────────────────────────────────────────────────
  if (phase === "submitting") return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col items-center justify-center gap-5"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="w-12 h-12 border-2 border-[#21262d] border-t-emerald-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-bold mb-1">Submitting your test…</p>
        <p className="text-[#8b949e] text-sm">Grading answers — please wait.</p>
      </div>
    </div>
  );

  // ── Result ─────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const pct   = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
    const grade =
      pct >= 90 ? { label: "Outstanding!", color: "text-emerald-400", barCls: "from-emerald-500 to-teal-400", emoji: "🏆" } :
      pct >= 75 ? { label: "Excellent!",   color: "text-emerald-400", barCls: "from-emerald-500 to-teal-400", emoji: "🎉" } :
      pct >= 60 ? { label: "Good Job!",    color: "text-blue-400",    barCls: "from-blue-500 to-cyan-400",    emoji: "👍" } :
      pct >= 40 ? { label: "Keep Going!",  color: "text-amber-400",   barCls: "from-amber-500 to-yellow-400", emoji: "📚" } :
                  { label: "Try Again",    color: "text-red-400",     barCls: "from-red-500 to-orange-400",   emoji: "💪" };

    return (
      <div className="fixed inset-0 bg-[#0d1117] overflow-y-auto flex items-start justify-center p-4 py-10"
        style={{ fontFamily: "'DM Sans',sans-serif" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl space-y-5">

          {/* Header */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 text-center bg-gradient-to-br from-[#1c2333] to-[#161b22] border-b border-[#30363d]">
              <div className="text-5xl mb-4">{grade.emoji}</div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                {forced ? "Test Ended Early" : "Test Completed!"}
              </h2>
              <p className={`text-lg font-bold ${grade.color}`}>
                {forced ? forceReason : grade.label}
              </p>
            </div>

            <div className="p-8">
              {/* Score circle */}
              <div className="flex justify-center mb-8">
                <div className="w-44 h-44 rounded-full bg-[#0d1117] border-4 border-[#21262d] flex flex-col items-center justify-center">
                  <span className={`text-5xl font-black ${grade.color}`}>{result.totalScore}</span>
                  <span className="text-[#6e7681] text-sm">/ {result.maxScore}</span>
                  <span className={`text-2xl font-black ${grade.color} mt-1`}>{pct}%</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Total Score",  value: `${result.totalScore} / ${result.maxScore}`, color: grade.color },
                  { label: "Percentage",   value: `${pct}%`,                                   color: grade.color },
                  { label: "Tab Switches", value: tabRef.current,  color: tabRef.current  > 0 ? "text-amber-400" : "text-[#6e7681]" },
                  { label: "Face Alerts",  value: faceRef.current, color: faceRef.current > 0 ? "text-amber-400" : "text-[#6e7681]" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 text-center">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-[#6e7681] mt-1 font-semibold">{label}</p>
                  </div>
                ))}
              </div>

              {/* Score bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-[#6e7681] mb-2 font-semibold">
                  <span>Performance</span><span>{pct}%</span>
                </div>
                <div className="h-4 bg-[#21262d] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${grade.barCls}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#484f58] mt-1">
                  <span>0</span><span>Pass mark (50%)</span><span>100%</span>
                </div>
              </div>

              {/* Proctoring summary */}
              {(tabRef.current > 0 || faceRef.current > 0 || micRef.current > 0 || forced) && (
                <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest mb-3">Proctoring Log</p>
                  <div className="space-y-2 text-sm">
                    {tabRef.current > 0  && <div className="flex justify-between"><span className="text-[#8b949e]">👁 Tab switches</span><span className={tabRef.current >= MAX_TAB_SWITCHES ? "text-red-400 font-bold" : "text-amber-400"}>{tabRef.current}</span></div>}
                    {faceRef.current > 0 && <div className="flex justify-between"><span className="text-[#8b949e]">📷 Face alerts</span><span className="text-amber-400">{faceRef.current}</span></div>}
                    {micRef.current > 0  && <div className="flex justify-between"><span className="text-[#8b949e]">🎙 Noise alerts</span><span className="text-amber-400">{micRef.current}</span></div>}
                    {forced && <div className="flex justify-between"><span className="text-[#8b949e]">⛔ Force ended</span><span className="text-red-400 font-bold">Yes</span></div>}
                  </div>
                </div>
              )}

              <button onClick={() => navigate("/student")}
                className="w-full py-3.5 bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] text-white font-bold rounded-xl transition-all">
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Taking ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* PiP camera (face detection video) */}
      <video ref={videoRef} autoPlay muted playsInline
        className="fixed bottom-3 right-3 w-24 h-18 rounded-lg border-2 border-[#30363d] object-cover z-50 opacity-90"
        style={{ height: "72px" }} />

      <ProctoringBar
        testTitle={testInfo?.title ?? ""}
        secondsLeft={secsLeft}
        tabCount={tabCount} faceCount={faceCount} micCount={micCount}
        onSubmit={() => setShowConfirm(true)}
      />

      {/* Warning banner */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-6 py-2.5 bg-amber-900/30 border-b border-amber-500/30 text-amber-400 text-sm font-semibold shrink-0 overflow-hidden">
            <span>{warning}</span>
            <button onClick={() => setWarning("")} className="ml-4 text-amber-400 hover:text-white text-lg">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar questions={questions} answers={answers} onSubmit={() => setShowConfirm(true)} />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mcqQs.length > 0 && (
            <div className="text-xs font-bold text-blue-400 uppercase tracking-[0.12em] pb-3 border-b border-[#21262d]">
              Multiple Choice Questions
            </div>
          )}
          {mcqQs.map((q, i) => (
            <McqCard key={q.id} question={q} index={i}
              selected={answers.get(q.id)?.selectedOptionIndex}
              onChange={opt => setMcqAns(q.id, opt)} />
          ))}

          {codingQs.length > 0 && (
            <div className="text-xs font-bold text-violet-400 uppercase tracking-[0.12em] py-3 border-b border-[#21262d]">
              Coding Problems
            </div>
          )}
          {codingQs.map((q, i) => {
            const a = answers.get(q.id);
            return (
              <CodingCard key={q.id} question={q} index={mcqQs.length + i}
                code={a?.codeSubmission ?? ""} language={(a?.language ?? "python3") as Language}
                onCodeChange={code => setCodingAns(q.id, code, (a?.language ?? "python3") as Language)}
                onLanguageChange={lang => setCodingAns(q.id, a?.codeSubmission ?? "", lang)} />
            );
          })}

          <div className="flex justify-center pb-10">
            <button onClick={() => setShowConfirm(true)}
              className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all hover:shadow-2xl hover:shadow-emerald-500/20 text-base">
              🏁 Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
              <div className="text-4xl">🏁</div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Submit Test?</h3>
                <p className="text-[#8b949e] text-sm">
                  Answered <strong className="text-white">{answers.size}</strong> of{" "}
                  <strong className="text-white">{questions.length}</strong> questions.
                  <br />This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#2d333b] border border-[#30363d] text-white font-semibold rounded-xl text-sm transition-all">
                  Keep Going
                </button>
                <button onClick={() => { setShowConfirm(false); doSubmit(); }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm transition-all">
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
