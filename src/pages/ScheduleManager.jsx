import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, MapPin, Edit2, X, AlertTriangle, ChevronDown, CheckCircle2, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ScheduleManager = ({ setActiveTab, theme }) => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Day Selection Logic
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] || 'Monday');

  // Form States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  
  // Validation States
  const [errors, setErrors] = useState({ course: false });
  const [shouldShake, setShouldShake] = useState(false);

  // UX States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#1c1c1e',
    bg: theme?.bg || '#000',
    border: theme?.border || '#2c2c2e',
    accent: '#007AFF'
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  const fetchData = useCallback(async () => {
    const { data: c } = await supabase.from('courses').select('*').order('name');
    const { data: t } = await supabase.from('timetable').select('*, courses(name, color)').order('start_time');
    if (c) setCourses(c);
    if (t) setTimetable(t);
  }, []);

  useEffect(() => {
    fetchData();
    const sub = supabase.channel('timetable_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [fetchData]);

  const handleSave = async () => {
    // Only Course is strictly required now
    if (!selectedCourse) {
      setErrors({ course: true });
      setShouldShake(true);
      setTimeout(() => { setShouldShake(false); }, 500);
      return;
    }

    setLoading(true);
    const payload = { 
        course_id: selectedCourse.id, 
        day_of_week: activeDay, 
        start_time: time || "00:00", // Default if empty
        location: location.trim() 
    };

    const { error } = editingId 
      ? await supabase.from('timetable').update(payload).eq('id', editingId)
      : await supabase.from('timetable').insert([payload]);

    if (!error) {
      showToast(editingId ? "Schedule Updated" : "Class Added");
      resetForm();
    }
    setLoading(false);
  };

  const confirmDelete = (id, name) => {
    setModalConfig({
      isOpen: true,
      title: "Remove Class?",
      message: `Are you sure you want to remove ${name} from your schedule?`,
      onConfirm: async () => {
        await supabase.from('timetable').delete().eq('id', id);
        showToast("Removed from Schedule", "delete");
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setSelectedCourse(courses.find(c => c.id === item.course_id));
    setActiveDay(item.day_of_week);
    setTime(item.start_time);
    setLocation(item.location || '');
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedCourse(null);
    setTime('');
    setLocation('');
    setIsFormOpen(false);
    setIsCourseDropdownOpen(false);
    setIsDayDropdownOpen(false);
    setErrors({ course: false });
  };

  const currentClasses = timetable.filter(t => t.day_of_week === activeDay);

  return (
    <div style={{ padding: '20px', backgroundColor: colors.bg, minHeight: '100vh', color: colors.text, paddingBottom: '120px' }}>
      
      {/* TOAST & MODAL */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toast.type === 'delete' ? '#FF2D55' : '#34C759', color: '#fff', padding: '12px 24px', borderRadius: '50px', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', animation: 'slideUpToast 0.3s' }}>
          {toast.type === 'delete' ? <Trash2 size={14}/> : <CheckCircle2 size={14} />} {toast.message}
        </div>
      )}

      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: colors.card, padding: '30px', borderRadius: '28px', maxWidth: '320px', width: '100%', textAlign: 'center', border: `1px solid ${colors.border}` }}>
            <AlertTriangle color="#FF3B30" size={32} style={{ marginBottom: '15px' }}/>
            <h3 style={{ fontWeight: '900', fontSize: '20px' }}>{modalConfig.title}</h3>
            <p style={{ opacity: 0.6, fontSize: '14px', margin: '10px 0 25px' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: colors.border, color: colors.text, border: 'none', fontWeight: '700' }}>CANCEL</button>
              <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '700' }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: colors.accent, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={20} /> <span style={{fontSize: '11px', letterSpacing: '1px'}}>BACK</span>
        </button>
        <h2 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '1px', color: colors.text, margin: 0 }}>TIMETABLE</h2>
        <button onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isFormOpen ? colors.card : colors.accent, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isFormOpen ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* DAY PICKER */}
      {!isFormOpen && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {days.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} style={{
              padding: '12px 20px', borderRadius: '18px', border: 'none',
              backgroundColor: activeDay === d ? colors.accent : colors.card,
              color: activeDay === d ? '#fff' : '#888',
              fontWeight: '800', fontSize: '13px', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease', border: activeDay === d ? 'none' : `1px solid ${colors.border}`
            }}>
              {d.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* FORM */}
      {isFormOpen && (
        <div className={shouldShake ? 'shake' : ''} style={{ backgroundColor: colors.card, padding: '25px', borderRadius: '28px', border: `1px solid ${colors.border}`, marginBottom: '30px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '900', color: colors.accent, letterSpacing: '1.5px', marginBottom: '20px' }}>
            {editingId ? 'MODIFY CLASS' : 'ASSIGN NEW CLASS'}
          </h2>

          {/* CUSTOM COURSE DROPDOWN */}
          <div style={{ marginBottom: '15px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4, marginBottom: '8px' }}>SELECT COURSE</label>
                {errors.course && <span style={{ color: '#FF3B30', fontSize: '10px', fontWeight: '800' }}>REQUIRED*</span>}
            </div>
            <div onClick={() => { setIsCourseDropdownOpen(!isCourseDropdownOpen); setIsDayDropdownOpen(false); }} style={{ padding: '16px', borderRadius: '14px', backgroundColor: colors.bg, border: `1px solid ${errors.course ? '#FF3B30' : colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontWeight: '600', opacity: selectedCourse ? 1 : 0.4 }}>{selectedCourse ? selectedCourse.name : 'Choose course...'}</span>
              <ChevronDown size={18} style={{ opacity: 0.5 }} />
            </div>
            {isCourseDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', marginTop: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                {courses.map(c => (
                  <div key={c.id} onClick={() => { setSelectedCourse(c); setIsCourseDropdownOpen(false); setErrors({course:false}); }} style={{ padding: '14px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
            {/* CUSTOM DAY DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4, marginBottom: '8px', display: 'block' }}>DAY</label>
              <div onClick={() => { setIsDayDropdownOpen(!isDayDropdownOpen); setIsCourseDropdownOpen(false); }} style={{ padding: '16px', borderRadius: '14px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{activeDay.slice(0,3)}</span>
                <ChevronDown size={14} style={{ opacity: 0.5 }} />
              </div>
              {isDayDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '14px', marginTop: '8px', zIndex: 100 }}>
                  {days.map(d => (
                    <div key={d} onClick={() => { setActiveDay(d); setIsDayDropdownOpen(false); }} style={{ padding: '12px', borderBottom: `1px solid ${colors.border}`, fontWeight: '700', fontSize: '13px', textAlign: 'center' }}>{d}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4, marginBottom: '8px', display: 'block' }}>START TIME</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: '600' }} />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4, display: 'block' }}>LOCATION</label>
                <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.4 }}>{location.length}/25</label>
            </div>
            <input type="text" maxLength={25} placeholder="e.g. Hall 7" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: '600' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: colors.accent, color: '#fff', border: 'none', fontWeight: '900', fontSize: '14px' }}>
                {loading ? <Loader2 className="spin" size={20} /> : (editingId ? 'SAVE CHANGES' : 'ADD TO SCHEDULE')}
            </button>
            <button onClick={resetForm} style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, fontWeight: '700', fontSize: '12px', letterSpacing: '1px' }}>
                CANCEL
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      {!isFormOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentClasses.length > 0 ? (
            currentClasses.map(item => (
              <div key={item.id} style={{ backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: item.courses?.color }} />
                <div style={{ flex: 1, paddingLeft: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '900', color: item.courses?.color, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.courses?.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: '900' }}><Clock size={16} color={colors.accent} strokeWidth={2.5} /> {item.start_time.slice(0, 5)}</div>
                    {item.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', opacity: 0.5 }}><MapPin size={14} strokeWidth={2.5} /> {item.location}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(item)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', padding: '10px', borderRadius: '12px' }}><Edit2 size={18} /></button>
                  <button onClick={() => confirmDelete(item.id, item.courses?.name)} style={{ background: 'rgba(255,59,48,0.1)', border: 'none', color: '#FF3B30', padding: '10px', borderRadius: '12px' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ height: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.15 }}>
              <CalendarDays size={80} style={{ marginBottom: '15px' }} />
              <p style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '1.5px' }}>FREE DAY</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes slideUpToast { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default ScheduleManager;