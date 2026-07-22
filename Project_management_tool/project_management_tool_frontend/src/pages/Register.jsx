import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Command } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    // Mock register success
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
          <h2 className="text-xl font-semibold mb-6 text-center text-foreground">Create your workspace</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">Full Name</label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">Work Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">Password</label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Create a password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            
            <Button type="submit" className="w-full mt-2">Sign Up</Button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-muted/50 border-t border-border text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="font-medium text-foreground hover:text-primary transition-colors">Log in</Link>
        </div>
      </div>
    </div>
  );
}
