import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Header = ({ title, showThemeToggle, darkMode, setDarkMode, theme }) => {
  // Helper to handle transparency safely
  const bgColor = theme?.card?.startsWith('#') 
    ? `${theme.card}E6` 
    : theme?.card || 'rgba(255, 255, 255, 0.9)';

  return (
    <header className="mobile-header" style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px', // Standard mobile gutter
      height: '64px',    // Increased slightly from 60px to prevent "smushed" look
      backgroundColor: bgColor,
      backdropFilter: 'blur(12px)', // Slightly deeper blur for better glass effect
      WebkitBackdropFilter: 'blur(12px)', // Safari support
      borderBottom: `1px solid ${theme?.border || 'rgba(0,0,0,0.1)'}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <h1 className="page-title" style={{ 
        color: theme?.text, 
        fontSize: '20px',    // Slightly larger for hierarchy
        fontWeight: '800',   // 900 is often too thick for small screens
        letterSpacing: '-0.3px', // Reduced negative spacing to fix "smushed" look
        margin: 0,
        textTransform: 'capitalize' // Ensures "Tasks" looks clean
      }}>
        {title}
      </h1>
      
      {showThemeToggle && (
        <button 
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Theme"
          style={{ 
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
            border: `1px solid ${theme?.border}`, 
            borderRadius: '12px', // More modern "squircle" look than 20px
            padding: '8px 12px',
            color: theme?.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s active',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {darkMode ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            letterSpacing: '0.5px' 
          }}>
            {darkMode ? 'LIGHT' : 'DARK'}
          </span>
        </button>
      )}
    </header>
  );
};

export default Header;