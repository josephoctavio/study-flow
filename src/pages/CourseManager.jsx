import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Trash2, User, ChevronUp, Loader2, 
  AlertCircle, AlertTriangle, BookOpen, CheckCircle2, 
  Pencil, Hash, Type 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const CourseManager = ({ setActiveTab, theme, darkMode, courses, loading, refreshData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  // UX States
  const [error, setError] = useState(null);
  const [shakeKey, setShakeKey] = useState(0); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', onConfirm: null
  });

  // Form States
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [lecturer, setLecturer] = useState('');
  
  const colorsList = ['#007AFF', '#FF9500', '#34C759', '#5856D6', '#FF2D55', '#AF52DE', '#5AC8FA', '#FFCC00'];

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const showConfirm = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, onConfirm });

  const toggleForm = () => {
    if (isFormOpen) {
      resetForm();
    }
    setIsFormOpen(!isFormOpen);
  };

  const resetForm = () => {
    setError(null);
    setCourseCode('');
    setCourseTitle('');
    setLecturer('');
    setEditingId(null);
  };

  const triggerError = (msg) => {
    setError(msg);
    setShakeKey(prev => prev + 1); 
  };

  const handleEditInitiation = (course) => {
    setEditingId(course.id);
    setCourseCode(course.course_code || '');
    setCourseTitle(course.name || '');
    setLecturer(course.lecturer || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCourse = async () => {
    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedTitle = courseTitle.trim();
    
    // 1. Basic Mandatory Check
    if (!trimmedCode || !trimmedTitle) return triggerError("Code and Title are required");
    
    // 2. Local Duplicate Check (Before calling Database)
    const isDuplicateCode = courses.some(c => 
        c.id !== editingId && c.course_code?.toUpperCase() === trimmedCode
    );
    const isDuplicateTitle = courses.some(c => 
        c.id !== editingId && c.name?.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (isDuplicateCode) return triggerError(`Code "${trimmedCode}" already exists`);
    if (isDuplicateTitle) return triggerError(`Title "${trimmedTitle}" already exists`);

    if (!window.navigator.onLine) return triggerError("No internet connection.");
    if (formLoading) return;

    setFormLoading(true);
    setError(null);

    const courseData = { 
      course_code: trimmedCode,
      name: trimmedTitle, 
      lecturer: lecturer.trim() || null 
    };

    let dbError;
    if (editingId) {
      const { error } = await supabase.from('courses').update(courseData).eq('id', editingId);
      dbError = error;
    } else {
      const randomColor = colorsList[Math.floor(Math.random() * colorsList.length)];
      const { error } = await supabase.from('courses').insert([{ ...courseData, color: randomColor }]);
      dbError = error;
    }

    if (dbError) {
      triggerError("Database error. Please try again.");
      setFormLoading(false);
    } else {
      showToast(editingId ? "Changes Saved" : "Course Added");
      resetForm();
      setIsFormOpen(false);
      setFormLoading(false);
      refreshData();
    }
  };

  const deleteCourse = (id) => {
    showConfirm("Delete Course?", "This will also affect assignments linked to this course.", async () => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) {
        showToast("Course Deleted", "delete");
        refreshData();
      }
      closeModal();
    });
  };

  const SkeletonItem = () => (
    <div className="skeleton" style={{ height: '70px', borderRadius: '20px', marginBottom: '12px' }} />
  );

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, paddingBottom: '120px' }}>
      
      {/* TOAST */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toast.type === 'delete' ? '#FF3B30' : '#34C759', color: '#fff', padding: '12px 20px', borderRadius: '50px', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'slideUpToast 0.3s ease-out' }}>
          {toast.type === 'delete' ? <Trash2 size={14}/> : <CheckCircle2 size={14} />}
          {toast.message.toUpperCase()}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, padding: '30px', borderRadius: '28px', maxWidth: '320px', width: '100%', textAlign: 'center', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ backgroundColor: 'rgba(255,59,48,0.1)', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertTriangle color="#FF3B30" size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '10px' }}>{modalConfig.title}</h3>
            <p style={{ opacity: 0.6, fontSize: '13px', marginBottom: '28px', lineHeight: '1.5' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '14px', background: theme.border, color: theme.text, border: 'none', fontWeight: '700', fontSize: '13px' }}>CANCEL</button>
              <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '800', fontSize: '13px' }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', paddingTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '8px', borderRadius: '12px', color: theme.text, display: 'flex' }}><ArrowLeft size={18} /></button>
          <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>COURSES</h2>
        </div>
        <button onClick={toggleForm} style={{ backgroundColor: isFormOpen ? theme.card : theme.accent, color: isFormOpen ? theme.text : '#fff', border: isFormOpen ? `1px solid ${theme.border}` : 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
          {isFormOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
          {isFormOpen ? 'CLOSE' : 'ADD NEW'}
        </button>
      </div>

      {/* FORM */}
      {isFormOpen && (
        <div 
          key={shakeKey} 
          style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '24px', border: `1px solid ${error ? '#FF3B30' : theme.border}`, marginBottom: '32px', animation: error ? 'shake 0.4s both' : 'fadeIn 0.3s ease', boxShadow: `0 10px 40px rgba(0,0,0,${darkMode ? '0.4' : '0.05'})` }}
        >
          <h4 style={{ fontSize: '11px', fontWeight: '900', marginBottom: '18px', color: theme.accent, letterSpacing: '0.5px' }}>{editingId ? 'EDITING COURSE' : 'CREATE NEW COURSE'}</h4>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '9px', color: theme.text, opacity: 0.5, fontWeight: '900', marginBottom: '6px', display: 'block', letterSpacing: '1px' }}>COURSE CODE</label>
            <div style={{ position: 'relative' }}>
              <Hash size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="MCM 101" 
                value={courseCode} 
                maxLength={15}
                onChange={(e) => { setCourseCode(e.target.value); if(error) setError(null); }} 
                style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none', fontWeight: '700', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '9px', color: theme.text, opacity: 0.5, fontWeight: '900', marginBottom: '6px', display: 'block', letterSpacing: '1px' }}>COURSE TITLE</label>
            <div style={{ position: 'relative' }}>
              <Type size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="Film & Media Production" 
                value={courseTitle} 
                onChange={(e) => { setCourseTitle(e.target.value); if(error) setError(null); }} 
                style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none', fontWeight: '600', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '9px', color: theme.text, opacity: 0.5, fontWeight: '900', marginBottom: '6px', display: 'block', letterSpacing: '1px' }}>LECTURER (OPTIONAL)</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input type="text" placeholder="Dr. Jane Doe" value={lecturer} onChange={(e) => setLecturer(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none', fontWeight: '600', fontSize: '14px' }} />
            </div>
          </div>

          {error && <div style={{ color: '#FF3B30', fontSize: '10px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,59,48,0.1)', padding: '10px', borderRadius: '10px' }}><AlertCircle size={14}/> {error.toUpperCase()}</div>}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {editingId && (
              <button onClick={resetForm} style={{ flex: 1, backgroundColor: 'transparent', color: theme.text, padding: '12px', borderRadius: '14px', fontWeight: '800', border: `1px solid ${theme.border}`, fontSize: '12px' }}>CANCEL</button>
            )}
            <button onClick={saveCourse} disabled={formLoading} style={{ flex: 2, backgroundColor: theme.accent, color: '#fff', padding: '12px', borderRadius: '14px', fontWeight: '900', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
              {formLoading ? <Loader2 className="spin" size={16} /> : (editingId ? 'SAVE CHANGES' : 'CREATE COURSE')}
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonItem key={i} />)
        ) : courses.length === 0 && !isFormOpen ? (
          <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
            <BookOpen size={50} strokeWidth={1} style={{ marginBottom: '16px' }} />
            <p style={{ fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>NO COURSES ADDED</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} style={{ padding: '16px', backgroundColor: theme.card, borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.border}`, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{ width: '4px', height: '32px', backgroundColor: course.color, borderRadius: '10px' }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', backgroundColor: `${course.color}15`, color: course.color, padding: '2px 6px', borderRadius: '5px', letterSpacing: '0.5px' }}>
                      {course.course_code || 'CODE'}
                    </span>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.name}</div>
                  </div>
                  {/* FIXED LECTURER COLOR: Using theme.muted for better legibility */}
                  {course.lecturer && (
                    <div style={{ fontSize: '11px', color: theme.muted, fontWeight: '600' }}>
                      {course.lecturer}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEditInitiation(course)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.text, padding: '8px', borderRadius: '10px', cursor: 'pointer', opacity: 0.7 }}><Pencil size={14} /></button>
                <button onClick={() => deleteCourse(course.id)} style={{ background: 'rgba(255,59,48,0.05)', border: 'none', color: '#FF3B30', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .skeleton { 
          background: ${darkMode ? '#111' : '#E5E5E5'};
          background-image: linear-gradient(90deg, transparent, ${darkMode ? '#1A1A1A' : '#F0F0F0'}, transparent);
          background-size: 200px 100%;
          background-repeat: no-repeat;
          animation: shimmer 1.5s infinite linear;
        }

        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUpToast { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default CourseManager;