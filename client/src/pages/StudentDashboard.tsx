import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "@/components/SideBar";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

interface Job {
  id: number;
  companyName: string;
  role: string;
  eligibilityBranch: string;
  eligibilityCgpa: number;
  deadline: string;
  description: string;
  department: string;
  jdPdfUrl?: string;
  postedByUsername?: string;
}

interface Test {
  title: string;
  numberOfQuestions: number;
  duration: number;
  totalMarks: number;
  instructions: string;
}

interface Stats {
  totalTests: number;
  activeTests: number;
  totalDrives: number;
  registeredDrives: number; // changed from activeDrives
}

const StudentDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    activeTests: 0,
    totalDrives: 0,
    registeredDrives: 0,
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Store registered job IDs locally so button stays disabled after refresh
  const [registeredJobs, setRegisteredJobs] = useState<number[]>(() => {
    const saved = localStorage.getItem("registeredJobs");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const jobsResponse = await axios.get("http://localhost:8080/api/jd/student", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 0, size: 10 },
        });

        const jobsData = jobsResponse.data?.content || [];

        let testsData: Test[] = [];
        try {
          const testsResponse = await axios.get("http://localhost:8080/api/test/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          testsData = testsResponse.data?.content || testsResponse.data || [];
        } catch (testErr) {
          console.warn("No test endpoint available yet:", testErr);
        }

        setJobs(jobsData);
        setTests(testsData);

        const registered = JSON.parse(localStorage.getItem("registeredJobs") || "[]");

        setStats({
          totalTests: testsData.length,
          activeTests: testsData.length,
          totalDrives: jobsData.length,
          registeredDrives: registered.length, // ✅
        });
      } catch (error) {
        console.error("❌ Error fetching student dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Handle job click → open modal
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  // ✅ Register interest in JD
  const handleRegisterInterest = async () => {
    if (!selectedJob) return;
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8080/api/interest/register",
        { jdId: selectedJob.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`✅ Registered for ${selectedJob.companyName} successfully!`);
      setShowModal(false);

      // ✅ Save registered job in localStorage + state and update count
      setRegisteredJobs((prev) => {
        const updated = [...prev, selectedJob.id];
        localStorage.setItem("registeredJobs", JSON.stringify(updated));

        setStats((prevStats) => ({
          ...prevStats,
          registeredDrives: updated.length, // ✅ update count dynamically
        }));

        return updated;
      });
    } catch (error) {
      console.error("❌ Failed to register:", error);
      alert("Failed to register for this drive!");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">Student Dashboard</h1>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Tests", value: stats.totalTests, color: "text-blue-600" },
            { title: "Active Tests", value: stats.activeTests, color: "text-green-600" },
            { title: "Total Drives", value: stats.totalDrives, color: "text-indigo-600" },
            { title: "Registered Drives", value: stats.registeredDrives, color: "text-emerald-600" }, // ✅ changed label
          ].map((card, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card title={card.title} value={card.value} color={card.color} />
            </motion.div>
          ))}
        </div>

        {/* ✅ Job & Test Tabs */}
        <Tabs
          jobs={jobs.map((job) => ({
            ...job,
            onClick: () => handleJobClick(job),
          }))}
          tests={tests}
        />
      </main>

      {/* ✅ Modal for JD Details */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              {selectedJob.companyName}
            </h2>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Role: <span className="font-normal">{selectedJob.role}</span>
            </p>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Branch: <span className="font-normal">{selectedJob.eligibilityBranch}</span>
            </p>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              CGPA: <span className="font-normal">{selectedJob.eligibilityCgpa}</span>
            </p>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Deadline:{" "}
              <span className="font-normal text-red-600">
                {new Date(selectedJob.deadline).toLocaleDateString()}
              </span>
            </p>
            <p className="text-gray-600 mb-4">{selectedJob.description}</p>
            <p className="text-sm text-gray-500 mb-6">
              Posted by: {selectedJob.postedByUsername || "Unknown"}
            </p>

            {selectedJob.jdPdfUrl && (
              <a
                href={selectedJob.jdPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block mb-6"
              >
                View JD Document
              </a>
            )}

            <div className="flex justify-end gap-3">
              <Button color="gray" onClick={() => setShowModal(false)}>
                Close
              </Button>

              {/* ✅ Disable button if already registered */}
              {registeredJobs.includes(selectedJob.id) ? (
                <Button color="green" disabled>
                  ✅ Registered
                </Button>
              ) : (
                <Button color="green" onClick={handleRegisterInterest}>
                  Register
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
