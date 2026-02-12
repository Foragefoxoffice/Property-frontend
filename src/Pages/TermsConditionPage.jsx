import { useState, useEffect } from 'react';
import { getTermsConditionsPage } from '../Api/action';
import TermsConditionBanner from '../components/TermsConditions/TermsConditionBanner';
import { useLanguage } from '../Language/LanguageContext';
import Footer from '@/Admin/Footer/Footer';
import Header from '@/Admin/Header/Header';
import { Spin } from 'antd';

export default function TermsConditionPage() {
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
        const metaTitle = pageData[`termsConditionSeoMetaTitle_${langKey}`] ||
            (langKey === 'en' ? 'Terms & Conditions' : 'Điều Khoản & Điều Kiện');

        if (metaTitle) {
            document.title = metaTitle;
        }

        // 2. Meta Description
        const metaDesc = pageData[`termsConditionSeoMetaDescription_${langKey}`] || '';
        updateMeta('description', metaDesc);

        // 3. Keywords
        const keywords = pageData[`termsConditionSeoMetaKeywords_${langKey}`];
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
        const canonicalUrl = pageData[`termsConditionSeoCanonicalUrl_${langKey}`];
        if (canonicalUrl) {
            canonicalLink.setAttribute('href', canonicalUrl);
        } else {
            canonicalLink.remove();
        }

        // 5. Open Graph Tags
        const ogTitle = pageData[`termsConditionSeoOgTitle_${langKey}`] || metaTitle;
        const ogDesc = pageData[`termsConditionSeoOgDescription_${langKey}`] || metaDesc;

        updateMeta('og:title', ogTitle, 'property');
        updateMeta('og:description', ogDesc, 'property');
        updateMeta('og:type', 'website', 'property');
        updateMeta('og:url', window.location.href, 'property');

        // OG Images (Handle array) - Ensure absolute URLs
        const oldOgImages = document.querySelectorAll('meta[property="og:image"]');
        oldOgImages.forEach(el => el.remove());

        const ogImages = pageData.termsConditionSeoOgImages || [];
        if (Array.isArray(ogImages) && ogImages.length > 0) {
            ogImages.forEach(imgUrl => {
                if (!imgUrl) return;

                // Fix Legacy Filenames
                let rawUrl = imgUrl;
                if (!imgUrl.includes('/') && !imgUrl.startsWith('http')) {
                    rawUrl = `/uploads/termsconditionspage/${imgUrl}`;
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
        const allowIndexing = pageData.termsConditionSeoAllowIndexing !== false; // Default true
        updateMeta('robots', allowIndexing ? 'index, follow' : 'noindex, nofollow');

    }, [pageData, language]);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await getTermsConditionsPage();
                if (response.data && response.data.data) {
                    setPageData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch Terms & Conditions page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    const contentTitle = language === 'en'
        ? pageData?.termsConditionContentTitle_en
        : pageData?.termsConditionContentTitle_vn;

    const contentBody = language === 'en'
        ? pageData?.termsConditionContent_en
        : pageData?.termsConditionContent_vn;

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Banner Section */}
                <TermsConditionBanner data={pageData} />

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {contentTitle && (
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4 border-gray-200">
                            {contentTitle}
                        </h2>
                    )}

                    {contentBody && (
                        <div
                            className="prose prose-lg max-w-none text-gray-600 font-['Manrope'] prose-headings:font-bold prose-headings:text-gray-800 prose-a:text-[#41398B] prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: contentBody }}
                        />
                    )}

                    {!contentBody && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            {language === 'en' ? 'No content available.' : 'Chưa có nội dung.'}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}