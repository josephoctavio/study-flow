import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, MapPin, Edit2, X, Info } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ScheduleManager = ({ setActiveTab }) => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [day, setDay] = useState('Monday');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: c } = await supabase.from('courses').select('*');
    const { data: t } = await supabase.from('timetable').select('*, courses(name, color)').order('start_time');
    if (c) setCourses(c);
    if (t) setTimetable(t);
  };

  const handleSave = async () => {
    if (!selectedCourse || !time) return;
    const payload = { course_id: selectedCourse, day_of_week: day, start_time: time, location };

    if (editingId) {
      await supabase.from('timetable').update(payload).eq('id', editingId);
    } else {
      await supabase.from('timetable').insert([payload]);
    }
    resetForm();
    fetchData();
  };

  const deleteSchedule = async (id, courseName) => {
    // SAFETY RAIL: Confirmation check
    const confirmed = window.confirm(`Are you sure you want to remove ${courseName} from your timetable?`);
    if (confirmed) {
      const { error } = await supabase.from('timetable').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setSelectedCourse(item.course_id);
    setDay(item.day_of_week);
    setTime(item.start_time);
    setLocation(item.location || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedCourse('');
    setDay('Monday');
    setTime('');
    setLocation('');
    setIsFormOpen(false);
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '120px' }}>
      <button onClick={() => setActiveTab('profile')} style={{ color: '#007AFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '800', background: 'none', border: 'none' }}>
        <ArrowLeft size={18} /> BACK
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900' }}>MY WEEK</h2>
        <button onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)} style={{ backgroundColor: isFormOpen ? '#222' : '#007AFF', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', border: 'none' }}>
          {isFormOpen ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {isFormOpen && (
        <div style={{ backgroundColor: '#0A0A0A', padding: '20px', borderRadius: '24px', border: '1px solid #1a1a1a', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <p style={{ fontSize: '11px', color: '#007AFF', fontWeight: '900', marginBottom: '15px', letterSpacing: '1px' }}>
            {editingId ? 'EDIT CLASS DETAILS' : 'ASSIGN NEW CLASS'}
          </p>
          
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#111', color: '#fff', border: '1px solid #222', marginBottom: '10px' }}>
            <option value="">Choose Course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <select value={day} onChange={(e) => setDay(e.target.value)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#111', color: '#fff', border: '1px solid #222' }}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#111', color: '#fff', border: '1px solid #222' }} />
          </div>

          <input type="text" placeholder="Location (Optional)" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#111', color: '#fff', border: '1px solid #222', marginBottom: '20px' }} />
          
          <button onClick={handleSave} style={{ width: '100%', backgroundColor: '#007AFF', padding: '15px', borderRadius: '12px', color: '#fff', fontWeight: '900', border: 'none' }}>
            {editingId ? 'CONFIRM CHANGES' : 'ADD TO SCHEDULE'}
          </button>
        </div>
      )}

      {days.map(d => {
        const classesForDay = timetable.filter(t => t.day_of_week === d);

        return (
          <div key={d} style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '12px', color: '#444', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '12px', paddingLeft: '5px' }}>{d.toUpperCase()}</h3>
            
            {classesForDay.length > 0 ? (
              classesForDay.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '18px', backgroundColor: '#0A0A0A', borderRadius: '20px', marginBottom: '10px', border: '1px solid #1a1a1a' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{item.courses?.name}</div>
                    <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '12px', marginTop: '6px', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} color="#007AFF"/> {item.start_time.slice(0, 5)}</span>
                      {item.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} color="#FF2D55"/> {item.location}</span>}
                    </div>
                  </div>
                  
                  {/* DEDICATED BUTTONS FOR EDIT/DELETE */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => startEdit(item)} style={{ background: '#111', border: 'none', color: '#888', padding: '8px', borderRadius: '8px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteSchedule(item.id, item.courses?.name)} style={{ background: '#111', border: 'none', color: '#ff3b30', padding: '8px', borderRadius: '8px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '15px', borderRadius: '18px', border: '1px dashed #111', textAlign: 'center' }}>
                <p style={{ color: '#222', fontSize: '11px', fontWeight: '800', margin: 0 }}>FREE DAY</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleManager;