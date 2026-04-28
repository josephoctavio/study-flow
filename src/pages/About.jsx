import React from 'react';
import { ChevronLeft, Flame, MessageSquare, Heart, Coffee, ShieldCheck } from 'lucide-react';

const About = ({ setActiveTab, theme, darkMode }) => {
  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#111111',
    bg: theme?.bg || '#000',
    border: theme?.border || '#222222',
    accent: theme?.accent || '#FFB800',
    muted: theme?.muted || '#888888'
  };

  return (
    <div style={{ padding: '24px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '120px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Subtle Background Pattern */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, pointerEvents: 'none' }}>
        <Flame size={400} />
      </div>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', paddingTop: '20px' }}>
        <button onClick={() => setActiveTab('profile')} style={navButtonStyle(colors)}>
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '900', marginLeft: '16px', letterSpacing: '-0.5px' }}>About Focus Forge</h2>
      </div>

      {/* BADGE ICON */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFB800 0%, #FF5C00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 30px rgba(255, 92, 0, 0.3)' }}>
          <Flame color="#fff" size={45} />
        </div>
      </div>

      {/* CONTENT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* About Card */}
        <div style={cardStyle(colors)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck size={20} color={colors.accent} />
            <h4 style={{ margin: 0, fontWeight: '800' }}>The Mission</h4>
          </div>
          <p style={bodyStyle(colors)}>Focus Forge is a self-development project built to optimize workflow efficiency. We provide the tools you need to build organized, high-impact study sessions.</p>
        </div>

        {/* Support Card */}
        <div style={{ ...cardStyle(colors), border: `1px solid ${colors.accent}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Heart size={20} color={colors.accent} />
            <h4 style={{ margin: 0, fontWeight: '800' }}>Financial Support</h4>
          </div>
          <p style={bodyStyle(colors)}>As an indie project, your support helps cover server costs and ongoing development. If you'd like to contribute, you can support us via our secure payment portal.</p>
          <button style={actionButtonStyle(colors)}>
            <Coffee size={16} /> Contribute to the Forge
          </button>
        </div>

      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', opacity: 0.6 }}>DELTRYN STUDIOS</p>
        <p style={{ fontSize: '10px', marginTop: '6px', opacity: 0.4 }}>V 1.2.0 BETA</p>
      </div>
    </div>
  );
};

// Styles
const navButtonStyle = (colors) => ({
  background: colors.card, border: `1px solid ${colors.border}`, padding: '10px', borderRadius: '14px', cursor: 'pointer', color: colors.text
});

const cardStyle = (colors) => ({
  backgroundColor: colors.card, padding: '24px', borderRadius: '24px', border: `1px solid ${colors.border}`
});

const bodyStyle = (colors) => ({
  fontSize: '14px', lineHeight: '1.6', color: colors.muted, margin: 0
});

const actionButtonStyle = (colors) => ({
  marginTop: '16px', width: '100%', padding: '14px', backgroundColor: colors.accent, color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
});

export default About;