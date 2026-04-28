import React, { useEffect, useState } from 'react';
import { ChevronLeft, Star, Clock, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AdminFeedback = ({ setActiveTab, theme }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    text: theme?.text || '#fff',
    card: theme?.card || '#111111',
    bg: theme?.bg || '#000',
    border: theme?.border || '#222222',
    accent: theme?.accent || '#007AFF',
    muted: theme?.muted || '#888888'
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setFeedbacks(data);
      setLoading(false);
    };
    fetchFeedback();
  }, []);

  return (
    <div style={{ padding: '24px', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingTop: '20px' }}>
        <button onClick={() => setActiveTab('profile')} style={backButtonStyle(colors)}>
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>DEV CONSOLE</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading logs...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {feedbacks.map((f) => (
            <div key={f.id} style={cardStyle(colors)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} color={colors.accent} />
                  <span style={{ fontSize: '12px', fontWeight: '800' }}>{f.user_name.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < f.rating ? "#FFCC00" : "transparent"} color={i < f.rating ? "#FFCC00" : colors.muted} />
                  ))}
                </div>
              </div>
              
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 12px 0', color: colors.text }}>
                {f.message}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.3 }}>
                <Clock size={10} />
                <span style={{ fontSize: '10px', fontWeight: '700' }}>
                  {new Date(f.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const cardStyle = (colors) => ({
  backgroundColor: colors.card,
  padding: '20px',
  borderRadius: '24px',
  border: `1px solid ${colors.border}`
});

const backButtonStyle = (colors) => ({
  background: colors.card, border: `1px solid ${colors.border}`, padding: '10px', borderRadius: '14px', cursor: 'pointer', color: colors.text
});

export default AdminFeedback;