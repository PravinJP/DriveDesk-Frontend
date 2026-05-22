// client/src/services/testApi.ts
// FIXED:
//   1. getStudentId() / getTeacherId() read the correct localStorage key
//   2. getTestsByTeacher() calls the right endpoint
//   3. getTestsByStatus() fetches all and filters PUBLISHED for students

import type {
  AllocateQuestionsPayload,
  CreateTestPayload,
  SubmitTestPayload,
  SubmitResult,
  TestInfo,
  TestWithQuestions,
  ViolationPayload,
} from "../types/test.types";

const BASE = "http://localhost:8080/api/tests";

// ── Auth helpers ──────────────────────────────────────────────
// Reads whatever key your SignIn stores the JWT under
const getToken = (): string => localStorage.getItem("token") ?? "";

// FIX: read the user ID from localStorage.
// Change "userId" below if your SignIn stores it under a different key
// (e.g. "id", "user_id", "loggedInUserId").
// To check: open DevTools → Application → Local Storage and look at the keys set after login.
export const getStoredUserId = (): number =>
  Number(localStorage.getItem("userId") || localStorage.getItem("id") || "0");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Generic HTTP helpers ───────────────────────────────────────

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status} – ${url}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const text = await res.text();
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

// ── Teacher API ───────────────────────────────────────────────

// Create test step 1
export const createTestMetadata = (p: CreateTestPayload): Promise<number> =>
  post<number>(`${BASE}/create-metadata`, p);

// Create test step 2 (manual)
export const allocateQuestions = (p: AllocateQuestionsPayload): Promise<string> =>
  post<string>(`${BASE}/allocate-questions`, p);

// FIX: this is the correct endpoint for the teacher dashboard test list
export const getTestsByTeacher = (teacherId: number): Promise<TestInfo[]> =>
  get<TestInfo[]>(`${BASE}/by-teacher/${teacherId}`);

// ── Student API ───────────────────────────────────────────────

// Student dashboard: show only PUBLISHED tests
// Fetches all, filters client-side (avoids needing a separate backend endpoint)
export const getTestsByStatus = async (status: string): Promise<TestInfo[]> => {
  const all = await get<TestInfo[]>(`${BASE}/all`);
  return all.filter(t => t.status === status);
};

// Student taking a test: get questions (no correct answers)
export const getTestWithQuestions = (testId: number): Promise<TestWithQuestions> =>
  get<TestWithQuestions>(`${BASE}/${testId}/questions`);

// Start attempt (creates attempt record in DB)
export const startAttempt = (testId: number, studentId: number): Promise<number> =>
  post<number>(`${BASE}/${testId}/start?studentId=${studentId}`, {});

// Submit test answers + proctoring data
export const submitTest = (p: SubmitTestPayload): Promise<SubmitResult> =>
  post<SubmitResult>(`${BASE}/submit`, p);

// ── Proctoring ─────────────────────────────────────────────────

export const recordViolation = (p: ViolationPayload): Promise<void> =>
  post<void>(`${BASE}/proctoring/violation`, p);
