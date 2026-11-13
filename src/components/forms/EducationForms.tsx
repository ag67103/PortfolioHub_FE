import { useEffect, useState } from "react";
import { Education } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { GraduationCap } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { addEducation, updateEducation } from "../../services/api";

interface EducationAddEditFormProps {
    isAdd: boolean;
    selectedEducation?: Education | null;
    setShowForm: (show: boolean) => void;
}

const EducationAddEditForm: React.FC<EducationAddEditFormProps> = ({ isAdd, selectedEducation, setShowForm }) => {
    const [education, setEducation] = useState({
        institution: selectedEducation?.institution ?? '',
        degree: selectedEducation?.degree ?? '',
        start_date: '',
        end_date: '',
        description: selectedEducation?.description ?? '',
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsEducationLoading } = usePortfolio();

    useEffect(() => {
        const init = async () => {
            if (selectedEducation?.start_date) {
                const d = await converEpochToDate(selectedEducation.start_date);
                setEducation(prev => ({ ...prev, start_date: d ?? '' }));
            }
            if (selectedEducation?.end_date) {
                const d = await converEpochToDate(selectedEducation.end_date);
                setEducation(prev => ({ ...prev, end_date: d ?? '' }));
            }
        };
        init();
    }, [selectedEducation]);

    useEffect(() => {
        const check = async () => {
            if (
                (isAdd && education.institution && education.degree && education.start_date) ||
                (!isAdd && (education.institution !== selectedEducation?.institution || education.degree !== selectedEducation?.degree || education.start_date !== await converEpochToDate(selectedEducation?.start_date ?? '') || education.end_date !== await converEpochToDate(selectedEducation?.end_date ?? '') || education.description !== (selectedEducation?.description ?? '')))
            ) setIsSubmitActive(true);
            else setIsSubmitActive(false);
        };
        check();
    }, [education.institution, education.degree, education.start_date, education.end_date, education.description]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEducation(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            const startEpoch = await convertDateToEpoch(education.start_date ?? '');
            const endEpoch = await convertDateToEpoch(education.end_date ?? '');
            const data = { ...education, start_date: startEpoch, end_date: endEpoch };
            const response = isAdd ? await addEducation(data) : await updateEducation(selectedEducation?._id ?? '', data);
            if (response.status_code === 400) throw new Error(response.message ?? 'Failed to save education');
            setShowForm(false);
            setIsEducationLoading(true);
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
                    <GraduationCap className="w-5 h-5 text-accent-light" />
                </div>
                <h2 className="font-grotesk text-xl font-bold text-ink-primary">{isAdd ? 'Add Education' : 'Edit Education'}</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className={sectionCls}>
                    <div>
                        <label className={labelCls}>Institution <span className="text-red-400">*</span></label>
                        <input type="text" name="institution" placeholder="e.g., University of California, Los Angeles" className={inputCls} value={education.institution} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelCls}>Degree <span className="text-red-400">*</span></label>
                        <input type="text" name="degree" placeholder="e.g., Bachelor of Science in Computer Science" className={inputCls} value={education.degree} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelCls}>Description <span className="text-ink-muted text-xs">(optional)</span></label>
                        <textarea
                            value={education.description}
                            onChange={(e) => setEducation(p => ({ ...p, description: e.target.value }))}
                            className={`${inputCls} resize-y min-h-[80px]`}
                            rows={3}
                            placeholder="Describe achievements, specializations, notable projects..."
                        />
                    </div>
                </div>

                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                            <MonthYearPicker label="Start Date" value={education.start_date} onChange={(v) => setEducation(p => ({ ...p, start_date: v }))} placeholder="Select start date" startDate={education.end_date} />
                        </div>
                        <div>
                            <label className={labelCls}>End Date <span className="text-ink-muted text-xs">(optional)</span></label>
                            <MonthYearPicker label="End Date (Optional)" value={education.end_date} onChange={(v) => setEducation(p => ({ ...p, end_date: v }))} placeholder="Select end date" startDate={education.start_date} disabled={!education.start_date} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2" disabled={!isSubmitActive || loading}>
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isAdd ? 'Adding...' : 'Updating...'}</> : isAdd ? 'Add Education' : 'Update Education'}
                    </button>
                    <button type="button" className="btn-ghost flex-1 py-2.5 rounded-lg text-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export { EducationAddEditForm };
