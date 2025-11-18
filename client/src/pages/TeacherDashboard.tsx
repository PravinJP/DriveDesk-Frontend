import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Tabs from "@/components/ui/Tabs";
import SideBar from "@/components/SideBar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Job {
  id?: number;
  companyName: string;
  role: string;
  eligibilityBranch: string;
  eligibilityCgpa: string;
  deadline: string;
  description: string;
  jdPdfUrl?: string;
}

interface StudentInterest {
  id: number;
  studentName: string;
  studentEmail: string;
  department: string;
}

interface Test {
  id?: number;
  title: string;
  numberOfQuestions: number;
  duration: number;
  totalMarks: number;
  instructions: string;
}

interface Stats {
  activeDrives: number;
  totalDrives: number;
  activeTests: number;
  totalTests: number;
}

const TeacherDashboard: React.FC = () => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [students, setStudents] = useState<StudentInterest[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [stats, setStats] = useState<Stats>({
    activeDrives: 0,
    totalDrives: 0,
    activeTests: 0,
    totalTests: 0,
  });

  const navigate = useNavigate();

  // ✅ Fetch Jobs & Tests created by teacher
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ Fetch Jobs
        const jobsResponse = await axios.get("http://localhost:8080/api/jd/teacher", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 0, size: 10 },
        });
        const jobsData = jobsResponse.data?.content || [];
        setJobs(jobsData);

        const today = new Date().toISOString().split("T")[0];
        const activeDrives = jobsData.filter(
          (job: Job) => new Date(job.deadline) >= new Date(today)
        ).length;

        // ✅ Fetch Tests
        const testsResponse = await axios.get("http://localhost:8080/api/tests/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const testsData = testsResponse.data || [];
        setTests(testsData);

        setStats({
          activeDrives,
          totalDrives: jobsData.length,
          activeTests: testsData.length, // we can treat all as active for now
          totalTests: testsData.length,
        });
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Fetch registered students for a JD
  const handleViewRegistered = async (job: Job) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/interest/jd/${job.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedJob(job);
      setStudents(response.data || []);
      setShowStudentModal(true);
    } catch (error) {
      console.error("❌ Error fetching registered students:", error);
      alert("Failed to fetch student registrations!");
    }
  };

  // ✅ Create new JD
  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const job = Object.fromEntries(formData.entries()) as unknown as Job;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8080/api/jd/create", job, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs((prev) => [...prev, response.data]);
      setStats((prev) => ({
        ...prev,
        totalDrives: prev.totalDrives + 1,
        activeDrives: prev.activeDrives + 1,
      }));

      alert("✅ Job Alert created successfully!");
      setShowJobForm(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error("❌ Error creating job alert:", error);
      alert("Failed to create Job Alert!");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <SideBar />
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">
          Teacher Dashboard
        </h1>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Active Drives", value: stats.activeDrives, color: "text-blue-600" },
            { title: "Total Drives", value: stats.totalDrives, color: "text-indigo-600" },
            { title: "Active Tests", value: stats.activeTests, color: "text-green-600" },
            { title: "Total Tests", value: stats.totalTests, color: "text-emerald-600" },
          ].map((card, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card title={card.title} value={card.value} color={card.color} />
            </motion.div>
          ))}
        </div>

        {/* ✅ Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button color="blue" onClick={() => setShowJobForm(!showJobForm)}>
            + Create Job Alert
          </Button>
          <Button color="green" onClick={() => navigate("/teacher/create-test")}>
            + Create Test
          </Button>
        </div>

        {/* ✅ Job Form */}
        {showJobForm && (
          <motion.form
            onSubmit={handleJobSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg mb-8 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-semibold text-blue-700">
              Create Job Alert
            </h3>
            <Label text="Company Name" />
            <Input name="companyName" required placeholder="Enter company name" />
            <Label text="Role" />
            <Input name="role" required placeholder="Enter job role" />
            <Label text="Eligibility Branch" />
            <Input name="eligibilityBranch" required placeholder="Enter branch" />
            <Label text="Eligibility CGPA" />
            <Input
              name="eligibilityCgpa"
              type="number"
              step="0.1"
              required
              placeholder="Enter CGPA"
            />
            <Label text="Deadline" />
            <Input name="deadline" type="date" required />
            <Label text="Description" />
            <Input name="description" required placeholder="Short description" />
            <Button color="blue" type="submit">
              Submit Job Alert
            </Button>
          </motion.form>
        )}

        {/* ✅ Tabs for Jobs and Tests */}
        <Tabs
          jobs={jobs.map((job) => ({
            ...job,
            onClick: () => handleViewRegistered(job),
          }))}
          tests={tests.map((test) => ({
            ...test,
            onClick: () => console.log(`Selected test: ${test.title}`),
          }))}
        />
      </main>

      {/* ✅ Registered Students Modal */}
      {showStudentModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => setShowStudentModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Registered Students for {selectedJob.companyName}
            </h2>

            {students.length > 0 ? (
              <>
                <p className="text-gray-700 mb-4">
                  Total Registered: <strong>{students.length}</strong>
                </p>
                <ul className="space-y-3">
                  {students.map((student) => (
                    <li
                      key={student.id}
                      className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100"
                    >
                      <p className="font-semibold text-gray-800">
                        {student.studentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {student.studentEmail} — {student.department}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-500 text-center">
                No students registered for this drive yet.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
