import React, { useState, useEffect } from 'react';
import { getProjectIntro, getProjectPage } from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';

export default function ProjectIntroduction({ projectData = null }) {
    const { language } = useLanguage();
    const [introData, setIntroData] = useState(null);
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(!projectData);

    useEffect(() => {
        if (projectData) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                const [introRes, pageRes] = await Promise.all([
                    getProjectIntro(),
                    getProjectPage()
                ]);
                setIntroData(introRes.data?.data || null);
                setPageData(pageRes.data?.data || null);
            } catch (error) {
                console.error("Error fetching introduction data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectData]);

    if (loading) return null;

    // Determine which data source to use: props (specific project) or fetched (global)
    const activeData = projectData || introData;
    if (!activeData) return null;

    const title = language === 'vi'
        ? (activeData.projectIntroTitle?.vi || activeData.projectIntroTitle?.en || (projectData ? 'GIỚI THIỆU DỰ ÁN' : (pageData?.projectIntroTitle?.vi || 'GIỚI THIỆU DỰ ÁN')))
        : (activeData.projectIntroTitle?.en || activeData.projectIntroTitle?.vi || (projectData ? 'PROJECT INTRODUCTION' : (pageData?.projectIntroTitle?.en || 'PROJECT INTRODUCTION')));

    const content = language === 'vi'
        ? (activeData.projectIntroContent?.vi || activeData.projectIntroContent?.en)
        : (activeData.projectIntroContent?.en || activeData.projectIntroContent?.vi);

    const videoUrl = activeData.projectIntroVideo;
    const mediaType = activeData.mediaType || 'image';

    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(videoUrl);

    return (
        <section className="py-18 bg-white font-['Manrope'] overflow-hidden">
            <div className="max-w-9xl mx-auto px-6">
                <div className="flex flex-col lg:flex-col gap-12 lg:gap-12 items-center">
                    {/* Left: Content Area */}
                    <div className="lg:w-1/2 flex flex-col">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#111827] mb-4 uppercase tracking-tight text-center">
                            {title}
                        </h2>
                        <div
                            className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-600 project-intro-rich-text text-center"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>

                    {/* Right: Media Area */}
                    <div className="lg:w-1/2 flex flex-col mt-4 lg:mt-0">
                        {mediaType === 'youtube' && youtubeId ? (
                            <div className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-2xl overflow-hidden shadow-2xl relative">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title="Project Introduction Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : mediaType === 'image' && videoUrl ? (
                            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src={videoUrl}
                                    alt="Project Overview"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        ) : null}

                        {/* Optional Video Title / Caption */}
                        <div className="mt-6 text-center">
                            <h3 className="text-base md:text-[15px] font-bold text-[#111827] uppercase tracking-wide opacity-80 decoration-[#41398B] decoration-2 underline-offset-8">
                                {projectData ? (
                                    language === 'vi'
                                        ? `TỔNG QUAN DỰ ÁN ${projectData.title?.vi || projectData.title?.en}`
                                        : `OVERVIEW OF THE ${projectData.title?.en || projectData.title?.vi} PROJECT`
                                ) : (
                                    language === 'vi' ? 'TỔNG QUAN DỰ ÁN' : 'OVERVIEW OF THE PROJECT'
                                )}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .project-intro-rich-text p {
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                }
                .project-intro-rich-text strong {
                    color: #111827;
                    font-weight: 700;
                }
                .project-intro-rich-text a {
                    color: #41398B;
                    font-weight: 700;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }
                .project-intro-rich-text a:hover {
                    color: #2D2766;
                }
            `}</style>
        </section>
    );
}
