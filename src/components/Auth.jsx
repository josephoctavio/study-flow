import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, Save } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    // 1. Detect if the user arrived here from a recovery email link
    // Supabase puts "type=recovery" in the URL hash when you click that link
    if (window.location.hash.includes('type=recovery')) {
      setIsUpdatingPassword(true);
    }

    // 2. Also listen for the internal Supabase event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsUpdatingPassword(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isUpdatingPassword) {
        // STEP: Save the NEW password
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        alert('Password saved! Please log in with your new password.');
        
        // Redirect back to normal login state
        setIsUpdatingPassword(false);
        setPassword('');
        window.location.hash = ''; // Clear the recovery token from URL
      } else if (resetMode) {
        // STEP: Send the email link
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, 
        });
        if (error) throw error;
        alert('Check your email for the reset link!');
        setResetMode(false);
      } else if (isSignUp) {
        // STEP: Sign Up
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, full_name: fullName }]);
        }
        alert('Account created!');
      } else {
        // STEP: Normal Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 font-sans">
      <div className="w-full max-w-md space-y-6 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                <ShieldCheck className="text-blue-500" size={32} />
             </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {isUpdatingPassword ? 'Set New Password' : resetMode ? 'Reset Password' : isSignUp ? 'Join StudyFlow' : 'Welcome Back'}
          </h2>
          <p className="text-zinc-500 text-sm">
            {isUpdatingPassword ? 'Type your new password below' : resetMode ? 'Check your email after sending' : 'Your Academic Command Center'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Back button for non-login states */}
          {(resetMode || isUpdatingPassword) && (
            <button 
              type="button" 
              onClick={() => { setResetMode(false); setIsUpdatingPassword(false); }}
              className="flex items-center text-xs text-blue-500 gap-1 hover:underline mb-2"
            >
              <ArrowLeft size={14} /> Back to login
            </button>
          )}

          {/* Registration only */}
          {isSignUp && !resetMode && !isUpdatingPassword && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-zinc-600" size={18} />
              <input
                className="w-full p-3.5 pl-11 bg-black/40 border border-zinc-800 rounded-xl outline-none"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email input (Hidden when actually typing the new password) */}
          {!isUpdatingPassword && (
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-600" size={18} />
              <input
                className="w-full p-3.5 pl-11 bg-black/40 border border-zinc-800 rounded-xl outline-none"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {/* Password input (Hidden when only requesting the reset email) */}
          {!resetMode && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-600" size={18} />
              <input
                className="w-full p-3.5 pl-11 pr-11 bg-black/40 border border-zinc-800 rounded-xl outline-none"
                type={showPassword ? "text" : "password"}
                placeholder={isUpdatingPassword ? "Enter New Password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-zinc-600 hover:text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
          >
            {loading ? 'Processing...' : isUpdatingPassword ? 'Save New Password' : resetMode ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="flex flex-col gap-3 pt-2">
          {!resetMode && !isSignUp && !isUpdatingPassword && (
            <button onClick={() => setResetMode(true)} className="text-xs text-zinc-500 hover:text-blue-500">
              Forgot your password?
            </button>
          )}

          {!isUpdatingPassword && (
            <button onClick={() => { setIsSignUp(!isSignUp); setResetMode(false); }} className="text-sm text-zinc-400">
              {isSignUp ? <span>Already have an account? <span className="text-white font-semibold">Login</span></span> : <span>Don't have an account? <span className="text-white font-semibold">Sign Up</span></span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}