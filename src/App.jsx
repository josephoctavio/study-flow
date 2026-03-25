import { useState, useEffect, useMemo } from 'react';
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

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true);
  
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- AUTH LOGIC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  const fetchAllData = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const [tasksResponse, coursesResponse] = await Promise.all([
        supabase.from('assignments').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*')
      ]);

      if (tasksResponse.data) setAssignments(tasksResponse.data);
      if (coursesResponse.data) setCourses(coursesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);

  // --- MEMOIZED THEME ---
  const theme = useMemo(() => ({
    bg: darkMode ? '#000000' : '#F5F5F7',
    text: darkMode ? '#FFFFFF' : '#000000',
    card: darkMode ? '#111111' : '#FFFFFF',
    border: darkMode ? '#222222' : '#E5E5E5'
  }), [darkMode]);

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.bg }}>
      
      <div className="mobile-container" style={{ color: theme.text }}>
        
        <main className="main-content">
          {/* 1. HOME PAGE - Kept Header here for the Theme Toggle access */}
          {activeTab === 'home' && (
            <>
              <Header title="STUDYFLOW" showThemeToggle={true} darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />
              <Home assignments={assignments} loading={loading} theme={theme} darkMode={darkMode} />
            </>
          )}

          {/* 2. TASKS PAGE - Header Removed to fix "smushed" look */}
          {activeTab === 'tasks' && (
            <Tasks assignments={assignments} loading={loading} theme={theme} />
          )}

          {/* 3. PROFILE PAGE */}
          {activeTab === 'profile' && (
             <Profile setActiveTab={setActiveTab} theme={theme} />
          )}

          {/* 3b. EDIT PROFILE PAGE */}
          {activeTab === 'edit-profile' && (
             <EditProfile onBack={() => setActiveTab('profile')} theme={theme} />
          )}

          {/* 4. COURSE MANAGER PAGE */}
          {activeTab === 'course-manager' && (
            <CourseManager setActiveTab={setActiveTab} theme={theme} />
          )}

          {/* 5. SCHEDULE MANAGER PAGE */}
          {activeTab === 'schedule-manager' && (
            <ScheduleManager setActiveTab={setActiveTab} theme={theme} />
          )}

          {/* 6. SETTINGS PAGE - Header Removed */}
          {activeTab === 'config' && (
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Settings</h2>
              <button
                onClick={() => supabase.auth.signOut()}
                className="sign-out-btn"
                style={{
                  marginTop: '20px',
                  padding: '12px 20px',
                  backgroundColor: '#FF3B30',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </main>

        {/* PERMANENT BOTTOM NAV */}
        <footer className="nav-wrapper" style={{ backgroundColor: theme.card, borderTop: `1px solid ${theme.border}` }}>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </footer>
        
      </div>
    </div>
  );
}

export default App;