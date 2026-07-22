import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Command } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Mock login success
    navigate('/app');
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
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
            
            <Button type="submit" className="w-full mt-2">Log In</Button>
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
