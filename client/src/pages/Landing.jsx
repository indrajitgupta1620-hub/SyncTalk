import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Shield, Users, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

const Landing = () => {
  return (
    <div className="min-h-screen telegram-shell text-dark-50 flex flex-col font-sans overflow-hidden relative">
      {/* Telegram-like Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 10%, rgba(46,166,255,0.22), transparent 28%), radial-gradient(circle at 90% 0%, rgba(120,140,160,0.12), transparent 25%), radial-gradient(circle at 30% 90%, rgba(46,166,255,0.12), transparent 30%)',
        }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 z-10 telegram-header">
        <div className="flex items-center gap-3">
          <img
            src="/synctalk-logo.svg"
            alt="SyncTalk"
            className="w-9 h-9 rounded-lg shadow-lg shadow-sky-500/20"
          />
          <div className="leading-tight">
            <span className="text-xl font-bold tracking-tight text-[#e9f3fb]">SyncTalk</span>
            <p className="text-[11px] text-[#89a2b6]">Real-time team messaging</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/login" className="text-sm font-medium text-[#9ab0c1] hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2.5 rounded-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 pt-8 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c2a37]/90 border border-[#2b3f4f] mb-7 animate-fade-in">
          <Sparkles size={14} className="text-[#63c6ff]" />
          <span className="text-xs font-medium text-[#c9dbe8]">Telegram-style UI + AI chat summaries</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl animate-slide-up text-[#e8f2fb] leading-tight">
          Fast team chat,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#67c9ff] to-[#2ea6ff]">
            clean like Telegram.
          </span>
        </h1>

        <p
          className="text-base md:text-xl text-[#9fb3c2] max-w-2xl mb-9 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          Secure, real-time communication built for software projects. Voice notes, instant updates,
          and AI-powered summaries in a familiar, distraction-free interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link to="/register" className="btn-primary px-7 py-3 rounded-xl text-sm md:text-base">
            Start chatting for free
            <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn-secondary px-7 py-3 rounded-xl text-sm md:text-base">
            View features
          </a>
        </div>
      </main>

      {/* Features grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 pb-20 pt-6 z-10 w-full">
        <div className="grid md:grid-cols-3 gap-6 md:gap-7">
          <FeatureCard
            icon={Zap}
            title="Real-time speed"
            desc="Socket.IO powered instant messaging. Messages land immediately with smooth, reliable sync."
          />
          <FeatureCard
            icon={Sparkles}
            title="AI Summaries"
            desc="Catch up in seconds. Summarize long discussion threads into actionable bullet points."
          />
          <FeatureCard
            icon={Shield}
            title="Secure by design"
            desc="JWT auth, membership checks, and safe media handling keep your team communication protected."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="glass p-7 rounded-2xl border border-[#2a3a48] hover:bg-[#1d2a36] transition-colors group">
    <div className="w-11 h-11 bg-[#21303d] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
      <Icon className="text-[#5ec7ff]" size={22} />
    </div>
    <h3 className="text-lg font-semibold mb-2.5 text-[#e7f0f8]">{title}</h3>
    <p className="text-[#98adbc] leading-relaxed text-sm">{desc}</p>
  </div>
);

export default Landing;
