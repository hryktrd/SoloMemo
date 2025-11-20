import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import OgpCard from './OgpCard';
import { OgpData } from '../types';
import { useTranslation } from 'react-i18next';

const PostForm = ({ onPostCreated }: { onPostCreated?: () => void }) => {
    const [content, setContent] = useState('');
    const [ogpData, setOgpData] = useState<Partial<OgpData> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = content.match(urlRegex);
        if (match && match[0]) {
            const url = match[0];
            // Only fetch if different URL or no data
            if (ogpData?.url !== url) {
                const timer = setTimeout(() => {
                    api.post('/ogp/preview', { url })
                        .then(res => setOgpData(res.data))
                        .catch(() => {
                            // If failed, maybe just show the URL or nothing
                            setOgpData({ url });
                        });
                }, 500); // Debounce
                return () => clearTimeout(timer);
            }
        } else {
            setOgpData(null);
        }
    }, [content]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post('/posts', { content });
            setContent('');
            setOgpData(null);
            if (onPostCreated) onPostCreated();
            // Dispatch a custom event or use context to refresh list?
            // For now, we assume parent passes a callback or we use a global store.
            // Actually, PostList is a sibling. We need a way to trigger refresh.
            // We can use a simple event bus or lift state up.
            window.dispatchEvent(new Event('post-created'));
        } catch (error) {
            console.error('Failed to post', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-2 border rounded resize-none dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder={t('timeline.placeholder')}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={280}
                />
                {ogpData && <OgpCard data={ogpData} />}
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                    >
                        {isSubmitting ? t('common.loading') : t('common.post')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;
