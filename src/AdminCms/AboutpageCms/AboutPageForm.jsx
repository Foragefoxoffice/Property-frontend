import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getAboutPage,
    createAboutPage,
    updateAboutPage,
} from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import AboutPageBannerForm from './AboutPageBannerForm';
import AboutPageHistoryForm from './AboutPageHistoryForm';
import AboutPageBuyingForm from './AboutPageBuyingForm';
import AboutPageWhyChooseForm from './AboutPageWhyChooseForm';
import AboutPageVisionMissionForm from './AboutPageVisionMissionForm';

export default function AboutPageForm() {
    const [bannerForm] = Form.useForm();
    const [historyForm] = Form.useForm();
    const [buyingForm] = Form.useForm();
    const [whyChooseForm] = Form.useForm();
    const [visionMissionForm] = Form.useForm();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Accordion state
    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        history: false,
        buying: false,
        whyChoose: false,
        visionMission: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            history: key === 'history' ? !prev.history : false,
            buying: key === 'buying' ? !prev.buying : false,
            whyChoose: key === 'whyChoose' ? !prev.whyChoose : false,
            visionMission: key === 'visionMission' ? !prev.visionMission : false,
        }));
    };

    const [bannerLoading, setBannerLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [buyingLoading, setBuyingLoading] = useState(false);
    const [whyChooseLoading, setWhyChooseLoading] = useState(false);
    const [visionMissionLoading, setVisionMissionLoading] = useState(false);

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
            } else {
                setPageData(null);
                bannerForm.resetFields();
                historyForm.resetFields();
                buyingForm.resetFields();
                whyChooseForm.resetFields();
                visionMissionForm.resetFields();
                visionMissionForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                historyForm.resetFields();
                buyingForm.resetFields();
                whyChooseForm.resetFields();
                visionMissionForm.resetFields();
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
        try {
            setBannerLoading(true);

            const payload = {
                ...values,
                // Include existing history data if available
                ...(pageData && {
                    aboutHistoryTitle_en: pageData.aboutHistoryTitle_en,
                    aboutHistoryTitle_vn: pageData.aboutHistoryTitle_vn,
                    aboutHistoryDescription_en: pageData.aboutHistoryDescription_en,
                    aboutHistoryDescription_vn: pageData.aboutHistoryDescription_vn,
                    aboutHistoryTimeline: pageData.aboutHistoryTimeline,
                    aboutBuyingTitle_en: pageData.aboutBuyingTitle_en,
                    aboutBuyingTitle_vn: pageData.aboutBuyingTitle_vn,
                    aboutBuyingDescription_en: pageData.aboutBuyingDescription_en,
                    aboutBuyingDescription_vn: pageData.aboutBuyingDescription_vn,
                    aboutBuyingSteps: pageData.aboutBuyingSteps,
                    aboutWhyChooseTitle_en: pageData.aboutWhyChooseTitle_en,
                    aboutWhyChooseTitle_vn: pageData.aboutWhyChooseTitle_vn,
                    aboutWhyChooseDescription_en: pageData.aboutWhyChooseDescription_en,
                    aboutWhyChooseDescription_vn: pageData.aboutWhyChooseDescription_vn,
                    aboutWhyChooseButtonText_en: pageData.aboutWhyChooseButtonText_en,
                    aboutWhyChooseButtonText_vn: pageData.aboutWhyChooseButtonText_vn,
                    aboutWhyChooseButtonLink: pageData.aboutWhyChooseButtonLink,
                    aboutWhyChooseBoxes: pageData.aboutWhyChooseBoxes,
                    aboutVisionTitle_en: pageData.aboutVisionTitle_en,
                    aboutVisionTitle_vn: pageData.aboutVisionTitle_vn,
                    aboutVisionDescription_en: pageData.aboutVisionDescription_en,
                    aboutVisionDescription_vn: pageData.aboutVisionDescription_vn,
                    aboutMissionTitle_en: pageData.aboutMissionTitle_en,
                    aboutMissionTitle_vn: pageData.aboutMissionTitle_vn,
                    aboutMissionDescription_en: pageData.aboutMissionDescription_en,
                    aboutMissionDescription_vn: pageData.aboutMissionDescription_vn,
                })
            };

            if (pageData) {
                await updateAboutPage(pageData._id, payload);
                CommonToaster('Banner section updated successfully!', 'success');
            } else {
                await createAboutPage(payload);
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
        try {
            setHistoryLoading(true);

            const payload = {
                ...values,
                // Include existing banner data
                ...(pageData && {
                    aboutBannerTitle_en: pageData.aboutBannerTitle_en,
                    aboutBannerTitle_vn: pageData.aboutBannerTitle_vn,
                    aboutBannerBg: pageData.aboutBannerBg,
                    aboutBuyingTitle_en: pageData.aboutBuyingTitle_en,
                    aboutBuyingTitle_vn: pageData.aboutBuyingTitle_vn,
                    aboutBuyingDescription_en: pageData.aboutBuyingDescription_en,
                    aboutBuyingDescription_vn: pageData.aboutBuyingDescription_vn,
                    aboutBuyingSteps: pageData.aboutBuyingSteps,
                    aboutWhyChooseTitle_en: pageData.aboutWhyChooseTitle_en,
                    aboutWhyChooseTitle_vn: pageData.aboutWhyChooseTitle_vn,
                    aboutWhyChooseDescription_en: pageData.aboutWhyChooseDescription_en,
                    aboutWhyChooseDescription_vn: pageData.aboutWhyChooseDescription_vn,
                    aboutWhyChooseButtonText_en: pageData.aboutWhyChooseButtonText_en,
                    aboutWhyChooseButtonText_vn: pageData.aboutWhyChooseButtonText_vn,
                    aboutWhyChooseButtonLink: pageData.aboutWhyChooseButtonLink,
                    aboutWhyChooseBoxes: pageData.aboutWhyChooseBoxes,
                    aboutVisionTitle_en: pageData.aboutVisionTitle_en,
                    aboutVisionTitle_vn: pageData.aboutVisionTitle_vn,
                    aboutVisionDescription_en: pageData.aboutVisionDescription_en,
                    aboutVisionDescription_vn: pageData.aboutVisionDescription_vn,
                    aboutMissionTitle_en: pageData.aboutMissionTitle_en,
                    aboutMissionTitle_vn: pageData.aboutMissionTitle_vn,
                    aboutMissionDescription_en: pageData.aboutMissionDescription_en,
                    aboutMissionDescription_vn: pageData.aboutMissionDescription_vn,
                })
            };

            if (pageData) {
                await updateAboutPage(pageData._id, payload);
                CommonToaster('History section updated successfully!', 'success');
            } else {
                // For first time creation, need banner data too
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...payload, ...bannerValues });
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
        try {
            setBuyingLoading(true);

            const payload = {
                ...values,
                // Include existing data
                ...(pageData && {
                    aboutBannerTitle_en: pageData.aboutBannerTitle_en,
                    aboutBannerTitle_vn: pageData.aboutBannerTitle_vn,
                    aboutBannerBg: pageData.aboutBannerBg,
                    aboutHistoryTitle_en: pageData.aboutHistoryTitle_en,
                    aboutHistoryTitle_vn: pageData.aboutHistoryTitle_vn,
                    aboutHistoryDescription_en: pageData.aboutHistoryDescription_en,
                    aboutHistoryDescription_vn: pageData.aboutHistoryDescription_vn,
                    aboutHistoryTimeline: pageData.aboutHistoryTimeline,
                    aboutWhyChooseTitle_en: pageData.aboutWhyChooseTitle_en,
                    aboutWhyChooseTitle_vn: pageData.aboutWhyChooseTitle_vn,
                    aboutWhyChooseDescription_en: pageData.aboutWhyChooseDescription_en,
                    aboutWhyChooseDescription_vn: pageData.aboutWhyChooseDescription_vn,
                    aboutWhyChooseButtonText_en: pageData.aboutWhyChooseButtonText_en,
                    aboutWhyChooseButtonText_vn: pageData.aboutWhyChooseButtonText_vn,
                    aboutWhyChooseButtonLink: pageData.aboutWhyChooseButtonLink,
                    aboutWhyChooseBoxes: pageData.aboutWhyChooseBoxes,
                    aboutVisionTitle_en: pageData.aboutVisionTitle_en,
                    aboutVisionTitle_vn: pageData.aboutVisionTitle_vn,
                    aboutVisionDescription_en: pageData.aboutVisionDescription_en,
                    aboutVisionDescription_vn: pageData.aboutVisionDescription_vn,
                    aboutMissionTitle_en: pageData.aboutMissionTitle_en,
                    aboutMissionTitle_vn: pageData.aboutMissionTitle_vn,
                    aboutMissionDescription_en: pageData.aboutMissionDescription_en,
                    aboutMissionDescription_vn: pageData.aboutMissionDescription_vn,
                })
            };

            if (pageData) {
                await updateAboutPage(pageData._id, payload);
                CommonToaster('Buying process section updated successfully!', 'success');
            } else {
                // For first time creation, need banner data too
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...payload, ...bannerValues });
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
        try {
            setWhyChooseLoading(true);

            const payload = {
                ...values,
                // Include existing data
                ...(pageData && {
                    aboutBannerTitle_en: pageData.aboutBannerTitle_en,
                    aboutBannerTitle_vn: pageData.aboutBannerTitle_vn,
                    aboutBannerBg: pageData.aboutBannerBg,
                    aboutHistoryTitle_en: pageData.aboutHistoryTitle_en,
                    aboutHistoryTitle_vn: pageData.aboutHistoryTitle_vn,
                    aboutHistoryDescription_en: pageData.aboutHistoryDescription_en,
                    aboutHistoryDescription_vn: pageData.aboutHistoryDescription_vn,
                    aboutHistoryTimeline: pageData.aboutHistoryTimeline,
                    aboutBuyingTitle_en: pageData.aboutBuyingTitle_en,
                    aboutBuyingTitle_vn: pageData.aboutBuyingTitle_vn,
                    aboutBuyingDescription_en: pageData.aboutBuyingDescription_en,
                    aboutBuyingDescription_vn: pageData.aboutBuyingDescription_vn,
                    aboutBuyingSteps: pageData.aboutBuyingSteps,
                    aboutVisionTitle_en: pageData.aboutVisionTitle_en,
                    aboutVisionTitle_vn: pageData.aboutVisionTitle_vn,
                    aboutVisionDescription_en: pageData.aboutVisionDescription_en,
                    aboutVisionDescription_vn: pageData.aboutVisionDescription_vn,
                    aboutMissionTitle_en: pageData.aboutMissionTitle_en,
                    aboutMissionTitle_vn: pageData.aboutMissionTitle_vn,
                    aboutMissionDescription_en: pageData.aboutMissionDescription_en,
                    aboutMissionDescription_vn: pageData.aboutMissionDescription_vn,
                })
            };

            if (pageData) {
                await updateAboutPage(pageData._id, payload);
                CommonToaster('Why Choose Us section updated successfully!', 'success');
            } else {
                // For first time creation, need banner data too
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...payload, ...bannerValues });
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
        try {
            setVisionMissionLoading(true);

            const payload = {
                ...values,
                // Include existing data
                ...(pageData && {
                    aboutBannerTitle_en: pageData.aboutBannerTitle_en,
                    aboutBannerTitle_vn: pageData.aboutBannerTitle_vn,
                    aboutBannerBg: pageData.aboutBannerBg,
                    aboutHistoryTitle_en: pageData.aboutHistoryTitle_en,
                    aboutHistoryTitle_vn: pageData.aboutHistoryTitle_vn,
                    aboutHistoryDescription_en: pageData.aboutHistoryDescription_en,
                    aboutHistoryDescription_vn: pageData.aboutHistoryDescription_vn,
                    aboutHistoryTimeline: pageData.aboutHistoryTimeline,
                    aboutBuyingTitle_en: pageData.aboutBuyingTitle_en,
                    aboutBuyingTitle_vn: pageData.aboutBuyingTitle_vn,
                    aboutBuyingDescription_en: pageData.aboutBuyingDescription_en,
                    aboutBuyingDescription_vn: pageData.aboutBuyingDescription_vn,
                    aboutBuyingSteps: pageData.aboutBuyingSteps,
                    aboutWhyChooseTitle_en: pageData.aboutWhyChooseTitle_en,
                    aboutWhyChooseTitle_vn: pageData.aboutWhyChooseTitle_vn,
                    aboutWhyChooseDescription_en: pageData.aboutWhyChooseDescription_en,
                    aboutWhyChooseDescription_vn: pageData.aboutWhyChooseDescription_vn,
                    aboutWhyChooseButtonText_en: pageData.aboutWhyChooseButtonText_en,
                    aboutWhyChooseButtonText_vn: pageData.aboutWhyChooseButtonText_vn,
                    aboutWhyChooseButtonLink: pageData.aboutWhyChooseButtonLink,
                    aboutWhyChooseBoxes: pageData.aboutWhyChooseBoxes,
                })
            };

            if (pageData) {
                await updateAboutPage(pageData._id, payload);
                CommonToaster('Vision & Mission section updated successfully!', 'success');
            } else {
                // For first time creation, need banner data too
                const bannerValues = await bannerForm.validateFields();
                await createAboutPage({ ...payload, ...bannerValues });
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
                About Us Page Sections
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
                />
            </div>
        </div>
    );
}

