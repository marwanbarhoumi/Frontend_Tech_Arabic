import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API = process.env.REACT_APP_API_URL;

const PronunciationExercise = () => {
  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;
  const [exerciseSentence, setExerciseSentence] = useState("");
  const hideSentenceTimeout = useRef(null);
  const [exercise, setExercise] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSentence, setShowSentence] = useState(true);

  const recorderRef = useRef(null);
  const audioRef = useRef(null);

  /* ==============================
     GET EXERCISE
  ============================== */
  const generateSentence = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/pronunciation/exercise/${level}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Exercise error:", res.status, txt);
        return;
      }

      const data = await res.json();

      if (data.success && data.exercise) {
        setExerciseSentence(data.exercise.correctSentence);
        setExercise(data.exercise);
        setResult(null);
        setAudioBlob(null);
        setShowSentence(true);
      }
    } catch (err) {
      console.error("Generate exercise error:", err);
    }
  };

  useEffect(() => {
    generateSentence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  /* ==============================
     SPEAK (TTS)
  ============================== */

  const hideSentenceAfterDelay = () => {
    let delay = 10000;

    if (level === 1 || level === 2) delay = 5000;
    else if (level === 3) delay = 8000;
    else if ([4, 5, 6].includes(level)) delay = 18000;

    hideSentenceTimeout.current = setTimeout(() => {
      setShowSentence(false);
    }, delay);
  };
  const browserFallback = () => {
    if (!("speechSynthesis" in window)) return;

    const utter = new SpeechSynthesisUtterance(exerciseSentence);
    utter.lang = "ar-SA";
    utter.rate = 0.85;

    utter.onstart = hideSentenceAfterDelay;
    utter.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };
  const speakSentence = async () => {
    if (!exerciseSentence) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/spelling/generate-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: exerciseSentence })
      });

      if (!res.ok) {
        browserFallback();
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.play();

      hideSentenceAfterDelay();
    } catch (err) {
      console.error("TTS error:", err);
      browserFallback();
    }
  };

  /* ==============================
     RECORD
  ============================== */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);

        // stop mic tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("❌ لم نتمكن من تشغيل الميكروفون");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  /* ==============================
     SUBMIT (STT + SCORE)
  ============================== */
  const submitPronunciation = async () => {
    if (!audioBlob) return alert("🎤 سجّل صوتك أولاً");
    if (!exercise?.id) return alert("⚠️ ما ثماش تمرين");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("audio", audioBlob);
      form.append("exerciseId", String(exercise.id));

      const res = await fetch(`${API}/api/pronunciation/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Check error:", res.status, txt);
        alert("❌ فشل التقييم (Check)");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        alert("❌ لم يتم التقييم");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ تعذر الاتصال بالخادم");
    }

    setLoading(false);
  };

  return (
    <div className="spelling-page">
      <Navbar />

      <div className="spelling-container">
        <h1 className="spelling-title">🎤 تمارين النطق</h1>

        <button className="new-text-btn" onClick={generateSentence}>
          🎯 عرض جملة جديدة
        </button>

        {exercise && (
          <div className="correction-section">
            <div className="exercise-box">
              <p className="exercise-sentence">{exercise.correctSentence}</p>
            </div>

            <div className="speak-buttons">
              <button
                className="speak-btn"
                onClick={speakSentence}
                disabled={isSpeaking}
              >
                {isSpeaking ? "🔊 جاري القراءة..." : "استمع 🎧▶️"}
              </button>

              {!recording ? (
                <button className="correct-btn" onClick={startRecording}>
                  🎤 سجّل
                </button>
              ) : (
                <button className="stop-btn" onClick={stopRecording}>
                  ⏹️ إيقاف التسجيل
                </button>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                className="correct-btn"
                onClick={submitPronunciation}
                disabled={loading}
              >
                {loading ? "جاري التقييم..." : "✅ تأكيد النطق"}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="result-section">
            <div className="score-card">
              <h3>نتيجة النطق</h3>

              <div className="score-circle">
                <span className="score-value">{result.score}%</span>
              </div>

              {result.recognizedText && (
                <p className="feedback">
                  📝 النص اللي فهمتو النظام: {result.recognizedText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PronunciationExercise;
