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