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

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Always clear old tokens before new login
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    let payload = {};
    let endpoint = "";

    // Set payload and endpoint based on selected role
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

      // ✅ Handle different token keys
      const token = res.data.token || res.data.jwtToken || res.data.jwt;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        console.log("🪪 Token saved:", token);
      } else {
        throw new Error("No token found in response");
      }

      // ✅ Redirect based on role
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "TEACHER") {
        navigate("/teacher/dashboard");
      } else if (role === "STUDENT") {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Selector */}
      <select
        name="role"
        title="Select Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="ADMIN">Admin</option>
        <option value="TEACHER">Teacher</option>
        <option value="STUDENT">Student</option>
      </select>

      {/* Admin Fields */}
      {role === "ADMIN" && (
        <>
          <input
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </>
      )}

      {/* Teacher Fields */}
      {role === "TEACHER" && (
        <>
          <input
            type="text"
            name="teacherId"
            placeholder="Teacher ID"
            value={formData.teacherId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            required
          />
        </>
      )}

      {/* Student Fields */}
      {role === "STUDENT" && (
        <>
          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            required
          />
        </>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Submit Button */}
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
