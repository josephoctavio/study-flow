import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, MapPin, Edit2, X, AlertTriangle, ChevronDown, CheckCircle2, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ScheduleManager = ({ setActiveTab, theme, darkMode, courses, timetable, loading, refreshData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] || 'Monday');

  // Form States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  
  // Validation States
  const [errorMsg, setErrorMsg] = useState(null);
  const [shouldShake, setShouldShake] = useState(false);

  // UX States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Clear error message automatically when user changes inputs
  useEffect(() => {
    if (errorMsg) setErrorMsg(null);
  }, [startTime, endTime, selectedCourse]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  const formatTo12Hr = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const handleSave = async () => {
    // 1. Clear previous errors
    setErrorMsg(null);

    // 2. Validation Checks
    if (!selectedCourse) return triggerError("Please select a course");
    if (!startTime || !endTime) return triggerError("Both start and end times are required");
    
    // Convert times to numbers for comparison (e.g., "09:00" -> 900)
    const startVal = parseInt(startTime.replace(':', ''));
    const endVal = parseInt(endTime.replace(':', ''));
    
    if (startVal >= endVal) {
      return triggerError("The class cannot end before it starts!");
    }

    setFormLoading(true);

    const payload = { 
      course_id: selectedCourse.id, 
      day_of_week: activeDay, 
      start_time: startTime,
      end_time: endTime,
      location: location.trim() 
    };

    const { error } = editingId 
      ? await supabase.from('timetable').update(payload).eq('id', editingId)
      : await supabase.from('timetable').insert([payload]);

    if (!error) {
      showToast(editingId ? "Schedule Updated" : "Class Added");
      refreshData();
      resetForm();
    } else {
      console.error("Supabase Error:", error);
      triggerError(error.message || "Database connection error");
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
    setStartTime(item.start_time || '');
    setEndTime(item.end_time || '');
    setLocation(item.location || '');
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedCourse(null);
    setStartTime('');
    setEndTime('');
    setLocation('');
    setIsFormOpen(false);
    setIsCourseDropdownOpen(false);
    setErrorMsg(null);
  };

  const currentClasses = useMemo(() => {
    return [...timetable]
      .filter(t => t.day_of_week === activeDay)
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
  }, [timetable, activeDay]);

  return (
    <div style={{ padding: '24px', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text, paddingBottom: '120px' }}>
      
      {/* TOAST NOTIFICATIONS */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toast.type === 'delete' ? '#FF3B30' : '#34C759', color: '#fff', padding: '12px 20px', borderRadius: '50px', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'slideUpToast 0.3s ease-out' }}>
          {toast.type === 'delete' ? <Trash2 size={14}/> : <CheckCircle2 size={14} />} {toast.message.toUpperCase()}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '8px', borderRadius: '12px', color: theme.text, display: 'flex' }}><ArrowLeft size={18} /></button>
          <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>TIMETABLE</h2>
        </div>
        <button onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)} style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: isFormOpen ? theme.card : theme.accent, color: isFormOpen ? theme.text : '#fff', border: isFormOpen ? `1px solid ${theme.border}` : 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '11px' }}>
          {isFormOpen ? <X size={14} /> : <Plus size={14} />} {isFormOpen ? 'CLOSE' : 'ADD CLASS'}
        </button>
      </div>

      {/* HORIZONTAL DAY PICKER */}
      {!isFormOpen && (
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '20px' }}>
          {days.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} style={{ padding: '10px 18px', borderRadius: '14px', border: `1px solid ${activeDay === d ? theme.accent : theme.border}`, backgroundColor: activeDay === d ? theme.accent : theme.card, color: activeDay === d ? '#fff' : theme.text, opacity: activeDay === d ? 1 : 0.6, fontWeight: '900', fontSize: '11px', whiteSpace: 'nowrap', transition: '0.2s' }}>
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ADD/EDIT FORM */}
      {isFormOpen && (
        <div className={shouldShake ? 'shake' : ''} style={{ backgroundColor: theme.card, padding: '24px', borderRadius: '28px', border: `1px solid ${errorMsg ? '#FF3B30' : theme.border}`, marginBottom: '25px', animation: 'fadeIn 0.3s ease' }}>
          
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block' }}>COURSE</label>
            <div onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)} style={{ padding: '14px', borderRadius: '14px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontWeight: '800', fontSize: '13px', opacity: selectedCourse ? 1 : 0.3 }}>{selectedCourse ? `${selectedCourse.course_code}: ${selectedCourse.name}` : 'Select course...'}</span>
              <ChevronDown size={16} />
            </div>
            {isCourseDropdownOpen && (
              <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '16px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                {courses.map(c => (
                  <div key={c.id} onClick={() => { setSelectedCourse(c); setIsCourseDropdownOpen(false); }} style={{ padding: '14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '3px 6px', borderRadius: '5px', backgroundColor: `${c.color}20`, color: c.color, fontSize: '9px', fontWeight: '900' }}>{c.course_code}</div>
                    <span style={{ fontWeight: '700', fontSize: '12px' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block' }}>START TIME</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: '800' }} />
            </div>
            <div>
              <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block' }}>END TIME</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: '800' }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4, marginBottom: '8px', display: 'block' }}>LOCATION</label>
            <input type="text" placeholder="e.g. Hall 4 / Zoom" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: '700' }} />
          </div>

          {errorMsg && (
            <div style={{ color: '#FF3B30', fontSize: '10px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,59,48,0.1)', padding: '12px', borderRadius: '12px' }}>
              <AlertCircle size={14}/> {errorMsg.toUpperCase()}
            </div>
          )}

          <button onClick={handleSave} disabled={formLoading} style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: theme.accent, color: '#fff', border: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {formLoading ? <Loader2 className="spin" size={18} /> : (editingId ? 'UPDATE SCHEDULE' : 'SAVE TO TIMETABLE')}
          </button>
        </div>
      )}

      {/* TIMELINE VIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {!isFormOpen && currentClasses.length > 0 && (
          <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', backgroundColor: theme.border, zIndex: 0 }} />
        )}

        {currentClasses.length > 0 ? currentClasses.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.courses?.color || theme.accent, border: `3px solid ${theme.bg}`, boxShadow: `0 0 0 1px ${theme.border}` }} />
            </div>
            <div style={{ flex: 1, backgroundColor: theme.card, borderRadius: '22px', border: `1px solid ${theme.border}`, padding: '18px', marginTop: '-8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', backgroundColor: `${item.courses?.color}15`, color: item.courses?.color, padding: '2px 6px', borderRadius: '5px' }}>{item.courses?.course_code}</span>
                    <h3 style={{ fontSize: '14px', fontWeight: '800' }}>{item.courses?.name}</h3>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} /> {formatTo12Hr(item.start_time)} — {formatTo12Hr(item.end_time)}
                  </div>
                  {item.location && <div style={{ fontSize: '11px', color: theme.muted, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><MapPin size={10} /> {item.location}</div>}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEdit(item)} style={{ padding: '8px', borderRadius: '8px', color: theme.text, opacity: 0.3 }}><Edit2 size={16} /></button>
                  <button onClick={() => confirmDelete(item.id, item.courses?.name)} style={{ padding: '8px', borderRadius: '8px', color: '#FF3B30' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        )) : !isFormOpen && (
          <div style={{ textAlign: 'center', opacity: 0.2, marginTop: '100px' }}>
            <CalendarDays size={60} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>NO CLASSES SCHEDULED</p>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: theme.card, padding: '28px', borderRadius: '30px', maxWidth: '320px', width: '100%', textAlign: 'center', border: `1px solid ${theme.border}` }}>
            <AlertTriangle color="#FF3B30" size={32} style={{ marginBottom: '15px', margin: '0 auto' }}/>
            <h3 style={{ fontWeight: '900', fontSize: '18px', marginBottom: '8px' }}>{modalConfig.title}</h3>
            <p style={{ opacity: 0.5, fontSize: '13px', marginBottom: '24px' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: theme.border, color: theme.text, border: 'none', fontWeight: '900' }}>CANCEL</button>
              <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: '900' }}>REMOVE</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .shake { animation: shake 0.4s both; }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUpToast { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default ScheduleManager;