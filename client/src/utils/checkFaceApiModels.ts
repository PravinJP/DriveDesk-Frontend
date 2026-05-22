// client/src/utils/checkFaceApiModels.ts
// Run this once in browser console to verify all model files are accessible.
// Usage: import { checkFaceApiModels } from '../utils/checkFaceApiModels'; checkFaceApiModels();

export async function checkFaceApiModels(): Promise<void> {
  const REQUIRED_FILES = [
    "/models/tiny_face_detector_model-weights_manifest.json",
    "/models/tiny_face_detector_model-shard1",
    "/models/face_landmark_68_tiny_model-weights_manifest.json",
    "/models/face_landmark_68_tiny_model-shard1",
  ];

  console.log("=== face-api.js Model Check ===");
  let allOk = true;

  for (const file of REQUIRED_FILES) {
    try {
      const res = await fetch(file, { method: "HEAD" });
      if (res.ok) {
        console.log(`✅ ${file} — OK (${res.status})`);
      } else {
        console.error(`❌ ${file} — MISSING (${res.status})`);
        allOk = false;
      }
    } catch (e) {
      console.error(`❌ ${file} — ERROR: ${e}`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log("✅ All model files present! Face detection should work.");
  } else {
    console.error(
      "❌ Some model files are missing!\n" +
      "Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights\n" +
      "Place all files inside: client/public/models/"
    );
  }
  console.log("==============================");
}
