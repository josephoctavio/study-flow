import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Clock, Zap, Calendar, MapPin } from 'lucide-react';

const Home = ({ theme, darkMode, userId }) => {
  const [stats, setStats] = useState({ 
    totalTasks: 0, 
    completedTasks: 0, 
    courses: 0,
    percentage: 0 
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Dynamic Color Logic ---
  const getProgressColor = (percent) => {
    if (percent < 35) return '#FF3B30'; // Urgent Red
    if (percent < 75) return '#FFCC00'; // Progress Yellow
    return '#34C759'; // Success Green
  };

  const currentColor = getProgressColor(stats.percentage);

  // Time-based greeting logic
  const hour = new Date().getHours();
  let greeting = 'Welcome back';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 22) greeting = 'Good evening';
  else greeting = 'Late night study session?';

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const fullDateStr = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  }).format(new Date()).toUpperCase();

  const fetchDashboardData = useCallback(async () => {
    try {
      let assignmentsQuery = supabase.from('assignments').select('*', { count: 'exact', head: true });
      let completedQuery = supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      let coursesQuery = supabase.from('courses').select('*', { count: 'exact', head: true });
      let scheduleQuery = supabase.from('timetable').select('*, courses(name, color)').eq('day_of_week', todayName).order('start_time', { ascending: true });

      const [
        { count: totalTasks },
        { count: completedTasks },
        { count: courseCount },
        { data: schedule }
      ] = await Promise.all([
        assignmentsQuery,
        completedQuery,
        coursesQuery,
        scheduleQuery
      ]);

      const total = totalTasks || 0;
      const completed = completedTasks || 0;
      
      setStats({
        totalTasks: total,
        completedTasks: completed,
        courses: courseCount || 0,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });

      if (schedule) setTodayClasses(schedule);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [todayName]);

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => fetchDashboardData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div style={{ padding: '15px', paddingBottom: '100px', backgroundColor: theme?.bg }}>
        <div style={{ width: '150px', height: '28px', backgroundColor: theme?.card, borderRadius: '8px', marginBottom: '8px', opacity: 0.7 }} />
        <div style={{ width: '220px', height: '16px', backgroundColor: theme?.card, borderRadius: '8px', marginBottom: '30px', opacity: 0.5 }} />
        <div style={{ height: '140px', backgroundColor: theme?.card, borderRadius: '24px', marginBottom: '15px', opacity: 0.6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
          <div style={{ height: '100px', backgroundColor: theme?.card, borderRadius: '20px', opacity: 0.6 }} />
          <div style={{ height: '100px', backgroundColor: theme?.card, borderRadius: '20px', opacity: 0.6 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', paddingBottom: '100px', color: theme?.text }}>
      
      {/* 1. WELCOME SECTION */}
      <header style={{ marginBottom: '20px', textAlign: 'left', marginTop: '5px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
          {greeting}
        </h1>
        <p style={{ color: darkMode ? '#666' : '#888', margin: 0, fontSize: '14px', fontWeight: '600' }}>
          You have <span style={{ color: '#007AFF', fontWeight: '800' }}>{stats.totalTasks - stats.completedTasks} assignments</span> remaining.
        </p>
      </header>

      {/* 2. PROGRESS CARD */}
      <div style={{ 
        backgroundColor: theme?.card, 
        padding: '25px', 
        borderRadius: '24px', 
        border: `1px solid ${theme?.border}`,
        marginBottom: '15px',
        boxShadow: `0 10px 30px ${currentColor}15`, // Subtle outer glow based on progress
        transition: '0.5s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={16} color={currentColor} fill={currentColor} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: darkMode ? '#888' : '#555', letterSpacing: '1px' }}>CURRENT FOCUS</span>
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '900', margin: 0, color: theme?.text }}>{stats.percentage}%</h2>
            <p style={{ color: darkMode ? '#888' : '#555', fontWeight: '700', fontSize: '13px', margin: 0 }}>Completion Rate</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <span style={{ fontSize: '13px', fontWeight: '800', color: currentColor }}>
               {stats.completedTasks}/{stats.totalTasks}
             </span>
          </div>
        </div>
        
        {/* Dynamic Progress Bar */}
        <div style={{ 
          width: '100%', height: '10px', 
          backgroundColor: darkMode ? '#111' : '#F0F0F0', 
          borderRadius: '10px', marginTop: '20px', overflow: 'hidden' 
        }}>
          <div style={{ 
            width: `${stats.percentage}%`, height: '100%', 
            backgroundColor: currentColor, 
            boxShadow: `0 0 12px ${currentColor}88`, // Inner glow
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease' 
          }} />
        </div>
      </div>

      {/* 3. QUICK STATS BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
          <div style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
            <BookOpen size={20} color="#5856D6" />
            <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '8px 0 2px 0' }}>{stats.courses}</h3>
            <p style={{ fontSize: '10px', fontWeight: '800', color: '#666', textTransform: 'uppercase', margin: 0 }}>Courses</p>
          </div>
          <div style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
            <Clock size={20} color="#FF9500" />
            <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '8px 0 2px 0' }}>{stats.totalTasks}</h3>
            <p style={{ fontSize: '10px', fontWeight: '800', color: '#666', textTransform: 'uppercase', margin: 0 }}>Assignments</p>
          </div>
      </div>

      {/* 4. TODAY'S SCHEDULE SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 5px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '900', color: theme?.text, letterSpacing: '0.5px', margin: 0 }}>
          TODAY'S SCHEDULE <span style={{ color: '#007AFF' }}>({fullDateStr})</span>
        </h3>
        <Calendar size={16} color={darkMode ? '#666' : '#444'} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {todayClasses.length > 0 ? (
          todayClasses.map((item) => (
            <div key={item.id} style={{ 
              padding: '20px', 
              backgroundColor: theme.card, 
              borderRadius: '24px', 
              border: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ width: '4px', height: '40px', backgroundColor: item.courses?.color || '#333', borderRadius: '10px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: theme.text, marginBottom: '4px' }}>
                  {item.courses?.name || 'Unknown Subject'}
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888', fontWeight: '600' }}>
                    <Clock size={14} color="#007AFF" /> {item.start_time?.slice(0, 5)}
                  </div>
                  {item.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888', fontWeight: '600' }}>
                      <MapPin size={14} color="#FF2D55" /> {item.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            border: `2px dashed ${theme.border}`, 
            borderRadius: '24px'
          }}>
            <p style={{ color: '#666', fontSize: '14px', fontWeight: '600', margin: 0 }}>NO CLASSES SCHEDULED FOR TODAY.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;