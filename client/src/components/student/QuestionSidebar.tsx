// client/src/components/student/QuestionSidebar.tsx
// Left nav panel: progress bar + per-question status dots + submit.

import React from "react";
import type { Question, AnswerPayload } from "../../types/test.types";

interface Props {
  questions: Question[];
  answers: Map<number, AnswerPayload>;
  onSubmit: () => void;
}

const QuestionSidebar: React.FC<Props> = ({ questions, answers, onSubmit }) => {
  const answered = answers.size;
  const total    = questions.length;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;

  const isDone = (q: Question) => {
    const a = answers.get(q.id);
    if (!a) return false;
    if (q.questionType === "MCQ") return a.selectedOptionIndex !== undefined;
    return (a.codeSubmission ?? "").trim().length > 0;
  };

  return (
    <aside className="w-52 bg-[#161b22] border-r border-[#30363d] flex flex-col p-4 gap-2 overflow-y-auto shrink-0">
      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-[#6e7681] mb-1.5 font-semibold">
          <span>Progress</span>
          <span>{answered}/{total}</span>
        </div>
        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Per-question buttons */}
      {questions.map((q, i) => {
        const done = isDone(q);
        return (
          <a
            key={q.id}
            href={`#q_${q.id}`}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              done
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-[#0d1117] border-[#21262d] text-[#8b949e] hover:border-[#30363d]"
            }`}
          >
            <span>Q{i + 1}</span>
            <span className={`text-[10px] font-black ${
              q.questionType === "MCQ" ? "text-blue-500/70" : "text-violet-500/70"
            }`}>
              {q.questionType === "MCQ" ? "M" : "C"}
            </span>
          </a>
        );
      })}

      {/* Submit */}
      <button
        onClick={onSubmit}
        className="mt-auto py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all"
      >
        Submit Test
      </button>
    </aside>
  );
};

export default QuestionSidebar;
