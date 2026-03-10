import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBanner from '../components/Projects/ProjectBanner';
import Header from '../Admin/Header/Header';
import Footer from '../Admin/Footer/Footer';
import SEO from '../components/SEO/SEO';
import SmoothScroll from '../components/SmoothScroll';
import { useLanguage } from "../Language/LanguageContext";
import { getProjectById } from '../Api/action';
import Loader from '../components/Loader/Loader';

import ProjectIntroduction from '../components/Projects/ProjectIntroduction';
import ProjectOverview from '../components/Projects/ProjectOverview';
import ProjectLocation from '../components/Projects/ProjectLocation';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const { language } = useLanguage();

    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let text = doc.body.textContent || "";
        return text.replace(/\s+/g, ' ').trim();
    };
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const res = await getProjectById(id);
                setProject(res.data?.data || null);
            } catch (error) {
                console.error("Error fetching project details:", error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 800);
            }
        };
        if (id) {
            fetchProject();
        }
    }, [id]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={project?.title?.[language] || (language === 'vi' ? 'Chi tiết dự án' : 'Project Details')}
                description={stripHtml(project?.projectIntroContent?.[language])?.substring(0, 160) || (language === 'vi' ? 'Thông tin chi tiết về dự án' : 'Detailed project information')}
            />
            <SmoothScroll />
            <Header />

            {/* Main Project Banner */}
            <ProjectBanner />

            {/* Project Introduction Section */}
            <ProjectIntroduction projectData={project} />

            {/* Project Overview Section */}
            <ProjectOverview projectData={project} />

            {/* Project Location Section */}
            <ProjectLocation projectData={project} />



            <Footer />
        </div>
    );
}
