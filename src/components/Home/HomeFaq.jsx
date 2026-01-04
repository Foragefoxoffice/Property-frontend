import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeFaq({ homePageData }) {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    // Helper to get partial or full URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        const baseURL = import.meta.env.VITE_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    // CMS Content with Fallbacks
    const cardTitle = homePageData?.homeFaqImageTitle_en || 'Get in Touch With Us';
    const cardDescription = homePageData?.homeFaqImageDescription_en || 'Reach out today for expert real estate advice, personalized support, and a dedicated team ready to guide you every step of the way.';
    const buttonText = homePageData?.homeFaqImageButtonText_en || 'Schedule a Consultation';
    const buttonLink = homePageData?.homeFaqImageButtonLink || '/contact';

    // Resolve image URL: if CMS has value, process it; else use frontend fallback
    const cardImage = homePageData?.homeFaqBg
        ? getImageUrl(homePageData.homeFaqBg)
        : '/images/property/property1.jpg';

    const faqSectionSubtitle = homePageData?.homeFaqTitle_en || 'FAQS';
    const faqSectionTitle = homePageData?.homeFaqDescription_en || 'Ask Us Anything About Home Buying & Selling';

    // Parse FAQs
    // The previous model view showed 'faqs' as an array.
    const faqs = homePageData?.faqs?.length > 0 ? homePageData.faqs : [
        {
            header_en: 'How do I start the home buying process?',
            content_en: 'Starting the home buying process involves getting pre-approved for a mortgage to understand your budget, finding a real estate agent to guide you, and identifying your needs and preferences for your new home.'
        },
        {
            header_en: 'What costs are involved in buying a home?',
            content_en: 'Our approach combines personalized strategies, data-driven insights, and dedicated support to help you reach your financial goals. Each step is crafted to maximize growth, reduce risk, and build lasting financial confidence.'
        },
        {
            header_en: 'How long does it take to buy a home?',
            content_en: 'The timeline varies but typically takes 30-45 days from contract to closing. Finding the right home can take weeks or months depending on the market and your specific criteria.'
        },
        {
            header_en: 'Can I buy a home without a real estate agent?',
            content_en: 'Yes, you can, but it is not recommended. An agent provides valuable expertise, negotiation skills, and handles the complex paperwork involved in the transaction, often saving you time and money.'
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Left Side: Contact Card */}
                <div
                    className={`relative rounded-3xl overflow-hidden min-h-[500px] flex flex-col bg-cover bg-center transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                        }`}
                    style={{ backgroundImage: `url(${cardImage})` }}
                >
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/5 z-0"></div>

                    {/* Content */}
                    <div className="relative z-10 p-10 md:p-12 flex flex-col h-full items-start">
                        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
                            {cardTitle}
                        </h2>
                        <p className="text-white/90 text-lg mb-8 leading-relaxed max-w-md">
                            {cardDescription}
                        </p>
                        <button
                            onClick={() => navigate(buttonLink)}
                            className="mt-4 px-8 py-3.5 bg-black cursor-pointer text-white font-semibold rounded-md hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-100 translate-y-0"
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>

                {/* Right Side: FAQ */}
                <div className="flex flex-col justify-start pt-4">
                    <span
                        className={`text-md font-semibold tracking-[0.2em] text-gray-400 uppercase mb-3 transition-all duration-700 delay-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        {faqSectionSubtitle}
                    </span>
                    <h2
                        className={`text-4xl md:text-5xl font-semibold text-[#1a1a1a] mb-9 leading-tight transition-all duration-700 delay-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        {faqSectionTitle}
                    </h2>

                    <div className="space-y-0">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`border-b border-gray-200 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${700 + index * 100}ms` }}
                            >
                                <button
                                    className="w-full py-6 flex items-center justify-between text-left group cursor-pointer"
                                    onClick={() => toggleAccordion(index)}
                                >
                                    <span className="text-xl font-medium text-[#1a1a1a] pr-8 group-hover:text-[#41398B] transition-colors duration-300">
                                        {faq.header_en || faq.header}
                                    </span>
                                    <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#41398B]' : 'rotate-0 text-gray-400 group-hover:text-[#41398B]'}`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <p className="text-gray-500 leading-relaxed text-lg">
                                        {faq.content_en || faq.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}