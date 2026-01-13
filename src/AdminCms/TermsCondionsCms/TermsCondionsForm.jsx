import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getTermsConditionsPage,
    updateTermsConditionsPage,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { validateVietnameseFields } from '@/utils/formValidation';
import { CommonToaster } from '@/Common/CommonToaster';
import TermsCondionsBannerForm from './TermsCondionsBannerForm';
import TermsCondionsContentForm from './TermsCondionsContentForm';
import TermsCondionsSeoForm from './TermsCondionsSeoForm';

export default function TermsCondionsForm() {
    const [bannerForm] = Form.useForm();
    const [contentForm] = Form.useForm();
    const [seoForm] = Form.useForm();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);
    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        content: false,
        seo: false
    });

    const { language } = useLanguage();
    const headerLang = language === 'vi' ? 'vn' : 'en';

    // Toggle accordion
    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Fetch page data
    const fetchPageData = async () => {
        try {
            setLoading(true);
            const response = await getTermsConditionsPage();
            const page = response.data.data;

            if (page) {
                setPageData(page);
                // Set Banner Form
                bannerForm.setFieldsValue({
                    termsConditionBannerTitle_en: page.termsConditionBannerTitle_en,
                    termsConditionBannerTitle_vn: page.termsConditionBannerTitle_vn,
                    termsConditionBannerImage: page.termsConditionBannerImage,
                });
                // Set Content Form
                contentForm.setFieldsValue({
                    termsConditionContentTitle_en: page.termsConditionContentTitle_en,
                    termsConditionContentTitle_vn: page.termsConditionContentTitle_vn,
                    termsConditionContent_en: page.termsConditionContent_en,
                    termsConditionContent_vn: page.termsConditionContent_vn,
                });
                // Set SEO Form
                seoForm.setFieldsValue({
                    // EN
                    termsConditionSeoMetaTitle_en: page.termsConditionSeoMetaTitle_en,
                    termsConditionSeoMetaDescription_en: page.termsConditionSeoMetaDescription_en,
                    termsConditionSeoMetaKeywords_en: page.termsConditionSeoMetaKeywords_en,
                    termsConditionSeoSlugUrl_en: page.termsConditionSeoSlugUrl_en,
                    termsConditionSeoCanonicalUrl_en: page.termsConditionSeoCanonicalUrl_en,
                    termsConditionSeoSchemaType_en: page.termsConditionSeoSchemaType_en,
                    termsConditionSeoOgTitle_en: page.termsConditionSeoOgTitle_en,
                    termsConditionSeoOgDescription_en: page.termsConditionSeoOgDescription_en,
                    // VN
                    termsConditionSeoMetaTitle_vn: page.termsConditionSeoMetaTitle_vn,
                    termsConditionSeoMetaDescription_vn: page.termsConditionSeoMetaDescription_vn,
                    termsConditionSeoMetaKeywords_vn: page.termsConditionSeoMetaKeywords_vn,
                    termsConditionSeoSlugUrl_vn: page.termsConditionSeoSlugUrl_vn,
                    termsConditionSeoCanonicalUrl_vn: page.termsConditionSeoCanonicalUrl_vn,
                    termsConditionSeoSchemaType_vn: page.termsConditionSeoSchemaType_vn,
                    termsConditionSeoOgTitle_vn: page.termsConditionSeoOgTitle_vn,
                    termsConditionSeoOgDescription_vn: page.termsConditionSeoOgDescription_vn,
                    // Common
                    termsConditionSeoAllowIndexing: page.termsConditionSeoAllowIndexing,
                    termsConditionSeoOgImages: page.termsConditionSeoOgImages,
                });
            } else {
                setPageData(null);
                bannerForm.resetFields();
                contentForm.resetFields();
                seoForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                contentForm.resetFields();
                seoForm.resetFields();
            } else {
                CommonToaster('Failed to fetch page data', 'error');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, []);

    // Handle Banner form submission
    const handleBannerSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setBannerLoading(true);

            // Merge with existing data
            const finalPayload = {
                ...pageData, // Preserve other fields if any
                ...values
            };

            await updateTermsConditionsPage(finalPayload);
            CommonToaster(
                headerLang === 'vn'
                    ? 'Cập nhật banner thành công!'
                    : 'Banner section updated successfully!',
                'success'
            );

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
            console.error(error);
        } finally {
            setBannerLoading(false);
        }
    };

    // Handle Content form submission
    const handleContentSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setContentLoading(true);

            // Merge with existing data
            const finalPayload = {
                ...pageData,
                ...values
            };

            await updateTermsConditionsPage(finalPayload);
            CommonToaster(
                headerLang === 'vn'
                    ? 'Cập nhật nội dung thành công!'
                    : 'Content section updated successfully!',
                'success'
            );

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save content section', 'error');
            console.error(error);
        } finally {
            setContentLoading(false);
        }
    };

    // Handle SEO form submission
    const handleSeoSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setSeoLoading(true);

            // Merge with existing data
            const finalPayload = {
                ...pageData,
                ...values
            };

            await updateTermsConditionsPage(finalPayload);
            CommonToaster(
                headerLang === 'vn'
                    ? 'Cập nhật SEO thành công!'
                    : 'SEO settings updated successfully!',
                'success'
            );

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save SEO settings', 'error');
            console.error(error);
        } finally {
            setSeoLoading(false);
        }
    };

    if (loading && !pageData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                    <Spin size="large" />
                </ConfigProvider>
            </div>
        );
    }

    return (
        <div className="">
            <h2 style={{
                color: '#111827',
                fontSize: '36px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '18px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                {headerLang === 'en' ? 'Terms and Conditions Page' : 'Trang Điều Khoản & Điều Kiện'}
            </h2>

            <div className="space-y-6">
                {/* Banner Section */}
                <TermsCondionsBannerForm
                    form={bannerForm}
                    onSubmit={handleBannerSubmit}
                    loading={bannerLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.banner}
                    onToggle={() => toggleAccordion('banner')}
                    headerLang={headerLang}
                />

                {/* Content Section */}
                <TermsCondionsContentForm
                    form={contentForm}
                    onSubmit={handleContentSubmit}
                    loading={contentLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.content}
                    onToggle={() => toggleAccordion('content')}
                    headerLang={headerLang}
                />

                {/* SEO Section */}
                <TermsCondionsSeoForm
                    form={seoForm}
                    onSubmit={handleSeoSubmit}
                    loading={seoLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.seo}
                    onToggle={() => toggleAccordion('seo')}
                    headerLang={headerLang}
                />
            </div>
        </div>
    );
}