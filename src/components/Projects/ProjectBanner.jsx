import React, { useState, useEffect } from 'react';
import { Carousel, ConfigProvider } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjectPage } from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { getImageUrl } from '../../utils/imageHelper';

export default function ProjectBanner({ projectData = null }) {
    const { language } = useLanguage();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(!projectData);

    const CustomArrow = ({ direction, onClick }) => (
        <button
            onClick={onClick}
            className={`absolute z-9999 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full border border-white/50 text-white hover:bg-white hover:text-black transition-all duration-300 ${direction === 'left' ? 'left-8' : 'right-8'}`}
            style={{ pointerEvents: 'auto' }}
        >
            {direction === 'left' ? <ChevronLeft size={24} strokeWidth={1.5} /> : <ChevronRight size={24} strokeWidth={1.5} />}
        </button>
    );

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const res = await getProjectPage();
                setPageData(res.data?.data || null);
            } catch (error) {
                console.error("Error fetching project page data:", error);
            } finally {
                if (!projectData) setLoading(false);
            }
        };
        fetchPageData();
    }, [projectData]);

    const activeData = projectData || pageData;

    if (loading || !activeData) return null;

    const bannerImages = activeData.projectBannerImages || [];

    if (bannerImages.length === 0) return null;

    const title = language === 'vi'
        ? (activeData.projectBannerTitle?.vi || activeData.projectBannerTitle?.en || projectData?.title?.vi || projectData?.title?.en || "")
        : (activeData.projectBannerTitle?.en || activeData.projectBannerTitle?.vi || projectData?.title?.en || projectData?.title?.vi || "");

    const description = language === 'vi'
        ? (activeData.projectBannerDesc?.vi || activeData.projectBannerDesc?.en || "")
        : (activeData.projectBannerDesc?.en || activeData.projectBannerDesc?.vi || "");

    return (
        <section className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden group">
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#FFFFFF',
                    },
                    components: {
                        Carousel: {
                            dotActiveWidth: 10,
                            dotHeight: 10,
                            dotWidth: 10,
                        }
                    }
                }}
            >
                <Carousel
                    autoplay
                    autoplaySpeed={6000}
                    effect="fade"
                    arrows
                    prevArrow={<CustomArrow direction="left" />}
                    nextArrow={<CustomArrow direction="right" />}
                    className="h-full w-full custom-project-banner-carousel"
                >
                    {bannerImages.map((img, index) => (
                        <div key={index} className="relative h-[60vh] md:h-[85vh] w-full">
                            <img
                                src={getImageUrl(img)}
                                alt={`${title} Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>
                    ))}
                </Carousel>
            </ConfigProvider>

            {/* Content Overlay */}
            <div className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 text-center z-10 pointer-events-none">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-[0.05em] mb-4 drop-shadow-lg leading-tight animate-fade-in-up">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm md:text-lg text-white/90 font-medium tracking-wide drop-shadow-md animate-fade-in-up-delay">
                        {description}
                    </p>
                )}
            </div>

            <style>{`
                .custom-project-banner-carousel .slick-dots {
                    bottom: 40px !important;
                }
                .custom-project-banner-carousel .slick-dots li button {
                    background: transparent !important;
                    border: 1.5px solid white !important;
                    border-radius: 50% !important;
                    opacity: 0.7 !important;
                }
                .custom-project-banner-carousel .slick-dots li.slick-active button {
                    background: white !important;
                    opacity: 1 !important;
                    transform: scale(1.2) !important;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .animate-fade-in-up-delay {
                    animation: fadeInUp 0.8s ease-out 0.3s forwards;
                    opacity: 0;
                }
            `}</style>
        </section>
    );
}

