// client/src/components/student/ProctoringBar.tsx
// Top status bar shown during a test: timer, violation counts, submit button.

import React from "react";

interface Props {
  testTitle: string;
  secondsLeft: number;
  tabCount: number;
  faceCount: number;
  micCount: number;
  onSubmit: () => void;
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const ProctoringBar: React.FC<Props> = ({
  testTitle, secondsLeft, tabCount, faceCount, micCount, onSubmit,
}) => {
  const urgent = secondsLeft < 300; // red when < 5 minutes

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#161b22] border-b border-[#30363d] shrink-0 z-40">
      {/* Test title */}
      <span className="text-white font-bold text-sm truncate max-w-xs hidden md:block">
        {testTitle}
      </span>

      {/* Timer — centre */}
      <div className={`font-black font-mono text-xl px-5 py-1.5 rounded-xl transition-all mx-auto md:mx-0 ${
        urgent
          ? "bg-red-500/20 text-red-400 animate-pulse"
          : "bg-[#21262d] text-white"
      }`}>
        ⏱ {fmt(secondsLeft)}
      </div>

      {/* Right: badges + submit */}
      <div className="flex items-center gap-2">
        {[
          { icon: "👁", count: tabCount,  warn: tabCount > 0,  tip: "Tab switches" },
          { icon: "📷", count: faceCount, warn: faceCount > 0, tip: "Face alerts"  },
          { icon: "🎙", count: micCount,  warn: micCount > 0,  tip: "Noise alerts" },
        ].map(({ icon, count, warn, tip }) => (
          <span key={tip} title={tip}
            className={`text-xs font-bold px-2.5 py-1 rounded-lg select-none ${
              warn ? "bg-amber-500/20 text-amber-400" : "bg-[#21262d] text-[#8b949e]"
            }`}>
            {icon} {count}
          </span>
        ))}

        <button
          onClick={onSubmit}
          className="ml-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ProctoringBar;
