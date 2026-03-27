import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Zap, MapPin, ClipboardList, Layout, RefreshCw } from 'lucide-react';

const Home = ({ theme, darkMode, userName, stats, todayClasses, loading, refreshData }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const colors = {
    text: theme?.text || (darkMode ? '#FFFFFF' : '#000000'),
    card: theme?.card || (darkMode ? '#111111' : '#FFFFFF'),
    bg: theme?.bg || (darkMode ? '#000000' : '#F5F5F7'),
    border: theme?.border || (darkMode ? '#222222' : '#E5E5E5'),
    accent: '#007AFF'
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const hasTasks = stats?.totalTasks > 0;
  const isFullyComplete = hasTasks && stats.completedTasks === stats.totalTasks;

  const getProgressColor = () => {
    if (!hasTasks) return colors.accent;
    if (isFullyComplete) return '#34C759';
    if (stats.percentage < 35) return '#FF3B30';
    if (stats.percentage < 75) return '#FFCC00';
    return '#34C759'; 
  };

  const currentColor = getProgressColor();
  const hour = new Date().getHours();
  let greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Late night study';

  const fullDateStr = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  }).format(new Date()).toUpperCase();

  if (loading && (!stats || stats.totalTasks === 0)) {
    return (
      <div style={{ padding: '20px', backgroundColor: colors.bg, minHeight: '100vh' }}>
        <div className="skeleton" style={{ width: '150px', height: '24px', borderRadius: '6px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '100%', height: '160px', borderRadius: '28px', marginBottom: '15px' }} />
        <style>{`
          .skeleton { 
            background: ${darkMode ? '#1A1A1A' : '#E1E1E1'};
            background-image: linear-gradient(90deg, transparent, ${darkMode ? '#222' : '#F8F8F8'}, transparent);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite linear;
          }
          @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '100px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh' }}>
      
      {/* 1. WELCOME SECTION */}
      <header style={{ marginBottom: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ overflow: 'hidden' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.8px', margin: 0, color: colors.text }}>
            {greeting}, <span style={{ color: colors.accent }}>{userName || 'Scholar'}</span>
          </h1>
          <p style={{ color: darkMode ? '#666' : '#888', margin: '2px 0 0 0', fontSize: '12px', fontWeight: '700' }}>
            {hasTasks ? (isFullyComplete ? "All items completed." : `You have ${stats.totalTasks - stats.completedTasks} tasks remaining.`) : "No pending tasks in your queue."}
          </p>
        </div>

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', 
          backgroundColor: isOnline ? 'rgba(52, 199, 89, 0.08)' : 'rgba(255, 59, 48, 0.08)',
          borderRadius: '12px', border: `1px solid ${isOnline ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)'}`
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnline ? '#34C759' : '#FF3B30' }} />
          <span style={{ fontSize: '9px', fontWeight: '900', color: isOnline ? '#34C759' : '#FF3B30' }}>{isOnline ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </header>

      {/* 2. PROGRESS / STATUS CARD */}
      <div style={{ 
        backgroundColor: colors.card, padding: '24px', borderRadius: '28px', border: `1px solid ${colors.border}`,
        marginBottom: '16px', boxShadow: `0 10px 30px rgba(0,0,0,${darkMode ? '0.2' : '0.05'})`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Zap size={12} color={currentColor} fill={currentColor} />
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#666', letterSpacing: '1px' }}>{hasTasks ? 'PROGRESS' : 'SYSTEM STATUS'}</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: colors.text }}>{hasTasks ? `${stats.percentage}%` : "READY"}</h2>
            <p style={{ color: '#666', fontWeight: '700', fontSize: '11px', margin: 0 }}>{hasTasks ? (isFullyComplete ? "Great work!" : "Keep pushing") : "Desk is clear"}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', fontWeight: '900', color: currentColor }}>{hasTasks ? `${stats.completedTasks}/${stats.totalTasks}` : <Layout size={20} />}</span>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '8px', backgroundColor: darkMode ? '#000' : '#F0F0F0', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
          <div style={{ width: hasTasks ? `${stats.percentage}%` : '0%', height: '100%', backgroundColor: currentColor, transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* 3. QUICK STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: colors.card, padding: '18px', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
            <BookOpen size={18} color="#5856D6" />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '8px 0 2px 0', color: colors.text }}>{stats?.courses || 0}</h3>
            <p style={{ fontSize: '9px', fontWeight: '800', color: '#666', textTransform: 'uppercase', margin: 0 }}>Courses</p>
          </div>
          <div style={{ backgroundColor: colors.card, padding: '18px', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
            <Clock size={18} color="#FF9500" />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '8px 0 2px 0', color: colors.text }}>{stats?.totalTasks || 0}</h3>
            <p style={{ fontSize: '9px', fontWeight: '800', color: '#666', textTransform: 'uppercase', margin: 0 }}>Assignments</p>
          </div>
      </div>

      {/* 4. SCHEDULE */}
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '900', color: colors.text, letterSpacing: '1px' }}>TODAY'S SCHEDULE</h3>
        <span style={{ fontSize: '10px', fontWeight: '800', color: colors.accent }}>{fullDateStr}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {todayClasses && todayClasses.length > 0 ? (
          todayClasses.map((item) => (
            <div key={item.id} style={{ padding: '18px', backgroundColor: colors.card, borderRadius: '22px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '4px', height: '36px', backgroundColor: item.courses?.color || '#333', borderRadius: '10px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: colors.text }}>{item.courses?.name}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: '700' }}>{formatTime(item.start_time)}</span>
                  {item.location && <span style={{ fontSize: '11px', color: '#666', fontWeight: '700' }}>{item.location}</span>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', border: `2px dashed ${colors.border}`, borderRadius: '24px' }}>
            <ClipboardList size={32} color="#444" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: '#666', fontSize: '12px', fontWeight: '800' }}>NO CLASSES TODAY</p>
          </div>
        )}
      </div>

      {!isOnline && (
        <button onClick={refreshData} style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: '900', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', margin: '20px auto' }}>
          <RefreshCw size={14} /> REFRESH SYSTEM
        </button>
      )}
    </div>
  );
};

export default Home;