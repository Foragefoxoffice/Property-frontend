import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getPrivacyPolicyPage,
    updatePrivacyPolicyPage,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { validateVietnameseFields } from '@/utils/formValidation';
import { CommonToaster } from '@/Common/CommonToaster';
import PrivacyPolicyBannerForm from './PrivacyPolicyBannerForm';
import PrivacyPolicyContentForm from './PrivacyPolicyContentForm';
import PrivacyPolicySeoForm from './PrivacyPolicySeoForm';

export default function PrivacyPolicyForm() {
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
            const response = await getPrivacyPolicyPage();
            const page = response.data.data;

            if (page) {
                setPageData(page);
                // Set Banner Form
                bannerForm.setFieldsValue({
                    privacyPolicyBannerTitle_en: page.privacyPolicyBannerTitle_en,
                    privacyPolicyBannerTitle_vn: page.privacyPolicyBannerTitle_vn,
                    privacyPolicyBannerImage: page.privacyPolicyBannerImage,
                });
                // Set Content Form
                contentForm.setFieldsValue({
                    privacyPolicyContentTitle_en: page.privacyPolicyContentTitle_en,
                    privacyPolicyContentTitle_vn: page.privacyPolicyContentTitle_vn,
                    privacyPolicyContent_en: page.privacyPolicyContent_en,
                    privacyPolicyContent_vn: page.privacyPolicyContent_vn,
                });
                // Set SEO Form
                seoForm.setFieldsValue({
                    // EN
                    privacyPolicySeoMetaTitle_en: page.privacyPolicySeoMetaTitle_en,
                    privacyPolicySeoMetaDescription_en: page.privacyPolicySeoMetaDescription_en,
                    privacyPolicySeoMetaKeywords_en: page.privacyPolicySeoMetaKeywords_en,
                    privacyPolicySeoSlugUrl_en: page.privacyPolicySeoSlugUrl_en,
                    privacyPolicySeoCanonicalUrl_en: page.privacyPolicySeoCanonicalUrl_en,
                    privacyPolicySeoSchemaType_en: page.privacyPolicySeoSchemaType_en,
                    privacyPolicySeoOgTitle_en: page.privacyPolicySeoOgTitle_en,
                    privacyPolicySeoOgDescription_en: page.privacyPolicySeoOgDescription_en,
                    // VN
                    privacyPolicySeoMetaTitle_vn: page.privacyPolicySeoMetaTitle_vn,
                    privacyPolicySeoMetaDescription_vn: page.privacyPolicySeoMetaDescription_vn,
                    privacyPolicySeoMetaKeywords_vn: page.privacyPolicySeoMetaKeywords_vn,
                    privacyPolicySeoSlugUrl_vn: page.privacyPolicySeoSlugUrl_vn,
                    privacyPolicySeoCanonicalUrl_vn: page.privacyPolicySeoCanonicalUrl_vn,
                    privacyPolicySeoSchemaType_vn: page.privacyPolicySeoSchemaType_vn,
                    privacyPolicySeoOgTitle_vn: page.privacyPolicySeoOgTitle_vn,
                    privacyPolicySeoOgDescription_vn: page.privacyPolicySeoOgDescription_vn,
                    // Common
                    privacyPolicySeoAllowIndexing: page.privacyPolicySeoAllowIndexing,
                    privacyPolicySeoOgImages: page.privacyPolicySeoOgImages,
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

            await updatePrivacyPolicyPage(finalPayload);
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

            await updatePrivacyPolicyPage(finalPayload);
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

            await updatePrivacyPolicyPage(finalPayload);
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
                {headerLang === 'en' ? 'Privacy Policy Page' : 'Trang Chính Sách Bảo Mật'}
            </h2>

            <div className="space-y-6">
                {/* Banner Section */}
                <PrivacyPolicyBannerForm
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
                <PrivacyPolicyContentForm
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
                <PrivacyPolicySeoForm
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