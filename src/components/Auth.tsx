import React, { useState } from 'react';
import { auth, signInWithGoogle } from '../lib/auth';
import { Lock, Mail, User, LogIn, AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        const { session } = await auth.signIn(email.trim(), password);
        
        if (session) {
          onAuthSuccess();
        }
      } else {
        const { user } = await auth.signUp(email.trim(), password, {
          name: name.trim(),
        });

        if (user) {
          setSuccessMessage('Account created successfully! You can now sign in.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-emerald-900 to-teal-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,0,0,0),rgba(0,0,0,0.5))] backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-400 p-[3px] mb-6 animate-pulse">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center">
              <LogIn className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mb-3 animate-gradient">
            Wallet Warden
          </h1>
          <p className="text-emerald-200 text-xl font-light">Your Personal Finance Guardian</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 animate-slide-up">
          <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-white p-4 rounded-lg mb-6 flex items-center gap-2 animate-slide-in">
              <AlertCircle className="w-5 h-5 text-emerald-400" />
              {successMessage}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-3 mb-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group animate-fade-in"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/60">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="animate-slide-down">
                <label className="block text-white mb-2 text-sm font-medium">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300 w-5 h-5 transition-colors group-hover:text-emerald-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all group-hover:bg-white/10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="animate-slide-down" style={{ animationDelay: '100ms' }}>
              <label className="block text-white mb-2 text-sm font-medium">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300 w-5 h-5 transition-colors group-hover:text-emerald-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all group-hover:bg-white/10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="animate-slide-down" style={{ animationDelay: '200ms' }}>
              <label className="block text-white mb-2 text-sm font-medium">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300 w-5 h-5 transition-colors group-hover:text-emerald-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all group-hover:bg-white/10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-sm text-emerald-200/70 mt-2">
                {isLogin ? 'Password must be at least 6 characters' : 'Create a strong password with at least 6 characters'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-lg py-3 px-4 font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-slide-up"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center animate-fade-in">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMessage('');
              }}
              className="text-emerald-300 hover:text-emerald-200 transition-colors text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;