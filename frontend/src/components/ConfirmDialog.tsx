import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    variant = 'warning'
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const confirmButtonClass = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-yellow-600 hover:bg-yellow-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText || t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText || t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
