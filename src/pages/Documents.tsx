import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Document {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    status: 'processing' | 'ready' | 'error';
    created_at: string;
    user_name?: string;
    user_email?: string;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function DocumentIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );
}

function UploadIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

export default function Documents() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user?.role === 'admin';
    const [showAll, setShowAll] = useState(false);

    const fetchDocuments = useCallback(async () => {
        try {
            const url = showAll && isAdmin ? '/documents?all=true' : '/documents';
            const data = await apiFetch<{ documents: Document[] }>(url);
            setDocuments(data.documents);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [showAll, isAdmin]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Poll for processing status every 5 seconds
    useEffect(() => {
        const hasProcessing = documents.some((d) => d.status === 'processing');
        if (!hasProcessing) return;

        const interval = setInterval(() => {
            fetchDocuments();
        }, 5000);
        return () => clearInterval(interval);
    }, [documents, fetchDocuments]);

    const handleUpload = async (file: File) => {
        setError('');
        setSuccess('');

        // Client-side validation
        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only PDF and TXT files are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be under 10MB.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            setSuccess(`"${file.name}" uploaded successfully! Processing...`);
            fetchDocuments();
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDelete = async (docId: string, filename: string) => {
        if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
        try {
            await apiFetch(`/documents/${docId}`, { method: 'DELETE' });
            setSuccess(`"${filename}" deleted.`);
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            processing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            error: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        const labels: Record<string, string> = {
            ready: '● Ready',
            processing: '◌ Processing',
            error: '✕ Error',
        };
        return (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || ''}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="p-6 lg:p-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Document Q&A</h1>
                    <p className="text-dark-400 text-sm mt-1">
                        Upload documents and ask questions about their content
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={`text-sm px-4 py-2 rounded-xl border transition-all ${showAll
                                ? 'bg-primary-600/20 text-primary-400 border-primary-500/30'
                                : 'text-dark-400 border-dark-700 hover:text-dark-200'
                            }`}
                    >
                        {showAll ? 'All Documents' : 'My Documents'}
                    </button>
                )}
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 ml-4">✕</button>
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex justify-between items-center">
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-300 ml-4">✕</button>
                </div>
            )}

            {/* Upload Area */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`glass-card p-8 mb-8 text-center cursor-pointer transition-all duration-300 ${dragOver
                        ? 'border-primary-400 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                        : 'hover:border-dark-500 hover:bg-dark-700/30'
                    } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                        <>
                            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-dark-300 text-sm">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <div className="text-primary-400">
                                <UploadIcon />
                            </div>
                            <div>
                                <p className="text-dark-200 font-medium">
                                    Drop a file here or <span className="text-primary-400">browse</span>
                                </p>
                                <p className="text-dark-500 text-xs mt-1">PDF or TXT • Max 10MB</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Document List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="glass-card p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-dark-400 text-sm">Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="text-dark-600 mb-3 flex justify-center">
                            <DocumentIcon />
                        </div>
                        <p className="text-dark-400 text-sm">No documents yet. Upload one to get started!</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="glass-card p-4 flex items-center gap-4 hover:bg-dark-700/40 transition-all group"
                        >
                            {/* File icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold uppercase ${doc.file_type === 'pdf'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {doc.file_type}
                            </div>

                            {/* Info */}
                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => doc.status === 'ready' && navigate(`/documents/${doc.id}`)}
                            >
                                <p className="text-dark-200 font-medium truncate text-sm">{doc.filename}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-dark-500 text-xs">{formatFileSize(doc.file_size)}</span>
                                    <span className="text-dark-600 text-xs">•</span>
                                    <span className="text-dark-500 text-xs">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </span>
                                    {doc.user_name && (
                                        <>
                                            <span className="text-dark-600 text-xs">•</span>
                                            <span className="text-dark-500 text-xs">{doc.user_name}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Status + Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                                {statusBadge(doc.status)}
                                {doc.status === 'ready' && (
                                    <button
                                        onClick={() => navigate(`/documents/${doc.id}`)}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 transition-colors"
                                    >
                                        Ask Q&A
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(doc.id, doc.filename)}
                                    className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
