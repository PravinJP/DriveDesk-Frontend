// client/src/components/student/McqCard.tsx
// Renders a single MCQ question with styled radio-button options.

import React from "react";
import type { McqQuestion } from "../../types/test.types";

interface Props {
  question: McqQuestion;
  index: number;
  selected: number | undefined;
  onChange: (optionIndex: number) => void;
}

// Each option gets a distinct accent colour
const OPT = [
  { idle: "border-[#21262d] hover:border-blue-500/50 hover:bg-blue-500/5",     sel: "border-blue-500/60 bg-blue-500/10",   btn: "bg-[#21262d] text-blue-400",   selBtn: "bg-blue-500 text-white"   },
  { idle: "border-[#21262d] hover:border-violet-500/50 hover:bg-violet-500/5", sel: "border-violet-500/60 bg-violet-500/10", btn: "bg-[#21262d] text-violet-400", selBtn: "bg-violet-500 text-white" },
  { idle: "border-[#21262d] hover:border-amber-500/50 hover:bg-amber-500/5",   sel: "border-amber-500/60 bg-amber-500/10",  btn: "bg-[#21262d] text-amber-400",  selBtn: "bg-amber-500 text-white"  },
  { idle: "border-[#21262d] hover:border-rose-500/50 hover:bg-rose-500/5",     sel: "border-rose-500/60 bg-rose-500/10",    btn: "bg-[#21262d] text-rose-400",   selBtn: "bg-rose-500 text-white"   },
];

const McqCard: React.FC<Props> = ({ question, index, selected, onChange }) => (
  <div
    id={`q_${question.id}`}
    className="bg-[#161b22] border border-[#30363d] rounded-2xl p-7 scroll-mt-4"
  >
    {/* Header */}
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/25 rounded-lg flex items-center justify-center text-blue-400 font-black text-sm">
        {index + 1}
      </div>
      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
        MCQ
      </span>
      <span className="ml-auto text-xs text-[#484f58] font-semibold">
        {question.marks} mark{question.marks > 1 ? "s" : ""}
      </span>
    </div>

    {/* Question text */}
    <p className="text-white text-base leading-relaxed mb-6">{question.questionText}</p>

    {/* Options */}
    <div className="space-y-3">
      {question.options.map((opt, oi) => {
        const c = OPT[oi % 4];
        const isSel = selected === oi;
        return (
          <label
            key={oi}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSel ? c.sel : c.idle}`}
          >
            <input
              type="radio"
              name={`q_${question.id}`}
              checked={isSel}
              onChange={() => onChange(oi)}
              className="hidden"
            />
            {/* Letter button */}
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all ${isSel ? c.selBtn : c.btn}`}>
              {String.fromCharCode(65 + oi)}
            </span>
            <span className={`text-sm transition-colors leading-relaxed ${isSel ? "text-white font-medium" : "text-[#8b949e]"}`}>
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  </div>
);

export default McqCard;
