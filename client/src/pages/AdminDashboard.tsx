import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaUsers,
  FaGraduationCap,
  FaFileAlt,
  FaCheckCircle,
  FaDatabase,
  FaPlus,
  FaBell,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import SideBar from "../components/SideBar";
import Modal from "../components/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

interface Stats {
  Teachers: number;
  Students: number;
  Tests: number;
  "Active Tests": number;
  Drives: number;
  "Active Drives": number;
}

const AdminDashboard = () => {
  const [selectedPage, setSelectedPage] = useState<"dashboard" | "users">(
    "dashboard"
  );
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activity, setActivity] = useState([]);

  const [stats, setStats] = useState<Stats>({
    Teachers: 0,
    Students: 0,
    Tests: 30,
    "Active Tests": 5,
    Drives: 5,
    "Active Drives": 2,
  });

  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const [teacherForm, setTeacherForm] = useState({
    userName: "",
    teacherId: "",
    email: "",
    password: "",
    department: "",
  });

  const [studentForm, setStudentForm] = useState({
    userName: "",
    rollNumber: "",
    email: "",
    password: "",
    department: "",
  });

  // --- Fetch users and update stats ---
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8080/api/auth/all?page=0&size=10",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Map teachers and students
      const teachersData = (res.data.teachers?.content || []).map((t) => ({
        id: t.id,
        userName: t.username,
        email: t.email,
        department: t.department,
      }));
      const studentsData = (res.data.students?.content || []).map((s) => ({
        id: s.id,
        userName: s.username,
        email: s.email,
        department: s.department,
      }));

      setTeachers(teachersData);
      setStudents(studentsData);

      setStats((prev) => ({
        ...prev,
        Teachers: teachersData.length,
        Students: studentsData.length,
      }));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // --- Fetch recent activity ---
  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8080/api/users/activity/latest/10",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Map backend DTO to frontend format
      const activityList = (res.data || []).map((item) => ({
        action: item.action,
        name: item.name,
        time: item.time,
        type: item.type,
      }));
      setActivity(activityList);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
  };

  // --- Fetch on page load and when switching pages ---
  useEffect(() => {
    fetchActivity();
    if (selectedPage === "users" || selectedPage === "dashboard") {
      fetchUsers();
    }
  }, [selectedPage]);

  // --- Add Teacher ---
  const submitTeacher = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/users/teacher", teacherForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats((prev) => ({ ...prev, Teachers: prev.Teachers + 1 }));
      await fetchActivity();
      setShowTeacherForm(false);
      setTeacherForm({
        userName: "",
        teacherId: "",
        email: "",
        password: "",
        department: "",
      });
      alert("Teacher saved successfully!");
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Failed to save teacher!");
    }
  };

  // --- Add Student ---
  const submitStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/users/student", studentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats((prev) => ({ ...prev, Students: prev.Students + 1 }));
      await fetchActivity();
      setShowStudentForm(false);
      setStudentForm({
        userName: "",
        rollNumber: "",
        email: "",
        password: "",
        department: "",
      });
      alert("Student saved successfully!");
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student!");
    }
  };

  // --- Render UI ---
  const statsConfig = [
    { key: "Teachers", icon: FaGraduationCap, color: "blue" },
    { key: "Students", icon: FaUsers, color: "indigo" },
    { key: "Tests", icon: FaFileAlt, color: "purple" },
    { key: "Active Tests", icon: FaCheckCircle, color: "blue" },
    { key: "Drives", icon: FaDatabase, color: "indigo" },
    { key: "Active Drives", icon: FaChartLine, color: "purple" },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <SideBar
        items={[
          { id: "dashboard", label: "Dashboard", icon: FaHome },
          { id: "users", label: "Users", icon: FaUsers },
          { id: "analytics", label: "Analytics", icon: FaChartBar },
          { id: "tests", label: "Tests", icon: FaFileAlt },
          { id: "drives", label: "Drives", icon: FaDatabase },
          { id: "settings", label: "Settings", icon: FaCog },
        ]}
        title="Admin"
        onSelect={(page) => navigate(`/admin/${page}`)}
        userName="Admin"
        userEmail="admin@school.edu"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <FaBell className="text-slate-600 text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    Admin User
                  </p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  AU
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {selectedPage === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Welcome back, Admin! 👋
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Here's what's happening with your system today
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTeacherForm(true);
                      setTeacherForm({
                        userName: "",
                        teacherId: "",
                        email: "",
                        password: "",
                        department: "",
                      });
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <FaPlus /> Add Teacher
                  </button>
                  <button
                    onClick={() => {
                      setShowStudentForm(true);
                      setStudentForm({
                        userName: "",
                        rollNumber: "",
                        email: "",
                        password: "",
                        department: "",
                      });
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all"
                  >
                    <FaPlus /> Add Student
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {statsConfig.map(({ key, icon: Icon, color }) => (
                  <div
                    key={key}
                    className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <Icon className="text-xl" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          +12%
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-800 mb-1">
                        {stats[key as keyof Stats]}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {key}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400">
                          Updated just now
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                      Recent Activity
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {activity.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            item.type === "student"
                              ? "bg-blue-100 text-blue-600"
                              : item.type === "teacher"
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {item.type === "student" ? (
                            <FaUsers />
                          ) : item.type === "teacher" ? (
                            <FaGraduationCap />
                          ) : (
                            <FaCheckCircle />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.action}
                          </p>
                          <p className="text-xs text-slate-500">{item.name}</p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-bold mb-6">Quick Overview</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <p className="text-sm text-blue-100 mb-1">Total Users</p>
                      <p className="text-2xl font-bold">
                        {stats.Teachers + stats.Students}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <p className="text-sm text-blue-100 mb-1">Active Tests</p>
                      <p className="text-2xl font-bold">
                        {stats["Active Tests"]}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <p className="text-sm text-blue-100 mb-1">Total Tests</p>
                      <p className="text-2xl font-bold">{stats.Tests}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPage === "users" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Teachers</h1>
                <p className="text-slate-500 mt-1">Manage all teachers</p>
                <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b-2 border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teachers.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                              #{t.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                                  {t.userName?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-800">
                                  {t.userName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {t.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {t.department}
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Students</h1>
                <p className="text-slate-500 mt-1">Manage all students</p>
                <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b-2 border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                              #{s.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                                  {s.userName?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-800">
                                  {s.userName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {s.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {s.department}
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showTeacherForm && (
        <Modal title="Create Teacher" onClose={() => setShowTeacherForm(false)}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitTeacher();
            }}
          >
            <div>
              <Label text="Username" />
              <Input
                type="text"
                value={teacherForm.userName}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, userName: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Teacher ID" />
              <Input
                type="text"
                value={teacherForm.teacherId}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, teacherId: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Email" />
              <Input
                type="email"
                value={teacherForm.email}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Password" />
              <Input
                type="password"
                value={teacherForm.password}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, password: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Department" />
              <Input
                type="text"
                value={teacherForm.department}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, department: e.target.value })
                }
              />
            </div>
            <Button color="blue" type="submit">
              Create Teacher
            </Button>
          </form>
        </Modal>
      )}

      {showStudentForm && (
        <Modal title="Create Student" onClose={() => setShowStudentForm(false)}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitStudent();
            }}
          >
            <div>
              <Label text="Username" />
              <Input
                type="text"
                value={studentForm.userName}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, userName: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Roll Number" />
              <Input
                type="text"
                value={studentForm.rollNumber}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, rollNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Email" />
              <Input
                type="email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Password" />
              <Input
                type="password"
                value={studentForm.password}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, password: e.target.value })
                }
              />
            </div>
            <div>
              <Label text="Department" />
              <Input
                type="text"
                value={studentForm.department}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, department: e.target.value })
                }
              />
            </div>
            <Button color="green" type="submit">
              Create Student
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
