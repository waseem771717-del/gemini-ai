import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface DocInfo {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    status: string;
    created_at: string;
    chunk_count: number;
    user_name?: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function BackIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    );
}

function SendIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

export default function DocumentChat() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [doc, setDoc] = useState<DocInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch<{ document: DocInfo }>(`/documents/${id}`);
                setDoc(data.document);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || asking) return;

        const userQ = question.trim();
        setQuestion('');
        setError('');
        setMessages((prev) => [...prev, { role: 'user', content: userQ, timestamp: new Date() }]);
        setAsking(true);

        try {
            const data = await apiFetch<{ answer: string }>(`/documents/${id}/ask`, {
                method: 'POST',
                body: JSON.stringify({ question: userQ }),
            });
            setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, timestamp: new Date() }]);
        } catch (err: any) {
            setError(err.message);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() },
            ]);
        } finally {
            setAsking(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-dark-400 text-sm">Loading document...</p>
                </div>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="p-8">
                <div className="glass-card p-12 text-center">
                    <p className="text-red-400 mb-4">{error || 'Document not found'}</p>
                    <button onClick={() => navigate('/documents')} className="btn-gradient px-4 py-2 rounded-xl text-white text-sm">
                        Back to Documents
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 animate-fade-in flex flex-col h-[calc(100vh-2rem)]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <button
                    onClick={() => navigate('/documents')}
                    className="p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-colors"
                >
                    <BackIcon />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-dark-200 truncate">{doc.filename}</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${doc.file_type === 'pdf' ? 'bg-red-500/20 text-red-400' :
                                doc.file_type === 'docx' ? 'bg-blue-600/20 text-blue-400' :
                                    ['jpg', 'jpeg', 'png', 'webp'].includes(doc.file_type) ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-gray-500/20 text-gray-400'
                            }`}>
                            {doc.file_type.length > 4 ? doc.file_type.slice(0, 3) : doc.file_type}
                        </span>
                        <span className="text-dark-500 text-xs">{formatFileSize(doc.file_size)}</span>
                        <span className="text-dark-600 text-xs">•</span>
                        <span className="text-dark-500 text-xs">{doc.chunk_count} chunks</span>
                        <span className="text-dark-600 text-xs">•</span>
                        <span className="text-dark-500 text-xs">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass-card flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <h3 className="text-dark-200 font-semibold mb-1">Ask a question</h3>
                            <p className="text-dark-500 text-sm max-w-sm">
                                Ask anything about <span className="text-dark-300">{doc.filename}</span> and the AI will find the answer from the document content.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary-600/20 text-primary-100 rounded-br-md'
                                        : 'bg-dark-700/60 text-dark-200 rounded-bl-md border border-dark-600/30'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-400/50' : 'text-dark-500'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {asking && (
                        <div className="flex justify-start">
                            <div className="bg-dark-700/60 border border-dark-600/30 p-4 rounded-2xl rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-dark-700/50">
                    {error && (
                        <p className="text-red-400 text-xs mb-2">{error}</p>
                    )}
                    <form onSubmit={handleAsk} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about this document..."
                            maxLength={500}
                            disabled={asking}
                            className="flex-1 input-dark px-4 py-3 rounded-xl text-sm text-dark-200 placeholder:text-dark-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!question.trim() || asking}
                            className="btn-gradient p-3 rounded-xl text-white disabled:opacity-40 disabled:transform-none disabled:shadow-none transition-all"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
