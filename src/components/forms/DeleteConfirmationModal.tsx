import { useState } from "react";
import { deleteEducation, deleteExperience, deleteMessage, deleteProject, deleteSkill, deleteAward, deleteCertification, deleteConversation } from "../../services/api";
import { usePortfolio } from "../../context/PortfolioContext";
import { Education, Skill, Experience, Message, Project, Award, Certification } from "../../services/modal";
import { Trash2, X } from "lucide-react";

interface DeleteModalProps {
    setShowDeleteModal: (show: boolean) => void;
    setSelectedData: (data: any | null) => void;
    data: Education | Experience | Skill | Project | Message | Message[] | Award | Certification | null;
    dataType: 'education' | 'experience' | 'skill' | 'project' | 'message' | 'conversation' | 'award' | 'certification';
}

const deleteRespectiveData = async (dataType: string, data: any) => {
    switch (dataType) {
        case 'education': return deleteEducation(data?._id ?? '');
        case 'experience': return deleteExperience(data?._id ?? '');
        case 'skill': return deleteSkill(data?._id ?? '');
        case 'project': return deleteProject(data?._id ?? '');
        case 'message': return deleteMessage(data?._id ?? '');
        case 'award': return deleteAward(data?._id ?? '');
        case 'certification': return deleteCertification(data?._id ?? '');
        case 'conversation':
            if (Array.isArray(data) && data.length > 0 && data[0]?.conversationId) {
                return deleteConversation(data[0].conversationId);
            }
            throw new Error('Invalid conversation data');
    }
};

const getRespectiveTitle = (dataType: string) => {
    switch (dataType) {
        case 'education': return 'Education';
        case 'experience': return 'Experience';
        case 'skill': return 'Skill';
        case 'project': return 'Project';
        case 'message': return 'Message';
        case 'conversation': return 'Conversation';
        default: return 'Data';
    }
};

const getSetDataLoadingFunction = (dataType: string, portfolioHooks: any) => {
    const { setIsEducationLoading, setIsExperienceLoading, setIsSkillLoading, setIsProjectLoading, setIsMessageLoading, setIsAwardLoading, setIsCertificationLoading, setIsMessageCountLoading } = portfolioHooks;
    switch (dataType) {
        case 'education': return [setIsEducationLoading];
        case 'experience': return [setIsExperienceLoading];
        case 'skill': return [setIsSkillLoading];
        case 'project': return [setIsProjectLoading];
        case 'message': return [setIsMessageLoading, setIsMessageCountLoading];
        case 'award': return [setIsAwardLoading];
        case 'certification': return [setIsCertificationLoading];
        case 'conversation': return [setIsMessageLoading, setIsMessageCountLoading];
    }
};

const getRespectiveMessage = (dataType: DeleteModalProps['dataType'], data: any) => {
    switch (dataType) {
        case 'skill': return <>Are you sure you want to delete skill "<span className="font-semibold text-ink-primary">{data?.name}</span>"?</>;
        case 'project': return <>Are you sure you want to delete project "<span className="font-semibold text-ink-primary">{data?.title}</span>"?</>;
        case 'experience': return <>Are you sure you want to delete experience at "<span className="font-semibold text-ink-primary">{data?.company}</span>"?</>;
        case 'education': return <>Are you sure you want to delete education "<span className="font-semibold text-ink-primary">{data?.degree}</span>"?</>;
        case 'award': return <>Are you sure you want to delete award "<span className="font-semibold text-ink-primary">{data?.name}</span>"?</>;
        case 'certification': return <>Are you sure you want to delete certification "<span className="font-semibold text-ink-primary">{data?.name}</span>"?</>;
        case 'message': return <>Are you sure you want to delete message "<span className="font-semibold text-ink-primary">{data?.messageSubject}</span>"?</>;
        case 'conversation':
            const label = data?.[0]?.senderName || data?.[0]?.senderEmail || 'this contact';
            return <>Are you sure you want to delete the conversation with <span className="font-semibold text-ink-primary">{label}</span>?</>;
    }
};

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ setSelectedData, setShowDeleteModal, data, dataType }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const portfolioHooks = usePortfolio();

    const deleteData = async () => {
        try {
            setLoading(true);
            const deletedData = await deleteRespectiveData(dataType, data);
            if (dataType !== 'conversation') {
                const dataWithStatus = deletedData as any;
                if (dataWithStatus?.status_code === 400) throw new Error(dataWithStatus.message ?? 'Failed to delete');
            }
            setShowDeleteModal(false);
            getSetDataLoadingFunction(dataType, portfolioHooks)?.forEach((fn) => fn(true));
            setSelectedData(null);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-grotesk text-lg font-bold text-ink-primary">Delete {getRespectiveTitle(dataType)}</h3>
            </div>

            <p className="text-ink-secondary text-sm mb-2">{getRespectiveMessage(dataType, data)}</p>
            <p className="text-ink-muted text-xs mb-6">This action cannot be undone.</p>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-ghost flex-1 py-2 rounded-lg text-sm"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    onClick={deleteData}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                    ) : `Delete ${getRespectiveTitle(dataType)}`}
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
