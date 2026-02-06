import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/PronunciationExercise.css";

const API = process.env.REACT_APP_API_URL;

export default function PronunciationExercise() {
  const [searchParams] = useSearchParams();
  const level = Number(searchParams.get("level")) || 1;

  const [exercise, setExercise] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);

  const recorderRef = useRef(null);
  const audioRef = useRef(null);

  /* ==========================
     GET EXERCISE
  ========================== */
  const generateExercise = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API}/api/pronunciation/exercise/${level}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.success) {
      setExercise(data.exercise);
      setAudioBlob(null);
      setResult(null);
    }
  };

  useEffect(() => {
    generateExercise();
  }, [level]);

  /* ==========================
     SPEAK (ElevenLabs)
  ========================== */
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
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ text: exercise.correctSentence })
        }
      );

      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch {
      setIsSpeaking(false);
      alert("❌ تعذر تشغيل الصوت");
    }
  };

  /* ==========================
     RECORD AUDIO
  ========================== */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    const chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
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

  /* ==========================
     SUBMIT PRONUNCIATION
  ========================== */
  const submitPronunciation = async () => {
    if (!audioBlob) return alert("🎤 سجّل صوتك أولاً");

    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("audio", audioBlob);
    form.append("exerciseId", exercise.id);

    const res = await fetch(
      `${API}/api/pronunciation/check`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      }
    );

    const data = await res.json();
    if (data.success) setResult(data);
  };

  return (
    <div className="pronunciation-page">
      <h1>🎤 تمارين النطق</h1>

      {exercise && (
        <div className="card">
          <p className="sentence">{exercise.correctSentence}</p>

          <div className="controls">
            <button onClick={speakSentence} disabled={isSpeaking}>
              {isSpeaking ? "🔊 جاري النطق..." : "▶️ استمع"}
            </button>

            {!recording ? (
              <button onClick={startRecording}>🎤 سجّل</button>
            ) : (
              <button onClick={stopRecording}>⏹️ إيقاف</button>
            )}
          </div>

          <button className="confirm-btn" onClick={submitPronunciation}>
            ✅ تأكيد النطق
          </button>
        </div>
      )}

      {result && (
        <div className="result-card">
          <h3>النتيجة</h3>
          <strong>{result.score}%</strong>
          <p>{result.feedback}</p>

          {result.mistakes.length > 0 && (
            <div className="mistakes">
              <h4>🔍 ملاحظات:</h4>
              {result.mistakes.map((m, i) => (
                <div key={i}>
                  <b>{m.word}</b> – {m.tip}
                </div>
              ))}
            </div>
          )}

          <button onClick={generateExercise}>🔁 تمرين جديد</button>
        </div>
      )}
    </div>
  );
}
