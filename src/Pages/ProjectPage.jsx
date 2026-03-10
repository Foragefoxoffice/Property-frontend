import React, { useState, useEffect } from 'react';
import Header from '../Admin/Header/Header';
import Footer from '../Admin/Footer/Footer';
import SEO from '../components/SEO/SEO';
import SmoothScroll from '../components/SmoothScroll';
import { getProjectCategories, getAllProjectsAdmin, getProjectPage } from '../Api/action';
import { useLanguage } from '../Language/LanguageContext';
import { getImageUrl } from '../utils/imageHelper';
import ProjectBanner from '../components/Projects/ProjectBanner';
import Loader from '../components/Loader/Loader';
import { Link } from 'react-router-dom';

export default function ProjectPage() {
    const { language } = useLanguage();

    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let text = doc.body.textContent || "";
        return text.replace(/\s+/g, ' ').trim();
    };
    const [pageData, setPageData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [pageRes, catRes, projRes] = await Promise.all([
                    getProjectPage(),
                    getProjectCategories(),
                    getAllProjectsAdmin()
                ]);

                setPageData(pageRes.data?.data || null);
                setCategories(catRes.data?.data || []);
                const allProjects = projRes.data?.data || [];
                setProjects(allProjects.filter(p => p.published));
            } catch (error) {
                console.error("Error fetching project page data:", error);
            } finally {
                // Proper delay for smooth transition
                setTimeout(() => {
                    setLoading(false);
                }, 800);
            }
        };
        fetchData();
    }, []);

    const filteredProjects = selectedCategory === 'all'
        ? projects
        : projects.filter(p => {
            const catId = p.category?._id || p.category;
            return catId === selectedCategory;
        });

    // Use page data for SEO if available, otherwise fallback
    const seoTitle = pageData?.[`projectSeoMetaTitle_${language}`] || (language === 'vi' ? 'Dự Án' : 'Projects');
    const seoDesc = pageData?.[`projectSeoMetaDescription_${language}`] || (language === 'vi' ? 'Khám phá các dự án bất động sản của chúng tôi' : 'Explore our real estate projects');

    return (
        <div className="min-h-screen bg-white font-['Manrope']">
            <SEO
                title={seoTitle}
                description={seoDesc}
            />
            <SmoothScroll />
            <Header />

            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <Loader />
                </div>
            ) : (
                <>
                    {/* Main Project Banner */}
                    <ProjectBanner />

                    <div className="max-w-7xl mx-auto px-6 py-16">

                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedCategory === 'all'
                                    ? 'bg-[#41398B] text-white shadow-sm shadow-purple-200 scale-105'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {language === 'vi' ? 'Tất cả' : 'All'}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat._id)}
                                    className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedCategory === cat._id
                                        ? 'bg-[#41398B] text-white shadow-sm shadow-purple-200 scale-105'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.name?.[language] || cat.name?.en}
                                </button>
                            ))}
                        </div>

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {filteredProjects.map(project => {
                                // Extract Date
                                const dateObj = new Date(project.createdAt);
                                const formattedDate = dateObj.toLocaleDateString('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric'
                                });

                                // Extract Description Snippet (Prefer Main Description over Intro Content)
                                const descSource = project.projectMainDescription?.[language] || project.projectMainDescription?.en
                                    || project.projectIntroContent?.[language] || project.projectIntroContent?.en || "";

                                const plainTextIntro = stripHtml(descSource).substring(0, 150) + "...";

                                return (
                                    <Link
                                        to={`/projects/${project._id}`}
                                        key={project._id}
                                        className="group flex flex-col h-full bg-white rounded-[16px] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
                                    >
                                        {/* Featured Image */}
                                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                            <img
                                                src={getImageUrl(project.mainImage)}
                                                alt={project.title?.[language]}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Project Card Content */}
                                        <div className="p-4 pt-5 flex flex-col flex-1">
                                            {/* Category and Date meta */}
                                            <div className="flex items-center gap-4 mb-4 justify-between">
                                                <span className="bg-[#F5F3FF] text-[#41398B] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                                                    {project.category?.name?.[language] || project.category?.name?.en}
                                                </span>
                                                <span className="text-gray-400 text-[13px] font-medium">
                                                    {formattedDate}
                                                </span>
                                            </div>

                                            <h3 className="text-[20px] font-bold text-[#111827] leading-tight mb-4 group-hover:text-[#41398B] transition-colors line-clamp-2">
                                                {project.title?.[language] || project.title?.en}
                                            </h3>

                                            <p className="text-gray-500 text-[14.5px] leading-relaxed line-clamp-3 mb-6 font-medium">
                                                {plainTextIntro}
                                            </p>

                                            <div className="mt-auto">
                                                <div className="flex items-center gap-2 text-[#41398B] font-bold text-[15px] group/more">
                                                    <span>{language === 'vi' ? 'Xem thêm' : 'Read More'}</span>
                                                    <span className="transform transition-transform group-hover/more:translate-x-1">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredProjects.length === 0 && (
                            <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100 animate-pulse">
                                <p className="text-gray-400 font-bold uppercase tracking-widest opacity-60">
                                    {language === 'vi' ? 'Không tìm thấy dự án nào trong danh mục này.' : 'No projects found in this category.'}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            <Footer />

            <style>{`
                .ql-editor-simple p {
                    margin: 0 !important;
                    display: inline !important;
                }
                .ql-editor-simple * {
                    display: inline !important;
                    font-size: inherit !important;
                    color: inherit !important;
                    font-weight: inherit !important;
                }
            `}</style>
        </div>
    );
}