import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Effacer les erreurs quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور غير متطابقة!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setLoading(false);
      return;
    }

    try {
      // Envoyer les données au backend
      const response = await fetch('https://backend-tech-arabic.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("🎉 تم إنشاء الحساب بنجاح!");
        // Sauvegarder le token et rediriger
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('تعذر الاتصال بالخادم. تأكد من تشغيل Backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="stars"></div>

      <div className="auth-container">
        <h1 className="auth-title">إنشاء حساب جديد 🌟</h1>
        <p className="auth-subtitle">
          انضم إلينا وابدأ رحلتك في تعلم اللغة العربية بالذكاء الاصطناعي
        </p>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">الاسم الكامل</label>
            <input 
              type="text" 
              id="fullName"
              name="fullName"
              placeholder="أدخل اسمك الكامل" 
              value={formData.fullName}
              onChange={handleChange}
              required 
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              placeholder="أعد إدخال كلمة المرور" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب 🚀"}
          </button>

          <div className="auth-links">
            <p>
              لديك حساب بالفعل؟ <Link to="/signin" className="auth-link">سجل الدخول</Link>
            </p>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default SignUp;