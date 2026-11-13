import { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { useAuth } from "../../context/AuthContext";
import { Edit2, Eye, Trash2, Award } from "lucide-react";
import { Certification } from "../../services/modal";
import { ModalOverlay } from "../forms/ModalOverlay";
import { CertificateAddEditForm } from "../forms/CertificateForm";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";
import { safeHref } from "../../utils/utility";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const CertificationSection = () => {
    const { isMe } = useAuth();
    const { certifications } = usePortfolio();
    const [showAll, setShowAll] = useState(false);
    const FEATURED = 4;
    const ordered = [...certifications].sort((a: any, b: any) => String(b.issue_date).localeCompare(String(a.issue_date)));
    const visible = showAll ? ordered : ordered.slice(0, FEATURED);
    const [selectedCertificate, setSelectedCertificate] = useState<Certification | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    return (
        <section id="certifications" className="section-surface py-20">
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <CertificateAddEditForm isAdd={true} setShowForm={setShowAddForm} selectedCertificate={null} />
                </ModalOverlay>
            )}
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <CertificateAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedCertificate={selectedCertificate} />
                </ModalOverlay>
            )}
            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal
                        setShowDeleteModal={setShowDeleteConfirmationModal}
                        data={selectedCertificate}
                        dataType="certification"
                        setSelectedData={setSelectedCertificate}
                    />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Credentials</h2>
                    </div>
                    {isMe && certifications.length > 0 && (
                        <button className="btn-glow px-5 py-2.5 rounded-lg text-sm self-start sm:self-auto" onClick={() => setShowAddForm(true)}>
                            + Add Certification
                        </button>
                    )}
                </div>

                {certifications.length === 0 ? (
                    <div className="obs-card p-12 text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                            <Award className="w-7 h-7 text-accent-light" />
                        </div>
                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">No Certifications Yet</h3>
                        <p className="text-ink-secondary mb-6 text-sm leading-relaxed">
                            {isMe ? 'Showcase your professional certifications and credentials.' : 'Certifications will appear here once added.'}
                        </p>
                        {isMe && (
                            <button className="btn-glow px-6 py-2.5 rounded-lg text-sm" onClick={() => setShowAddForm(true)}>
                                Add Your First Certification
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {visible.map((cert) => (
                            <div key={cert._id} className="obs-card p-6 relative group">
                                {isMe && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                        <button
                                            aria-label={`Edit ${(cert as any).title || (cert as any).name || (cert as any).institution || 'entry'}`}
                                            className="p-2 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors"
                                            onClick={() => { setSelectedCertificate(cert); setShowEditForm(true); }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            aria-label={`Delete ${(cert as any).title || (cert as any).name || (cert as any).institution || 'entry'}`}
                                            className="p-2 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => { setSelectedCertificate(cert); setShowDeleteConfirmationModal(true); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className={`flex items-start gap-3 mb-3 ${isMe ? 'pr-24' : ''}`}>
                                    <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-lg shrink-0 mt-0.5">
                                        <Award className="w-4 h-4 text-accent-light" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-grotesk font-bold text-ink-primary leading-tight">{cert.name}</h3>
                                        <p className="text-accent-light text-sm font-medium mt-0.5">{cert.issuer}</p>
                                    </div>
                                    <span className="text-xs text-ink-muted bg-obsidian-surface border border-obsidian-border px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                                        {formatDate(cert.issue_date)}
                                    </span>
                                </div>

                                {cert.description && (
                                    <p className="text-ink-secondary text-sm leading-relaxed mb-4 ml-11">{cert.description}</p>
                                )}

                                <div className="flex flex-wrap gap-2 ml-11">
                                    {cert.credential_id && (
                                        <span className="obs-tag text-xs">ID: {cert.credential_id}</span>
                                    )}
                                    {safeHref(cert.credential_url) && (
                                        <a
                                            href={safeHref(cert.credential_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="obs-tag text-xs flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
                                        >
                                            <Eye className="w-3 h-3" /> View Credential
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {certifications.length > FEATURED && (
                            <div className="md:col-span-2 flex justify-center pt-1">
                                <button
                                    onClick={() => setShowAll(v => !v)}
                                    aria-expanded={showAll}
                                    className="px-6 py-2.5 rounded-xl border border-obsidian-border text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-obsidian-border transition-colors"
                                >
                                    {showAll ? 'Show fewer' : `Show all ${certifications.length} certifications`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CertificationSection;
