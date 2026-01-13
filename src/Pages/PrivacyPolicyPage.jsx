import { useState, useEffect } from 'react';
import { getPrivacyPolicyPage } from '../Api/action';
import PrivacyPolicyBanner from '../components/PrivacyPolicy/PrivacyPolicyBanner';
import { useLanguage } from '../Language/LanguageContext';
import Footer from '@/Admin/Footer/Footer';
import Header from '@/Admin/Header/Header';
import { Spin } from 'antd';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicyPage() {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await getPrivacyPolicyPage();
                if (response.data && response.data.data) {
                    setPageData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch Privacy Policy page data:', error);
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
        ? pageData?.privacyPolicyContentTitle_en
        : pageData?.privacyPolicyContentTitle_vn;

    const contentBody = language === 'en'
        ? pageData?.privacyPolicyContent_en
        : pageData?.privacyPolicyContent_vn;

    // SEO Meta Data
    const metaTitle = language === 'en' ? pageData?.privacyPolicySeoMetaTitle_en : pageData?.privacyPolicySeoMetaTitle_vn;
    const metaDescription = language === 'en' ? pageData?.privacyPolicySeoMetaDescription_en : pageData?.privacyPolicySeoMetaDescription_vn;
    const metaKeywords = language === 'en' ? pageData?.privacyPolicySeoMetaKeywords_en : pageData?.privacyPolicySeoMetaKeywords_vn;
    const canonicalUrl = language === 'en' ? pageData?.privacyPolicySeoCanonicalUrl_en : pageData?.privacyPolicySeoCanonicalUrl_vn;
    const ogTitle = language === 'en' ? pageData?.privacyPolicySeoOgTitle_en : pageData?.privacyPolicySeoOgTitle_vn;
    const ogDescription = language === 'en' ? pageData?.privacyPolicySeoOgDescription_en : pageData?.privacyPolicySeoOgDescription_vn;
    const ogImages = pageData?.privacyPolicySeoOgImages || [];

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Helmet>
                {metaTitle && <title>{metaTitle}</title>}
                {metaDescription && <meta name="description" content={metaDescription} />}
                {metaKeywords && <meta name="keywords" content={Array.isArray(metaKeywords) ? metaKeywords.join(', ') : metaKeywords} />}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                {/* OG Tags */}
                {ogTitle && <meta property="og:title" content={ogTitle} />}
                {ogDescription && <meta property="og:description" content={ogDescription} />}
                {ogImages.length > 0 && <meta property="og:image" content={ogImages[0]} />}
            </Helmet>

            <Header />

            <main className="flex-grow">
                {/* Banner Section */}
                <PrivacyPolicyBanner data={pageData} />

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {contentTitle && (
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4 border-gray-200">
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
