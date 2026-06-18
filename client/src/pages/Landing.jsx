import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Users,
  MessageCircleMore,
  CheckCircle2,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing-page min-h-screen text-slate-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="landing-bg-orb landing-bg-orb--one" />
      <div className="landing-bg-orb landing-bg-orb--two" />
      <div className="landing-bg-grid" />

      {/* Header */}
      <header className="landing-header relative z-10">
        <nav className="mx-auto max-w-7xl px-5 md:px-8 py-4 md:py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/synctalk-logo.svg"
              alt="SyncTalk logo"
              className="h-9 w-9 rounded-xl shadow-lg shadow-sky-500/20"
            />
            <div className="leading-tight">
              <p className="text-base md:text-lg font-bold tracking-tight text-white">SyncTalk</p>
              <p className="text-[11px] md:text-xs text-slate-300/80">Real-time team messaging</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="landing-btn-ghost">
              Log in
            </Link>
            <Link to="/register" className="landing-btn-primary">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="landing-chip mb-5">
                <Sparkles size={14} />
                <span>Telegram-style redesign + AI summaries</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Team chat that feels
                <span className="landing-gradient-text"> fast, clean, and modern.</span>
              </h1>

              <p className="mt-5 md:mt-6 text-slate-300/90 text-base md:text-lg leading-relaxed max-w-xl">
                SyncTalk brings real-time collaboration, voice notes, and quick AI-powered
                summaries in a distraction-free interface inspired by Telegram.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="landing-btn-primary landing-btn-lg">
                  Start chatting free
                  <ArrowRight size={18} />
                </Link>
                <a href="#features" className="landing-btn-secondary landing-btn-lg">
                  Explore features
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Instant messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Secure authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>AI summaries</span>
                </div>
              </div>
            </div>

            {/* Hero preview card */}
            <div className="landing-preview-card">
              <div className="landing-preview-header">
                <div className="flex items-center gap-3">
                  <img
                    src="/synctalk-logo.svg"
                    alt="SyncTalk"
                    className="h-8 w-8 rounded-lg"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white"># engineering-team</p>
                    <p className="text-xs text-slate-300/75">23 members • 7 online</p>
                  </div>
                </div>
                <span className="landing-online-pill">Live</span>
              </div>

              <div className="landing-preview-body">
                <div className="landing-msg landing-msg--other">
                  <p className="landing-msg-user">Aman</p>
                  <p>Deployed the new auth patch. Can someone verify onboarding flow?</p>
                </div>
                <div className="landing-msg landing-msg--own">
                  <p>Tested ✅ Login + register both working now.</p>
                </div>
                <div className="landing-msg landing-msg--other">
                  <p className="landing-msg-user">Riya</p>
                  <p>Great. Summarize this thread for release notes?</p>
                </div>
                <div className="landing-ai-summary">
                  <Sparkles size={14} />
                  <span>AI Summary: Auth patch deployed and validated. Ready for release.</span>
                </div>
              </div>

              <div className="landing-preview-input">
                <MessageCircleMore size={16} className="text-slate-300/75" />
                <span className="text-sm text-slate-300/70">Write a message...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-5 md:px-8 pb-16 md:pb-24">
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            <FeatureCard
              icon={Zap}
              title="Real-time by default"
              desc="Socket-powered messaging with fast delivery and smooth conversation flow."
            />
            <FeatureCard
              icon={Sparkles}
              title="AI quick summaries"
              desc="Turn long threads into concise action points in one click."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Secure collaboration"
              desc="JWT auth, protected rooms, and safe media handling for your team."
            />
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-5 md:gap-6">
            <MiniCard
              icon={Users}
              title="Built for teams"
              desc="Group channels, member controls, and presence indicators keep everyone aligned."
            />
            <MiniCard
              icon={MessageCircleMore}
              title="Distraction-free interface"
              desc="A Telegram-inspired layout focused on readability, speed, and clarity."
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <article className="landing-feature-card">
    <div className="landing-feature-icon">
      <Icon size={20} />
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </article>
);

const MiniCard = ({ icon: Icon, title, desc }) => (
  <article className="landing-mini-card">
    <div className="landing-mini-icon">
      <Icon size={18} />
    </div>
    <div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </article>
);

export default Landing;
