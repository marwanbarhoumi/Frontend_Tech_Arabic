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
  const generateExercise = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/api/pronunciation/exercise/${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (data.sentence) {
        setExercise({ correctSentence: data.sentence });
        setResult(null);
        setAudioBlob(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateExercise();
    // eslint-disable-next-line
  }, [level]);

  /* ==============================
     SPEAK
  ============================== */
  const speakSentence = async () => {
    if (!exercise) return;

    setIsSpeaking(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/api/pronunciation/generate-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: exercise.correctSentence }),
        }
      );

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.play();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  /* ==============================
     RECORD
  ============================== */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current.stop();
    setRecording(false);
  };

  /* ==============================
     SUBMIT
  ============================== */
  const submitPronunciation = async () => {
    if (!audioBlob) return alert("🎤 سجّل صوتك أولاً");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("audio", audioBlob);
      form.append("originalText", exercise.correctSentence);

      const res = await fetch(`${API}/api/pronunciation/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (data.score !== undefined) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="spelling-page">
      <Navbar />

      <div className="spelling-container">
        <h1 className="spelling-title">🎤 تمارين النطق</h1>

        <button className="new-text-btn" onClick={generateExercise}>
          🔁 تمرين جديد
        </button>

        {exercise && (
          <div className="correction-section">
            <div className="exercise-box">
              <p className="exercise-sentence">
                {exercise.correctSentence}
              </p>
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
                {loading ? "جاري التصحيح..." : "✅ تأكيد النطق"}
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
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PronunciationExercise;
