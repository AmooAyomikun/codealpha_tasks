import React from 'react';
import { Link } from 'react-router-dom';
import { Command, CheckCircle2, Layout, Zap, Users } from 'lucide-react';
import { Button } from '../components/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Command className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">Cadence</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#customers" className="hover:text-foreground transition-colors">Customers</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Log In</Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Move fast. <span className="text-primary">Stay aligned.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Cadence combines the visual simplicity of a kanban board, the structural depth of powerful project management, and a keyboard-first philosophy built for speed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-base">Start for free</Button>
            </Link>
            <span className="text-sm text-muted-foreground">No credit card required.</span>
          </div>

          {/* Product Mockup */}
          <div className="mt-16 rounded-xl border border-border bg-card shadow-2xl overflow-hidden text-left relative group">
            {/* Fake Browser Chrome */}
            <div className="h-10 border-b border-border bg-muted/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              <div className="ml-4 h-5 w-48 bg-background rounded border border-border shadow-inner"></div>
            </div>
            {/* Fake App Shell */}
            <div className="flex h-[500px]">
              {/* Fake Sidebar */}
              <div className="w-64 border-r border-border bg-muted/20 p-4 hidden md:block">
                <div className="h-6 w-32 bg-border rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-border/50 rounded"></div>
                  <div className="h-4 w-4/5 bg-border/50 rounded"></div>
                  <div className="h-4 w-5/6 bg-border/50 rounded"></div>
                </div>
              </div>
              {/* Fake Board */}
              <div className="flex-1 bg-background p-6 overflow-hidden flex gap-6">
                {/* Column 1 */}
                <div className="w-72 shrink-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">To Do</span>
                    <span className="text-xs text-muted-foreground">3</span>
                  </div>
                  <div className="p-3 border border-border bg-card rounded-md shadow-sm">
                    <div className="h-3 w-12 bg-primary/20 rounded mb-2"></div>
                    <div className="h-4 w-full bg-foreground/80 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-16 bg-border rounded"></div>
                      <div className="w-6 h-6 rounded-full bg-muted border border-border"></div>
                    </div>
                  </div>
                  <div className="p-3 border border-border bg-card rounded-md shadow-sm">
                    <div className="h-4 w-5/6 bg-foreground/80 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-20 bg-border rounded"></div>
                      <div className="w-6 h-6 rounded-full bg-muted border border-border"></div>
                    </div>
                  </div>
                </div>
                {/* Column 2 */}
                <div className="w-72 shrink-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">In Progress</span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                  <div className="p-3 border border-border bg-card rounded-md shadow-sm border-l-2 border-l-primary">
                    <div className="h-3 w-16 bg-blue-500/20 rounded mb-2"></div>
                    <div className="h-4 w-full bg-foreground/80 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-12 bg-border rounded"></div>
                      <div className="w-6 h-6 rounded-full bg-muted border border-border"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Fake Command Palette Overlay */}
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-96 bg-card border border-border rounded-lg shadow-2xl overflow-hidden translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="p-3 border-b border-border flex items-center text-muted-foreground">
                  <Command className="w-4 h-4 mr-2" />
                  <span className="text-sm">Search projects, tasks, or jump to...</span>
                </div>
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recent</div>
                  <div className="px-3 py-2 bg-accent rounded text-sm font-medium flex items-center">
                    <Layout className="w-4 h-4 mr-2 text-primary" />
                    Mobile App Redesign
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Command className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Keyboard-First Command Palette</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Navigate anywhere in your workspace instantly. Press <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-muted border border-border text-sm">Cmd</kbd> + <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-muted border border-border text-sm">K</kbd> to search tasks, jump to projects, or execute quick actions without taking your hands off the keyboard.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-primary" /> Fuzzy search across all projects</li>
                  <li className="flex items-center text-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-primary" /> Create tasks from anywhere</li>
                </ul>
              </div>
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="h-12 border border-primary/30 rounded-lg flex items-center px-4 bg-primary/5">
                    <span className="text-sm font-medium">Assign "Update Homepage" to @alice</span>
                  </div>
                  <div className="h-10 bg-muted rounded-lg flex items-center px-4 opacity-50"></div>
                  <div className="h-10 bg-muted rounded-lg flex items-center px-4 opacity-30"></div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center flex-row-reverse">
              <div className="order-2 md:order-1 bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col gap-4">
                <div className="flex gap-2 mb-4">
                  <div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">Board</div>
                  <div className="px-3 py-1.5 rounded-md text-muted-foreground text-sm font-medium">List</div>
                  <div className="px-3 py-1.5 rounded-md text-muted-foreground text-sm font-medium">Calendar</div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded-md w-full"></div>
                  <div className="h-8 bg-muted rounded-md w-11/12"></div>
                  <div className="h-8 bg-muted rounded-md w-full"></div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Layout className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Multiple Perspectives</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  View your project exactly how you need to. Switch seamlessly between a clean Kanban board for flow, a powerful List view for bulk editing, and a Calendar view for deadlines.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-blue-500" /> State persists across views</li>
                  <li className="flex items-center text-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-blue-500" /> Powerful sorting and filtering</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center mt-24">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Real-Time Collaboration</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Never wonder if you're looking at stale data. Task updates, comments, and presence indicators are pushed instantly via WebSockets to everyone looking at the board.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex items-center justify-center gap-4 relative h-64">
                <div className="absolute top-8 right-8 flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-card bg-amber-200"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-card bg-blue-200"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-card bg-green-200"></div>
                </div>
                <div className="w-48 p-4 bg-background border border-border rounded-lg shadow-lg rotate-3 absolute transition-transform hover:rotate-0">
                  <div className="flex gap-2 items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-200"></div>
                    <span className="text-xs font-semibold">Alice is typing...</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section id="customers" className="py-24 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-medium text-foreground mb-12">Built for teams who move fast and demand precision.</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center justify-center font-bold text-2xl">ACME Corp</div>
              <div className="flex items-center justify-center font-bold text-2xl">Globex</div>
              <div className="flex items-center justify-center font-bold text-2xl">Soylent</div>
              <div className="flex items-center justify-center font-bold text-2xl">Initech</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-primary-foreground text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to regain your cadence?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">Join the teams managing complex projects without the complex overhead.</p>
          <Link to="/register">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 text-lg px-8">Create your free workspace</Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">Cadence</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Twitter</a>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; 2026 Cadence Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
