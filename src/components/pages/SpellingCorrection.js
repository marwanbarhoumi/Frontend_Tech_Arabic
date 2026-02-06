import React, { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const arabicKeys = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"]
];

const SpellingCorrection = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [exerciseSentence, setExerciseSentence] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSentence, setShowSentence] = useState(true);
  const [currentExerciseId, setCurrentExerciseId] = useState(null);
  const [audioTime, setAudioTime] = useState(0);

  const audioRef = useRef(null);
  const hideSentenceTimeout = useRef(null);

  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  // ======================
  // Get new sentence
  // ======================
  const generateSentence = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/spelling/exercise/${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (!data.success) return alert("❌ لا توجد جمل");

      setExerciseSentence(data.exercise.correctSentence);
      setCurrentExerciseId(data.exercise.id);
      setText("");
      setResult(null);
      setShowSentence(true);
      setAudioTime(0);
    } catch {
      alert("❌ خطأ في جلب الجملة");
    }
  };

  // ======================
  // Hide sentence timer
  // ======================
  const hideSentenceAfterDelay = () => {
    let delay = level <= 2 ? 5000 : level === 3 ? 8000 : 18000;
    hideSentenceTimeout.current = setTimeout(() => {
      setShowSentence(false);
    }, delay);
  };

  // ======================
  // Browser TTS fallback
  // ======================
  const handleBrowserFallback = () => {
    if (!("speechSynthesis" in window)) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(exerciseSentence);
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;

    utterance.onstart = hideSentenceAfterDelay;
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // ======================
  // Speak sentence
  // ======================
  const speakSentence = async () => {
    if (!exerciseSentence) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/spelling/generate-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ text: exerciseSentence })
        }
      );

      if (!response.ok) {
        handleBrowserFallback();
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) audioRef.current.pause();

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsSpeaking(false);

      audioRef.current.play();
      hideSentenceAfterDelay();

    } catch {
      handleBrowserFallback();
    }
  };

  // ======================
  // Stop audio
  // ======================
  const handleStop = () => {
    setIsSpeaking(false);

    if (audioRef.current) {
      setAudioTime(audioRef.current.currentTime);
      audioRef.current.pause();
    }

    window.speechSynthesis?.cancel();

    clearTimeout(hideSentenceTimeout.current);
    setShowSentence(true);
  };

  // ======================
  // Resume audio
  // ======================
  const handlePlayResume = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioTime;
      audioRef.current.play();
      setIsSpeaking(true);
    } else {
      speakSentence();
    }
  };

  // ======================
  // Correct spelling
  // ======================
  const handleCorrect = async () => {
    if (!exerciseSentence) return alert("اختر جملة أولاً");
    if (!text.trim()) return alert("اكتب الجملة");

    if (text.trim() === exerciseSentence.trim()) {
      setResult({
        score: 100,
        feedback: "ممتاز! 👏",
        originalText: text,
        correctedText: exerciseSentence,
        mistakes: []
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/spelling/correct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ text, exerciseId: currentExerciseId })
        }
      );

      const data = await res.json();
      if (data.success) setResult(data);
      else alert("❌ خطأ في التصحيح");

    } catch {
      alert("❌ تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spelling-page">
      <Navbar />

      <div className="spelling-container">
        <h1 className="spelling-title">✍️ تصحيح الإملاء الآلي</h1>

        <button className="new-text-btn" onClick={generateSentence}>
          🎯 عرض جملة جديدة
        </button>

        {exerciseSentence && (
          <div className="exercise-box">
            {showSentence ? (
              <p className="exercise-sentence">{exerciseSentence}</p>
            ) : (
              <p className="exercise-sentence-hidden">
                🎧 اكتب الجملة من الذاكرة
              </p>
            )}

            <div className="speak-buttons">
              <button
                className="speak-btn"
                onClick={speakSentence}
                disabled={isSpeaking}
              >
                {isSpeaking ? "🔊 جاري القراءة..." : "استمع 🎧▶️"}
              </button>

              <button
                className={`stop-btn ${isSpeaking ? "active" : ""}`}
                onClick={handleStop}
              >
                ⏹️ إيقاف
              </button>

              <button
                className="play-resume-btn"
                onClick={handlePlayResume}
                disabled={isSpeaking}
              >
                ▶️ استكمال
              </button>
            </div>
          </div>
        )}

        <textarea
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="6"
        />

        <button className="correct-btn" onClick={handleCorrect} disabled={loading}>
          {loading ? "جاري التصحيح..." : "📝 صحح الإملاء"}
        </button>

        {result && (
          <div className="result-section">
            <h3>{result.feedback}</h3>
            <p>النتيجة: {result.score}%</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SpellingCorrection;
