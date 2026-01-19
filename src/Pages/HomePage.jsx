import { useState, useEffect } from 'react';
import HomeBanner from "@/components/Home/HomeBanner";
import HomeAbout from "@/components/Home/HomeAbout";
import HomeFeaturedProperties from "@/components/Home/HomeFeaturedProperties";
import HomeFaq from "@/components/Home/HomeFaq";
import HomeFindProperty from "@/components/Home/HomeFindProperty";
import HomeLatestBlogs from "@/components/Home/HomeLatestBlogs";
import SmoothScroll from "@/components/SmoothScroll";
import { getHomePage } from "@/Api/action";
import Loader from "@/components/Loader/Loader";
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import { useLanguage } from "@/Language/LanguageContext";

export default function HomePage() {
    const [homePageData, setHomePageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    // SEO Head Management
    useEffect(() => {
        if (!homePageData) return;

        const langKey = language === 'vi' ? 'vn' : 'en';

        // Helper to safely update meta tags
        const updateMeta = (name, content, attribute = 'name') => {
            if (!content) return;
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // 1. Update Title
        const metaTitle = homePageData[`homeSeoMetaTitle_${langKey}`] ||
            homePageData[`heroTitle_${langKey}`] ||
            (langKey === 'en' ? 'Home Page' : 'Trang Chủ');

        if (metaTitle) {
            document.title = metaTitle;
        }

        // 2. Meta Description
        const metaDesc = homePageData[`homeSeoMetaDescription_${langKey}`] ||
            homePageData[`heroDescription_${langKey}`] ||
            '';
        updateMeta('description', metaDesc);

        // 3. Meta Keywords
        const keywords = homePageData[`homeSeoMetaKeywords_${langKey}`];
        if (Array.isArray(keywords) && keywords.length > 0) {
            updateMeta('keywords', keywords.join(', '));
        }

        // 4. Canonical URL
        const canonicalUrl = homePageData[`homeSeoCanonicalUrl_${langKey}`];
        let linkCanonical = document.querySelector("link[rel='canonical']");
        if (canonicalUrl) {
            if (!linkCanonical) {
                linkCanonical = document.createElement('link');
                linkCanonical.setAttribute('rel', 'canonical');
                document.head.appendChild(linkCanonical);
            }
            linkCanonical.setAttribute('href', canonicalUrl);
        }

        // 5. Open Graph / Social Sharing
        updateMeta('og:title', homePageData[`homeSeoOgTitle_${langKey}`] || metaTitle, 'property');
        updateMeta('og:description', homePageData[`homeSeoOgDescription_${langKey}`] || metaDesc, 'property');
        updateMeta('og:type', 'website', 'property');
        updateMeta('og:url', window.location.href, 'property');

        // OG Images (Common for both languages) - Ensure absolute URLs
        const ogImages = homePageData.homeSeoOgImages;
        if (Array.isArray(ogImages) && ogImages.length > 0) {
            // Remove existing og:image tags to prevent duplicates if any
            document.querySelectorAll('meta[property="og:image"]').forEach(el => el.remove());

            ogImages.forEach(imgUrl => {
                if (!imgUrl) return;
                // Ensure absolute URL for social sharing
                const absoluteUrl = imgUrl.startsWith('http')
                    ? imgUrl
                    : `${window.location.origin}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;

                const el = document.createElement('meta');
                el.setAttribute('property', 'og:image');
                el.setAttribute('content', absoluteUrl);
                document.head.appendChild(el);
            });
        }

        // 6. Twitter Card Tags
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', homePageData[`homeSeoOgTitle_${langKey}`] || metaTitle);
        updateMeta('twitter:description', homePageData[`homeSeoOgDescription_${langKey}`] || metaDesc);
        updateMeta('twitter:url', window.location.href);

        // Twitter image (use first OG image if available)
        if (Array.isArray(ogImages) && ogImages.length > 0 && ogImages[0]) {
            const absoluteUrl = ogImages[0].startsWith('http')
                ? ogImages[0]
                : `${window.location.origin}${ogImages[0].startsWith('/') ? '' : '/'}${ogImages[0]}`;
            updateMeta('twitter:image', absoluteUrl);
        }

        // 7. Allow Indexing
        if (homePageData.homeSeoAllowIndexing === false) {
            updateMeta('robots', 'noindex, nofollow');
        } else {
            updateMeta('robots', 'index, follow');
        }

    }, [homePageData, language]);

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

    return (
        <div>
            <SmoothScroll />
            <Header />
            <HomeBanner homePageData={homePageData} />
            <HomeAbout homePageData={homePageData} />
            <HomeFeaturedProperties homePageData={homePageData} />
            <HomeFaq homePageData={homePageData} />
            <HomeFindProperty homePageData={homePageData} />
            <HomeLatestBlogs homePageData={homePageData} />
            <Footer />
        </div>
    );
}