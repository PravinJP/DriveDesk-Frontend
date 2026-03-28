// client/src/hooks/useProctoringHooks.ts

import { useEffect, useRef, useCallback } from "react";
import { recordViolation } from "../services/testApi";

/* ── 1. TAB SWITCH ─────────────────────────────────────────── */
export function useTabDetection(
  attemptId: number | null,
  onViolation: (count: number) => void
) {
  const countRef = useRef(0);
  useEffect(() => {
    if (!attemptId) return;
    const fire = (detail: string) => {
      countRef.current += 1;
      onViolation(countRef.current);
      recordViolation({ attemptId, violationType: "TAB_SWITCH", details: `${detail}. #${countRef.current}` }).catch(() => {});
    };
    const onBlur = () => fire("Window blur");
    const onVis  = () => { if (document.hidden) fire("Tab hidden"); };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [attemptId, onViolation]);
  return countRef;
}

/* ── 2. FULLSCREEN ──────────────────────────────────────────── */
export function useFullscreen(onExit: () => void) {
  const enter = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  useEffect(() => {
    const h = () => { if (!document.fullscreenElement) onExit(); };
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, [onExit]);
  return { enterFullscreen: enter };
}

/* ── 3. MIC NOISE ───────────────────────────────────────────── */
export function useMicDetection(
  attemptId: number | null,
  onViolation: (count: number) => void,
  threshold = 18
) {
  const countRef  = useRef(0);
  const coolRef   = useRef(false);
  const frameRef  = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    let ctx: AudioContext;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
      streamRef.current = stream;
      ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const vol = (data.reduce((a, b) => a + b, 0) / data.length / 255) * 100;
        if (vol > threshold && !coolRef.current) {
          coolRef.current = true;
          countRef.current += 1;
          onViolation(countRef.current);
          recordViolation({ attemptId, violationType: "MIC_VIOLATION", details: `Noise vol=${vol.toFixed(1)}. #${countRef.current}` }).catch(() => {});
          setTimeout(() => { coolRef.current = false; }, 5000);
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    }).catch(() => {});
    return () => {
      cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      ctx?.close();
    };
  }, [attemptId, onViolation, threshold]);
  return countRef;
}

/* ── 4. FACE DETECTION ──────────────────────────────────────── */
export function useFaceDetection(
  attemptId: number | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  onMultipleFaces: () => void,
  onViolation: (count: number) => void
) {
  const countRef  = useRef(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!attemptId || !videoRef.current) return;
    const init = async () => {
      const faceapi = await import("face-api.js");
      if (!loadedRef.current) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        ]);
        loadedRef.current = true;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      timerRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        const dets = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions());
        if (dets.length === 0) {
          countRef.current += 1; onViolation(countRef.current);
          recordViolation({ attemptId, violationType: "FACE_VIOLATION", details: `No face. #${countRef.current}` }).catch(() => {});
        } else if (dets.length >= 2) {
          recordViolation({ attemptId, violationType: "FACE_VIOLATION", details: `${dets.length} faces — force ended.` }).catch(() => {});
          onMultipleFaces();
        }
      }, 3000);
    };
    init().catch(console.error);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [attemptId, videoRef, onMultipleFaces, onViolation]);
  return countRef;
}
