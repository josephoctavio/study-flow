import React, { useState } from 'react';
import { 
  BookOpen, 
  Settings, 
  ChevronRight, 
  Clock, 
  UserCog, 
  BarChart3, 
  Info, 
  HelpCircle, 
  MessageSquare // --- IMPORTED MESSAGESQUARE ---
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = ({ setActiveTab, theme, darkMode, stats, userName, profileData, loading }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#111111',
    bg: theme?.bg || '#000',
    border: theme?.border || '#222222',
    accent: theme?.accent || '#007AFF',
    muted: theme?.muted || '#888888'
  };

  const handleLogout = async () => await supabase.auth.signOut();

  // Extract the first initial from the name
  const getInitial = () => {
    const name = profileData?.full_name || 'Member';
    return name.charAt(0).toUpperCase();
  };

  // --- SKELETON LOADING UI ---
  if (loading) return (
    <div style={{ padding: '20px', backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
        <div className="skeleton" style={{ width: '110px', height: '110px', borderRadius: '32px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ width: '160px', height: '24px', borderRadius: '8px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '100px', height: '14px', borderRadius: '6px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
        <div className="skeleton" style={{ height: '120px', borderRadius: '24px' }} />
        <div className="skeleton" style={{ height: '120px', borderRadius: '24px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '65px', borderRadius: '18px' }} />)}
      </div>
      <style>{`
        .skeleton { 
          background: ${darkMode ? '#1A1A1A' : '#E1E1E1'};
          position: relative;
          overflow: hidden;
        }
        .skeleton::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}, transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );

  return (
    <div style={{ padding: '24px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '120px' }}>
      
      {/* LOGOUT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, padding: '32px', borderRadius: '28px', maxWidth: '300px', width: '85%', textAlign: 'center', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: '20px' }}>
                <Info color="#FF3B30" size={32} />
              </div>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Sign Out?</h3>
            <p style={{ fontSize: '13px', opacity: 0.5, marginBottom: '24px', lineHeight: '1.4' }}>You'll need to log back in to access your dashboard.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleLogout} style={{ padding: '16px', borderRadius: '16px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>LOGOUT</button>
              <button onClick={() => setModalOpen(false)} style={{ padding: '16px', borderRadius: '16px', background: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ 
          width: '110px', height: '110px', borderRadius: '32px',
          backgroundColor: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', 
          border: `1px solid ${colors.border}`, margin: '0 auto 20px', 
          position: 'relative', boxShadow: `0 10px 30px rgba(0,0,0,${darkMode ? '0.4' : '0.1'})`
        }}>
          <div style={{ 
            width: '90px', height: '90px', borderRadius: '24px', 
            backgroundColor: darkMode ? '#1A1A1A' : '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${colors.border}`
          }}>
            <span style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: colors.accent,
              textShadow: darkMode ? `0 0 20px ${colors.accent}4D` : 'none'
            }}>
              {getInitial()}
            </span>
          </div>
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
          {profileData?.full_name || 'MEMBER'}
        </h2>
        
        <div style={{ display: 'inline-block', marginTop: '8px', padding: '6px 14px', backgroundColor: `${colors.accent}14`, borderRadius: '20px', border: `1px solid ${colors.accent}1A` }}>
           <p style={{ color: colors.accent, fontSize: '9px', fontWeight: '900', margin: 0, letterSpacing: '1.2px' }}>
            {profileData?.matric_no ? `${profileData.matric_no}` : 'PREMIUM ACCOUNT'}
          </p>
        </div>
      </div>

      {/* GLOBAL STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '35px' }}>
        <StatCard icon={<BarChart3 size={18} color="#5856D6" />} value={stats?.courses || 0} label="Courses" colors={colors} />
        <StatCard icon={<BookOpen size={18} color="#34C759" />} value={stats?.totalTasks || 0} label="Tasks" colors={colors} />
      </div>

      {/* MENU BUTTONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <h4 style={{ fontSize: '10px', fontWeight: '900', color: '#555', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>MANAGEMENT</h4>
        <MenuButton icon={<UserCog size={18} color="#AF52DE" />} label="Edit Profile" onClick={() => setActiveTab('edit-profile')} colors={colors} />
        <MenuButton icon={<BookOpen size={18} color={colors.accent} />} label="Course Manager" onClick={() => setActiveTab('course-manager')} colors={colors} />
        <MenuButton icon={<Clock size={18} color="#FF9500" />} label="My Schedule" onClick={() => setActiveTab('schedule-manager')} colors={colors} />
        
        <h4 style={{ fontSize: '10px', fontWeight: '900', color: '#555', letterSpacing: '1px', marginBottom: '8px', marginTop: '12px', paddingLeft: '8px' }}>SYSTEM</h4>
        <MenuButton icon={<Settings size={18} color="#8E8E93" />} label="App Settings" onClick={() => setActiveTab('config')} colors={colors} />
        
        {/* --- DEV FEEDBACK LOGS (PROTECTED) --- */}
        {/* Only show this if the user ID matches yours exactly */}
        {supabase.auth.getUser() && profileData?.id === "5e50af0d-dd42-4feb-ba2d-b7b2d8f1a4f0" && (
          <MenuButton 
            icon={<BarChart3 size={18} color="#FF2D55" />} 
            label="Dev Feedback Logs" 
            onClick={() => setActiveTab('admin-feedback')} 
            colors={colors} 
          />
        )}

        {/* --- NEW FEEDBACK BUTTON --- */}
        <MenuButton 
          icon={<MessageSquare size={18} color="#34C759" />} 
          label="Send Feedback" 
          onClick={() => setActiveTab('feedback')} 
          colors={colors} 
        />

        <MenuButton 
          icon={<Info size={18} color="#5AC8FA" />} 
          label="About Focus Forge" 
          onClick={() => setActiveTab('about')} 
          colors={colors} 
        />

        <MenuButton 
          icon={<HelpCircle size={18} color={colors.accent} />} 
          label="App Tutorial" 
          onClick={() => setActiveTab('tutorial')} 
          colors={colors} 
        />
      </div>

      <button onClick={() => setModalOpen(true)} style={logoutStyle}>
        SIGN OUT OF ACCOUNT
      </button>

      <style>{`
        .stat-card { transition: all 0.2s ease; }
        .stat-card:active { transform: scale(0.95); }
        .menu-btn { transition: all 0.2s ease; outline: none; }
        .menu-btn:active { transform: scale(0.98); background-color: ${darkMode ? '#1a1a1a' : '#f9f9f9'} !important; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, value, label, colors }) => (
  <div className="stat-card" style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>{icon}</div>
    <span style={{ fontSize: '28px', fontWeight: '900', display: 'block', marginBottom: '2px', letterSpacing: '-1px' }}>{value}</span>
    <span style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
  </div>
);

const MenuButton = ({ icon, label, onClick, colors }) => (
  <button className="menu-btn" onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', 
    backgroundColor: colors.card, border: `1px solid ${colors.border}`, 
    borderRadius: '20px', cursor: 'pointer', gap: '16px', borderStyle: 'solid'
  }}>
    <div style={{ 
      backgroundColor: 'rgba(255,255,255,0.03)', 
      padding: '10px', 
      borderRadius: '14px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      border: `1px solid ${colors.border}`
    }}>
      {icon}
    </div>
    <span style={{ flex: 1, fontWeight: '700', fontSize: '15px', color: colors.text, textAlign: 'left' }}>
      {label}
    </span>
    <ChevronRight size={16} style={{ opacity: 0.2 }} />
  </button>
);

const logoutStyle = {
  width: '100%', marginTop: '40px', padding: '16px', border: 'none', background: 'transparent',
  color: '#FF3B30', fontWeight: '900', fontSize: '11px', cursor: 'pointer',
  letterSpacing: '1.5px', opacity: 0.6
};

export default Profile;