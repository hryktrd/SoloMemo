import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { logout, user } = useAuth();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center sticky top-0 z-10">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    SoloMemo
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        to="/profile"
                        className="font-medium hover:text-blue-500 transition-colors cursor-pointer"
                    >
                        {user?.name}
                    </Link>
                    <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                        {t('common.logout')}
                    </button>
                </div>
            </header>
            <main className="container mx-auto p-4 max-w-2xl">
                {children}
            </main>
        </div>
    );
};

export default Layout;
