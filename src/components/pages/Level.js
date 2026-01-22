import { useNavigate, useParams } from "react-router-dom";
import "../styles/Level.css";

function Level() {
  const navigate = useNavigate();
  const { type } = useParams(); // spelling | pronunciation

  const levelDescriptions = {
    1: "جمل قصيرة وسهلة للمبتدئين",
    2: "جمل بسيطة مع مفردات شائعة",
    3: "جمل متوسطة مع بعض التحدي",
    4: "جمل أطول وأخطاء متنوعة",
    5: "جمل متقدمة تتطلب دقة عالية",
    6: "جمل معقدة للمستوى المتقدم"
  };

  const levelIcons = {
    1: "🟢",
    2: "🟡",
    3: "🔵",
    4: "🟠",
    5: "🔴",
    6: "👑"
  };

  const handleNavigate = (lvl) => {
    if (type === "spelling") {
      navigate(`/spelling-correction?level=${lvl}`);
    }

    if (type === "pronunciation") {
      navigate(`/pronunciation/exercise?level=${lvl}`);
    }
  };

  return (
    <div id="levels-page">
      <h1 className="title">اختر المستوى</h1>
      <p className="subtitle">اختَر المستوى المناسب لك</p>

      <div className="levels-list">
        {[1, 2, 3, 4, 5, 6].map((lvl) => (
          <div className="level-card" key={lvl}>
            <span className="badge">Level {lvl}</span>

            <div className="level-icon">
              {levelIcons[lvl]}
            </div>

            <h2>المستوى {lvl}</h2>

            <p className="level-desc">
              {levelDescriptions[lvl]}
            </p>

            <button onClick={() => handleNavigate(lvl)}>
              ابدأ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Level;
