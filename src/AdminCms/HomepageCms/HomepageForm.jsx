import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import {
    getHomePage,
    createHomePage,
    updateHomePage,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { CommonToaster } from '@/Common/CommonToaster';
import HomePageBannerForm from './HomePageBannerForm';
import HomePageAboutForm from './HomePageAboutForm';
import HomePageFeatureForm from './HomePageFeatureForm';
import HomePageFaqForm from './HomePageFaqForm';
import HomePageFindPropertyForm from './HomePageFindPropertyForm';
import HomePageBlogForm from './HomePageBlogForm';
import HomePageSeoForm from './HomePageSeoForm';
import { validateVietnameseFields } from '@/utils/formValidation';

export default function HomepageForm() {
    const [bannerForm] = Form.useForm();
    const [aboutForm] = Form.useForm();
    const [featureForm] = Form.useForm();
    const [faqForm] = Form.useForm();
    const [findPropertyForm] = Form.useForm();
    const [blogForm] = Form.useForm();
    const [seoForm] = Form.useForm();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Accordion state - only one can be open at a time
    const [openAccordions, setOpenAccordions] = useState({
        banner: true,
        about: false,
        feature: false,
        faq: false,
        findProperty: false,
        blog: false,
        seo: false
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            about: key === 'about' ? !prev.about : false,
            feature: key === 'feature' ? !prev.feature : false,
            faq: key === 'faq' ? !prev.faq : false,
            findProperty: key === 'findProperty' ? !prev.findProperty : false,
            blog: key === 'blog' ? !prev.blog : false,
            seo: key === 'seo' ? !prev.seo : false
        }));
    };
    const [bannerLoading, setBannerLoading] = useState(false);
    const [aboutLoading, setAboutLoading] = useState(false);
    const [featureLoading, setFeatureLoading] = useState(false);
    const [faqLoading, setFaqLoading] = useState(false);
    const [findPropertyLoading, setFindPropertyLoading] = useState(false);
    const [blogLoading, setBlogLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);

    const { language } = useLanguage();
    const headerLang = language === 'vi' ? 'vn' : 'en';

    // Fetch the home page data
    const fetchPageData = async () => {
        try {
            setLoading(true);
            const response = await getHomePage();
            const page = response.data.data;

            if (page) {
                setPageData(page);

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
                    homeAboutSubTitle_en: page.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: page.homeAboutSubTitle_vn,
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
                    homeFeatureButtonText_en: page.homeFeatureButtonText_en,
                    homeFeatureButtonText_vn: page.homeFeatureButtonText_vn,
                    homeFeatureButtonLink: page.homeFeatureButtonLink,
                });

                // Set FAQ Form
                faqForm.setFieldsValue({
                    homeFaqImageTitle_en: page.homeFaqImageTitle_en,
                    homeFaqImageTitle_vn: page.homeFaqImageTitle_vn,
                    homeFaqImageDescription_en: page.homeFaqImageDescription_en,
                    homeFaqImageDescription_vn: page.homeFaqImageDescription_vn,
                    homeFaqImageButtonText_en: page.homeFaqImageButtonText_en,
                    homeFaqImageButtonText_vn: page.homeFaqImageButtonText_vn,
                    homeFaqImageButtonLink: page.homeFaqImageButtonLink,
                    homeFaqBg: page.homeFaqBg,
                    homeFaqTitle_en: page.homeFaqTitle_en,
                    homeFaqTitle_vn: page.homeFaqTitle_vn,
                    homeFaqDescription_en: page.homeFaqDescription_en,
                    homeFaqDescription_vn: page.homeFaqDescription_vn,
                    faqs: page.faqs || [{ header_en: '', content_en: '', header_vn: '', content_vn: '' }],
                });

                // Set Find Property Form
                findPropertyForm.setFieldsValue({
                    homeFindTitle_en: page.homeFindTitle_en,
                    homeFindTitle_vn: page.homeFindTitle_vn,
                    homeFindDescription_en: page.homeFindDescription_en,
                    homeFindDescription_vn: page.homeFindDescription_vn,
                    homeFindBg: page.homeFindBg,
                });

                // Set Blog Form
                blogForm.setFieldsValue({
                    homeBlogTitle_en: page.homeBlogTitle_en,
                    homeBlogTitle_vn: page.homeBlogTitle_vn,
                    homeBlogDescription_en: page.homeBlogDescription_en,
                    homeBlogDescription_vn: page.homeBlogDescription_vn,
                });

                // Set SEO Form
                seoForm.setFieldsValue({
                    homeSeoMetaTitle_en: page.homeSeoMetaTitle_en,
                    homeSeoMetaTitle_vn: page.homeSeoMetaTitle_vn,
                    homeSeoMetaDescription_en: page.homeSeoMetaDescription_en,
                    homeSeoMetaDescription_vn: page.homeSeoMetaDescription_vn,
                    homeSeoMetaKeywords_en: page.homeSeoMetaKeywords_en || [],
                    homeSeoMetaKeywords_vn: page.homeSeoMetaKeywords_vn || [],
                    homeSeoSlugUrl_en: page.homeSeoSlugUrl_en,
                    homeSeoSlugUrl_vn: page.homeSeoSlugUrl_vn,
                    homeSeoCanonicalUrl_en: page.homeSeoCanonicalUrl_en,
                    homeSeoCanonicalUrl_vn: page.homeSeoCanonicalUrl_vn,
                    homeSeoSchemaType_en: page.homeSeoSchemaType_en,
                    homeSeoSchemaType_vn: page.homeSeoSchemaType_vn,
                    homeSeoOgTitle_en: page.homeSeoOgTitle_en,
                    homeSeoOgTitle_vn: page.homeSeoOgTitle_vn,
                    homeSeoOgDescription_en: page.homeSeoOgDescription_en,
                    homeSeoOgDescription_vn: page.homeSeoOgDescription_vn,
                    homeSeoAllowIndexing: page.homeSeoAllowIndexing !== undefined ? page.homeSeoAllowIndexing : true,
                    homeSeoOgImages: page.homeSeoOgImages || [],
                });
            } else {
                setPageData(null);
                bannerForm.resetFields();
                aboutForm.resetFields();
                featureForm.resetFields();
                faqForm.resetFields();
                findPropertyForm.resetFields();
                blogForm.resetFields();
                seoForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPageData(null);
                bannerForm.resetFields();
                aboutForm.resetFields();
                featureForm.resetFields();
                faqForm.resetFields();
                findPropertyForm.resetFields();
                blogForm.resetFields();
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

            const payload = {
                ...values,
                // Include existing about data
                ...(pageData && {
                    homeAboutSubTitle_en: pageData.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: pageData.homeAboutSubTitle_vn,
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
                    homeFeatureButtonText_en: pageData.homeFeatureButtonText_en,
                    homeFeatureButtonText_vn: pageData.homeFeatureButtonText_vn,
                    homeFeatureButtonLink: pageData.homeFeatureButtonLink,
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
                    homeAboutSubTitle_en: pageData.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: pageData.homeAboutSubTitle_vn,
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

    // Handle FAQ form submission
    const handleFaqSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setFaqLoading(true);

            const payload = {
                ...values,
                // Include existing data from other sections
                ...(pageData && {
                    heroTitle_en: pageData.heroTitle_en,
                    heroDescription_en: pageData.heroDescription_en,
                    heroTitle_vn: pageData.heroTitle_vn,
                    heroDescription_vn: pageData.heroDescription_vn,
                    backgroundImage: pageData.backgroundImage,
                    homeAboutSubTitle_en: pageData.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: pageData.homeAboutSubTitle_vn,
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
                CommonToaster('FAQ section updated successfully!', 'success');
            } else {
                // For first time creation, need all other sections too
                const bannerValues = await bannerForm.validateFields();
                const aboutValues = await aboutForm.validateFields();
                const featureValues = await featureForm.validateFields();
                await createHomePage({ ...payload, ...bannerValues, ...aboutValues, ...featureValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the required sections first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save FAQ section', 'error');
                console.error(error);
            }
        } finally {
            setFaqLoading(false);
        }
    };

    // Handle Find Property form submission
    const handleFindPropertySubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setFindPropertyLoading(true);

            const payload = {
                ...values,
                // Include existing data from other sections
                ...(pageData && {
                    heroTitle_en: pageData.heroTitle_en,
                    heroDescription_en: pageData.heroDescription_en,
                    heroTitle_vn: pageData.heroTitle_vn,
                    heroDescription_vn: pageData.heroDescription_vn,
                    backgroundImage: pageData.backgroundImage,
                    homeAboutSubTitle_en: pageData.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: pageData.homeAboutSubTitle_vn,
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
                    homeFaqImageTitle_en: pageData.homeFaqImageTitle_en,
                    homeFaqImageTitle_vn: pageData.homeFaqImageTitle_vn,
                    homeFaqImageDescription_en: pageData.homeFaqImageDescription_en,
                    homeFaqImageDescription_vn: pageData.homeFaqImageDescription_vn,
                    homeFaqImageButtonText_en: pageData.homeFaqImageButtonText_en,
                    homeFaqImageButtonText_vn: pageData.homeFaqImageButtonText_vn,
                    homeFaqImageButtonLink: pageData.homeFaqImageButtonLink,
                    homeFaqBg: pageData.homeFaqBg,
                    homeFaqTitle_en: pageData.homeFaqTitle_en,
                    homeFaqTitle_vn: pageData.homeFaqTitle_vn,
                    homeFaqDescription_en: pageData.homeFaqDescription_en,
                    homeFaqDescription_vn: pageData.homeFaqDescription_vn,
                    faqs: pageData.faqs,
                })
            };

            if (pageData) {
                await updateHomePage(pageData._id, payload);
                CommonToaster('Find Property section updated successfully!', 'success');
            } else {
                // For first time creation, need all other sections too
                const bannerValues = await bannerForm.validateFields();
                const aboutValues = await aboutForm.validateFields();
                await createHomePage({ ...payload, ...bannerValues, ...aboutValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the required sections first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save Find Property section', 'error');
                console.error(error);
            }
        } finally {
            setFindPropertyLoading(false);
        }
    };

    // Handle Blog form submission
    const handleBlogSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setBlogLoading(true);

            const payload = {
                ...values,
                // Include existing data from other sections
                ...(pageData && {
                    heroTitle_en: pageData.heroTitle_en,
                    heroDescription_en: pageData.heroDescription_en,
                    heroTitle_vn: pageData.heroTitle_vn,
                    heroDescription_vn: pageData.heroDescription_vn,
                    backgroundImage: pageData.backgroundImage,
                    homeAboutSubTitle_en: pageData.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: pageData.homeAboutSubTitle_vn,
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
                    homeFaqImageTitle_en: pageData.homeFaqImageTitle_en,
                    homeFaqImageTitle_vn: pageData.homeFaqImageTitle_vn,
                    homeFaqImageDescription_en: pageData.homeFaqImageDescription_en,
                    homeFaqImageDescription_vn: pageData.homeFaqImageDescription_vn,
                    homeFaqImageButtonText_en: pageData.homeFaqImageButtonText_en,
                    homeFaqImageButtonText_vn: pageData.homeFaqImageButtonText_vn,
                    homeFaqImageButtonLink: pageData.homeFaqImageButtonLink,
                    homeFaqBg: pageData.homeFaqBg,
                    homeFaqTitle_en: pageData.homeFaqTitle_en,
                    homeFaqTitle_vn: pageData.homeFaqTitle_vn,
                    homeFaqDescription_en: pageData.homeFaqDescription_en,
                    homeFaqDescription_vn: pageData.homeFaqDescription_vn,
                    faqs: pageData.faqs,
                    homeFindTitle_en: pageData.homeFindTitle_en,
                    homeFindTitle_vn: pageData.homeFindTitle_vn,
                    homeFindDescription_en: pageData.homeFindDescription_en,
                    homeFindDescription_vn: pageData.homeFindDescription_vn,
                    homeFindBg: pageData.homeFindBg,
                })
            };

            if (pageData) {
                await updateHomePage(pageData._id, payload);
                CommonToaster('Blog section updated successfully!', 'success');
            } else {
                // For first time creation, need all other sections too
                const bannerValues = await bannerForm.validateFields();
                const aboutValues = await aboutForm.validateFields();
                await createHomePage({ ...payload, ...bannerValues, ...aboutValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the required sections first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save Blog section', 'error');
                console.error(error);
            }
        } finally {
            setBlogLoading(false);
        }
    };

    // Handle SEO form submission
    const handleSeoSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setSeoLoading(true);

            const payload = {
                ...values,
                // Include existing data from other sections
                ...(pageData && {
                    heroTitle_en: pageData.heroTitle_en,
                    heroDescription_en: pageData.heroDescription_en,
                    heroTitle_vn: pageData.heroTitle_vn,
                    heroDescription_vn: pageData.heroDescription_vn,
                    backgroundImage: pageData.backgroundImage,
                    homeAboutSubTitle_en: pageData.homeAboutSubTitle_en,
                    homeAboutSubTitle_vn: pageData.homeAboutSubTitle_vn,
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
                    homeFaqImageTitle_en: pageData.homeFaqImageTitle_en,
                    homeFaqImageTitle_vn: pageData.homeFaqImageTitle_vn,
                    homeFaqImageDescription_en: pageData.homeFaqImageDescription_en,
                    homeFaqImageDescription_vn: pageData.homeFaqImageDescription_vn,
                    homeFaqImageButtonText_en: pageData.homeFaqImageButtonText_en,
                    homeFaqImageButtonText_vn: pageData.homeFaqImageButtonText_vn,
                    homeFaqImageButtonLink: pageData.homeFaqImageButtonLink,
                    homeFaqBg: pageData.homeFaqBg,
                    homeFaqTitle_en: pageData.homeFaqTitle_en,
                    homeFaqTitle_vn: pageData.homeFaqTitle_vn,
                    homeFaqDescription_en: pageData.homeFaqDescription_en,
                    homeFaqDescription_vn: pageData.homeFaqDescription_vn,
                    faqs: pageData.faqs,
                    homeFindTitle_en: pageData.homeFindTitle_en,
                    homeFindTitle_vn: pageData.homeFindTitle_vn,
                    homeFindDescription_en: pageData.homeFindDescription_en,
                    homeFindDescription_vn: pageData.homeFindDescription_vn,
                    homeFindBg: pageData.homeFindBg,
                    homeBlogTitle_en: pageData.homeBlogTitle_en,
                    homeBlogTitle_vn: pageData.homeBlogTitle_vn,
                    homeBlogDescription_en: pageData.homeBlogDescription_en,
                    homeBlogDescription_vn: pageData.homeBlogDescription_vn,
                })
            };

            if (pageData) {
                await updateHomePage(pageData._id, payload);
                CommonToaster('SEO settings updated successfully!', 'success');
            } else {
                // For first time creation, need all other sections too
                const bannerValues = await bannerForm.validateFields();
                const aboutValues = await aboutForm.validateFields();
                await createHomePage({ ...payload, ...bannerValues, ...aboutValues });
                CommonToaster('Home page created successfully!', 'success');
            }

            fetchPageData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the required sections first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save SEO settings', 'error');
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

    // ... (rest of the component logic)

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
                {headerLang === 'en' ? 'Home Page Sections' : 'Các Phần Trang Chủ'}
            </h2>

            <div className="space-y-6">
                {/* Banner Section */}
                <HomePageBannerForm
                    form={bannerForm}
                    onSubmit={handleBannerSubmit}
                    loading={bannerLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.banner}
                    onToggle={() => toggleAccordion('banner')}
                    headerLang={headerLang}
                />

                {/* About Section */}
                <HomePageAboutForm
                    form={aboutForm}
                    onSubmit={handleAboutSubmit}
                    loading={aboutLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.about}
                    onToggle={() => toggleAccordion('about')}
                    headerLang={headerLang}
                />

                {/* Feature Section */}
                <HomePageFeatureForm
                    form={featureForm}
                    onSubmit={handleFeatureSubmit}
                    loading={featureLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.feature}
                    onToggle={() => toggleAccordion('feature')}
                    headerLang={headerLang}
                />

                {/* FAQ Section */}
                <HomePageFaqForm
                    form={faqForm}
                    onSubmit={handleFaqSubmit}
                    loading={faqLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.faq}
                    onToggle={() => toggleAccordion('faq')}
                    headerLang={headerLang}
                />

                {/* Find Property Section */}
                <HomePageFindPropertyForm
                    form={findPropertyForm}
                    onSubmit={handleFindPropertySubmit}
                    loading={findPropertyLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.findProperty}
                    onToggle={() => toggleAccordion('findProperty')}
                    headerLang={headerLang}
                />

                {/* Blog Section */}
                <HomePageBlogForm
                    form={blogForm}
                    onSubmit={handleBlogSubmit}
                    loading={blogLoading}
                    pageData={pageData}
                    onCancel={fetchPageData}
                    isOpen={openAccordions.blog}
                    onToggle={() => toggleAccordion('blog')}
                    headerLang={headerLang}
                />

                {/* SEO Section */}
                <HomePageSeoForm
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
