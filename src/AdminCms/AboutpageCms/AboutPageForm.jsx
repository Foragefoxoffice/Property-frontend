import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getAboutPage,
    createAboutPage,
    updateAboutPage,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { CommonToaster } from '@/Common/CommonToaster';
import AboutPageBannerForm from './AboutPageBannerForm';
import AboutPageHistoryForm from './AboutPageHistoryForm';
import AboutPageBuyingForm from './AboutPageBuyingForm';
import AboutPageWhyChooseForm from './AboutPageWhyChooseForm';
import AboutPageVisionMissionForm from './AboutPageVisionMissionForm';
import AboutPageFindPropertyForm from './AboutPageFindPropertyForm';
import AboutAgentForm from './AboutAgentForm';
import AboutOverviewForm from './AboutOverviewForm';
import AboutPageSeoForm from './AboutPageSeoForm';
import { validateVietnameseFields } from '@/utils/formValidation';

export default function AboutPageForm() {
    const [bannerForm] = Form.useForm();
    const [historyForm] = Form.useForm();
    const [buyingForm] = Form.useForm();
    const [whyChooseForm] = Form.useForm();
    const [visionMissionForm] = Form.useForm();
    const [agentForm] = Form.useForm();
    const [overviewForm] = Form.useForm();
    const [findForm] = Form.useForm();
    const [seoForm] = Form.useForm();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Accordion state
    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        history: false,
        buying: false,
        whyChoose: false,
        visionMission: false,
        agent: false,
        overview: false,
        find: false,
        seo: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            history: key === 'history' ? !prev.history : false,
            buying: key === 'buying' ? !prev.buying : false,
            whyChoose: key === 'whyChoose' ? !prev.whyChoose : false,
            visionMission: key === 'visionMission' ? !prev.visionMission : false,
            agent: key === 'agent' ? !prev.agent : false,
            overview: key === 'overview' ? !prev.overview : false,
            find: key === 'find' ? !prev.find : false,
            seo: key === 'seo' ? !prev.seo : false,
        }));
    };

    const [bannerLoading, setBannerLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [buyingLoading, setBuyingLoading] = useState(false);
    const [whyChooseLoading, setWhyChooseLoading] = useState(false);
    const [visionMissionLoading, setVisionMissionLoading] = useState(false);
    const [agentLoading, setAgentLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [findLoading, setFindLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);

    const { language } = useLanguage();
    const headerLang = language === 'vi' ? 'vn' : 'en';

    // Helper to get preserved data
    const getPreservedData = (data) => {
        if (!data) return {};
        return {
            // Banner
            aboutBannerTitle_en: data.aboutBannerTitle_en,
            aboutBannerTitle_vn: data.aboutBannerTitle_vn,
            aboutBannerBg: data.aboutBannerBg,
            // History
            aboutHistoryTitle_en: data.aboutHistoryTitle_en,
            aboutHistoryTitle_vn: data.aboutHistoryTitle_vn,
            aboutHistoryDescription_en: data.aboutHistoryDescription_en,
            aboutHistoryDescription_vn: data.aboutHistoryDescription_vn,
            aboutHistoryTimeline: data.aboutHistoryTimeline,
            // Buying
            aboutBuyingTitle_en: data.aboutBuyingTitle_en,
            aboutBuyingTitle_vn: data.aboutBuyingTitle_vn,
            aboutBuyingDescription_en: data.aboutBuyingDescription_en,
            aboutBuyingDescription_vn: data.aboutBuyingDescription_vn,
            aboutBuyingSteps: data.aboutBuyingSteps,
            // Why Choose
            aboutWhyChooseTitle_en: data.aboutWhyChooseTitle_en,
            aboutWhyChooseTitle_vn: data.aboutWhyChooseTitle_vn,
            aboutWhyChooseDescription_en: data.aboutWhyChooseDescription_en,
            aboutWhyChooseDescription_vn: data.aboutWhyChooseDescription_vn,
            aboutWhyChooseButtonText_en: data.aboutWhyChooseButtonText_en,
            aboutWhyChooseButtonText_vn: data.aboutWhyChooseButtonText_vn,
            aboutWhyChooseButtonLink: data.aboutWhyChooseButtonLink,
            aboutWhyChooseBoxes: data.aboutWhyChooseBoxes,
            // Vision Mission
            aboutVisionTitle_en: data.aboutVisionTitle_en,
            aboutVisionTitle_vn: data.aboutVisionTitle_vn,
            aboutVisionDescription_en: data.aboutVisionDescription_en,
            aboutVisionDescription_vn: data.aboutVisionDescription_vn,
            aboutMissionTitle_en: data.aboutMissionTitle_en,
            aboutMissionTitle_vn: data.aboutMissionTitle_vn,
            aboutMissionDescription_en: data.aboutMissionDescription_en,
            aboutMissionDescription_vn: data.aboutMissionDescription_vn,
            // Agent
            aboutAgentTitle_en: data.aboutAgentTitle_en,
            aboutAgentTitle_vn: data.aboutAgentTitle_vn,
            aboutAgentSubTitle_en: data.aboutAgentSubTitle_en,
            aboutAgentSubTitle_vn: data.aboutAgentSubTitle_vn,
            aboutAgentDescription_en: data.aboutAgentDescription_en,
            aboutAgentDescription_vn: data.aboutAgentDescription_vn,
            aboutAgentContent_en: data.aboutAgentContent_en,
            aboutAgentContent_vn: data.aboutAgentContent_vn,
            aboutAgentButtonText_en: data.aboutAgentButtonText_en,
            aboutAgentButtonText_vn: data.aboutAgentButtonText_vn,
            aboutAgentButtonLink: data.aboutAgentButtonLink,
            aboutAgentImage: data.aboutAgentImage,
            // Overview
            aboutOverviewTitle_en: data.aboutOverviewTitle_en,
            aboutOverviewTitle_vn: data.aboutOverviewTitle_vn,
            aboutOverviewDescription_en: data.aboutOverviewDescription_en,
            aboutOverviewDescription_vn: data.aboutOverviewDescription_vn,
            aboutOverviewBg: data.aboutOverviewBg,
            // Find Property
            aboutFindTitle_en: data.aboutFindTitle_en,
            aboutFindTitle_vn: data.aboutFindTitle_vn,
            aboutFindDescription_en: data.aboutFindDescription_en,
            aboutFindDescription_vn: data.aboutFindDescription_vn,
            aboutFindBg: data.aboutFindBg,
            // SEO
            aboutSeoMetaTitle_en: data.aboutSeoMetaTitle_en,
            aboutSeoMetaTitle_vn: data.aboutSeoMetaTitle_vn,
            aboutSeoMetaDescription_en: data.aboutSeoMetaDescription_en,
            aboutSeoMetaDescription_vn: data.aboutSeoMetaDescription_vn,
            aboutSeoMetaKeywords_en: data.aboutSeoMetaKeywords_en,
            aboutSeoMetaKeywords_vn: data.aboutSeoMetaKeywords_vn,
            aboutSeoSlugUrl_en: data.aboutSeoSlugUrl_en,
            aboutSeoSlugUrl_vn: data.aboutSeoSlugUrl_vn,
            aboutSeoCanonicalUrl_en: data.aboutSeoCanonicalUrl_en,
            aboutSeoCanonicalUrl_vn: data.aboutSeoCanonicalUrl_vn,
            aboutSeoSchemaType_en: data.aboutSeoSchemaType_en,
            aboutSeoSchemaType_vn: data.aboutSeoSchemaType_vn,
            aboutSeoOgTitle_en: data.aboutSeoOgTitle_en,
            aboutSeoOgTitle_vn: data.aboutSeoOgTitle_vn,
            aboutSeoOgDescription_en: data.aboutSeoOgDescription_en,
            aboutSeoOgDescription_vn: data.aboutSeoOgDescription_vn,
            aboutSeoAllowIndexing: data.aboutSeoAllowIndexing,
            aboutSeoOgImages: data.aboutSeoOgImages,
        };
    };

    // Fetch the about page data
    const fetchPageData = async () => {
        try {
            setLoading(true);
            const response = await getAboutPage();
            const page = response.data.data;

            if (page) {
                setPageData(page);

                // Set Banner Form
                bannerForm.setFieldsValue({
                    aboutBannerTitle_en: page.aboutBannerTitle_en,
                    aboutBannerTitle_vn: page.aboutBannerTitle_vn,
                    aboutBannerBg: page.aboutBannerBg,
                });

                // Set History Form
                historyForm.setFieldsValue({
                    aboutHistoryTitle_en: page.aboutHistoryTitle_en,
                    aboutHistoryTitle_vn: page.aboutHistoryTitle_vn,
                    aboutHistoryDescription_en: page.aboutHistoryDescription_en,
                    aboutHistoryDescription_vn: page.aboutHistoryDescription_vn,
                    aboutHistoryTimeline: page.aboutHistoryTimeline || [],
                });

                // Set Buying Form
                buyingForm.setFieldsValue({
                    aboutBuyingTitle_en: page.aboutBuyingTitle_en,
                    aboutBuyingTitle_vn: page.aboutBuyingTitle_vn,
                    aboutBuyingDescription_en: page.aboutBuyingDescription_en,
                    aboutBuyingDescription_vn: page.aboutBuyingDescription_vn,
                    aboutBuyingSteps: page.aboutBuyingSteps || [],
                });

                // Set Why Choose Form
                whyChooseForm.setFieldsValue({
                    aboutWhyChooseTitle_en: page.aboutWhyChooseTitle_en,
                    aboutWhyChooseTitle_vn: page.aboutWhyChooseTitle_vn,
                    aboutWhyChooseDescription_en: page.aboutWhyChooseDescription_en,
                    aboutWhyChooseDescription_vn: page.aboutWhyChooseDescription_vn,
                    aboutWhyChooseButtonText_en: page.aboutWhyChooseButtonText_en,
                    aboutWhyChooseButtonText_vn: page.aboutWhyChooseButtonText_vn,
                    aboutWhyChooseButtonLink: page.aboutWhyChooseButtonLink,
                    aboutWhyChooseBoxes: page.aboutWhyChooseBoxes || [],
                });

                // Set Vision Mission Form
                visionMissionForm.setFieldsValue({
                    aboutVisionTitle_en: page.aboutVisionTitle_en,
                    aboutVisionTitle_vn: page.aboutVisionTitle_vn,
                    aboutVisionDescription_en: page.aboutVisionDescription_en,
                    aboutVisionDescription_vn: page.aboutVisionDescription_vn,
                    aboutMissionTitle_en: page.aboutMissionTitle_en,
                    aboutMissionTitle_vn: page.aboutMissionTitle_vn,
                    aboutMissionDescription_en: page.aboutMissionDescription_en,
                    aboutMissionDescription_vn: page.aboutMissionDescription_vn,
                });

                // Set Agent Form
                agentForm.setFieldsValue({
                    aboutAgentTitle_en: page.aboutAgentTitle_en,
                    aboutAgentTitle_vn: page.aboutAgentTitle_vn,
                    aboutAgentSubTitle_en: page.aboutAgentSubTitle_en,
                    aboutAgentSubTitle_vn: page.aboutAgentSubTitle_vn,
                    aboutAgentDescription_en: page.aboutAgentDescription_en,
                    aboutAgentDescription_vn: page.aboutAgentDescription_vn,
                    aboutAgentContent_en: page.aboutAgentContent_en,
                    aboutAgentContent_vn: page.aboutAgentContent_vn,
                    aboutAgentButtonText_en: page.aboutAgentButtonText_en,
                    aboutAgentButtonText_vn: page.aboutAgentButtonText_vn,
                    aboutAgentButtonLink: page.aboutAgentButtonLink,
                    aboutAgentImage: page.aboutAgentImage,
                });

                // Set Overview Form
                overviewForm.setFieldsValue({
                    aboutOverviewTitle_en: page.aboutOverviewTitle_en,
                    aboutOverviewTitle_vn: page.aboutOverviewTitle_vn,
                    aboutOverviewDescription_en: page.aboutOverviewDescription_en,
                    aboutOverviewDescription_vn: page.aboutOverviewDescription_vn,
                    aboutOverviewBg: page.aboutOverviewBg,
                });

                // Set Find Property Form
                findForm.setFieldsValue({
                    aboutFindTitle_en: page.aboutFindTitle_en,
                    aboutFindTitle_vn: page.aboutFindTitle_vn,
                    aboutFindDescription_en: page.aboutFindDescription_en,
                    aboutFindDescription_vn: page.aboutFindDescription_vn,
                    aboutFindBg: page.aboutFindBg,
                });

                // Set SEO Form
                seoForm.setFieldsValue({
                    aboutSeoMetaTitle_en: page.aboutSeoMetaTitle_en,
                    aboutSeoMetaTitle_vn: page.aboutSeoMetaTitle_vn,
                    aboutSeoMetaDescription_en: page.aboutSeoMetaDescription_en,
                    aboutSeoMetaDescription_vn: page.aboutSeoMetaDescription_vn,
                    aboutSeoMetaKeywords_en: page.aboutSeoMetaKeywords_en,
                    aboutSeoMetaKeywords_vn: page.aboutSeoMetaKeywords_vn,
                    aboutSeoSlugUrl_en: page.aboutSeoSlugUrl_en,
                    aboutSeoSlugUrl_vn: page.aboutSeoSlugUrl_vn,
                    aboutSeoCanonicalUrl_en: page.aboutSeoCanonicalUrl_en,
                    aboutSeoCanonicalUrl_vn: page.aboutSeoCanonicalUrl_vn,
                    aboutSeoSchemaType_en: page.aboutSeoSchemaType_en,
                    aboutSeoSchemaType_vn: page.aboutSeoSchemaType_vn,
                    aboutSeoOgTitle_en: page.aboutSeoOgTitle_en,
                    aboutSeoOgTitle_vn: page.aboutSeoOgTitle_vn,
                    aboutSeoOgDescription_en: page.aboutSeoOgDescription_en,
                    aboutSeoOgDescription_vn: page.aboutSeoOgDescription_vn,
                    aboutSeoAllowIndexing: page.aboutSeoAllowIndexing,
                    aboutSeoOgImages: page.aboutSeoOgImages || [],
                });
            } else {
                setPageData(null);
                bannerForm.resetFields();
                historyForm.resetFields();
                buyingForm.resetFields();
                whyChooseForm.resetFields();
                visionMissionForm.resetFields();
                agentForm.resetFields();
                overviewForm.resetFields();
                findForm.resetFields();
                seoForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                historyForm.resetFields();
                buyingForm.resetFields();
                whyChooseForm.resetFields();
                visionMissionForm.resetFields();
                agentForm.resetFields();
                findForm.resetFields();
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
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Banner section updated successfully!', 'success');
            } else {
                await createAboutPage(finalPayload);
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
            console.error(error);
        } finally {
            setBannerLoading(false);
        }
    };

    // Handle History form submission
    const handleHistorySubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setHistoryLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('History section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save history section', 'error');
                console.error(error);
            }
        } finally {
            setHistoryLoading(false);
        }
    };

    // Handle Buying form submission
    const handleBuyingSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setBuyingLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Buying process section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save buying process section', 'error');
                console.error(error);
            }
        } finally {
            setBuyingLoading(false);
        }
    };

    // Handle Why Choose form submission
    const handleWhyChooseSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setWhyChooseLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Why Choose Us section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save why choose section', 'error');
                console.error(error);
            }
        } finally {
            setWhyChooseLoading(false);
        }
    };

    // Handle Vision Mission form submission
    const handleVisionMissionSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setVisionMissionLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Vision & Mission section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save vision & mission section', 'error');
                console.error(error);
            }
        } finally {
            setVisionMissionLoading(false);
        }
    };

    // Handle Agent form submission
    const handleAgentSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setAgentLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Agent section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save agent section', 'error');
                console.error(error);
            }
        } finally {
            setAgentLoading(false);
        }
    };

    // Handle Overview form submission
    const handleOverviewSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setOverviewLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Overview section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save overview section', 'error');
                console.error(error);
            }
        } finally {
            setOverviewLoading(false);
        }
    };

    // Handle Find Property form submission
    const handleFindPropertySubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setFindLoading(true);
            const finalPayload = {
                ...(pageData && getPreservedData(pageData)),
                ...values
            };

            if (pageData) {
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('Find Property section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save find property section', 'error');
                console.error(error);
            }
        } finally {
            setFindLoading(false);
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
                await updateAboutPage(pageData._id, finalPayload);
                CommonToaster('SEO section updated successfully!', 'success');
            } else {
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...finalPayload, ...bannerValues });
                CommonToaster('About page created successfully!', 'success');
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
                {headerLang === 'en' ? 'About Us Page Sections' : 'Các Phần Trang Giới Thiệu'}
            </h2>

            <div className="space-y-6">
                {/* Banner Section */}
                <AboutPageBannerForm
                    form={bannerForm}
                    onSubmit={handleBannerSubmit}
                    loading={bannerLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.banner}
                    onToggle={() => toggleAccordion('banner')}
                    headerLang={headerLang}
                />

                {/* Overview Section */}
                <AboutOverviewForm
                    form={overviewForm}
                    onSubmit={handleOverviewSubmit}
                    loading={overviewLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.overview}
                    onToggle={() => toggleAccordion('overview')}
                    headerLang={headerLang}
                />

                {/* Vision & Mission Section */}
                <AboutPageVisionMissionForm
                    form={visionMissionForm}
                    onSubmit={handleVisionMissionSubmit}
                    loading={visionMissionLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.visionMission}
                    onToggle={() => toggleAccordion('visionMission')}
                    headerLang={headerLang}
                />

                {/* History Section */}
                <AboutPageHistoryForm
                    form={historyForm}
                    onSubmit={handleHistorySubmit}
                    loading={historyLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.history}
                    onToggle={() => toggleAccordion('history')}
                    headerLang={headerLang}
                />

                {/* Why Choose Us Section */}
                <AboutPageWhyChooseForm
                    form={whyChooseForm}
                    onSubmit={handleWhyChooseSubmit}
                    loading={whyChooseLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.whyChoose}
                    onToggle={() => toggleAccordion('whyChoose')}
                    headerLang={headerLang}
                />

                {/* Buying Process Section */}
                <AboutPageBuyingForm
                    form={buyingForm}
                    onSubmit={handleBuyingSubmit}
                    loading={buyingLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.buying}
                    onToggle={() => toggleAccordion('buying')}
                    headerLang={headerLang}
                />

                {/* Agent Section */}
                <AboutAgentForm
                    form={agentForm}
                    onSubmit={handleAgentSubmit}
                    loading={agentLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.agent}
                    onToggle={() => toggleAccordion('agent')}
                    headerLang={headerLang}
                />

                {/* Find Property Section */}
                <AboutPageFindPropertyForm
                    form={findForm}
                    onSubmit={handleFindPropertySubmit}
                    loading={findLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.find}
                    onToggle={() => toggleAccordion('find')}
                    headerLang={headerLang}
                />

                {/* SEO Section */}
                <AboutPageSeoForm
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
