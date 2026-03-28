import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

// Components
import Auth from './components/Auth';
import BottomNav from './components/BottomNav';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CourseManager from './pages/CourseManager';
import ScheduleManager from './pages/ScheduleManager';
import Settings from './pages/Settings';
import PrivacySecurity from './pages/PrivacySecurity'; 

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true); 
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true); 
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Track internet status
  
  // Shared Data State
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fullTimetable, setFullTimetable] = useState([]); 
  const [userName, setUserName] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, courses: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  // --- INTERNET CONNECTIVITY LOGIC ---
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

  // --- AUTH LOGIC ---
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsRecoveringPassword(true);
      setInitializing(false);
      return; 
    }

    const checkInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setInitializing(false);
    };

    checkInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setIsRecoveringPassword(true); 
      
      if (event === "USER_UPDATED") {
        setIsRecoveringPassword(false);
      }
      
      if (event === "SIGNED_OUT") {
        setIsRecoveringPassword(false);
        setActiveTab('home'); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- THEME & PREFERENCES ---
  const fetchUserPreferences = useCallback(async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfileData(data);
        if (data.dark_mode !== null) setDarkMode(data.dark_mode);
        if (data.full_name) setUserName(data.full_name.split(' ')[0]);
      }
    } catch (err) { console.error("Error preferences:", err); }
  }, []);

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode); 
    if (session?.user?.id) {
      await supabase.from('profiles').update({ dark_mode: newMode }).eq('id', session.user.id);
    }
  };

  // --- GLOBAL DATA FETCHING ---
  const fetchAllData = useCallback(async () => {
    if (!session || isRecoveringPassword || !isOnline) return; 
    
    try {
      const [asgnRes, crsRes, schRes] = await Promise.all([
        supabase.from('assignments').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*'),
        supabase.from('timetable').select('*, courses(name, color)').order('start_time', { ascending: true }),
        fetchUserPreferences(session.user.id)
      ]);

      const tasks = asgnRes.data || [];
      const completed = tasks.filter(t => t.status === 'completed').length;
      
      setAssignments(tasks);
      setCourses(crsRes.data || []);
      setFullTimetable(schRes.data || []); 
      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        courses: crsRes.data?.length || 0,
        percentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [session, isRecoveringPassword, isOnline, fetchUserPreferences]);

  useEffect(() => {
    fetchAllData();
    const channel = supabase.channel('global-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAllData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAllData]);

  const todayClasses = useMemo(() => {
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    return fullTimetable.filter(item => item.day_of_week === todayName);
  }, [fullTimetable]);

  const theme = useMemo(() => ({
    bg: darkMode ? '#000000' : '#F5F5F7',
    text: darkMode ? '#FFFFFF' : '#000000',
    card: darkMode ? '#111111' : '#FFFFFF',
    border: darkMode ? '#222222' : '#E5E5E5',
    accent: '#007AFF',
    danger: '#FF3B30',
    muted: darkMode ? '#888888' : '#666666'
  }), [darkMode]);

  // --- RENDER LOGIC ---

  // 1. Initialization Guard
  if (initializing) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }} />;

  // 2. Offline Guard
  if (!isOnline) {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>🌐</div>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>No Internet Connection</h2>
        <p style={{ color: theme.muted, marginTop: '10px', maxWidth: '280px', lineHeight: '1.5' }}>
          Please check your connection to continue using StudyFlow.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '25px', padding: '12px 24px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // 3. Auth Guards
  if (isRecoveringPassword) return <Auth forceRecovery={true} />; 
  if (!session) return <Auth />;

  return (
    <div className={`app-shell ${darkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh' }}>
      <div className="mobile-container">
        <main className="main-content" style={{ paddingBottom: '80px' }}>
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <>
              <Header title="STUDYFLOW" showThemeToggle={true} darkMode={darkMode} setDarkMode={toggleTheme} theme={theme} />
              <Home 
                userId={session?.user?.id} userName={userName} stats={stats}
                todayClasses={todayClasses} loading={loading} theme={theme} 
                darkMode={darkMode} refreshData={fetchAllData}
              />
            </>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <Tasks 
              assignments={assignments} courses={courses} loading={loading} 
              theme={theme} darkMode={darkMode} refreshData={fetchAllData} 
            />
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Profile 
              setActiveTab={setActiveTab} theme={theme} darkMode={darkMode} 
              stats={stats} userName={userName} profileData={profileData} loading={loading} 
            />
          )}

          {/* SUB-PAGES */}
          {activeTab === 'edit-profile' && (
            <EditProfile onBack={() => setActiveTab('profile')} theme={theme} profileData={profileData} refreshData={fetchAllData} />
          )}

          {activeTab === 'course-manager' && (
            <CourseManager setActiveTab={setActiveTab} theme={theme} darkMode={darkMode} courses={courses} loading={loading} refreshData={fetchAllData} />
          )}

          {activeTab === 'schedule-manager' && (
            <ScheduleManager setActiveTab={setActiveTab} theme={theme} darkMode={darkMode} courses={courses} timetable={fullTimetable} loading={loading} refreshData={fetchAllData} />
          )}

          {activeTab === 'config' && (
            <Settings setActiveTab={setActiveTab} theme={theme} darkMode={darkMode} toggleTheme={toggleTheme} />
          )}

          {activeTab === 'privacy-security' && (
            <PrivacySecurity onBack={() => setActiveTab('config')} theme={theme} />
          )}
          
        </main>

        <footer className="nav-wrapper" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, zIndex: 1000 }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </footer>
      </div>
    </div>
  );
}

export default App;