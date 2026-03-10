import { useState, useEffect } from 'react';
import { getProjectBanner } from '../../Api/action';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../Language/LanguageContext';

export default function ProjectBanner() {
    const { language } = useLanguage();
    const [bannerData, setBannerData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await getProjectBanner();
                setBannerData(res.data?.data || res.data || null);
            } catch (error) {
                console.error("Error fetching project banner:", error);
            }
        };
        fetchBanner();
    }, []);

    const images = bannerData?.projectBannerImages || [];

    const nextSlide = () => {
        if (images.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        if (images.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    // Helper to get full image URL
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const baseURL = import.meta.env.VITE_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${url}`;
    };

    const title = language === 'vi'
        ? (bannerData?.projectBannerTitle?.vi || bannerData?.projectBannerTitle?.en)
        : (bannerData?.projectBannerTitle?.en || bannerData?.projectBannerTitle?.vi);

    const description = language === 'vi'
        ? (bannerData?.projectBannerDesc?.vi || bannerData?.projectBannerDesc?.en)
        : (bannerData?.projectBannerDesc?.en || bannerData?.projectBannerDesc?.vi);

    return (
        <div className="relative w-full h-[400px] md:h-[650px] overflow-hidden group bg-gray-100">
            {/* Slides */}
            <div
                className="w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out"
                style={{
                    backgroundImage: `url(${getImageUrl(images[currentIndex])})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            >
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-end pb-16 md:pb-24 text-white px-6">
                    <h1 className="text-3xl md:text-5xl font-semibold uppercase mb-3 text-center animate-fadeInUp drop-shadow-lg">
                        {title}
                    </h1>
                    <p className="text-base md:text-xl font-medium text-center animate-fadeInUp animation-delay-200 opacity-90 max-w-4xl drop-shadow-md">
                        {description}
                    </p>
                </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 border-2 border-white/50 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-white transition-all cursor-pointer z-99 group/btn"
                    >
                        <ChevronLeft size={30} className="group-hover/btn:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 border-2 border-white/50 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-white transition-all cursor-pointer z-99 group/btn"
                    >
                        <ChevronRight size={30} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
