import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Command } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const success = await login(username, password);
    if (success) {
      navigate('/app');
    } else {
      setError(useAuthStore.getState().error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <Command className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-foreground">Cadence</span>
      </div>

      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-center text-foreground">Log in to your workspace</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="username">Username</label>
              <Input 
                id="username" 
                type="text" 
                placeholder="alice" 
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoFocus
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-foreground" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-muted/50 border-t border-border text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/register" className="font-medium text-foreground hover:text-primary transition-colors">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
