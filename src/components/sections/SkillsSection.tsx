import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Edit2, Trash2, Code } from "lucide-react";
import { AddEditSkillForm } from "../forms/SkillForms";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";
import { ModalOverlaySkills } from "../forms/ModalOverlay";
import { Skill } from "../../services/modal";

const SkillsSection: React.FC = () => {
    const { isMe } = useAuth();
    const { skills } = usePortfolio();
    const [categoryVisibleSkills, setCategoryVisibleSkills] = useState<Record<string, number>>({});
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const MAX_SKILLS = 10;
    const INCREMENT = 5;

    const handleShowMore = (cat: string, max: number) => {
        setCategoryVisibleSkills(prev => ({ ...prev, [cat]: Math.min((prev[cat] || MAX_SKILLS) + INCREMENT, max) }));
    };
    const handleHide = (cat: string) => {
        setCategoryVisibleSkills(prev => ({ ...prev, [cat]: MAX_SKILLS }));
    };

    return (
        <section id='skills' className='section-surface py-20'>
            {showAddForm && (
                <ModalOverlaySkills onClose={() => setShowAddForm(false)}>
                    <AddEditSkillForm isAdd={true} selectedSkill={null} setShowForm={setShowAddForm} />
                </ModalOverlaySkills>
            )}
            {showEditForm && (
                <ModalOverlaySkills onClose={() => setShowEditForm(false)}>
                    <AddEditSkillForm isAdd={false} selectedSkill={selectedSkill} setShowForm={setShowEditForm} />
                </ModalOverlaySkills>
            )}
            {showDeleteConfirmationModal && (
                <ModalOverlaySkills onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        setSelectedData={setSelectedSkill}
                        data={selectedSkill}
                        dataType="skill"
                    />
                </ModalOverlaySkills>
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Technical Expertise</h2>
                    </div>
                    {isMe && skills.length > 0 && (
                        <button className="btn-glow px-5 py-2.5 rounded-lg text-sm self-start sm:self-auto" onClick={() => setShowAddForm(true)}>
                            + Add Skill
                        </button>
                    )}
                </div>

                {skills.length === 0 ? (
                    <div className="obs-card p-12 text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                            <Code className="w-7 h-7 text-accent-indigo" />
                        </div>
                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">No Skills Added Yet</h3>
                        <p className="text-ink-secondary mb-6 text-sm leading-relaxed">
                            {isMe ? 'Add your technical skills to showcase your capabilities.' : 'Skills will appear here once added.'}
                        </p>
                        {isMe && (
                            <button className="btn-glow px-6 py-2.5 rounded-lg text-sm" onClick={() => setShowAddForm(true)}>
                                Add Your First Skill
                            </button>
                        )}
                    </div>
                ) : (
                    (() => {
                        const byCategory = skills.reduce((acc, skill) => {
                            if (!acc[skill.category]) acc[skill.category] = [];
                            acc[skill.category].push(skill);
                            return acc;
                        }, {} as Record<string, Skill[]>);

                        return (
                            <div className="space-y-6">
                                {Object.entries(byCategory).map(([category, catSkills]) => {
                                    const total = catSkills.length;
                                    const visible = categoryVisibleSkills[category] || Math.min(MAX_SKILLS, total);
                                    const shown = catSkills.slice(0, visible);

                                    return (
                                        <div key={category} className="obs-card p-6">
                                            <div className="flex justify-between items-center mb-5">
                                                <h3 className="font-grotesk font-semibold text-ink-primary">{category}</h3>
                                                <span className="text-xs text-ink-muted">{total} skill{total !== 1 ? 's' : ''}</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                                {shown.map((skill: any) => (
                                                    <div key={skill._id} className="bg-obsidian-surface border border-obsidian-border rounded-lg p-4 hover:border-accent-indigo/40 transition-all duration-300 group/skill">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 title={skill.name} className="text-sm font-semibold text-ink-primary break-words">{skill.name}</h4>
                                                            <div className="flex items-center gap-1.5">
                                                                {isMe && (
                                                                    <div className="flex gap-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/skill:opacity-100 focus-within:opacity-100 transition-opacity">
                                                                        <button
                                                                            className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded transition-colors"
                                                                            onClick={() => { setSelectedSkill(skill); setShowEditForm(true); }}
                                                                        >
                                                                            <Edit2 size={12} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1.5 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                                            onClick={() => { setSelectedSkill(skill); setShowDeleteConfirmationModal(true); }}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <span className="text-xs text-accent-indigo font-medium">{skill.proficiency}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="obs-progress-track">
                                                            <div
                                                                className="obs-progress-fill"
                                                                style={{ width: `${skill.proficiency}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {(total > visible || visible > MAX_SKILLS) && (
                                                <div className="mt-4 flex gap-3 justify-center">
                                                    {total > visible && (
                                                        <button
                                                            className="btn-ghost px-4 py-1.5 text-xs rounded-lg"
                                                            onClick={() => handleShowMore(category, total)}
                                                        >
                                                            Show more ({total - visible})
                                                        </button>
                                                    )}
                                                    {visible > MAX_SKILLS && (
                                                        <button
                                                            className="btn-ghost px-4 py-1.5 text-xs rounded-lg"
                                                            onClick={() => handleHide(category)}
                                                        >
                                                            Show less
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()
                )}
            </div>
        </section>
    );
};

export default SkillsSection;
