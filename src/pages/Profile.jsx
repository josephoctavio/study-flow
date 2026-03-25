import React from 'react';
import { UserCircle, BookOpen, Settings, ChevronRight, Clock } from 'lucide-react';

const Profile = ({ setActiveTab, theme }) => {
  // 🛠️ Updated Menu Options with Schedule Manager
  const menuOptions = [
    { 
      id: 'course-manager', 
      label: 'Course Manager', 
      icon: <BookOpen size={22} color="#007AFF" />, 
      desc: 'Organize subjects and lecturers' 
    },
    { 
      id: 'schedule-manager', 
      label: 'Timetable', 
      icon: <Clock size={22} color="#34C759" />, 
      desc: 'Manage class times & locations' 
    },
    { 
      id: 'config', 
      label: 'Settings', 
      icon: <Settings size={22} color="#888" />, 
      desc: 'App appearance and notifications' 
    }
  ];

  return (
    <div style={{ padding: '20px', color: theme?.text }}>
      
      {/* --- PROFILE HEADER --- */}
      <div style={{ textAlign: 'center', padding: '30px 0' }}>
        <UserCircle size={80} style={{ color: theme?.text, marginBottom: '10px', opacity: 0.8 }} />
        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>STUDENT USER</h2>
        <p style={{ color: '#007AFF', fontSize: '12px', fontWeight: '800', marginTop: '4px', letterSpacing: '1px' }}>
          ACADEMIC DASHBOARD
        </p>
      </div>

      {/* --- MENU LIST LAYOUT --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveTab(option.id)}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '16px',
              backgroundColor: theme?.card, 
              border: `1px solid ${theme?.border}`,
              borderRadius: '18px',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '15px',
              transition: '0.2s background-color'
            }}
          >
            {/* Icon Circle */}
            <div style={{ 
              backgroundColor: theme?.bg, 
              padding: '12px', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {option.icon}
            </div>
            
            {/* Text Content */}
            <div style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: '700', fontSize: '15px', color: theme?.text }}>
                {option.label}
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: theme?.text, opacity: 0.5 }}>
                {option.desc}
              </span>
            </div>

            {/* Right Arrow */}
            <ChevronRight size={18} style={{ color: theme?.text, opacity: 0.3 }} />
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <button style={{ 
        width: '100%', 
        marginTop: '30px', 
        padding: '16px', 
        border: 'none', 
        background: 'transparent', 
        color: '#FF3B30', 
        fontWeight: '700', 
        fontSize: '14px',
        cursor: 'pointer'
      }}>
        Sign Out
      </button>

    </div>
  );
};

export default Profile;