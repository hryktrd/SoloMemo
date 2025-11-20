import React from 'react';
import { OgpData } from '../types';

const OgpCard = ({ data }: { data: Partial<OgpData> }) => {
    if (!data.url) return null;
    return (
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="block mt-2 border rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
            {data.image && (
                <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={data.image} alt={data.title || 'OGP Image'} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="p-3">
                <h3 className="font-bold text-sm truncate text-gray-900 dark:text-gray-100">{data.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{data.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{data.site_name || new URL(data.url).hostname}</p>
            </div>
        </a>
    );
};

export default OgpCard;
