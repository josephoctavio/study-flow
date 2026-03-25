import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, CheckCircle, Circle, Calendar, Book, ChevronUp, Trash2, AlertTriangle, AlertCircle, CheckCircle2, Loader2, BookOpen, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SkeletonPulse = ({ style, theme }) => (
  <div style={{
    backgroundColor: theme.card,
    animation: 'pulse 1.5s infinite ease-in-out',
    ...style
  }} />
);

const Tasks = ({ theme }) => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [title, setTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dueDate, setDueDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const dropdownRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const showConfirm = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, onConfirm });

  const fetchData = useCallback(async () => {
    const { data: taskData } = await supabase.from('assignments').select('*, courses(name, color)').order('due_date', { ascending: true });
    const { data: courseData } = await supabase.from('courses').select('*').order('name');
    if (taskData) setTasks(taskData);
    if (courseData) setCourses(courseData);
    setPageLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const subscription = supabase.channel('tasks_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [fetchData]);

  const triggerError = (msg) => {
    setError(msg);
    setShakeKey(prev => prev + 1);
  };

  const addTask = async () => {
    if (!title.trim()) return triggerError("Task title is required");
    if (!selectedCourse) return triggerError("Please select a course");

    setLoading(true);
    const { error: dbError } = await supabase.from('assignments').insert([
      { title: title.trim(), course_id: selectedCourse.id, due_date: dueDate || null, status: 'pending' }
    ]);

    if (!dbError) {
      showToast("Saved Successfully");
      setTitle(''); setDueDate(''); setSelectedCourse(null); setIsFormOpen(false); setError(null);
    } else {
      triggerError("Failed to save task");
    }
    setLoading(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const { error } = await supabase.from('assignments').update({ status: newStatus }).eq('id', id);
    if (!error) showToast(newStatus === 'completed' ? "Completed!" : "Reopened");
  };

  const deleteTask = (id) => {
    showConfirm("Delete Task?", "This task will be removed forever.", async () => {
      await supabase.from('assignments').delete().eq('id', id);
      showToast("Deleted Successfully", "delete");
      closeModal();
    });
  };

  const clearAllTasks = () => {
    showConfirm("DELETE ALL?", "This will wipe every task in this list.", async () => {
      await supabase.from('assignments').delete().neq('id', 0);
      showToast("All Tasks Cleared", "delete");
      closeModal();
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  if (pageLoading) return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: theme.bg, paddingBottom: '120px' }}>
      <div style={{ marginBottom: '25px' }}>
        <SkeletonPulse theme={theme} style={{ width: '120px', height: '32px', borderRadius: '8px', marginBottom: '8px' }} />
        <SkeletonPulse theme={theme} style={{ width: '80px', height: '14px', borderRadius: '6px' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[1, 2, 3].map(i => <SkeletonPulse key={i} theme={theme} style={{ width: '70px', height: '32px', borderRadius: '20px' }} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonPulse key={i} theme={theme} style={{ height: '75px', borderRadius: '20px' }} />)}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, transition: 'all 0.3s ease', position: 'relative', paddingBottom: '120px' }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toast.type === 'delete' ? '#FF2D55' : '#34C759', color: '#fff', padding: '12px 24px', borderRadius: '50px', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', animation: 'slideUpToast 0.3s ease-out' }}>
          {toast.type === 'delete' ? <Trash2 size={14}/> : <CheckCircle2 size={14} />}
          {toast.message}
        </div>
      )}

      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, padding: '25px', borderRadius: '24px', maxWidth: '350px', width: '100%', textAlign: 'center', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ backgroundColor: 'rgba(255,45,85,0.1)', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              <AlertTriangle color="#FF2D55" size={24} />
            </div>
            <h3 style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{modalConfig.title}</h3>
            <p style={{ color: theme.text, opacity: 0.6, fontSize: '14px', margin: '10px 0 25px' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: theme.border, color: theme.text, border: 'none', fontWeight: '700' }}>CANCEL</button>
              <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#FF2D55', color: '#fff', border: 'none', fontWeight: '700' }}>CONFIRM</button>
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL PAGE TITLE (KEEPING THIS) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Tasks</h2>
          <p style={{ fontSize: '12px', opacity: 0.5, fontWeight: '700' }}>{tasks.filter(t => t.status === 'pending').length} REMAINING</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setError(null); }} style={{ backgroundColor: isFormOpen ? theme.card : '#007AFF', color: isFormOpen ? theme.text : '#fff', width: '44px', height: '44px', borderRadius: '14px', border: isFormOpen ? `1px solid ${theme.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,122,255,0.2)' }}>
          {isFormOpen ? <ChevronUp size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {isFormOpen && (
        <div key={shakeKey} style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '24px', border: `1px solid ${error ? '#FF2D55' : theme.border}`, marginBottom: '25px', animation: error ? 'shake 0.4s both' : 'fadeIn 0.3s ease' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '11px', color: theme.text, opacity: 0.5, fontWeight: '800', marginBottom: '8px', display: 'block' }}>TASK NAME *</label>
            <input type="text" maxLength={40} placeholder="e.g. Finish Lab Report" value={title} onChange={(e) => { setTitle(e.target.value); if(error) setError(null); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${error && !title ? '#FF2D55' : theme.border}`, color: theme.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px', position: 'relative' }} ref={dropdownRef}>
            <label style={{ fontSize: '11px', color: theme.text, opacity: 0.5, fontWeight: '800', marginBottom: '8px', display: 'block' }}>COURSE *</label>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${error && !selectedCourse ? '#FF2D55' : theme.border}`, color: theme.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ opacity: selectedCourse ? 1 : 0.4 }}>{selectedCourse ? selectedCourse.name : "Choose a course"}</span>
              <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', opacity: 0.5 }} />
            </div>
            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, marginTop: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                {courses.map(course => (
                  <div key={course.id} onClick={() => { setSelectedCourse(course); setIsDropdownOpen(false); if(error) setError(null); }} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: course.color }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{course.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: theme.text, opacity: 0.5, fontWeight: '800', marginBottom: '8px', display: 'block' }}>DATE (OPTIONAL)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" min={today} value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none' }} />
              <button onClick={addTask} disabled={loading} style={{ backgroundColor: '#007AFF', color: '#fff', padding: '0 25px', borderRadius: '12px', fontWeight: '800', border: 'none' }}>
                {loading ? <Loader2 className="spin" size={18} /> : 'SAVE'}
              </button>
            </div>
          </div>
          {error && <div style={{ color: '#FF2D55', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> {error}</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'pending', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: filter === f ? '#007AFF' : theme.card, color: filter === f ? '#fff' : '#888', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <BookOpen size={80} style={{ marginBottom: '20px', opacity: 0.1 }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>No Tasks</h3>
            <p style={{ fontSize: '14px', opacity: 0.5, maxWidth: '220px', marginTop: '8px' }}>Tap "+" to add an assignment.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} style={{ padding: '18px', backgroundColor: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px', opacity: task.status === 'completed' ? 0.6 : 1 }}>
              <button onClick={() => toggleStatus(task.id, task.status)} style={{ background: 'transparent', border: 'none', color: task.status === 'completed' ? '#34C759' : theme.text, opacity: task.status === 'completed' ? 1 : 0.2 }}>
                {task.status === 'completed' ? <CheckCircle size={26} /> : <Circle size={26} />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', textDecoration: task.status === 'completed' ? 'line-through' : 'none', fontSize: '15px' }}>{task.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: task.courses?.color, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: task.courses?.color }} />
                    {task.courses?.name}
                  </span>
                  {task.due_date && <span style={{ fontSize: '10px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><Calendar size={10}/> {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} style={{ background: 'transparent', border: 'none', color: '#FF2D55', opacity: 0.3 }}><Trash2 size={18} /></button>
            </div>
          ))
        )}
      </div>

      {tasks.length >= 5 && !isFormOpen && (
        <button onClick={clearAllTasks} style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', border: `1px dashed ${theme.border}`, color: '#FF2D55', borderRadius: '20px', fontWeight: '700', fontSize: '12px', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Trash2 size={14} /> CLEAR ALL TASKS ({tasks.length})
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
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
};

export default Tasks;