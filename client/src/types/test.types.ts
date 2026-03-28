// client/src/types/test.types.ts

export type QuestionType = "MCQ" | "CODING";
export type TestStatus = "DRAFT" | "PUBLISHED" | "ENDED";
export type Language = "python3" | "java" | "cpp" | "javascript";

// ── Test Info ──────────────────────────────────────────────────
export interface TestInfo {
  id: number;
  title: string;
  mcqCount: number;
  codingCount: number;
  numberOfQuestions: number;
  duration: number;
  totalMarks: number;
  instructions: string;
  status: TestStatus;
  createdByTeacherId: number;
}

// ── Questions ──────────────────────────────────────────────────
export interface McqQuestion {
  id: number;
  questionType: "MCQ";
  questionText: string;
  options: string[];
  marks: number;
}

export interface CodingQuestion {
  id: number;
  questionType: "CODING";
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  marks: number;
}

export type Question = McqQuestion | CodingQuestion;

export interface TestWithQuestions {
  test: TestInfo;
  questions: Question[];
}

// ── FORM TYPES (NEW - REQUIRED) ────────────────────────────────

// Used in CreateTestFlow Step 2
export interface McqQuestionForm {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

// Used in Step 3
export interface CodingQuestionForm {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  marks: number;
}

// Used in Step 1
export interface CreateTestMetadataPayload {
  title: string;
  mcqCount: number;
  codingCount: number;
  duration: number;
  totalMarks: number;
  instructions: string;
  createdByTeacherId: number;
}

// ── Submission ────────────────────────────────────────────────
export interface AnswerPayload {
  questionId: number;
  questionType: QuestionType;
  selectedOptionIndex?: number;
  codeSubmission?: string;
  language?: Language;
}

export interface SubmitTestPayload {
  testId: number;
  studentId: number;
  answers: AnswerPayload[];
  forcedEnd: boolean;
  forceEndReason: string;
  tabSwitchCount: number;
  faceViolationCount: number;
  micViolationCount: number;
}

export interface SubmitResult {
  attemptId: number;
  totalScore: number;
  maxScore: number;
  status: string;
}

// ── Proctoring ────────────────────────────────────────────────
export interface ViolationPayload {
  attemptId: number;
  violationType: "TAB_SWITCH" | "FACE_VIOLATION" | "MIC_VIOLATION";
  details: string;
}