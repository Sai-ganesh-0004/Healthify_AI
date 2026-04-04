import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import Chatbot from "./pages/Chatbot";
import Diet from "./pages/Diet";
import Reports from "./pages/Reports";
import Doctors from "./pages/Doctors";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = (page) => setCurrentPage(page);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage("login");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      if (currentPage === "register") return <Register navigate={navigate} />;
      return <Login navigate={navigate} onLogin={handleLogin} />;
    }
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user} navigate={navigate} onUserUpdate={handleUserUpdate} />;
      case "symptoms":
        return <SymptomChecker navigate={navigate} />;
      case "chatbot":
        return <Chatbot user={user} />;
      case "diet":
        return <Diet />;
      case "reports":
        return <Reports />;
      case "doctors":
        return <Doctors />;
      default:
        return <Dashboard user={user} navigate={navigate} onUserUpdate={handleUserUpdate} />;
    }
  };

  return (
    <div className="app-root">
      {isLoggedIn && (
        <Navbar user={user} onLogout={handleLogout} navigate={navigate} />
      )}
      <div className={isLoggedIn ? "app-layout" : ""}>
        {isLoggedIn && (
          <Sidebar currentPage={currentPage} navigate={navigate} />
        )}
        <main className={isLoggedIn ? "main-content" : "auth-content"}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
