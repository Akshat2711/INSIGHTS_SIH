import React, { useState } from "react";
import "../customcss/Navbar.css";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  let darkMode = localStorage.getItem("insight_theme") === "dark";

  return (
    <nav className="navbar">
      <h1 className={darkMode ? "logo-dark" : "logo-light"}>Insights</h1>
      {/* Hamburger */}
      <div className="menu-icon" onClick={() => setIsOpen(true)}>
        <Menu size={28} />
      </div>

      {/* Desktop Links */}
      <ul className="nav-links desktop-only">
        <li><a href="/me">Me</a></li>
        <li><a href="/compare">Compare</a></li>
        <li><a href="/leaderboard">Leaderboard</a></li>
        <li><a href="/suggestions">Suggestions</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="mobile-menu">
          <div className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={34} />
          </div>
          <ul className="mobile-links">
            <li><a href="/me" onClick={() => setIsOpen(false)}>Me</a></li>
            <li><a href="/compare" onClick={() => setIsOpen(false)}>Compare</a></li>
            <li><a href="/leaderboard" onClick={() => setIsOpen(false)}>Leaderboard</a></li>
            <li><a href="/suggestions" onClick={() => setIsOpen(false)}>Suggestions</a></li>
            <li><a href="/settings" onClick={() => setIsOpen(false)}>Settings</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
