import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Post } from '../types';
import PostItem from './PostItem';
import { useTranslation } from 'react-i18next';

const PostList = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    const fetchPosts = () => {
        // Don't set loading to true if we already have posts (for background refresh)
        // But here we want to show loading on first load
        if (posts.length === 0) setLoading(true);

        api.get('/posts')
            .then(res => {
                setPosts(res.data.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPosts();

        const handlePostCreated = () => fetchPosts();
        window.addEventListener('post-created', handlePostCreated);
        return () => window.removeEventListener('post-created', handlePostCreated);
    }, []);

    const handleDelete = (id: number) => {
        setPosts(posts.filter(p => p.id !== id));
    };

    if (loading && posts.length === 0) return <div className="text-center text-gray-500 py-8">{t('common.loading')}</div>;

    if (posts.length === 0) return <div className="text-center text-gray-500 py-8">{t('timeline.no_posts')}</div>;

    return (
        <div className="space-y-4 pb-8">
            {posts.map(post => (
                <PostItem key={post.id} post={post} onDelete={handleDelete} />
            ))}
        </div>
    );
};

export default PostList;
