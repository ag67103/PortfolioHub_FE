import { Edit2, Trash2, Trophy } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { ModalOverlay } from "../forms/ModalOverlay";
import { AwardAddEditForm } from "../forms/AwardForms";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";
import { useState } from "react";
import { Award } from "../../services/modal";

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const AwardsSection = () => {
    const { isMe } = useAuth();
    const { awards } = usePortfolio();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [selectedAward, setSelectedAward] = useState<Award | null>(null);

    return (
        <section id='awards' className='section-obsidian py-20'>
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <AwardAddEditForm isAdd={true} setShowForm={setShowAddForm} selectedAward={null} />
                </ModalOverlay>
            )}
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <AwardAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedAward={selectedAward} />
                </ModalOverlay>
            )}
            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        data={selectedAward}
                        dataType="award"
                        setSelectedData={setSelectedAward}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Recognition</h2>
                    </div>
                    {isMe && awards.length > 0 && (
                        <button className="btn-glow px-5 py-2.5 rounded-lg text-sm self-start sm:self-auto" onClick={() => setShowAddForm(true)}>
                            + Add Award
                        </button>
                    )}
                </div>

                {awards.length === 0 ? (
                    <div className="obs-card p-12 text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                            <Trophy className="w-7 h-7 text-accent-light" />
                        </div>
                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">No Awards Yet</h3>
                        <p className="text-ink-secondary mb-6 text-sm leading-relaxed">
                            {isMe ? 'Celebrate your achievements by adding your awards and recognitions.' : 'Awards will appear here once added.'}
                        </p>
                        {isMe && (
                            <button className="btn-glow px-6 py-2.5 rounded-lg text-sm" onClick={() => setShowAddForm(true)}>
                                Add Your First Award
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {awards.map((award) => (
                            <div key={award._id} className="obs-card p-6 relative group">
                                {isMe && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                        <button
                                            aria-label={`Edit ${(award as any).title || (award as any).name || (award as any).institution || 'entry'}`}
                                            className="p-2 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors"
                                            onClick={() => { setSelectedAward(award); setShowEditForm(true); }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            aria-label={`Delete ${(award as any).title || (award as any).name || (award as any).institution || 'entry'}`}
                                            className="p-2 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => { setSelectedAward(award); setShowDeleteConfirmationModal(true); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-lg shrink-0 mt-0.5">
                                        <Trophy className="w-4 h-4 text-accent-light" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                                            <h3 className="font-grotesk font-bold text-ink-primary">{award.name}</h3>
                                            <span className="text-xs text-ink-muted bg-obsidian-surface border border-obsidian-border px-2.5 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                                                {formatDate(award.issue_date)}
                                            </span>
                                        </div>
                                        <p className="text-accent-light text-sm font-medium mb-2">{award.issuer}</p>
                                        {award.description && (
                                            <p className="text-ink-secondary text-sm leading-relaxed mb-3">{award.description}</p>
                                        )}
                                        <span className="obs-tag text-xs">{award.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AwardsSection;
