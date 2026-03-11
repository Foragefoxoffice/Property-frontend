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
        ? (activeData.projectIntroTitle?.vi || activeData.projectIntroTitle?.en || "")
        : (activeData.projectIntroTitle?.en || activeData.projectIntroTitle?.vi || "");

    const content = language === 'vi'
        ? (activeData.projectIntroContent?.vi || activeData.projectIntroContent?.en)
        : (activeData.projectIntroContent?.en || activeData.projectIntroContent?.vi);

    const videoUrl = activeData.projectIntroVideo;
    const mediaType = activeData.mediaType || 'image';

    // Hide section if no content and no media
    if (!content && !videoUrl) return null;


    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(videoUrl);

    return (
        <section className="py-16 md:py-18 bg-white font-['Manrope'] overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col gap-10 md:gap-14 items-center">
                    {/* Content Area */}
                    <div className="w-full max-w-4xl px-4 flex flex-col items-center mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-6 uppercase tracking-tight text-center">
                            {title}
                        </h2>
                        <div
                            className="text-[15px] md:text-[16px] leading-[1.8] text-gray-600 project-intro-rich-text text-center w-full break-words whitespace-normal"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>

                    {/* Media Area */}
                    <div className="w-full max-w-6xl flex flex-col mt-4 lg:mt-0">
                        {mediaType === 'youtube' && youtubeId ? (
                            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative bg-black">
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
                            <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-50">
                                <img
                                    src={videoUrl}
                                    alt="Project Overview"
                                    className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <style>{`
                .project-intro-rich-text p {
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                    word-break: break-word;
                    white-space: normal;
                    text-align: center;
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
