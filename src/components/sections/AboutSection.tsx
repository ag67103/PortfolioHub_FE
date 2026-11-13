import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Award, GraduationCap, FileText, Edit2, Globe, Mail, Phone, Code2, Briefcase, Bird, Camera, Binary } from 'lucide-react';
import { ModalOverlay } from '../forms/ModalOverlay';
import EditPortfolioForm from '../forms/EditPortfolioForm';

const AboutSection: React.FC = () => {
  const { currentUser, isMe } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);

  const socialLinkConfigs = useMemo(() => [
    { key: 'github_url', label: 'GitHub', icon: Code2, prefix: '', showValue: false },
    { key: 'linkedin_url', label: 'LinkedIn', icon: Briefcase, prefix: '', showValue: false },
    { key: 'twitter_url', label: 'Twitter / X', icon: Bird, prefix: '', showValue: false },
    { key: 'instagram_url', label: 'Instagram', icon: Camera, prefix: '', showValue: false },
    { key: 'leetcode_url', label: 'LeetCode', icon: Binary, prefix: '', showValue: false },
    { key: 'website_url', label: 'Website', icon: Globe, prefix: '', showValue: false },
    { key: 'email', label: 'Email', icon: Mail, prefix: 'mailto:', showValue: false },
    { key: 'phone', label: 'Phone', icon: Phone, prefix: 'tel:', showValue: true },
  ] as const, []);

  const [availableSocialLinks, setAvailableSocialLinks] = useState<
    Array<{ label: string; icon: typeof User; href: string; key: string; value: string; showValue: boolean }>
  >([]);

  useEffect(() => {
    if (!currentUser) { setAvailableSocialLinks([]); return; }
    const links = socialLinkConfigs
      .map(({ key, label, icon, prefix, showValue }) => {
        const rawValue = currentUser[key as keyof typeof currentUser];
        if (!rawValue) return null;
        const value = String(rawValue).trim();
        if (!value) return null;
        const raw = prefix ? `${prefix}${value}` : value;
        const safeProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
        let href: string;
        try {
          const parsed = new URL(raw);
          href = safeProtocols.includes(parsed.protocol) ? raw : '';
        } catch {
          href = '';
        }
        if (!href) return null;
        return { label, icon, href, key, value, showValue: !!showValue };
      })
      .filter(Boolean) as Array<{ label: string; icon: typeof User; href: string; key: string; value: string; showValue: boolean }>;
    setAvailableSocialLinks(links);
  }, [currentUser, socialLinkConfigs]);

  return (
    <>
      <section id="about" className="section-obsidian py-20">
        {showEditForm && (
          <ModalOverlay onClose={() => setShowEditForm(false)}>
            <EditPortfolioForm portfolioData={currentUser || {}} setShowForm={setShowEditForm} />
          </ModalOverlay>
        )}

        <div className="container mx-auto px-4 lg:px-8">
          {/* Section heading */}
          <div className="text-center mb-12">
            <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Who I Am</h2>
          </div>

          {currentUser ? (
            <div className="obs-card p-8 relative group">
              {isMe && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="absolute top-5 right-5 p-2 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-all duration-200 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100"
                  aria-label="Edit portfolio"
                >
                  <Edit2 size={16} />
                </button>
              )}

              {/* Name / title */}
              <div className="text-center mb-10">
                {(currentUser.first_name || currentUser.last_name) ? (
                  <>
                    <h3 className="font-grotesk text-3xl font-bold text-ink-primary mb-2">
                      {`${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()}
                    </h3>
                    {currentUser.portfolio_title && (
                      <p className="text-accent-indigo font-medium text-lg mb-2">{currentUser.portfolio_title}</p>
                    )}
                    {currentUser.portfolio_description && (
                      <div className="text-ink-secondary max-w-3xl mx-auto leading-relaxed space-y-4">{String(currentUser.portfolio_description).split(/\n+/).filter((l: string) => l.trim()).map((para: string, i: number) => <p key={i}>{para}</p>)}</div>
                    )}
                  </>
                ) : (
                  <div className="max-w-lg mx-auto">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                      <User className="w-7 h-7 text-accent-indigo" />
                    </div>
                    <h3 className="font-grotesk text-2xl font-bold text-ink-primary mb-3">
                      {isMe ? 'Complete Your Portfolio' : 'Profile Coming Soon'}
                    </h3>
                    <p className="text-ink-secondary mb-5">
                      {isMe
                        ? 'Add your name, professional title, and description to introduce yourself.'
                        : 'This portfolio does not have any highlights yet.'}
                    </p>
                    {isMe && (
                      <button onClick={() => setShowEditForm(true)} className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm mx-auto">
                        <Edit2 size={14} /> Add Information
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Three cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Education */}
                <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6 hover:border-accent-indigo/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent-indigo/10 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-accent-indigo" />
                    </div>
                    <h4 className="font-grotesk font-semibold text-ink-primary">Education</h4>
                  </div>
                  {currentUser.portfolio_education?.length > 0 ? (
                    <p className="text-ink-secondary leading-relaxed">{currentUser.portfolio_education[0]}</p>
                  ) : (
                    <p className="text-ink-muted text-sm">No education added yet</p>
                  )}
                </div>

                {/* Achievement */}
                <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6 hover:border-accent-indigo/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent-indigo/10 rounded-lg">
                      <Award className="w-5 h-5 text-accent-indigo" />
                    </div>
                    <h4 className="font-grotesk font-semibold text-ink-primary">Top Achievement</h4>
                  </div>
                  {currentUser.portfolio_awards?.length > 0 ? (
                    <p className="text-ink-secondary leading-relaxed">{currentUser.portfolio_awards[0]}</p>
                  ) : (
                    <p className="text-ink-muted text-sm">No awards added yet</p>
                  )}
                </div>

                {/* Connect */}
                <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6 hover:border-accent-indigo/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent-indigo/10 rounded-lg">
                      <User className="w-5 h-5 text-accent-indigo" />
                    </div>
                    <h4 className="font-grotesk font-semibold text-ink-primary">Connect</h4>
                  </div>
                  {availableSocialLinks.length === 0 ? (
                    <p className="text-ink-muted text-sm">No social links added yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {availableSocialLinks.map((link) => {
                        const IconComponent = link.icon;
                        const isExternal = !link.href.startsWith('mailto:') && !link.href.startsWith('tel:');
                        return (
                          <a
                            key={link.key}
                            href={link.href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="flex items-center gap-2.5 text-ink-secondary hover:text-accent-indigo transition-colors py-1 group/link"
                          >
                            <IconComponent className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {link.showValue ? link.value : link.label}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications row */}
              {currentUser.portfolio_certifications?.length > 0 && (
                <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent-indigo/10 rounded-lg">
                      <FileText className="w-5 h-5 text-accent-indigo" />
                    </div>
                    <h4 className="font-grotesk font-semibold text-ink-primary">Certifications</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.portfolio_certifications.map((cert: string, i: number) => (
                      <span key={i} className="obs-tag">{cert}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out marketing state */
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  {
                    icon: User,
                    title: 'Personal Branding',
                    desc: 'Create a compelling personal brand that showcases your unique skills and experiences.',
                    note: 'Perfect for professionals, freelancers, students, and career changers',
                  },
                  {
                    icon: FileText,
                    title: 'Professional Showcase',
                    desc: 'Build a comprehensive portfolio highlighting your projects, certifications, and growth.',
                    note: 'Includes skills, projects, experience, education, and achievements',
                  },
                ].map(({ icon: Icon, title, desc, note }) => (
                  <div key={title} className="obs-card p-8">
                    <div className="p-3 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl inline-flex mb-5">
                      <Icon className="w-6 h-6 text-accent-indigo" />
                    </div>
                    <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-3">{title}</h3>
                    <p className="text-ink-secondary leading-relaxed mb-4">{desc}</p>
                    <p className="text-ink-muted text-sm">{note}</p>
                  </div>
                ))}
              </div>
              <div className="obs-card p-10 text-center">
                <h3 className="font-grotesk text-2xl font-bold text-ink-primary mb-3">Ready to Get Started?</h3>
                <p className="text-ink-secondary mb-6 max-w-xl mx-auto">
                  Join professionals who have already created stunning portfolios.
                </p>
                <a href="/register" className="btn-glow inline-block px-8 py-3 rounded-lg text-sm">
                  Create Your Portfolio
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AboutSection;
