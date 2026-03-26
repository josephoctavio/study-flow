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
  
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- AUTH LOGIC ---
  useEffect(() => {
    // Check initial session and URL for recovery tokens
    const checkInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // Check if we arrived via a recovery link immediately
      if (window.location.hash.includes('type=recovery')) {
        setIsRecoveringPassword(true);
      }
      
      setInitializing(false);
    };

    checkInitialAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveringPassword(true); 
      }
      
      if (event === "SIGNED_OUT") {
        setIsRecoveringPassword(false);
        setActiveTab('home'); // Reset tab on logout
      }

      if (event === "USER_UPDATED" && isRecoveringPassword) {
        // This triggers after a successful password save
        setIsRecoveringPassword(false);
      }

      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, [isRecoveringPassword]);

  // --- THEME & DATA FETCHING ---
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
      await supabase.from('profiles').update({ dark_mode: newMode }).eq('id', session.user.id);
    }
  };

  const fetchAllData = useCallback(async () => {
    if (!session || isRecoveringPassword) return; // Don't fetch data during recovery
    
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
  }, [session, isRecoveringPassword, fetchUserPreferences]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const theme = useMemo(() => ({
    bg: darkMode ? '#000000' : '#F5F5F7',
    text: darkMode ? '#FFFFFF' : '#000000',
    card: darkMode ? '#111111' : '#FFFFFF',
    border: darkMode ? '#222222' : '#E5E5E5',
    accent: '#007AFF',
    danger: '#FF3B30'
  }), [darkMode]);

  // 1. Loading State
  if (initializing) {
    return <div style={{ backgroundColor: '#000', minHeight: '100vh' }} />;
  }

  // 2. Auth Gate (Login or Password Reset)
  // We show Auth if there is no session OR if we are specifically in recovery mode
  if (!session || isRecoveringPassword) {
    return <Auth />;
  }

  // 3. Main App Shell
  return (
    <div className={`app-shell ${darkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh' }}>
      <div className="mobile-container">
        
        <main className="main-content" style={{ paddingBottom: '80px' }}>
          {activeTab === 'home' && (
            <>
              <Header title="STUDYFLOW" showThemeToggle={true} darkMode={darkMode} setDarkMode={toggleTheme} theme={theme} />
              <Home userId={session?.user?.id} assignments={assignments} loading={loading} theme={theme} darkMode={darkMode} />
            </>
          )}

          {activeTab === 'tasks' && <Tasks assignments={assignments} loading={loading} theme={theme} />}
          {activeTab === 'profile' && <Profile setActiveTab={setActiveTab} theme={theme} />}
          {activeTab === 'edit-profile' && <EditProfile onBack={() => setActiveTab('profile')} theme={theme} />}
          {activeTab === 'course-manager' && <CourseManager setActiveTab={setActiveTab} theme={theme} />}
          {activeTab === 'schedule-manager' && <ScheduleManager setActiveTab={setActiveTab} theme={theme} />}
          {activeTab === 'config' && <Settings setActiveTab={setActiveTab} theme={theme} darkMode={darkMode} toggleTheme={toggleTheme} />}
          {activeTab === 'privacy-security' && <PrivacySecurity onBack={() => setActiveTab('config')} theme={theme} />}
        </main>

        <footer className="nav-wrapper" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, zIndex: 1000 }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </footer>
        
      </div>
    </div>
  );
}

export default App;