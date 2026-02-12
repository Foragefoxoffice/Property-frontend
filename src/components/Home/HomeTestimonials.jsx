import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVisibleTestimonials } from '@/Api/action';
import { useLanguage } from '@/Language/LanguageContext';

export default function HomeTestimonials({ homePageData }) {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(3);
    const [isPaused, setIsPaused] = useState(false);
    const { language } = useLanguage();
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await getVisibleTestimonials();
                if (response.data?.success) {
                    setTestimonials(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsToShow(1);
            } else if (window.innerWidth < 1024) {
                setItemsToShow(2);
            } else {
                setItemsToShow(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, testimonials.length - itemsToShow);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, [maxIndex]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    }, [maxIndex]);

    // Auto-play logic
    useEffect(() => {
        if (testimonials.length === 0 || isPaused) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(nextSlide, 5000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [nextSlide, testimonials.length, isPaused]);

    if (loading || testimonials.length === 0) return null;

    return (
        <section className="py-10 md:py-20 bg-gray-50 overflow-hidden min-h-[600px] flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
                <div className="text-center mb-6 md:mb-12">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3"
                    >
                        {language === 'en'
                            ? (homePageData?.homeTestimonialSubTitle_en || 'OUR HAPPY CUSTOMERS')
                            : (homePageData?.homeTestimonialSubTitle_vn || 'KHÁCH HÀNG HÀI LÒNG')
                        }
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-4xl font-semibold text-black"
                    >
                        {language === 'en'
                            ? (homePageData?.homeTestimonialTitle_en || 'What They Say About Us')
                            : (homePageData?.homeTestimonialTitle_vn || 'Họ Nói Gì Về Chúng Tôi')
                        }
                    </motion.h2>
                </div>

                <div
                    className="relative w-full mt-0 md:mt-10"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full bg-white shadow-lg text-gray-800 hover:bg-black hover:text-white transition-all duration-300 group cursor-pointer"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                    <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full bg-white shadow-lg text-gray-800 hover:bg-black hover:text-white transition-all duration-300 group cursor-pointer"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Testimonial Card Slider Track */}
                    <div className="overflow-hidden py-4">
                        <motion.div
                            className="flex"
                            animate={{
                                x: `-${currentIndex * (100 / itemsToShow)}%`
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 30,
                                mass: 1
                            }}
                        >
                            {testimonials.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                                >
                                    <div className="bg-white p-7 md:p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between h-[450px] md:h-[400px]">
                                        <div>
                                            <div className="flex items-center gap-1 mb-6">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={18}
                                                        className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>

                                            <div className="relative">
                                                <Quote className="absolute -top-6 -left-4 text-gray-100 w-14 h-14 -z-10" />
                                                <p className="text-md md:text-[17px] text-gray-700 italic leading-relaxed relative z-10 line-clamp-6">
                                                    "{language === 'en' ? (item.text_en || item.text) : (item.text_vn || item.text)}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-3 border-t border-gray-50 mt-auto">
                                            {item.profile_photo_url ? (
                                                <img
                                                    src={item.profile_photo_url}
                                                    alt={item.author_name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg flex-shrink-0">
                                                    {item.author_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-black uppercase text-sm tracking-wide truncate">
                                                    {item.author_name}
                                                </h4>
                                                {item.relative_time_description && (
                                                    <p className="text-xs text-[#a4aeb5] truncate">
                                                        {item.relative_time_description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.slice(0, maxIndex + 1).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${currentIndex === index ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}