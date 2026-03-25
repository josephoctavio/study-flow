import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Header = ({ title, showThemeToggle, darkMode, setDarkMode, theme }) => {
  return (
    <div className="mobile-header" style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '60px',
      backgroundColor: `${theme?.card}E6` || '#000000E6', // Added E6 for 90% transparency
      backdropFilter: 'blur(10px)', // Glassmorphism effect
      borderBottom: `1px solid ${theme?.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: '0.3s'
    }}>
      <h1 className="page-title" style={{ 
        color: theme?.text, 
        fontSize: '18px', 
        fontWeight: '900', 
        letterSpacing: '-0.5px',
        margin: 0 
      }}>
        {title}
      </h1>
      
      {showThemeToggle && (
        <button 
          onClick={() => setDarkMode(!darkMode)}
          style={{ 
            background: theme?.bg, 
            border: `1px solid ${theme?.border}`, 
            borderRadius: '20px',
            padding: '6px 12px',
            color: theme?.text,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          <span style={{ fontSize: '10px', fontWeight: '800' }}>
            {darkMode ? 'LIGHT' : 'DARK'}
          </span>
        </button>
      )}
    </div>
  );
};

export default Header;