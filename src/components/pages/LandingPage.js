import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/LandingPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";


export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const starsContainer = document.querySelector(".stars");
    if (starsContainer) {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
      }
    }
  }, []);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <Navbar />

      {/* خلفية النجوم */}
      <div className="stars"></div>

      {/* المحتوى الرئيسي */}
      <div className="hero-content">
        <h1 className="main-title">مدرسة اللغة العربية بالذكاء الاصطناعي</h1>
        <p className="subtitle">
          تعلّم العربية بطريقة تفاعلية مع تمارين مدعومة بالذكاء الاصطناعي ✨
        </p>
        <button className="main-btn" onClick={() => navigate("/SignIn")}>
          ابدأ التعلّم الآن 🚀
        </button>

        {/* شبكة الدروس */}
        <div className="lessons-grid">
          <div className="lesson-card" onClick={() => navigate("/ai-lessons")}>
            <span className="lesson-icon">🤖</span>
            <h3 className="lesson-title">دروس الذكاء الاصطناعي</h3>
            <p className="lesson-desc">
              أحدث تقنيات الذكاء الاصطناعي في التعليم
            </p>
          </div>

          <div
            className="lesson-card"
            onClick={() => navigate("/grammar-lessons")}
          >
            <span className="lesson-icon">📚</span>
            <h3 className="lesson-title">دروس النحو والصرف</h3>
            <p className="lesson-desc">إتقان قواعد اللغة العربية</p>
          </div>

          <div
            className="lesson-card"
            onClick={() => navigate("/quran-lessons")}
          >
            <span className="lesson-icon">📖</span>
            <h3 className="lesson-title">دروس القرآن الكريم</h3>
            <p className="lesson-desc">تعلم التجويد وعلوم القرآن</p>
          </div>
        </div>
      </div>

      {/* قسم المميزات الأول */}
      <section className="features-section">
        <div className="features-content">
          <div className="text-side">
            <h2>تعلم بسهولة وشارك إنجازاتك 📱</h2>
            <p>
              مارس اللغة بطريقة ممتعة وسلسة مع تمارين تفاعلية وذكاء اصطناعي
              يساعدك على التقدم خطوة بخطوة.
            </p>
            <ul className="features-list">
              <li>تقدم تلقائي حسب مستواك</li>
              <li>تمارين نطق وتصحيح فوري</li>
              <li>حفظ الكلمات وتتبع التطور</li>
              <li>مشاركة التقدم مع أصدقائك</li>
            </ul>
          </div>
          <div className="image-side">
            <img
              src="https://i.ibb.co/KF7zJhg/phone.png"
              alt="app-preview"
              className="phone-img"
            />
          </div>
        </div>
      </section>

      {/* قسم المميزات الثاني */}
      <section className="features-section">
        <div className="features-content">
          <div className="image-side">
            <img
              src="https://i.ibb.co/2jv61wW/phone2.png"
              alt="mobile-preview"
              className="phone-img"
            />
          </div>
          <div className="text-side">
            <h2>تعلم العربية بذكاء وسهولة 📱</h2>
            <p>
              نظام تعليمي حديث مصمّم خصيصًا لتطوير مستواك في اللغة العربية مع
              متابعة ذكية وتفاعل مباشر.
            </p>
            <ul className="features-list">
              <li>تمارين تفاعلية مدعّمة بالذكاء الاصطناعي 🤖</li>
              <li>محتوى مناسب لكل الأعمار والمستويات</li>
              <li>واجهات بسيطة وتجربة ممتعة</li>
              <li>تعلّم من أي مكان وفي أي وقت 🌍</li>
            </ul>
          </div>
        </div>
      </section>

      {/* قسم المميزات الثالث */}
      <section className="features-section reverse">
        <div className="features-content">
          <div className="image-side">
            <img
              src="https://i.ibb.co/2jv61wW/phone2.png"
              alt="app-preview"
              className="phone-img"
            />
          </div>
          <div className="text-side">
            <h2>تعلّم وتقدّم بثقة 🚀</h2>
            <p>
              الذكاء الاصطناعي يصاحبك في كل خطوة ليضمن لك تجربة تعليمية فعّالة،
              ممتعة ومناسبة تمامًا لأسلوبك.
            </p>
            <ul className="features-list">
              <li>تحليل مستوى تلقائي</li>
              <li>نظام نقاط وتشجيع دائم 🎯</li>
              <li>تمارين متعددة الأنماط</li>
              <li>واجهة سهلة وبسيطة</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
