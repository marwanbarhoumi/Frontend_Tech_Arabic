import React from "react";
import "../styles/Contact.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت. ✅");
  };

  return (
    <div className="contact-page">
      <Navbar />
      <div className="stars"></div>

      <div className="contact-container">
        <h1 className="contact-title">تواصل معنا 📩</h1>
        <p className="contact-subtitle">
          نحن هنا لمساعدتك! أرسل لنا استفسارك أو ملاحظاتك وسنرد عليك في أقرب وقت.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">الاسم الكامل</label>
            <input 
              type="text" 
              id="fullName"
              placeholder="أدخل اسمك الكامل" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input 
              type="email" 
              id="email"
              placeholder="example@gmail.com" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">الرسالة</label>
            <textarea 
              id="message"
              placeholder="اكتب رسالتك هنا..." 
              rows={5} 
              required
            ></textarea>
          </div>

          <button type="submit" className="send-btn">
            إرسال الرسالة 🚀
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;