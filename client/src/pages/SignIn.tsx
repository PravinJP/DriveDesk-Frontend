import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaLock,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaIdCard,
  FaBuilding,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "STUDENT" | "TEACHER" | "ADMIN"
  >("STUDENT");

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    teacherId: "",
    department: "",
    rollNumber: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoints = {
      ADMIN: "http://localhost:8080/api/auth/admin/login",
      TEACHER: "http://localhost:8080/api/auth/teacher/login",
      STUDENT: "http://localhost:8080/api/auth/student/login",
    };

    const payloads = {
      ADMIN: {
        userName: formData.userName,
        password: formData.password,
      },
      TEACHER: {
        teacherId: formData.teacherId,
        department: formData.department,
        password: formData.password,
      },
      STUDENT: {
        rollNumber: formData.rollNumber,
        department: formData.department,
        password: formData.password,
      },
    };

    try {
      const res = await axios.post(
        endpoints[activeTab],
        payloads[activeTab]
      );

      console.log("Login Response:", res.data); // 🔍 Debug

      const token =
        res.data.token || res.data.jwtToken || res.data.jwt;

      // 🔥 Extract userId safely
      let userId =
        res.data.userId ||
        res.data.id ||
        res.data.teacherId ||
        res.data.studentId;

      // 🔁 If backend didn't send userId → decode JWT
      if (!userId && token) {
        try {
          const payload = JSON.parse(
            atob(token.split(".")[1])
          );
          userId =
            payload.sub ||
            payload.userId ||
            payload.id ||
            payload.teacherId;
        } catch (err) {
          console.error("JWT decode failed");
        }
      }

      // 🛑 Safety fallback
 // 🧠 Extract numeric ID (VERY IMPORTANT FIX)
let numericId = 0;

if (userId) {
  const match = String(userId).match(/\d+/); // extract numbers
  numericId = match ? Number(match[0]) : 0;
}

// 🛑 Safety fallback
if (!numericId) {
  console.warn("Invalid userId, defaulting to 0:", userId);
}

// ✅ Store everything
localStorage.setItem("token", token);
localStorage.setItem("role", activeTab);
localStorage.setItem("userId", String(numericId)); // ✅ FIXED

console.log("Stored numeric userId:", numericId);

      // ✅ Navigation
      const routes = {
        ADMIN: "/admin/dashboard",
        TEACHER: "/teacher/dashboard",
        STUDENT: "/student",
      };

      navigate(routes[activeTab]);

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Login failed. Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "STUDENT", label: "Student", icon: FaUserGraduate },
    { id: "TEACHER", label: "Teacher", icon: FaChalkboardTeacher },
    { id: "ADMIN", label: "Admin", icon: FaUserShield },
  ];

  const getFields = () => {
    switch (activeTab) {
      case "ADMIN":
        return [
          { name: "userName", placeholder: "Username", icon: FaUserShield, type: "text" },
          { name: "password", placeholder: "Password", icon: FaLock, type: "password" },
        ];
      case "TEACHER":
        return [
          { name: "teacherId", placeholder: "Teacher ID", icon: FaIdCard, type: "text" },
          { name: "department", placeholder: "Department", icon: FaBuilding, type: "text" },
          { name: "password", placeholder: "Password", icon: FaLock, type: "password" },
        ];
      case "STUDENT":
        return [
          { name: "rollNumber", placeholder: "Roll Number", icon: FaIdCard, type: "text" },
          { name: "department", placeholder: "Department", icon: FaBuilding, type: "text" },
          { name: "password", placeholder: "Password", icon: FaLock, type: "password" },
        ];
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl grid md:grid-cols-5"
      >
        {/* Left */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex flex-col justify-center text-white">
          <h1 className="text-2xl font-bold text-center">DriveDesk</h1>
        </div>

        {/* Right */}
        <div className="md:col-span-3 p-8">
          <h2 className="text-2xl font-bold mb-4">Sign In</h2>

          <div className="flex gap-2 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 ${
                    activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {getFields()?.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="relative">
                  <Icon className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full pl-10 py-2 border rounded"
                    required
                  />
                </div>
              );
            })}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;