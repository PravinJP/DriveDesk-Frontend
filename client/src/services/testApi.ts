// client/src/services/testApi.ts

import type {
  SubmitTestPayload,
  SubmitResult,
  TestInfo,
  TestWithQuestions,
  ViolationPayload,
  CreateTestMetadataPayload,
  McqQuestionForm,
  CodingQuestionForm,
} from "../types/test.types";

const BASE = "http://localhost:8080/api/tests";

// ── Headers ────────────────────────────────────────────────────
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

// ── Generic GET ────────────────────────────────────────────────
async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Generic POST ───────────────────────────────────────────────
async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ── Teacher APIs ───────────────────────────────────────────────

// ✅ CREATE TEST METADATA (STEP 1)
export const createTestMetadata = (data: CreateTestMetadataPayload) =>
  post<number>(`${BASE}/create`, data);

// ✅ ALLOCATE QUESTIONS (STEP 2 + 3)
export const allocateQuestions = (data: {
  testId: number;
  questions: (McqQuestionForm | CodingQuestionForm)[];
}) =>
  post<void>(`${BASE}/allocate`, data);

// Get tests by teacher
export const getTestsByTeacher = (teacherId: number) =>
  get<TestInfo[]>(`${BASE}/by-teacher/${teacherId}`);

// ── Student APIs ───────────────────────────────────────────────

// Fetch all PUBLISHED tests
export const getTestsByStatus = (_status: string) =>
  get<TestInfo[]>(`${BASE}/all`).then((all) =>
    all.filter((t) => t.status === "PUBLISHED")
  );

// Get test with questions
export const getTestWithQuestions = (testId: number) =>
  get<TestWithQuestions>(`${BASE}/${testId}/questions`);

// Start test attempt
export const startAttempt = (testId: number, studentId: number) =>
  post<number>(`${BASE}/${testId}/start?studentId=${studentId}`, {});

// Submit test
export const submitTest = (payload: SubmitTestPayload) =>
  post<SubmitResult>(`${BASE}/submit`, payload);

// ── Proctoring APIs ────────────────────────────────────────────

// Record violation
export const recordViolation = (payload: ViolationPayload) =>
  post<void>(`${BASE}/proctoring/violation`, payload);