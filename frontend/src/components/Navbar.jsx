import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: isActive(path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: isActive(path) ? 'var(--color-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  });

  return (
    <nav style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-default)',
      padding: '16px 0',
      marginBottom: '32px'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <h1
            style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            YO<span style={{ color: 'var(--color-primary)' }}>prep</span>
          </h1>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={navLinkStyle('/')} onClick={() => navigate('/')}>
              Etusivu
            </button>
            <button style={navLinkStyle('/questions')} onClick={() => navigate('/questions')}>
              Kysymykset
            </button>
            <button style={navLinkStyle('/practice')} onClick={() => navigate('/practice')}>
              Harjoittele
            </button>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          title={theme === 'dark' ? 'Vaihda vaaleaan' : 'Vaihda tummaan'}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
