import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

// Importing Auth Component
import Auth from './components/Auth';

// Importing navigation and layout components
import BottomNav from './components/BottomNav';
import Header from './components/Header';

// Importing the pages
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile'; // ✅ Added EditProfile Import
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
      const { data: tasks } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: cat } = await supabase.from('courses').select('*');

      if (tasks) setAssignments(tasks);
      if (cat) setCourses(cat);
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

  const theme = {
    bg: darkMode ? '#000000' : '#F5F5F7',
    text: darkMode ? '#FFFFFF' : '#000000',
    card: darkMode ? '#111111' : '#FFFFFF',
    border: darkMode ? '#222222' : '#E5E5E5'
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.bg }}>
      
      <div className="mobile-container" style={{ color: theme.text }}>
        
        <main className="main-content">
          {/* 1. HOME PAGE */}
          <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
            <Header title="STUDYFLOW" showThemeToggle={true} darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />
            <Home assignments={assignments} loading={loading} theme={theme} darkMode={darkMode} />
          </div>

          {/* 2. TASKS PAGE */}
          <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
            <Header title="MY ASSIGNMENTS" theme={theme} />
            <Tasks assignments={assignments} loading={loading} theme={theme} />
          </div>

          {/* 3. PROFILE PAGE */}
          <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
             <Profile setActiveTab={setActiveTab} theme={theme} />
          </div>

          {/* 3b. EDIT PROFILE PAGE ✅ Added logic here */}
          <div style={{ display: activeTab === 'edit-profile' ? 'block' : 'none' }}>
             <EditProfile onBack={() => setActiveTab('profile')} theme={theme} />
          </div>

          {/* 4. COURSE MANAGER PAGE */}
          <div style={{ display: activeTab === 'course-manager' ? 'block' : 'none' }}>
            <CourseManager setActiveTab={setActiveTab} theme={theme} />
          </div>

          {/* 5. SCHEDULE MANAGER PAGE */}
          <div style={{ display: activeTab === 'schedule-manager' ? 'block' : 'none' }}>
            <ScheduleManager setActiveTab={setActiveTab} theme={theme} />
          </div>

          {/* 6. SETTINGS PAGE */}
          <div style={{ display: activeTab === 'config' ? 'block' : 'none' }}>
            <Header title="SETTINGS" theme={theme} />
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Settings</h2>
              <button 
                onClick={() => supabase.auth.signOut()}
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
          </div>
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