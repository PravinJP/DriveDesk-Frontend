// client/src/App.tsx
// FIXES:
//   1. Removed /teacher/create-test route (CreateTest old component no longer used —
//      test creation is now handled inside TeacherDashboard via CreateTestFlow overlay)
//   2. /student/test/:testId route confirmed present and correct
//   3. All routes verified against existing page components

import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home             from "./pages/Home";
import SignIn           from "./pages/SignIn";
import AdminDashboard   from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TestTakingPage   from "./pages/TestTakingPage";
import ProtectedRoute   from "./components/ProtectedRoute";

// NOTE: Do NOT import CreateTest here anymore.
// Test creation now happens as an overlay inside TeacherDashboard
// via the CreateTestFlow component — no separate route needed.

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/"        element={<Home />}   />
        <Route path="/signin"  element={<SignIn />}  />

        {/* ── Admin ──────────────────────────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Teacher ────────────────────────────────────── */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="TEACHER">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        {/*
          /teacher/create-test is REMOVED.
          The old CreateTest.tsx component is no longer used.
          Test creation now happens inside TeacherDashboard as a
          full-screen overlay (CreateTestFlow component).
          You can delete client/src/components/CreateTest.tsx if it exists.
        */}

        {/* ── Student ────────────────────────────────────── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student test-taking page — navigated to from StudentDashboard */}
        <Route
          path="/student/test/:testId"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <TestTakingPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
