import React from 'react';
import { Link } from 'react-router-dom';
import { Command, CheckCircle2, Layout, Zap, Users, ArrowRight, Kanban, Clock, Search, ListFilter, Activity, Layers, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/Button';

export function Landing() {
  return (
    <div className="dark min-h-screen bg-[#0a0a0a] text-foreground flex flex-col font-sans overflow-x-hidden selection:bg-primary/30 selection:text-white">
    <div className="dark min-h-screen bg-[#0a0a0a] text-foreground flex flex-col font-sans overflow-x-hidden selection:bg-primary/30 selection:text-white">

      {/* Structured Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-white/20 bg-white/5 flex items-center justify-center">
                <Command className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Cadence</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/20 text-primary border border-primary/30 ml-2">v2.0</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link to="/register">
              <Button size="sm" className="rounded bg-white text-black hover:bg-gray-200 font-semibold px-4 h-9 shadow-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative pt-32 pb-20 z-10">
        {/* Hero Section */}
        <section className="px-6 text-center max-w-5xl mx-auto mb-32">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground text-xs font-medium mb-10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              All systems operational
              <div className="w-[1px] h-3 bg-white/20 mx-2"></div>
              <span className="text-white flex items-center gap-1">Read the changelog <ArrowRight className="w-3 h-3" /></span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white leading-[1.15] max-w-4xl">
              Project management <br className="hidden md:block" />
              for teams that <span className="text-white border-b-2 border-primary/50 pb-1">ship fast.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Cadence gives you the visual simplicity of a kanban board, the structural depth of a powerful issue tracker, and a keyboard-first philosophy built for speed.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-md px-8 h-12 bg-white text-black hover:bg-gray-200 font-medium text-base shadow-[0_0_0_1px_rgba(255,255,255,1)]">
                  Start building for free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-md px-8 h-12 border-white/20 bg-transparent text-white hover:bg-white/5 font-medium text-base hidden sm:flex items-center gap-2">
                <Command className="w-4 h-4" /> Book a demo
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-mono">Free forever for teams of up to 10. No credit card required.</p>
          </div>

          {/* Highly Detailed App Mockup */}
          <div className="mt-20 rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden text-left relative group w-full mx-auto">
            {/* Header bar */}
            <div className="h-14 border-b border-white/10 bg-[#121212] flex items-center px-4 justify-between">
              <div className="flex gap-2 w-20">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 bg-[#0a0a0a] text-xs text-muted-foreground w-64 shadow-inner">
                  <Search className="w-3 h-3" />
                  <span>Search issues...</span>
                  <span className="ml-auto border border-white/20 rounded px-1 text-[9px] font-mono">⌘K</span>
                </div>
              </div>
              <div className="w-20 flex justify-end">
                <div className="w-7 h-7 rounded bg-primary/20 border border-primary/50 flex items-center justify-center text-[10px] text-primary font-bold">AL</div>
              </div>
            </div>
            
            <div className="flex h-[550px]">
              {/* Detailed Sidebar */}
              <div className="w-64 border-r border-white/10 bg-[#0a0a0a] p-4 hidden md:flex flex-col">
                <div className="flex items-center gap-3 px-2 py-2 mb-6 hover:bg-white/5 rounded cursor-pointer transition-colors">
                  <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-xs">A</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white leading-none">Acme Corp</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Free Plan</span>
                  </div>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <div className="px-2 text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                      Views <PlusIcon />
                    </div>
                    <div className="space-y-0.5">
                      <SidebarItem icon={Activity} label="Active Issues" count="12" active />
                      <SidebarItem icon={ListFilter} label="My Issues" count="4" />
                      <SidebarItem icon={Layers} label="Backlog" count="48" />
                    </div>
                  </div>
                  <div>
                    <div className="px-2 text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                      Projects <PlusIcon />
                    </div>
                    <div className="space-y-0.5">
                      <SidebarProject color="bg-primary" label="V2 Launch" count="8" />
                      <SidebarProject color="bg-blue-500" label="Marketing Site" count="3" />
                      <SidebarProject color="bg-amber-500" label="Mobile App" count="1" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Board Area */}
              <div className="flex-1 flex flex-col bg-[#0d0d0d]">
                <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#0a0a0a]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-sm bg-primary"></div>
                    <span className="font-semibold text-white">V2 Launch</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <Avatar initials="AL" color="primary" />
                      <Avatar initials="MK" color="blue" />
                      <Avatar initials="JS" color="amber" />
                    </div>
                    <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                    <Button size="sm" className="h-8 bg-white text-black hover:bg-gray-200 text-xs rounded">New Issue</Button>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-hidden flex gap-6">
                  {/* Column: To Do */}
                  <div className="w-[300px] shrink-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div> To Do
                      </span>
                      <span className="text-xs text-muted-foreground">3</span>
                    </div>
                    <TaskCard 
                      id="AC-102"
                      title="Finalize dark mode color palette" 
                      labels={[{name: 'Design', color: 'blue'}, {name: 'High', color: 'red'}]}
                      date="Sep 12"
                      assignee="AL"
                    />
                    <TaskCard 
                      id="AC-105"
                      title="Implement WebSockets for real-time board updates" 
                      labels={[{name: 'Engineering', color: 'primary'}]}
                      date="Sep 15"
                      assignee="JS"
                    />
                    <TaskCard 
                      id="AC-109"
                      title="Draft announcement blog post" 
                      labels={[{name: 'Marketing', color: 'amber'}]}
                      date="Sep 18"
                      assignee="MK"
                    />
                  </div>
                  
                  {/* Column: In Progress */}
                  <div className="w-[300px] shrink-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div> In Progress
                      </span>
                      <span className="text-xs text-muted-foreground">1</span>
                    </div>
                    <TaskCard 
                      id="AC-098"
                      title="Write PRD for Cadence MVP" 
                      labels={[{name: 'Product', color: 'purple'}]}
                      date="Today"
                      assignee="AL"
                      progress="4/5"
                      active
                    />
                  </div>

                  {/* Column: Review */}
                  <div className="w-[300px] shrink-0 flex flex-col gap-3 opacity-60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Review
                      </span>
                      <span className="text-xs text-muted-foreground">0</span>
                    </div>
                    <div className="h-24 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-xs text-muted-foreground">
                      Drop issues here
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Structured Bento Grid Features */}
        <section id="features" className="py-24 relative z-10 border-t border-white/10 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Engineered for momentum.</h2>
              <p className="text-muted-foreground max-w-xl text-lg">Every pixel and interaction is obsessively crafted to get out of your way and let you do your best work.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
              {/* Large Bento Box 1 */}
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#121212] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Command className="w-32 h-32 text-primary" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                      <Command className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Keyboard-First Navigation</h3>
                    <p className="text-muted-foreground max-w-md">Press <code className="bg-white/10 px-1.5 py-0.5 rounded text-white text-sm">Cmd K</code> from anywhere to open the command palette. Search issues, jump to projects, change status, and assign tasks—all without touching your mouse.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-mono border border-white/10 bg-[#0a0a0a] px-2 py-1 rounded text-muted-foreground">Create Issue (C)</span>
                    <span className="text-xs font-mono border border-white/10 bg-[#0a0a0a] px-2 py-1 rounded text-muted-foreground">Filter (F)</span>
                    <span className="text-xs font-mono border border-white/10 bg-[#0a0a0a] px-2 py-1 rounded text-muted-foreground">Copy Link (Cmd Shift C)</span>
                  </div>
                </div>
              </div>

              {/* Small Bento Box 1 */}
              <div className="rounded-2xl border border-white/10 bg-[#121212] p-8 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Sync</h3>
                  <p className="text-muted-foreground text-sm">Powered by WebSockets. Every card move, comment, and state change is instantly broadcast to your team with zero latency.</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-white">Live Connection</span>
                </div>
              </div>

              {/* Small Bento Box 2 */}
              <div className="rounded-2xl border border-white/10 bg-[#121212] p-8 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                    <Layout className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Multiple Views</h3>
                  <p className="text-muted-foreground text-sm">View your project exactly how you need to. Switch seamlessly between Boards, Lists, and Calendars without losing context.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-full bg-white/10 rounded-full"></div>
                  <div className="h-2 w-full bg-white/10 rounded-full"></div>
                  <div className="h-2 w-full bg-white/10 rounded-full"></div>
                </div>
              </div>

              {/* Large Bento Box 2 */}
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#121212] p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Blockers & Dependencies</h3>
                  <p className="text-muted-foreground">Mark tasks as blocked by others and get visual indicators right on your board. Identify bottlenecks instantly and keep your team's momentum high.</p>
                </div>
                <div className="w-full md:w-64 space-y-3">
                  <div className="p-3 border border-white/10 bg-[#1a1a1a] rounded flex flex-col gap-2">
                    <div className="text-xs text-white font-medium">Launch V2 Beta</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30">BLOCKED</span>
                      by AC-105
                    </div>
                  </div>
                  <div className="p-3 border border-white/5 bg-[#0a0a0a] rounded flex flex-col gap-2 opacity-50">
                    <div className="text-xs text-white font-medium line-through">Implement WebSockets</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Done
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Structured Testimonials */}
        <section className="py-24 border-t border-white/10 bg-[#0a0a0a] relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Loved by product teams</h2>
              <p className="text-muted-foreground max-w-xl">Don't just take our word for it. Here is what teams shipping software every day have to say.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Sarah Chen", role: "VP of Engineering at Globex", quote: "Cadence is the first tool where I don't feel like I'm fighting the UI. The keyboard shortcuts alone have saved me hours this week." },
                { name: "Marcus Johnson", role: "Product Manager at Soylent", quote: "We migrated from Asana because it was too bloated, and from Trello because we needed dependencies. Cadence is the perfect middle ground." },
                { name: "Elena Rodriguez", role: "CTO at Initech", quote: "The real-time WebSocket sync is flawless. When we run our planning meetings, everyone's board updates instantly. Pure magic." },
              ].map((testimonial, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#121212] p-6 flex flex-col justify-between">
                  <p className="text-sm text-white/90 leading-relaxed mb-8">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">{testimonial.name}</span>
                      <span className="text-[10px] text-muted-foreground">{testimonial.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Structured Pricing */}
        <section id="pricing" className="py-24 border-t border-white/10 bg-[#050505] relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Simple, predictable pricing</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Start for free, upgrade when you need advanced controls.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-5xl mx-auto border border-white/10 rounded-2xl overflow-hidden bg-[#0a0a0a]">
              {/* Free Tier */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
                <div className="text-sm font-semibold text-white mb-2">Starter</div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-xs text-muted-foreground font-mono">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mb-8">For small teams getting started with structured workflows.</p>
                <Link to="/register" className="mt-auto">
                  <Button size="sm" className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">Get Started</Button>
                </Link>
                <div className="mt-8 space-y-3">
                  <div className="text-xs font-semibold text-white mb-4">Includes:</div>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-white" /> Up to 10 members</div>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-white" /> Unlimited Projects</div>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-white" /> Core Board & List views</div>
                </div>
              </div>

              {/* Pro Tier */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col relative bg-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-[9px] font-bold uppercase tracking-wider text-black rounded-b">Popular</div>
                <div className="text-sm font-semibold text-primary mb-2 mt-2">Professional</div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$12</span>
                  <span className="text-xs text-muted-foreground font-mono">/user/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mb-8">For growing teams that need cross-project visibility.</p>
                <Link to="/register" className="mt-auto">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-black font-semibold border border-primary/50">Start 14-day trial</Button>
                </Link>
                <div className="mt-8 space-y-3">
                  <div className="text-xs font-semibold text-white mb-4">Everything in Starter, plus:</div>
                  <div className="text-xs flex items-center gap-2 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> Unlimited members</div>
                  <div className="text-xs flex items-center gap-2 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> Dependencies & Blockers</div>
                  <div className="text-xs flex items-center gap-2 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> Advanced Workload view</div>
                </div>
              </div>

              {/* Enterprise Tier */}
              <div className="p-8 flex flex-col">
                <div className="text-sm font-semibold text-white mb-2">Enterprise</div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">Custom</span>
                </div>
                <p className="text-xs text-muted-foreground mb-8">For organizations requiring advanced security and control.</p>
                <Link to="/register" className="mt-auto">
                  <Button size="sm" className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">Contact Sales</Button>
                </Link>
                <div className="mt-8 space-y-3">
                  <div className="text-xs font-semibold text-white mb-4">Everything in Pro, plus:</div>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-white" /> SSO & SAML</div>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-white" /> 99.99% Uptime SLA</div>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-white" /> Dedicated Success Manager</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Structured FAQ */}
        <section id="faq" className="py-24 border-t border-white/10 bg-[#0a0a0a] relative z-10">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-white mb-10">Frequently Asked Questions</h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {[
                { q: "Is Cadence really free?", a: "Yes, Cadence is free forever for teams up to 10 workspace members. You get access to all core features, unlimited projects, and unlimited tasks. No credit card is required to sign up." },
                { q: "Do I need to download an app?", a: "No, Cadence is a fully web-based application built for modern browsers. It is highly optimized for performance and feels indistinguishable from a native app." },
                { q: "How does real-time collaboration work?", a: "We use Django Channels and WebSockets to establish a persistent connection. When anyone on your team moves a card, adds a comment, or changes a status, the UI updates instantly for everyone else viewing the board." },
                { q: "Can I import data from Trello or Asana?", a: "Not currently in the MVP phase. We are focused on perfecting the core experience before building complex integration and import tools." },
              ].map((faq, i) => (
                <div key={i} className="py-6">
                  <h3 className="text-base font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Footer CTA */}
        <section className="py-24 border-t border-white/10 bg-[#050505] relative z-10 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-widest uppercase mb-12">Trusted by engineering teams at</h3>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale mb-32">
              <div className="text-xl font-black tracking-tighter text-white">ACME<span className="text-primary">.</span></div>
              <div className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-1"><Layers className="w-5 h-5"/> GLOBEX</div>
              <div className="text-xl font-serif italic font-bold text-white">Soylent</div>
              <div className="text-xl font-mono font-bold text-white flex items-center gap-2"><Command className="w-5 h-5"/> INITECH</div>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to find your cadence?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">Stop fighting with your project management tool. Start shipping.</p>
            <Link to="/register">
              <Button size="lg" className="rounded px-8 bg-white text-black hover:bg-gray-200 text-base font-medium">
                Create workspace
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#000000] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center">
              <Command className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm text-white">Cadence</span>
          </div>
          <div className="flex gap-8 text-xs text-muted-foreground font-medium">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for the mockup

function PlusIcon() {
  return (
    <div className="w-4 h-4 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer">
      <span className="text-xs">+</span>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, count, active }) {
  return (
    <div className={`flex items-center justify-between px-2 py-1.5 rounded text-sm ${active ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'} transition-colors cursor-pointer`}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      {count && <span className="text-[10px] bg-white/10 px-1.5 rounded">{count}</span>}
    </div>
  );
}

function SidebarProject({ color, label, count }) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-sm ${color}`}></div>
        <span>{label}</span>
      </div>
      {count && <span className="text-[10px] bg-white/10 px-1.5 rounded">{count}</span>}
    </div>
  );
}

function Avatar({ initials, color }) {
  const colors = {
    primary: "bg-primary/20 text-primary border-primary/50",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  };
  return (
    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold ${colors[color]} relative z-10`}>
      {initials}
    </div>
  );
}

function TaskCard({ id, title, labels, date, assignee, progress, active }) {
  return (
    <div className={`p-3 border ${active ? 'border-primary/50 bg-[#161616]' : 'border-white/10 bg-[#121212]'} rounded-lg shadow-sm group hover:border-white/20 transition-colors cursor-pointer relative`}>
      {active && <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg"></div>}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground font-mono">{id}</span>
        <div className="flex gap-1">
          {labels.map((l, i) => (
            <span key={i} className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${l.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : l.color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' : l.color === 'primary' ? 'bg-primary/10 text-primary border-primary/20' : l.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
              {l.name}
            </span>
          ))}
        </div>
      </div>
      <div className="text-sm text-white font-medium mb-3 leading-snug">{title}</div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
          <Clock className="w-3 h-3" /> {date}
          {progress && <span className="flex items-center gap-1 ml-1"><CheckCircle2 className="w-3 h-3" /> {progress}</span>}
        </div>
        <Avatar initials={assignee} color={assignee === 'AL' ? 'primary' : assignee === 'JS' ? 'amber' : 'blue'} />
      </div>
    </div>
  );
}
