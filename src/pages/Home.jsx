import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Clock, Zap, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

const Home = ({ theme, darkMode, userId }) => {
  const [stats, setStats] = useState({ 
    totalTasks: 0, 
    completedTasks: 0, 
    courses: 0,
    percentage: 0 
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const getProgressColor = (percent, total) => {
    if (total === 0) return '#007AFF'; 
    if (percent < 35) return '#FF3B30'; 
    if (percent < 75) return '#FFCC00'; 
    return '#34C759'; 
  };

  const currentColor = getProgressColor(stats.percentage, stats.totalTasks);

  const hour = new Date().getHours();
  let greeting = 'Welcome back';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 22) greeting = 'Good evening';
  else greeting = 'Late night study';

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const fullDateStr = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  }).format(new Date()).toUpperCase();

  const fetchDashboardData = useCallback(async () => {
    try {
      let activeId = userId;
      if (!activeId) {
        const { data: { user } } = await supabase.auth.getUser();
        activeId = user?.id;
      }

      if (activeId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', activeId)
          .single();
        
        if (profile?.full_name) {
          const firstName = profile.full_name.split(' ')[0];
          setUserName(firstName);
        }
      }

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

      setStats({
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        courses: courseCount || 0,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      });

      if (schedule) setTodayClasses(schedule);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [todayName, userId]);

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => fetchDashboardData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchDashboardData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData]);

  if (loading) return <div style={{ padding: '20px', backgroundColor: theme?.bg }} />;

  return (
    <div style={{ padding: '15px', paddingBottom: '100px', color: theme?.text }}>
      
      {/* 1. WELCOME SECTION */}
      <header style={{ marginBottom: '20px', textAlign: 'left', marginTop: '5px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.3px', margin: 0, display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{ whiteSpace: 'nowrap', opacity: 0.8 }}>{greeting},</span>
          <span style={{ color: '#007AFF', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
            {userName || 'Scholar'}
          </span>
        </h1>
        <p style={{ color: darkMode ? '#777' : '#666', margin: 0, fontSize: '12px', fontWeight: '700' }}>
          {stats.totalTasks > 0 ? (
            <>You have <span style={{ color: '#007AFF' }}>{stats.totalTasks - stats.completedTasks} tasks</span> remaining.</>
          ) : (
            "Nothing pending for today."
          )}
        </p>
      </header>

      {/* 2. PROGRESS CARD */}
      <div style={{ 
        backgroundColor: theme?.card, padding: '22px', borderRadius: '24px', border: `1.5px solid ${theme?.border}`,
        marginBottom: '15px', boxShadow: `0 8px 25px ${currentColor}10`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Zap size={12} color={currentColor} fill={currentColor} />
              <span style={{ fontSize: '9px', fontWeight: '800', color: darkMode ? '#777' : '#555', letterSpacing: '1px' }}>STATUS</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: theme?.text }}>
               {stats.totalTasks > 0 ? `${stats.percentage}%` : "ALL CLEAR"}
            </h2>
            <p style={{ color: darkMode ? '#777' : '#555', fontWeight: '700', fontSize: '11px', margin: 0 }}>
              {stats.totalTasks > 0 ? "Completion Rate" : "Everything is done"}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', fontWeight: '900', color: currentColor }}>
                {stats.totalTasks > 0 ? `${stats.completedTasks}/${stats.totalTasks}` : <CheckCircle2 size={18} />}
              </span>
          </div>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: darkMode ? '#111' : '#F0F0F0', borderRadius: '10px', marginTop: '18px', overflow: 'hidden' }}>
          <div style={{ width: stats.totalTasks > 0 ? `${stats.percentage}%` : '0%', height: '100%', backgroundColor: currentColor, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
      </div>

      {/* 3. QUICK STATS BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
          <div style={{ backgroundColor: theme.card, padding: '16px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
            <BookOpen size={16} color="#5856D6" />
            <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '6px 0 2px 0' }}>{stats.courses}</h3>
            <p style={{ fontSize: '8px', fontWeight: '800', color: darkMode ? '#777' : '#555', textTransform: 'uppercase', margin: 0 }}>Courses</p>
          </div>
          <div style={{ backgroundColor: theme.card, padding: '16px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
            <Clock size={16} color="#FF9500" />
            <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '6px 0 2px 0' }}>{stats.totalTasks}</h3>
            <p style={{ fontSize: '8px', fontWeight: '800', color: darkMode ? '#777' : '#555', textTransform: 'uppercase', margin: 0 }}>Assignments</p>
          </div>
      </div>

      {/* 4. TODAY'S SCHEDULE SECTION */}
      <div style={{ marginBottom: '10px', padding: '0 5px' }}>
        <h3 style={{ fontSize: '10px', fontWeight: '900', color: theme?.text, letterSpacing: '0.5px', margin: 0 }}>
          TODAY'S SCHEDULE <span style={{ color: '#007AFF', fontWeight: '900' }}>— {fullDateStr}</span>
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {todayClasses.length > 0 ? (
          todayClasses.map((item) => (
            <div key={item.id} style={{ padding: '16px', backgroundColor: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '3px', height: '30px', backgroundColor: item.courses?.color || '#333', borderRadius: '10px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: theme.text, marginBottom: '2px' }}>{item.courses?.name || 'Unknown Subject'}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#777', fontWeight: '700' }}><Clock size={10} color="#007AFF" /> {item.start_time?.slice(0, 5)}</div>
                  {item.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#777', fontWeight: '700' }}><MapPin size={10} color="#FF2D55" /> {item.location}</div>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '25px 20px', textAlign: 'center', border: `1.5px dashed ${theme.border}`, borderRadius: '20px', opacity: 0.8 }}>
            <p style={{ color: darkMode ? '#777' : '#666', fontSize: '11px', fontWeight: '800', margin: 0 }}>NO CLASSES TODAY</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;