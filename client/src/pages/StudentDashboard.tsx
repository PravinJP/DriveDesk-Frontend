// client/src/pages/StudentDashboard.tsx
// FIXES:
//   1. Completed tests show "Completed ✓" badge — student cannot re-enter
//   2. Score shown on completed test cards
//   3. Tests tab fetches completed IDs on load

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaDatabase, FaFileAlt, FaClock, FaQuestionCircle, FaStar, FaPlayCircle, FaCheckCircle, FaLock } from "react-icons/fa";
import SideBar from "@/components/SideBar";
import Button from "@/components/ui/Button";

const BASE = "http://localhost:8080/api";

const getToken   = () => localStorage.getItem("token") ?? "";
const getUsrId   = () => Number(
  localStorage.getItem("userId") ?? localStorage.getItem("id") ?? "0"
);
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

interface TestInfo {
  id: number; title: string; mcqCount: number; codingCount: number;
  numberOfQuestions: number; duration: number; totalMarks: number;
  instructions: string; status: string;
}

interface CompletedStatus {
  totalScore: number; maxScore: number; percentage: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("jd");

  // JD state (original)
  const [jds, setJds] = useState<any[]>([]);
  const [selectedJd, setSelectedJd] = useState<any>(null);
  const [registeredJobs, setRegisteredJobs] = useState<number[]>(() => {
    const s = localStorage.getItem("registeredJobs");
    return s ? JSON.parse(s) : [];
  });

  // Tests state
  const [tests, setTests]           = useState<TestInfo[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [completedScores, setCompletedScores] = useState<Map<number, CompletedStatus>>(new Map());

  useEffect(() => { fetchJds(); }, []);
  useEffect(() => { if (activeTab === "tests") loadTests(); }, [activeTab]);

  const fetchJds = async () => {
    try {
      const res = await axios.get(`${BASE}/jd/student`, {
        headers: authHeader(), params: { page: 0, size: 10 },
      });
      setJds(res.data.content ?? []);
    } catch (err) { console.error(err); }
  };

  const loadTests = async () => {
    setTestsLoading(true);
    try {
      const studentId = getUsrId();
      // Fetch all published tests
      const res = await fetch(`${BASE}/tests/all`, { headers: authHeader() });
      const all: TestInfo[] = await res.json();
      const published = all.filter(t => t.status === "PUBLISHED");
      setTests(published);

      // Fetch which ones this student already completed
      if (studentId > 0) {
        const cRes = await fetch(
          `${BASE}/tests/completed-by-student/${studentId}`,
          { headers: authHeader() }
        );
        if (cRes.ok) {
          const completedList: number[] = await cRes.json();
          setCompletedIds(new Set(completedList));

          // Fetch score for each completed test
          const scoreMap = new Map<number, CompletedStatus>();
          await Promise.all(
            completedList.map(async (testId) => {
              try {
                const sRes = await fetch(
                  `${BASE}/tests/${testId}/student/${studentId}/status`,
                  { headers: authHeader() }
                );
                if (sRes.ok) {
                  const data = await sRes.json();
                  scoreMap.set(testId, {
                    totalScore: data.totalScore ?? 0,
                    maxScore:   data.maxScore ?? 0,
                    percentage: data.percentage ?? 0,
                  });
                }
              } catch {}
            })
          );
          setCompletedScores(scoreMap);
        }
      }
    } catch (err) { console.error("loadTests error:", err); }
    finally { setTestsLoading(false); }
  };

  const handleRegisterInterest = async (jd?: any) => {
    const target = jd ?? selectedJd;
    if (!target) return;
    try {
      await axios.post(`${BASE}/interest/register`, { jdId: target.id }, { headers: authHeader() });
      alert(`✅ Registered for ${target.companyName}!`);
      setRegisteredJobs(prev => {
        const updated = [...prev, target.id];
        localStorage.setItem("registeredJobs", JSON.stringify(updated));
        return updated;
      });
    } catch { alert("Failed to register!"); }
  };

  const handleStartTest = (testId: number) => {
    if (completedIds.has(testId)) return; // guard
    navigate(`/student/test/${testId}`);
  };

  const STATUS_COLOR: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    DRAFT:     "bg-amber-50 text-amber-700 border border-amber-200",
    ENDED:     "bg-slate-100 text-slate-500 border border-slate-200",
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <SideBar
        items={[
          { id: "jd",    label: "Job Drives", icon: FaDatabase },
          { id: "tests", label: "Tests",      icon: FaFileAlt  },
        ]}
        title="Student"
        onSelect={setActiveTab}
        userName="Student"
        userEmail="student@school.edu"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === "jd" ? "Job Drives" : "Available Tests"}
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">Student</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">S</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">

          {/* ── JOB DRIVES (original unchanged) ── */}
          {activeTab === "jd" && (
            <div className="space-y-4">
              {jds.map(jd => (
                <div key={jd.id} onClick={() => setSelectedJd(jd)}
                  className="w-full bg-white rounded-lg border border-slate-100 px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <h3 className="font-bold text-lg">{jd.companyName}</h3>
                    <p className="text-sm text-slate-600">{jd.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{registeredJobs.includes(jd.id) ? "Registered" : "Not Registered"}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleRegisterInterest(jd); }}
                      disabled={registeredJobs.includes(jd.id)}
                      className={`px-3 py-1 text-xs rounded-md ${registeredJobs.includes(jd.id) ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      {registeredJobs.includes(jd.id) ? "✅ Registered" : "Register"}
                    </button>
                  </div>
                </div>
              ))}
              {jds.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <FaDatabase className="mx-auto text-4xl mb-3 opacity-30" />
                  <p className="font-medium">No job drives available yet</p>
                </div>
              )}
            </div>
          )}

          {/* ── TESTS TAB ── */}
          {activeTab === "tests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Available Tests</h3>
                <button onClick={loadTests}
                  className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                  ↻ Refresh
                </button>
              </div>

              {testsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : tests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <FaFileAlt className="mx-auto text-5xl text-slate-200 mb-4" />
                  <p className="text-slate-500 font-semibold text-lg mb-1">No tests available</p>
                  <p className="text-slate-400 text-sm">Your teacher hasn't published any tests yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {tests.map(test => {
                    const isCompleted = completedIds.has(test.id);
                    const score       = completedScores.get(test.id);
                    return (
                      <motion.div key={test.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-2xl border p-6 transition-all ${
                          isCompleted
                            ? "border-emerald-200 bg-emerald-50/30"
                            : "border-slate-100 hover:shadow-lg hover:border-blue-200"
                        }`}>
                        {/* Status row */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[test.status] ?? STATUS_COLOR.PUBLISHED}`}>
                            {test.status}
                          </span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <FaCheckCircle /> Completed
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4">{test.title}</h3>

                        {/* Score display if completed */}
                        {isCompleted && score && (
                          <div className="mb-4 bg-white border border-emerald-200 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-slate-500 font-semibold">Your Score</span>
                              <span className={`text-xs font-bold ${score.percentage >= 75 ? "text-emerald-600" : score.percentage >= 50 ? "text-amber-600" : "text-red-500"}`}>
                                {score.percentage}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${score.percentage >= 75 ? "bg-emerald-500" : score.percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${score.percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 text-center">
                              {score.totalScore} / {score.maxScore} marks
                            </p>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                          <div className="text-center bg-slate-50 rounded-xl py-2.5">
                            <FaClock className="mx-auto mb-1 text-slate-400 text-xs" />
                            <p className="text-xs font-bold text-slate-700">{test.duration}m</p>
                          </div>
                          <div className="text-center bg-slate-50 rounded-xl py-2.5">
                            <FaQuestionCircle className="mx-auto mb-1 text-slate-400 text-xs" />
                            <p className="text-xs font-bold text-slate-700">{test.numberOfQuestions}Q</p>
                          </div>
                          <div className="text-center bg-slate-50 rounded-xl py-2.5">
                            <FaStar className="mx-auto mb-1 text-slate-400 text-xs" />
                            <p className="text-xs font-bold text-slate-700">{test.totalMarks}M</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2 mb-5 flex-wrap">
                          {(test.mcqCount ?? 0) > 0 && (
                            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">{test.mcqCount} MCQ</span>
                          )}
                          {(test.codingCount ?? 0) > 0 && (
                            <span className="text-xs font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg">{test.codingCount} Coding</span>
                          )}
                        </div>

                        {/* CTA button */}
                        {isCompleted ? (
                          <div className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm cursor-not-allowed">
                            <FaLock size={12} /> Test Completed
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartTest(test.id)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-[1.02] transition-all"
                          >
                            <FaPlayCircle /> Start Test
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* JD Detail Modal (original unchanged) */}
      <AnimatePresence>
        {selectedJd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl relative"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <button onClick={() => setSelectedJd(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl">✕</button>
              <h2 className="text-2xl font-bold text-blue-800 mb-4">{selectedJd.companyName}</h2>
              <p className="text-lg font-semibold text-gray-700 mb-2">Role: <span className="font-normal">{selectedJd.role}</span></p>
              <p className="text-lg font-semibold text-gray-700 mb-2">Branch: <span className="font-normal">{selectedJd.eligibilityBranch}</span></p>
              <p className="text-lg font-semibold text-gray-700 mb-2">CGPA: <span className="font-normal">{selectedJd.eligibilityCgpa}</span></p>
              <p className="text-lg font-semibold text-gray-700 mb-2">Deadline: <span className="font-normal text-red-600">{new Date(selectedJd.deadline).toLocaleDateString()}</span></p>
              <p className="text-gray-600 mb-4">{selectedJd.description}</p>
              <p className="text-sm text-gray-500 mb-6">Posted by: {selectedJd.postedByUsername || "Unknown"}</p>
              {selectedJd.jdPdfUrl && <a href={selectedJd.jdPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mb-6">View JD Document</a>}
              <div className="flex justify-end gap-3">
                <Button color="gray" onClick={() => setSelectedJd(null)}>Close</Button>
                {registeredJobs.includes(selectedJd.id)
                  ? <Button color="green" disabled>✅ Registered</Button>
                  : <Button color="green" onClick={() => handleRegisterInterest()}>Register</Button>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
