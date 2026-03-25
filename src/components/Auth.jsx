import { useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this path matches your setup

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // 2. Insert into our custom profiles table (Matric No omitted)
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                full_name: fullName 
              }
            ]);
          if (profileError) throw profileError;
        }
        alert('Check your email for the confirmation link!');
      } else {
        // Login logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-zinc-400 mt-2">StudyFlow Academic Command Center</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input
              className="w-full p-3 bg-black border border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            className="w-full p-3 bg-black border border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 bg-black border border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-zinc-500 hover:text-white transition-colors"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}