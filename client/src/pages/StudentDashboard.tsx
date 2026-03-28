// client/src/pages/StudentDashboard.tsx
// REPLACE your existing StudentDashboard.tsx with this file.
// Adds a "Tests" tab alongside the existing "Job Drives" tab.

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaDatabase, FaFileAlt, FaClock, FaQuestionCircle, FaStar, FaPlayCircle } from "react-icons/fa";
import SideBar from "@/components/SideBar";
import Button from "@/components/ui/Button";
import { getTestsByStatus } from "../services/testApi";
import type { TestInfo } from "../types/test.types";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("jd");

  // ── Job Drives state (original, unchanged) ──────────────────
  const [jds, setJds] = useState<any[]>([]);
  const [selectedJd, setSelectedJd] = useState<any>(null);
  const [registeredJobs, setRegisteredJobs] = useState<number[]>(() => {
    const saved = localStorage.getItem("registeredJobs");
    return saved ? JSON.parse(saved) : [];
  });

  // ── Tests state (new) ───────────────────────────────────────
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  useEffect(() => { fetchJds(); }, []);
  useEffect(() => { if (activeTab === "tests") fetchTests(); }, [activeTab]);

  const token = () => localStorage.getItem("token");
  const authHeader = () => ({ headers: { Authorization: `Bearer ${token()}` } });

  // ── Job Drives (original logic preserved exactly) ───────────
  const fetchJds = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/jd/student", {
        ...authHeader(),
        params: { page: 0, size: 10 },
      });
      setJds(res.data.content);
    } catch (err) { console.error("Failed to fetch JDs:", err); }
  };

  const handleJdClick = (jd: any) => setSelectedJd(jd);

  const handleRegisterInterest = async () => {
    if (!selectedJd) return;
    try {
      await axios.post(
        "http://localhost:8080/api/interest/register",
        { jdId: selectedJd.id },
        authHeader()
      );
      alert(`✅ Registered for ${selectedJd.companyName} successfully!`);
      setRegisteredJobs(prev => {
        const updated = [...prev, selectedJd.id];
        localStorage.setItem("registeredJobs", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("❌ Failed to register:", error);
      alert("Failed to register for this drive!");
    }
  };

  // ── Tests ───────────────────────────────────────────────────
  const fetchTests = async () => {
    setTestsLoading(true);
    try {
      const data = await getTestsByStatus("PUBLISHED");
      setTests(data);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    } finally {
      setTestsLoading(false);
    }
  };

  const handleTakeTest = (testId: number) => {
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

          {/* ══════════════════════════════════════════
              JOB DRIVES TAB — original code, unchanged
          ══════════════════════════════════════════ */}
          {activeTab === "jd" && (
            <div className="space-y-4">
              {jds.map(jd => (
                <div
                  key={jd.id}
                  onClick={() => handleJdClick(jd)}
                  className="w-full bg-white rounded-lg border border-slate-100 px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div>
                    <h3 className="font-bold text-lg">{jd.companyName}</h3>
                    <p className="text-sm text-slate-600">{jd.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {registeredJobs.includes(jd.id) ? "Registered" : "Not Registered"}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleRegisterInterest(); }}
                      disabled={registeredJobs.includes(jd.id)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        registeredJobs.includes(jd.id)
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
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

          {/* ══════════════════════════════════════════
              TESTS TAB — new
          ══════════════════════════════════════════ */}
          {activeTab === "tests" && (
            <div className="space-y-4">
              {testsLoading ? (
                <div className="flex items-center justify-center py-24">
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
                  {tests.map(test => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
                    >
                      {/* Status badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[test.status] ?? STATUS_COLOR.DRAFT}`}>
                          {test.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{test.id}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4">{test.title}</h3>

                      {/* Stats row */}
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

                      {/* Question type tags */}
                      <div className="flex gap-2 mb-5">
                        {test.mcqCount > 0 && (
                          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                            {test.mcqCount} MCQ
                          </span>
                        )}
                        {test.codingCount > 0 && (
                          <span className="text-xs font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg">
                            {test.codingCount} Coding
                          </span>
                        )}
                      </div>

                      {/* Instructions preview */}
                      {test.instructions && (
                        <p className="text-xs text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                          {test.instructions}
                        </p>
                      )}

                      {/* Take Test button */}
                      <button
                        onClick={() => handleTakeTest(test.id)}
                        disabled={test.status !== "PUBLISHED"}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <FaPlayCircle />
                        {test.status === "PUBLISHED" ? "Start Test" : test.status === "ENDED" ? "Test Ended" : "Not Available"}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── JD Details Modal (original, unchanged) ── */}
      <AnimatePresence>
        {selectedJd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                onClick={() => setSelectedJd(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              >✕</button>

              <h2 className="text-2xl font-bold text-blue-800 mb-4">{selectedJd.companyName}</h2>
              <p className="text-lg font-semibold text-gray-700 mb-2">Role: <span className="font-normal">{selectedJd.role}</span></p>
              <p className="text-lg font-semibold text-gray-700 mb-2">Branch: <span className="font-normal">{selectedJd.eligibilityBranch}</span></p>
              <p className="text-lg font-semibold text-gray-700 mb-2">CGPA: <span className="font-normal">{selectedJd.eligibilityCgpa}</span></p>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Deadline: <span className="font-normal text-red-600">{new Date(selectedJd.deadline).toLocaleDateString()}</span>
              </p>
              <p className="text-gray-600 mb-4">{selectedJd.description}</p>
              <p className="text-sm text-gray-500 mb-6">Posted by: {selectedJd.postedByUsername || "Unknown"}</p>

              {selectedJd.jdPdfUrl && (
                <a href={selectedJd.jdPdfUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 underline block mb-6">View JD Document</a>
              )}

              <div className="flex justify-end gap-3">
                <Button color="gray" onClick={() => setSelectedJd(null)}>Close</Button>
                {registeredJobs.includes(selectedJd.id) ? (
                  <Button color="green" disabled>✅ Registered</Button>
                ) : (
                  <Button color="green" onClick={handleRegisterInterest}>Register</Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
