// client/src/pages/TeacherDashboard.tsx
// FIXES:
//   1. TEACHER_ID now reads from multiple possible localStorage keys
//   2. fetchTests() logs errors so you can see what's happening
//   3. Tests list always reloads when tab switches to "tests"
//   4. View Results panel wired correctly

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaDatabase, FaFileAlt, FaPlus, FaTrash,
  FaClock, FaQuestionCircle, FaStar, FaChartBar,
} from "react-icons/fa";
import SideBar from "../components/SideBar";
import Modal from "../components/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import CreateTestFlow   from "../components/CreateTest/CreateTestFlow";
import TestResultsPanel from "../components/TestResultsPanel";
import { getTestsByTeacher } from "../services/testApi";
import type { TestInfo } from "../types/test.types";

// ─── FIX: read teacher ID from whichever key your SignIn uses ─────────────
// Open DevTools → Application → Local Storage to see what keys are set.
// Common patterns: "userId", "id", "teacherId", "loggedInUserId"
const getTeacherId = (): number => {
  const raw =
    localStorage.getItem("userId") ??
    localStorage.getItem("id") ??
    localStorage.getItem("teacherId") ??
    "0";
  const id = Number(raw);
  if (id === 0) {
    console.warn(
      "[TeacherDashboard] Could not read teacher ID from localStorage. " +
      "Check what key your SignIn page stores the user ID under. " +
      "Current localStorage keys:",
      Object.keys(localStorage)
    );
  }
  return id;
};

const STATUS_PILL: Record<string, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 border border-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ENDED:     "bg-slate-100 text-slate-500 border border-slate-200",
};

const TeacherDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("jd");
  const [jdCount, setJdCount]         = useState(0);
  const [jds, setJds]                 = useState<any[]>([]);
  const [tests, setTests]             = useState<TestInfo[]>([]);
  const [testCount, setTestCount]     = useState(0);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsError, setTestsError]   = useState("");
  const [selectedJd, setSelectedJd]   = useState<any>(null);
  const [jdStudents, setJdStudents]   = useState<any[]>([]);
  const [activeJdTab, setActiveJdTab] = useState("details");
  const [showJdForm, setShowJdForm]   = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);

  // Results panel
  const [resultsTestId, setResultsTestId]     = useState<number | null>(null);
  const [resultsTestTitle, setResultsTestTitle] = useState("");

  const [jdForm, setJdForm] = useState({
    companyName: "", role: "", eligibilityBranch: "",
    eligibilityCgpa: "", deadline: "", description: "", jdPdfUrl: "",
  });

  const cfg = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
  });

  // ── Load JDs on mount ───────────────────────────────────────
  useEffect(() => { fetchJds(); }, []);

  // ── Load tests whenever tab switches to "tests" ─────────────
  useEffect(() => {
    if (selectedTab === "tests") fetchTests();
  }, [selectedTab]);

  // ── Fetch functions ─────────────────────────────────────────

  const fetchJds = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/jd/teacher?page=0&size=10", cfg());
      setJds(res.data.content ?? []);
      setJdCount(res.data.totalElements ?? 0);
    } catch (err) {
      console.error("[TeacherDashboard] fetchJds error:", err);
    }
  };

  const fetchTests = async () => {
    const teacherId = getTeacherId();
    if (teacherId === 0) {
      setTestsError(
        "Cannot load tests: teacher ID is 0. " +
        "Check the localStorage key in testApi.ts. " +
        "Open DevTools → Console for details."
      );
      return;
    }

    setTestsLoading(true);
    setTestsError("");
    try {
      console.log("[TeacherDashboard] fetching tests for teacherId =", teacherId);
      const data = await getTestsByTeacher(teacherId);
      console.log("[TeacherDashboard] tests received:", data);
      setTests(data ?? []);
      setTestCount((data ?? []).length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[TeacherDashboard] fetchTests error:", msg);
      setTestsError(`Failed to load tests: ${msg}`);
    } finally {
      setTestsLoading(false);
    }
  };

  const fetchJdStudents = async (jdId: number) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/interest/jd/${jdId}`, cfg());
      setJdStudents(res.data ?? []);
    } catch {
      setJdStudents([]);
    }
  };

  const createJd = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/jd/create", jdForm, cfg());
      setJds(prev => [...prev, res.data]);
      setJdCount(c => c + 1);
      setShowJdForm(false);
      setJdForm({ companyName: "", role: "", eligibilityBranch: "",
        eligibilityCgpa: "", deadline: "", description: "", jdPdfUrl: "" });
    } catch (err) { console.error(err); }
  };

  const deleteJd = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/jd/delete/${id}`, cfg());
      setJds(prev => prev.filter(j => j.id !== id));
      setJdCount(c => c - 1);
      if (selectedJd?.id === id) { setSelectedJd(null); setJdStudents([]); }
    } catch (err) { console.error(err); }
  };

  const handleJdClick = (jd: any) => {
    setSelectedJd(jd); fetchJdStudents(jd.id); setActiveJdTab("details");
  };

  // ── Create test wizard overlay ───────────────────────────────
  if (showCreateTest) {
    return (
      <CreateTestFlow
        teacherId={getTeacherId()}
        onClose={() => setShowCreateTest(false)}
        onSuccess={() => {
          setShowCreateTest(false);
          setSelectedTab("tests");
          fetchTests();
        }}
      />
    );
  }

  // ── Main render ──────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50">
      <SideBar
        items={[
          { id: "jd",    label: "Job Drives", icon: FaDatabase },
          { id: "tests", label: "Tests",      icon: FaFileAlt  },
        ]}
        title="Teacher"
        onSelect={page => setSelectedTab(page)}
        userName="Teacher"
        userEmail="teacher@school.edu"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">
              {selectedTab === "jd" ? "Job Drives" : "Tests"}
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">Teacher</p>
                <p className="text-xs text-slate-500">ID: {getTeacherId()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                T
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {/* Page header row */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
              {selectedTab === "jd" ? "Job & Test Analytics" : "Test Analytics"}
            </h2>
            <div className="flex gap-3">
              {selectedTab === "jd" && (
                <button onClick={() => setShowJdForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all">
                  <FaPlus /> Create JD
                </button>
              )}
              {selectedTab === "tests" && (
                <button onClick={() => setShowCreateTest(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all">
                  <FaPlus /> Create Test
                </button>
              )}
            </div>
          </div>

          {/* Stat card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {selectedTab === "jd" && (
              <div className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FaDatabase className="text-xl" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+3%</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">{jdCount}</h3>
                  <p className="text-sm text-slate-500 font-medium">Job Drives</p>
                </div>
              </div>
            )}
            {selectedTab === "tests" && (
              <div className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FaFileAlt className="text-xl" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+4%</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">{testCount}</h3>
                  <p className="text-sm text-slate-500 font-medium">Tests Created</p>
                </div>
              </div>
            )}
          </div>

          {/* ── JD section (original, unchanged) ── */}
          {selectedTab === "jd" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Job Drives</h3>
              <div className="flex flex-col gap-2">
                {jds.map(jd => (
                  <div key={jd.id} onClick={() => handleJdClick(jd)}
                    className="w-full bg-white rounded-lg border border-slate-100 px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <span className="font-medium text-sm">{jd.companyName}</span>
                    <button onClick={e => { e.stopPropagation(); deleteJd(jd.id); }}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <FaTrash size={13} />
                    </button>
                  </div>
                ))}
                {jds.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <FaDatabase className="mx-auto mb-2 text-2xl opacity-30" />
                    <p className="text-sm font-medium">No job drives yet</p>
                  </div>
                )}
              </div>

              {selectedJd && (
                <div className="mt-6 p-6 bg-white rounded-lg border border-slate-100">
                  <div className="flex items-center mb-4">
                    <h4 className="text-lg font-bold text-slate-800">{selectedJd.companyName}</h4>
                    <div className="ml-4 flex gap-2">
                      {["details", "students"].map(t => (
                        <button key={t} onClick={() => setActiveJdTab(t)}
                          className={`px-4 py-2 rounded-md font-medium capitalize ${
                            activeJdTab === t ? "bg-blue-100 text-blue-800" : "text-slate-600 hover:text-slate-800"
                          }`}>
                          {t === "students" ? `Registered Students (${jdStudents.length})` : t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeJdTab === "details" && (
                    <div className="space-y-2 text-sm">
                      <p><strong>Role:</strong> {selectedJd.role}</p>
                      <p><strong>Branch:</strong> {selectedJd.eligibilityBranch}</p>
                      <p><strong>CGPA:</strong> {selectedJd.eligibilityCgpa}</p>
                      <p><strong>Deadline:</strong> {selectedJd.deadline}</p>
                      <p><strong>Description:</strong> {selectedJd.description}</p>
                      {selectedJd.jdPdfUrl && (
                        <p><strong>PDF:</strong>{" "}
                          <a href={selectedJd.jdPdfUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 underline">View</a>
                        </p>
                      )}
                    </div>
                  )}
                  {activeJdTab === "students" && (
                    <div className="space-y-2 mt-2">
                      {jdStudents.length > 0
                        ? jdStudents.map((s: any) => (
                          <div key={s.id} className="bg-slate-50 p-3 rounded-lg">
                            <p className="font-medium">{s.userName}</p>
                            <p className="text-sm text-slate-500">Roll: {s.rollNumber}</p>
                          </div>
                        ))
                        : <p className="text-slate-500 text-sm">No students registered yet.</p>
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Tests section ── */}
          {selectedTab === "tests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">All Tests</h3>
                <button onClick={fetchTests}
                  className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                  ↻ Refresh
                </button>
              </div>

              {/* Loading state */}
              {testsLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-green-500 rounded-full animate-spin" />
                </div>
              )}

              {/* Error state */}
              {!testsLoading && testsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
                  <p className="font-bold mb-1">⚠ Could not load tests</p>
                  <p>{testsError}</p>
                  <button onClick={fetchTests}
                    className="mt-3 px-4 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg font-semibold transition-all">
                    Retry
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!testsLoading && !testsError && tests.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <FaFileAlt className="mx-auto mb-3 text-4xl text-slate-200" />
                  <p className="text-slate-500 font-medium mb-1">No tests yet</p>
                  <p className="text-slate-400 text-sm mb-6">Click "Create Test" to get started</p>
                  <button onClick={() => setShowCreateTest(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    <FaPlus /> Create Your First Test
                  </button>
                </div>
              )}

              {/* Test cards */}
              {!testsLoading && !testsError && tests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tests.map(test => (
                    <div key={test.id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-green-200 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          STATUS_PILL[test.status] ?? STATUS_PILL.DRAFT
                        }`}>{test.status}</span>
                        <span className="text-xs text-slate-400 font-mono">#{test.id}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-3 leading-tight">{test.title}</h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { icon: <FaClock />,         val: `${test.duration}m`          },
                          { icon: <FaQuestionCircle />, val: `${test.numberOfQuestions}Q` },
                          { icon: <FaStar />,           val: `${test.totalMarks}M`        },
                        ].map(({ icon, val }) => (
                          <div key={val} className="text-center bg-slate-50 rounded-lg py-2">
                            <div className="flex justify-center mb-1 text-slate-400 text-xs">{icon}</div>
                            <p className="text-xs font-bold text-slate-700">{val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mb-4 text-xs flex-wrap">
                        {(test.mcqCount ?? 0) > 0 && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold">
                            {test.mcqCount} MCQ
                          </span>
                        )}
                        {(test.codingCount ?? 0) > 0 && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-semibold">
                            {test.codingCount} Coding
                          </span>
                        )}
                      </div>

                      {/* View Results button */}
                      <button
                        onClick={() => {
                          setResultsTestId(test.id);
                          setResultsTestTitle(test.title);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                      >
                        <FaChartBar /> View Results
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── JD Create Modal ── */}
      {showJdForm && (
        <Modal title="Create Job Description" onClose={() => setShowJdForm(false)}>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); createJd(); }}>
            {[
              { label: "Company Name",       key: "companyName",       type: "text" },
              { label: "Role",               key: "role",              type: "text" },
              { label: "Eligibility Branch", key: "eligibilityBranch", type: "text" },
              { label: "Eligibility CGPA",   key: "eligibilityCgpa",   type: "number" },
              { label: "Deadline",           key: "deadline",          type: "date" },
              { label: "Description",        key: "description",       type: "text" },
              { label: "PDF URL (Optional)", key: "jdPdfUrl",          type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label text={label} />
                <Input type={type} value={(jdForm as any)[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setJdForm({ ...jdForm, [key]: e.target.value })} />
              </div>
            ))}
            <Button color="blue" type="submit">Create JD</Button>
          </form>
        </Modal>
      )}

      {/* ── Results Panel ── */}
      {resultsTestId !== null && (
        <TestResultsPanel
          testId={resultsTestId}
          testTitle={resultsTestTitle}
          onClose={() => { setResultsTestId(null); setResultsTestTitle(""); }}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
