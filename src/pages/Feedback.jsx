import React, { useState, useEffect } from 'react';
import { ChevronRight, Send, Star, CheckCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Feedback = ({ setActiveTab, theme, profileData }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [animatingStar, setAnimatingStar] = useState(null);

  const isLight = theme?.bg === '#fff' || theme?.bg === '#ffffff' || !theme?.bg;

  const colors = {
    text: theme?.text || (isLight ? '#000' : '#fff'),
    card: theme?.card || (isLight ? '#f5f5f5' : '#111111'),
    bg: theme?.bg || '#000',
    border: theme?.border || (isLight ? '#ddd' : '#222222'),
    muted: isLight ? '#666666' : '#aaaaaa',
    gold: '#FFD700',
    goldGradient: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
    error: '#FF453A'
  };

  const handleStarClick = (star) => {
    setRating(prev => (prev === star ? 0 : star));
    setAnimatingStar(star);
    setErrorMsg('');
    setTimeout(() => setAnimatingStar(null), 300);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async () => {
    if (rating === 0 || !message.trim()) {
      if (errorMsg) triggerShake();
      setErrorMsg("Rating and message are required.");
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from('feedback')
      .insert([{ 
          user_name: profileData?.full_name || 'Anonymous User', 
          rating, 
          message 
      }]);
    if (!error) setSent(true);
    else {
      triggerShake();
      setErrorMsg("Error sending. Try again.");
    }
    setSending(false);
  };

  return (
    <div style={{ 
      padding: '20px 24px', 
      paddingBottom: '100px', 
      color: colors.text, 
      backgroundColor: colors.bg, 
      height: '100dvh', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      <style>
        {`
          @keyframes starPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
          @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        `}
      </style>

      {/* HEADER: Text Left, Button Right */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingTop: '10px',
        width: '100%' 
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Feedback</h2>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{ background: colors.card, border: `1px solid ${colors.border}`, padding: '10px', borderRadius: '14px', cursor: 'pointer', color: colors.text }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* FLEX SPACER (Top) - Increased weight to push form down further */}
      <div style={{ flex: 0.8 }} />

      {/* CONTENT */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '450px',
        margin: '0 auto',
        width: '100%',
        zIndex: 1
      }}>
        
        {sent ? (
          <div style={{ textAlign: 'center', animation: 'slideUpFade 0.5s ease-out forwards', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', animation: 'float 3s ease-in-out infinite', marginBottom: '20px' }}>
              <CheckCircle size={70} color={colors.gold} style={{ filter: `drop-shadow(0 0 15px ${colors.gold}55)` }} />
              <Sparkles size={24} color={colors.gold} style={{ position: 'absolute', top: -5, left: -15, opacity: 0.7 }} />
            </div>
            <h3 style={{ fontWeight: '900', fontSize: '24px', margin: '0 0 10px 0', background: colors.goldGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              REVIEW RECEIVED
            </h3>
            <div style={{ background: isLight ? '#fff' : `${colors.card}90`, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, padding: '24px', borderRadius: '28px' }}>
              <p style={{ color: colors.text, fontSize: '15px', lineHeight: '1.5', margin: '0 0 8px 0', fontWeight: '700' }}>Your review means a lot.</p>
              <p style={{ color: colors.muted, fontSize: '13px', lineHeight: '1.4', margin: '0 0 20px 0' }}>Every piece of feedback helps forge a better experience.</p>
              
              {/* BACK BUTTON ON SUCCESS SCREEN */}
              <button 
                onClick={() => setActiveTab('profile')}
                style={{
                  background: colors.border,
                  color: colors.text,
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                <ArrowLeft size={14} />
                RETURN
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideUpFade 0.4s ease-out' }}>
            
            <div style={cardStyle(colors, isLight)}>
              <p style={{...labelStyle, color: colors.muted}}>RATE YOUR EXPERIENCE</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={30}
                    fill={rating >= star ? colors.gold : 'transparent'}
                    color={rating >= star ? colors.gold : colors.border}
                    onClick={() => handleStarClick(star)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease', animation: animatingStar === star ? 'starPop 0.3s ease-in-out' : 'none' }}
                  />
                ))}
              </div>
            </div>

            <div style={{
              ...cardStyle(colors, isLight),
              transition: 'all 0.3s ease',
              borderColor: isFocused ? colors.gold : colors.border,
              boxShadow: isFocused ? `0 0 12px rgba(255, 215, 0, 0.12)` : 'none'
            }}>
              <p style={{...labelStyle, color: colors.muted}}>WHAT CAN BE IMPROVED?</p>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setErrorMsg(''); }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Tell me what you love or hate..."
                style={textareaStyle(colors)}
              />
            </div>

            {errorMsg && (
              <div style={{ color: colors.error, fontSize: '11px', textAlign: 'center', fontWeight: '800', animation: shake ? 'shake 0.4s ease' : 'none' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={handleSubmit} disabled={sending} style={submitButtonStyle(colors, sending)}>
                {sending ? 'SENDING...' : 'SUBMIT FEEDBACK'}
                {!sending && <Send size={14} style={{ marginLeft: '8px' }} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLEX SPACER (Bottom) */}
      <div style={{ flex: 1 }} />
      
      <div style={{ 
        textAlign: 'center', 
        opacity: 0.4, 
        fontSize: '10px', 
        fontWeight: '900', 
        letterSpacing: '3px',
        color: colors.text
      }}>
        DELTRYN STUDIOS
      </div>
    </div>
  );
};

const cardStyle = (colors, isLight) => ({
  backgroundColor: colors.card,
  padding: '16px 20px',
  borderRadius: '24px',
  border: `1px solid ${colors.border}`,
});

const labelStyle = { fontSize: '9px', fontWeight: '900', letterSpacing: '1.2px', textAlign: 'center', marginBottom: '6px' };

const textareaStyle = (colors) => ({
  width: '100%', minHeight: '90px', background: 'transparent', border: 'none',
  color: colors.text, fontSize: '14px', outline: 'none', resize: 'none', lineHeight: '1.4'
});

const submitButtonStyle = (colors, sending) => ({
  background: colors.goldGradient, 
  color: '#000', border: 'none', padding: '12px 24px', borderRadius: '50px', 
  fontWeight: '900', fontSize: '13px', cursor: sending ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', 
  opacity: sending ? 0.7 : 1,
  boxShadow: `0 6px 15px rgba(255, 215, 0, 0.2)`,
  transition: 'transform 0.2s ease'
});

export default Feedback;