import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Zap, MapPin, ClipboardList, Layout, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const Home = ({ theme, darkMode, userName, stats, todayClasses, loading, refreshData }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPastExpanded, setIsPastExpanded] = useState(false);

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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  // --- LOGIC FOR STATES ---
  const hasTasks = stats?.totalTasks > 0;
  const isFullyComplete = hasTasks && stats.completedTasks === stats.totalTasks;
  const currentColor = !hasTasks ? '#007AFF' : isFullyComplete ? '#34C759' : stats.percentage < 35 ? '#FF3B30' : stats.percentage < 75 ? '#FFCC00' : '#34C759';

  // --- SORTING & SECTIONING ---
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

  if (loading && (!stats || stats.totalTasks === 0)) {
    return <div style={{ padding: '20px', backgroundColor: theme?.bg, minHeight: '100vh' }} className="skeleton" />;
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '120px', color: theme?.text, backgroundColor: theme?.bg, position: 'relative' }}>
      
      {/* 1. WELCOME HEADER */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.8px', margin: 0 }}>
            {greeting}, <span style={{ color: '#007AFF' }}>{userName || 'Scholar'}</span>
          </h1>
          <p style={{ color: '#666', margin: '2px 0 0 0', fontSize: '12px', fontWeight: '700' }}>
            {hasTasks ? (isFullyComplete ? "All items completed!" : `${stats.totalTasks - stats.completedTasks} tasks remaining.`) : "No pending tasks."}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: isOnline ? 'rgba(52, 199, 89, 0.08)' : 'rgba(255, 59, 48, 0.08)', borderRadius: '12px' }}>
          <div className={isOnline ? "pulse-dot" : ""} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnline ? '#34C759' : '#FF3B30' }} />
          <span style={{ fontSize: '9px', fontWeight: '900', color: isOnline ? '#34C759' : '#FF3B30' }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </header>

      {/* 2. PROGRESS CARD */}
      <div style={{ backgroundColor: theme?.card, padding: '24px', borderRadius: '28px', border: `1px solid ${theme?.border}`, marginBottom: '16px', position: 'relative', zIndex: 10 }}>
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
          <div style={{ backgroundColor: theme?.card, padding: '18px', borderRadius: '24px', border: `1px solid ${theme?.border}` }}>
            <BookOpen size={18} color="#5856D6" />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '8px 0 2px 0' }}>{stats?.courses || 0}</h3>
            <p style={{ fontSize: '9px', fontWeight: '800', color: '#666' }}>COURSES</p>
          </div>
          <div style={{ backgroundColor: theme?.card, padding: '18px', borderRadius: '24px', border: `1px solid ${theme?.border}` }}>
            <Clock size={18} color="#FF9500" />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '8px 0 2px 0' }}>{stats?.totalTasks || 0}</h3>
            <p style={{ fontSize: '9px', fontWeight: '800', color: '#666' }}>ASSIGNMENTS</p>
          </div>
      </div>

      {/* 4. UPCOMING SCHEDULE */}
      <div style={{ marginBottom: '12px', padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '900', color: theme?.text, letterSpacing: '1px', margin: 0 }}>TODAY'S SCHEDULE</h3>
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#007AFF' }}>{fullDateStr}</span>
        </div>
        {nextClass && <div style={{ fontSize: '10px', fontWeight: '800', color: '#007AFF', marginTop: '4px' }}>Next: {nextClass.courses?.name} in {timeToNextStr}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {upcomingClasses.length > 0 ? (
          <>
            {upcomingClasses.slice(0, 3).map((item) => (
              <div key={item.id} style={{ padding: '18px', backgroundColor: theme?.card, borderRadius: '22px', border: `1px solid ${theme?.border}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '4px', height: '36px', backgroundColor: item.courses?.color || '#333', borderRadius: '10px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: theme?.text }}>{item.courses?.name}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: '700' }}><Clock size={12} color="#007AFF" /> {formatTime(item.start_time)}</div>
                    {item.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: '700' }}><MapPin size={12} color="#FF2D55" /> {item.location}</div>}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ 
              maxHeight: isExpanded ? '1000px' : '0px', 
              opacity: isExpanded ? 1 : 0, 
              overflow: 'hidden', 
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', gap: '10px' 
            }}>
              {upcomingClasses.slice(3).map((item) => (
                <div key={item.id} style={{ padding: '18px', backgroundColor: theme?.card, borderRadius: '22px', border: `1px solid ${theme?.border}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '4px', height: '36px', backgroundColor: item.courses?.color || '#333', borderRadius: '10px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: theme?.text }}>{item.courses?.name}</div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: '700' }}><Clock size={12} color="#007AFF" /> {formatTime(item.start_time)}</div>
                      {item.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: '700' }}><MapPin size={12} color="#FF2D55" /> {item.location}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {upcomingClasses.length > 3 && (
              <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'none', border: 'none', color: '#007AFF', fontWeight: '800', fontSize: '11px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '0 auto' }}>
                {isExpanded ? <>SHOW LESS <ChevronUp size={14}/></> : <>SHOW {upcomingClasses.length - 3} MORE <ChevronDown size={14}/></>}
              </button>
            )}
          </>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', border: `2px dashed ${theme?.border}`, borderRadius: '24px' }}>
            <ClipboardList size={24} color="#666" style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ color: '#666', fontSize: '11px', fontWeight: '800', margin: 0 }}>NO CLASSES REMAINING TODAY</p>
          </div>
        )}
      </div>

      {/* 5. PAST CLASSES (with Expand Function) */}
      {pastClasses.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#666', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '4px' }}>PAST CLASSES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Show first 3 past classes */}
            {pastClasses.slice(0, 3).map((item) => (
              <div key={item.id} style={{ padding: '14px 18px', backgroundColor: theme?.card, borderRadius: '20px', border: `1px solid ${theme?.border}`, display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.5 }}>
                <div style={{ width: '3px', height: '24px', backgroundColor: '#888', borderRadius: '10px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: theme?.text, textDecoration: 'line-through' }}>{item.courses?.name}</div>
                  <div style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>Ended {formatTime(item.start_time)}</div>
                </div>
              </div>
            ))}

            {/* Collapsible section for additional past classes */}
            <div style={{ 
              maxHeight: isPastExpanded ? '1000px' : '0px', 
              opacity: isPastExpanded ? 1 : 0, 
              overflow: 'hidden', 
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', gap: '10px' 
            }}>
              {pastClasses.slice(3).map((item) => (
                <div key={item.id} style={{ padding: '14px 18px', backgroundColor: theme?.card, borderRadius: '20px', border: `1px solid ${theme?.border}`, display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.5 }}>
                  <div style={{ width: '3px', height: '24px', backgroundColor: '#888', borderRadius: '10px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: theme?.text, textDecoration: 'line-through' }}>{item.courses?.name}</div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>Ended {formatTime(item.start_time)}</div>
                  </div>
                </div>
              ))}
            </div>

            {pastClasses.length > 3 && (
              <button onClick={() => setIsPastExpanded(!isPastExpanded)} style={{ background: 'none', border: 'none', color: '#666', fontWeight: '800', fontSize: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '0 auto' }}>
                {isPastExpanded ? <>HIDE OLDER <ChevronUp size={12}/></> : <>VIEW {pastClasses.length - 3} MORE PAST <ChevronDown size={12}/></>}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseGreen { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
        .pulse-dot { animation: pulseGreen 2s infinite; }
      `}</style>
    </div>
  );
};

export default Home;