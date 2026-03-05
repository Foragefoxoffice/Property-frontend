
import { useState, useEffect } from 'react';
import { Form, Spin, ConfigProvider } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    getBlogPage,
    createBlogPage,
    updateBlogPage,
} from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import BlogBannerForm from './BlogBannerForm';
import BlogPageSeoForm from './BlogPageSeoForm';
import { validateVietnameseFields } from '@/utils/formValidation';
import { useLanguage } from '@/Language/LanguageContext';
import { translations } from '@/Language/translations';

export default function BlogBannerPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [seoForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false);
    const [pageData, setPageData] = useState(null);
    const [pageId, setPageId] = useState(null);
    const [openSeo, setOpenSeo] = useState(false);
    const { language } = useLanguage();
    const t = translations[language];

    // Fetch News Page Data
    const fetchBlogPageData = async () => {
        try {
            setLoading(true);
            const res = await getBlogPage();
            const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;

            if (data) {
                setPageData(data);
                setPageId(data._id);
                form.setFieldsValue({
                    blogTitle: data.blogTitle,
                    blogDescription: data.blogDescription,
                    blogBannerbg: data.blogBannerbg,
                });
                seoForm.setFieldsValue({
                    blogSeoMetaTitle_vn: data.blogSeoMetaTitle_vn || '',
                    blogSeoMetaTitle_en: data.blogSeoMetaTitle_en || '',
                    blogSeoMetaDescription_vn: data.blogSeoMetaDescription_vn || '',
                    blogSeoMetaDescription_en: data.blogSeoMetaDescription_en || '',
                    blogSeoMetaKeywords_vn: data.blogSeoMetaKeywords_vn || [],
                    blogSeoMetaKeywords_en: data.blogSeoMetaKeywords_en || [],
                    blogSeoSlugUrl_vn: data.blogSeoSlugUrl_vn || 'tin-tuc',
                    blogSeoSlugUrl_en: data.blogSeoSlugUrl_en || 'blog',
                    blogSeoCanonicalUrl_vn: data.blogSeoCanonicalUrl_vn || '',
                    blogSeoCanonicalUrl_en: data.blogSeoCanonicalUrl_en || '',
                    blogSeoSchemaType_vn: data.blogSeoSchemaType_vn || '',
                    blogSeoSchemaType_en: data.blogSeoSchemaType_en || '',
                    blogSeoOgTitle_vn: data.blogSeoOgTitle_vn || '',
                    blogSeoOgTitle_en: data.blogSeoOgTitle_en || '',
                    blogSeoOgDescription_vn: data.blogSeoOgDescription_vn || '',
                    blogSeoOgDescription_en: data.blogSeoOgDescription_en || '',
                    blogSeoAllowIndexing: data.blogSeoAllowIndexing !== false,
                    blogSeoOgImage: data.blogSeoOgImage || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch blog page data', error);
            CommonToaster('Failed to fetch blog page data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogPageData();
    }, []);

    // Handle SEO form submission
    const handleSeoSubmit = async (values) => {
        try {
            setSeoLoading(true);
            if (pageId) {
                await updateBlogPage(pageId, values);
                CommonToaster('News Page SEO updated successfully!', 'success');
            } else {
                await createBlogPage(values);
                CommonToaster('News Page SEO created successfully!', 'success');
            }
            fetchBlogPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save SEO settings', 'error');
            console.error(error);
        } finally {
            setSeoLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setLoading(true);

            if (pageId) {
                await updateBlogPage(pageId, values);
                CommonToaster('News Page Banner updated successfully!', 'success');
            } else {
                await createBlogPage(values);
                CommonToaster('News Page Banner created successfully!', 'success');
            }

            fetchBlogPageData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save banner section', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 style={{
                color: '#111827',
                fontSize: '36px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '18px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                {t.blogBannerManagement}
            </h2>

            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <BlogBannerForm
                    form={form}
                    onSubmit={handleSubmit}
                    loading={loading}
                    pageData={pageData}
                    onCancel={() => navigate('/dashboard/cms/blogs')}
                    isOpen={true}
                    onToggle={() => { }}
                    permissionModule="cms.blogBanner"
                />
                <BlogPageSeoForm
                    form={seoForm}
                    onSubmit={handleSeoSubmit}
                    loading={seoLoading}
                    pageData={pageData}
                    onCancel={() => { }}
                    isOpen={openSeo}
                    onToggle={() => setOpenSeo(!openSeo)}
                    headerLang={language === 'vn' ? 'vn' : 'en'}
                />
            </div>
        </div>
    );
}
