import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, User, ChevronUp, Loader2, AlertCircle, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CourseManager = ({ setActiveTab, theme }) => {
  const [courses, setCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // UX States
  const [error, setError] = useState(null);
  const [shakeKey, setShakeKey] = useState(0); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', onConfirm: null
  });

  // Form States
  const [courseName, setCourseName] = useState('');
  const [lecturer, setLecturer] = useState('');
  
  const colors = ['#007AFF', '#FF9500', '#34C759', '#5856D6', '#FF2D55', '#AF52DE', '#5AC8FA', '#FFCC00'];

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const showConfirm = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, onConfirm });

  // --- Toggle Form Logic ---
  const toggleForm = () => {
    if (isFormOpen) {
      setError(null); // Clear errors when closing
      setCourseName('');
      setLecturer('');
    }
    setIsFormOpen(!isFormOpen);
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data) setCourses(data);
  };

  useEffect(() => { fetchCourses(); }, []);

  const triggerError = (msg) => {
    setError(msg);
    setShakeKey(prev => prev + 1); 
  };

  const addCourse = async () => {
    const trimmedName = courseName.trim();
    
    if (!trimmedName) {
      triggerError("Course Title is required");
      return;
    }

    if (loading) return;

    const exists = courses.some(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      triggerError(`"${trimmedName}" is already added.`);
      return;
    }

    setLoading(true);
    setError(null);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const { error: dbError } = await supabase.from('courses').insert([
      { name: trimmedName, color: randomColor, lecturer: lecturer.trim() || null }
    ]);

    if (dbError) {
      triggerError("Database error. Try again.");
      setLoading(false);
    } else {
      showToast("Saved Successfully");
      setCourseName(''); setLecturer(''); setIsFormOpen(false); setLoading(false); fetchCourses();
    }
  };

  const deleteCourse = (id) => {
    showConfirm("Delete Course?", "This will permanently remove this course.", async () => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) {
        fetchCourses();
        showToast("Deleted Successfully", "delete");
      }
      closeModal();
    });
  };

  const deleteAllCourses = () => {
    showConfirm("DELETE EVERYTHING?", "All courses will be wiped forever.", async () => {
      const { error } = await supabase.from('courses').delete().neq('id', 0);
      if (!error) {
        fetchCourses();
        showToast("All Courses Cleared", "delete");
      }
      closeModal();
    });
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, transition: 'all 0.3s ease', position: 'relative', paddingBottom: '120px' }}>
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toast.type === 'delete' ? '#FF2D55' : '#34C759', color: '#fff', padding: '12px 24px', borderRadius: '50px', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', animation: 'slideUpToast 0.3s ease-out' }}>
          {toast.type === 'delete' ? <Trash2 size={14}/> : <CheckCircle2 size={14} />}
          {toast.message}
        </div>
      )}

      {/* MODAL */}
      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, padding: '25px', borderRadius: '24px', maxWidth: '350px', width: '100%', textAlign: 'center', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ backgroundColor: 'rgba(255,45,85,0.1)', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              <AlertTriangle color="#FF2D55" size={24} />
            </div>
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>{modalConfig.title}</h3>
            <p style={{ color: theme.text, opacity: 0.6, fontSize: '14px', marginBottom: '25px' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: theme.border, color: theme.text, border: 'none', fontWeight: '700', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#FF2D55', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>CONFIRM</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '8px', borderRadius: '10px', color: theme.text, cursor: 'pointer' }}><ArrowLeft size={20} /></button>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>COURSES</h2>
        </div>
        <button onClick={toggleForm} style={{ backgroundColor: isFormOpen ? theme.card : '#007AFF', color: isFormOpen ? theme.text : '#fff', border: isFormOpen ? `1px solid ${theme.border}` : 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
          {isFormOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
          {isFormOpen ? 'CLOSE' : 'ADD NEW'}
        </button>
      </div>

      {/* FORM */}
      {isFormOpen && (
        <div 
          key={shakeKey} 
          style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '24px', border: `1px solid ${error ? '#FF2D55' : theme.border}`, marginBottom: '30px', animation: error ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : 'fadeIn 0.3s ease' }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '11px', color: error ? '#FF2D55' : theme.text, opacity: 0.5, fontWeight: '800', marginBottom: '8px', display: 'block' }}>COURSE NAME *</label>
            <input 
              type="text" 
              maxLength={20} 
              placeholder="e.g. Computer Science" 
              value={courseName} 
              onChange={(e) => { 
                setCourseName(e.target.value); 
                if(error) setError(null); // ✅ Clears error while typing
              }} 
              style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${error ? '#FF2D55' : theme.border}`, color: theme.text, outline: 'none', boxSizing: 'border-box' }} 
            />
            {error && <div style={{ color: '#FF2D55', fontSize: '11px', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> {error}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: theme.text, opacity: 0.5, fontWeight: '800', marginBottom: '8px', display: 'block' }}>LECTURER (OPTIONAL)</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input type="text" maxLength={25} placeholder="Dr. Smith" value={lecturer} onChange={(e) => setLecturer(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={addCourse} disabled={loading} style={{ minWidth: '160px', backgroundColor: '#007AFF', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
              {loading ? <Loader2 className="spin" size={16} /> : 'SAVE COURSE'}
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {courses.length === 0 && !isFormOpen ? (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <BookOpen size={80} style={{ marginBottom: '20px', opacity: 0.1 }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: theme.text }}>No Courses Yet</h3>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} style={{ padding: '18px', backgroundColor: theme.card, borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.border}`, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '4px', height: '35px', backgroundColor: course.color, borderRadius: '10px' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: theme.text }}>{course.name}</div>
                  {course.lecturer && <div style={{ fontSize: '12px', color: theme.text, opacity: 0.5 }}>{course.lecturer}</div>}
                </div>
              </div>
              <button onClick={() => deleteCourse(course.id)} style={{ background: 'transparent', border: 'none', color: theme.text, opacity: 0.3, cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
          ))
        )}
      </div>

      {/* CLEAR ALL BUTTON - Fixed visibility logic */}
      {courses.length >= 6 && !isFormOpen && (
        <button onClick={deleteAllCourses} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: `1px dashed ${theme.border}`, color: '#FF2D55', borderRadius: '20px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Trash2 size={14} /> CLEAR ALL COURSES ({courses.length})
        </button>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @keyframes shake {
          10%, 90% { transform: translateX(-4px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUpToast { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default CourseManager;