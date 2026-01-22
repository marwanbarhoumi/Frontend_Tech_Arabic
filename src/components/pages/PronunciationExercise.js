import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/PronunciationExercise.css";

export default function PronunciationExercise() {
  /* =======================
     LEVEL
  ======================= */
  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  /* =======================
     STATES
  ======================= */
  const [sentence, setSentence] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  /* =======================
     INIT SENTENCE (mock)
  ======================= */
  useEffect(() => {
    const sentencesByLevel = {
      1: "أنا أحب بيتي.",
      2: "أنا أحب بيتي لأنه مريح.",
      3: "أنا أحب بيتي لأنه مريح ونظيف.",
      4: "أنا أحب بيتي لأنه مريح ونظيف وفيه حديقة.",
      5: "أنا أحب بيتي لأنه مريح ونظيف وفيه حديقة جميلة.",
      6: "أنا أحب بيتي لأنه مريح ونظيف وفيه حديقة جميلة تطل على البحر."
    };

    setSentence(sentencesByLevel[level]);
  }, [level]);

  /* =======================
     TIMER
  ======================= */
  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  /* =======================
     LISTEN (TTS placeholder)
  ======================= */
  const handleListen = () => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "ar-SA";
    speechSynthesis.speak(utterance);
  };

  /* =======================
     RECORD
  ======================= */
  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    startTimer();
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* =======================
     CONFIRM (mock result)
  ======================= */
  const handleConfirm = () => {
    if (!audioBlob) {
      alert("يرجى التسجيل أولاً 🎤");
      return;
    }

    stopTimer();

    // MOCK RESULT (backend later)
    setResult({
      score: 78,
      feedback: "أحسنت 👍 حاول تحسين نطق بعض الكلمات",
      mistakes: 3
    });

    setShowResult(true);
  };

  /* =======================
     UI
  ======================= */
  return (
    <div id="exercise-page">
      {/* Header */}
      <div className="exercise-header">
        <span className="badge">المستوى {level} : النطق</span>
        <h2>استمع ثم تكلّم</h2>
      </div>

<div className="exercise-grid">
  {/* Side panel */}
  <div className="exercise-side">
    <div className="side-box green">
      <p>الوقت المنقضي</p>
      <h3>{formatTime(seconds)}</h3>
    </div>

    <div className="side-box orange">
      <p>عدد الأخطاء</p>
      <h3>{result ? result.mistakes : "--"}</h3>
    </div>
  </div>

  {/* MAIN CARD */}
  <div className="exercise-card main">
    {/* Sentence */}
    <p className="sentence-text">{sentence}</p>

    {/* Controls */}
    <div className="icons">
      <button className="icon play" onClick={handleListen}>
        🔊
      </button>

      {!recording ? (
        <button className="icon mic" onClick={handleStartRecording}>
          🎤
        </button>
      ) : (
        <button className="icon mute" onClick={handleStopRecording}>
          ⏹
        </button>
      )}
    </div>

    {/* Feedback */}
    <div className="feedback">
      {recording
        ? "تحدث الآن..."
        : audioBlob
        ? "تم التسجيل ✅"
        : "اضغط على الميكروفون"}
    </div>
  </div>

  {/* RESULT */}
  {showResult && (
    <div className="exercise-card result">
      <h3>النتيجة</h3>
      <p>{result.feedback}</p>
      <strong>{result.score}%</strong>
    </div>
  )}
</div>

      <button className="confirm-btn" onClick={handleConfirm}>
        تأكد
      </button>
    </div>
  );
}
