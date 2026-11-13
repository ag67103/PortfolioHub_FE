import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { Edit2, Trash2, Briefcase } from "lucide-react";
import { Experience } from "../../services/modal";
import { ModalOverlay } from "../forms/ModalOverlay";
import { ExperienceAddEditForm } from "../forms/ExperienceForms";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";

const calculateExperiencePeriod = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const startYear = start.getFullYear();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    if (!endDate) return `${startMonth} ${startYear} — Present`;
    const endYear = end.getFullYear();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    return startYear === endYear ? `${startMonth} — ${endMonth} ${startYear}` : `${startMonth} ${startYear} — ${endMonth} ${endYear}`;
};

const ExperienceSection: React.FC = () => {
    const { isMe } = useAuth();
    const { experiences } = usePortfolio();
    const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    return (
        <section id='experience' className='section-surface py-20'>
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <ExperienceAddEditForm isAdd={true} setShowForm={setShowAddForm} selectedExperience={null} />
                </ModalOverlay>
            )}
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <ExperienceAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedExperience={selectedExperience} />
                </ModalOverlay>
            )}
            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        data={selectedExperience}
                        dataType="experience"
                        setSelectedData={setSelectedExperience}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Work History</h2>
                    </div>
                    {isMe && experiences.length > 0 && (
                        <button className="btn-glow px-5 py-2.5 rounded-lg text-sm self-start sm:self-auto" onClick={() => setShowAddForm(true)}>
                            + Add Experience
                        </button>
                    )}
                </div>

                {experiences.length === 0 ? (
                    <div className="obs-card p-12 text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                            <Briefcase className="w-7 h-7 text-accent-indigo" />
                        </div>
                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">No Experience Added Yet</h3>
                        <p className="text-ink-secondary mb-6 text-sm leading-relaxed">
                            {isMe ? 'Share your professional journey by adding your work experience.' : 'Work experience will appear here once added.'}
                        </p>
                        {isMe && (
                            <button className="btn-glow px-6 py-2.5 rounded-lg text-sm" onClick={() => setShowAddForm(true)}>
                                Add Your First Experience
                            </button>
                        )}
                    </div>
                ) : (
                    /* Timeline layout */
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent-indigo/50 via-accent-indigo/20 to-transparent hidden sm:block" />

                        <div className="space-y-6 sm:pl-16">
                            {experiences.map((exp, index) => (
                                <div key={exp._id || `exp-${index}`} className="obs-card p-6 relative group">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[2.75rem] top-6 w-3 h-3 rounded-full bg-accent-indigo border-2 border-obsidian-bg hidden sm:block" />

                                    {isMe && (
                                        <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-2 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors"
                                                onClick={() => { setSelectedExperience(exp); setShowEditForm(true); }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="p-2 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                onClick={() => { setSelectedExperience(exp); setShowDeleteConfirmationModal(true); }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                                        <div>
                                            <h3 className="font-grotesk text-lg font-bold text-ink-primary">{exp.title}</h3>
                                            <p className="text-accent-indigo font-medium text-sm mt-0.5">{exp.company}</p>
                                        </div>
                                        <span className="text-xs font-medium text-ink-muted bg-obsidian-surface border border-obsidian-border px-3 py-1.5 rounded-full whitespace-nowrap self-start">
                                            {calculateExperiencePeriod(exp.start_date, exp.end_date)}
                                        </span>
                                    </div>

                                    <ul className="space-y-1.5 text-ink-secondary mb-4 ml-4 list-disc list-outside text-sm">
                                        {exp.description.split('\n').filter(l => l.trim()).map((desc, i) => (
                                            <li key={i} className="leading-relaxed pl-1">{desc}</li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-wrap gap-2">
                                        {(exp.technologies as string[]).map((tech, i) => (
                                            <span key={`${exp._id}-t-${i}`} className="obs-tag">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ExperienceSection;
