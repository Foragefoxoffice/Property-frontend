import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getBlogById,
    createBlog,
    updateBlog,
    getCategories,
} from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import BlogMainForm from './BlogMainForm';
import BlogSeoForm from './BlogSeoForm';
import { validateVietnameseFields } from '@/utils/formValidation';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/Language/LanguageContext';
import { translations } from '@/Language/translations';

export default function BlogCmsForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [mainForm] = Form.useForm();
    const [seoForm] = Form.useForm();

    const [blogData, setBlogData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const { language } = useLanguage();
    const t = translations[language];

    // Accordion state
    const [openAccordions, setOpenAccordions] = useState({
        main: true,
        seo: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            main: key === 'main' ? !prev.main : false,
            seo: key === 'seo' ? !prev.seo : false,
        }));
    };

    const [mainLoading, setMainLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);

    // Helper to get preserved data
    const getPreservedData = (data) => {
        if (!data) return {};
        return {
            // Content & Metadata
            title: data.title,
            content: data.content,
            author: data.author,
            category: data.category,
            mainImage: data.mainImage,
            tags: data.tags,
            published: data.published,
            // SEO
            seoInformation: data.seoInformation,
        };
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.data);
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };


    // Fetch blog data
    const fetchBlogData = async () => {
        try {
            setLoading(true);
            const response = await getBlogById(id);
            const blog = response.data.data;

            if (blog) {
                setBlogData(blog);

                // Set Main Form (Content + Metadata)
                mainForm.setFieldsValue({
                    title: blog.title,
                    content: blog.content,
                    author: blog.author,
                    category: blog.category?._id || blog.category,
                    mainImage: blog.mainImage,
                    tags: blog.tags || { en: [], vi: [] },
                    published: blog.published !== undefined ? blog.published : true,
                });

                // Set SEO Form
                const backendSeo = blog.seoInformation || {
                    metaTitle: { en: '', vi: '' },
                    metaDescription: { en: '', vi: '' },
                    metaKeywords: { en: [], vi: [] },
                    slugUrl: { en: '', vi: '' },
                    canonicalUrl: { en: '', vi: '' },
                    allowIndexing: { en: true, vi: true },
                    ogImages: []
                };

                seoForm.setFieldsValue({
                    seoInformation: {
                        ...backendSeo,
                        allowIndexing: backendSeo.allowIndexing?.en !== false
                    }
                });
            } else {
                setBlogData(null);
                mainForm.resetFields();
                seoForm.resetFields();
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setBlogData(null);
                mainForm.resetFields();
                seoForm.resetFields();
            } else {
                CommonToaster('Failed to fetch blog data', 'error');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchBlogData();
        }
    }, [id]);

    // Handle Main form submission (Content + Metadata)
    const handleMainSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setMainLoading(true);

            const preserved = blogData ? getPreservedData(blogData) : {};

            const finalPayload = {
                ...preserved,
                ...values,
                title: {
                    ...preserved.title,
                    ...values.title
                },
                content: {
                    ...preserved.content,
                    ...values.content
                },
                tags: {
                    en: values.tags?.en || preserved.tags?.en || [],
                    vi: values.tags?.vi || preserved.tags?.vi || []
                },
                category: values.category || preserved.category,
                mainImage: values.mainImage || preserved.mainImage,
                published: values.published !== undefined ? !!values.published : !!preserved.published
            };

            if (blogData) {
                await updateBlog(blogData._id, finalPayload);
                CommonToaster('Blog updated successfully!', 'success');
            } else {
                await createBlog(finalPayload);
                CommonToaster('Blog created successfully!', 'success');
                navigate('/dashboard/cms/blogs');
                return;
            }

            fetchBlogData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save blog', 'error');
            console.error(error);
        } finally {
            setMainLoading(false);
        }
    };

    // Handle SEO form submission
    const handleSeoSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setSeoLoading(true);

            const preserved = blogData ? getPreservedData(blogData) : {};
            const seoValues = values.seoInformation || {};

            // Handle Allow Indexing (Boolean -> Object)
            const allowIndexingBool = seoValues.allowIndexing !== undefined
                ? seoValues.allowIndexing
                : (preserved.seoInformation?.allowIndexing?.en !== false);

            const allowIndexingObj = { en: allowIndexingBool, vi: allowIndexingBool };

            // Deep merge seoInformation
            const seoInfo = {
                // Base preserved (includes _id etc if any)
                ...preserved.seoInformation,
                // Top-level replacements from form
                allowIndexing: allowIndexingObj,
                ogImages: seoValues.ogImages || preserved.seoInformation?.ogImages || [],

                // Explicit localized merges
                metaTitle: { ...preserved.seoInformation?.metaTitle, ...seoValues.metaTitle },
                metaDescription: { ...preserved.seoInformation?.metaDescription, ...seoValues.metaDescription },
                metaKeywords: {
                    en: seoValues.metaKeywords?.en || preserved.seoInformation?.metaKeywords?.en || [],
                    vi: seoValues.metaKeywords?.vi || preserved.seoInformation?.metaKeywords?.vi || []
                },
                slugUrl: { ...preserved.seoInformation?.slugUrl, ...seoValues.slugUrl },
                canonicalUrl: { ...preserved.seoInformation?.canonicalUrl, ...seoValues.canonicalUrl },
                schemaType: { ...preserved.seoInformation?.schemaType, ...seoValues.schemaType },
                ogTitle: { ...preserved.seoInformation?.ogTitle, ...seoValues.ogTitle },
                ogDescription: { ...preserved.seoInformation?.ogDescription, ...seoValues.ogDescription },
            };

            const finalPayload = {
                ...preserved,
                ...values,
                seoInformation: seoInfo
            };

            if (blogData) {
                await updateBlog(blogData._id, finalPayload);
                CommonToaster('SEO section updated successfully!', 'success');
            } else {
                const mainValues = await mainForm.validateFields();
                await createBlog({ ...finalPayload, ...mainValues });
                CommonToaster('Blog created successfully!', 'success');
                navigate('/dashboard/cms/blogs');
                return;
            }

            fetchBlogData();
        } catch (error) {
            if (error.errorFields) {
                CommonToaster('Please fill in the Blog Content and Metadata first', 'error');
            } else {
                CommonToaster(error.response?.data?.message || 'Failed to save SEO section', 'error');
                console.error(error);
            }
        } finally {
            setSeoLoading(false);
        }
    };


    if (loading && !blogData && isEditMode) {
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
            <div className="flex items-center justify-start mb-6">
                <button
                    onClick={() => navigate('/dashboard/cms/blogs')}
                    className="w-10 h-10 flex cursor-pointer items-center justify-center bg-[#41398B] text-white rounded-full hover:bg-[#342d70] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <h2 style={{
                color: '#111827',
                fontSize: '36px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '18px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                {isEditMode ? t.editBlogPost : t.createNewBlogPost}
            </h2>

            <div className="space-y-6">

                {/* Main Section (Content + Metadata) */}
                <BlogMainForm
                    form={mainForm}
                    onSubmit={handleMainSubmit}
                    loading={mainLoading}
                    blogData={blogData}
                    onCancel={() => navigate('/dashboard/cms/blogs')}
                    isOpen={openAccordions.main}
                    onToggle={() => toggleAccordion('main')}
                    categories={categories}
                    isEditMode={isEditMode}
                />

                {/* SEO Section */}
                <BlogSeoForm
                    form={seoForm}
                    onSubmit={handleSeoSubmit}
                    loading={seoLoading}
                    blogData={blogData}
                    onCancel={() => navigate('/dashboard/cms/blogs')}
                    isOpen={openAccordions.seo}
                    onToggle={() => toggleAccordion('seo')}
                    isEditMode={isEditMode}
                />
            </div>
        </div>
    );
}
