import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaGraduationCap,
  FaFileAlt,
  FaDatabase,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import SideBar from "../components/SideBar";
import Modal from "../components/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

const TeacherDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("jd"); // "jd" or "tests"
  const [jdCount, setJdCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  const [jds, setJds] = useState([]);
  const [tests, setTests] = useState([]);
  const [activeJd, setActiveJd] = useState(null); // Show JD details (readonly)
  const [editMode, setEditMode] = useState(false); // Enable editing for JD

  const [showJdForm, setShowJdForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);

  const [jdForm, setJdForm] = useState({
    companyName: "",
    role: "",
    eligibilityBranch: "",
    eligibilityCgpa: "",
    deadline: "",
    description: "",
    jdPdfUrl: "",
  });

  const [testForm, setTestForm] = useState({
    testName: "",
    description: "",
  });

  useEffect(() => {
    fetchJds();
    fetchTests();
  }, []);

  // Helper to get token and set auth header
  const getConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchJds = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/jd/teacher?page=0&size=10",
        getConfig()
      );
      setJds(res.data.content);
      setJdCount(res.data.totalElements);
    } catch (err) {
      console.error("Failed to fetch JDs:", err);
    }
  };

  const fetchTests = async () => {
    // Here you can add your backend API for tests
    // Currently just a placeholder for your UI
    setTests([]);
    setTestCount(0);
  };

  const createJd = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/jd/create",
        jdForm,
        getConfig()
      );
      setJds([...jds, res.data]);
      setJdCount(jdCount + 1);
      setShowJdForm(false);
      setJdForm({
        companyName: "",
        role: "",
        eligibilityBranch: "",
        eligibilityCgpa: "",
        deadline: "",
        description: "",
        jdPdfUrl: "",
      });
    } catch (err) {
      console.error("Failed to create JD:", err);
    }
  };

  const updateJd = async (id, updatedJd) => {
    try {
      await axios.put(
        `http://localhost:8080/api/jd/update/${id}`,
        updatedJd,
        getConfig()
      );
      setJds(jds.map((jd) => (jd.id === id ? updatedJd : jd)));
      if (activeJd && activeJd.id === id) {
        setActiveJd(updatedJd);
      }
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update JD:", err);
    }
  };

  const deleteJd = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/jd/delete/${id}`,
        getConfig()
      );
      setJds(jds.filter((jd) => jd.id !== id));
      setJdCount(jdCount - 1);
      if (activeJd && activeJd.id === id) {
        setActiveJd(null);
      }
    } catch (err) {
      console.error("Failed to delete JD:", err);
    }
  };

  const createTest = async () => {
    // For now, just a sample add; replace with backend API later
    setTests([...tests, { id: testCount + 1, ...testForm }]);
    setTestCount(testCount + 1);
    setShowTestForm(false);
    setTestForm({ testName: "", description: "" });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <SideBar
        items={[
          { id: "jd", label: "Job Drives", icon: FaDatabase },
          { id: "tests", label: "Tests", icon: FaFileAlt },
        ]}
        title="Teacher"
        onSelect={(page) => setSelectedTab(page)}
        userName="Teacher"
        userEmail="teacher@school.edu"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">
              {selectedTab === "jd" ? "Job Drives" : "Tests"}
            </h1>
            <div className="flex items-center gap-4 ml-6">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    Teacher
                  </p>
                  <p className="text-xs text-slate-500">Teacher</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  T
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {/* Main Actions */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                {selectedTab === "jd"
                  ? "Job &amp; Test Analytics"
                  : "Test Analytics"}
              </h2>
            </div>
            <div className="flex gap-3">
              {selectedTab === "jd" && (
                <button
                  onClick={() => {
                    setShowJdForm(true);
                    setJdForm({
                      companyName: "",
                      role: "",
                      eligibilityBranch: "",
                      eligibilityCgpa: "",
                      deadline: "",
                      description: "",
                      jdPdfUrl: "",
                    });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  <FaPlus /> Create JD
                </button>
              )}
              {selectedTab === "tests" && (
                <button
                  onClick={() => {
                    setShowTestForm(true);
                    setTestForm({ testName: "", description: "" });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  <FaPlus /> Create Test
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {selectedTab === "jd" && (
              <div className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FaDatabase className="text-xl" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      +3%
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">
                    {jdCount}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Job Drives
                  </p>
                </div>
              </div>
            )}
            {selectedTab === "tests" && (
              <div className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FaFileAlt className="text-xl" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      +4%
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">
                    {testCount}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">Tests</p>
                </div>
              </div>
            )}
          </div>

          {/* JD Tabs */}
          {selectedTab === "jd" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Job Drives</h3>
              <div className="flex flex-col gap-2">
                {jds.map((jd) => (
                  <div
                    key={jd.id}
                    onClick={() => {
                      setActiveJd(jd);
                      setEditMode(false);
                    }}
                    className="w-full bg-white rounded-lg border border-slate-100 px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-sm">
                      {jd.companyName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJd(jd.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              {/* JD Details */}
              {activeJd && (
                <div className="mt-6 p-6 bg-white rounded-lg border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-800">
                    {activeJd.companyName}
                  </h4>
                  {!editMode && (
                    <div className="space-y-2 mt-4">
                      <p>
                        <strong>Role:</strong> {activeJd.role}
                      </p>
                      <p>
                        <strong>Eligibility Branch:</strong>{" "}
                        {activeJd.eligibilityBranch}
                      </p>
                      <p>
                        <strong>Eligibility CGPA:</strong>{" "}
                        {activeJd.eligibilityCgpa}
                      </p>
                      <p>
                        <strong>Deadline:</strong> {activeJd.deadline}
                      </p>
                      <p>
                        <strong>Description:</strong> {activeJd.description}
                      </p>
                      {activeJd.jdPdfUrl && (
                        <p>
                          <strong>JD PDF:</strong>{" "}
                          <a
                            href={activeJd.jdPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600"
                          >
                            View PDF
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                  {editMode && (
                    <div className="space-y-2 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={activeJd.companyName}
                          onChange={(e) =>
                            setActiveJd({
                              ...activeJd,
                              companyName: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Role
                        </label>
                        <input
                          type="text"
                          value={activeJd.role}
                          onChange={(e) =>
                            setActiveJd({ ...activeJd, role: e.target.value })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Eligibility Branch
                        </label>
                        <input
                          type="text"
                          value={activeJd.eligibilityBranch}
                          onChange={(e) =>
                            setActiveJd({
                              ...activeJd,
                              eligibilityBranch: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Eligibility CGPA
                        </label>
                        <input
                          type="number"
                          value={activeJd.eligibilityCgpa}
                          onChange={(e) =>
                            setActiveJd({
                              ...activeJd,
                              eligibilityCgpa: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={activeJd.deadline.split("T")[0]}
                          onChange={(e) =>
                            setActiveJd({
                              ...activeJd,
                              deadline: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Description
                        </label>
                        <textarea
                          value={activeJd.description}
                          onChange={(e) =>
                            setActiveJd({
                              ...activeJd,
                              description: e.target.value,
                            })
                          }
                          rows="3"
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          JD PDF URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={activeJd.jdPdfUrl}
                          onChange={(e) =>
                            setActiveJd({
                              ...activeJd,
                              jdPdfUrl: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                      >
                        Edit
                      </button>
                    )}
                    {editMode && (
                      <button
                        onClick={() => updateJd(activeJd.id, activeJd)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
                      >
                        Save
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setActiveJd(null);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {selectedTab === "tests" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Tests</h3>
              <div className="flex flex-col gap-2">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="w-full bg-white rounded-lg border border-slate-100 px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-sm">{test.testName}</span>
                    <button
                      onClick={() => deleteJd(jd.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Modal (JD) */}
          {showJdForm && (
            <Modal
              title="Create Job Description"
              onClose={() => setShowJdForm(false)}
            >
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createJd();
                }}
              >
                <div>
                  <Label text="Company Name" />
                  <Input
                    type="text"
                    value={jdForm.companyName}
                    onChange={(e) =>
                      setJdForm({ ...jdForm, companyName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label text="Role" />
                  <Input
                    type="text"
                    value={jdForm.role}
                    onChange={(e) =>
                      setJdForm({ ...jdForm, role: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label text="Eligibility Branch" />
                  <Input
                    type="text"
                    value={jdForm.eligibilityBranch}
                    onChange={(e) =>
                      setJdForm({
                        ...jdForm,
                        eligibilityBranch: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label text="Eligibility CGPA" />
                  <Input
                    type="number"
                    value={jdForm.eligibilityCgpa}
                    onChange={(e) =>
                      setJdForm({ ...jdForm, eligibilityCgpa: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label text="Deadline" />
                  <Input
                    type="date"
                    value={jdForm.deadline}
                    onChange={(e) =>
                      setJdForm({ ...jdForm, deadline: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label text="Description" />
                  <Input
                    type="text"
                    value={jdForm.description}
                    onChange={(e) =>
                      setJdForm({ ...jdForm, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label text="PDF URL (Optional)" />
                  <Input
                    type="text"
                    value={jdForm.jdPdfUrl}
                    onChange={(e) =>
                      setJdForm({ ...jdForm, jdPdfUrl: e.target.value })
                    }
                  />
                </div>
                <Button color="blue" type="submit">
                  Create JD
                </Button>
              </form>
            </Modal>
          )}

          {/* Create Modal (Test) */}
          {showTestForm && (
            <Modal title="Create Test" onClose={() => setShowTestForm(false)}>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createTest();
                }}
              >
                <div>
                  <Label text="Test Name" />
                  <Input
                    type="text"
                    value={testForm.testName}
                    onChange={(e) =>
                      setTestForm({ ...testForm, testName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label text="Description" />
                  <Input
                    type="text"
                    value={testForm.description}
                    onChange={(e) =>
                      setTestForm({ ...testForm, description: e.target.value })
                    }
                  />
                </div>
                <Button color="green" type="submit">
                  Create Test
                </Button>
              </form>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
