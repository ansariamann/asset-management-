import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to add shadow to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when a link is clicked
  const handleNavLinkClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (menuOpen && event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div className="layout">
      <header className={`header ${scrolled ? "scrolled" : ""}`} role="banner">
        <div className="header-content">
          <h1 className="header-title">
            <Link to="/" className="header-link">
              <span className="header-icon" aria-hidden="true">
                📦
              </span>
              Asset Management System
            </Link>
          </h1>
          <button
            className="mobile-menu-button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <nav
            className={`nav ${menuOpen ? "open" : ""}`}
            id="main-navigation"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              to="/assets"
              className={`nav-link ${
                location.pathname === "/assets" || location.pathname === "/"
                  ? "active"
                  : ""
              }`}
              onClick={handleNavLinkClick}
              aria-current={
                location.pathname === "/assets" || location.pathname === "/"
                  ? "page"
                  : undefined
              }
            >
              <span className="nav-icon" aria-hidden="true">
                📋
              </span>
              Assets
            </Link>
            <Link
              to="/assets/create"
              className={`nav-link ${
                location.pathname === "/assets/create" ? "active" : ""
              }`}
              onClick={handleNavLinkClick}
              aria-current={
                location.pathname === "/assets/create" ? "page" : undefined
              }
            >
              <span className="nav-icon" aria-hidden="true">
                ➕
              </span>
              Add Asset
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="main-content">{children}</div>
      </main>
      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Asset Management System</p>
          <div className="footer-links">
            <a href="#" className="footer-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-link">
              Terms of Service
            </a>
            <a href="#" className="footer-link">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
