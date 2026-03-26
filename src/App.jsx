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
import PrivacySecurity from './pages/PrivacySecurity'; // <--- IMPORTED

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true); 
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true); 
  
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- AUTH LOGIC ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setInitializing(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- THEME SYNC LOGIC ---
  const fetchUserPreferences = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('dark_mode')
        .eq('id', userId)
        .single();

      if (data && data.dark_mode !== null) {
        setDarkMode(data.dark_mode);
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  }, []);

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode); 

    if (session?.user?.id) {
      await supabase
        .from('profiles')
        .update({ dark_mode: newMode })
        .eq('id', session.user.id);
    }
  };

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const [tasksResponse, coursesResponse] = await Promise.all([
        supabase.from('assignments').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*'),
        fetchUserPreferences(session.user.id)
      ]);

      if (tasksResponse.data) setAssignments(tasksResponse.data);
      if (coursesResponse.data) setCourses(coursesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [session, fetchUserPreferences]);

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session, fetchAllData]);

  // --- MEMOIZED THEME ---
  const theme = useMemo(() => ({
    bg: darkMode ? '#000000' : '#F5F5F7',
    text: darkMode ? '#FFFFFF' : '#000000',
    card: darkMode ? '#111111' : '#FFFFFF',
    border: darkMode ? '#222222' : '#E5E5E5'
  }), [darkMode]);

  if (initializing) {
    return <div style={{ backgroundColor: theme.bg, minHeight: '100vh' }} />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.bg }}>
      
      <div className="mobile-container" style={{ color: theme.text }}>
        
        <main className="main-content">
          {/* HOME PAGE */}
          {activeTab === 'home' && (
            <>
              <Header 
                title="STUDYFLOW" 
                showThemeToggle={true} 
                darkMode={darkMode} 
                setDarkMode={toggleTheme} 
                theme={theme} 
              />
              <Home 
                userId={session?.user?.id}
                assignments={assignments} 
                loading={loading} 
                theme={theme} 
                darkMode={darkMode} 
              />
            </>
          )}

          {/* TASKS PAGE */}
          {activeTab === 'tasks' && (
            <Tasks assignments={assignments} loading={loading} theme={theme} />
          )}

          {/* PROFILE PAGES */}
          {activeTab === 'profile' && (
             <Profile setActiveTab={setActiveTab} theme={theme} />
          )}

          {activeTab === 'edit-profile' && (
             <EditProfile onBack={() => setActiveTab('profile')} theme={theme} />
          )}

          {/* MANAGER PAGES */}
          {activeTab === 'course-manager' && (
            <CourseManager setActiveTab={setActiveTab} theme={theme} />
          )}

          {activeTab === 'schedule-manager' && (
            <ScheduleManager setActiveTab={setActiveTab} theme={theme} />
          )}

          {/* SETTINGS PAGE */}
          {activeTab === 'config' && (
            <Settings 
              setActiveTab={setActiveTab} 
              theme={theme} 
              darkMode={darkMode} 
              toggleTheme={toggleTheme} 
            />
          )}

          {/* PRIVACY & SECURITY PAGE */}
          {activeTab === 'privacy-security' && (
            <PrivacySecurity onBack={() => setActiveTab('config')} theme={theme} />
          )}
        </main>

        <footer className="nav-wrapper" style={{ backgroundColor: theme.card, borderTop: `1px solid ${theme.border}` }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </footer>
        
      </div>
    </div>
  );
}

export default App;