import React from 'react';
import Header from '../Admin/Header/Header';
import Footer from '../Admin/Footer/Footer';
import SEO from '../components/SEO/SEO';
import SmoothScroll from '../components/SmoothScroll';
import ProjectBanner from '../components/Projects/ProjectBanner';
import ProjectIntroduction from '../components/Projects/ProjectIntroduction';
import { useLanguage } from '../Language/LanguageContext';

export default function ProjectIntroductionPage() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-white font-['Manrope']">
            <SEO
                title={language === 'vi' ? 'Giới Thiệu Dự Án' : 'Project Introduction'}
                description={language === 'vi' ? 'Thông tin chi tiết về dự án của chúng tôi' : 'Detailed information about our projects'}
            />
            <SmoothScroll />
            <Header />

            <ProjectBanner />

            <main>
                <ProjectIntroduction />
            </main>

            <Footer />
        </div>
    );
}
