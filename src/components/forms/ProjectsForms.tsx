import { useEffect, useState } from 'react';
import { Project } from '../../services/modal';
import { usePortfolio } from '../../context/PortfolioContext';
import { FolderOpen } from 'lucide-react';
import MonthYearPicker from './MonthYearPicker';
import { addProject, deleteProject, updateProject } from '../../services/api';

// Helper function to format date to YYYY-MM-DD string
const formatDateString = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string') {
        // If it's already a string, try to parse and format it
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        // If it's already in YYYY-MM-DD format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
    }
    // If it's a number (epoch), convert it
    if (typeof date === 'number') {
        return new Date(date).toISOString().split('T')[0];
    }
    return '';
};

interface ProjectAddEditFormProps {
    isAdd: boolean;
    selectedProject?: Project | null;
    setShowForm: (show: boolean) => void;
}



const ProjectAddEditForm: React.FC<ProjectAddEditFormProps> = ({ isAdd, selectedProject, setShowForm }) => {
    const [project, setProject] = useState({
        title: selectedProject?.title ?? '',
        description: selectedProject?.description ?? '',
        technologies: selectedProject?.technologies?.join(', ') ?? '',
        start_date: '',
        end_date: '',
        live_url: selectedProject?.live_url ?? '',
        code_url: selectedProject?.code_url ?? '',
        image_url: selectedProject?.image_url ?? '',
    });

    // Initialize dates from selectedProject (handle both date strings and epoch timestamps for backward compatibility)
    useEffect(() => {
        if (selectedProject?.start_date) {
            const startDate = formatDateString(selectedProject.start_date);
            setProject(prev => ({ ...prev, start_date: startDate }));
        }
        if (selectedProject?.end_date) {
            const endDate = formatDateString(selectedProject.end_date);
            setProject(prev => ({ ...prev, end_date: endDate }));
        }
    }, [selectedProject]);

    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [error, setError] = useState('');
    const { setIsProjectLoading } = usePortfolio();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const setIsSubmitActiveFunction = () => {
            const startDateFormatted = selectedProject?.start_date ? formatDateString(selectedProject.start_date) : '';
            const endDateFormatted = selectedProject?.end_date ? formatDateString(selectedProject.end_date) : '';
            
            if (
                (isAdd && project.title && project.description && project.technologies && project.start_date) ||
                (!isAdd && (project.title !== selectedProject?.title || 
                           project.description !== selectedProject?.description || 
                           project.technologies !== (selectedProject?.technologies?.join(', ') ?? '') ||
                           project.start_date !== startDateFormatted || 
                           project.end_date !== endDateFormatted || 
                           project.live_url !== (selectedProject?.live_url ?? '') ||
                           project.code_url !== (selectedProject?.code_url ?? '') ||
                           project.image_url !== (selectedProject?.image_url ?? '')))
            ) {
                setIsSubmitActive(true);
            } else {
                setIsSubmitActive(false);
            }
        }
        setIsSubmitActiveFunction();
    }, [project.title, project.description, project.technologies, project.start_date, project.end_date, project.live_url, project.code_url, project.image_url, selectedProject, isAdd]);


    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            
            const projectData = {
                ...project,
                technologies: project.technologies.toString().split(',').map((t: string) => t.trim()).filter(Boolean),
                start_date: project.start_date || undefined,
                end_date: project.end_date || undefined,
            };

            const response = isAdd ? await addProject(projectData) : await updateProject(selectedProject?._id ?? '', projectData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to add project');
            }

            setShowForm(false);
            setIsProjectLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }

    const inputCls = "w-full px-4 py-2.5 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
    const labelCls = "block text-sm font-medium text-ink-secondary mb-1.5";
    const sectionCls = "bg-obsidian-bg border border-obsidian-border rounded-xl p-4 space-y-4";

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl">
                    <FolderOpen className="w-5 h-5 text-accent-light" />
                </div>
                <h2 className="font-grotesk text-xl font-bold text-ink-primary">{isAdd ? 'Add Project' : 'Edit Project'}</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className={sectionCls}>
                    <div>
                        <label className={labelCls}>Project Title <span className="text-red-400">*</span></label>
                        <input type="text" name="title" placeholder="e.g., E-commerce Platform, Task Manager App" className={inputCls} value={project.title} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                        <textarea name="description" placeholder="Describe your project - features, technologies used, challenges solved..." className={`${inputCls} resize-y min-h-[100px]`} value={project.description} onChange={handleChange} required rows={4} />
                    </div>
                    <div>
                        <label className={labelCls}>Technologies <span className="text-red-400">*</span></label>
                        <input type="text" name="technologies" placeholder="e.g., React, Node.js, MongoDB, AWS (comma separated)" className={inputCls} value={project.technologies} onChange={handleChange} required />
                        <p className="text-xs text-ink-muted mt-1">Separate multiple technologies with commas</p>
                    </div>
                </div>

                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                            <MonthYearPicker label="Start Date" value={project.start_date ?? ''} onChange={(value: string) => setProject(prev => ({ ...prev, start_date: value }))} placeholder="Select start date" startDate={project.end_date ?? ''} />
                        </div>
                        <div>
                            <label className={labelCls}>End Date <span className="text-ink-muted text-xs">(optional)</span></label>
                            <MonthYearPicker label="End Date (Optional)" value={project.end_date ?? ''} onChange={(value: string) => setProject(prev => ({ ...prev, end_date: value }))} placeholder="Select end date" startDate={project.start_date ?? ''} disabled={!project.start_date} />
                        </div>
                    </div>
                </div>

                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Live URL</label>
                            <input type="url" name="live_url" placeholder="https://your-project.com" className={inputCls} value={project.live_url} onChange={handleChange} />
                        </div>
                        <div>
                            <label className={labelCls}>Code URL</label>
                            <input type="url" name="code_url" placeholder="https://github.com/username/repo" className={inputCls} value={project.code_url} onChange={handleChange} />
                        </div>
                        <div>
                            <label className={labelCls}>Image URL</label>
                            <input type="url" name="image_url" placeholder="https://example.com/image.jpg" className={inputCls} value={project.image_url} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={!isSubmitActive || loading} className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isAdd ? 'Adding...' : 'Updating...'}</> : isAdd ? 'Add Project' : 'Update Project'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 py-2.5 rounded-lg text-sm">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export { ProjectAddEditForm };