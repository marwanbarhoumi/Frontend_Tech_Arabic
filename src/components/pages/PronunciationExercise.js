import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./styles/SpellingCorrection.css";
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
  const [showSentence, setShowSentence] = useState(true);

  const recorderRef = useRef(null);
  const audioRef = useRef(null);
  const hideSentenceTimeout = useRef(null);

  /* ============================
     CLEANUP
  ============================ */
  const clearTimer = () => {
    if (hideSentenceTimeout.current) {
      clearTimeout(hideSentenceTimeout.current);
      hideSentenceTimeout.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* ============================
     GET EXERCISE
  ============================ */
  const generateSentence = async () => {
    try {
      clearTimer();
      setShowSentence(true);
      setRecording(false);
      setAudioBlob(null);
      setResult(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      window.speechSynthesis?.cancel();

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/pronunciation/exercise/${level}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success) {
        setExercise(data.exercise);
      }
    } catch (err) {
      console.error("Exercise error:", err);
    }
  };

  useEffect(() => {
    generateSentence();
    // eslint-disable-next-line
  }, [level]);

  /* ============================
     HIDE SENTENCE TIMER
  ============================ */
  const hideSentenceAfterDelay = () => {
    clearTimer();

    let delay = 10000;
    if (level <= 2) delay = 5000;
    else if (level === 3) delay = 8000;
    else delay = 18000;

    hideSentenceTimeout.current = setTimeout(() => {
      setShowSentence(false);
    }, delay);
  };

  /* ============================
     TTS
  ============================ */
  const speakSentence = async () => {
    if (!exercise?.correctSentence) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const res = await fetch(`${API}/api/pronunciation/generate-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: exercise.correctSentence })
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
      hideSentenceAfterDelay();
    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);

      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(exercise.correctSentence);
        utter.lang = "ar-SA";
        utter.rate = 0.85;
        utter.onstart = hideSentenceAfterDelay;
        utter.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      }
    }
  };

  /* ============================
     RECORD
  ============================ */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("❌ فشل تشغيل الميكروفون");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  /* ============================
     SUBMIT
  ============================ */
  const submitPronunciation = async () => {
    if (!audioBlob) return alert("🎤 سجّل صوتك أولاً");
    if (!exercise?.id) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("audio", audioBlob);
      form.append("exerciseId", exercise.id);

      const res = await fetch(`${API}/api/pronunciation/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }

    setLoading(false);
  };

  /* ============================
     UI
  ============================ */
  return (
    <div className="spelling-page">
      <Navbar />

      <div className="spelling-container">
        <h1 className="spelling-title">🎤 تمارين النطق</h1>

        <button className="new-text-btn" onClick={generateSentence}>
          🎯 عرض جملة جديدة
        </button>

        {/* تظهر فقط قبل عرض النتيجة */}
        {exercise && !result && (
          <div className="correction-section">
            <div className="exercise-box">
              {showSentence ? (
                <p className="exercise-sentence">
                  {exercise.correctSentence}
                </p>
              ) : (
                <p className="exercise-sentence-hidden">
                  🎧 استمعت للجملة، سجّل صوتك الآن
                </p>
              )}
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

            <div style={{ textAlign: "center", marginTop: 20 }}>
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

        {/* تظهر بعد تأكيد النطق فقط */}
        {result && (
          <div className="result-section">
            <div className="score-card">
              <h3>نتيجة النطق</h3>

              <div className="score-circle">
                <span className="score-value">{result.score}%</span>
              </div>

              <p className="feedback">{result.feedback}</p>
            </div>

            <div className="comparison">
              <div className="text-box">
                <h4>📄 النص الأصلي:</h4>
                <div className="original-text">
                  {result.targetSentence || exercise?.correctSentence}
                </div>
              </div>

              <div className="text-box">
                <h4>📝 النص المفهوم:</h4>
                <div className="corrected-text">
                  {result.recognizedText || "—"}
                </div>
              </div>
            </div>

            {result?.mistakes?.length > 0 && (
              <div className="mistakes-details">
                <h4>🔍 كلمات تحتاج تحسين:</h4>

                <div className="mistakes-list">
                  {result.mistakes.map((m, index) => (
                    <div key={index} className="mistake-item">
                      <span className="mistake-original">{m.word}</span>
                      <span className="arrow">→</span>
                      <span className="mistake-corrected">{m.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="new-text-btn" onClick={generateSentence}>
              ✨ تمرين جديد
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PronunciationExercise;