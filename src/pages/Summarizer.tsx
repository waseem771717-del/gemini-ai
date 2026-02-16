import { useState, FormEvent, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface Summary {
    id: string;
    youtube_url: string;
    video_id: string;
    video_title: string;
    thumbnail_url: string;
    summary_text: string;
    created_at: string;
}

export default function Summarizer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState<Summary | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [preview, setPreview] = useState<{ title: string; thumbnail: string; videoId: string } | null>(null);

    // Live URL preview
    useEffect(() => {
        const videoId = extractVideoId(url);
        if (videoId) {
            setPreview({
                videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                title: '',
            });
            // Fetch title
            fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
                .then((r) => r.json())
                .then((d) => {
                    if (d.title) setPreview((p) => (p ? { ...p, title: d.title } : p));
                })
                .catch(() => { });
        } else {
            setPreview(null);
        }
    }, [url]);

    function extractVideoId(input: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        ];
        for (const p of patterns) {
            const m = input.match(p);
            if (m) return m[1];
        }
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSummary(null);
        setCopied(false);

        if (!url.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        if (!extractVideoId(url)) {
            setError('Invalid YouTube URL. Please enter a valid youtube.com or youtu.be link.');
            return;
        }

        setLoading(true);

        try {
            const data = await apiFetch<{ summary: Summary; remaining: number }>('/ai/summarize', {
                method: 'POST',
                body: JSON.stringify({ youtubeUrl: url }),
            });
            setSummary(data.summary);
            setRemaining(data.remaining);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (summary) {
            await navigator.clipboard.writeText(summary.summary_text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!summary) return;
        const blob = new Blob([`# ${summary.video_title}\n\n${summary.summary_text}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${summary.video_title?.replace(/[^a-z0-9]/gi, '_') || 'summary'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-dark-100">
                    AI <span className="gradient-text">Study Assistant</span>
                </h1>
                <p className="text-dark-400 mt-2">
                    Paste a YouTube URL to generate comprehensive study notes powered by AI.
                </p>
                {remaining !== null && (
                    <p className="text-dark-500 text-sm mt-1">
                        {remaining} summaries remaining today
                    </p>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="glass-card p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl input-dark text-dark-100 placeholder-dark-500 text-sm"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                Generate Notes
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}
            </form>

            {/* Video Preview */}
            {preview && !summary && !loading && (
                <div className="glass-card p-5 flex items-center gap-4 animate-fade-in">
                    <img
                        src={preview.thumbnail}
                        alt="Video preview"
                        className="w-32 h-20 object-cover rounded-lg"
                    />
                    <div>
                        <p className="text-dark-200 font-medium text-sm">
                            {preview.title || 'Loading title...'}
                        </p>
                        <p className="text-dark-500 text-xs mt-1">
                            Video ID: {preview.videoId}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="glass-card p-8 space-y-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-20 bg-dark-700 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-dark-700 rounded w-3/4" />
                            <div className="h-3 bg-dark-700 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-3 pt-4">
                        <div className="h-3 bg-dark-700 rounded w-full" />
                        <div className="h-3 bg-dark-700 rounded w-5/6" />
                        <div className="h-3 bg-dark-700 rounded w-4/6" />
                        <div className="h-3 bg-dark-700 rounded w-full" />
                        <div className="h-3 bg-dark-700 rounded w-3/4" />
                    </div>
                    <p className="text-primary-400 text-sm text-center pt-4">
                        ✨ AI is analyzing the transcript and generating study notes...
                    </p>
                </div>
            )}

            {/* Summary result */}
            {summary && (
                <div className="animate-fade-in space-y-4">
                    {/* Video header */}
                    <div className="glass-card p-5 flex flex-col sm:flex-row items-start gap-4">
                        <img
                            src={summary.thumbnail_url}
                            alt={summary.video_title}
                            className="w-40 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-dark-100">{summary.video_title}</h2>
                            <a
                                href={summary.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 text-sm mt-1 inline-block"
                            >
                                Watch on YouTube →
                            </a>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 rounded-lg text-xs font-medium bg-dark-700/50 text-dark-300 hover:bg-dark-600 transition-colors flex items-center gap-1.5"
                            >
                                {copied ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 rounded-lg text-xs font-medium bg-dark-700/50 text-dark-300 hover:bg-dark-600 transition-colors flex items-center gap-1.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Markdown content */}
                    <div className="glass-card p-8">
                        <div
                            className="prose prose-invert prose-sm max-w-none
                prose-headings:text-dark-100 prose-headings:font-semibold
                prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-dark-700/50 prose-h2:pb-2
                prose-p:text-dark-300 prose-p:leading-relaxed
                prose-li:text-dark-300
                prose-strong:text-dark-100
                prose-table:text-dark-300
                prose-th:text-dark-200 prose-th:border-dark-600
                prose-td:border-dark-700
                prose-a:text-primary-400 prose-a:no-underline hover:prose-a:text-primary-300
                prose-blockquote:border-primary-500 prose-blockquote:text-dark-400"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(summary.summary_text) }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple markdown renderer (no external dependency)
function renderMarkdown(md: string): string {
    let html = md
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold & Italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr/>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

    // Wrap lists
    html = html.replace(/(<li>.*?<\/li>)(\s*<br\/>)*(<li>)/g, '$1$3');
    html = html.replace(/(?<!<\/ul>|<\/ol>)(<li>)/g, '<ul>$1');
    html = html.replace(/(<\/li>)(?![\s\S]*?<li>)/g, '$1</ul>');

    // Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(Boolean).map((c) => c.trim());
        if (cells.every((c) => /^[-:]+$/.test(c))) return '';
        const tag = 'td';
        return '<tr>' + cells.map((c) => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    });
    html = html.replace(/(<tr>.*?<\/tr>)/gs, '<table>$1</table>');

    return `<div>${html}</div>`;
}
