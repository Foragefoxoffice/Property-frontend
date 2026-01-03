import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    message,
    Spin,
    Tabs,
    ConfigProvider,
    Upload
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined
} from '@ant-design/icons';
import {
    getHomePage,
    createHomePage,
    updateHomePage,
    uploadHomePageImage,
} from '../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { validateVietnameseFields } from '@/utils/formValidation';

const { TextArea } = Input;

export default function HomePageForm() {
    const [bannerForm] = Form.useForm();
    const [aboutForm] = Form.useForm();
    const [featureForm] = Form.useForm();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false);
    const [aboutLoading, setAboutLoading] = useState(false);
    const [featureLoading, setFeatureLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('en');
    const [bannerImageUrl, setBannerImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    // Accordion state - only one can be open at a time
    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        about: false,
        feature: false
    });

    const toggleAccordion = (key) => {
        setOpenAccordions({
            banner: key === 'banner',
            about: key === 'about',
            feature: key === 'feature'
        });
    };

    // Fetch the home page data
    const fetchPageData = async () => {
        try {
            setLoading(true);
            const response = await getHomePage();
            const page = response.data.data;

            if (page) {
                setPageData(page);
                setBannerImageUrl(page.backgroundImage || '');

                // Set Banner Form
                bannerForm.setFieldsValue({
                    heroTitle_en: page.heroTitle_en,
                    heroDescription_en: page.heroDescription_en,
                    heroTitle_vn: page.heroTitle_vn,
                    heroDescription_vn: page.heroDescription_vn,
                    backgroundImage: page.backgroundImage,
                });

                // Set About Form
                aboutForm.setFieldsValue({
                    homeAboutTitle_en: page.homeAboutTitle_en,
                    homeAboutTitle_vn: page.homeAboutTitle_vn,
                    homeAboutDescription_en: page.homeAboutDescription_en,
                    homeAboutDescription_vn: page.homeAboutDescription_vn,
                    homeAboutButtonText_en: page.homeAboutButtonText_en,
                    homeAboutButtonText_vn: page.homeAboutButtonText_vn,
                    homeAboutButtonLink: page.homeAboutButtonLink,
                    homeAboutStep1Title_en: page.homeAboutStep1Title_en,
                    homeAboutStep1Title_vn: page.homeAboutStep1Title_vn,
                    homeAboutStep1Des_en: page.homeAboutStep1Des_en,
                    homeAboutStep1Des_vn: page.homeAboutStep1Des_vn,
                    homeAboutStep2Title_en: page.homeAboutStep2Title_en,
                    homeAboutStep2Title_vn: page.homeAboutStep2Title_vn,
                    homeAboutStep2Des_en: page.homeAboutStep2Des_en,
                    homeAboutStep2Des_vn: page.homeAboutStep2Des_vn,
                    homeAboutStep3Title_en: page.homeAboutStep3Title_en,
                    homeAboutStep3Title_vn: page.homeAboutStep3Title_vn,
                    homeAboutStep3Des_en: page.homeAboutStep3Des_en,
                    homeAboutStep3Des_vn: page.homeAboutStep3Des_vn,
                });

                // Set Feature Form
                featureForm.setFieldsValue({
                    homeFeatureTitle_en: page.homeFeatureTitle_en,
                    homeFeatureTitle_vn: page.homeFeatureTitle_vn,
                    homeFeatureDescription_en: page.homeFeatureDescription_en,
                    homeFeatureDescription_vn: page.homeFeatureDescription_vn,
                });
            } else {
                setPageData(null);
                bannerForm.resetFields();
                aboutForm.resetFields();
                featureForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                aboutForm.resetFields();
                featureForm.resetFields();
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

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadHomePageImage(file);
            const uploadedUrl = response.data.data.url;

            bannerForm.setFieldsValue({ backgroundImage: uploadedUrl });
            setBannerImageUrl(uploadedUrl);
            CommonToaster('Image uploaded successfully!', 'success');

            return false;
        } catch (error) {
            CommonToaster('Failed to upload image', 'error');
            console.error(error);
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleBeforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            CommonToaster('You can only upload image files!', 'error');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            CommonToaster('Image must be smaller than 5MB!', 'error');
            return Upload.LIST_IGNORE;
        }
        handleImageUpload(file);
        return false;
    };

    // Handle Banner form submission
    const handleBannerSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setBannerLoading(true);

            const payload = {
                ...values,
                // Include existing about data
                ...(pageData && {
                    homeAboutTitle_en: pageData.homeAboutTitle_en,
                    homeAboutTitle_vn: pageData.homeAboutTitle_vn,
                    homeAboutDescription_en: pageData.homeAboutDescription_en,
                    homeAboutDescription_vn: pageData.homeAboutDescription_vn,
                    homeAboutButtonText_en: pageData.homeAboutButtonText_en,
                    homeAboutButtonText_vn: pageData.homeAboutButtonText_vn,
                    homeAboutButtonLink: pageData.homeAboutButtonLink,
                    homeAboutStep1Title_en: pageData.homeAboutStep1Title_en,
                    homeAboutStep1Title_vn: pageData.homeAboutStep1Title_vn,
                    homeAboutStep1Des_en: pageData.homeAboutStep1Des_en,
                    homeAboutStep1Des_vn: pageData.homeAboutStep1Des_vn,
                    homeAboutStep2Title_en: pageData.homeAboutStep2Title_en,
                    homeAboutStep2Title_vn: pageData.homeAboutStep2Title_vn,
                    homeAboutStep2Des_en: pageData.homeAboutStep2Des_en,
                    homeAboutStep2Des_vn: pageData.homeAboutStep2Des_vn,
                    homeAboutStep3Title_en: pageData.homeAboutStep3Title_en,
                    homeAboutStep3Title_vn: pageData.homeAboutStep3Title_vn,
                    homeAboutStep3Des_en: pageData.homeAboutStep3Des_en,
                    homeAboutStep3Des_vn: pageData.homeAboutStep3Des_vn,
                    homeFeatureTitle_en: pageData.homeFeatureTitle_en,
                    homeFeatureTitle_vn: pageData.homeFeatureTitle_vn,
                    homeFeatureDescription_en: pageData.homeFeatureDescription_en,
                    homeFeatureDescription_vn: pageData.homeFeatureDescription_vn,
                })
            };

            if (pageData) {
                await updateHomePage(pageData._id, payload);
                CommonToaster('Banner section updated successfully!', 'success');
            } else {
                // For first time creation, need about data too
                const aboutValues = await aboutForm.validateFields();
                await createHomePage({ ...payload, ...aboutValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the About Us section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
                console.error(error);
            }
        } finally {
            setBannerLoading(false);
        }
    };

    // Handle About form submission
    const handleAboutSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setAboutLoading(true);

            const payload = {
                ...values,
                // Include existing banner data
                ...(pageData && {
                    heroTitle_en: pageData.heroTitle_en,
                    heroDescription_en: pageData.heroDescription_en,
                    heroTitle_vn: pageData.heroTitle_vn,
                    heroDescription_vn: pageData.heroDescription_vn,
                    backgroundImage: pageData.backgroundImage,
                    homeFeatureTitle_en: pageData.homeFeatureTitle_en,
                    homeFeatureTitle_vn: pageData.homeFeatureTitle_vn,
                    homeFeatureDescription_en: pageData.homeFeatureDescription_en,
                    homeFeatureDescription_vn: pageData.homeFeatureDescription_vn,
                })
            };

            if (pageData) {
                await updateHomePage(pageData._id, payload);
                CommonToaster('About section updated successfully!', 'success');
            } else {
                // For first time creation, need banner data too
                const bannerValues = await bannerForm.validateFields();
                await createHomePage({ ...payload, ...bannerValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner section first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save about section', 'error');
                console.error(error);
            }
        } finally {
            setAboutLoading(false);
        }
    };

    // Handle Feature form submission
    const handleFeatureSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setFeatureLoading(true);

            const payload = {
                ...values,
                // Include existing banner and about data
                ...(pageData && {
                    heroTitle_en: pageData.heroTitle_en,
                    heroDescription_en: pageData.heroDescription_en,
                    heroTitle_vn: pageData.heroTitle_vn,
                    heroDescription_vn: pageData.heroDescription_vn,
                    backgroundImage: pageData.backgroundImage,
                    homeAboutTitle_en: pageData.homeAboutTitle_en,
                    homeAboutTitle_vn: pageData.homeAboutTitle_vn,
                    homeAboutDescription_en: pageData.homeAboutDescription_en,
                    homeAboutDescription_vn: pageData.homeAboutDescription_vn,
                    homeAboutButtonText_en: pageData.homeAboutButtonText_en,
                    homeAboutButtonText_vn: pageData.homeAboutButtonText_vn,
                    homeAboutButtonLink: pageData.homeAboutButtonLink,
                    homeAboutStep1Title_en: pageData.homeAboutStep1Title_en,
                    homeAboutStep1Title_vn: pageData.homeAboutStep1Title_vn,
                    homeAboutStep1Des_en: pageData.homeAboutStep1Des_en,
                    homeAboutStep1Des_vn: pageData.homeAboutStep1Des_vn,
                    homeAboutStep2Title_en: pageData.homeAboutStep2Title_en,
                    homeAboutStep2Title_vn: pageData.homeAboutStep2Title_vn,
                    homeAboutStep2Des_en: pageData.homeAboutStep2Des_en,
                    homeAboutStep2Des_vn: pageData.homeAboutStep2Des_vn,
                    homeAboutStep3Title_en: pageData.homeAboutStep3Title_en,
                    homeAboutStep3Title_vn: pageData.homeAboutStep3Title_vn,
                    homeAboutStep3Des_en: pageData.homeAboutStep3Des_en,
                    homeAboutStep3Des_vn: pageData.homeAboutStep3Des_vn,
                })
            };

            if (pageData) {
                await updateHomePage(pageData._id, payload);
                CommonToaster('Features section updated successfully!', 'success');
            } else {
                // For first time creation, need banner and about data too
                const bannerValues = await bannerForm.validateFields();
                const aboutValues = await aboutForm.validateFields();
                await createHomePage({ ...payload, ...bannerValues, ...aboutValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Banner and About sections first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save features section', 'error');
                console.error(error);
            }
        } finally {
            setFeatureLoading(false);
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
                marginBottom: '32px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                Home Page
            </h2>

            <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                {/* Custom Tailwind Accordion */}
                <div className="space-y-4 mb-6">
                    {/* Banner Accordion */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div
                            className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                            onClick={() => toggleAccordion('banner')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">Hero / Banner Section</h3>
                                    <p className="text-sm text-gray-500 font-['Manrope']">Manage your homepage hero banner</p>
                                </div>
                            </div>
                            <div className={`transform transition-transform duration-300 ${openAccordions.banner ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordions.banner ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-6 pt-2 bg-white border-t border-gray-100">
                                <Form
                                    form={bannerForm}
                                    layout="vertical"
                                    onFinish={handleBannerSubmit}
                                >
                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={setActiveTab}
                                        className="mb-6"
                                        items={[
                                            {
                                                key: 'en',
                                                label: (
                                                    <span className="text-sm font-semibold font-['Manrope']">
                                                        English (EN)
                                                    </span>
                                                ),
                                                children: (
                                                    <>
                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Hero Title
                                                                </span>
                                                            }
                                                            name="heroTitle_en"
                                                            rules={[
                                                                { required: true, message: 'Please enter hero title in English' },
                                                                { max: 200, message: 'Maximum 200 characters allowed' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Your Trusted Property Partner"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Hero Description
                                                                </span>
                                                            }
                                                            name="heroDescription_en"
                                                            rules={[
                                                                { required: true, message: 'Please enter hero description in English' },
                                                                { max: 500, message: 'Maximum 500 characters allowed' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Find your dream property with us"
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                            />
                                                        </Form.Item>
                                                    </>
                                                )
                                            },
                                            {
                                                key: 'vn',
                                                label: (
                                                    <span className="text-sm font-semibold font-['Manrope']">
                                                        Tiếng Việt (VN)
                                                    </span>
                                                ),
                                                children: (
                                                    <>
                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Tiêu Đề Hero
                                                                </span>
                                                            }
                                                            name="heroTitle_vn"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập tiêu đề hero bằng tiếng Việt' },
                                                                { max: 200, message: 'Tối đa 200 ký tự' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Đối Tác Bất Động Sản Tin Cậy Của Bạn"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Mô Tả Hero
                                                                </span>
                                                            }
                                                            name="heroDescription_vn"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập mô tả hero bằng tiếng Việt' },
                                                                { max: 500, message: 'Tối đa 500 ký tự' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Tìm bất động sản mơ ước của bạn cùng chúng tôi"
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                            />
                                                        </Form.Item>
                                                    </>
                                                )
                                            }
                                        ]}
                                    />

                                    <Form.Item
                                        label={
                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                Hero Background Image
                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                    (Recommended: 1920x1080px, Max: 5MB)
                                                </span>
                                            </span>
                                        }
                                    >
                                        <div className="space-y-3">
                                            <Upload
                                                name="backgroundImage"
                                                listType="picture-card"
                                                className="banner-uploader w-[200px] h-[200px]"
                                                showUploadList={false}
                                                beforeUpload={handleBeforeUpload}
                                            >
                                                {bannerImageUrl ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={bannerImageUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${bannerImageUrl}` : bannerImageUrl}
                                                            alt="banner"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                            <div className="text-white text-center">
                                                                <PlusOutlined className="text-2xl mb-2" />
                                                                <div className="text-sm">Change Image</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                        <div className="text-sm text-gray-500 font-['Manrope'] opacity-0 hover:opacity-100 transition-opacity">Upload Image</div>
                                                    </div>
                                                )}
                                            </Upload>

                                            <Form.Item
                                                name="backgroundImage"
                                                noStyle
                                            >
                                                <Input type="hidden" />
                                            </Form.Item>
                                        </div>
                                    </Form.Item>

                                    {/* Banner Save Button */}
                                    <div className="flex gap-3 justify-end mt-6 pt-4">
                                        {pageData && (
                                            <Button
                                                size="large"
                                                onClick={() => {
                                                    fetchPageData();
                                                }}
                                                className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={bannerLoading}
                                            className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                        >
                                            {pageData ? 'Save Banner' : 'Create Page'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>

                    {/* About Us Section */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div
                            className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                            onClick={() => toggleAccordion('about')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">Who We Are Section</h3>
                                    <p className="text-sm text-gray-500 font-['Manrope']">Manage your about us content</p>
                                </div>
                            </div>
                            <div className={`transform transition-transform duration-300 ${openAccordions.about ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordions.about ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-6 pt-2 bg-white border-t border-gray-100">
                                <Form
                                    form={aboutForm}
                                    layout="vertical"
                                    onFinish={handleAboutSubmit}
                                >
                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={setActiveTab}
                                        className="mb-6"
                                        items={[
                                            {
                                                key: 'en',
                                                label: (
                                                    <span className="text-sm font-semibold font-['Manrope']">
                                                        English (EN)
                                                    </span>
                                                ),
                                                children: (
                                                    <>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">About Title</span>}
                                                            name="homeAboutTitle_en"
                                                            rules={[
                                                                { required: true, message: 'Please enter about title in English' },
                                                                { max: 200, message: 'Maximum 200 characters allowed' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Who We Are"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">About Description</span>}
                                                            name="homeAboutDescription_en"
                                                            rules={[
                                                                { required: true, message: 'Please enter about description in English' },
                                                                { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="We are a leading property solutions provider..."
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Button Text</span>}
                                                            name="homeAboutButtonText_en"
                                                            rules={[
                                                                { required: true, message: 'Please enter button text in English' },
                                                                { max: 50, message: 'Maximum 50 characters allowed' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Learn More"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        {/* Step 1 */}
                                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                            <h4 className="font-semibold text-[#374151] mb-3">Step 1</h4>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 1 Title</span>}
                                                                name="homeAboutStep1Title_en"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <Input
                                                                    placeholder="Search Properties"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 1 Description</span>}
                                                                name="homeAboutStep1Des_en"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Browse through our extensive property listings"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </div>

                                                        {/* Step 2 */}
                                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                            <h4 className="font-semibold text-[#374151] mb-3">Step 2</h4>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 2 Title</span>}
                                                                name="homeAboutStep2Title_en"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <Input
                                                                    placeholder="Schedule Visit"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 2 Description</span>}
                                                                name="homeAboutStep2Des_en"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Book a viewing at your convenience"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </div>

                                                        {/* Step 3 */}
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <h4 className="font-semibold text-[#374151] mb-3">Step 3</h4>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 3 Title</span>}
                                                                name="homeAboutStep3Title_en"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <Input
                                                                    placeholder="Get Your Keys"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 3 Description</span>}
                                                                name="homeAboutStep3Des_en"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Complete the process and move in"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                    </>
                                                )
                                            },
                                            {
                                                key: 'vn',
                                                label: (
                                                    <span className="text-sm font-semibold font-['Manrope']">
                                                        Tiếng Việt (VN)
                                                    </span>
                                                ),
                                                children: (
                                                    <>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Về Chúng Tôi</span>}
                                                            name="homeAboutTitle_vn"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập tiêu đề' },
                                                                { max: 200, message: 'Tối đa 200 ký tự' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Chúng Tôi Là Ai"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả</span>}
                                                            name="homeAboutDescription_vn"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập mô tả' },
                                                                { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Chúng tôi là nhà cung cấp giải pháp bất động sản hàng đầu..."
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Văn Bản Nút</span>}
                                                            name="homeAboutButtonText_vn"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập văn bản nút' },
                                                                { max: 50, message: 'Tối đa 50 ký tự' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Tìm Hiểu Thêm"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        {/* Step 1 VN */}
                                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                            <h4 className="font-semibold text-[#374151] mb-3">Bước 1</h4>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Bước 1</span>}
                                                                name="homeAboutStep1Title_vn"
                                                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                                            >
                                                                <Input
                                                                    placeholder="Tìm Kiếm Bất Động Sản"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Bước 1</span>}
                                                                name="homeAboutStep1Des_vn"
                                                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Duyệt qua danh sách bất động sản phong phú của chúng tôi"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </div>

                                                        {/* Step 2 VN */}
                                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                            <h4 className="font-semibold text-[#374151] mb-3">Bước 2</h4>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Bước 2</span>}
                                                                name="homeAboutStep2Title_vn"
                                                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                                            >
                                                                <Input
                                                                    placeholder="Lên Lịch Xem Nhà"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Bước 2</span>}
                                                                name="homeAboutStep2Des_vn"
                                                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Đặt lịch xem nhà theo thời gian thuận tiện"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </div>

                                                        {/* Step 3 VN */}
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <h4 className="font-semibold text-[#374151] mb-3">Bước 3</h4>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Bước 3</span>}
                                                                name="homeAboutStep3Title_vn"
                                                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                                            >
                                                                <Input
                                                                    placeholder="Nhận Chìa Khóa"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Bước 3</span>}
                                                                name="homeAboutStep3Des_vn"
                                                                rules={[{ required: true, message: 'Bắt buộc' }]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Hoàn tất thủ tục và chuyển vào"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        ]}
                                    />

                                    <Form.Item
                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Button Link</span>}
                                        name="homeAboutButtonLink"
                                        rules={[{ required: true, message: 'Please enter button link' }]}
                                    >
                                        <Input
                                            placeholder="https://example.com/about"
                                            size="large"
                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                        />
                                    </Form.Item>

                                    {/* About Save Button */}
                                    <div className="flex gap-3 justify-end mt-6 pt-4">
                                        {pageData && (
                                            <Button
                                                size="large"
                                                onClick={() => {
                                                    fetchPageData();
                                                }}
                                                className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={aboutLoading}
                                            className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                        >
                                            {pageData ? 'Save About Section' : 'Create Page'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div
                            className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                            onClick={() => toggleAccordion('feature')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">Features Section</h3>
                                    <p className="text-sm text-gray-500 font-['Manrope']">Manage your features content</p>
                                </div>
                            </div>
                            <div className={`transform transition-transform duration-300 ${openAccordions.feature ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordions.feature ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-6 pt-2 bg-white border-t border-gray-100">
                                <Form
                                    form={featureForm}
                                    layout="vertical"
                                    onFinish={handleFeatureSubmit}
                                >
                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={setActiveTab}
                                        className="mb-6"
                                        items={[
                                            {
                                                key: 'en',
                                                label: (
                                                    <span className="text-sm font-semibold font-['Manrope']">
                                                        English (EN)
                                                    </span>
                                                ),
                                                children: (
                                                    <>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Feature Title</span>}
                                                            name="homeFeatureTitle_en"
                                                            rules={[
                                                                { max: 200, message: 'Maximum 200 characters allowed' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Our Key Features"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Feature Description</span>}
                                                            name="homeFeatureDescription_en"
                                                            rules={[
                                                                { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Discover what makes us unique..."
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                            />
                                                        </Form.Item>
                                                    </>
                                                )
                                            },
                                            {
                                                key: 'vn',
                                                label: (
                                                    <span className="text-sm font-semibold font-['Manrope']">
                                                        Tiếng Việt (VN)
                                                    </span>
                                                ),
                                                children: (
                                                    <>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Tính Năng</span>}
                                                            name="homeFeatureTitle_vn"
                                                            rules={[
                                                                { max: 200, message: 'Tối đa 200 ký tự' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Tính Năng Chính Của Chúng Tôi"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Tính Năng</span>}
                                                            name="homeFeatureDescription_vn"
                                                            rules={[
                                                                { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Khám phá điều gì làm cho chúng tôi độc đáo..."
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                            />
                                                        </Form.Item>
                                                    </>
                                                )
                                            }
                                        ]}
                                    />

                                    {/* Feature Save Button */}
                                    <div className="flex gap-3 justify-end mt-6 pt-4">
                                        {pageData && (
                                            <Button
                                                size="large"
                                                onClick={() => {
                                                    fetchPageData();
                                                }}
                                                className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={featureLoading}
                                            className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                        >
                                            {pageData ? 'Save Features Section' : 'Create Page'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </ConfigProvider>

            <style>{`
                .banner-uploader .ant-upload.ant-upload-select {
                    width: 100% !important;
                    height: 200px !important;
                    border: 2px dashed #d1d5db !important;
                    border-radius: 12px !important;
                    background: #f9fafb !important;
                    transition: all 0.3s ease !important;
                }
                .banner-uploader .ant-upload.ant-upload-select:hover {
                    border-color: #41398B !important;
                    background: #f3f4f6 !important;
                }
                .banner-uploader .ant-upload-list {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
