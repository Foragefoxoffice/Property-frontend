import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../Language/LanguageContext';
import { translations } from '../Language/translations';

export default function ComingSoon() {
    const { language, toggleLanguage: changeLanguage } = useLanguage();
    const t = translations[language];


    const toggleLanguage = () => {
        changeLanguage(language === 'en' ? 'vi' : 'en');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050510] p-6 relative overflow-hidden font-['Manrope'] text-white">
            {/* Perspective Grid Floor */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[50vh] opacity-20"
                    style={{
                        background: `linear-gradient(to bottom, transparent, #41398B 80%)`,
                        maskImage: 'linear-gradient(to bottom, transparent, black)',
                        perspective: '1000px',
                        transform: 'rotateX(60deg) translateY(20%)',
                        backgroundSize: '40px 40px',
                        backgroundImage: `linear-gradient(to right, #41398B 1px, transparent 1px), linear-gradient(to bottom, #41398B 1px, transparent 1px)`
                    }}
                />
            </div>

            {/* Glowing Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-[#41398B]/10 rounded-full blur-[180px] pointer-events-none" />

            {/* Top Navigation */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-5 md:top-0 left-0 right-0 p-8 flex justify-between items-center z-50 fixed w-full"
            >
                <div className="flex items-center gap-3">
                    <img src="/images/login/logo.png" alt="Logo" className="h-7 md:h-11 brightness-0 invert opacity-80" />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[11px] font-black tracking-widest"
                    >
                        {language === 'en' ? 'VN' : 'EN'}
                    </button>
                </div>
            </motion.div>

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-5xl flex flex-col items-center justify-center text-center relative z-10"
            >
                {/* Status Bar */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="flex items-center gap-4 mb-16 opacity-80 relative z-9999"
                >
                    <div className="h-px w-12 bg-white/20 relative" />
                    <span className="text-[10px] sm:text-[12px] font-black tracking-[0.6em] uppercase whitespace-nowrap">
                        {t.systemInitializing}
                    </span>
                    <div className="h-px w-12 bg-white/20" />
                </motion.div>

                {/* Main Heading */}
                <div className="relative mb-8 sm:mb-12">
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-7xl sm:text-9xl md:text-[140px] font-black italic tracking-tighter leading-none select-none uppercase"
                    >
                        {t.comingSoon?.split(' ')[0]}<br />{t.comingSoon?.split(' ').slice(1).join(' ')}
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0.2, 0.5, 0.1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        style={{ textShadow: '0 0 40px #41398B, 0 0 80px #41398B' }}
                        className="absolute inset-0 text-7xl sm:text-9xl md:text-[140px] font-black italic tracking-tighter leading-none pointer-events-none text-[#41398B]/50 uppercase"
                    >
                        {t.comingSoon?.split(' ')[0]}<br />{t.comingSoon?.split(' ').slice(1).join(' ')}
                    </motion.h1>
                </div>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm md:text-base text-white/40 max-w-lg mx-auto leading-relaxed mb-0"
                >
                    {t.maintenanceHeading}
                </motion.p>
            </motion.main>

            {/* Hanging Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <motion.div
                    animate={{
                        rotate: [-8, 8],
                        transition: {
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut"
                        }
                    }}
                    style={{ originY: 0 }}
                    className="flex flex-col items-center"
                >
                    {/* Wire */}
                    <div className="w-[1.5px] h-[150px] bg-gradient-to-t from-white/40 to-transparent" />

                    {/* Bulb Socket */}
                    <div className="w-4 h-6 bg-[#0a0a1a] rounded-sm border border-white/10" />

                    {/* The Bulb */}
                    <motion.div
                        animate={{
                            opacity: [0.8, 1, 0.9, 1, 0.8, 1, 0.9],
                            scale: [1, 1.05, 1, 1.1, 1, 1.05, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative"
                    >
                        {/* Glow Core */}
                        <div className="w-8 h-10 bg-white rounded-full border-2 border-[#41398B] shadow-[0_0_30px_#41398B,0_0_60px_#41398B]" />

                        {/* Atmosphere Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#41398B]/20 rounded-full blur-2xl" />
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes flicker {
                    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
                    20%, 22%, 24%, 55% { opacity: 0.4; }
                }
                .glow-text {
                    color: white;
                }

                @media (max-width: 767px) {
                    body {
                        padding-bottom: 0px;
                    }
                }
            `}</style>
        </div>
    );
}



