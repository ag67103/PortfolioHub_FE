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
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

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
                            <Code className="w-7 h-7 text-accent-light" />
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
                            <div className="obs-card divide-y divide-obsidian-border">
                                {Object.entries(byCategory).map(([category, catSkills]) => (
                                    <div key={category} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-x-6 gap-y-3 p-5 md:p-6">
                                        <h3 className="font-grotesk font-semibold text-ink-primary text-sm md:pt-1.5">{category}</h3>
                                        <ul className="flex flex-wrap gap-2" aria-label={`${category} skills`}>
                                            {catSkills.map((skill: any) => (
                                                <li key={skill._id} className="group/skill relative">
                                                    <span className="obs-tag text-sm inline-flex items-center gap-1.5">
                                                        {skill.name}
                                                        {isMe && (
                                                            <span className="inline-flex items-center gap-0.5 -mr-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/skill:opacity-100 focus-within:opacity-100 transition-opacity">
                                                                <button
                                                                    className="p-1 text-ink-muted hover:text-ink-primary rounded transition-colors"
                                                                    aria-label={`Edit ${skill.name}`}
                                                                    onClick={() => { setSelectedSkill(skill); setShowEditForm(true); }}
                                                                >
                                                                    <Edit2 size={11} />
                                                                </button>
                                                                <button
                                                                    className="p-1 text-ink-muted hover:text-red-400 rounded transition-colors"
                                                                    aria-label={`Delete ${skill.name}`}
                                                                    onClick={() => { setSelectedSkill(skill); setShowDeleteConfirmationModal(true); }}
                                                                >
                                                                    <Trash2 size={11} />
                                                                </button>
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        );
                    })()
                )}
            </div>
        </section>
    );
};

export default SkillsSection;
