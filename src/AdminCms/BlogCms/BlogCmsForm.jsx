import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getBlogById,
    createBlog,
    updateBlog,
    getCategories,
    getBlogPage,
    createBlogPage,
    updateBlogPage,
} from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import BlogMainForm from './BlogMainForm';
import BlogSeoForm from './BlogSeoForm';
import BlogBannerForm from './BlogBannerForm'; // Added
import { validateVietnameseFields } from '@/utils/formValidation';

export default function BlogCmsForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [mainForm] = Form.useForm();
    const [seoForm] = Form.useForm();
    const [bannerForm] = Form.useForm(); // Added

    const [blogData, setBlogData] = useState(null);
    const [pageData, setPageData] = useState(null); // Added for Page Data
    const [pageId, setPageId] = useState(null); // Added for Page ID
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Accordion state
    const [openAccordions, setOpenAccordions] = useState({
        banner: true, // Added
        main: false,
        seo: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            banner: key === 'banner' ? !prev.banner : false,
            main: key === 'main' ? !prev.main : false,
            seo: key === 'seo' ? !prev.seo : false,
        }));
    };

    const [mainLoading, setMainLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false); // Added

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

    // Fetch Blog Page Data (Banner etc)
    const fetchBlogPageData = async () => {
        try {
            const res = await getBlogPage();
            const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;

            if (data) {
                setPageData(data);
                setPageId(data._id);
                bannerForm.setFieldsValue({
                    blogTitle: data.blogTitle,
                    blogDescription: data.blogDescription,
                    blogBannerbg: data.blogBannerbg,
                });
            }
        } catch (error) {
            console.error('Failed to fetch blog page data', error);
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
                    category: blog.category,
                    mainImage: blog.mainImage,
                    tags: blog.tags,
                    published: blog.published !== undefined ? blog.published : true,
                });

                // Set SEO Form
                seoForm.setFieldsValue({
                    seoInformation: blog.seoInformation || {
                        metaTitle: { en: '', vi: '' },
                        metaDescription: { en: '', vi: '' },
                        metaKeywords: { en: [], vi: [] },
                        slugUrl: { en: '', vi: '' },
                        canonicalUrl: { en: '', vi: '' },
                        allowIndexing: { en: true, vi: true },
                    },
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
        fetchBlogPageData(); // Added
        if (isEditMode) {
            fetchBlogData();
        }
    }, [id]);

    // Handle Main form submission (Content + Metadata)
    const handleMainSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setMainLoading(true);

            const finalPayload = {
                ...(blogData && getPreservedData(blogData)),
                ...values
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
            const finalPayload = {
                ...(blogData && getPreservedData(blogData)),
                ...values
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

    // Handle Banner form submission
    const handleBannerSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setBannerLoading(true);

            if (pageId) {
                await updateBlogPage(pageId, values);
                CommonToaster('Blog Page Banner updated successfully!', 'success');
            } else {
                await createBlogPage(values);
                CommonToaster('Blog Page Banner created successfully!', 'success');
            }

            fetchBlogPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
            console.error(error);
        } finally {
            setBannerLoading(false);
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
            <h2 style={{
                color: '#111827',
                fontSize: '36px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '18px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>

            <div className="space-y-6">
                {/* Banner Section */}
                <BlogBannerForm
                    form={bannerForm}
                    onSubmit={handleBannerSubmit}
                    loading={bannerLoading}
                    pageData={pageData}
                    onCancel={() => navigate('/dashboard/cms/blogs')}
                    isOpen={openAccordions.banner}
                    onToggle={() => toggleAccordion('banner')}
                />

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
