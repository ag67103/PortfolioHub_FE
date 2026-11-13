import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Briefcase, Code2, GraduationCap, Award,
  Share2, Download, Zap, Globe, Lock
} from 'lucide-react';

/* ── tiny hook: reveal on scroll ── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ── mock portfolio card for the hero visual ── */
const MockPortfolioCard: React.FC = () => (
  <div style={{ fontFamily: 'Inter, sans-serif' }}
    className="bg-obsidian-card border border-obsidian-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm">
    {/* Mini navbar */}
    <div className="bg-obsidian-surface border-b border-obsidian-border px-4 py-3 flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
      <span className="ml-3 text-xs text-ink-muted">{window.location.host}/user/alex</span>
    </div>
    {/* Hero area */}
    <div className="p-5 border-b border-obsidian-border bg-gradient-to-br from-obsidian-card to-obsidian-surface">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-cyan flex items-center justify-center font-bold text-white text-lg">
          AM
        </div>
        <div>
          <div className="font-semibold text-ink-primary text-sm">Alex Morgan</div>
          <div className="text-xs text-accent-light mt-0.5">Full-Stack Engineer</div>
          <div className="text-xs text-ink-muted mt-0.5">San Francisco, CA</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-obsidian-surface border border-obsidian-border rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-ink-primary">8+</div>
          <div className="text-xs text-ink-muted">Years</div>
        </div>
        <div className="flex-1 bg-obsidian-surface border border-obsidian-border rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-ink-primary">24</div>
          <div className="text-xs text-ink-muted">Projects</div>
        </div>
        <div className="flex-1 bg-obsidian-surface border border-obsidian-border rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-ink-primary">12k</div>
          <div className="text-xs text-ink-muted">Views</div>
        </div>
      </div>
    </div>
    {/* Skills */}
    <div className="p-4 border-b border-obsidian-border">
      <div className="text-xs text-ink-muted mb-3 uppercase tracking-wider">Top Skills</div>
      {[['React', 95], ['Node.js', 88], ['Python', 82]].map(([name, pct]) => (
        <div key={name as string} className="mb-2.5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-secondary">{name}</span>
            <span className="text-accent-light">{pct}%</span>
          </div>
          <div className="h-1 bg-obsidian-surface rounded-full">
            <div className="h-full rounded-full bg-gradient-to-r from-accent-indigo to-accent-cyan"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      ))}
    </div>
    {/* Project */}
    <div className="p-4">
      <div className="text-xs text-ink-muted mb-2 uppercase tracking-wider">Latest Project</div>
      <div className="text-sm font-semibold text-ink-primary mb-1">AI Code Review Tool</div>
      <div className="flex gap-1.5 flex-wrap">
        {['React', 'Python', 'OpenAI'].map(t => (
          <span key={t} className="obs-tag text-xs">{t}</span>
        ))}
      </div>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  useReveal();

  const features = [
    { icon: Code2, title: 'Skills Showcase', desc: 'Categorise and display your technical stack with proficiency levels. Visitors see exactly what you bring to the table.' },
    { icon: Briefcase, title: 'Experience Timeline', desc: 'Present your career story chronologically. Add roles, responsibilities, and tech stacks for each position.' },
    { icon: GraduationCap, title: 'Education & Certs', desc: 'Highlight your academic background and professional certifications in one clean, organised section.' },
    { icon: Award, title: 'Awards & Recognition', desc: 'Let your achievements speak. Add awards, hackathon wins, and recognitions that set you apart.' },
    { icon: Share2, title: 'One Shareable Link', desc: 'Every profile gets a permanent URL. Share it on LinkedIn, resumes, or anywhere you want to be discovered.' },
    { icon: Download, title: 'Resume Download', desc: 'Visitors can download your resume directly from your portfolio. Always kept up to date in one place.' },
  ];

  const steps = [
    { n: '01', title: 'Create your account', desc: 'Sign up in seconds. No credit card, no setup friction.' },
    { n: '02', title: 'Fill in your profile', desc: 'Add your skills, projects, experience, and education through simple forms.' },
    { n: '03', title: 'Share your link', desc: 'Copy your unique URL and share it everywhere — LinkedIn, email, job applications.' },
  ];

  return (
    <div className="section-obsidian min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-indigo/8 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
        </div>
        {/* Dot grid */}
        <div className="dots-grid" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 bg-accent-indigo/10 border border-accent-indigo/25 text-accent-light px-4 py-1.5 rounded-full text-xs font-medium mb-8 tracking-wide">
                <Zap size={12} /> Free for everyone · No credit card needed
              </div>

              <h1 className="font-grotesk text-5xl lg:text-6xl xl:text-7xl font-bold text-ink-primary leading-[1.05] mb-6">
                Your career,<br />
                <span className="bg-gradient-to-r from-accent-indigo via-violet-400 to-accent-cyan bg-clip-text text-transparent">
                  one beautiful link
                </span>
              </h1>

              <p className="text-lg text-ink-secondary leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                Portfolio Hub turns your skills, projects, and experience into a
                professional portfolio anyone can discover — in minutes, not days.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register"
                  className="btn-glow flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold">
                  Build your portfolio free <ArrowRight size={15} />
                </Link>
                <Link to="/login"
                  className="btn-ghost flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium">
                  Sign in
                </Link>
              </div>

            </div>

            {/* Right — mock portfolio */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-accent-indigo/20 rounded-3xl blur-2xl scale-110" />
                <div className="relative animate-float">
                  <MockPortfolioCard />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-obsidian-card border border-accent-indigo/30 rounded-xl px-3 py-2 text-xs font-medium text-accent-light shadow-glow-indigo">
                  🔗 {window.location.host}/user/you
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-surface py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="section-label" data-label="Everything you need" />
            <h2 className="font-grotesk text-4xl font-bold text-ink-primary mt-2 mb-4">
              One platform. Your whole career.
            </h2>
            <p className="text-ink-secondary max-w-xl mx-auto leading-relaxed">
              Everything a recruiter, client, or colleague needs to understand
              your professional story — in a single, shareable URL.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title}
                className="obs-card p-6 reveal"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="p-2.5 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl inline-flex mb-4">
                  <Icon className="w-5 h-5 text-accent-light" />
                </div>
                <h3 className="font-grotesk font-semibold text-ink-primary mb-2">{title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-obsidian py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="section-label" data-label="Simple by design" />
            <h2 className="font-grotesk text-4xl font-bold text-ink-primary mt-2">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="relative reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] right-0 h-px bg-gradient-to-r from-accent-indigo/40 to-transparent w-8" />
                )}
                <div className="obs-card p-6 h-full">
                  <div className="font-grotesk text-5xl font-bold text-accent-indigo/15 mb-4 leading-none">{n}</div>
                  <h3 className="font-grotesk font-semibold text-ink-primary mb-2">{title}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section-surface py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="reveal">
              <span className="section-label" data-label="Why Portfolio Hub" />
              <h2 className="font-grotesk text-4xl font-bold text-ink-primary mt-2 mb-6 leading-tight">
                Built for professionals<br/>who value their time
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Zap, t: 'No design skills needed', d: 'The layout adapts to your content. Whether you have 2 projects or 20, your portfolio always looks polished.' },
                  { icon: Globe, t: 'Permanent public link', d: `Share ${window.location.host}/user/you on your LinkedIn bio, resume, or email signature.` },
                  { icon: Lock, t: 'Your data, your control', d: 'Edit, update, or delete any section anytime. No vendor lock-in, no hidden fees.' },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="flex gap-4">
                    <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-lg shrink-0 h-fit">
                      <Icon className="w-4 h-4 text-accent-light" />
                    </div>
                    <div>
                      <div className="font-grotesk font-semibold text-ink-primary mb-1 text-sm">{t}</div>
                      <div className="text-sm text-ink-secondary leading-relaxed">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-obsidian py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center reveal">
            {/* Glow ring */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-accent-indigo/20 rounded-full blur-2xl scale-150" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-cyan flex items-center justify-center mx-auto">
                <span className="font-grotesk font-bold text-white text-xl">PH</span>
              </div>
            </div>

            <h2 className="font-grotesk text-4xl lg:text-5xl font-bold text-ink-primary mb-5 leading-tight">
              Ready to stand out?
            </h2>
            <p className="text-ink-secondary text-lg mb-8 leading-relaxed">
              Turn your resume into a clean, shareable portfolio, and keep it up to date in one place.
            </p>
            <Link to="/register"
              className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold">
              Create your free portfolio <ArrowRight size={16} />
            </Link>
            <p className="text-ink-muted text-xs mt-4">No credit card · Takes under 5 minutes</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-obsidian-surface border-t border-obsidian-border py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-grotesk font-semibold text-ink-primary">
              Portfolio<span className="text-accent-light">Hub</span>
              <span className="text-ink-muted font-normal text-sm ml-3">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6 text-sm text-ink-muted">
              <Link to="/privacy-policy" className="hover:text-ink-primary transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-ink-primary transition-colors">Terms</Link>
              <Link to="/login" className="hover:text-ink-primary transition-colors">Sign in</Link>
              <Link to="/register" className="text-accent-light hover:text-accent-cyan transition-colors font-medium">Get started →</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
