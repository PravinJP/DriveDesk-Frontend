import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignInForm = () => {
  const [role, setRole] = useState("ADMIN");
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    teacherId: "",
    department: "",
    rollNumber: "",
  });
  const [error, setError] = useState<null | string>(null);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    let payload = {};
    let endpoint = "";

    if (role === "ADMIN") {
      payload = {
        userName: formData.userName,
        password: formData.password,
      };
      endpoint = "http://localhost:8080/api/auth/admin/login";
    } else if (role === "TEACHER") {
      payload = {
        teacherId: formData.teacherId,
        department: formData.department,
        password: formData.password,
      };
      endpoint = "http://localhost:8080/api/auth/teacher/login";
    } else if (role === "STUDENT") {
      payload = {
        rollNumber: formData.rollNumber,
        department: formData.department,
        password: formData.password,
      };
      endpoint = "http://localhost:8080/api/auth/student/login";
    }

    try {
      const res = await axios.post(endpoint, payload);
      console.log("✅ Login success:", res.data);

      const token = res.data.token;

      // ⭐ UPDATED — Extract backend role and clean it
      let backendRole = res.data.role || role;

      // ⭐ UPDATED — Convert ROLE_STUDENT → STUDENT
      if (backendRole.startsWith("ROLE_")) {
        backendRole = backendRole.replace("ROLE_", "");
      }

      // ⭐ Normalize case
      backendRole = backendRole.toUpperCase();

      // ⭐ Save normalized role
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", backendRole); 
      } else {
        throw new Error("No token found in response");
      }

      // ⭐ UPDATED — Correct redirection using cleaned role
      const finalRedirect = `/${backendRole.toLowerCase()}/dashboard`;
      console.log("🚀 Redirecting to:", finalRedirect);

      navigate(finalRedirect, { replace: true });

    } catch (error: any) {
      console.error("❌ Login failed:", error);
      if (error.response) {
        setError(
          error.response.data?.message ||
            "Login failed. Please check your credentials."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ⭐ UPDATED — Reset input fields when switching roles */}
      <select
        name="role"
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
          setFormData({
            userName: "",
            password: "",
            teacherId: "",
            department: "",
            rollNumber: "",
          });
          setError(null);
        }}
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="ADMIN">Admin</option>
        <option value="TEACHER">Teacher</option>
        <option value="STUDENT">Student</option>
      </select>

      {/* Render fields dynamically here... unchanged */}

      {error && <p className="text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        className="w-full px-4 py-2 text-lg font-medium border border-gray-700 rounded-md hover:bg-gray-800 hover:text-white transition duration-300"
      >
        Sign In
      </button>
    </form>
  );
};

export default SignInForm;
