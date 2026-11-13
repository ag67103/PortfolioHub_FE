import { useEffect, useState } from "react";
import { Experience } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { Briefcase } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { addExperience, updateExperience } from "../../services/api";

interface ExperienceAddEditFormProps {
    isAdd: boolean;
    selectedExperience?: Experience | null;
    setShowForm: (show: boolean) => void;
}

const ExperienceAddEditForm: React.FC<ExperienceAddEditFormProps> = ({ isAdd, selectedExperience, setShowForm }) => {
    const [experience, setExperience] = useState({
        title: selectedExperience?.title ?? '',
        company: selectedExperience?.company ?? '',
        description: selectedExperience?.description ?? '',
        technologies: selectedExperience?.technologies?.join(', ') ?? '',
        start_date: '',
        end_date: '',
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsExperienceLoading } = usePortfolio();

    useEffect(() => {
        const init = async () => {
            if (selectedExperience?.start_date) {
                const d = await converEpochToDate(selectedExperience.start_date);
                setExperience(prev => ({ ...prev, start_date: d ?? '' }));
            }
            if (selectedExperience?.end_date) {
                const d = await converEpochToDate(selectedExperience.end_date);
                setExperience(prev => ({ ...prev, end_date: d ?? '' }));
            }
        };
        init();
    }, [selectedExperience]);

    useEffect(() => {
        const check = async () => {
            if (
                (isAdd && experience.title && experience.company && experience.description && experience.technologies && experience.start_date) ||
                (!isAdd && (experience.title !== selectedExperience?.title || experience.company !== selectedExperience?.company || experience.description !== selectedExperience?.description || experience.technologies !== (selectedExperience?.technologies?.join(', ') ?? '') || experience.start_date !== await converEpochToDate(selectedExperience?.start_date ?? '') || experience.end_date !== await converEpochToDate(selectedExperience?.end_date ?? '')))
            ) setIsSubmitActive(true);
            else setIsSubmitActive(false);
        };
        check();
    }, [experience.title, experience.company, experience.description, experience.technologies, experience.start_date, experience.end_date]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setExperience(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            const startEpoch = await convertDateToEpoch(experience.start_date ?? '');
            const endEpoch = await convertDateToEpoch(experience.end_date ?? '');
            const data = {
                ...experience,
                technologies: experience.technologies.toString().split(',').map((t: string) => t.trim()).filter(Boolean),
                start_date: startEpoch,
                end_date: endEpoch,
            };
            const response = isAdd ? await addExperience(data) : await updateExperience(selectedExperience?._id ?? '', data);
            if (response.status_code === 400) throw new Error(response.message ?? 'Failed to save experience');
            setShowForm(false);
            setIsExperienceLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
    const labelCls = "block text-sm font-medium text-ink-secondary mb-1.5";
    const sectionCls = "bg-obsidian-bg border border-obsidian-border rounded-xl p-4 space-y-4";

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl">
                    <Briefcase className="w-5 h-5 text-accent-light" />
                </div>
                <h2 className="font-grotesk text-xl font-bold text-ink-primary">{isAdd ? 'Add Experience' : 'Edit Experience'}</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className={sectionCls}>
                    <div>
                        <label className={labelCls}>Job Title <span className="text-red-400">*</span></label>
                        <input type="text" name="title" placeholder="e.g., Senior Software Engineer" className={inputCls} value={experience.title} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelCls}>Company <span className="text-red-400">*</span></label>
                        <input type="text" name="company" placeholder="e.g., Google, Microsoft" className={inputCls} value={experience.company} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                        <textarea name="description" placeholder="Describe your role, responsibilities, and achievements..." className={`${inputCls} resize-y min-h-[90px]`} value={experience.description} onChange={handleChange} required rows={4} />
                    </div>
                    <div>
                        <label className={labelCls}>Technologies <span className="text-red-400">*</span></label>
                        <input type="text" name="technologies" placeholder="e.g., React, Node.js, Python (comma separated)" className={inputCls} value={experience.technologies} onChange={handleChange} required />
                        <p className="text-xs text-ink-muted mt-1">Separate multiple technologies with commas</p>
                    </div>
                </div>

                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                            <MonthYearPicker placeholder="Start Date" label="Start Date" value={experience.start_date} onChange={(v) => setExperience(p => ({ ...p, start_date: v }))} startDate={experience.end_date} />
                        </div>
                        <div>
                            <label className={labelCls}>End Date <span className="text-ink-muted text-xs">(leave blank if current)</span></label>
                            <MonthYearPicker placeholder="End Date" label="End Date" value={experience.end_date} onChange={(v) => setExperience(p => ({ ...p, end_date: v }))} startDate={experience.start_date} disabled={!experience.start_date} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2" disabled={!isSubmitActive || loading}>
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isAdd ? 'Adding...' : 'Updating...'}</> : isAdd ? 'Add Experience' : 'Update Experience'}
                    </button>
                    <button type="button" className="btn-ghost flex-1 py-2.5 rounded-lg text-sm" onClick={() => setShowForm(false)} disabled={loading}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export { ExperienceAddEditForm };
