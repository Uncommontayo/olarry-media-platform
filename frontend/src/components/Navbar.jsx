import { useState, useEffect, useRef } from "react";
import { clearAuth, isAuthenticated } from "../api";
import { theme } from "../styles/theme";

export default function Navbar({ onSearch, onHome, onFilterUser }) {
  const [searchValue, setSearchValue] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  
  const username = localStorage.getItem("username") || "User";
  const userRole = localStorage.getItem("userRole");
  const isAuth = isAuthenticated();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e) {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  }

  function handleLogout() {
    clearAuth();
    window.location.href = "/login.html";
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: theme.colors.backgroundDark,
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadow.soft
    }}>
      <nav style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 24
      }}>
        {/* Logo */}
        <button
          onClick={onHome}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 8,
            borderRadius: theme.radius.sm,
            transition: theme.transition.fast
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.card;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.colors.bape}, ${theme.colors.accentBright})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold'
          }}>
            O
          </div>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: theme.colors.text,
            letterSpacing: '-0.5px'
          }}>
            O'larry
          </span>
        </button>

        {/* Creator Dashboard Link */}
        {userRole === 'creator' && (
          <a
            href="/creator-dashboard.html"
            style={{
              padding: '8px 16px',
              background: `linear-gradient(135deg, ${theme.colors.accentBright}, #357ABD)`,
              color: '#fff',
              textDecoration: 'none',
              borderRadius: theme.radius.md,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: theme.shadow.soft,
              transition: theme.transition.fast,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = theme.shadow.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = theme.shadow.soft;
            }}
          >
            Creator Dashboard
          </a>
        )}

        {/* Search */}
        <div style={{
          flex: 1,
          maxWidth: 600
        }}>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search titles, captions, locations, people..."
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: theme.radius.md,
              border: `1px solid ${theme.colors.border}`,
              fontSize: 14,
              background: theme.colors.card,
              color: theme.colors.text,
              outline: 'none',
              transition: theme.transition.fast
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.accentBright;
              e.target.style.boxShadow = theme.shadow.focus;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* User Menu */}
        {isAuth ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: theme.colors.text,
                transition: theme.transition.fast
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.accentBright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: theme.colors.bape,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                {username[0]?.toUpperCase() || 'U'}
              </div>
              <span>@{username}</span>
              <span style={{ fontSize: 12 }}>▼</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 200,
                background: theme.colors.card,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                boxShadow: theme.shadow.hover,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    window.location.href = '/profile.html';
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: theme.colors.text,
                    borderBottom: `1px solid ${theme.colors.borderLight}`,
                    transition: theme.transition.fast
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    onFilterUser?.(username);
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: theme.colors.text,
                    borderBottom: `1px solid ${theme.colors.borderLight}`,
                    transition: theme.transition.fast
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  View My Posts
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: theme.colors.error,
                    transition: theme.transition.fast
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/login.html"
            style={{
              padding: '8px 20px',
              background: theme.colors.accentBright,
              color: '#fff',
              borderRadius: theme.radius.md,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              transition: theme.transition.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = theme.shadow.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Login
          </a>
        )}
      </nav>
    </header>
  );
}
