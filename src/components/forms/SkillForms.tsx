import { useEffect, useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Skill } from "../../services/modal";
import { addSkill, updateSkill } from "../../services/api";
import { Code } from "lucide-react";

interface AddEditSkillFormProps {
    isAdd: boolean;
    selectedSkill?: Skill | null;
    setShowForm: (show: boolean) => void;
}

const AddEditSkillForm: React.FC<AddEditSkillFormProps> = ({ isAdd, selectedSkill, setShowForm }) => {
    const [skill, setSkill] = useState({
        name: selectedSkill?.name ?? '',
        category: selectedSkill?.category ?? '',
        proficiency: selectedSkill?.proficiency ?? 0,
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsSkillLoading } = usePortfolio();

    useEffect(() => {
        if (
            (isAdd && skill.name && skill.category) ||
            (!isAdd && (skill.name !== selectedSkill?.name || skill.category !== selectedSkill?.category || skill.proficiency !== selectedSkill?.proficiency))
        ) {
            setIsSubmitActive(true);
        } else {
            setIsSubmitActive(false);
        }
    }, [skill.name, skill.category, skill.proficiency]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            const response = isAdd ? await addSkill(skill) : await updateSkill(selectedSkill?._id ?? '', skill);
            if (response.status_code === 400) throw new Error(response.message ?? 'Failed to save skill');
            setShowForm(false);
            setIsSkillLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
    const labelCls = "block text-sm font-medium text-ink-secondary mb-1.5";

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl">
                    <Code className="w-5 h-5 text-accent-light" />
                </div>
                <h2 className="font-grotesk text-xl font-bold text-ink-primary">{isAdd ? 'Add Skill' : 'Edit Skill'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelCls}>Skill Name <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        placeholder="e.g., React, Python, Docker"
                        className={inputCls}
                        value={skill.name}
                        onChange={e => setSkill(s => ({ ...s, name: e.target.value }))}
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        placeholder="e.g., Frontend, Backend, DevOps"
                        className={inputCls}
                        value={skill.category}
                        onChange={e => setSkill(s => ({ ...s, category: e.target.value }))}
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Proficiency: <span className="text-accent-light font-semibold">{skill.proficiency}%</span></label>
                    <div className="mt-2">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={skill.proficiency}
                            onChange={e => setSkill(s => ({ ...s, proficiency: Number(e.target.value) }))}
                            className="w-full accent-indigo-500"
                        />
                        <div className="obs-progress-track mt-2">
                            <div className="obs-progress-fill" style={{ width: `${skill.proficiency}%` }} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-glow flex-1 py-2.5 rounded-lg text-sm" disabled={!isSubmitActive || loading}>
                        {loading ? 'Saving...' : isAdd ? 'Add Skill' : 'Update Skill'}
                    </button>
                    <button type="button" className="btn-ghost flex-1 py-2.5 rounded-lg text-sm" disabled={loading} onClick={() => setShowForm(false)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export { AddEditSkillForm };
