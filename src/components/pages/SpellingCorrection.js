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

  // ✅ NEW STATE
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

      // ✅ reset result visibility
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
    utter.onend = () => {
      setIsSpeaking(false);
      setHasPlayedOnce(true);
      setAudioTime(0);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const speakSentence = async () => {
    if (!exerciseSentence) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
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

      if (!res.ok) {
        browserFallback();
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setHasPlayedOnce(true);
        setAudioTime(0);
        URL.revokeObjectURL(url);
      };

      await audio.play();
      hideSentenceAfterDelay();
    } catch {
      browserFallback();
    }
  };

  const handleStop = () => {
    setIsSpeaking(false);

    if (audioRef.current) {
      setAudioTime(audioRef.current.currentTime);
      audioRef.current.pause();
    }

    window.speechSynthesis?.cancel();

    if (hideSentenceTimeout.current) {
      clearTimeout(hideSentenceTimeout.current);
      setShowSentence(true);
    }
  };

  const handlePlayResume = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioTime;
      audioRef.current.play();
      setIsSpeaking(true);
      setHasPlayedOnce(true);
    }
  };

  const handleCorrect = async () => {
    if (!exerciseSentence) {
      return alert("اضغط على 'عرض جملة جديدة'");
    }

    if (!text.trim()) {
      return alert("⚠️ الرجاء كتابة الجملة أولاً");
    }

    // ✅ perfect case
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

      setShowResult(true);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!currentExerciseId) {
        return alert("⚠️ لم يتم تحميل التمرين بعد");
      }

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
        setShowResult(true); // ✅ SHOW RESULT ONLY AFTER CLICK
      } else {
        alert("❌ حدث خطأ: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const handleNewText = () => {
    setText("");
    setResult(null);
    setShowResult(false);
  };

  const handleKeyClick = (key) => {
    setText((prev) => prev + key);
  };

  const handleBackspace = () => {
    setText((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setText("");
  };

  const handleSpace = () => {
    setText((prev) => prev + " ");
  };

  const handleNewLine = () => {
    setText((prev) => prev + "\n");
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
              <>
                <p className="exercise-sentence">{exerciseSentence}</p>

                <div className="timer-notice">
                  ⏳ الجملة ستختفي بعد{" "}
                  {level === 1 || level === 2 ? 5 : level === 3 ? 8 : 18} ثانية
                </div>

                <div className="speak-buttons">
                  <button onClick={speakSentence} disabled={isSpeaking}>
                    {isSpeaking ? "🔊 جاري القراءة..." : "استمع 🎧"}
                  </button>

                  <button onClick={handleStop}>⏹️ إيقاف</button>

                  <button
                    onClick={handlePlayResume}
                    disabled={isSpeaking || !audioRef.current}
                  >
                    ▶️ استكمال
                  </button>
                </div>
              </>
            ) : (
              <p>🎧 اكتب الجملة من الذاكرة</p>
            )}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="6"
          dir="rtl"
        />

        <button onClick={handleCorrect} disabled={loading || !text.trim()}>
          {loading ? "..." : "📝 صحح الإملاء"}
        </button>

        {/* ✅ CONTROL RESULT */}
        {showResult && result && (
          <div className="result-section">
            <h3>نتيجة التصحيح</h3>
            <div>{result.score}%</div>
            <p>{result.feedback}</p>

            <h4>📄 النص الأصلي:</h4>
            <p>{result.originalText}</p>

            <h4>✅ النص المصحح:</h4>
            <p>{result.correctedText}</p>

            <button onClick={handleNewText}>✨ نص جديد</button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SpellingCorrection;