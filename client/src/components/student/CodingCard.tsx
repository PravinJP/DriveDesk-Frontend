// client/src/components/student/CodingCard.tsx
// Split-pane: problem statement (left) + Monaco code editor (right).
// Requires: npm install @monaco-editor/react

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { CodingQuestion, Language } from "../../types/test.types";

interface Props {
  question: CodingQuestion;
  index: number;
  code: string;
  language: Language;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: Language) => void;
}

const LANGS: { value: Language; label: string; monaco: string; starter: string }[] = [
  {
    value: "python3", label: "Python 3", monaco: "python",
    starter: "import sys\ninput = sys.stdin.readline\n\n# Write your solution here\n",
  },
  {
    value: "java", label: "Java", monaco: "java",
    starter: "import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n",
  },
  {
    value: "cpp", label: "C++17", monaco: "cpp",
    starter: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write your solution here\n    return 0;\n}\n",
  },
  {
    value: "javascript", label: "JavaScript", monaco: "javascript",
    starter: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n// Write your solution here\n",
  },
];

const CodingCard: React.FC<Props> = ({
  question, index, code, language, onCodeChange, onLanguageChange,
}) => {
  // mobile: toggle between problem / editor panes
  const [mobileTab, setMobileTab] = useState<"problem" | "editor">("problem");
  const [showSample, setShowSample] = useState(true);

  const meta = LANGS.find(l => l.value === language) ?? LANGS[0];

  // Seed starter code on first mount if empty
  useEffect(() => {
    if (!code) onCodeChange(meta.starter);
  }, []); // eslint-disable-line

  const handleLangSwitch = (lang: Language) => {
    onLanguageChange(lang);
    const m = LANGS.find(l => l.value === lang)!;
    // Only replace if user hasn't written anything yet
    if (!code || code === meta.starter) onCodeChange(m.starter);
  };

  return (
    <div
      id={`q_${question.id}`}
      className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden scroll-mt-4"
    >
      {/* ── Card header ── */}
      <div className="flex items-center gap-3 px-6 py-4 bg-[#1c2333] border-b border-[#30363d]">
        <div className="w-8 h-8 bg-violet-500/15 border border-violet-500/25 rounded-lg flex items-center justify-center text-violet-400 font-black text-sm">
          {index + 1}
        </div>
        <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Coding
        </span>
        <span className="text-white font-bold text-sm flex-1 truncate">{question.title}</span>
        <span className="text-xs text-[#484f58] font-semibold shrink-0">{question.marks} marks</span>
      </div>

      {/* ── Mobile tab switcher ── */}
      <div className="flex lg:hidden border-b border-[#30363d]">
        {(["problem", "editor"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
              mobileTab === tab
                ? "text-white border-b-2 border-violet-500 bg-[#1c2333]"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Split layout ── */}
      <div className="flex flex-col lg:flex-row" style={{ height: "560px" }}>

        {/* Problem pane */}
        <div className={`lg:w-1/2 lg:flex lg:flex-col overflow-y-auto p-6 lg:border-r lg:border-[#30363d] space-y-5 ${
          mobileTab === "problem" ? "flex flex-col" : "hidden lg:flex"
        }`}>
          <div>
            <h3 className="text-white font-bold text-base mb-2">{question.title}</h3>
            <p className="text-[#cdd9e5] text-sm leading-relaxed">{question.description}</p>
          </div>

          {question.inputFormat && (
            <div>
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Input Format</h4>
              <p className="text-[#8b949e] text-sm leading-relaxed">{question.inputFormat}</p>
            </div>
          )}
          {question.outputFormat && (
            <div>
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Output Format</h4>
              <p className="text-[#8b949e] text-sm leading-relaxed">{question.outputFormat}</p>
            </div>
          )}
          {question.constraints && (
            <div>
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Constraints</h4>
              <p className="text-[#8b949e] text-sm font-mono">{question.constraints}</p>
            </div>
          )}

          {/* Sample toggle */}
          <button
            onClick={() => setShowSample(v => !v)}
            className="text-left text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {showSample ? "▼" : "▶"} Sample
          </button>

          {showSample && (
            <div className="grid grid-cols-2 gap-3">
              {[["Input", question.sampleInput], ["Output", question.sampleOutput]].map(([lbl, val]) => (
                <div key={lbl}>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">{lbl}</p>
                  <pre className="bg-[#0d1117] border border-[#21262d] rounded-xl p-3 text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {val}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor pane */}
        <div className={`lg:w-1/2 flex flex-col bg-[#0d1117] ${
          mobileTab === "editor" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#21262d]">
            <select
              value={language}
              onChange={e => handleLangSwitch(e.target.value as Language)}
              className="bg-[#21262d] border border-[#30363d] text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div className="flex-1" />
            <button
              onClick={() => onCodeChange(meta.starter)}
              className="text-xs font-bold text-[#484f58] hover:text-[#8b949e] px-2 py-1 rounded hover:bg-[#21262d] transition-all"
            >
              Reset
            </button>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={meta.monaco}
              value={code || meta.starter}
              onChange={v => onCodeChange(v ?? "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap:             { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap:            "on",
                automaticLayout:      true,
                tabSize:              4,
                lineNumbers:         "on",
                renderLineHighlight: "line",
                folding:              false,
                padding:             { top: 8 },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingCard;
