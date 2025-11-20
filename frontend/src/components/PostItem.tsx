import { useState, useEffect } from 'react';
import { Post, OgpData } from '../types';
import api from '../lib/axios';
import OgpCard from './OgpCard';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import ConfirmDialog from './ConfirmDialog';

const PostItem = ({ post, onDelete }: { post: Post; onDelete: (id: number) => void }) => {
    const [ogpData, setOgpData] = useState<Partial<OgpData> | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { i18n } = useTranslation();

    useEffect(() => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = post.content.match(urlRegex);
        if (match && match[0]) {
            api.post('/ogp/preview', { url: match[0] })
                .then(res => setOgpData(res.data))
                .catch(() => { });
        }
    }, [post.content]);

    const handleDelete = () => {
        api.delete(`/posts/${post.id}`).then(() => {
            onDelete(post.id);
            setShowDeleteDialog(false);
        }).catch(() => {
            setShowDeleteDialog(false);
        });
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="flex justify-between items-start">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: i18n.language === 'ja' ? ja : enUS
                        })}
                    </div>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">{post.content}</p>
                {ogpData && <OgpCard data={ogpData} />}
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="投稿を削除"
                message="この投稿を削除してもよろしいですか？この操作は取り消せません。"
                confirmText="削除する"
                cancelText="キャンセル"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                variant="danger"
            />
        </>
    );
};

export default PostItem;
