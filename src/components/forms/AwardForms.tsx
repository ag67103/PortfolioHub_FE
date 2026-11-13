import { useEffect, useState } from "react";
import { Award } from "../../services/modal";
import { converEpochToDate, convertDateToEpoch } from "../../utils/utility";
import { usePortfolio } from "../../context/PortfolioContext";
import { addAward, updateAward } from "../../services/api";
import { Trophy } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";

interface AwardAddEditFormProps {
    isAdd: boolean;
    selectedAward?: Award | null;
    setShowForm: (show: boolean) => void;
}

const AwardAddEditForm: React.FC<AwardAddEditFormProps> = ({ isAdd, selectedAward, setShowForm }) => {
    const [award, setAward] = useState({
        name: selectedAward?.name ?? '',
        description: selectedAward?.description ?? '',
        issuer: selectedAward?.issuer ?? '',
        issue_date: selectedAward?.issue_date ?? '',
        category: selectedAward?.category ?? '',
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsAwardLoading } = usePortfolio();

    useEffect(() => {
        const init = async () => {
            if (selectedAward?.issue_date) {
                const d = await converEpochToDate(selectedAward.issue_date);
                setAward(prev => ({ ...prev, issue_date: d ?? '' }));
            }
        };
        init();
    }, [selectedAward]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setAward(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const check = async () => {
            if (
                (isAdd && award.name && award.description && award.issuer && award.issue_date && award.category) ||
                (!isAdd && (award.name !== selectedAward?.name || award.description !== selectedAward?.description || award.issuer !== selectedAward?.issuer || award.issue_date !== await converEpochToDate(selectedAward?.issue_date ?? '') || award.category !== selectedAward?.category))
            ) setIsSubmitActive(true);
            else setIsSubmitActive(false);
        };
        check();
    }, [award.name, award.description, award.issuer, award.issue_date, award.category]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            const epoch = await convertDateToEpoch(award.issue_date ?? '');
            const response = isAdd
                ? await addAward({ ...award, issue_date: epoch })
                : await updateAward(selectedAward?._id ?? '', { ...award, issue_date: epoch });
            if (response.status_code === 400) throw new Error(response.message ?? 'Failed to save award');
            setShowForm(false);
            setIsAwardLoading(true);
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
                    <Trophy className="w-5 h-5 text-accent-light" />
                </div>
                <h2 className="font-grotesk text-xl font-bold text-ink-primary">{isAdd ? 'Add Award' : 'Edit Award'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Award Name <span className="text-red-400">*</span></label>
                            <input type="text" name="name" value={award.name} onChange={handleChange} placeholder="e.g., Employee of the Year" className={inputCls} required />
                        </div>
                        <div>
                            <label className={labelCls}>Issuing Organization <span className="text-red-400">*</span></label>
                            <input type="text" name="issuer" value={award.issuer} onChange={handleChange} placeholder="e.g., Tech Innovation Awards" className={inputCls} required />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                        <textarea
                            name="description"
                            value={award.description}
                            onChange={handleChange}
                            placeholder="Describe the award and its significance..."
                            className={`${inputCls} resize-y min-h-[90px]`}
                            rows={3}
                            required
                        />
                    </div>
                </div>

                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Award Date <span className="text-red-400">*</span></label>
                            <MonthYearPicker label="" value={award.issue_date} onChange={(d) => setAward(p => ({ ...p, issue_date: d }))} placeholder="Select award date" />
                        </div>
                        <div>
                            <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                            <select name="category" value={award.category} onChange={handleChange} className={inputCls} required>
                                <option value="">Select Category</option>
                                {['Excellence', 'Innovation', 'Leadership', 'Service', 'Achievement', 'Recognition', 'Competition', 'Academic', 'Professional', 'Other'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2" disabled={!isSubmitActive || loading}>
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isAdd ? 'Adding...' : 'Updating...'}</> : isAdd ? 'Add Award' : 'Update Award'}
                    </button>
                    <button type="button" className="btn-ghost flex-1 py-2.5 rounded-lg text-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export { AwardAddEditForm };
