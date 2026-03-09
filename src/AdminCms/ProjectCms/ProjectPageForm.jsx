import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getProjectPage,
    createProjectPage,
    updateProjectPage,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { CommonToaster } from '@/Common/CommonToaster';
import ProjectBannerForm from './ProjectBannerForm';
import ProjectOverviewForm from './ProjectOverviewForm';

export default function ProjectPageForm() {
    const [bannerForm] = Form.useForm();
    const [overviewForm] = Form.useForm();

    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        overview: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            overview: key === 'overview' ? !prev.overview : false,
        }));
    };

    const [bannerLoading, setBannerLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);

    const { language } = useLanguage();
    const headerLang = language === 'vi' ? 'vn' : 'en';

    // Fetch the project page data
    const fetchPageData = async () => {
        try {
            setLoading(true);
            const response = await getProjectPage();
            const page = response.data.data;

            if (page) {
                setPageData(page);

                // Set Banner Form
                bannerForm.setFieldsValue({
                    projectBannerTitle: page.projectBannerTitle,
                    projectBannerDesc: page.projectBannerDesc,
                });

                // Set Overview Form
                overviewForm.setFieldsValue({
                    projectOverviewContent: page.projectOverviewContent,
                    mediaType: page.mediaType || 'image',
                    projectOverviewVideo: page.projectOverviewVideo,
                });
            } else {
                setPageData(null);
                bannerForm.resetFields();
                overviewForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                overviewForm.resetFields();
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
    const handleBannerSubmit = async (values, bannerImages) => {
        try {
            setBannerLoading(true);

            const payload = {
                ...values,
                projectBannerImages: bannerImages,
                // Include existing overview data
                ...(pageData && {
                    projectOverviewContent: pageData.projectOverviewContent,
                    mediaType: pageData.mediaType,
                    projectOverviewVideo: pageData.projectOverviewVideo,
                })
            };

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster('Banner section updated successfully!', 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster('Project page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
            console.error(error);
        } finally {
            setBannerLoading(false);
        }
    };

    // Handle Overview form submission
    const handleOverviewSubmit = async (values) => {
        try {
            setOverviewLoading(true);

            const payload = {
                ...values,
                // Include existing banner data
                ...(pageData && {
                    projectBannerTitle: pageData.projectBannerTitle,
                    projectBannerDesc: pageData.projectBannerDesc,
                    projectBannerImages: pageData.projectBannerImages,
                })
            };

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster('Overview section updated successfully!', 'success');
            } else {
                // Wait for banner form to get valid initial fields if possible
                const bannerValues = await bannerForm.validateFields().catch(() => ({}));
                await createProjectPage({ ...payload, ...bannerValues });
                CommonToaster('Project page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save overview section', 'error');
            console.error(error);
        } finally {
            setOverviewLoading(false);
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
        <div className="p-6">
            <h2 style={{
                color: '#111827',
                fontSize: '30px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '18px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                {headerLang === 'en' ? 'Project Page Sections' : 'Các Phần Trang Dự Án'}
            </h2>

            <div className="max-w-7xl mx-auto space-y-6 flex flex-col gap-0">
                {/* Banner Section */}
                <ProjectBannerForm
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
                <ProjectOverviewForm
                    form={overviewForm}
                    onSubmit={handleOverviewSubmit}
                    loading={overviewLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.overview}
                    onToggle={() => toggleAccordion('overview')}
                    headerLang={headerLang}
                />
            </div>
        </div>
    );
}