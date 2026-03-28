import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaGraduationCap,
  FaUsers,
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
} from "react-icons/fa";
import Modal from "../components/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

interface Teacher {
  id: number;
  teacherId: string;
  department: string;
  username: string;
  email: string;
}

interface Student {
  id: number;
  rollNumber: string;
  department: string;
  username: string;
  email: string;
}

interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherPage, setTeacherPage] = useState(0);
  const [studentPage, setStudentPage] = useState(0);
  const [teacherTotalPages, setTeacherTotalPages] = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(0);
  const [teacherTotal, setTeacherTotal] = useState(0);
  const [studentTotal, setStudentTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

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

  const fetchUsers = async (tPage = teacherPage, sPage = studentPage) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8080/api/auth/all?page=${activeTab === "teachers" ? tPage : sPage}&size=8`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const teachersData: PagedResponse<any> = res.data.teachers;
      const studentsData: PagedResponse<any> = res.data.students;

      setTeachers(
        (teachersData?.content || []).map((t) => ({
          id: t.id,
          teacherId: t.teacherId,
          username: t.username,
          email: t.email,
          department: t.department,
        }))
      );
      setStudents(
        (studentsData?.content || []).map((s) => ({
          id: s.id,
          rollNumber: s.rollNumber,
          username: s.username,
          email: s.email,
          department: s.department,
        }))
      );
      setTeacherTotalPages(teachersData?.totalPages || 0);
      setStudentTotalPages(studentsData?.totalPages || 0);
      setTeacherTotal(teachersData?.totalElements || 0);
      setStudentTotal(studentsData?.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [teacherPage, studentPage, activeTab]);

  const submitTeacher = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/users/teacher", teacherForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowTeacherForm(false);
      setTeacherForm({ userName: "", teacherId: "", email: "", password: "", department: "" });
      fetchUsers();
      alert("Teacher created successfully!");
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Failed to save teacher!");
    }
  };

  const submitStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/users/student", studentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowStudentForm(false);
      setStudentForm({ userName: "", rollNumber: "", email: "", password: "", department: "" });
      fetchUsers();
      alert("Student created successfully!");
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student!");
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacherId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPage = activeTab === "teachers" ? teacherPage : studentPage;
  const totalPages = activeTab === "teachers" ? teacherTotalPages : studentTotalPages;

  const handlePrev = () => {
    if (activeTab === "teachers") setTeacherPage((p) => Math.max(0, p - 1));
    else setStudentPage((p) => Math.max(0, p - 1));
  };

  const handleNext = () => {
    if (activeTab === "teachers") setTeacherPage((p) => Math.min(teacherTotalPages - 1, p + 1));
    else setStudentPage((p) => Math.min(studentTotalPages - 1, p + 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">
            {teacherTotal} teachers · {studentTotal} students
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTeacherForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
          >
            <FaPlus /> Add Teacher
          </button>
          <button
            onClick={() => setShowStudentForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all"
          >
            <FaPlus /> Add Student
          </button>
        </div>
      </div>

      {/* Tabs + Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-slate-100">
          <div className="flex gap-1">
            <button
              onClick={() => { setActiveTab("teachers"); setSearchQuery(""); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
                activeTab === "teachers"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaGraduationCap />
              Teachers
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "teachers" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                {teacherTotal}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("students"); setSearchQuery(""); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
                activeTab === "students"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaUsers />
              Students
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "students" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                {studentTotal}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {activeTab === "teachers" ? "Teacher ID" : "Roll Number"}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === "teachers"
                  ? filteredTeachers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                              {t.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{t.username}</p>
                              <p className="text-xs text-slate-400">#{t.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                            {t.teacherId || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.email}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            {t.department || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))
                  : filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                              {s.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{s.username}</p>
                              <p className="text-xs text-slate-400">#{s.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                            {s.rollNumber || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{s.email}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                            {s.department || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}

                {(activeTab === "teachers" ? filteredTeachers : filteredStudents).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaUsers className="text-3xl opacity-30" />
                        <p className="text-sm">No {activeTab} found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {currentPage + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronLeft className="text-xs" /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Form Modal */}
      {showTeacherForm && (
        <Modal title="Create Teacher" onClose={() => setShowTeacherForm(false)}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitTeacher(); }}>
            <div><Label text="Username" /><Input type="text" value={teacherForm.userName} onChange={(e) => setTeacherForm({ ...teacherForm, userName: e.target.value })} /></div>
            <div><Label text="Teacher ID" /><Input type="text" value={teacherForm.teacherId} onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })} /></div>
            <div><Label text="Email" /><Input type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} /></div>
            <div><Label text="Password" /><Input type="password" value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} /></div>
            <div><Label text="Department" /><Input type="text" value={teacherForm.department} onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })} /></div>
            <Button color="blue" type="submit">Create Teacher</Button>
          </form>
        </Modal>
      )}

      {/* Student Form Modal */}
      {showStudentForm && (
        <Modal title="Create Student" onClose={() => setShowStudentForm(false)}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitStudent(); }}>
            <div><Label text="Username" /><Input type="text" value={studentForm.userName} onChange={(e) => setStudentForm({ ...studentForm, userName: e.target.value })} /></div>
            <div><Label text="Roll Number" /><Input type="text" value={studentForm.rollNumber} onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })} /></div>
            <div><Label text="Email" /><Input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} /></div>
            <div><Label text="Password" /><Input type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} /></div>
            <div><Label text="Department" /><Input type="text" value={studentForm.department} onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })} /></div>
            <Button color="green" type="submit">Create Student</Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;