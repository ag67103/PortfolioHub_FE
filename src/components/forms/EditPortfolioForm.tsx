import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Award, FileText, Briefcase, Edit3 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { updatePortfolio } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EditPortfolioFormProps {
  portfolioData: any;
  setShowForm: (show: boolean) => void;
}

const EditPortfolioModal: React.FC<EditPortfolioFormProps> = ({ portfolioData, setShowForm}) => {
  const { educations, experiences, certifications, awards } = usePortfolio();

  const [formData, setFormData] = useState({
    first_name: portfolioData?.first_name || '',
    middle_name: portfolioData?.middle_name || '',
    last_name: portfolioData?.last_name || '',
    portfolio_title: portfolioData?.portfolio_title || '',
    portfolio_description: portfolioData?.portfolio_description || '',
    portfolio_education: Array.isArray(portfolioData?.portfolio_education) ? portfolioData.portfolio_education[0] || '' : (portfolioData?.portfolio_education || ''),
    portfolio_certifications: Array.isArray(portfolioData?.portfolio_certifications) ? portfolioData.portfolio_certifications : (portfolioData?.portfolio_certifications ? [portfolioData.portfolio_certifications] : []),
    portfolio_awards: Array.isArray(portfolioData?.portfolio_awards) ? portfolioData.portfolio_awards : (portfolioData?.portfolio_awards ? [portfolioData.portfolio_awards] : []),
    github_url: portfolioData?.github_url || '',
    twitter_url: portfolioData?.twitter_url || '',
    instagram_url: portfolioData?.instagram_url || '',
    linkedin_url: portfolioData?.linkedin_url || '',
    leetcode_url: portfolioData?.leetcode_url || '',
    website_url: portfolioData?.website_url || '',
    phone: portfolioData?.phone || portfolioData?.phone_number || ''
  });

  // Track if custom title mode is active
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setIsCurrentUserLoading } = useAuth();
  const [isSubmitActive, setIsSubmitActive] = useState(false);

  // Fetch options for dropdowns
  const [educationOptions, setEducationOptions] = useState<string[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<string[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<string[]>([]);
  const [awardOptions, setAwardOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      // Use educations from PortfolioContext
      const eduOptions = educations.map((edu: any) => `${edu.degree} - ${edu.institution}`);
      setEducationOptions(eduOptions);

      // Use experiences from PortfolioContext
      const uniqueTitles = Array.from(new Set(experiences.map((exp: any) => exp.title))) as string[];
      setJobTitleOptions(uniqueTitles);

      // Use certifications from PortfolioContext
      const certOptions = certifications.map((cert: any) => `${cert.name} - ${cert.issuer}`);
      setCertificationOptions(certOptions);

      // Use awards from PortfolioContext
      const awardOpts = awards.map((award: any) => `${award.name} - ${award.issuer}`);
      setAwardOptions(awardOpts);
    } catch (error) {
      // Failed to process portfolio data
    }
  }, [educations, experiences, certifications, awards]);

  const addListItem = (field: 'portfolio_certifications' | 'portfolio_awards') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field: 'portfolio_certifications' | 'portfolio_awards', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const updateListItem = (field: 'portfolio_certifications' | 'portfolio_awards', index: number, value: string) => {
    const currentValues = formData[field];
    const isDuplicate = currentValues.some((item: string, i: number) => i !== index && item === value);
    
    if (isDuplicate) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const getAvailableOptions = (field: 'portfolio_certifications' | 'portfolio_awards', options: string[]) => {
    const selectedValues = formData[field].filter((value: string) => value !== '');
    return options.filter(option => !selectedValues.includes(option));
  };

  const getDropdownOptions = (field: 'portfolio_certifications' | 'portfolio_awards', options: string[], currentValue: string) => {
    if (currentValue) {
      const availableOptions = options.filter(option => option !== currentValue && !formData[field].includes(option));
      return [currentValue, ...availableOptions];
    } else {
      const selectedValues = formData[field].filter((value: string) => value !== '');
      return options.filter(option => !selectedValues.includes(option));
    }
  };

  useEffect(() => {
    if (
      formData.first_name !== (portfolioData?.first_name || '') ||
      formData.middle_name !== (portfolioData?.middle_name || '') ||
      formData.last_name !== (portfolioData?.last_name || '') ||
      formData.portfolio_title !== (portfolioData?.portfolio_title || '') ||
      formData.portfolio_description !== (portfolioData?.portfolio_description || '') ||
      formData.portfolio_education !== (Array.isArray(portfolioData?.portfolio_education) ? portfolioData.portfolio_education[0] || '' : (portfolioData?.portfolio_education || '')) ||
      JSON.stringify(formData.portfolio_certifications) !== JSON.stringify(Array.isArray(portfolioData?.portfolio_certifications) ? portfolioData.portfolio_certifications : (portfolioData?.portfolio_certifications ? [portfolioData.portfolio_certifications] : [])) ||
      JSON.stringify(formData.portfolio_awards) !== JSON.stringify(Array.isArray(portfolioData?.portfolio_awards) ? portfolioData.portfolio_awards : (portfolioData?.portfolio_awards ? [portfolioData.portfolio_awards] : [])) ||
      formData.github_url !== (portfolioData?.github_url || '') ||
      formData.twitter_url !== (portfolioData?.twitter_url || '') ||
      formData.instagram_url !== (portfolioData?.instagram_url || '') ||
      formData.linkedin_url !== (portfolioData?.linkedin_url || '') ||
      formData.leetcode_url !== (portfolioData?.leetcode_url || '') ||
      formData.website_url !== (portfolioData?.website_url || '') ||
      formData.phone !== (portfolioData?.phone || portfolioData?.phone_number || '')
    ) {
      setIsSubmitActive(true);
    } else {
      setIsSubmitActive(false);
    }
  }, [formData, portfolioData]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      setLoading(true);
      e.preventDefault();

      const portfolioUpdateData = {
        ...formData,
        portfolio_education: formData.portfolio_education ? [formData.portfolio_education] : [],
        portfolio_certifications: formData.portfolio_certifications,
        portfolio_awards: formData.portfolio_awards,
        phone: formData.phone?.trim() || null
      };

      const response = await updatePortfolio(portfolioUpdateData);
      if (response.status_code === 400) {
        throw new Error(response.message ?? 'Failed to update portfolio');
      }

      setShowForm(false);
      setIsCurrentUserLoading(true);
    } catch (error: any) {
      setError(error.message ?? 'Failed to update portfolio');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
  const selectCls = `${inputCls} cursor-pointer`;
  const labelCls = "block text-sm font-medium text-ink-secondary mb-1.5";
  const sectionCls = "bg-obsidian-bg border border-obsidian-border rounded-xl p-4 space-y-4";
  const sectionHeadCls = "text-sm font-semibold text-ink-secondary mb-3 flex items-center gap-2";

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl">
          <Edit3 className="w-5 h-5 text-accent-indigo" />
        </div>
        <h2 className="font-grotesk text-xl font-bold text-ink-primary">Edit Portfolio</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={sectionCls}>
          <h3 className={sectionHeadCls}><User className="w-4 h-4 text-accent-indigo" /> Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name</label>
              <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputCls} placeholder="Enter first name" />
            </div>
            <div>
              <label className={labelCls}>Middle Name <span className="text-ink-muted text-xs">(optional)</span></label>
              <input type="text" value={formData.middle_name} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} className={inputCls} placeholder="Enter middle name" />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputCls} placeholder="Enter last name" />
            </div>
            <div>
              <label className={labelCls}>Phone Number <span className="text-ink-muted text-xs">(optional)</span></label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="Enter phone number" />
            </div>
          </div>
        </div>

        <div className={sectionCls}>
          <h3 className={sectionHeadCls}><Briefcase className="w-4 h-4 text-accent-indigo" /> Professional Information</h3>
          <div>
            <label className={labelCls}>Professional Title</label>
            <select
              value={isCustomTitle ? '__custom__' : formData.portfolio_title}
              onChange={(e) => {
                if (e.target.value === '__custom__') { setIsCustomTitle(true); setFormData({ ...formData, portfolio_title: '' }); }
                else { setIsCustomTitle(false); setFormData({ ...formData, portfolio_title: e.target.value }); }
              }}
              className={selectCls}
            >
              <option value="">Select your professional title</option>
              {jobTitleOptions.map((title) => <option key={title} value={title}>{title}</option>)}
              <option value="__custom__">+ Add Custom Title</option>
            </select>
            {isCustomTitle && (
              <input type="text" placeholder="Enter your custom professional title" className={`${inputCls} mt-2`} onChange={(e) => setFormData({ ...formData, portfolio_title: e.target.value })} value={formData.portfolio_title} />
            )}
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={formData.portfolio_description} onChange={(e) => setFormData({ ...formData, portfolio_description: e.target.value })} className={`${inputCls} resize-none`} rows={4} placeholder="Enter a brief description about yourself" />
          </div>
        </div>

        <div className={sectionCls}>
          <h3 className={sectionHeadCls}><GraduationCap className="w-4 h-4 text-accent-indigo" /> Education</h3>
          <div>
            <label className={labelCls}>Primary Education</label>
            <select value={formData.portfolio_education || ''} onChange={(e) => setFormData({ ...formData, portfolio_education: e.target.value })} className={selectCls}>
              <option value="">Select your primary education</option>
              {educationOptions.length > 0 ? educationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>) : <option disabled>No education entries found</option>}
            </select>
          </div>
        </div>

        <div className={sectionCls}>
          <h3 className={sectionHeadCls}><FileText className="w-4 h-4 text-accent-indigo" /> Certifications</h3>
          <div className="space-y-2">
            {formData.portfolio_certifications.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <select value={item} onChange={(e) => updateListItem('portfolio_certifications', index, e.target.value)} className={`flex-1 ${selectCls}`}>
                  <option value="">Select certification</option>
                  {getDropdownOptions('portfolio_certifications', certificationOptions, item).length > 0
                    ? getDropdownOptions('portfolio_certifications', certificationOptions, item).map((opt) => <option key={opt} value={opt}>{opt}</option>)
                    : <option disabled>No more certifications available</option>}
                </select>
                <button type="button" onClick={() => removeListItem('portfolio_certifications', index)} className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/30 transition-colors">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('portfolio_certifications')} disabled={getAvailableOptions('portfolio_certifications', certificationOptions).length === 0} className="text-xs px-3 py-2 text-accent-indigo hover:bg-accent-indigo/10 rounded-lg border border-accent-indigo/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              + Add Certification
            </button>
          </div>
        </div>

        <div className={sectionCls}>
          <h3 className={sectionHeadCls}><Award className="w-4 h-4 text-accent-indigo" /> Awards</h3>
          <div className="space-y-2">
            {formData.portfolio_awards.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <select value={item} onChange={(e) => updateListItem('portfolio_awards', index, e.target.value)} className={`flex-1 ${selectCls}`}>
                  <option value="">Select award</option>
                  {getDropdownOptions('portfolio_awards', awardOptions, item).length > 0
                    ? getDropdownOptions('portfolio_awards', awardOptions, item).map((opt) => <option key={opt} value={opt}>{opt}</option>)
                    : <option disabled>No more awards available</option>}
                </select>
                <button type="button" onClick={() => removeListItem('portfolio_awards', index)} className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/30 transition-colors">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('portfolio_awards')} disabled={getAvailableOptions('portfolio_awards', awardOptions).length === 0} className="text-xs px-3 py-2 text-accent-indigo hover:bg-accent-indigo/10 rounded-lg border border-accent-indigo/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              + Add Award
            </button>
          </div>
        </div>

        <div className={sectionCls}>
          <h3 className={sectionHeadCls}><FileText className="w-4 h-4 text-accent-indigo" /> Social &amp; Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>GitHub Profile</label>
              <input type="url" value={formData.github_url || ''} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} className={inputCls} placeholder="https://github.com/username" />
            </div>
            <div>
              <label className={labelCls}>LinkedIn Profile</label>
              <input type="url" value={formData.linkedin_url || ''} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className={labelCls}>Twitter Profile</label>
              <input type="url" value={formData.twitter_url || ''} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })} className={inputCls} placeholder="https://twitter.com/username" />
            </div>
            <div>
              <label className={labelCls}>Instagram Profile</label>
              <input type="url" value={formData.instagram_url || ''} onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })} className={inputCls} placeholder="https://instagram.com/username" />
            </div>
            <div>
              <label className={labelCls}>LeetCode Profile</label>
              <input type="url" value={formData.leetcode_url || ''} onChange={(e) => setFormData({ ...formData, leetcode_url: e.target.value })} className={inputCls} placeholder="https://leetcode.com/username" />
            </div>
            <div>
              <label className={labelCls}>Personal Website</label>
              <input type="url" value={formData.website_url || ''} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className={inputCls} placeholder="https://yourwebsite.com" />
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={!isSubmitActive || loading} className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Portfolio'}
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 py-2.5 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditPortfolioModal;
