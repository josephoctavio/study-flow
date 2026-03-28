import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, MapPin, Edit2, X, AlertTriangle, ChevronDown, CheckCircle2, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ScheduleManager = ({ setActiveTab, theme, darkMode, courses, timetable, loading, refreshData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  // Helper: Convert 24h (HH:mm) to 12h (h:mm AM/PM)
  const formatTo12Hr = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      setErrors({ course: true });
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    setFormLoading(true);
    const payload = { 
      course_id: selectedCourse.id, 
      day_of_week: activeDay, 
      start_time: time || "08:00", 
      location: location.trim() 
    };

    const { error } = editingId 
      ? await supabase.from('timetable').update(payload).eq('id', editingId)
      : await supabase.from('timetable').insert([payload]);

    if (!error) {
      showToast(editingId ? "Updated" : "Added");
      refreshData();
      resetForm();
    }
    setFormLoading(false);
  };

  const confirmDelete = (id, name) => {
    setModalConfig({
      isOpen: true,
      title: "Remove Class?",
      message: `Remove ${name} from your schedule?`,
      onConfirm: async () => {
        const { error } = await supabase.from('timetable').delete().eq('id', id);
        if (!error) {
          showToast("Removed", "delete");
          refreshData();
        }
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

  const currentClasses = useMemo(() => 
    timetable.filter(t => t.day_of_week === activeDay),
    [timetable, activeDay]
  );

  const SkeletonItem = () => (
    <div className="skeleton" style={{ height: '70px', borderRadius: '20px', marginBottom: '12px' }} />
  );

  return (
    <div style={{ padding: '20px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text, paddingBottom: '120px' }}>
      
      {/* TOAST & MODAL */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toast.type === 'delete' ? '#FF3B30' : '#34C759', color: '#fff', padding: '12px 20px', borderRadius: '50px', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'slideUpToast 0.3s ease-out' }}>
          {toast.type === 'delete' ? <Trash2 size={14}/> : <CheckCircle2 size={14} />} {toast.message.toUpperCase()}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', paddingTop: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '8px', borderRadius: '12px', color: theme.text, display: 'flex' }}><ArrowLeft size={18} /></button>
          <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.8px' }}>TIMETABLE</h2>
        </div>
        <button onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isFormOpen ? theme.card : theme.accent, color: '#fff', border: isFormOpen ? `1px solid ${theme.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isFormOpen ? <X size={20} style={{ color: theme.text }} /> : <Plus size={20} />}
        </button>
      </div>

      {/* DAY PICKER */}
      {!isFormOpen && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }}>
          {days.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} style={{
              padding: '10px 16px', borderRadius: '14px', border: 'none',
              backgroundColor: activeDay === d ? theme.accent : theme.card,
              color: activeDay === d ? '#fff' : (darkMode ? '#666' : '#999'),
              fontWeight: '900', fontSize: '11px', whiteSpace: 'nowrap',
              border: activeDay === d ? 'none' : `1px solid ${theme.border}`,
              transition: 'all 0.2s'
            }}>
              {d.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* FORM */}
      {isFormOpen && (
        <div className={shouldShake ? 'shake' : ''} style={{ backgroundColor: theme.card, padding: '24px', borderRadius: '28px', border: `1px solid ${theme.border}`, marginBottom: '25px', animation: 'fadeIn 0.3s ease' }}>
          <h2 style={{ fontSize: '9px', fontWeight: '900', color: theme.accent, letterSpacing: '1px', marginBottom: '20px' }}>
            {editingId ? 'MODIFY CLASS' : 'ASSIGN NEW CLASS'}
          </h2>

          <div style={{ marginBottom: '14px', position: 'relative' }}>
            <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>COURSE</label>
            <div onClick={() => { setIsCourseDropdownOpen(!isCourseDropdownOpen); setIsDayDropdownOpen(false); }} style={{ padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${errors.course ? '#FF3B30' : theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontWeight: '800', fontSize: '13px', opacity: selectedCourse ? 1 : 0.3 }}>{selectedCourse ? selectedCourse.name : 'Choose course...'}</span>
              <ChevronDown size={16} style={{ opacity: 0.4 }} />
            </div>
            {isCourseDropdownOpen && (
              <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '14px', zIndex: 100, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}>
                {courses.map(c => (
                  <div key={c.id} onClick={() => { setSelectedCourse(c); setIsCourseDropdownOpen(false); setErrors({course:false}); }} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                    <span style={{ fontWeight: '800', fontSize: '12px' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>DAY</label>
              <div onClick={() => { setIsDayDropdownOpen(!isDayDropdownOpen); setIsCourseDropdownOpen(false); }} style={{ padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontWeight: '800', fontSize: '13px' }}>{activeDay.slice(0,3)}</span>
                <ChevronDown size={14} style={{ opacity: 0.4 }} />
              </div>
              {isDayDropdownOpen && (
                <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '14px', zIndex: 100 }}>
                  {days.map(d => (
                    <div key={d} onClick={() => { setActiveDay(d); setIsDayDropdownOpen(false); }} style={{ padding: '12px', borderBottom: `1px solid ${theme.border}`, fontWeight: '900', fontSize: '11px', textAlign: 'center' }}>{d.toUpperCase()}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>TIME</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: '800', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>LOCATION</label>
            <input type="text" maxLength={25} placeholder="Room / Lab" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: '800', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>

          <button onClick={handleSave} disabled={formLoading} style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: theme.accent, color: '#fff', border: 'none', fontWeight: '900', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.5px' }}>
            {formLoading ? <Loader2 className="spin" size={16} /> : (editingId ? 'SAVE CHANGES' : 'ADD CLASS')}
          </button>
        </div>
      )}

      {/* LIST */}
      {!isFormOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            [1, 2, 3].map(i => <SkeletonItem key={i} />)
          ) : currentClasses.length > 0 ? (
            currentClasses.map(item => (
              <div key={item.id} style={{ backgroundColor: theme.card, borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', overflow: 'hidden', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: item.courses?.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: '900', color: item.courses?.color, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{item.courses?.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: '900' }}>
                      <Clock size={14} color={theme.accent} strokeWidth={3} /> {formatTo12Hr(item.start_time)}
                    </div>
                    {item.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', opacity: 0.3 }}><MapPin size={12} strokeWidth={3} /> {item.location}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(item)} style={{ background: theme.bg, border: 'none', color: theme.text, opacity: 0.3, padding: '10px', borderRadius: '10px' }}><Edit2 size={16} /></button>
                  <button onClick={() => confirmDelete(item.id, item.courses?.name)} style={{ background: 'rgba(255,59,48,0.1)', border: 'none', color: '#FF3B30', padding: '10px', borderRadius: '10px' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ height: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
              <CalendarDays size={60} strokeWidth={1} style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: '900', fontSize: '11px', letterSpacing: '2px' }}>FREE DAY</p>
            </div>
          )}
        </div>
      )}

      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: theme.card, padding: '28px', borderRadius: '28px', maxWidth: '300px', width: '100%', textAlign: 'center', border: `1px solid ${theme.border}`, animation: 'scaleUp 0.2s ease' }}>
            <AlertTriangle color="#FF3B30" size={32} style={{ marginBottom: '15px' }}/>
            <h3 style={{ fontWeight: '900', fontSize: '18px', marginBottom: '8px' }}>{modalConfig.title}</h3>
            <p style={{ opacity: 0.5, fontSize: '12px', lineHeight: '1.6', marginBottom: '24px' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: theme.border, color: theme.text, border: 'none', fontWeight: '900', fontSize: '11px' }}>CANCEL</button>
              <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '900', fontSize: '11px' }}>REMOVE</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .skeleton { 
          background: ${darkMode ? '#1A1A1A' : '#E1E1E1'};
          background-image: linear-gradient(90deg, transparent, ${darkMode ? '#222' : '#F0F0F0'}, transparent);
          background-size: 200px 100%;
          background-repeat: no-repeat;
          animation: shimmer 1.5s infinite linear;
        }

        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUpToast { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default ScheduleManager;