import React, { useState } from 'react';
import { Button } from './Button';
import { Layout, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        await onSignup(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-30 pointer-events-none">
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 rounded-full bg-white/20 blur-3xl"></div>
            </div>
            <div className="relative z-10">
                <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4 backdrop-blur-sm shadow-lg ring-1 ring-white/20">
                    <Layout className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome to Lumina</h1>
                <p className="text-indigo-100 text-sm font-medium">AI-Powered Landing Page Generator</p>
            </div>
        </div>

        {/* Form */}
        <div className="p-8">
            <div className="flex mb-8 bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => { setIsLogin(true); setError(null); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => { setIsLogin(false); setError(null); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${!isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                    <div className="space-y-1.5 animate-fade-in">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start gap-2 border border-red-100">
                        <span className="shrink-0">⚠️</span>
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <Button 
                    type="submit" 
                    className="w-full justify-center h-12 text-base shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5" 
                    isLoading={loading}
                    icon={!loading && <ArrowRight className="w-4 h-4" />}
                >
                    {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
            </form>
            
            <p className="mt-6 text-center text-xs text-gray-400">
                By continuing, you agree to our Terms of Service.
            </p>
        </div>
      </div>
    </div>
  );
};