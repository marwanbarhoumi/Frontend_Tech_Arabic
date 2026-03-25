import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API = process.env.REACT_APP_API_URL;

const arabicFont = {
  fontFamily: '"Noto Naskh Arabic", "Traditional Arabic", Arial, sans-serif'
};

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
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  const recorderRef = useRef(null);
  const audioRef = useRef(null);
  const hideSentenceTimeout = useRef(null);

  const clearTimer = () => {
    if (hideSentenceTimeout.current) {
      clearTimeout(hideSentenceTimeout.current);
      hideSentenceTimeout.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  const generateSentence = async () => {
    try {
      clearTimer();
      setShowSentence(true);
      setRecording(false);
      setAudioBlob(null);
      setResult(null);
      setHasPlayedOnce(false);

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

  const speakSentence = async () => {
    if (!exercise?.correctSentence) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      window.speechSynthesis?.cancel();

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
        setHasPlayedOnce(true);
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

        utter.onend = () => {
          setIsSpeaking(false);
          setHasPlayedOnce(true);
        };

        window.speechSynthesis.speak(utter);
      }
    }
  };

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

  return (
    <div className="spelling-page" style={arabicFont}>
      <Navbar />

      <div className="spelling-container" style={arabicFont}>
        <h1 className="spelling-title" style={arabicFont}>🎤 تمارين النطق</h1>

        <button className="new-text-btn" onClick={generateSentence} style={arabicFont}>
          🎯 عرض جملة جديدة
        </button>

        {exercise && !result && (
          <div className="correction-section" style={arabicFont}>
            <div className="exercise-box">
              {showSentence ? (
                <p className="exercise-sentence" style={arabicFont}>
                  {exercise.correctSentence}
                </p>
              ) : (
                <p className="exercise-sentence-hidden" style={arabicFont}>
                  🎧 استمعت للجملة، سجّل صوتك الآن
                </p>
              )}
            </div>

            <div className="speak-buttons">
              <button
                className="speak-btn"
                onClick={speakSentence}
                disabled={isSpeaking}
                style={arabicFont}
              >
                {isSpeaking
                  ? "🔊 جاري القراءة..."
                  : hasPlayedOnce
                  ? "إعادة الاستماع 🔁"
                  : "استمع 🎧▶️"}
              </button>

              {!recording ? (
                <button className="correct-btn" onClick={startRecording} style={arabicFont}>
                  🎤 سجّل
                </button>
              ) : (
                <button className="stop-btn" onClick={stopRecording} style={arabicFont}>
                  ⏹️ إيقاف التسجيل
                </button>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                className="correct-btn"
                onClick={submitPronunciation}
                disabled={loading}
                style={arabicFont}
              >
                {loading ? "جاري التقييم..." : "✅ تأكيد النطق"}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="result-section" style={arabicFont}>
            <div className="score-card">
              <h3 style={arabicFont}>نتيجة النطق</h3>

              <div className="score-circle">
                <span className="score-value">{result.score}%</span>
              </div>

              <p className="feedback" style={arabicFont}>{result.feedback}</p>
            </div>

            <div className="comparison">
              <div className="text-box">
                <h4 style={arabicFont}>📄 النص الأصلي:</h4>
                <div className="original-text" style={arabicFont}>
                  {result.targetSentence || exercise?.correctSentence}
                </div>
              </div>

              <div className="text-box">
                <h4 style={arabicFont}>📝 النص المفهوم:</h4>
                <div className="corrected-text" style={arabicFont}>
                  {result.recognizedText || "—"}
                </div>
              </div>
            </div>

            {result?.mistakes?.length > 0 && (
              <div className="mistakes-details" style={arabicFont}>
                <h4 style={arabicFont}>🔍 كلمات تحتاج تحسين:</h4>

                <div className="mistakes-list">
                  {result.mistakes.map((m, index) => (
                    <div key={index} className="mistake-item" style={arabicFont}>
                      <span className="mistake-original" style={arabicFont}>{m.word}</span>
                      <span className="arrow" style={arabicFont}>→</span>
                      <span className="mistake-corrected" style={arabicFont}>{m.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="new-text-btn" onClick={generateSentence} style={arabicFont}>
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