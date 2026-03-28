import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Zap, MapPin, ClipboardList, Layout, ChevronDown, ChevronUp, AlertCircle, WifiOff } from 'lucide-react';

const Home = ({ theme, darkMode, userName, stats, todayClasses, loading }) => {
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine ? 'online' : 'offline');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPastExpanded, setIsPastExpanded] = useState(false);

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#111111',
    bg: theme?.bg || '#000',
    border: theme?.border || '#222222',
    accent: theme?.accent || '#007AFF'
  };

  // --- NETWORK CHECK LOGIC ---
  const checkActualConnectivity = async () => {
    if (!navigator.onLine) {
      setNetworkStatus('offline');
      return;
    }
    try {
      const response = await fetch("https://www.google.com/favicon.ico", { 
        mode: 'no-cors', 
        cache: 'no-store' 
      });
      if (response) setNetworkStatus('online');
    } catch (error) {
      setNetworkStatus('no-internet');
    }
  };

  useEffect(() => {
    checkActualConnectivity();
    const handleOnline = () => checkActualConnectivity();
    const handleOffline = () => setNetworkStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const networkInterval = setInterval(checkActualConnectivity, 30000);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(networkInterval);
      clearInterval(timer);
    };
  }, []);

  // --- UI HELPERS ---
  const getStatusConfig = () => {
    switch (networkStatus) {
      case 'online': return { color: '#34C759', label: 'ONLINE', bg: 'rgba(52, 199, 89, 0.08)', icon: null };
      case 'no-internet': return { color: '#FFCC00', label: 'NO INTERNET', bg: 'rgba(255, 204, 0, 0.1)', icon: <AlertCircle size={10} /> };
      default: return { color: '#FF3B30', label: 'OFFLINE', bg: 'rgba(255, 59, 48, 0.08)', icon: <WifiOff size={10} /> };
    }
  };

  const status = getStatusConfig();

  const SkeletonItem = ({ width, height, borderRadius = '12px', marginBottom = '0px' }) => (
    <div className="shimmer" style={{ 
      width, height, borderRadius, marginBottom,
      backgroundColor: darkMode ? '#1A1A1A' : '#EBEBEB',
      position: 'relative', overflow: 'hidden'
    }} />
  );

  if (loading && (!stats || stats.totalTasks === 0)) {
    return (
      <div style={{ padding: '20px', backgroundColor: colors.bg, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <SkeletonItem width="140px" height="24px" marginBottom="8px" />
            <SkeletonItem width="100px" height="14px" />
          </div>
          <SkeletonItem width="80px" height="28px" borderRadius="12px" />
        </div>
        <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '28px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <SkeletonItem width="100px" height="12px" marginBottom="12px" />
              <SkeletonItem width="80px" height="32px" />
            </div>
            <SkeletonItem width="40px" height="40px" borderRadius="12px" />
          </div>
          <div style={{ marginTop: '24px' }}>
            <SkeletonItem width="100%" height="8px" borderRadius="10px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <SkeletonItem width="100%" height="90px" borderRadius="24px" />
          <SkeletonItem width="100%" height="90px" borderRadius="24px" />
        </div>
        <style>{`
          .shimmer::after {
            content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}, transparent);
            animation: slide 1.5s infinite;
          }
          @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const hasTasks = stats?.totalTasks > 0;
  const isFullyComplete = hasTasks && stats.completedTasks === stats.totalTasks;
  const currentColor = !hasTasks ? colors.accent : isFullyComplete ? '#34C759' : stats.percentage < 35 ? '#FF3B30' : stats.percentage < 75 ? '#FFCC00' : '#34C759';

  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const allSorted = [...(todayClasses || [])].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
  
  const upcomingClasses = allSorted.filter(c => timeToMinutes(c.start_time) >= currentTotalMinutes);
  const pastClasses = allSorted.filter(c => timeToMinutes(c.start_time) < currentTotalMinutes);

  const nextClass = upcomingClasses[0];
  let timeToNextStr = '';
  if (nextClass) {
    const diff = timeToMinutes(nextClass.start_time) - currentTotalMinutes;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    timeToNextStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Late night study';
  const fullDateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(currentTime).toUpperCase();

  // Helper for rendering class cards to avoid repetition
  const renderClassCard = (item, isPast = false) => (
    <div key={item.id} style={{ 
      padding: isPast ? '14px 18px' : '18px', 
      backgroundColor: colors.card, 
      borderRadius: isPast ? '20px' : '22px', 
      border: `1px solid ${colors.border}`, 
      display: 'flex', 
      alignItems: 'center', 
      gap: '14px',
      opacity: isPast ? 0.6 : 1,
      marginBottom: '10px'
    }}>
      <div style={{ width: isPast ? '3px' : '4px', height: isPast ? '24px' : '36px', backgroundColor: isPast ? '#444' : (item.courses?.color || colors.accent), borderRadius: '10px' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: isPast ? '13px' : '15px', fontWeight: isPast ? '700' : '800', color: colors.text, textDecoration: isPast ? 'line-through' : 'none' }}>{item.courses?.name}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: '700' }}>
            <Clock size={12} color={isPast ? '#444' : colors.accent} /> 
            {isPast ? `Ended ${formatTime(item.start_time)}` : formatTime(item.start_time)}
          </div>
          {!isPast && item.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: '700' }}><MapPin size={12} color="#FF2D55" /> {item.location}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', paddingBottom: '120px', color: colors.text, backgroundColor: colors.bg, position: 'relative', minHeight: '100vh' }}>
      
      {/* 1. WELCOME HEADER */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.8px', margin: 0 }}>
            {greeting}, <span style={{ color: colors.accent }}>{userName || 'Scholar'}</span>
          </h1>
          <p style={{ color: '#666', margin: '2px 0 0 0', fontSize: '12px', fontWeight: '700' }}>
            {hasTasks ? (isFullyComplete ? "All items completed!" : `${stats.totalTasks - stats.completedTasks} tasks remaining.`) : "No pending tasks."}
          </p>
        </div>

        <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', 
            backgroundColor: status.bg, borderRadius: '12px',
            border: networkStatus === 'no-internet' ? '1px solid rgba(255, 204, 0, 0.2)' : 'none'
        }}>
          {status.icon}
          <div className={networkStatus === 'online' ? "pulse-dot" : ""} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }} />
          <span style={{ fontSize: '9px', fontWeight: '900', color: status.color }}>{status.label}</span>
        </div>
      </header>

      {/* 2. PROGRESS CARD */}
      <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '28px', border: `1px solid ${colors.border}`, marginBottom: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Zap size={12} color={currentColor} fill={currentColor} />
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#666' }}>{hasTasks ? 'CURRENT PROGRESS' : 'SYSTEM STATUS'}</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{hasTasks ? `${stats.percentage}%` : "READY"}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: currentColor }}>{hasTasks ? `${stats.completedTasks}/${stats.totalTasks}` : <Layout size={20} />}</span>
            <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', opacity: 0.4 }}>{hasTasks ? 'TASKS' : 'ACTIVE'}</p>
          </div>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: darkMode ? '#000' : '#F0F0F0', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
          <div style={{ width: hasTasks ? `${stats.percentage}%` : '0%', height: '100%', backgroundColor: currentColor, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        </div>
      </div>

      {/* 3. QUICK STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: colors.card, padding: '18px', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
            <BookOpen size={18} color={colors.accent} />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '8px 0 2px 0' }}>{stats?.courses || 0}</h3>
            <p style={{ fontSize: '9px', fontWeight: '800', color: '#666' }}>COURSES</p>
          </div>
          <div style={{ backgroundColor: colors.card, padding: '18px', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
            <Clock size={18} color="#FF9500" />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '8px 0 2px 0' }}>{stats?.totalTasks || 0}</h3>
            <p style={{ fontSize: '9px', fontWeight: '800', color: '#666' }}>ASSIGNMENTS</p>
          </div>
      </div>

      {/* 4. UPCOMING SCHEDULE */}
      <div style={{ marginBottom: '12px', padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '900', color: colors.text, letterSpacing: '1px', margin: 0 }}>TODAY'S SCHEDULE</h3>
          <span style={{ fontSize: '10px', fontWeight: '800', color: colors.accent }}>{fullDateStr}</span>
        </div>
        {nextClass && <div style={{ fontSize: '10px', fontWeight: '800', color: colors.accent, marginTop: '4px' }}>Next: {nextClass.courses?.name} in {timeToNextStr}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {upcomingClasses.length > 0 ? (
          <>
            {/* Always show first 3 */}
            {upcomingClasses.slice(0, 3).map((item) => renderClassCard(item))}
            
            {/* Smooth Expandable Section */}
            <div className={`expandable-content ${isExpanded ? 'is-open' : ''}`}>
               {upcomingClasses.slice(3).map((item) => renderClassCard(item))}
            </div>

            {upcomingClasses.length > 3 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: '800', fontSize: '11px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '0 auto', cursor: 'pointer' }}
              >
                {isExpanded ? <>SHOW LESS <ChevronUp size={14}/></> : <>SHOW {upcomingClasses.length - 3} MORE <ChevronDown size={14}/></>}
              </button>
            )}
          </>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', border: `2px dashed ${colors.border}`, borderRadius: '24px' }}>
            <ClipboardList size={24} color="#666" style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ color: '#666', fontSize: '11px', fontWeight: '800', margin: 0 }}>NO CLASSES REMAINING TODAY</p>
          </div>
        )}
      </div>

      {/* 5. PAST CLASSES */}
      {pastClasses.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#666', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '4px' }}>PAST CLASSES</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pastClasses.slice(0, 2).map((item) => renderClassCard(item, true))}
            
            <div className={`expandable-content ${isPastExpanded ? 'is-open' : ''}`}>
               {pastClasses.slice(2).map((item) => renderClassCard(item, true))}
            </div>

            {pastClasses.length > 2 && (
              <button 
                onClick={() => setIsPastExpanded(!isPastExpanded)} 
                style={{ background: 'none', border: 'none', color: '#666', fontWeight: '800', fontSize: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '0 auto', cursor: 'pointer' }}
              >
                {isPastExpanded ? <>HIDE RECENT <ChevronUp size={12}/></> : <>SHOW {pastClasses.length - 2} PAST <ChevronDown size={12}/></>}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseGreen { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
        .pulse-dot { animation: pulseGreen 2s infinite; }
        
        /* Smooth Animation Logic */
        .expandable-content {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          pointer-events: none;
        }
        
        .expandable-content.is-open {
          max-height: 1000px; /* Large enough to hold content */
          opacity: 1;
          pointer-events: auto;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default Home;