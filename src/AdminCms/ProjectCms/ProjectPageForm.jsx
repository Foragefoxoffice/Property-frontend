import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getProjectPage,
    createProjectPage,
    updateProjectPage,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import { CommonToaster } from '@/Common/CommonToaster';
import ProjectBannerForm from './ProjectBannerForm';
import ProjectIntroForm from './ProjectIntroForm';
import ProjectOverviewForm from './ProjectOverviewForm';
import ProjectLocationForm from './ProjectLocationForm';
import ProjectPhotosForm from './ProjectPhotosForm';
import ProjectProduct from './ProjectProduct';
import ProjectVideoForm from './ProjectVideoForm';

export default function ProjectPageForm() {
    const { language } = useLanguage();
    const t = translations[language];
    const [bannerForm] = Form.useForm();
    const [introForm] = Form.useForm();
    const [overviewForm] = Form.useForm();
    const [locationForm] = Form.useForm();
    const [photosForm] = Form.useForm();
    const [productForm] = Form.useForm();
    const [videoForm] = Form.useForm();

    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        intro: false,
        overview: false,
        location: false,
        photos: false,
        product: false,
        video: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            intro: key === 'intro' ? !prev.intro : false,
            overview: key === 'overview' ? !prev.overview : false,
            location: key === 'location' ? !prev.location : false,
            photos: key === 'photos' ? !prev.photos : false,
            product: key === 'product' ? !prev.product : false,
            video: key === 'video' ? !prev.video : false,
        }));
    };

    const [bannerLoading, setBannerLoading] = useState(false);
    const [introLoading, setIntroLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

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

                // Set Intro Form
                introForm.setFieldsValue({
                    projectIntroTitle: page.projectIntroTitle,
                    projectIntroContent: page.projectIntroContent,
                    mediaType: page.mediaType || 'image',
                    projectIntroVideo: page.projectIntroVideo,
                });

                // Set Overview Form
                overviewForm.setFieldsValue({
                    projectOverviewTitle: page.projectOverviewTitle,
                    projectOverviewTable: page.projectOverviewTable || [],
                });

                // Set Location Form
                locationForm.setFieldsValue({
                    projectLocationTitle: page.projectLocationTitle,
                    projectLocationDes: page.projectLocationDes,
                });

                // Set Photos Form
                photosForm.setFieldsValue({
                    projectPhotoTitle: page.projectPhotoTitle,
                    projectPhotoTabs: page.projectPhotoTabs || [],
                });

                // Set Product Form
                productForm.setFieldsValue({
                    projectProductTitle: page.projectProductTitle,
                    projectProductDes: page.projectProductDes,
                    projectProducts: page.projectProducts || [],
                });

                // Set Video Form
                videoForm.setFieldsValue({
                    projectVideoTitle: page.projectVideoTitle,
                    projectVideoTabs: page.projectVideoTabs || [],
                });

            } else {
                setPageData(null);
                bannerForm.resetFields();
                introForm.resetFields();
                overviewForm.resetFields();
                locationForm.resetFields();
                photosForm.resetFields();
                productForm.resetFields();
                videoForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                introForm.resetFields();
                overviewForm.resetFields();
                locationForm.resetFields();
                photosForm.resetFields();
                productForm.resetFields();
                videoForm.resetFields();
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

    // Helper to get persistent payload (all sections)
    const getPayload = (currentValues, type) => {
        const base = {
            ...(pageData && {
                // Section data from database
                projectBannerTitle: pageData.projectBannerTitle,
                projectBannerDesc: pageData.projectBannerDesc,
                projectBannerImages: pageData.projectBannerImages,
                projectIntroTitle: pageData.projectIntroTitle,
                projectIntroContent: pageData.projectIntroContent,
                mediaType: pageData.mediaType,
                projectIntroVideo: pageData.projectIntroVideo,
                projectOverviewTitle: pageData.projectOverviewTitle,
                projectOverviewTable: pageData.projectOverviewTable,
                projectOverviewImages: pageData.projectOverviewImages,
                projectLocationTitle: pageData.projectLocationTitle,
                projectLocationDes: pageData.projectLocationDes,
                projectLocationImages: pageData.projectLocationImages,
                projectPhotoTitle: pageData.projectPhotoTitle,
                projectPhotoTabs: pageData.projectPhotoTabs,
                projectProductTitle: pageData.projectProductTitle,
                projectProductDes: pageData.projectProductDes,
                projectProducts: pageData.projectProducts,
                projectVideoTitle: pageData.projectVideoTitle,
                projectVideoTabs: pageData.projectVideoTabs,
            }),
            ...currentValues
        };
        return base;
    };

    const handleBannerSubmit = async (values, bannerImages) => {
        try {
            setBannerLoading(true);
            const payload = getPayload({ ...values, projectBannerImages: bannerImages });

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster(t.toastBannerSectionUpdated, 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster(t.toastProjectPageCreated, 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || t.toastBannerSaveError, 'error');
        } finally {
            setBannerLoading(false);
        }
    };

    const handleIntroSubmit = async (values) => {
        try {
            setIntroLoading(true);
            const payload = getPayload(values);

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster(t.toastIntroSectionUpdated, 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster(t.toastProjectPageCreated, 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || t.toastIntroSaveError, 'error');
        } finally {
            setIntroLoading(false);
        }
    };

    const handleOverviewSubmit = async (values, overviewImages) => {
        try {
            setOverviewLoading(true);
            const payload = getPayload({ ...values, projectOverviewImages: overviewImages });

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster(t.toastOverviewSectionUpdated, 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster(t.toastProjectPageCreated, 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || t.toastOverviewSaveError, 'error');
        } finally {
            setOverviewLoading(false);
        }
    };

    const handleLocationSubmit = async (values, locationImages) => {
        try {
            setLocationLoading(true);
            const payload = getPayload({ ...values, projectLocationImages: locationImages });

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster(t.toastLocationSectionUpdated, 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster(t.toastProjectPageCreated, 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || t.toastLocationSaveError, 'error');
        } finally {
            setLocationLoading(false);
        }
    };

    const handlePhotosSubmit = async (values) => {
        try {
            setPhotosLoading(true);
            const payload = getPayload(values);

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster('Photos gallery updated successfully!', 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster('Project page created successfully!', 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save photos gallery', 'error');
        } finally {
            setPhotosLoading(false);
        }
    };

    const handleProductSubmit = async (values) => {
        try {
            setProductLoading(true);
            const payload = getPayload(values);

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster('Product section updated successfully!', 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster('Project page created successfully!', 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save product section', 'error');
        } finally {
            setProductLoading(false);
        }
    };

    const handleVideoSubmit = async (values) => {
        try {
            setVideoLoading(true);
            const payload = getPayload(values);

            if (pageData) {
                await updateProjectPage(pageData._id, payload);
                CommonToaster('Video section updated successfully!', 'success');
            } else {
                await createProjectPage(payload);
                CommonToaster('Project page created successfully!', 'success');
            }
            fetchPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save video section', 'error');
        } finally {
            setVideoLoading(false);
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

                {/* Intro Section */}
                <ProjectIntroForm
                    form={introForm}
                    onSubmit={handleIntroSubmit}
                    loading={introLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.intro}
                    onToggle={() => toggleAccordion('intro')}
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

                {/* Location Section */}
                <ProjectLocationForm
                    form={locationForm}
                    onSubmit={handleLocationSubmit}
                    loading={locationLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.location}
                    onToggle={() => toggleAccordion('location')}
                    headerLang={headerLang}
                />

                {/* Photos Section */}
                <ProjectPhotosForm
                    form={photosForm}
                    onSubmit={handlePhotosSubmit}
                    loading={photosLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.photos}
                    onToggle={() => toggleAccordion('photos')}
                    headerLang={headerLang}
                />

                {/* Product Section */}
                <ProjectProduct
                    form={productForm}
                    onSubmit={handleProductSubmit}
                    loading={productLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.product}
                    onToggle={() => toggleAccordion('product')}
                    headerLang={headerLang}
                />

                {/* Video Section */}
                <ProjectVideoForm
                    form={videoForm}
                    onSubmit={handleVideoSubmit}
                    loading={videoLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.video}
                    onToggle={() => toggleAccordion('video')}
                    headerLang={headerLang}
                />
            </div>
        </div>
    );
}