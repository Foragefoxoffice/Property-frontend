
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
import { validateVietnameseFields } from '@/utils/formValidation';
import { useLanguage } from '@/Language/LanguageContext';
import { translations } from '@/Language/translations';

export default function BlogBannerPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pageData, setPageData] = useState(null);
    const [pageId, setPageId] = useState(null);
    const { language } = useLanguage();
    const t = translations[language];

    // Fetch Blog Page Data
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

    // Handle form submission
    const handleSubmit = async (values) => {
        if (!validateVietnameseFields(values)) return;
        try {
            setLoading(true);

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

            <div className="max-w-7xl mx-auto">
                <BlogBannerForm
                    form={form}
                    onSubmit={handleSubmit}
                    loading={loading}
                    pageData={pageData}
                    onCancel={() => navigate('/dashboard/cms/blogs')}
                    isOpen={true}
                    onToggle={() => { }} // No-op since we want it always open or ignored
                    permissionModule="cms.blogBanner"
                />
            </div>
        </div>
    );
}
