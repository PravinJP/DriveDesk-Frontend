import React from "react";
import "../index.css";
import { motion } from "framer-motion";
import SignInForm from "../components/SignInForm";

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100">
      {/* Outer Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-200 backdrop-blur-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo-final.svg" alt="DriveDesk Logo" className="h-14" />
        </div>

        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Sign in to access your DriveDesk dashboard
        </p>

        {/* Sign In Form (your logic stays the same) */}
        <div className="space-y-6">
          <SignInForm />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-8 text-sm">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up here
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
