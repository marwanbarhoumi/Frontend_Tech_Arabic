import React, { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const arabicKeys = [
  ["ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د"],
  ["ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط"],
  ["ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ"],
  ["أ","إ","آ","َ","ً","ُ","ٌ","ِ","ٍ","ْ","ّ"]
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
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // ✅ NEW
  const [showResult, setShowResult] = useState(false);

  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  const audioRef = useRef(null);
  const hideSentenceTimeout = useRef(null);

  const generateSentence = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/spelling/exercise/${level}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    if (data.success) {
      setExerciseSentence(data.exercise.correctSentence);
      setCurrentExerciseId(data.exercise.id);
      setText("");
      setShowSentence(true);
      setResult(null);

      // ✅ RESET
      setShowResult(false);

      setAudioTime(0);
      setHasPlayedOnce(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      window.speechSynthesis?.cancel();

      if (hideSentenceTimeout.current) {
        clearTimeout(hideSentenceTimeout.current);
      }

      setIsSpeaking(false);
    }
  };

  const handleCorrect = async () => {
    if (!exerciseSentence) {
      return alert("اضغط على 'عرض جملة جديدة'");
    }

    if (!text.trim()) {
      return alert("⚠️ اكتب الجملة أولاً");
    }

    // ✅ perfect
    if (text.trim() === exerciseSentence.trim()) {
      setResult({
        score: 100,
        feedback: "ممتاز! 👏 الكتابة صحيحة تماماً",
        originalText: text,
        correctedText: exerciseSentence,
        targetSentence: exerciseSentence,
        mistakes: [],
        isPerfect: true
      });

      setShowResult(true); // ✅
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/spelling/correct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text,
            exerciseId: currentExerciseId
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({ ...data, mistakes: data.mistakes || [] });

        setShowResult(true); // ✅ أهم سطر
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewText = () => {
    setText("");
    setResult(null);
    setShowResult(false); // ✅
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
          </div>
        )}

        <div className="correction-section">
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="6"
            dir="rtl"
          />

          <button
            className="correct-btn"
            onClick={handleCorrect}
            disabled={loading || !text.trim()}
          >
            {loading ? "جاري التصحيح..." : "📝 صحح الإملاء"}
          </button>

          {/* ✅ هنا التعديل */}
          {showResult && result && (
            <div className="result-section">
              <h3>نتيجة التصحيح</h3>
              <div>{result.score}%</div>
              <p>{result.feedback}</p>

              <h4>📄 النص الأصلي:</h4>
              <p>{result.originalText}</p>

              <h4>✅ النص المصحح:</h4>
              <p>{result.correctedText}</p>

              <button onClick={handleNewText}>
                ✨ نص جديد
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SpellingCorrection;