import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SpellingCorrection.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const arabicKeys = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"]
];

const sentences = [
  { id: 1, text: "اللغة العربية جميلة." },
  { id: 2, text: "بَيْنَمَا كُنْتُ أَمْشِي شَاهَدْتُ رَجُلًا كَبِيرًا يُرِيدُ أَنْ يَقْطَعَ الطَّرِيقَ، وَلَكِنَّهُ لَا يَسْتَطِيعُ، فَتَقَدَّمْتُ نَحْوَهُ وَأَمْسَكْتُ بِيَدِِهِ وَسَاعَدْتُهُ فِي الْعُبُورِ.." },
  { id: 3, text: "ذهب الطالب إلى المدرسة مبكراً." },
  { id: 4, text: "الشمس تشرق كل صباح." },
  { id: 5, text: "المعرفة هي مفتاح النجاح." }
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

  const navigate = useNavigate();

  const generateSentence = () => {
    const random = sentences[Math.floor(Math.random() * sentences.length)];
    setExerciseSentence(random.text);
    setCurrentExerciseId(random.id);
    setText("");
    setResult(null);
    setShowSentence(true);
  };

  const hideSentenceAfterDelay = () => {
    setTimeout(() => {
      setShowSentence(false);
    }, 10000);
  };

  const handleBrowserFallback = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(exerciseSentence);
      utterance.lang = "ar-SA";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onstart = () => hideSentenceAfterDelay();
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("❌ المتصفح لا يدعم خاصية القراءة الصوتية");
      setIsSpeaking(false);
    }
  };

  const speakSentence = async () => {
    if (!exerciseSentence) {
      alert("⚠️ لا توجد جملة للقراءة. اضغط على 'عرض جملة جديدة' أولاً");
      return;
    }

    try {
      setIsSpeaking(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/spelling/generate-speech",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text: exerciseSentence })
        }
      );

      const data = await response.json();

      if (data.success && data.audioUrl.startsWith("data:audio")) {
        playBase64Audio(data.audioUrl);
      } else {
        handleBrowserFallback();
      }

      hideSentenceAfterDelay();

    } catch (error) {
      console.error("❌ خطأ:", error);
      handleBrowserFallback();
    }
  };

  const playBase64Audio = (base64DataUrl) => {
    const audio = new Audio(base64DataUrl);
    audio.play().finally(() => setIsSpeaking(false));
  };

  const handleCorrect = async () => {
    if (!exerciseSentence) {
      alert("اضغط على 'عرض جملة جديدة' لبدء التمرين");
      return;
    }

    if (!text.trim()) {
      alert("⚠️ الرجاء كتابة الجملة أولاً");
      return;
    }

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
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/spelling/correct",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text: text, exerciseId: currentExerciseId })
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({ ...data, mistakes: data.mistakes || [] });
      } else {
        alert("❌ حدث خطأ في التصحيح: " + data.message);
      }
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

  const handleKeyClick = (key) => {
    setText((prev) => prev + key);
  };

  return (
    <div className="spelling-page">
      <Navbar />
      <div className="stars"></div>

      <div className="spelling-container">
        <h1 className="spelling-title">✍️ تصحيح الإملاء الآلي</h1>
        <p className="spelling-subtitle">اكتب الجملة كما هي وستتحصل على النتيجة</p>

        <button className="new-text-btn" onClick={generateSentence}>
          🎯 عرض جملة جديدة
        </button>

        {exerciseSentence && (
          <div className="exercise-box">
            <h3>📝 اكتب الجملة التالية:</h3>

            {showSentence ? (
              <div>
                <p className="exercise-sentence">{exerciseSentence}</p>
                <div className="timer-notice">⏳ الجملة ستختفي بعد 10 ثواني من بدء القراءة</div>
                <div className="speak-buttons">
                  <button className="speak-btn" onClick={speakSentence} disabled={isSpeaking}>
                    {isSpeaking ? "🔊 جاري القراءة..." : "🔊 استمع إلى الجملة"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="exercise-sentence-hidden">🎧 لقد استمعت إلى الجملة، الآن اكتبها من الذاكرة</p>
                <div className="speak-buttons">
                  <button className="speak-btn-secondary" onClick={() => setShowSentence(true)}>👁️ إظهار الجملة مرة أخرى</button>
                  <button className="speak-btn" onClick={speakSentence} disabled={isSpeaking}>
                    {isSpeaking ? "🔊 جاري إعادة القراءة..." : "🔊 أعد الاستماع إلى الجملة"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="correction-section">
          <div className="input-section">
            <label className="input-label">اكتب الجملة هنا:</label>
            <textarea className="text-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب نفس الجملة هنا..." rows="6" />

            <div className="buttons-row">
              <button className="correct-btn" onClick={handleCorrect} disabled={loading}>
                {loading ? "جاري التصحيح..." : "📝 صحح الإملاء"}
              </button>

              <button className="keyboard-btn" onClick={() => setShowKeyboard(!showKeyboard)}>⌨️ لوحة المفاتيح</button>
            </div>

            {showKeyboard && (
              <div className="arabic-keyboard">
                {arabicKeys.map((row, i) => (
                  <div key={i} className="keyboard-row">
                    {row.map((key) => (
                      <button key={key} className="key-btn" onClick={() => handleKeyClick(key)}>{key}</button>
                    ))}
                    {i === arabicKeys.length - 1 && (
                      <button className="key-btn space-btn" onClick={() => handleKeyClick(" ")}>مسافة</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {result && (
            <div className="result-section">
              <div className="score-card">
                <h3>نتيجة التصحيح</h3>
                <div className="score-circle"><span className="score-value">{result.score}%</span></div>
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
                        <span className="mistake-original">{mistake.original}</span>
                        <span className="arrow">→</span>
                        <span className="mistake-corrected">{mistake.corrected}</span>
                        <span className="mistake-type">({mistake.type})</span>
                        <div className="explanation">{mistake.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="new-text-btn" onClick={handleNewText}>✨ نص جديد</button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SpellingCorrection;
