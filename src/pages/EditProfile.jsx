import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Home, X, Edit3, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const BASE_URL = "https://hcdgxxcjmamrlojhshxa.supabase.co/storage/v1/object/public/avatars/";

const AVATAR_OPTIONS = [
  { id: 'av1', url: `${BASE_URL}av1.png` },
  { id: 'av2', url: `${BASE_URL}av2.png` },
  { id: 'av3', url: `${BASE_URL}av3.png` },
  { id: 'av4', url: `${BASE_URL}av4.png` },
  { id: 'av5', url: `${BASE_URL}av5.png` },
  { id: 'av6', url: `${BASE_URL}av6.png` },
  { id: 'av7', url: `${BASE_URL}av7.png` },
  { id: 'av8', url: `${BASE_URL}av8.png` },
  { id: 'av9', url: `${BASE_URL}av9.png` },
  { id: 'av10', url: `${BASE_URL}av10.png` },
  { id: 'av11', url: `${BASE_URL}av11.png` },
  { id: 'av12', url: `${BASE_URL}av12.png` },
];

const EditProfile = ({ onBack, theme }) => {
  const [loading, setLoading] = useState(false);
  const [showTray, setShowTray] = useState(false);
  const [isClosing, setIsClosing] = useState(false); 
  const [profile, setProfile] = useState({ full_name: '', matric_no: '', avatar_id: 'av1' });
  const [toast, setToast] = useState({ show: false, message: '' });

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#1c1c1e',
    bg: theme?.bg || '#000',
    border: theme?.border || '#2c2c2e',
    accent: '#007AFF'
  };

  useEffect(() => { getProfile(); }, []);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile({ 
        full_name: data.full_name || '', 
        matric_no: data.matric_no || '',
        avatar_id: data.avatar_id || 'av1'
      });
    }
  }

  const closeTray = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowTray(false);
      setIsClosing(false);
    }, 300); 
  };

  const handleSave = async () => {
    if (!profile.full_name.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        matric_no: profile.matric_no,
        avatar_id: profile.avatar_id,
        updated_at: new Date(),
      });
      setToast({ show: true, message: 'Identity Synced!' });
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (e) { setLoading(false); }
  };

  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_id) || AVATAR_OPTIONS[0];

  return (
    <div style={{ padding: '20px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh' }}>
      
      {toast.show && <div style={toastStyle}>{toast.message}</div>}

      {/* HEADER SECTION - Now perfectly centered */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '40px', marginBottom: '40px' }}>
        <button className="action-btn" onClick={onBack} style={{ position: 'relative', zIndex: 10, background: 'transparent', border: 'none', color: colors.accent, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
            <ArrowLeft size={20} /> <span style={{fontSize: '11px'}}>BACK</span>
        </button>
        <h2 style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', margin: 0, fontSize: '13px', fontWeight: '900', letterSpacing: '1.5px', opacity: 0.6, whiteSpace: 'nowrap' }}>
          EDIT PROFILE
        </h2>
      </div>

      {/* AVATAR DISPLAY */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={() => setShowTray(true)}>
          <div style={{ 
            width: '110px', height: '110px', borderRadius: '40px', 
            backgroundColor: colors.card, border: `3px solid ${colors.accent}`,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 15px 35px rgba(0,122,255,0.2)`
          }}>
            <img src={currentAvatar.url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ 
            position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: colors.accent, 
            padding: '8px', borderRadius: '14px', border: `3px solid ${colors.bg}`, color: 'white'
          }}>
            <Edit3 size={14} />
          </div>
        </div>
      </div>

      {/* INPUTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        <div style={inputGroup}>
          <label style={labelStyle}>DISPLAY NAME</label>
          <input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} style={inputStyle(colors)} placeholder="Your Name" />
        </div>
        <div style={inputGroup}>
          <label style={labelStyle}>MATRIC NUMBER</label>
          <input value={profile.matric_no} onChange={e => setProfile({...profile, matric_no: e.target.value})} style={inputStyle(colors)} placeholder="U20XX/..." />
        </div>
      </div>

      {/* INFO TEXT - Now a clear bulleted list */}
      <div style={{ backgroundColor: 'rgba(0,122,255,0.05)', padding: '16px 20px', borderRadius: '18px', border: `1px solid rgba(0,122,255,0.1)`, display: 'flex', gap: '12px', marginBottom: '25px' }}>
          <AlertCircle size={18} color={colors.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', lineHeight: '1.6', opacity: 0.7, fontWeight: '600', color: colors.text }}>
            <li style={{ marginBottom: '8px' }}>The application will refresh after saving to sync your new character and identity across all schedules.</li>
            <li>Your Matric Number is solely for local identification. We do not use it for any external purpose.</li>
          </ul>
      </div>

      <button className="action-btn" onClick={handleSave} disabled={loading} style={saveBtn(colors)}>
        {loading ? <Loader2 className="spin" /> : <Home size={18} />}
        {loading ? 'SYNCING...' : 'SAVE & RETURN HOME'}
      </button>

      {/* THE SLIDE-UP TRAY */}
      {showTray && (
        <div 
          style={{...overlayStyle, opacity: isClosing ? 0 : 1}} 
          onClick={closeTray}
        >
          <div 
            style={{ 
              ...trayStyle, 
              backgroundColor: colors.card, 
              animation: isClosing ? 'slideDown 0.3s forwards' : 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={trayHeader}>
              <span style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>PICK A CHARACTER</span>
              <button className="action-btn" onClick={closeTray} style={closeBtn}><X size={20} /></button>
            </div>
            
            <div className="hide-scrollbar" style={scrollArea}>
              <div style={iconGrid}>
                {AVATAR_OPTIONS.map(option => (
                  <button 
                    key={option.id}
                    className="action-btn"
                    onClick={() => { setProfile({...profile, avatar_id: option.id}); closeTray(); }}
                    style={{
                      ...avatarCircle,
                      borderColor: profile.avatar_id === option.id ? colors.accent : colors.border,
                      backgroundColor: profile.avatar_id === option.id ? 'rgba(0,122,255,0.1)' : 'transparent'
                    }}
                  >
                    <img 
                      src={option.url} 
                      alt="option" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        display: 'block' 
                      }} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        
        /* Clean scrollbar & responsive clicks */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .action-btn { cursor: pointer; transition: transform 0.1s ease; }
        .action-btn:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
};

/* Extracted Styles */
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '10px', fontWeight: '900', opacity: 0.4, letterSpacing: '1px', marginLeft: '5px' };
const inputStyle = (c) => ({ width: '100%', padding: '18px', backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: '20px', color: c.text, fontWeight: '600', outline: 'none' });
const saveBtn = (c) => ({ width: '100%', backgroundColor: c.accent, color: 'white', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' });
const toastStyle = { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#34C759', color: '#fff', padding: '12px 25px', borderRadius: '50px', zIndex: 10000, fontWeight: '900', fontSize: '13px' };
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', transition: 'opacity 0.3s ease' };
const trayStyle = { width: '100%', borderTopLeftRadius: '35px', borderTopRightRadius: '35px', padding: '25px', paddingBottom: '40px' };
const trayHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' };

/* Transparent X button with flex centering to prevent white boxes */
const closeBtn = { background: 'transparent', border: 'none', color: 'inherit', opacity: 0.4, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' };

const scrollArea = { maxHeight: '350px', overflowY: 'auto', paddingRight: '4px', WebkitOverflowScrolling: 'touch' };
const iconGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', paddingBottom: '60px' };
const avatarCircle = { width: '100%', aspectRatio: '1 / 1', borderRadius: '22px', border: '2px solid', overflow: 'hidden', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 0 };

export default EditProfile;