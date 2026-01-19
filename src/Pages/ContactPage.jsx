import { useEffect, useState } from "react";
import { getContactPage } from "../Api/action";
import ContactBanner from "../components/Contact/ContactBanner";
import ContactReachForm from "../components/Contact/ContactReachForm";
import ContactMap from "../components/Contact/ContactMap";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader/Loader";
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";
import { useLanguage } from "@/Language/LanguageContext";

export default function ContactPage() {
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
        const metaTitle = pageData[`contactSeoMetaTitle_${langKey}`] ||
            (langKey === 'en' ? 'Contact Us' : 'Liên Hệ');

        if (metaTitle) {
            document.title = metaTitle;
        }

        // 2. Meta Description
        const metaDesc = pageData[`contactSeoMetaDescription_${langKey}`] || '';
        updateMeta('description', metaDesc);

        // 3. Keywords
        const keywords = pageData[`contactSeoMetaKeywords_${langKey}`];
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
        const canonicalUrl = pageData[`contactSeoCanonicalUrl_${langKey}`];
        if (canonicalUrl) {
            canonicalLink.setAttribute('href', canonicalUrl);
        } else {
            canonicalLink.remove();
        }

        // 5. Open Graph Tags
        const ogTitle = pageData[`contactSeoOgTitle_${langKey}`] || metaTitle;
        const ogDesc = pageData[`contactSeoOgDescription_${langKey}`] || metaDesc;

        updateMeta('og:title', ogTitle, 'property');
        updateMeta('og:description', ogDesc, 'property');
        updateMeta('og:type', 'website', 'property');
        updateMeta('og:url', window.location.href, 'property');

        // OG Images (Handle array) - Ensure absolute URLs
        const oldOgImages = document.querySelectorAll('meta[property="og:image"]');
        oldOgImages.forEach(el => el.remove());

        const ogImages = pageData.contactSeoOgImages || [];
        if (Array.isArray(ogImages) && ogImages.length > 0) {
            ogImages.forEach(imgUrl => {
                if (!imgUrl) return;

                // Fix Legacy Filenames
                let rawUrl = imgUrl;
                if (!imgUrl.includes('/') && !imgUrl.startsWith('http')) {
                    rawUrl = `/uploads/contactpage/${imgUrl}`;
                }

                // Ensure absolute URL for social sharing
                const absoluteUrl = rawUrl.startsWith('http')
                    ? rawUrl
                    : `${window.location.origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

                const el = document.createElement('meta');
                el.setAttribute('property', 'og:image');
                el.setAttribute('content', absoluteUrl);
                document.head.appendChild(el);
            });
        }

        // 6. Twitter Card Tags
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', ogTitle);
        updateMeta('twitter:description', ogDesc);
        updateMeta('twitter:url', window.location.href);

        // Twitter image (use first OG image if available)
        if (Array.isArray(ogImages) && ogImages.length > 0 && ogImages[0]) {
            const absoluteUrl = ogImages[0].startsWith('http')
                ? ogImages[0]
                : `${window.location.origin}${ogImages[0].startsWith('/') ? '' : '/'}${ogImages[0]}`;
            updateMeta('twitter:image', absoluteUrl);
        }

        // 7. Robots / Indexing
        const allowIndexing = pageData.contactSeoAllowIndexing !== false; // Default true
        updateMeta('robots', allowIndexing ? 'index, follow' : 'noindex, nofollow');

    }, [pageData, language]);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await getContactPage();
                if (response.data?.success && response.data?.data) {
                    setPageData(response.data.data);
                } else {
                    setPageData(response.data);
                }
            } catch (error) {
                console.error("Error fetching Contact Page data:", error);
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
            <ContactBanner data={pageData} />
            <ContactReachForm data={pageData} />
            <ContactMap data={pageData} />
            <Footer />
        </div>
    );
}