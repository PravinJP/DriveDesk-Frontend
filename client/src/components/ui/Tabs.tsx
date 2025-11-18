import React, { useState } from "react";
import { motion } from "framer-motion";

interface Job {
  id: number;
  companyName: string;
  role: string;
  eligibilityBranch: string;
  eligibilityCgpa: number;
  deadline: string;
  description: string;
  postedByUsername?: string;
  jdPdfUrl?: string;
  onClick?: () => void; // ✅ optional click handler
}

interface Test {
  title: string;
  numberOfQuestions: number;
  duration: number;
  totalMarks: number;
  instructions: string;
}

interface TabsProps {
  jobs: Job[];
  tests: Test[];
}

const Tabs: React.FC<TabsProps> = ({ jobs, tests }) => {
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Tab Header */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "jobs"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Job Alerts
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "tests"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Tests
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "jobs" ? (
          jobs.length > 0 ? (
            jobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition-all"
                onClick={job.onClick} // ✅ make it clickable
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {job.companyName} — {job.role}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Deadline:{" "}
                    <span className="text-red-600">
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {job.description}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Posted by: {job.postedByUsername || "Unknown"}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">No job alerts available.</p>
          )
        ) : tests.length > 0 ? (
          tests.map((test, i) => (
            <div
              key={i}
              className="p-4 border rounded-xl hover:bg-green-50 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {test.title}
              </h3>
              <p className="text-gray-600">
                {test.numberOfQuestions} Questions • {test.duration} mins •{" "}
                {test.totalMarks} Marks
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {test.instructions}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No tests available.</p>
        )}
      </div>
    </div>
  );
};

export default Tabs;
