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
  const [audioTime, setAudioTime] = useState(0); // وقت الصوت لتكميل Play / Resume
  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  const audioRef = useRef(null);
  const hideSentenceTimeout = useRef(null); // مؤقت إخفاء الجملة

  const generateSentence = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/spelling/exercise/${level}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.success) {
      setExerciseSentence(data.exercise.correctSentence);
      setCurrentExerciseId(data.exercise.id); // ⭐ هذا هو المفتاح

      setText("");
      setShowSentence(true);
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
    utter.onend = () => setIsSpeaking(false);

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

      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.play();
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
    }
  };

  const handleCorrect = async () => {
    console.log("API URL =", process.env.REACT_APP_API_URL);
    console.log("TEXT =", text);
    console.log("EXERCISE ID =", currentExerciseId);
    if (!exerciseSentence)
      return alert("اضغط على 'عرض جملة جديدة' لبدء التمرين");
    if (!text.trim()) return alert("⚠️ الرجاء كتابة الجملة أولاً");

    if (text.trim() === exerciseSentence.trim()) {
      setResult({
        score: 100,
        feedback: "ممتاز!  👏 الكتابة صحيحة تماماً",
        originalText: text,
        correctedText: exerciseSentence,
        targetSentence: exerciseSentence,
        mistakes: [],
        isPerfect: true
      });
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
          body: JSON.stringify({ text: text, exerciseId: currentExerciseId })
        }
      );
      const data = await response.json();

      if (data.success) setResult({ ...data, mistakes: data.mistakes || [] });
      else alert("❌ حدث خطأ في التصحيح: " + data.message);
    } catch (error) {
      console.error("Correction error:", error);
      alert("❌ تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleNewText = () => {
    setText("");
    setResult(null);
  };

  const handleKeyClick = (key) => setText((prev) => prev + key);
  //console.log("API:", process.env.REACT_APP_API_URL);

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
              </>
            ) : (
              <div>
                <p className="exercise-sentence-hidden">
                  🎧 لقد استمعت إلى الجملة، الآن اكتبها من الذاكرة
                </p>
                <div className="speak-buttons">
                  <button
                    className="speak-btn-secondary"
                    onClick={() => setShowSentence(true)}
                  >
                    👁️ إظهار الجملة مرة أخرى
                  </button>
                  <button
                    className="speak-btn"
                    onClick={speakSentence}
                    disabled={isSpeaking}
                  >
                    {isSpeaking
                      ? "🔊 جاري إعادة القراءة..."
                      : "🔊 أعد الاستماع إلى الجملة"}
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
          </div>
        )}

        <div className="correction-section">
          <label className="input-label">اكتب الجملة هنا:</label>
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="6"
          />
          <div className="buttons-row">
            <button
              className="correct-btn"
              onClick={handleCorrect}
              disabled={loading}
            >
              {loading ? "جاري التصحيح..." : "📝 صحح الإملاء"}
            </button>
            <button
              className="keyboard-btn"
              onClick={() => setShowKeyboard(!showKeyboard)}
            >
              ⌨️ لوحة المفاتيح
            </button>
          </div>
          {showKeyboard && (
            <div className="arabic-keyboard">
              {arabicKeys.map((row, i) => (
                <div key={i} className="keyboard-row">
                  {row.map((key) => (
                    <button
                      key={key}
                      className="key-btn"
                      onClick={() => handleKeyClick(key)}
                    >
                      {key}
                    </button>
                  ))}
                  {i === arabicKeys.length - 1 && (
                    <button
                      className="key-btn space-btn"
                      onClick={() => handleKeyClick(" ")}
                    >
                      مسافة
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {result && (
            <div className="result-section">
              <div className="score-card">
                <h3>نتيجة التصحيح</h3>
                <div className="score-circle">
                  <span className="score-value">{result.score}%</span>
                </div>
                <p className="feedback">{result.feedback}</p>
              </div>

              <div className="comparison">
                <div className="text-box">
                  <h4>📄 النص الأصلي:</h4>
                  <div className="original-text">{result.originalText}</div>
                </div>

                <div className="text-box">
                  <h4>✅ النص المصحح:</h4>
                  <div className="corrected-text">{result.correctedText}</div>
                </div>
              </div>

              {result?.mistakes?.length > 0 && (
                <div className="mistakes-details">
                  <h4>🔍 الأخطاء التي تم تصحيحها:</h4>
                  <div className="mistakes-list">
                    {result.mistakes.map((mistake, index) => (
                      <div key={index} className="mistake-item">
                        <span className="mistake-original">
                          {mistake.original}
                        </span>
                        <span className="arrow">→</span>
                        <span className="mistake-corrected">
                          {mistake.corrected}
                        </span>
                        <span className="mistake-type">({mistake.type})</span>
                        <div className="explanation">{mistake.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="new-text-btn" onClick={handleNewText}>
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
