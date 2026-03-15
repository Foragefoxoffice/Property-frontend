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
import ProjectProduct from '../components/Projects/ProjectProduct';
import ProjectVideo from '../components/Projects/ProjectVideo';
import ProjectPhotos from '../components/Projects/ProjectPhotos';
import HomeLatestBlogs from '../components/Home/HomeLatestBlogs';
import RelatedProjects from '../components/Projects/RelatedProjects';
import ProjectMainDescription from '../components/Projects/ProjectMainDescription';
import ProjectForm from '../components/Projects/ProjectForm';

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

    // Prepare SEO Data
    const langKey = language === 'vi' ? 'vn' : 'en';
    
    const metaTitle = project?.[`projectSeoMetaTitle_${langKey}`] || 
                      project?.title?.[language] || 
                      (language === 'vi' ? 'Chi tiết dự án' : 'Project Details');

    const metaDescSource = project?.[`projectSeoMetaDescription_${langKey}`] || 
                         project?.projectMainDescription?.[language] ||
                         project?.projectIntroContent?.[language] || 
                         (language === 'vi' ? 'Thông tin chi tiết về dự án' : 'Detailed project information');

    const metaDesc = stripHtml(metaDescSource).substring(0, 160);

    const metaKeywords = project?.[`projectSeoMetaKeywords_${langKey}`] || [];
    const canonicalUrl = project?.[`projectSeoCanonicalUrl_${langKey}`];
    const ogTitle = project?.[`projectSeoOgTitle_${langKey}`] || metaTitle;
    const ogDesc = project?.[`projectSeoOgDescription_${langKey}`] || metaDesc;
    const ogImage = project?.projectSeoOgImage || project?.mainImage;
    const allowIndexing = project?.projectSeoAllowIndexing !== false;

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={metaTitle}
                description={metaDesc}
                keywords={metaKeywords}
                canonicalUrl={canonicalUrl}
                ogTitle={ogTitle}
                ogDescription={ogDesc}
                ogImage={ogImage}
                allowIndexing={allowIndexing}
            />
            <SmoothScroll />
            <Header />

            {/* Main Project Banner */}
            <ProjectBanner projectData={project} />

            {/* Project Introduction Section */}
            <ProjectIntroduction projectData={project} />

            {/* Project Overview Section */}
            <ProjectOverview projectData={project} />

            {/* Project Location Section */}
            <ProjectLocation projectData={project} />
            {/* Project Photos Gallery Section */}
            <ProjectPhotos projectData={project} />
            {/* Project Products Section */}
            <ProjectProduct projectData={project} />

            {/* Project Video Library Section */}
            <ProjectVideo projectData={project} />

            {/* Project Enquiry Form Section */}
            <ProjectForm 
                projectName={project?.title?.[language] || project?.title?.en} 
                projectId={project?._id}
            />

            {/* Related Projects Section */}
            <RelatedProjects 
                currentCategoryId={project?.category?._id || project?.category} 
                currentProjectId={project?._id} 
                currentProjectData={project}
            />

            {/* Recent News Section */}
            <HomeLatestBlogs />

            <Footer />
        </div>
    );
}

