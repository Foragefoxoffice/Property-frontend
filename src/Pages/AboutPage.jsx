import { useEffect, useState } from "react";
import { getAboutPage } from "../Api/action";
import AboutBanner from "../components/About/AboutBanner";
import AboutOverview from "../components/About/AboutOverview";
import SmoothScroll from "@/components/SmoothScroll";
import AboutMissionVission from "../components/About/AboutMissionVission";
import AboutHistory from "../components/About/AboutHistory";
import AboutWhyChoose from "../components/About/AboutWhyChoose";
import AboutFindProperty from "../components/About/AboutFindProperty";
import AboutBuyProcess from "../components/About/AboutBuyProcess";
import AboutAgent from "../components/About/AboutAgent";
import Loader from "@/components/Loader/Loader";
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";
import { useLanguage } from "@/Language/LanguageContext";

export default function AboutPage() {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    // SEO Head Management
    useEffect(() => {
        if (!pageData) return;

        const langKey = language === 'vi' ? 'vn' : 'en';

        // Helper to safely update meta tags
        const updateMeta = (name, content, attribute = 'name') => {
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            if (content) {
                element.setAttribute('content', content);
            } else {
                element.remove();
            }
        };

        // 1. Update Title
        const metaTitle = pageData[`aboutSeoMetaTitle_${langKey}`] ||
            pageData[`aboutBannerTitle_${langKey}`] ||
            (langKey === 'en' ? 'About Us' : 'Về Chúng Tôi');

        if (metaTitle) {
            document.title = metaTitle;
        }

        // 2. Meta Description
        const metaDesc = pageData[`aboutSeoMetaDescription_${langKey}`] || '';
        updateMeta('description', metaDesc);

        // 3. Keywords
        const keywords = pageData[`aboutSeoMetaKeywords_${langKey}`];
        if (Array.isArray(keywords) && keywords.length > 0) {
            updateMeta('keywords', keywords.join(', '));
        } else {
            updateMeta('keywords', '');
        }

        // 4. Canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        const canonicalUrl = pageData[`aboutSeoCanonicalUrl_${langKey}`];
        if (canonicalUrl) {
            canonicalLink.setAttribute('href', canonicalUrl);
        } else {
            canonicalLink.remove();
        }

        // 5. Open Graph Tags
        const ogTitle = pageData[`aboutSeoOgTitle_${langKey}`] || metaTitle;
        const ogDesc = pageData[`aboutSeoOgDescription_${langKey}`] || metaDesc;

        updateMeta('og:title', ogTitle, 'property');
        updateMeta('og:description', ogDesc, 'property');
        updateMeta('og:type', 'website', 'property');

        // OG Images (Handle array)
        const oldOgImages = document.querySelectorAll('meta[property="og:image"]');
        oldOgImages.forEach(el => el.remove());

        const ogImages = pageData.aboutSeoOgImages || [];
        if (Array.isArray(ogImages) && ogImages.length > 0) {
            ogImages.forEach(imgUrl => {
                const el = document.createElement('meta');
                el.setAttribute('property', 'og:image');
                el.setAttribute('content', imgUrl);
                document.head.appendChild(el);
            });
        }

        // 6. Robots / Indexing
        const allowIndexing = pageData.aboutSeoAllowIndexing !== false; // Default true
        updateMeta('robots', allowIndexing ? 'index, follow' : 'noindex, nofollow');

    }, [pageData, language]);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await getAboutPage();
                if (response.data?.success && response.data?.data) {
                    setPageData(response.data.data);
                } else {
                    setPageData(response.data);
                }
            } catch (error) {
                console.error("Error fetching About Page data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <SmoothScroll />
            <Header />
            <AboutBanner data={pageData} />
            <AboutOverview data={pageData} />
            <AboutMissionVission data={pageData} />
            <AboutHistory data={pageData} />
            <AboutWhyChoose data={pageData} />
            <AboutBuyProcess data={pageData} />
            <AboutFindProperty data={pageData} />
            <AboutAgent data={pageData} />
            <Footer />
        </div>
    );
}