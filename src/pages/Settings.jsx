import React, { useState } from 'react';
import { 
  ChevronRight, 
  Moon, 
  Sun,
  Bell, 
  Smartphone, 
  HelpCircle, 
  Mail, 
  RefreshCcw, 
  ShieldCheck, 
  Globe,
  X
} from 'lucide-react';

const Settings = ({ setActiveTab, theme, darkMode, toggleTheme }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#111111',
    bg: theme?.bg || '#000',
    border: theme?.border || '#222222',
    accent: '#007AFF'
  };

  // LOGIC: Handle Refresh App
  const handleRefreshApp = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 2500); // 2.5 seconds for the "looking good" effect
  };

  const handleReportBug = () => {
    window.location.href = "mailto:support@studyflow.com?subject=Bug Report - StudyFlow App";
  };

  const SectionHeader = ({ title }) => (
    <h3 style={{ 
      fontSize: '11px', 
      fontWeight: '800', 
      color: colors.accent, 
      textTransform: 'uppercase', 
      letterSpacing: '1.5px',
      margin: '25px 0 12px 10px'
    }}>
      {title}
    </h3>
  );

  return (
    <div style={{ padding: '24px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '120px' }}>
      
      {/* REFRESH OVERLAY */}
      {isRefreshing && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: colors.bg, zIndex: 10000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '20px'
        }}>
          <RefreshCcw size={40} color={colors.accent} className="spin-icon" />
          <p style={{ fontWeight: '700', fontSize: '14px', letterSpacing: '1px', opacity: 0.8 }}>REFRESHING APP...</p>
        </div>
      )}

      {/* HEADER: Text Left, Button Right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '35px', paddingTop: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Settings</h1>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ 
            background: colors.card, border: `1px solid ${colors.border}`, 
            borderRadius: '14px', padding: '10px', cursor: 'pointer'
          }}
        >
          <X size={20} color={colors.text} />
        </button>
      </div>

      {/* ACCOUNT & SECURITY */}
      <SectionHeader title="Account" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SettingItem 
            icon={<ShieldCheck size={18} color="#34C759" />} 
            label="Privacy & Security" 
            colors={colors} 
            onClick={() => setActiveTab('privacy-security')} // Placeholder for next step
        />
      </div>

      {/* APPEARANCE */}
      <SectionHeader title="Appearance" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SettingItem 
          icon={darkMode ? <Moon size={18} color="#FF9500" /> : <Sun size={18} color="#FFCC00" />} 
          label={darkMode ? "Dark Mode" : "Light Mode"} 
          colors={colors} 
          hasToggle 
          active={darkMode} 
          onToggle={toggleTheme} 
        />
        <SettingItem 
            icon={<Globe size={18} color="#007AFF" />} 
            label="Language" 
            desc="Coming Soon"
            colors={colors} 
            disabled
        />
      </div>

      {/* PREFERENCES */}
      <SectionHeader title="Notifications" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SettingItem 
          icon={<Bell size={18} color="#FF3B30" />} 
          label="Push Notifications" 
          desc="Reminders (Coming Soon)" 
          colors={colors} 
          disabled
        />
      </div>

      {/* SUPPORT */}
      <SectionHeader title="Support" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SettingItem 
            icon={<Mail size={18} color="#5856D6" />} 
            label="Report a Bug" 
            onClick={handleReportBug}
            colors={colors} 
        />
        <SettingItem icon={<HelpCircle size={18} color="#E5E5EA" />} label="Help Center" colors={colors} />
        <SettingItem 
            icon={<RefreshCcw size={18} color="#AF52DE" />} 
            label="Refresh App" 
            onClick={handleRefreshApp}
            colors={colors} 
        />
      </div>

      {/* ABOUT */}
      <SectionHeader title="About" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SettingItem icon={<Smartphone size={18} color="#8E8E93" />} label="App Version" desc="v2.4.0" colors={colors} hideArrow />
      </div>

      <style>{`
        .setting-row { transition: all 0.1s ease; }
        .setting-row:active { transform: scale(0.98); background-color: #161616 !important; }
        .toggle-switch { width: 42px; height: 24px; background-color: #333; border-radius: 50px; position: relative; cursor: pointer; transition: 0.3s; }
        .toggle-knob { width: 20px; height: 20px; background-color: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.2s; }
        .toggle-active .toggle-knob { left: 20px; }
        .toggle-active { background-color: #34C759 !important; }
        
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const SettingItem = ({ icon, label, desc, colors, hasToggle, active, onToggle, onClick, hideArrow, disabled }) => {
  return (
    <div 
      className="setting-row" 
      onClick={!hasToggle && !disabled ? onClick : undefined}
      style={{ 
        display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: colors.card, 
        border: `1px solid ${colors.border}`, borderRadius: '18px', gap: '16px',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1
      }}
    >
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.border}`
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>{label}</p>
        {desc && <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.4, fontWeight: '600' }}>{desc}</p>}
      </div>
      {hasToggle ? (
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`toggle-switch ${active ? 'toggle-active' : ''}`}>
          <div className="toggle-knob" />
        </div>
      ) : (
        !hideArrow && <ChevronRight size={16} style={{ opacity: 0.2 }} />
      )}
    </div>
  );
};

export default Settings;