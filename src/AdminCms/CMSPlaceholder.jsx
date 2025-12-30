import React from 'react';
import { Empty } from 'antd';
import { useParams } from 'react-router-dom';

export default function CMSPlaceholder() {
    const { section } = useParams();
    const title = section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Module';

    return (
        <div className="bg-white rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#e5e7eb] min-h-[400px] flex items-center justify-center">
            <Empty
                description={
                    <span className="text-gray-500 font-['Manrope'] text-base">
                        {title} Module Coming Soon
                    </span>
                }
            />
        </div>
    );
}
