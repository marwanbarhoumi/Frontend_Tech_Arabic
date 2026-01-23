import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("🎉 تم تسجيل الدخول بنجاح!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      console.error("Signin error:", error);
      setError("تعذر الاتصال بالخادم. تأكد من تشغيل Backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="stars"></div>

      <div className="auth-container">
        <h1 className="auth-title">تسجيل الدخول 🔐</h1>
        <p className="auth-subtitle">
          مرحباً بعودتك! سجل الدخول لمواصلة رحلتك في تعلم العربية
        </p>

        {error && <div className="error-message">❌ {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="أدخل كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول 🚀"}
          </button>

          <div className="auth-links">
            <p>
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="auth-link">
                أنشئ حساب جديد
              </Link>
            </p>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
