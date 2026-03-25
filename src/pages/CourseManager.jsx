import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, BookOpen, User, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CourseManager = ({ setActiveTab }) => {
  const [courses, setCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false); 
  
  // Form States
  const [courseName, setCourseName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [selectedColor, setSelectedColor] = useState('#007AFF');

  const colors = ['#007AFF', '#FF9500', '#34C759', '#5856D6', '#FF2D55', '#AF52DE'];

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data) setCourses(data);
  };

  useEffect(() => { fetchCourses(); }, []);

  // 🛡️ UPDATED: The UI Guard Logic
  const addCourse = async () => {
    if (!courseName.trim()) return;

    // 1. Local Guard: Check if the name already exists in our current list (case-insensitive)
    const exists = courses.some(c => c.name.toLowerCase() === courseName.trim().toLowerCase());
    
    if (exists) {
      alert("This course already exists!");
      return; // Stop the function here
    }

    // 2. Database Attempt
    const { error } = await supabase.from('courses').insert([
      { name: courseName.trim(), color: selectedColor, lecturer: lecturer || null }
    ]);

    if (error) {
      // 3. Database Guard: Catches errors if the unique constraint is triggered in Supabase
      console.error("Supabase Error:", error);
      alert("Error: Course name must be unique.");
    } else {
      // Success! Clear and Refresh
      setCourseName('');
      setLecturer('');
      setIsFormOpen(false); 
      fetchCourses();
    }
  };

  const deleteCourse = async (id) => {
    // Basic confirmation so users don't accidentally delete
    if (window.confirm("Delete this course? All associated data might be lost.")) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) fetchCourses();
    }
  };

  return (
    <div style={{ padding: '20px', animation: 'fadeIn 0.3s ease' }}>
      {/* 1. HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: '#111', border: '1px solid #222', padding: '8px', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>COURSES</h2>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{ 
            backgroundColor: isFormOpen ? '#222' : '#007AFF', 
            color: '#fff', 
            padding: '8px 16px', 
            borderRadius: '10px', 
            fontWeight: '700', 
            fontSize: '13px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          {isFormOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
          {isFormOpen ? 'CLOSE' : 'ADD NEW'}
        </button>
      </div>

      {/* 2. COLLAPSIBLE FORM */}
      {isFormOpen && (
        <div style={{ 
          backgroundColor: '#0A0A0A', 
          padding: '20px', 
          borderRadius: '20px', 
          border: '1px solid #1a1a1a', 
          marginBottom: '30px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '11px', color: '#555', fontWeight: '800', display: 'block', marginBottom: '8px' }}>COURSE NAME *</label>
            <input 
              type="text" 
              placeholder="e.g. Data Structures" 
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: '#555', fontWeight: '800', display: 'block', marginBottom: '8px' }}>LECTURER (OPTIONAL)</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
              <input 
                type="text" 
                placeholder="Dr. Smith" 
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {colors.map(color => (
                <button 
                  key={color} 
                  onClick={() => setSelectedColor(color)}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color, border: selectedColor === color ? '2px solid #fff' : 'none', cursor: 'pointer' }}
                />
              ))}
            </div>
            <button 
              onClick={addCourse} 
              style={{ backgroundColor: '#007AFF', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
            >
              SAVE COURSE
            </button>
          </div>
        </div>
      )}

      {/* 3. LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {courses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#444', marginTop: '20px', fontSize: '14px' }}>No courses added yet.</p>
        ) : (
          courses.map(course => (
            <div key={course.id} style={{ padding: '18px', backgroundColor: '#0A0A0A', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '4px', height: '35px', backgroundColor: course.color, borderRadius: '10px' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff' }}>{course.name}</div>
                  {course.lecturer && (
                    <div style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> {course.lecturer}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => deleteCourse(course.id)} 
                style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseManager;