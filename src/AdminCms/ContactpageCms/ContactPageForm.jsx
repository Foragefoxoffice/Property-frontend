import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getContactPage,
    createContactPage,
    updateContactPage,
} from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import ContactPageBannerForm from './ContactPageBannerForm';
import ContactPageReachOutForm from './ContactPageReachOutForm';
import ContactMapLink from './ContactMapLink';
import ContactPageSeoForm from './ContactPageSeoForm';
import { validateVietnameseFields } from '@/utils/formValidation';
import { useLanguage } from '../../Language/LanguageContext';

export default function ContactPageForm() {
    const [bannerForm] = Form.useForm();
    const [reachOutForm] = Form.useForm();
    const [mapForm] = Form.useForm();
    const [seoForm] = Form.useForm();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();
    const headerLang = language === 'vi' ? 'vn' : 'en';

    // Accordion state
    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        reachOut: false,
        map: false,
        seo: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            reachOut: key === 'reachOut' ? !prev.reachOut : false,
            map: key === 'map' ? !prev.map : false,
            seo: key === 'seo' ? !prev.seo : false,
        }));
    };

    const [bannerLoading, setBannerLoading] = useState(false);
    const [reachOutLoading, setReachOutLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);

    // Helper to get preserved data
    const getPreservedData = (data) => {
        if (!data) return {};
        return {
            // Banner
            contactBannerTitle_en: data.contactBannerTitle_en,
            contactBannerTitle_vn: data.contactBannerTitle_vn,
            contactBannerBg: data.contactBannerBg,
            // Reach Out
            contactReachOutTitle_en: data.contactReachOutTitle_en,
            contactReachOutTitle_vn: data.contactReachOutTitle_vn,
            contactReachOutDescription_en: data.contactReachOutDescription_en,
            contactReachOutDescription_vn: data.contactReachOutDescription_vn,
            contactReachOutAddressHead_en: data.contactReachOutAddressHead_en,
            contactReachOutAddressHead_vn: data.contactReachOutAddressHead_vn,
            contactReachOutAddressContent_en: data.contactReachOutAddressContent_en,
            contactReachOutAddressContent_vn: data.contactReachOutAddressContent_vn,
            contactReachOutNumberHead_en: data.contactReachOutNumberHead_en,
            contactReachOutNumberHead_vn: data.contactReachOutNumberHead_vn,
            contactReachOutNumberContent: data.contactReachOutNumberContent,
            contactReachOutEmailHead_en: data.contactReachOutEmailHead_en,
            contactReachOutEmailHead_vn: data.contactReachOutEmailHead_vn,
            contactReachOutEmailContent: data.contactReachOutEmailContent,
            contactReachOutFollowTitle_en: data.contactReachOutFollowTitle_en,
            contactReachOutFollowTitle_vn: data.contactReachOutFollowTitle_vn,
            contactReachOutSocialIcons: data.contactReachOutSocialIcons,
            contactReachOutGetinTitle_en: data.contactReachOutGetinTitle_en,
            contactReachOutGetinTitle_vn: data.contactReachOutGetinTitle_vn,
            contactReachOutGetinDescription_en: data.contactReachOutGetinDescription_en,
            contactReachOutGetinDescription_vn: data.contactReachOutGetinDescription_vn,
            // Map
            contactMapIframe: data.contactMapIframe,
            // SEO
            contactSeoMetaTitle_en: data.contactSeoMetaTitle_en,
            contactSeoMetaTitle_vn: data.contactSeoMetaTitle_vn,
            contactSeoMetaDescription_en: data.contactSeoMetaDescription_en,
            contactSeoMetaDescription_vn: data.contactSeoMetaDescription_vn,
            contactSeoMetaKeywords_en: data.contactSeoMetaKeywords_en,
            contactSeoMetaKeywords_vn: data.contactSeoMetaKeywords_vn,
            contactSeoSlugUrl_en: data.contactSeoSlugUrl_en,
            contactSeoSlugUrl_vn: data.contactSeoSlugUrl_vn,
            contactSeoCanonicalUrl_en: data.contactSeoCanonicalUrl_en,
            contactSeoCanonicalUrl_vn: data.contactSeoCanonicalUrl_vn,
            contactSeoSchemaType_en: data.contactSeoSchemaType_en,
            contactSeoSchemaType_vn: data.contactSeoSchemaType_vn,
            contactSeoOgTitle_en: data.contactSeoOgTitle_en,
            contactSeoOgTitle_vn: data.contactSeoOgTitle_vn,
            contactSeoOgDescription_en: data.contactSeoOgDescription_en,
            contactSeoOgDescription_vn: data.contactSeoOgDescription_vn,
            contactSeoAllowIndexing: data.contactSeoAllowIndexing,
            contactSeoOgImages: data.contactSeoOgImages,
        };
    };

    // Fetch the contact page data
    const fetchPageData = async () => {
        try {
            setLoading(true);
            const response = await getContactPage();
            const page = response.data.data;

            if (page) {
                setPageData(page);

                // Set Banner Form
                bannerForm.setFieldsValue({
                    contactBannerTitle_en: page.contactBannerTitle_en,
                    contactBannerTitle_vn: page.contactBannerTitle_vn,
                    contactBannerBg: page.contactBannerBg,
                });

                // Set Reach Out Form
                reachOutForm.setFieldsValue({
                    contactReachOutTitle_en: page.contactReachOutTitle_en,
                    contactReachOutTitle_vn: page.contactReachOutTitle_vn,
                    contactReachOutDescription_en: page.contactReachOutDescription_en,
                    contactReachOutDescription_vn: page.contactReachOutDescription_vn,
                    contactReachOutAddressHead_en: page.contactReachOutAddressHead_en,
                    contactReachOutAddressHead_vn: page.contactReachOutAddressHead_vn,
                    contactReachOutAddressContent_en: page.contactReachOutAddressContent_en,
                    contactReachOutAddressContent_vn: page.contactReachOutAddressContent_vn,
                    contactReachOutNumberHead_en: page.contactReachOutNumberHead_en,
                    contactReachOutNumberHead_vn: page.contactReachOutNumberHead_vn,
                    contactReachOutNumberContent: Array.isArray(page.contactReachOutNumberContent)
                        ? page.contactReachOutNumberContent
                        : (page.contactReachOutNumberContent ? [page.contactReachOutNumberContent] : []),
                    contactReachOutEmailHead_en: page.contactReachOutEmailHead_en,
                    contactReachOutEmailHead_vn: page.contactReachOutEmailHead_vn,
                    contactReachOutEmailContent: Array.isArray(page.contactReachOutEmailContent)
                        ? page.contactReachOutEmailContent
                        : (page.contactReachOutEmailContent ? [page.contactReachOutEmailContent] : []),
                    contactReachOutFollowTitle_en: page.contactReachOutFollowTitle_en,
                    contactReachOutFollowTitle_vn: page.contactReachOutFollowTitle_vn,
                    contactReachOutSocialIcons: page.contactReachOutSocialIcons || [],
                    contactReachOutGetinTitle_en: page.contactReachOutGetinTitle_en,
                    contactReachOutGetinTitle_vn: page.contactReachOutGetinTitle_vn,
                    contactReachOutGetinDescription_en: page.contactReachOutGetinDescription_en,
                    contactReachOutGetinDescription_vn: page.contactReachOutGetinDescription_vn,
                });

                // Set Map Form
                mapForm.setFieldsValue({
                    contactMapIframe: page.contactMapIframe,
                });

                // Set SEO Form
                seoForm.setFieldsValue({
                    contactSeoMetaTitle_en: page.contactSeoMetaTitle_en,
                    contactSeoMetaTitle_vn: page.contactSeoMetaTitle_vn,
                    contactSeoMetaDescription_en: page.contactSeoMetaDescription_en,
                    contactSeoMetaDescription_vn: page.contactSeoMetaDescription_vn,
                    contactSeoMetaKeywords_en: page.contactSeoMetaKeywords_en || [],
                    contactSeoMetaKeywords_vn: page.contactSeoMetaKeywords_vn || [],
                    contactSeoSlugUrl_en: page.contactSeoSlugUrl_en,
                    contactSeoSlugUrl_vn: page.contactSeoSlugUrl_vn,
                    contactSeoCanonicalUrl_en: page.contactSeoCanonicalUrl_en,
                    contactSeoCanonicalUrl_vn: page.contactSeoCanonicalUrl_vn,
                    contactSeoSchemaType_en: page.contactSeoSchemaType_en,
                    contactSeoSchemaType_vn: page.contactSeoSchemaType_vn,
                    contactSeoOgTitle_en: page.contactSeoOgTitle_en,
                    contactSeoOgTitle_vn: page.contactSeoOgTitle_vn,
                    contactSeoOgDescription_en: page.contactSeoOgDescription_en,
                    contactSeoOgDescription_vn: page.contactSeoOgDescription_vn,
                    contactSeoAllowIndexing: page.contactSeoAllowIndexing,
                });
            } else {
                setPageData(null);
                bannerForm.resetFields();
                reachOutForm.resetFields();
                mapForm.resetFields();
                seoForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                reachOutForm.resetFields();
                mapForm.resetFields();
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

            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateContactPage(pageData._id, finalPayload);
                CommonToaster('Banner section updated successfully!', 'success');
            } else {
                await createContactPage(finalPayload);
                CommonToaster('Contact page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
            console.error(error);
        } finally {
            setBannerLoading(false);
        }
    };

    // Handle Reach Out form submission
    const handleReachOutSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setReachOutLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateContactPage(pageData._id, finalPayload);
                CommonToaster('Reach Out section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createContactPage({ ...finalPayload, ...bannerValues });
                CommonToaster('Contact page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save reach out section', 'error');
                console.error(error);
            }
        } finally {
            setReachOutLoading(false);
        }
    };

    // Handle Map form submission
    const handleMapSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setMapLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateContactPage(pageData._id, finalPayload);
                CommonToaster('Map section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createContactPage({ ...finalPayload, ...bannerValues });
                CommonToaster('Contact page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save map section', 'error');
                console.error(error);
            }
        } finally {
            setMapLoading(false);
        }
    };

    // Handle SEO form submission
    const handleSeoSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setSeoLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateContactPage(pageData._id, finalPayload);
                CommonToaster('SEO section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createContactPage({ ...finalPayload, ...bannerValues });
                CommonToaster('Contact page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save SEO section', 'error');
                console.error(error);
            }
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
                {headerLang === 'en' ? 'Contact Us Page Sections' : 'Các Phần Trang Liên Hệ'}
            </h2>

            <div className="space-y-6">
                {/* Banner Section */}
                <ContactPageBannerForm
                    form={bannerForm}
                    onSubmit={handleBannerSubmit}
                    loading={bannerLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.banner}
                    onToggle={() => toggleAccordion('banner')}
                    headerLang={headerLang}
                />

                {/* Reach Out Section */}
                <ContactPageReachOutForm
                    form={reachOutForm}
                    onSubmit={handleReachOutSubmit}
                    loading={reachOutLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.reachOut}
                    onToggle={() => toggleAccordion('reachOut')}
                    headerLang={headerLang}
                />

                {/* Map Section */}
                <ContactMapLink
                    form={mapForm}
                    onSubmit={handleMapSubmit}
                    loading={mapLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.map}
                    onToggle={() => toggleAccordion('map')}
                    headerLang={headerLang}
                />

                {/* SEO Section */}
                <ContactPageSeoForm
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
