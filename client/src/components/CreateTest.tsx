import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

interface HiddenTestCase {
  input: string;
  expectedOutput: string;
}

interface Question {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  marks: number;
  hiddenTestCases: HiddenTestCase[];
}

interface TestMeta {
  title: string;
  numberOfQuestions: number;
  duration: number;
  totalMarks: number;
  instructions: string;
}

const CreateTest: React.FC = () => {
  const [step, setStep] = useState(1);
  const [testId, setTestId] = useState<number | null>(null);
  const [meta, setMeta] = useState<TestMeta>({
    title: "",
    numberOfQuestions: 1,
    duration: 0,
    totalMarks: 0,
    instructions: "",
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      title: "",
      description: "",
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      sampleInput: "",
      sampleOutput: "",
      marks: 0,
      hiddenTestCases: [{ input: "", expectedOutput: "" }],
    },
  ]);

  const navigate = useNavigate(); // ✅ For navigation

  // ✅ Step 1 - Create Test Metadata
  const handleMetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8080/api/tests/create-metadata",
        meta,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTestId(res.data);
      alert("✅ Test metadata created successfully!");
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create test metadata");
    }
  };

  // ✅ Add more hidden test cases
  const addHiddenTestCase = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].hiddenTestCases.push({ input: "", expectedOutput: "" });
    setQuestions(updated);
  };

  // ✅ Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: "",
        description: "",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        sampleInput: "",
        sampleOutput: "",
        marks: 0,
        hiddenTestCases: [{ input: "", expectedOutput: "" }],
      },
    ]);
  };

  // ✅ Step 2 - Submit all questions
  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) {
      alert("Test ID missing. Please create metadata first!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/tests/allocate-questions",
        { testId, questions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Questions allocated successfully!");
      navigate("/teacher/dashboard"); // ✅ Redirect to teacher dashboard
    } catch (err) {
      console.error(err);
      alert("❌ Failed to allocate questions");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Create Test</h1>

          {/* ✅ Back button */}
          <Button
            color="gray"
            type="button" // 👈 important fix
            onClick={() => navigate("/teacher/dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>

        {step === 1 && (
          <motion.form
            onSubmit={handleMetaSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg mb-8 space-y-5 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Step 1 — Test Details
            </h2>

            <Label text="Title" />
            <Input
              name="title"
              required
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            />

            <Label text="Number of Questions" />
            <Input
              type="number"
              name="numberOfQuestions"
              required
              value={meta.numberOfQuestions}
              onChange={(e) =>
                setMeta({ ...meta, numberOfQuestions: Number(e.target.value) })
              }
            />

            <Label text="Duration (in minutes)" />
            <Input
              type="number"
              name="duration"
              required
              value={meta.duration}
              onChange={(e) =>
                setMeta({ ...meta, duration: Number(e.target.value) })
              }
            />

            <Label text="Total Marks" />
            <Input
              type="number"
              name="totalMarks"
              required
              value={meta.totalMarks}
              onChange={(e) =>
                setMeta({ ...meta, totalMarks: Number(e.target.value) })
              }
            />

            <Label text="Instructions" />
            <textarea
              className="w-full border rounded-lg p-2"
              required
              value={meta.instructions}
              onChange={(e) =>
                setMeta({ ...meta, instructions: e.target.value })
              }
            />

            <Button color="blue" type="submit">
              Next → Add Questions
            </Button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            onSubmit={handleQuestionsSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                Step 2 — Add Questions
              </h2>
              <Button color="gray" onClick={() => setStep(1)} type="button">
                ← Back to Test Details
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <h3 className="font-semibold text-gray-700">
                  Question {qIndex + 1}
                </h3>
                <Input
                  placeholder="Title"
                  value={q.title}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].title = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <textarea
                  placeholder="Description"
                  className="w-full border rounded-lg p-2"
                  value={q.description}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].description = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <Input
                  placeholder="Input Format"
                  value={q.inputFormat}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].inputFormat = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <Input
                  placeholder="Output Format"
                  value={q.outputFormat}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].outputFormat = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <Input
                  placeholder="Constraints"
                  value={q.constraints}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].constraints = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <Input
                  placeholder="Sample Input"
                  value={q.sampleInput}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].sampleInput = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <Input
                  placeholder="Sample Output"
                  value={q.sampleOutput}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].sampleOutput = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  value={q.marks}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].marks = Number(e.target.value);
                    setQuestions(updated);
                  }}
                />

                <div>
                  <h4 className="font-medium mb-2">Hidden Test Cases</h4>
                  {q.hiddenTestCases.map((tc, tcIndex) => (
                    <div key={tcIndex} className="flex gap-3 mb-2">
                      <Input
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].hiddenTestCases[tcIndex].input =
                            e.target.value;
                          setQuestions(updated);
                        }}
                      />
                      <Input
                        placeholder="Expected Output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].hiddenTestCases[
                            tcIndex
                          ].expectedOutput = e.target.value;
                          setQuestions(updated);
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    color="gray"
                    type="button"
                    onClick={() => addHiddenTestCase(qIndex)}
                  >
                    + Add Hidden Test Case
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Button color="gray" type="button" onClick={addQuestion}>
                + Add Another Question
              </Button>
              <Button color="green" type="submit">
                Submit Test
              </Button>
            </div>
          </motion.form>
        )}
      </main>
    </div>
  );
};

export default CreateTest;
