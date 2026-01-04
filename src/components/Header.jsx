import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../Language/LanguageContext'; // Assuming this exists as used in other files
// If LanguageContext path is different, I might need to adjust. 
// DashboardLayout used "../../Language/LanguageContext". 
// Here in components/Header, it would be "../Language/LanguageContext".

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { language, toggleLanguage } = useLanguage();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: language === 'vi' ? 'Trang chủ' : 'Home', path: '/home' },
        { name: language === 'vi' ? 'Giới thiệu' : 'About', path: '/about' },
        { name: language === 'vi' ? 'Danh sách' : 'Listings', path: '/listing' },
        { name: language === 'vi' ? 'Tin tức' : 'Blogs', path: '/blogs' },
        { name: language === 'vi' ? 'Liên hệ' : 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-white shadow-sm font-['Manrope'] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/home" className="flex-shrink-0 flex items-center">
                            {/* Logo Placeholder */}
                            <img
                                className="h-12 w-auto"
                                src="/images/login/logo.png" // Assuming this path from HomePage loading state
                                alt="Logo"
                                onError={(e) => { e.target.style.display = 'none'; }} // Fallback if image missing
                            />
                            <span className="ml-2 text-2xl font-bold text-[#41398B] hidden md:block">
                                Property
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200
                                    ${isActive(item.path)
                                        ? 'text-[#41398B] bg-purple-50'
                                        : 'text-gray-600 hover:text-[#41398B] hover:bg-gray-50'
                                    }
                                `}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Language Switcher */}
                        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
                            <button
                                onClick={() => toggleLanguage('en')}
                                aria-pressed={language === 'en'}
                                title="English"
                                className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${language === 'en'
                                    ? 'bg-[#9994ce47] shadow scale-[1.06]'
                                    : 'hover:bg-white/70'
                                    }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                                    <defs>
                                        <clipPath id="gb_clip">
                                            <circle cx="12" cy="12" r="12" />
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#gb_clip)">
                                        <rect width="24" height="24" fill="#012169" />
                                        <line x1="0" y1="0" x2="24" y2="24" stroke="#FFF" strokeWidth="6" />
                                        <line x1="24" y1="0" x2="0" y2="24" stroke="#FFF" strokeWidth="6" />
                                        <line x1="0" y1="0" x2="24" y2="24" stroke="#C8102E" strokeWidth="3" />
                                        <line x1="24" y1="0" x2="0" y2="24" stroke="#C8102E" strokeWidth="3" />
                                        <line x1="12" y1="0" x2="12" y2="24" stroke="#FFF" strokeWidth="6" />
                                        <line x1="0" y1="12" x2="24" y2="12" stroke="#FFF" strokeWidth="6" />
                                        <line x1="12" y1="0" x2="12" y2="24" stroke="#C8102E" strokeWidth="4" />
                                        <line x1="0" y1="12" x2="24" y2="12" stroke="#C8102E" strokeWidth="4" />
                                    </g>
                                </svg>
                            </button>
                            <button
                                onClick={() => toggleLanguage('vi')}
                                aria-pressed={language === 'vi'}
                                title="Tiếng Việt"
                                className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${language === 'vi'
                                    ? 'bg-[#9994ce47] shadow scale-[1.06]'
                                    : 'hover:bg-white/70'
                                    }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                                    <defs>
                                        <clipPath id="vn_clip">
                                            <circle cx="12" cy="12" r="12" />
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#vn_clip)">
                                        <rect width="24" height="24" fill="#DA251D" />
                                        <polygon
                                            fill="#FFCE00"
                                            points="12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927 16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927 4.867,9.682 10.237,9.573"
                                        />
                                    </g>
                                </svg>
                            </button>
                        </div>

                        
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#41398B] hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    block px-3 py-2 rounded-md text-base font-medium
                                    ${isActive(item.path)
                                        ? 'text-[#41398B] bg-purple-50'
                                        : 'text-gray-600 hover:text-[#41398B] hover:bg-gray-50'
                                    }
                                `}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Mobile Language Switcher */}
                        <div className="inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 p-1 my-4">
                            <button
                                onClick={() => { toggleLanguage('en'); setIsOpen(false); }}
                                aria-pressed={language === 'en'}
                                title="English"
                                className={`h-12 w-12 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${language === 'en'
                                        ? 'bg-[#9994ce47] shadow scale-[1.06]'
                                        : 'hover:bg-white/70'
                                    }`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                                    <defs>
                                        <clipPath id="gb_clip_mobile">
                                            <circle cx="12" cy="12" r="12" />
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#gb_clip_mobile)">
                                        <rect width="24" height="24" fill="#012169" />
                                        <line x1="0" y1="0" x2="24" y2="24" stroke="#FFF" strokeWidth="6" />
                                        <line x1="24" y1="0" x2="0" y2="24" stroke="#FFF" strokeWidth="6" />
                                        <line x1="0" y1="0" x2="24" y2="24" stroke="#C8102E" strokeWidth="3" />
                                        <line x1="24" y1="0" x2="0" y2="24" stroke="#C8102E" strokeWidth="3" />
                                        <line x1="12" y1="0" x2="12" y2="24" stroke="#FFF" strokeWidth="6" />
                                        <line x1="0" y1="12" x2="24" y2="12" stroke="#FFF" strokeWidth="6" />
                                        <line x1="12" y1="0" x2="12" y2="24" stroke="#C8102E" strokeWidth="4" />
                                        <line x1="0" y1="12" x2="24" y2="12" stroke="#C8102E" strokeWidth="4" />
                                    </g>
                                </svg>
                            </button>
                            <button
                                onClick={() => { toggleLanguage('vi'); setIsOpen(false); }}
                                aria-pressed={language === 'vi'}
                                title="Tiếng Việt"
                                className={`h-12 w-12 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${language === 'vi'
                                        ? 'bg-[#9994ce47] shadow scale-[1.06]'
                                        : 'hover:bg-white/70'
                                    }`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                                    <defs>
                                        <clipPath id="vn_clip_mobile">
                                            <circle cx="12" cy="12" r="12" />
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#vn_clip_mobile)">
                                        <rect width="24" height="24" fill="#DA251D" />
                                        <polygon
                                            fill="#FFCE00"
                                            points="12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927 16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927 4.867,9.682 10.237,9.573"
                                        />
                                    </g>
                                </svg>
                            </button>
                        </div>

                        <div className="pt-4 pb-2">
                            <Link to="/dashboard/lease" onClick={() => setIsOpen(false)}>
                                <button className="w-full bg-[#41398B] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#352e7a]">
                                    {language === 'vi' ? 'Đăng nhập' : 'Login / Register'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
