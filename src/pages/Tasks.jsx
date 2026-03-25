import React, { useState, useEffect, useCallback } from 'react';
import { Plus, CheckCircle, Circle, Calendar, Book, ChevronUp, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Tasks = ({ theme, darkMode }) => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  // Form States
  const [title, setTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dueDate, setDueDate] = useState('');

  // 1. Wrapped fetchData in useCallback for real-time syncing
  const fetchData = useCallback(async () => {
    const { data: taskData } = await supabase
      .from('assignments')
      .select('*, courses(name, color)')
      .order('due_date', { ascending: true });
    
    const { data: courseData } = await supabase.from('courses').select('*').order('name');
    
    if (taskData) setTasks(taskData);
    if (courseData) setCourses(courseData);
  }, []);

  useEffect(() => {
    // Initial Fetch
    fetchData();

    // 2. Realtime Subscription
    const subscription = supabase
      .channel('tasks_realtime')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        () => {
          console.log('Change detected in assignments! Syncing...');
          fetchData(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchData]);

  const addTask = async () => {
    if (!title || !selectedCourse) return;
    const { error } = await supabase.from('assignments').insert([
      { title, course_id: selectedCourse, due_date: dueDate || null, status: 'pending' }
    ]);
    if (!error) {
      setTitle('');
      setDueDate('');
      setSelectedCourse('');
      setIsFormOpen(false);
      // No need to call fetchData() - subscription handles it!
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    await supabase.from('assignments').update({ status: newStatus }).eq('id', id);
    // No need to call fetchData() - subscription handles it!
  };

  const deleteTask = async (id) => {
    if (window.confirm("Delete this assignment?")) {
      await supabase.from('assignments').delete().eq('id', id);
      // No need to call fetchData() - subscription handles it!
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div style={{ padding: '15px', paddingBottom: '100px', color: theme?.text }}>
      
      {/* 1. COMPACT MOBILE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>My Assignments</h2>
          <p style={{ fontSize: '12px', opacity: 0.5, fontWeight: '600' }}>{tasks.filter(t => t.status === 'pending').length} remaining</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{ 
            backgroundColor: isFormOpen ? theme.card : '#007AFF', 
            color: isFormOpen ? theme.text : '#fff', 
            width: '44px', height: '44px',
            borderRadius: '50%', 
            border: isFormOpen ? `1px solid ${theme.border}` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,122,255,0.3)'
          }}
        >
          {isFormOpen ? <ChevronUp size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* 2. MOBILE-OPTIMIZED ADD FORM */}
      {isFormOpen && (
        <div style={{ 
          backgroundColor: theme.card, padding: '20px', borderRadius: '24px', border: `1px solid ${theme.border}`, 
          marginBottom: '20px', animation: 'slideDown 0.3s ease'
        }}>
          <input 
            type="text" placeholder="Assignment title..." value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, marginBottom: '12px', fontSize: '16px', outline: 'none' }}
          />
          
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, marginBottom: '12px', outline: 'none' }}
          >
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none' }}
            />
            <button onClick={addTask} style={{ backgroundColor: '#007AFF', color: '#fff', padding: '0 25px', borderRadius: '14px', fontWeight: '800', border: 'none' }}>
              SAVE
            </button>
          </div>
        </div>
      )}

      {/* 3. FILTER CHIPS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {['all', 'pending', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: '20px', border: 'none',
              backgroundColor: filter === f ? '#007AFF' : theme.card,
              color: filter === f ? '#fff' : '#888',
              fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 4. TASK LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.2 }}>
            <Book size={40} style={{ margin: '0 auto 10px auto' }} />
            <p style={{ fontWeight: '800', fontSize: '14px' }}>NO {filter.toUpperCase()} ASSIGNMENTS</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              style={{ 
                padding: '16px', backgroundColor: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, 
                display: 'flex', alignItems: 'center', gap: '12px',
                opacity: task.status === 'completed' ? 0.5 : 1
              }}
            >
              <button 
                onClick={() => toggleStatus(task.id, task.status)} 
                style={{ background: 'transparent', border: 'none', padding: 0, color: task.status === 'completed' ? '#34C759' : '#444' }}
              >
                {task.status === 'completed' ? <CheckCircle size={26} /> : <Circle size={26} />}
              </button>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: theme.text, textDecoration: task.status === 'completed' ? 'line-through' : 'none', fontSize: '15px', marginBottom: '4px' }}>
                  {task.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: task.courses?.color || '#555', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: task.courses?.color }} />
                    {task.courses?.name}
                  </span>
                  {task.due_date && (
                    <span style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Calendar size={12}/> {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)} 
                style={{ background: 'transparent', border: 'none', color: '#FF3B30', opacity: 0.4, padding: '5px' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;