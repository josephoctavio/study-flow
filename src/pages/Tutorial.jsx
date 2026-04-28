import React from 'react';
import { ArrowLeft, BookPlus, CalendarDays, CheckCircle2, Rocket } from 'lucide-react';

const Tutorial = ({ theme, setActiveTab }) => {
  const steps = [
    {
      title: "Step 1: Adding Courses",
      description: "Head to the Course Manager. Without courses, the rest of the app won't function!",
      icon: <BookPlus size={20} color={theme.accent} />,
      actionLabel: "Add Courses",
      action: () => setActiveTab('course-manager'), // Corrected: Leads to Course Manager
    },
    {
      title: "Step 2: Set Your Schedule",
      description: "Use the Schedule Manager to map out your week and never miss a class.",
      icon: <CalendarDays size={20} color="#FF9500" />,
      actionLabel: "Setup Schedule",
      action: () => setActiveTab('schedule-manager'), // Corrected: Leads to Schedule Manager
    },
    {
      title: "Step 3: Track Tasks",
      description: "Add your assignments in the Tasks tab to see your productivity score grow.",
      icon: <CheckCircle2 size={20} color="#34C759" />,
      actionLabel: "Go to Tasks",
      action: () => setActiveTab('tasks'), // Corrected: Leads to Tasks
    }
  ];

  return (
    <div style={{ 
      padding: '24px', 
      minHeight: '100vh', 
      backgroundColor: theme.bg, 
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', paddingTop: '20px' }}>
        <button 
          onClick={() => setActiveTab('home')} 
          style={{ 
            background: `${theme.card}`, 
            border: `1px solid ${theme.border}`, 
            color: theme.text, 
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Tutorial</h1>
          <p style={{ fontSize: '13px', opacity: 0.5, margin: 0 }}>Master the Forge in seconds</p>
        </div>
      </header>

      {/* Intro section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.accent, marginBottom: '8px' }}>
          Focus Forge is an app that...
        </h2>
        <p style={{ fontSize: '15px', opacity: 0.7, lineHeight: '1.5' }}>
          Helps you dominate your semester. Let’s get you set up in three main steps.
        </p>
      </div>

      {/* Interactive Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {steps.map((step, index) => (
          <div 
            key={index} 
            style={{ 
              backgroundColor: theme.card, 
              padding: '20px', 
              borderRadius: '24px', 
              border: `1px solid ${theme.border}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                backgroundColor: `${theme.bg}`, 
                padding: '12px', 
                borderRadius: '16px', 
                height: 'fit-content',
                border: `1px solid ${theme.border}`
              }}>
                {step.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700' }}>{step.title}</h3>
                <p style={{ fontSize: '13px', opacity: 0.6, lineHeight: '1.4', margin: 0 }}>{step.description}</p>
              </div>
            </div>

            {/* In-Step Action Button */}
            <button 
              onClick={step.action}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: `${theme.accent}15`, 
                color: theme.accent, 
                fontWeight: '700', 
                fontSize: '13px',
                border: `1px solid ${theme.accent}33`, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {step.actionLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Sleek Start Button */}
      <button 
        onClick={() => setActiveTab('home')} // Corrected: Leads back Home
        style={{ 
          width: '100%', 
          padding: '18px', 
          borderRadius: '20px', 
          backgroundColor: theme.text, 
          color: theme.bg, 
          fontWeight: '900', 
          border: 'none', 
          marginTop: '40px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }}
      >
        <Rocket size={20} />
        START FORGING
      </button>

      <p style={{ textAlign: 'center', fontSize: '11px', opacity: 0.4, marginTop: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
        FOCUS FORGE v1.0
      </p>
    </div>
  );
};

export default Tutorial;