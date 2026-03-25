import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, theme }) => {
  const navItems = [
    { id: 'home', icon: <Home size={22} />, label: 'Home' },
    { id: 'tasks', icon: <ClipboardList size={22} />, label: 'Tasks' },
    { id: 'profile', icon: <User size={22} />, label: 'Profile' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100%', 
      backgroundColor: `${theme?.card}F2` || '#111111F2', 
      backdropFilter: 'blur(15px)',
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)', // Fix for mobile cut-off
      transition: '0.3s'
    }}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: isActive ? '#007AFF' : theme?.text, 
              opacity: isActive ? 1 : 0.4,
              gap: '4px',
              cursor: 'pointer',
              transition: '0.2s transform ease'
            }}
          >
            <div style={{ 
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: '0.2s' 
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.2px' }}>
              {item.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;