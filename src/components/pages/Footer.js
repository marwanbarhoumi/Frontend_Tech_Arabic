import "../styles/LandingPage.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>مدرسة اللغة العربية</h3>
          <p>
            منصة تعليمية رائدة لتعليم اللغة العربية باستخدام الذكاء الاصطناعي.
          </p>

          <div className="social-links">
            {/* Facebook */}
            <button
              type="button"
              className="social-link"
              aria-label="Facebook"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12.07C22 6.49 17.52 2 12 2S2 6.49 2 12.07c0 5.03 3.68 9.19 8.5 9.93v-7.03H8.08v-2.9h2.42V9.85c0-2.4 1.43-3.73 3.62-3.73 1.05 0 2.15.19 2.15.19v2.37H15.4c-1.26 0-1.65.79-1.65 1.6v1.92h2.82l-.45 2.9h-2.37V22c4.82-.74 8.5-4.9 8.5-9.93z" />
              </svg>
            </button>

            {/* Twitter */}
            <button
              type="button"
              className="social-link"
              aria-label="Twitter"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.18 4.18 0 0 0 1.85-2.3 8.3 8.3 0 0 1-2.63 1A4.15 4.15 0 0 0 11 8.13a11.78 11.78 0 0 1-8.56-4.34 4.15 4.15 0 0 0 1.29 5.54 4.09 4.09 0 0 1-1.88-.52v.05a4.16 4.16 0 0 0 3.33 4.07 4.2 4.2 0 0 1-1.87.07 4.17 4.17 0 0 0 3.88 2.88A8.33 8.33 0 0 1 2 18.14a11.75 11.75 0 0 0 6.29 1.85c7.55 0 11.7-6.36 11.7-11.87 0-.18 0-.36-.01-.54A8.57 8.57 0 0 0 22.46 6z" />
              </svg>
            </button>

            {/* Instagram */}
            <button
              type="button"
              className="social-link"
              aria-label="Instagram"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10a5 5 0 0 0 5-5V7c0-2.76-2.24-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm0 2a3 3 0 1 1-.001 6.001A3 3 0 0 1 12 9zm4.5-.75a1.25 1.25 0 1 1-.001 2.501A1.25 1.25 0 0 1 16.5 8.25z" />
              </svg>
            </button>

            {/* YouTube */}
            <button
              type="button"
              className="social-link"
              aria-label="YouTube"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.8 8.001s-.2-1.4-.8-2a3.31 3.31 0 0 0-2.3-.8C15.4 5 12 5 12 5h-.1s-3.4 0-6.7.2a3.31 3.31 0 0 0-2.3.8c-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.1 3.2.1 3.2s.2 1.4.8 2a3.31 3.31 0 0 0 2.3.8c2.3.2 6.5.2 6.5.2s3.4 0 6.7-.2a3.31 3.31 0 0 0 2.3-.8c.6-.6.8-2.8.8-2.8s.1-1.6.1-3.2v-1.5c0-1.6-.1-3.2-.1-3.2zM10 14.5V9.5l5 2.5-5 2.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="footer-section">
          <h3>روابط سريعة</h3>
          <ul className="footer-links">
            <li><a href="#home">الرئيسية</a></li>
            <li><a href="#about">عن المدرسة</a></li>
            <li><a href="#courses">الدروس</a></li>
            <li><a href="#contact">اتصل بنا</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>الدروس</h3>
          <ul className="footer-links">
            <li><a href="#grammar">النحو والصرف</a></li>
            <li><a href="#ai">الذكاء الاصطناعي</a></li>
            <li><a href="#writing">الكتابة</a></li>
            <li><a href="#reading">القراءة</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 مدرسة اللغة العربية بالذكاء الاصطناعي. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;
