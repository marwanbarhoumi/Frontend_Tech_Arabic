import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("levels");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/signin");
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [navigate]);
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch("http://localhost:5000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // ✅ UTILISER LES DONNÉES RÉELLES DU BACKEND
        setUser(data.user);
        setLevels(data.levels);
        setStats(data.stats);
      } else {
        console.error("Error fetching dashboard:", data.message);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (levelId, lessonName) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/dashboard/complete-lesson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            levelId,
            lessonName
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Recharger les données après avoir complété une leçon
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Start lesson error:", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="error">يجب تسجيل الدخول أولاً</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="stars"></div>

      <div className="dashboard-container">
        {/* Header Utilisateur AVEC DONNÉES RÉELLES */}
        <div className="user-header">
          <div className="user-info">
            <h1>مرحباً، {user.fullName}! 👋</h1> {/* ✅ fullName du backend */}
            <p>استمر في رحلتك لتعلم اللغة العربية</p>
          </div>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-value">{user.level}</span>{" "}
              {/* ✅ level du backend */}
              <span className="stat-label">المستوى</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.points}</span>{" "}
              {/* ✅ points du backend */}
              <span className="stat-label">النقاط</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.overallProgress}%</span>{" "}
              {/* ✅ progress du backend */}
              <span className="stat-label">التقدم</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === "levels" ? "active" : ""}`}
            onClick={() => setActiveTab("levels")}
          >
            📚 المستويات والدروس
          </button>
          <button
            className={`nav-btn ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            🤖 تمارين الذكاء الاصطناعي
          </button>
        </div>

        {/* Contenu des Tabs */}
        <div className="dashboard-content">
          {activeTab === "levels" && (
            <div className="levels-grid">
              {levels.map(
                (
                  level // ✅ levels du backend
                ) => (
                  <div
                    key={level.id}
                    className={`level-card ${
                      level.unlocked ? "unlocked" : "locked"
                    }`}
                  >
                    <div className="level-header">
                      <span className="level-icon">{level.icon}</span>
                      <h3 className="level-title">{level.title}</h3>
                      {!level.unlocked && <span className="lock-icon">🔒</span>}
                    </div>

                    <p className="level-description">{level.description}</p>

                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${level.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{level.progress}%</span>
                    </div>

                    <div className="lessons-list">
                      <h4>الدروس:</h4>
                      {level.lessons.map((lesson, index) => (
                        <div key={index} className="lesson-item">
                          <span
                            className={`lesson-status ${
                              lesson.completed ? "completed" : "pending"
                            }`}
                          >
                            {lesson.completed ? "✅" : "⏳"}
                          </span>
                          <span className="lesson-name">{lesson.name}</span>
                          {level.unlocked && !lesson.completed && (
                            <button
                              className="start-btn"
                              onClick={() => startLesson(level.id, lesson.name)}
                            >
                              ابدأ
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div className="ai-tab">
              <h2>🤖 تمارين الذكاء الاصطناعي</h2>
              <div className="ai-exercises">
                <div className="ai-exercise">
                  <h3>✍️ تصحيح الإملاء الآلي</h3>
                  <p>اكتب جملة وسيقوم الذكاء الاصطناعي بتصحيحها</p>
                  <button
                    className="ai-btn"
                    onClick={() => navigate("/level/spelling")}
                  >
                    جرب الآن
                  </button>
                </div>
                <div className="ai-exercise">
                  <h3>🎤 تمارين النطق</h3>
                  <p>تدرب على النطق الصحيح للحروف والكلمات</p>
                  <button className="ai-btn"
                  onClick={() => navigate("/level/pronunciation")}
                  >ابدأ التمرين</button>
                </div>
                <div className="ai-exercise">
                  <h3>📝 توليد تمارين شخصية</h3>
                  <p>احصل على تمارين مخصصة لمستواك</p>
                  <button className="ai-btn">أنشئ تمارين</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;