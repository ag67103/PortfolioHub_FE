import { Edit2, Trash2, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { useState } from "react";
import { Education } from "../../services/modal";
import { ModalOverlay } from "../forms/ModalOverlay";
import { EducationAddEditForm } from "../forms/EducationForms";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";

const getEducationDuration = (startDate: string, endDate: string) => {
    if (startDate && endDate) return `${new Date(startDate).getFullYear()} — ${new Date(endDate).getFullYear()}`;
    if (startDate) return `${new Date(startDate).getFullYear()}`;
    return 'Present';
};

const EducationSection = () => {
    const { isMe } = useAuth();
    const { educations } = usePortfolio();
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    return (
        <section id='education' className='section-obsidian py-20'>
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <EducationAddEditForm isAdd={true} setShowForm={setShowAddForm} />
                </ModalOverlay>
            )}
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <EducationAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedEducation={selectedEducation} />
                </ModalOverlay>
            )}
            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        data={selectedEducation}
                        dataType="education"
                        setSelectedData={setSelectedEducation}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Academic Background</h2>
                    </div>
                    {isMe && educations && educations.length > 0 && (
                        <button className="btn-glow px-5 py-2.5 rounded-lg text-sm self-start sm:self-auto" onClick={() => setShowAddForm(true)}>
                            + Add Education
                        </button>
                    )}
                </div>

                {educations && educations.length > 0 ? (
                    <div className="space-y-6">
                        {educations.map((education: any, index: number) => (
                            <div
                                key={education.id || education._id || `edu-${index}`}
                                className="obs-card p-6 relative group"
                            >
                                {isMe && (
                                    <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-2 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors"
                                            onClick={() => { setSelectedEducation(education); setShowEditForm(true); }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="p-2 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => { setSelectedEducation(education); setShowDeleteConfirmationModal(true); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-lg shrink-0">
                                        <GraduationCap className="w-5 h-5 text-accent-indigo" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                                        <div>
                                            <h3 className="font-grotesk text-lg font-bold text-ink-primary">{education.degree}</h3>
                                            <p className="text-accent-indigo font-medium text-sm">{education.institution}</p>
                                        </div>
                                        <span className="text-xs font-medium text-ink-muted bg-obsidian-surface border border-obsidian-border px-3 py-1.5 rounded-full whitespace-nowrap self-start sm:self-auto">
                                            {getEducationDuration(education.start_date, education.end_date)}
                                        </span>
                                    </div>
                                </div>

                                {education.description && (
                                    <ul className="space-y-1.5 text-ink-secondary mb-4 ml-4 list-disc list-outside text-sm">
                                        {education.description
                                            .split('\n')
                                            .filter((line: string) => line.trim())
                                            .map((desc: string, i: number) => (
                                                <li key={i} className="leading-relaxed pl-1">{desc}</li>
                                            ))
                                        }
                                    </ul>
                                )}

                                {education.technologies?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {education.technologies.map((tech: any, i: number) => (
                                            <span key={`edu-t-${i}`} className="obs-tag">{tech}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="obs-card p-12 text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                            <GraduationCap className="w-7 h-7 text-accent-indigo" />
                        </div>
                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">No Education Added Yet</h3>
                        <p className="text-ink-secondary mb-6 text-sm leading-relaxed">
                            {isMe ? 'Highlight your academic journey by adding your education.' : 'Education will appear here once added.'}
                        </p>
                        {isMe && (
                            <button className="btn-glow px-6 py-2.5 rounded-lg text-sm" onClick={() => setShowAddForm(true)}>
                                Add Your First Education
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default EducationSection;
