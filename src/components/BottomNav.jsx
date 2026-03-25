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
      height: '70px', // Explicit height for better control
      backgroundColor: theme?.card?.startsWith('#') ? `${theme.card}F2` : 'rgba(17, 17, 17, 0.95)', 
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      borderTop: `1px solid ${theme?.border}`,
      position: 'relative'
    }}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: isActive ? '#007AFF' : theme?.text, 
              position: 'relative',
              cursor: 'pointer',
              transition: '0.2s all ease'
            }}
          >
            {/* Active Indicator Line */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                width: '30px',
                height: '3px',
                backgroundColor: '#007AFF',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 2px 10px rgba(0,122,255,0.5)',
                animation: 'slideIn 0.3s ease-out'
              }} />
            )}

            <div style={{ 
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              opacity: isActive ? 1 : 0.5,
              transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
            }}>
              {/* Added strokeWidth for a cleaner look */}
              {React.cloneElement(item.icon, { strokeWidth: isActive ? 2.5 : 2 })}
            </div>

            <span style={{ 
              fontSize: '10px', 
              fontWeight: '800', 
              marginTop: '4px',
              letterSpacing: '0.5px',
              opacity: isActive ? 1 : 0.5,
              transition: '0.3s'
            }}>
              {item.label.toUpperCase()}
            </span>
          </button>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
        button:active {
          transform: scale(0.92);
        }
      `}</style>
    </div>
  );
};

export default BottomNav;