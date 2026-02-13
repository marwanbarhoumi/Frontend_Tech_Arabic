import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API = process.env.REACT_APP_API_URL;

const PronunciationExercise = () => {
  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  const [exercise, setExercise] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const recorderRef = useRef(null);
  const audioRef = useRef(null);

  /* ==============================
     GET EXERCISE
  ============================== */
  const generateSentence = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/pronunciation/exercise/${level}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Exercise error:", res.status, txt);
        return;
      }

      const data = await res.json();

      if (data.success && data.exercise) {
        setExercise(data.exercise);
        setResult(null);
        setAudioBlob(null);
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
  const speakSentence = async () => {
    if (!exercise?.correctSentence) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/pronunciation/generate-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: exercise.correctSentence }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`TTS failed: ${res.status} - ${txt}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      await audio.play();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
      alert("❌ تعذر تشغيل الصوت (TTS)");
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
        body: form,
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
                {isSpeaking ? "🔊 جاري النطق..." : "▶️ استمع"}
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
