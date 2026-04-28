import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { Globe, RefreshCw, AlertCircle } from 'lucide-react'; 
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
import Tutorial from './pages/Tutorial';
import About from './pages/About'; 
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/AdminFeedback'; // --- IMPORTED ADMIN FEEDBACK ---

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true); 
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true); 
  const [accentColor, setAccentColor] = useState('#007AFF'); // Default Blue
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); 
  const [isRetrying, setIsRetrying] = useState(false); 
  const [retryError, setRetryError] = useState(false); 
  
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fullTimetable, setFullTimetable] = useState([]); 
  const [userName, setUserName] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, courses: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  // New State for Onboarding
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // --- SCROLL TO TOP LOGIC ---
  useEffect(() => {
    window.scrollTo(0, 0);
    const contentElement = document.querySelector('.main-content');
    if (contentElement) {
      contentElement.scrollTop = 0;
    }
  }, [activeTab]);

  // --- INTERNET CONNECTIVITY LOGIC ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryError(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryError(false);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
        setRetryError(true);
        setTimeout(() => setRetryError(false), 3000);
      }
    }, 1500);
  };

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
      if (event === "USER_UPDATED") setIsRecoveringPassword(false);
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
        if (data.theme_color) setAccentColor(data.theme_color); 
        if (data.full_name) setUserName(data.full_name.split(' ')[0]);
        
        if (data.has_seen_onboarding === false) {
          setShowWelcomeModal(true);
        }
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

  const updateAccentColor = async (newColor) => {
    setAccentColor(newColor); 
    if (session?.user?.id) {
      await supabase.from('profiles').update({ theme_color: newColor }).eq('id', session.user.id);
    }
  };

  // --- ONBOARDING LOGIC ---
  const handleDismissOnboarding = async (startTutorial = false) => {
    setShowWelcomeModal(false);
    if (session?.user?.id) {
      await supabase.from('profiles').update({ has_seen_onboarding: true }).eq('id', session.user.id);
    }
    if (startTutorial) {
      setActiveTab('tutorial');
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
    accent: accentColor,
    danger: '#FF3B30',
    muted: darkMode ? '#888888' : '#666666'
  }), [darkMode, accentColor]);

  if (initializing) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }} />;

  if (!isOnline) {
    return (
      <div style={{ 
        backgroundColor: '#000000', color: '#FFFFFF', height: '100vh', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', textAlign: 'center', padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{ 
          position: 'absolute', top: '40px', 
          transform: `translateY(${retryError ? '0' : '-100px'})`,
          opacity: retryError ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          backgroundColor: '#FF3B30', color: '#FFF', 
          padding: '12px 20px', borderRadius: '14px', 
          display: 'flex', alignItems: 'center', gap: '8px', 
          fontSize: '14px', fontWeight: '700', boxShadow: '0 10px 30px rgba(255, 59, 48, 0.3)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> No internet connection detected</span>
        </div>

        <div style={{ 
          width: '80px', height: '80px', backgroundColor: `${accentColor}22`, 
          borderRadius: '24px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', marginBottom: '32px' 
        }}>
          <Globe size={40} color={accentColor} strokeWidth={1.5} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
          No Internet Connection
        </h2>
        
        <p style={{ color: '#888', fontSize: '15px', fontWeight: '500', lineHeight: '1.5', maxWidth: '280px', margin: '0 0 32px 0' }}>
          Please check your connection to continue using Focus Forge.
        </p>
        
        <button 
          onClick={handleRetry}
          disabled={isRetrying}
          className={retryError ? 'shake' : ''}
          style={{ 
            width: '100%', maxWidth: '280px', padding: '16px', 
            backgroundColor: retryError ? '#FF3B30' : accentColor, 
            color: '#FFFFFF', border: 'none', borderRadius: '16px', 
            fontSize: '16px', fontWeight: '700', 
            cursor: isRetrying ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            gap: '10px', transition: 'all 0.3s ease'
          }}
        >
          {isRetrying ? (
            <RefreshCw size={20} className="spinner-anim" />
          ) : (
            retryError ? 'Try Again' : 'Retry Connection'
          )}
        </button>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .spinner-anim { animation: spin 1s linear infinite; }
          .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        `}</style>
      </div>
    );
  }

  if (isRecoveringPassword) return <Auth forceRecovery={true} />; 
  if (!session) return <Auth />;

  return (
    <div className={`app-shell ${darkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh' }}>
      
      {showWelcomeModal && (
        <WelcomeModal 
          userName={userName} 
          theme={theme} 
          onSkip={() => handleDismissOnboarding(false)} 
          onGoToTutorial={() => handleDismissOnboarding(true)} 
        />
      )}

      <div className="mobile-container">
        <main className="main-content" style={{ paddingBottom: '80px' }}>
          
          {activeTab === 'home' && (
            <>
              <Header title="Focus Forge" showThemeToggle={true} darkMode={darkMode} setDarkMode={toggleTheme} theme={theme} />
              <Home 
                userId={session?.user?.id} userName={userName} stats={stats}
                todayClasses={todayClasses} loading={loading} theme={theme} 
                darkMode={darkMode} refreshData={fetchAllData}
              />
            </>
          )}

          {activeTab === 'tasks' && (
            <Tasks 
              assignments={assignments} courses={courses} loading={loading} 
              theme={theme} darkMode={darkMode} refreshData={fetchAllData} 
            />
          )}

          {activeTab === 'profile' && (
            <Profile 
              setActiveTab={setActiveTab} theme={theme} darkMode={darkMode} 
              stats={stats} userName={userName} profileData={profileData} loading={loading} 
            />
          )}

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
            <Settings 
                setActiveTab={setActiveTab} 
                theme={theme} 
                darkMode={darkMode} 
                toggleTheme={toggleTheme} 
                onUpdateAccent={updateAccentColor}
            />
          )}

          {activeTab === 'privacy-security' && (
            <PrivacySecurity onBack={() => setActiveTab('config')} theme={theme} />
          )}

          {activeTab === 'tutorial' && (
            <Tutorial 
              theme={theme} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'about' && (
            <About 
              setActiveTab={setActiveTab} 
              theme={theme} 
            />
          )}

          {activeTab === 'feedback' && (
            <Feedback 
              setActiveTab={setActiveTab} 
              theme={theme} 
              profileData={profileData}
            />
          )}

          {/* --- ADMIN FEEDBACK TAB REGISTRATION --- */}
          {activeTab === 'admin-feedback' && (
            <AdminFeedback 
              setActiveTab={setActiveTab} 
              theme={theme} 
            />
          )}
          
        </main>

        <footer className="nav-wrapper" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, zIndex: 1000 }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </footer>
      </div>
    </div>
  );
}

function WelcomeModal({ userName, theme, onSkip, onGoToTutorial }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', 
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
      padding: '24px', backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        backgroundColor: theme.card, width: '100%', maxWidth: '340px', 
        borderRadius: '32px', border: `1px solid ${theme.border}`, 
        padding: '32px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>👋</div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>
          Welcome, {userName || 'Scholar'}!
        </h2>
        <p style={{ color: theme.muted, fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Ready to sharpen your productivity? Take a quick tour of Focus Forge to get started.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={onGoToTutorial}
            style={{ 
              padding: '16px', borderRadius: '16px', border: 'none', 
              backgroundColor: theme.accent, color: '#fff', fontWeight: '800', cursor: 'pointer' 
            }}
          >
            GO TO TUTORIAL
          </button>
          <button 
            onClick={onSkip}
            style={{ 
              padding: '16px', borderRadius: '16px', border: `1px solid ${theme.border}`, 
              backgroundColor: 'transparent', color: theme.text, fontWeight: '700', cursor: 'pointer' 
            }}
          >
            SKIP FOR NOW
          </button>
        </div>
        <p style={{ fontSize: '10px', color: theme.muted, marginTop: '20px', fontWeight: '600' }}>
          TUTORIAL CAN ALWAYS BE REVISITED IN THE PROFILE PAGE
        </p>
      </div>
    </div>
  );
}

export default App;