import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserCircle, BookOpen, Settings, ChevronRight, Clock, LogOut, UserCog, BarChart3, Info } from 'lucide-react';
import { supabase } from '../supabaseClient';

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
    card: theme?.card || '#111111',
    bg: theme?.bg || '#000',
    border: theme?.border || '#222222',
    accent: '#007AFF'
  };

  const getFontSize = (name) => {
    const length = name?.length || 0;
    if (length > 25) return '18px';
    if (length > 15) return '20px';
    return '22px';
  };

  const fetchStats = useCallback(async () => {
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const newStats = { courses: courseCount || 0, assignments: pendingCount || 0 };
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
    const channel = supabase.channel('profile_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (p) => {
        if (userIdRef.current && p.new.id === userIdRef.current) setProfile(p.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchStats())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchUserData, fetchStats]);

  const handleLogout = async () => await supabase.auth.signOut();

  if (loading) return (
    <div style={{ padding: '20px', backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
        <SkeletonPulse colors={colors} style={{ width: '100px', height: '100px', borderRadius: '20px', marginBottom: '20px' }} />
        <SkeletonPulse colors={colors} style={{ width: '140px', height: '22px', borderRadius: '4px' }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, padding: '32px', borderRadius: '24px', maxWidth: '300px', width: '85%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: '50%' }}>
                <Info color={colors.accent} size={32} />
              </div>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>See you soon!</h3>
            <p style={{ fontSize: '13px', opacity: 0.5, marginBottom: '24px', lineHeight: '1.4' }}>Ready to sign out of your account?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleLogout} style={{ padding: '14px', borderRadius: '14px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>SIGN OUT</button>
              <button onClick={() => setModalOpen(false)} style={{ padding: '14px', borderRadius: '14px', background: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>STAY LOGGED IN</button>
            </div>
          </div>
        </div>
      )}

      {/* USER SECTION */}
      <div style={{ textAlign: 'center', paddingTop: '35px', paddingBottom: '45px' }}>
        <div style={{ 
          width: '105px', height: '105px', borderRadius: '24px',
          backgroundColor: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', 
          border: `1.5px solid ${colors.accent}`, margin: '0 auto 20px', overflow: 'hidden', padding: '5px'
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden', backgroundColor: colors.bg }}>
            {avatarMap[profile.avatar_id] ? (
              <img src={avatarMap[profile.avatar_id]} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <UserCircle size={45} style={{ opacity: 0.3, marginTop: '25px' }} />
            )}
          </div>
        </div>
        
        <h2 style={{ 
            fontSize: getFontSize(profile.full_name), fontWeight: '800', margin: '0 auto', 
            maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            letterSpacing: '0.2px', textTransform: 'uppercase'
        }}>
          {profile.full_name || 'STUDENT'}
        </h2>
        <p style={{ color: colors.accent, fontSize: '11px', fontWeight: '700', marginTop: '8px', opacity: 0.9, letterSpacing: '1.5px' }}>
          {profile.matric_no || 'NO ID SET'}
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
        <StatCard icon={<BarChart3 size={18} color="#5856D6" />} value={stats.courses} label="Courses" colors={colors} />
        <StatCard icon={<BookOpen size={18} color="#34C759" />} value={stats.assignments} label="Tasks" colors={colors} />
      </div>

      {/* MENU BUTTONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <MenuButton icon={<UserCog size={18} color="#AF52DE" />} label="Edit Profile" onClick={() => setActiveTab('edit-profile')} colors={colors} />
        <MenuButton icon={<BookOpen size={18} color="#007AFF" />} label="Course Manager" onClick={() => setActiveTab('course-manager')} colors={colors} />
        <MenuButton icon={<Clock size={18} color="#FF9500" />} label="Timetable" onClick={() => setActiveTab('schedule-manager')} colors={colors} />
        <MenuButton icon={<Settings size={18} color="#E5E5EA" />} label="Settings" onClick={() => setActiveTab('config')} colors={colors} />
      </div>

      <button onClick={() => setModalOpen(true)} style={logoutStyle}>
        SIGN OUT OF ACCOUNT
      </button>

      <style>{`
        .stat-card { transition: transform 0.1s ease; cursor: pointer; }
        .stat-card:active { transform: scale(0.96); }
        
        .menu-btn { transition: all 0.15s ease; border: 1px solid transparent; }
        .menu-btn:active { transform: scale(0.98); background-color: #161616 !important; }
        
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, value, label, colors }) => (
  <div className="stat-card" style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
    <div style={{ marginBottom: '8px' }}>{icon}</div>
    <span style={{ fontSize: '28px', fontWeight: '800', display: 'block', margin: '4px 0' }}>{value}</span>
    <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
  </div>
);

const MenuButton = ({ icon, label, onClick, colors }) => (
  <button className="menu-btn" onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', 
    backgroundColor: colors.card, border: `1px solid ${colors.border}`, 
    borderRadius: '18px', cursor: 'pointer', gap: '16px' 
  }}>
    <div style={{ 
      backgroundColor: 'rgba(255,255,255,0.03)', 
      padding: '10px', 
      borderRadius: '12px', 
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
  width: '100%', marginTop: '50px', padding: '16px', border: 'none', background: 'transparent',
  color: '#FF3B30', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
  letterSpacing: '1.2px', opacity: 0.6
};

export default Profile;