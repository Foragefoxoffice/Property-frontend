import { useState, useEffect } from 'react';
import HomeBanner from "@/components/Home/HomeBanner";
import HomeAbout from "@/components/Home/HomeAbout";
import HomeFeaturedProperties from "@/components/Home/HomeFeaturedProperties";
import HomeFaq from "@/components/Home/HomeFaq";
import HomeFindProperty from "@/components/Home/HomeFindProperty";
import HomeLatestBlogs from "@/components/Home/HomeLatestBlogs";
import HomeTestimonials from "@/components/Home/HomeTestimonials";
import SmoothScroll from "@/components/SmoothScroll";
import { getHomePage } from "@/Api/action";
import Loader from "@/components/Loader/Loader";
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import { useLanguage } from "@/Language/LanguageContext";
import SEO from '@/components/SEO/SEO';

export default function HomePage() {
    const [homePageData, setHomePageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await getHomePage();
                if (response.data?.success && response.data?.data) {
                    setHomePageData(response.data.data);
                }
            } catch (error) {
                console.error('Error loading home page data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    const langKey = language === 'vi' ? 'vn' : 'en';

    // Prepare SEO Data
    const metaTitle = homePageData?.[`homeSeoMetaTitle_${langKey}`] ||
        homePageData?.[`heroTitle_${langKey}`] ||
        (langKey === 'en' ? 'Home Page' : 'Trang Chủ');

    const metaDesc = homePageData?.[`homeSeoMetaDescription_${langKey}`] ||
        homePageData?.[`heroDescription_${langKey}`] ||
        '';

    const ogImage = homePageData?.homeSeoOgImages?.[0] || homePageData?.heroImage || null;

    return (
        <div>
            <SEO
                title={metaTitle}
                description={metaDesc}
                image={ogImage}
                url={window.location.href}
            />
            <SmoothScroll />
            <Header />
            <HomeBanner homePageData={homePageData} />
            <HomeAbout homePageData={homePageData} />
            <HomeFeaturedProperties homePageData={homePageData} />
            <HomeFaq homePageData={homePageData} />
            <HomeTestimonials homePageData={homePageData} />
            <HomeFindProperty homePageData={homePageData} />
            <HomeLatestBlogs homePageData={homePageData} />
            <Footer />
        </div>
    );
}