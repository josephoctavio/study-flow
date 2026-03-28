import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  GraduationCap, 
  AlertCircle,
  X 
} from 'lucide-react';

export default function Auth({ forceRecovery = false }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(forceRecovery); 
  const [showPassword, setShowPassword] = useState(false);
  
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [errorShake, setErrorShake] = useState(false);
  
  const [showLegal, setShowLegal] = useState(false);
  const [legalType, setLegalType] = useState('terms');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const theme = {
    bg: '#000000',
    card: '#111111',
    border: '#222222',
    accent: '#007AFF',
    text: '#FFFFFF',
    danger: '#FF3B30',
    success: '#34C759'
  };

  useEffect(() => {
    if (forceRecovery) {
        setIsUpdatingPassword(true);
        return;
    }
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setIsUpdatingPassword(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsUpdatingPassword(true);
    });
    return () => subscription.unsubscribe();
  }, [forceRecovery]);

  const showStatus = (text, type = 'error') => {
    setMsg({ text, type });
    if (type === 'error') {
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 500);
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' }); 
    setLoading(true);

    if (!resetMode && password.length < 6) return showStatus("Password must be at least 6 characters.");
    if (isSignUp && !fullName) return showStatus("Please enter your full name.");

    try {
      if (isUpdatingPassword) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        window.location.hash = '';
        window.location.reload(); 
      } 
      else if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, 
        });
        if (error) throw error;
        showStatus("Recovery link sent! Check your inbox.", "success");
      } 
      else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
            email, password,
            options: { data: { full_name: fullName } } 
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, full_name: fullName, dark_mode: true }]);
        }
        showStatus("Account created! Please verify your email.", "success");
      } 
      else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      showStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px', position: 'relative' }}>
      
      {/* BRANDING (TOP LEFT) */}
      <div style={{ paddingTop: '10px', width: '100%' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-1.2px', margin: 0 }}>Focus Forge</h1>
        <p style={{ opacity: 0.4, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '2px' }}>
            By Deltryn Studios
        </p>
      </div>

      {/* CENTERED AUTH CARD */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={errorShake ? 'shake' : ''} style={{ 
          width: '100%', maxWidth: '400px', backgroundColor: theme.card, 
          padding: '32px', borderRadius: '32px', border: `1px solid ${theme.border}`,
          boxShadow: '0 25px 70px rgba(0,0,0,0.7)', textAlign: 'center'
        }}>
          
          {/* ICON TOP OF FORM */}
          <div style={{ 
              width: '56px', height: '56px', backgroundColor: `${theme.accent}15`, 
              borderRadius: '16px', border: `1px solid ${theme.accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto'
          }}>
            <GraduationCap size={28} color={theme.accent} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '28px', letterSpacing: '-0.5px' }}>
            {isUpdatingPassword ? 'New Password' : resetMode ? 'Recover Access' : isSignUp ? 'Join the Flow' : 'Sign In'}
          </h2>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            
            {(resetMode || (isUpdatingPassword && !forceRecovery)) && (
              <button 
                type="button" 
                onClick={() => { setResetMode(false); setIsUpdatingPassword(false); setMsg({text:'', type:''}); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: theme.accent, fontSize: '11px', fontWeight: '800', padding: 0, cursor: 'pointer', marginBottom: '8px' }}
              >
                <ArrowLeft size={14} /> BACK TO LOGIN
              </button>
            )}

            {isSignUp && !resetMode && !isUpdatingPassword && (
              <div style={inputContainerStyle}>
                <User style={iconStyle} size={18} />
                <input style={{...inputStyle, borderColor: theme.border}} placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            )}

            {!isUpdatingPassword && (
              <div style={inputContainerStyle}>
                <Mail style={iconStyle} size={18} />
                <input style={{...inputStyle, borderColor: theme.border}} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

            {!resetMode && (
              <div style={inputContainerStyle}>
                <Lock style={iconStyle} size={18} />
                <input 
                  style={{...inputStyle, borderColor: theme.border}} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeButtonStyle}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {msg.text && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '14px', 
                backgroundColor: msg.type === 'success' ? `${theme.success}10` : `${theme.danger}10`, 
                border: `1px solid ${msg.type === 'success' ? `${theme.success}20` : `${theme.danger}20`}` 
              }}>
                <AlertCircle size={14} color={msg.type === 'success' ? theme.success : theme.danger} />
                <p style={{ color: msg.type === 'success' ? theme.success : theme.danger, fontSize: '10px', fontWeight: '800', margin: 0 }}>
                  {msg.text.toUpperCase()}
                </p>
              </div>
            )}

            <button disabled={loading} style={submitButtonStyle(theme)}>
              {loading ? 'PROCESSING...' : isUpdatingPassword ? 'SAVE PASSWORD' : resetMode ? 'SEND LINK' : isSignUp ? 'CREATE ACCOUNT' : 'CONTINUE'}
            </button>
          </form>

          <div style={{ marginTop: '24px' }}>
            {!isUpdatingPassword && (
              <button onClick={() => { setIsSignUp(!isSignUp); setResetMode(false); setMsg({text:'', type:''}); }} style={toggleButtonStyle}>
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            )}
            {!isSignUp && !resetMode && !isUpdatingPassword && (
              <button onClick={() => setResetMode(true)} style={forgotButtonStyle(theme)}>
                Forgot Password?
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', paddingBottom: '20px', opacity: 0.4 }}>
        <p style={{ fontSize: '10px', fontWeight: '700', lineHeight: '1.8' }}>
          <span 
            onClick={() => { setLegalType('terms'); setShowLegal(true); }} 
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >Terms</span> • <span 
            onClick={() => { setLegalType('privacy'); setShowLegal(true); }} 
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >Privacy</span> • <a href="mailto:deltrynstudios@gmail.com" style={{ textDecoration: 'underline', color: 'inherit' }}>Support</a>
        </p>
      </div>

      {/* SLIM SCROLLABLE LEGAL MODAL */}
      {showLegal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(6px)' }}>
          <div style={{ backgroundColor: theme.card, width: '100%', maxWidth: '300px', borderRadius: '24px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
            
            <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>{legalType === 'terms' ? 'TERMS' : 'PRIVACY'}</span>
                <button onClick={() => setShowLegal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18}/></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ fontSize: '12px', lineHeight: '1.7', opacity: 0.7, color: '#fff' }}>
                {legalType === 'terms' ? (
                  <>
                    <p><b>1. Acceptance:</b> By using Focus Forge, you agree to these terms.</p>
                    <p><b>2. Security:</b> You are responsible for your own password and account activity.</p>
                    <p><b>3. Service:</b> Built by Deltryn Studios. Provided "as is" for academic assistance.</p>
                    <p><b>4. Fair Use:</b> No automated scraping or malicious database access allowed.</p>
                  </>
                ) : (
                  <>
                    <p><b>1. Data:</b> Your data belongs to you. We only store what is needed to manage your schedule.</p>
                    <p><b>2. Email:</b> Used only for login and recovery. No third-party spam.</p>
                    <p><b>3. Storage:</b> Powered by Supabase. Your information is never sold.</p>
                    <p><b>4. Control:</b> You can delete your account and all associated data at any time.</p>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: '16px', borderTop: `1px solid ${theme.border}` }}>
                <button 
                  onClick={() => setShowLegal(false)}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: theme.text, color: theme.bg, fontWeight: '900', border: 'none', fontSize: '12px' }}
                >
                  DISMISS
                </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

const inputContainerStyle = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconStyle = { position: 'absolute', left: '16px', color: '#555' };

// Fixed color: '#FFFFFF' ensures you can see white text on the black input field
const inputStyle = { 
  width: '100%', 
  padding: '16px 16px 16px 48px', 
  backgroundColor: '#000000', 
  border: '1px solid', 
  borderRadius: '16px', 
  color: '#FFFFFF', 
  fontSize: '14px', 
  fontWeight: '600',
  outline: 'none' 
};

const eyeButtonStyle = { position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' };
const submitButtonStyle = (theme) => ({ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: theme.text, color: theme.bg, fontWeight: '900', fontSize: '14px', cursor: 'pointer', marginTop: '10px' });
const toggleButtonStyle = { background: 'none', border: 'none', color: '#666', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const forgotButtonStyle = (theme) => ({ background: 'none', border: 'none', color: theme.accent, fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'block', margin: '12px auto 0 auto' });