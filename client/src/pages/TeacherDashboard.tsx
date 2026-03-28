// client/src/pages/TeacherDashboard.tsx
// DROP-IN REPLACEMENT for your existing TeacherDashboard.tsx
// Only change: Create Test button now opens CreateTestFlow full-screen wizard.

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaDatabase, FaFileAlt, FaPlus, FaTrash,
  FaClock, FaQuestionCircle, FaStar,
} from "react-icons/fa";
import SideBar from "../components/SideBar";
import Modal from "../components/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
// ↓ New import — the Create Test wizard
import CreateTestFlow from "../components/CreateTest/CreateTestFlow";
import { getTestsByTeacher } from "../services/testApi";
import type { TestInfo } from "../types/test.types";

// Replace with real value from your auth context / JWT
const TEACHER_ID = Number(localStorage.getItem("userId") || "1");

const STATUS_PILL: Record<string, string> = {
  DRAFT:     "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  PUBLISHED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  ENDED:     "bg-[#21262d] text-[#8b949e] border border-[#30363d]",
};

const TeacherDashboard = () => {
  const [selectedTab, setSelectedTab]   = useState("jd");
  const [jdCount, setJdCount]           = useState(0);
  const [jds, setJds]                   = useState<any[]>([]);
  const [tests, setTests]               = useState<TestInfo[]>([]);
  const [testCount, setTestCount]       = useState(0);
  const [selectedJd, setSelectedJd]     = useState<any>(null);
  const [jdStudents, setJdStudents]     = useState<any[]>([]);
  const [activeTab, setActiveTab]       = useState("details");
  const [showJdForm, setShowJdForm]     = useState(false);

  // ← The only new state: controls the Create Test wizard overlay
  const [showCreateTest, setShowCreateTest] = useState(false);

  const [jdForm, setJdForm] = useState({
    companyName: "", role: "", eligibilityBranch: "",
    eligibilityCgpa: "", deadline: "", description: "", jdPdfUrl: "",
  });

  useEffect(() => { fetchJds(); }, []);
  useEffect(() => { if (selectedTab === "tests") fetchTests(); }, [selectedTab]);

  const cfg = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const fetchJds = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/jd/teacher?page=0&size=10", cfg());
      setJds(res.data.content); setJdCount(res.data.totalElements);
    } catch (err) { console.error(err); }
  };

  const fetchTests = async () => {
    try {
      const data = await getTestsByTeacher(TEACHER_ID);
      setTests(data); setTestCount(data.length);
    } catch (err) { console.error(err); }
  };

  const fetchJdStudents = async (jdId: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/interest/jd/${jdId}`, cfg());
      setJdStudents(res.data);
    } catch { setJdStudents([]); }
  };

  const createJd = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/jd/create", jdForm, cfg());
      setJds([...jds, res.data]); setJdCount(jdCount + 1); setShowJdForm(false);
      setJdForm({ companyName: "", role: "", eligibilityBranch: "", eligibilityCgpa: "", deadline: "", description: "", jdPdfUrl: "" });
    } catch (err) { console.error(err); }
  };

  const deleteJd = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/jd/delete/${id}`, cfg());
      setJds(jds.filter(j => j.id !== id)); setJdCount(jdCount - 1);
      if (selectedJd?.id === id) { setSelectedJd(null); setJdStudents([]); }
    } catch (err) { console.error(err); }
  };

  const handleJdClick = (jd: any) => {
    setSelectedJd(jd); fetchJdStudents(jd.id); setActiveTab("details");
  };

  // ── If Create Test wizard is open, render it full-screen ──────
  if (showCreateTest) {
    return (
      <CreateTestFlow
        teacherId={TEACHER_ID}
        onClose={() => setShowCreateTest(false)}
        onSuccess={() => { setShowCreateTest(false); fetchTests(); setSelectedTab("tests"); }}
      />
    );
  }

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
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">
              {selectedTab === "jd" ? "Job Drives" : "Tests"}
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">Teacher</p>
                <p className="text-xs text-slate-500">Teacher</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">T</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {/* ── Page header ── */}
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
                // ← THIS is the button that triggers the wizard
                <button onClick={() => setShowCreateTest(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all">
                  <FaPlus /> Create Test
                </button>
              )}
            </div>
          </div>

          {/* ── Stat card ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {selectedTab === "jd" && (
              <div className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><FaDatabase className="text-xl" /></div>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><FaFileAlt className="text-xl" /></div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+4%</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">{testCount}</h3>
                  <p className="text-sm text-slate-500 font-medium">Tests Created</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Job Drives list (unchanged from original) ── */}
          {selectedTab === "jd" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Job Drives</h3>
              <div className="flex flex-col gap-2">
                {jds.map(jd => (
                  <div key={jd.id} onClick={() => handleJdClick(jd)}
                    className="w-full bg-white rounded-lg border border-slate-100 px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <span className="font-medium text-sm">{jd.companyName}</span>
                    <button onClick={e => { e.stopPropagation(); deleteJd(jd.id); }} className="text-red-400 hover:text-red-600 transition-colors"><FaTrash size={13} /></button>
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
                        <button key={t} onClick={() => setActiveTab(t)}
                          className={`px-4 py-2 rounded-md font-medium capitalize ${activeTab === t ? "bg-blue-100 text-blue-800" : "text-slate-600 hover:text-slate-800"}`}>
                          {t === "students" ? `Registered Students (${jdStudents.length})` : t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeTab === "details" && (
                    <div className="space-y-2 mt-4">
                      <p><strong>Role:</strong> {selectedJd.role}</p>
                      <p><strong>Eligibility Branch:</strong> {selectedJd.eligibilityBranch}</p>
                      <p><strong>Eligibility CGPA:</strong> {selectedJd.eligibilityCgpa}</p>
                      <p><strong>Deadline:</strong> {selectedJd.deadline}</p>
                      <p><strong>Description:</strong> {selectedJd.description}</p>
                      {selectedJd.jdPdfUrl && <p><strong>JD PDF:</strong> <a href={selectedJd.jdPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">View PDF</a></p>}
                    </div>
                  )}
                  {activeTab === "students" && (
                    <div className="space-y-2 mt-4">
                      {jdStudents.length > 0 ? jdStudents.map((s: any) => (
                        <div key={s.id} className="bg-slate-50 p-3 rounded-lg">
                          <p className="font-medium">{s.userName}</p>
                          <p className="text-sm text-slate-600">Roll: {s.rollNumber}</p>
                        </div>
                      )) : <p className="text-slate-500">No students registered yet</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Tests list ── */}
          {selectedTab === "tests" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">All Tests</h3>
              {tests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <FaFileAlt className="mx-auto mb-3 text-4xl text-slate-200" />
                  <p className="text-slate-500 font-medium mb-1">No tests yet</p>
                  <p className="text-slate-400 text-sm mb-6">Click "Create Test" to get started</p>
                  <button onClick={() => setShowCreateTest(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    <FaPlus /> Create Your First Test
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tests.map(test => (
                    <div key={test.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-green-200 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_PILL[test.status] ?? STATUS_PILL.DRAFT}`}>{test.status}</span>
                        <span className="text-xs text-slate-400 font-mono">#{test.id}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-3 leading-tight">{test.title}</h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { icon: <FaClock />, val: `${test.duration}m` },
                          { icon: <FaQuestionCircle />, val: `${test.numberOfQuestions}Q` },
                          { icon: <FaStar />, val: `${test.totalMarks}M` },
                        ].map(({ icon, val }) => (
                          <div key={val} className="text-center bg-slate-50 rounded-lg py-2">
                            <div className="flex justify-center mb-1 text-slate-400 text-xs">{icon}</div>
                            <p className="text-xs font-bold text-slate-700">{val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold">{test.mcqCount} MCQ</span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-semibold">{test.codingCount} Coding</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* JD Create Modal — unchanged from your original */}
      {showJdForm && (
        <Modal title="Create Job Description" onClose={() => setShowJdForm(false)}>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); createJd(); }}>
            {[
              { label: "Company Name",      key: "companyName",      type: "text" },
              { label: "Role",              key: "role",             type: "text" },
              { label: "Eligibility Branch",key: "eligibilityBranch",type: "text" },
              { label: "Eligibility CGPA",  key: "eligibilityCgpa",  type: "number" },
              { label: "Deadline",          key: "deadline",         type: "date" },
              { label: "Description",       key: "description",      type: "text" },
              { label: "PDF URL (Optional)",key: "jdPdfUrl",         type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label text={label} />
                <Input type={type} value={(jdForm as any)[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJdForm({ ...jdForm, [key]: e.target.value })} />
              </div>
            ))}
            <Button color="blue" type="submit">Create JD</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherDashboard;
