import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaIdCard, FaBuilding } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [formData, setFormData] = useState({ userName: "", password: "", teacherId: "", department: "", rollNumber: "" });
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
      ADMIN: { userName: formData.userName, password: formData.password },
      TEACHER: { teacherId: formData.teacherId, department: formData.department, password: formData.password },
      STUDENT: { rollNumber: formData.rollNumber, department: formData.department, password: formData.password },
    };

    try {
      const res = await axios.post(endpoints[activeTab], payloads[activeTab]);
      const token = res.data.token || res.data.jwtToken || res.data.jwt;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", activeTab);
      
      navigate(`/${activeTab.toLowerCase()}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
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
        {/* Left Panel */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 left-5 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute bottom-5 right-5 w-40 h-40 border-2 border-white rounded-full" />
          </div>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img src="/logo-final.svg" alt="DriveDesk" className="h-10" />
            </div>
            <h1 className="text-2xl font-bold mb-2">DriveDesk</h1>
            <p className="text-sm text-blue-100 mb-6">Campus Placement Portal</p>

            <div className="space-y-2 text-left">
              {["Easy Registration", "Real-time Updates", "Proctored Tests", "Secure Platform"].map((text, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-xs">
                  <span className="text-green-300">✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-3 p-8 bg-white">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign In</h2>
          <p className="text-sm text-slate-500 mb-6">Access your dashboard</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setError(null); }}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all relative ${
                    activeTab === tab.id ? "text-white" : "text-slate-600"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab" className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg" />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1 text-xs">
                    <Icon className="text-sm" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Dynamic Fields */}
              <div className="space-y-4 min-h-[180px]">
                {getFields()?.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name} className="relative">
                      <Icon className="absolute left-3 top-3 text-slate-400 text-sm" />
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs text-center">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 text-blue-600 rounded" />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all ${
                  loading ? "opacity-70" : ""
                }`}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              New to DriveDesk?{" "}
              <a href="/signup" className="text-blue-600 hover:underline font-medium">
                Create Account
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
