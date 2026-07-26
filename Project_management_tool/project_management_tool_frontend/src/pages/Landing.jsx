import React from 'react';
import { Link } from 'react-router-dom';
import { Command, CheckCircle2, Layout, Zap, Users, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'framer-motion';

export function Landing() {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none" />
      
      {/* Deep Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full border border-border/40 bg-background/50 backdrop-blur-xl shadow-2xl">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Command className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Cadence</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#customers" className="hover:text-white transition-colors">Customers</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Log In</Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative pt-40 pb-20">
        {/* Hero Section */}
        <section className="px-4 text-center max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Cadence 2.0 is now live
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 text-white leading-[1.1]">
              Move fast. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 glow-text">Stay aligned.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The project management tool that perfectly balances visual simplicity, structural depth, and a keyboard-first philosophy built for speed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-base rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(20,184,166,0.6)]">
                  Start building for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">No credit card required.</span>
            </div>
          </motion.div>

          {/* High-Fidelity Product Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="rounded-xl border border-border/50 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl overflow-hidden text-left relative group w-full mx-auto"
          >
            {/* Fake Browser Chrome */}
            <div className="h-12 border-b border-border/50 bg-[#121212] flex items-center px-4 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 max-w-md mx-auto h-6 bg-[#1e1e1e] rounded-md border border-border/30 flex items-center justify-center text-xs text-muted-foreground font-mono">
                cadence.app/projects/launch
              </div>
            </div>
            
            {/* Fake App Shell */}
            <div className="flex h-[500px] bg-[#0d0d0d]">
              {/* Fake Sidebar */}
              <div className="w-64 border-r border-border/40 p-4 hidden md:flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">C</div>
                  <span className="text-sm font-semibold text-white">Cadence Team</span>
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Projects</div>
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 rounded-md bg-[#1e1e1e] text-sm text-white font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      V2 Launch
                    </div>
                    <div className="px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-[#1e1e1e] font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Marketing Site
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fake Board */}
              <div className="flex-1 p-6 overflow-hidden flex gap-6 bg-[#0a0a0a] bg-grid-white/[0.01]">
                {/* Column 1 */}
                <div className="w-72 shrink-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">To Do</span>
                      <span className="text-xs bg-[#1e1e1e] px-1.5 py-0.5 rounded text-muted-foreground">3</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border/40 bg-[#141414] rounded-lg shadow-sm group hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold rounded">Design</div>
                      <div className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold rounded">High</div>
                    </div>
                    <div className="text-sm text-white font-medium mb-4 leading-snug">Finalize dark mode color palette for V2</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Sep 12</div>
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-[10px] text-primary">AL</div>
                    </div>
                  </div>

                  <div className="p-4 border border-border/40 bg-[#141414] rounded-lg shadow-sm">
                    <div className="text-sm text-white font-medium mb-4 leading-snug">Implement WebSockets for real-time board updates</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Sep 15</div>
                      <div className="w-6 h-6 rounded-full bg-[#1e1e1e] border border-border/50 flex items-center justify-center text-[10px] text-muted-foreground">JS</div>
                    </div>
                  </div>
                </div>
                
                {/* Column 2 */}
                <div className="w-72 shrink-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">In Progress</span>
                      <span className="text-xs bg-[#1e1e1e] px-1.5 py-0.5 rounded text-muted-foreground">1</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-primary/30 bg-[#141414] rounded-lg shadow-[0_0_15px_-3px_rgba(20,184,166,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div className="text-sm text-white font-medium mb-4 leading-snug">Write PRD for Cadence MVP</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> 4/5
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-[10px] text-primary z-10">AL</div>
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-400">MK</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fake Command Palette Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-start justify-center pt-24 z-20">
              <div className="w-[500px] bg-[#121212] border border-border/50 rounded-xl shadow-2xl overflow-hidden translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <div className="p-4 border-b border-border/40 flex items-center text-white">
                  <Command className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span className="text-base font-medium">assign frontend</span>
                  <div className="ml-auto w-1 h-5 bg-primary animate-pulse"></div>
                </div>
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Actions</div>
                  <div className="px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg text-sm font-medium flex items-center text-white cursor-pointer">
                    <Users className="w-4 h-4 mr-3 text-primary" />
                    Assign <span className="font-bold mx-1">Frontend Rewrite</span> to <span className="font-bold ml-1">@alice</span>
                    <span className="ml-auto text-xs text-muted-foreground border border-border/40 rounded px-1.5 py-0.5">Enter</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for velocity.</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Every interaction in Cadence is optimized to keep you in flow, from zero-latency updates to deep keyboard shortcuts.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Command,
                  title: "Keyboard-First",
                  desc: "Press Cmd+K from anywhere to search, navigate, or create. Never reach for your mouse again.",
                  color: "text-primary",
                  bg: "bg-primary/10"
                },
                {
                  icon: Layout,
                  title: "Multiple Views",
                  desc: "Switch seamlessly between Boards, Lists, and Calendars without losing context.",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10"
                },
                {
                  icon: Zap,
                  title: "Real-Time Sync",
                  desc: "Powered by WebSockets, every card move and comment is instantly broadcast to your team.",
                  color: "text-amber-400",
                  bg: "bg-amber-400/10"
                }
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-8 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm hover:bg-card/40 hover:border-border/60 transition-all cursor-default"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section id="customers" className="py-24 border-y border-border/20 bg-card/10">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h3 className="text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-10">Trusted by teams who ship fast</h3>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="text-2xl font-black tracking-tighter text-white">ACME<span className="text-primary">.</span></div>
              <div className="text-2xl font-bold tracking-widest text-white uppercase">Globex</div>
              <div className="text-2xl font-serif italic font-bold text-white">Soylent</div>
              <div className="text-2xl font-mono font-bold text-white">INITECH</div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 text-center px-4 relative z-10">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] w-3/4 h-3/4 mx-auto pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to regain your cadence?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">Join the teams managing complex projects without the complex overhead.</p>
          <Link to="/register">
            <Button size="lg" className="rounded-full px-10 bg-white text-black hover:bg-white/90 text-lg font-semibold shadow-2xl">
              Create your free workspace
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/20 bg-[#050505] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg text-white">Cadence</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; 2026 Cadence Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
