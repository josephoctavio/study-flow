import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserCircle, BookOpen, Settings, ChevronRight, Clock, LogOut, UserCog, BarChart3, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Updated Avatar Map using your Supabase Storage URLs
const BASE_URL = "https://hcdgxxcjmamrlojhshxa.supabase.co/storage/v1/object/public/avatars/";

const avatarMap = {
  av1: `${BASE_URL}av1.png`,
  av2: `${BASE_URL}av2.png`,
  av3: `${BASE_URL}av3.png`,
  av4: `${BASE_URL}av4.png`,
  av5: `${BASE_URL}av5.png`,
  av6: `${BASE_URL}av6.png`,
  av7: `${BASE_URL}av7.png`,
  av8: `${BASE_URL}av8.png`,
  av9: `${BASE_URL}av9.png`,
  av10: `${BASE_URL}av10.png`,
  av11: `${BASE_URL}av11.png`,
  av12: `${BASE_URL}av12.png`,
};

// Reusable animated skeleton block
const SkeletonPulse = ({ style, colors }) => (
  <div style={{
    backgroundColor: colors.card,
    animation: 'pulse 1.5s infinite ease-in-out',
    ...style
  }} />
);

const Profile = ({ setActiveTab, theme }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ id: '', full_name: '', matric_no: '', avatar_id: 'av1' });
  const [stats, setStats] = useState({ courses: 0, assignments: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  
  const prevStats = useRef({ courses: 0, assignments: 0 });
  const userIdRef = useRef(null);

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#1c1c1e',
    bg: theme?.bg || '#000',
    border: theme?.border || '#2c2c2e',
    accent: '#007AFF'
  };

  const fetchStats = useCallback(async () => {
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const newStats = { 
      courses: courseCount || 0, 
      assignments: pendingCount || 0 
    };
    setStats(newStats);
    setTimeout(() => { prevStats.current = newStats; }, 1000);
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      userIdRef.current = user.id;

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchUserData();

    const channel = supabase
      .channel('profile_realtime_sync')
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
        (payload) => {
          if (userIdRef.current && payload.new.id === userIdRef.current) {
            setProfile(payload.new); 
          }
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUserData, fetchStats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // NEW SKELETON LOADING STATE
  if (loading) return (
    <div style={{ padding: '20px', backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '120px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0 30px' }}>
        <SkeletonPulse colors={colors} style={{ width: '110px', height: '110px', borderRadius: '40px', marginBottom: '20px' }} />
        <SkeletonPulse colors={colors} style={{ width: '180px', height: '26px', borderRadius: '8px', marginBottom: '10px' }} />
        <SkeletonPulse colors={colors} style={{ width: '100px', height: '24px', borderRadius: '12px' }} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '35px' }}>
        <SkeletonPulse colors={colors} style={{ height: '100px', borderRadius: '24px' }} />
        <SkeletonPulse colors={colors} style={{ height: '100px', borderRadius: '24px' }} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonPulse key={i} colors={colors} style={{ height: '75px', borderRadius: '22px' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: '20px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '120px', animation: 'pageReveal 0.5s ease-out' }}>
      
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, padding: '30px', borderRadius: '32px', maxWidth: '320px', width: '100%', textAlign: 'center', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ backgroundColor: 'rgba(255,59,48,0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertTriangle color="#FF3B30" size={28} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>Sign Out?</h3>
            <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '25px', lineHeight: '1.5' }}>Your session will be ended securely.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>LOG OUT</button>
              <button onClick={() => setModalOpen(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, fontWeight: '700', cursor: 'pointer' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* USER INFO SECTION */}
      <div style={{ textAlign: 'center', padding: '40px 0 30px' }}>
        <div style={{ 
          width: '110px', height: '110px', borderRadius: '40px', backgroundColor: colors.card, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          border: `2.5px solid ${colors.accent}`,
          margin: '0 auto 20px', 
          boxShadow: `0 15px 35px rgba(0,122,255,0.2)`,
          position: 'relative',
          overflow: 'hidden' 
        }}>
          {avatarMap[profile.avatar_id] ? (
            <img 
                src={avatarMap[profile.avatar_id]} 
                alt="profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                // RISK FIX: Hides the broken image entirely so the UserCircle fallback underneath looks clean
                onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <UserCircle size={60} style={{ opacity: 0.9 }} />
          )}
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
          {profile.full_name || 'STUDENT USER'}
        </h2>
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(0,122,255,0.1)', padding: '6px 16px', borderRadius: '12px', marginTop: '10px', border: `1px solid rgba(0,122,255,0.1)` }}>
          <p style={{ color: colors.accent, fontSize: '11px', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>
            {profile.matric_no || 'ID NOT SET'}
          </p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '35px' }}>
        <StatCard icon={<BarChart3 size={18} color={colors.accent} />} value={stats.courses} label="Courses" colors={colors} isNew={stats.courses !== prevStats.current.courses} />
        <StatCard icon={<BookOpen size={18} color="#34C759" />} value={stats.assignments} label="Pending Tasks" colors={colors} isNew={stats.assignments !== prevStats.current.assignments} />
      </div>

      {/* NAVIGATION MENU */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <MenuButton icon={<UserCog size={22} color="#AF52DE" />} label="Edit Profile" desc="Change character or identity" onClick={() => setActiveTab('edit-profile')} colors={colors} />
        <MenuButton icon={<BookOpen size={22} color="#007AFF" />} label="Course Manager" desc="Subjects & Lecturers" onClick={() => setActiveTab('course-manager')} colors={colors} />
        <MenuButton icon={<Clock size={22} color="#34C759" />} label="Timetable" desc="Class schedules" onClick={() => setActiveTab('schedule-manager')} colors={colors} />
        <MenuButton icon={<Settings size={22} color="#8E8E93" />} label="Settings" desc="App preferences" onClick={() => setActiveTab('config')} colors={colors} />
      </div>

      <button onClick={() => setModalOpen(true)} style={logoutStyle}>
        <LogOut size={16} /> SIGN OUT OF ACCOUNT
      </button>

      <style>{`
        @keyframes pageReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .stat-bump { animation: bump 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes bump { 
          0% { transform: scale(1); }
          50% { transform: scale(1.2); color: #007AFF; }
          100% { transform: scale(1); }
        }
        .menu-btn { transition: all 0.2s ease; }
        .menu-btn:active { transform: scale(0.97); opacity: 0.7; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, value, label, colors, isNew }) => (
  <div style={{ backgroundColor: colors.card, padding: '22px', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
    {icon}
    <span className={isNew ? "stat-bump" : ""} style={{ fontSize: '32px', fontWeight: '900', display: 'block', margin: '4px 0' }}>{value}</span>
    <span style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
  </div>
);

const MenuButton = ({ icon, label, desc, onClick, colors }) => (
  <button className="menu-btn" onClick={onClick} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '18px', backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '22px', cursor: 'pointer', textAlign: 'left', gap: '16px' }}>
    <div style={{ backgroundColor: colors.bg, padding: '10px', borderRadius: '15px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <span style={{ display: 'block', fontWeight: '800', fontSize: '16px', color: colors.text }}>{label}</span>
      <span style={{ display: 'block', fontSize: '11px', color: colors.text, opacity: 0.4, fontWeight: '600', marginTop: '2px' }}>{desc}</span>
    </div>
    <ChevronRight size={18} style={{ opacity: 0.2 }} />
  </button>
);

const logoutStyle = {
  width: '100%', marginTop: '40px', padding: '16px', border: 'none', background: 'transparent',
  color: '#FF3B30', fontWeight: '900', fontSize: '11px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '1px'
};

export default Profile;