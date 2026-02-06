import React, { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SpellingCorrection = () => {
  const [exerciseSentence, setExerciseSentence] = useState("");
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSentence, setShowSentence] = useState(true);

  const audioRef = useRef(null);
  const hideTimeout = useRef(null);

  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  const generateSentence = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/spelling/exercise/${level}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.success) {
      setExerciseSentence(data.exercise.correctSentence);
      setText("");
      setShowSentence(true);
    }
  };

  const hideSentenceAfterDelay = () => {
    const delay = level <= 2 ? 5000 : level === 3 ? 8000 : 18000;
    hideTimeout.current = setTimeout(() => setShowSentence(false), delay);
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

  const stopAudio = () => {
    setIsSpeaking(false);
    audioRef.current?.pause();
    window.speechSynthesis.cancel();
    clearTimeout(hideTimeout.current);
    setShowSentence(true);
  };

  return (
    <div className="spelling-page">
      <Navbar />
      <div className="spelling-container">
        <h1>✍️ تصحيح الإملاء</h1>

        <button onClick={generateSentence}>🎯 جملة جديدة</button>

        {exerciseSentence && (
          <div className="exercise-box">
            {showSentence ? (
              <p>{exerciseSentence}</p>
            ) : (
              <p>🎧 اكتب الجملة من الذاكرة</p>
            )}

            <button onClick={speakSentence} disabled={isSpeaking}>
              🔊 استمع
            </button>
            <button onClick={stopAudio}>⏹️ إيقاف</button>
          </div>
        )}

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows="5"
          placeholder="اكتب الجملة هنا..."
        />

      </div>
      <Footer />
    </div>
  );
};

export default SpellingCorrection;
