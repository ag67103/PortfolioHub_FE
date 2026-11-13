import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { Edit2, Trash2, FolderKanban, ExternalLink, Github } from 'lucide-react';
import { Project } from '../../services/modal';
import { ModalOverlay } from '../forms/ModalOverlay';
import { ProjectAddEditForm } from '../forms/ProjectsForms';
import DeleteConfirmationModal from '../forms/DeleteConfirmationModal';
import { safeHref } from '../../utils/utility';
import LivePreview from '../LivePreview';

const formatDateForDisplay = (date: any): string | null => {
    if (!date) return null;
    if (typeof date === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        const d = new Date(date);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    if (typeof date === 'number') return new Date(date).toISOString().split('T')[0];
    return null;
};

const calculateProjectPeriod = (startDate: any, endDate?: any): string => {
    const startDateStr = formatDateForDisplay(startDate);
    const endDateStr = formatDateForDisplay(endDate);
    const start = startDateStr ? new Date(startDateStr) : new Date();
    const end = endDateStr ? new Date(endDateStr) : new Date();
    const startYear = start.getFullYear();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    if (!endDateStr) return `${startMonth} ${startYear} — Present`;
    const endYear = end.getFullYear();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    return startYear === endYear ? `${startMonth} — ${endMonth} ${startYear}` : `${startMonth} ${startYear} — ${endMonth} ${endYear}`;
};

const ProjectSection: React.FC = () => {
    const { isMe } = useAuth();
    const { projects } = usePortfolio();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAllProjects, setShowAllProjects] = useState(false);
    const INITIAL_PROJECTS = 4;   // featured; the rest sit behind "Show all"
    const visibleProjects = showAllProjects ? projects : projects.slice(0, INITIAL_PROJECTS);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    return (
        <section id='projects' className='section-obsidian py-20'>
            {showAddForm && (
                <ModalOverlay onClose={() => setShowAddForm(false)}>
                    <ProjectAddEditForm isAdd={true} setShowForm={setShowAddForm} selectedProject={null} />
                </ModalOverlay>
            )}
            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <ProjectAddEditForm isAdd={false} setShowForm={setShowEditForm} selectedProject={selectedProject} />
                </ModalOverlay>
            )}
            {showDeleteConfirmationModal && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModal(false)}>
                    <DeleteConfirmationModal data={selectedProject} dataType="project" setShowDeleteModal={setShowDeleteConfirmationModal} setSelectedData={setSelectedProject} />
                </ModalOverlay>
            )}

            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-grotesk text-4xl font-bold text-ink-primary">Featured Work</h2>
                    </div>
                    {isMe && projects.length > 0 && (
                        <button className="btn-glow px-5 py-2.5 rounded-lg text-sm self-start sm:self-auto" onClick={() => setShowAddForm(true)}>
                            + Add Project
                        </button>
                    )}
                </div>

                {projects.length === 0 ? (
                    <div className="obs-card p-12 text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/30 rounded-2xl mb-5">
                            <FolderKanban className="w-7 h-7 text-accent-light" />
                        </div>
                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">No Projects Yet</h3>
                        <p className="text-ink-secondary mb-6 text-sm leading-relaxed">
                            {isMe ? 'Showcase your work by adding your projects.' : 'Projects will appear here once added.'}
                        </p>
                        {isMe && (
                            <button className="btn-glow px-6 py-2.5 rounded-lg text-sm" onClick={() => setShowAddForm(true)}>
                                Add Your First Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {visibleProjects.map((project, index) => (
                            <div key={project._id || `proj-${index}`} className="obs-card p-7 relative group">
                                {isMe && (
                                    <div className="absolute top-5 right-5 flex gap-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
                                        <button
                                            aria-label={`Edit ${(project as any).title || (project as any).name || (project as any).institution || 'entry'}`}
                                            className="p-2 text-ink-muted hover:text-ink-primary hover:bg-obsidian-border rounded-lg transition-colors"
                                            onClick={() => { setSelectedProject(project); setShowEditForm(true); }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            aria-label={`Delete ${(project as any).title || (project as any).name || (project as any).institution || 'entry'}`}
                                            className="p-2 text-ink-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => { setSelectedProject(project); setShowDeleteConfirmationModal(true); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className={safeHref(project.live_url) ? 'md:flex md:gap-7' : ''}>
                                {safeHref(project.live_url) && project._id && (
                                    <div className="md:w-[340px] md:shrink-0 mb-5 md:mb-0 self-start">
                                        <LivePreview projectId={String(project._id)} url={safeHref(project.live_url)} title={project.title} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                <div className={`flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-3 ${isMe ? 'pr-24' : ''}`}>
                                    <div>
                                        <h3 className="font-grotesk text-xl font-bold text-ink-primary mb-2">{project.title}</h3>
                                        {(safeHref(project.live_url) || safeHref(project.code_url)) && (
                                            <div className="flex gap-4">
                                                {safeHref(project.live_url) && (
                                                    <a href={safeHref(project.live_url)} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-sm text-accent-light hover:text-accent-cyan transition-colors">
                                                        <ExternalLink size={13} /> Live Demo
                                                    </a>
                                                )}
                                                {safeHref(project.code_url) && (
                                                    <a href={safeHref(project.code_url)} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-sm text-accent-light hover:text-accent-cyan transition-colors">
                                                        <Github size={13} /> Source Code
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-ink-muted bg-obsidian-surface border border-obsidian-border px-3 py-1.5 rounded-full whitespace-nowrap self-start">
                                        {calculateProjectPeriod(project.start_date, project.end_date)}
                                    </span>
                                </div>

                                <ul className="space-y-1.5 text-ink-secondary mb-5 ml-4 list-disc list-outside text-sm">
                                    {project.description.split('\n').filter(l => l.trim()).map((desc, i) => (
                                        <li key={i} className="leading-relaxed pl-1">{desc}</li>
                                    ))}
                                </ul>

                                <div className="flex flex-wrap gap-2">
                                    {(project.technologies as string[]).map((tech, i) => (
                                        <span key={`${project._id}-t-${i}`} className="obs-tag">{tech}</span>
                                    ))}
                                </div>
                                </div>
                                </div>
                            </div>
                        ))}
                        {projects.length > INITIAL_PROJECTS && (
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={() => setShowAllProjects(v => !v)}
                                    className="px-6 py-2.5 rounded-xl border border-obsidian-border text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-obsidian-border transition-colors"
                                    aria-expanded={showAllProjects}
                                >
                                    {showAllProjects ? 'Show fewer projects' : `Show all ${projects.length} projects`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectSection;
