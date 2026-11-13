import React, { useEffect, useState } from 'react';
import { Certification } from '../../services/modal';
import { converEpochToDate, convertDateToEpoch } from '../../utils/utility';
import { usePortfolio } from '../../context/PortfolioContext';
import { addCertification, updateCertification } from '../../services/api';
import { Award } from 'lucide-react';
import MonthYearPicker from './MonthYearPicker';

interface CertificateFormProps {
    isAdd: boolean;
    selectedCertificate?: Certification | null;
    setShowForm: (show: boolean) => void;
}

const CertificateAddEditForm: React.FC<CertificateFormProps> = ({ isAdd, selectedCertificate, setShowForm }) => {
    const [certificate, setCertificate] = useState({
        name: selectedCertificate?.name ?? '',
        issuer: selectedCertificate?.issuer ?? '',
        issue_date: selectedCertificate?.issue_date ?? '',
        description: selectedCertificate?.description ?? '',
        credential_id: selectedCertificate?.credential_id ?? '',
        credential_url: selectedCertificate?.credential_url ?? '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const { setIsCertificationLoading } = usePortfolio();

    useEffect(() => {
        const init = async () => {
            if (selectedCertificate?.issue_date) {
                const d = await converEpochToDate(selectedCertificate.issue_date);
                setCertificate(prev => ({ ...prev, issue_date: d ?? '' }));
            }
        };
        init();
    }, [selectedCertificate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCertificate(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const check = async () => {
            if (
                (isAdd && certificate.name && certificate.issuer && certificate.issue_date) ||
                (!isAdd && (certificate.name !== selectedCertificate?.name || certificate.issuer !== selectedCertificate?.issuer || certificate.issue_date !== await converEpochToDate(selectedCertificate?.issue_date ?? '') || certificate.description !== (selectedCertificate?.description ?? '') || certificate.credential_id !== (selectedCertificate?.credential_id ?? '') || certificate.credential_url !== (selectedCertificate?.credential_url ?? '')))
            ) setIsSubmitActive(true);
            else setIsSubmitActive(false);
        };
        check();
    }, [certificate.name, certificate.issuer, certificate.issue_date, certificate.description, certificate.credential_id, certificate.credential_url]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            const epoch = await convertDateToEpoch(certificate.issue_date ?? '');
            const response = isAdd
                ? await addCertification({ ...certificate, issue_date: epoch })
                : await updateCertification(selectedCertificate?._id ?? '', { ...certificate, issue_date: epoch });
            if (response.status_code === 400) throw new Error(response.message ?? 'Failed to save certification');
            setShowForm(false);
            setIsCertificationLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-lg border border-obsidian-border bg-obsidian-surface text-ink-primary placeholder-ink-muted focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30 transition-colors text-sm";
    const labelCls = "block text-sm font-medium text-ink-secondary mb-1.5";
    const sectionCls = "bg-obsidian-bg border border-obsidian-border rounded-xl p-4 space-y-4";

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-xl">
                    <Award className="w-5 h-5 text-accent-indigo" />
                </div>
                <h2 className="font-grotesk text-xl font-bold text-ink-primary">{isAdd ? 'Add Certification' : 'Edit Certification'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Certification Name <span className="text-red-400">*</span></label>
                            <input type="text" name="name" value={certificate.name} onChange={handleChange} placeholder="e.g., AWS Certified Solutions Architect" className={inputCls} required />
                        </div>
                        <div>
                            <label className={labelCls}>Issuing Organization <span className="text-red-400">*</span></label>
                            <input type="text" name="issuer" value={certificate.issuer} onChange={handleChange} placeholder="e.g., Amazon Web Services" className={inputCls} required />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Description <span className="text-ink-muted text-xs">(optional)</span></label>
                        <textarea
                            name="description"
                            value={certificate.description}
                            onChange={handleChange}
                            placeholder="Describe the certification and skills validated..."
                            className={`${inputCls} resize-y min-h-[80px]`}
                            rows={3}
                        />
                    </div>
                </div>

                <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Issue Date <span className="text-red-400">*</span></label>
                            <MonthYearPicker label="" value={certificate.issue_date} onChange={(d) => setCertificate(p => ({ ...p, issue_date: d }))} placeholder="Select issue date" />
                        </div>
                        <div>
                            <label className={labelCls}>Credential ID <span className="text-ink-muted text-xs">(optional)</span></label>
                            <input type="text" name="credential_id" value={certificate.credential_id} onChange={handleChange} placeholder="e.g., 12345678" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Credential URL <span className="text-ink-muted text-xs">(optional)</span></label>
                        <input type="url" name="credential_url" value={certificate.credential_url} onChange={handleChange} placeholder="https://credly.com/badges/..." className={inputCls} />
                    </div>
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-glow flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2" disabled={!isSubmitActive || loading}>
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isAdd ? 'Adding...' : 'Updating...'}</> : isAdd ? 'Add Certification' : 'Update Certification'}
                    </button>
                    <button type="button" className="btn-ghost flex-1 py-2.5 rounded-lg text-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export { CertificateAddEditForm };
