import "../styles/LandingPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    const starsContainer = document.querySelector(".stars");
    if (starsContainer && starsContainer.children.length === 0) {
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
      <Navbar />
      <div className="stars"></div>

      <div className="hero-content">
        <h1 className="main-title">عن مدرسة اللغة العربية بالذكاء الاصطناعي</h1>
        <p className="subtitle">
          رؤيتنا هي دمج التقنيات الحديثة بالذكاء الاصطناعي لتسهيل تعلم اللغة
          العربية وجعلها تجربة ممتعة وتفاعلية لكل الأعمار 🌍.
        </p>
      </div>

      {/* القسم الأول: من نحن */}
      <section className="features-section">
        <div className="features-content">
          <div className="text-side">
            <h2>من نحن؟ 👋</h2>
            <p>
              نحن فريق من المتخصصين في اللغة العربية وتقنيات الذكاء الاصطناعي،
              هدفنا تطوير منصة تعليمية متكاملة تعتمد على تقنيات التعلم الآلي
              والتفاعل الذكي لمساعدة المتعلمين على اكتساب اللغة بشكل طبيعي وسهل.
            </p>
            <ul className="features-list">
              <li>نربط بين اللغة والثقافة بفهم عصري</li>
              <li>نستخدم الذكاء الاصطناعي لتخصيص تجربة التعلم</li>
              <li>نقدّم محتوى تفاعلي يناسب جميع المستويات</li>
              <li>نؤمن أن العربية لغة المستقبل ✨</li>
            </ul>
          </div>
          <div className="image-side">
            <img
              src="https://i.ibb.co/Yb1ZcDq/about-ai.png"
              alt="About School"
              className="phone-img"
            />
          </div>
        </div>
      </section>

      {/* القسم الثاني: رؤيتنا */}
      <section className="features-section reverse">
        <div className="features-content">
          <div className="image-side">
            <img
              src="https://i.ibb.co/z2kPbGn/vision-ai.png"
              alt="Our Vision"
              className="phone-img"
            />
          </div>
          <div className="text-side">
            <h2>رؤيتنا 🎯</h2>
            <p>
              أن تصبح مدرستنا المرجع الأول لتعليم اللغة العربية عالميًا باستخدام
              الذكاء الاصطناعي. نطمح إلى بناء جيل يفكر بالعربية ويتحدثها بثقة،
              عبر تجربة تعليمية مفعمة بالإبداع والتقنية.
            </p>
          </div>
        </div>
      </section>

      {/* القسم الثالث: فريقنا */}
      <section className="features-section">
        <div className="features-content">
          <div className="text-side">
            <h2>فريقنا 🤝</h2>
            <p>
              فريقنا يضم خبراء في الذكاء الاصطناعي، التصميم التربوي، واللغويات،
              يعملون معًا لتحقيق تجربة تعليمية ذكية تواكب المستقبل.
            </p>
            <ul className="features-list">
              <li>خبراء في NLP (معالجة اللغة الطبيعية)</li>
              <li>مطوّرون ومصمّمون بشغف للتعليم الذكي</li>
              <li>معلّمون مبدعون في تبسيط المفاهيم</li>
              <li>هدفنا: جعل التعلم تجربة إنسانية وملهمة 💡</li>
            </ul>
          </div>
          <div className="image-side">
            <img
              src="https://i.ibb.co/FVWKQLr/team-ai.png"
              alt="Our Team"
              className="phone-img"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}