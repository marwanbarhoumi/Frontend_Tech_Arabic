import { Link, useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    // Supprimer le token et les données utilisateur
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Rediriger vers la page d'accueil
    navigate("/");

    // Optionnel: Message de confirmation
    alert("✅ تم تسجيل الخروج بنجاح!");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">مدرسة اللغة العربية</div>
        <ul className="nav-links">
          <li>
            <Link to="/" className="text-white hover:text-pink-400">
              الرئيسية
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:text-pink-400">
              عن المدرسة
            </Link>
          </li>
          <li>
            <a href="#courses">الدروس</a>
          </li>
          <li>
            <Link to="/contact" className="text-white hover:text-pink-400">
              اتصل بنا
            </Link>
          </li>

          {/* Afficher le bouton de connexion/déconnexion selon l'état */}
          {user ? (
            <>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  تسجيل الخروج
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signin" className="text-white hover:text-pink-400">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-white hover:text-pink-400">
                  إنشاء حساب
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
