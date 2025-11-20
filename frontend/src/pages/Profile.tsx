import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../components/ConfirmDialog';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.put('/user/profile', { name, email });
            setSuccess('プロフィールを更新しました');
        } catch (err: any) {
            setError(err.response?.data?.message || 'プロフィール更新に失敗しました');
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.put('/user/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setSuccess('パスワードを変更しました');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'パスワード変更に失敗しました');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/user/account', {
                data: { password: deletePassword }
            });
            logout();
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'アカウント削除に失敗しました');
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                マイページ
            </h1>

            {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-3 rounded">
                    {success}
                </div>
            )}

            {/* Profile Update */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">プロフィール設定</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                        プロフィールを更新
                    </button>
                </form>
            </div>

            {/* Password Update */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">パスワード変更</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">現在のパスワード</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">新しいパスワード</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">パスワード確認</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                            required
                            minLength={8}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                        パスワードを変更
                    </button>
                </form>
            </div>

            {/* Account Deletion */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-red-200 dark:border-red-900">
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">アカウント削除</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    アカウントを削除すると、すべての投稿データが永久に削除されます。この操作は取り消せません。
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">パスワードを入力して確認</label>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-gray-100"
                            placeholder="パスワードを入力"
                        />
                    </div>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={!deletePassword}
                        className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        アカウントを削除
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="アカウント削除の確認"
                message="本当にアカウントを削除しますか？すべての投稿データが永久に削除され、この操作は取り消せません。"
                confirmText="削除する"
                cancelText="キャンセル"
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteDialog(false)}
                variant="danger"
            />
        </div>
    );
};

export default Profile;
