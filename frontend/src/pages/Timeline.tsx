import React from 'react';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';

const Timeline = () => {
    return (
        <div className="space-y-6">
            <PostForm />
            <PostList />
        </div>
    );
};

export default Timeline;
