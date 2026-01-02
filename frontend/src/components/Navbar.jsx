import { useState, useEffect } from "react";

export default function Navbar({ onCreate, onSearch, onHome }) {
  const [hovered, setHovered] = useState(false);

  // current username persisted in localStorage
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  useEffect(() => {
    try { localStorage.setItem("username", username || ""); } catch (e) { console.debug('localStorage setItem failed', e); }
  }, [username]);

  return (
    <header className="nav" role="banner">
      <div className="nav-left">
        <button
          className="brand"
          onClick={onHome}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Go home"
        >
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">O’larry</span>
          <span className={`brand-pulse ${hovered ? "brand-pulse--active" : ""}`} aria-hidden />
        </button>
      </div>

      <div className="nav-search">
        <input
          className="field"
          placeholder="Search the drop..."
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search captions or users"
        />
      </div>

      <div className="nav-actions">
        <button
          className="pill"
          onClick={() => {
            const val = prompt("Set your username (no @):", username || "");
            if (val !== null) setUsername(val.trim());
          }}
          aria-label="Set username"
        >
          {username ? `@${username}` : "Set name"}
        </button>

        <button className="icon-button" onClick={onCreate} aria-label="Create post">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}
