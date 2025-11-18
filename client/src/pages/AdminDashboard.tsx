import { useState } from "react";
import axios from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Card from "@/components/ui/Card";
import SideBar from "../components/SideBar";
import Modal from "../components/Modal";

interface Stats {
  Teachers: number;
  Students: number;
  Tests: number;
  "Active Tests": number;
  Drives: number;
  "Active Drives": number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    Teachers: 2,
    Students: 15,
    Tests: 30,
    "Active Tests": 5,
    Drives: 5,
    "Active Drives": 2,
  });

  const [activity, setActivity] = useState([
    "New student registered: John Doe",
    "New teacher added: Teacher B",
    "System update scheduled",
  ]);

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

  const handleCreateTeacher = () => setShowTeacherForm(true);
  const handleCreateStudent = () => setShowStudentForm(true);

  // ✅ Submit teacher to backend
  const submitTeacher = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/users/teacher", teacherForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats((prev) => ({ ...prev, Teachers: prev.Teachers + 1 }));
      setActivity((prev) => [`New teacher added: ${teacherForm.userName}`, ...prev]);
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

  // ✅ Submit student to backend
  const submitStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/api/users/student", studentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats((prev) => ({ ...prev, Students: prev.Students + 1 }));
      setActivity((prev) => [`New student registered: ${studentForm.userName}`, ...prev]);
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

  return (
    <div className="flex h-screen">
      <SideBar />
      <main className="flex-1 p-10 bg-gray-100 overflow-y-auto relative">
        <h1 className="text-2xl font-bold text-[#1E3A8A] mb-8">Admin Dashboard</h1>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key} title={key} value={value} color="text-blue-600" />
          ))}
        </div>

        {/* ✅ Action Buttons */}
        <div className="flex gap-4 mb-10">
          <Button color="blue" onClick={handleCreateTeacher}>
            + Create Teacher
          </Button>
          <Button color="green" onClick={handleCreateStudent}>
            + Create Student
          </Button>
        </div>

        {/* ✅ Activity Log */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-lg font-semibold mb-3 text-blue-700">Recent Activity</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            {activity.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* ✅ Teacher Form Modal */}
        {showTeacherForm && (
          <Modal title="Create Teacher" onClose={() => setShowTeacherForm(false)}>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitTeacher();
              }}
            >
              <Label text="Username" />
              <Input
                type="text"
                placeholder="Username"
                value={teacherForm.userName}
                onChange={(e) => setTeacherForm({ ...teacherForm, userName: e.target.value })}
              />
              <Label text="Teacher ID" />
              <Input
                type="text"
                placeholder="Teacher ID"
                value={teacherForm.teacherId}
                onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
              />
              <Label text="Email" />
              <Input
                type="email"
                placeholder="Email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
              />
              <Label text="Password" />
              <Input
                type="password"
                placeholder="Password"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
              />
              <Label text="Department" />
              <Input
                type="text"
                placeholder="Department"
                value={teacherForm.department}
                onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
              />
              <Button color="blue" type="submit">
                Create
              </Button>
            </form>
          </Modal>
        )}

        {/* ✅ Student Form Modal */}
        {showStudentForm && (
          <Modal title="Create Student" onClose={() => setShowStudentForm(false)}>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitStudent();
              }}
            >
              <Label text="Username" />
              <Input
                type="text"
                placeholder="Username"
                value={studentForm.userName}
                onChange={(e) => setStudentForm({ ...studentForm, userName: e.target.value })}
              />
              <Label text="Roll Number" />
              <Input
                type="text"
                placeholder="Roll Number"
                value={studentForm.rollNumber}
                onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
              />
              <Label text="Email" />
              <Input
                type="email"
                placeholder="Email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              />
              <Label text="Password" />
              <Input
                type="password"
                placeholder="Password"
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
              />
              <Label text="Department" />
              <Input
                type="text"
                placeholder="Department"
                value={studentForm.department}
                onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
              />
              <Button color="green" type="submit">
                Create
              </Button>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
