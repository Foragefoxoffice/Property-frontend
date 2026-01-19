import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Select,
    Switch,
    Upload
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { usePermissions } from '../../Context/PermissionContext';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import { X } from 'lucide-react';

const { TextArea } = Input;

const KeywordTagsInput = ({ value = [], onChange, placeholder, disabled }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newKeyword = e.target.value.trim();
            const currentKeywords = Array.isArray(value) ? value : [];
            onChange([...currentKeywords, newKeyword]);
            setInputValue('');
        }
    };

    const removeKeyword = (index) => {
        const currentKeywords = Array.isArray(value) ? value : [];
        const newKeywords = currentKeywords.filter((_, i) => i !== index);
        onChange(newKeywords);
    };

    return (
        <div className="border border-[#d1d5db] rounded-[10px] px-3 py-2 min-h-[120px]">
            <div className="flex flex-wrap gap-2 mb-2">
                {(Array.isArray(value) ? value : []).map((kw, i) => (
                    <div
                        key={i}
                        className="bg-[#41398B] px-3 py-1 text-white rounded-md flex items-center gap-2"
                    >
                        <span className="text-sm">{kw}</span>
                        <button
                            type="button"
                            className="text-red-300 hover:text-red-100"
                            onClick={() => removeKeyword(i)}
                            disabled={disabled}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="outline-none w-full text-[15px] font-['Manrope']"
                disabled={disabled}
            />
        </div>
    );
};

export default function BlogSeoForm({
    form,
    onSubmit,
    loading,
    blogData,
    onCancel,
    isOpen,
    onToggle,
    isEditMode
}) {
    const { can } = usePermissions();
    const { language } = useLanguage();
    const t = translations[language];
    const [activeTab, setActiveTab] = useState('en');
    const [previewImage, setPreviewImage] = useState(null);
    const [ogImages, setOgImages] = useState([]);

    // Initialize OG images from blogData
    useEffect(() => {
        if (blogData?.seoInformation?.ogImages) {
            setOgImages(blogData.seoInformation.ogImages);
        }
    }, [blogData]);

    // Sync Title and Slug defaults
    useEffect(() => {
        if (!blogData?.title) return;

        const currentSlugEn = form.getFieldValue(['seoInformation', 'slugUrl', 'en']);
        const currentSlugVi = form.getFieldValue(['seoInformation', 'slugUrl', 'vi']);
        const titleToSlug = blogData.title.en || blogData.title.vi;

        // If slugs are empty, auto-fill from title (prefer English)
        if ((!currentSlugEn || !currentSlugVi) && titleToSlug) {
            const slug = titleToSlug
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars
                .replace(/\s+/g, '-')         // Replace spaces with dashes
                .replace(/-+/g, '-');         // Remove duplicate dashes

            // Set BOTH to the same slug
            form.setFieldsValue({
                seoInformation: {
                    ...form.getFieldValue('seoInformation'),
                    slugUrl: {
                        en: currentSlugEn || slug,
                        vi: currentSlugVi || slug
                    }
                }
            });
        }
    }, [blogData, form]);

    // Handle OG Image upload
    const handleOgImageUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newImages = [...ogImages, e.target.result];
            setOgImages(newImages);
            form.setFieldsValue({
                seoInformation: {
                    ...form.getFieldValue('seoInformation'),
                    ogImages: newImages
                }
            });
        };
        reader.readAsDataURL(file);
        return false; // Prevent auto upload
    };

    // Remove OG Image
    const removeOgImage = (index) => {
        const newImages = ogImages.filter((_, i) => i !== index);
        setOgImages(newImages);
        form.setFieldsValue({
            seoInformation: {
                ...form.getFieldValue('seoInformation'),
                ogImages: newImages
            }
        });
    };

    // Handle form submission with OG images
    const handleFormSubmit = (values) => {
        const finalValues = {
            ...values,
            seoInformation: {
                ...values.seoInformation,
                ogImages: ogImages
            }
        };
        onSubmit(finalValues);
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {t.blogSeoSettings}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {t.blogSeoSettingsDesc}
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Accordion Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFormSubmit}
                            onFinishFailed={onFormFinishFailed}
                            disabled={!can('blogs.blogCms', 'edit')}
                        >
                            {/* Global Slug URL */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        Slug URL (Shared / Dùng chung)
                                    </span>
                                }
                                name={['seoInformation', 'slugUrl', 'en']}
                                normalize={(value) => value?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''}
                                help="The slug will be the same for both languages / Slash URL sẽ giống nhau cho cả hai ngôn ngữ"
                            >
                                <Input
                                    placeholder="my-blog-post"
                                    size="large"
                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                    onChange={(e) => {
                                        // Sync to VI
                                        const val = e.target.value?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
                                        form.setFieldValue(['seoInformation', 'slugUrl', 'vi'], val);
                                    }}
                                />
                            </Form.Item>

                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="mb-6"
                                items={[
                                    {
                                        forceRender: true,
                                        key: 'en',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                English (EN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                {/* Meta Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Meta Title
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'metaTitle', 'en']}
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Enter meta title for SEO"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Meta Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Meta Description
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'metaDescription', 'en']}
                                                    rules={[
                                                        { max: 500, message: 'Maximum 500 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Enter meta description for SEO"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                {/* Meta Keywords */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Meta Keywords
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'metaKeywords', 'en']}
                                                    initialValue={[]}
                                                >
                                                    <KeywordTagsInput
                                                        placeholder="Type keyword & press Enter"
                                                        disabled={!can('blogs.blogCms', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Canonical URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Canonical URL
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'canonicalUrl', 'en']}
                                                >
                                                    <Input
                                                        placeholder="https://example.com/blog/my-post"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Schema Type */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Schema Type
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'schemaType', 'en']}
                                                >
                                                    <Select
                                                        placeholder="Select Schema Type"
                                                        size="large"
                                                        className="w-full"
                                                        options={[
                                                            { label: 'Article', value: 'Article' },
                                                            { label: 'BlogPosting', value: 'BlogPosting' },
                                                            { label: 'NewsArticle', value: 'NewsArticle' },
                                                            { label: 'WebPage', value: 'WebPage' },
                                                        ]}
                                                    />
                                                </Form.Item>

                                                {/* OG Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            OG Title (Social Sharing)
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'ogTitle', 'en']}
                                                >
                                                    <Input
                                                        placeholder="Enter Open Graph title"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* OG Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            OG Description
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'ogDescription', 'en']}
                                                >
                                                    <TextArea
                                                        placeholder="Enter Open Graph description"
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    },
                                    {
                                        forceRender: true,
                                        key: 'vi',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                Tiếng Việt (VI)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                {/* Meta Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Meta
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'metaTitle', 'vi']}
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tiêu đề meta cho SEO"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Meta Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Meta
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'metaDescription', 'vi']}
                                                    rules={[
                                                        { max: 500, message: 'Tối đa 500 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Nhập mô tả meta cho SEO"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                {/* Meta Keywords */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Từ Khóa Meta
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'metaKeywords', 'vi']}
                                                    initialValue={[]}
                                                >
                                                    <KeywordTagsInput
                                                        placeholder="Nhập từ khóa & nhấn Enter"
                                                        disabled={!can('blogs.blogCms', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Canonical URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Đường Dẫn Canonical
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'canonicalUrl', 'vi']}
                                                >
                                                    <Input
                                                        placeholder="https://example.com/vn/blog/bai-viet"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Schema Type */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Loại Schema
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'schemaType', 'vi']}
                                                >
                                                    <Select
                                                        placeholder="Chọn loại Schema"
                                                        size="large"
                                                        className="w-full"
                                                        options={[
                                                            { label: 'Article', value: 'Article' },
                                                            { label: 'BlogPosting', value: 'BlogPosting' },
                                                            { label: 'NewsArticle', value: 'NewsArticle' },
                                                            { label: 'WebPage', value: 'WebPage' },
                                                        ]}
                                                    />
                                                </Form.Item>

                                                {/* OG Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề OG (Chia Sẻ Xã Hội)
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'ogTitle', 'vi']}
                                                >
                                                    <Input
                                                        placeholder="Nhập tiêu đề Open Graph"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* OG Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả OG
                                                        </span>
                                                    }
                                                    name={['seoInformation', 'ogDescription', 'vi']}
                                                >
                                                    <TextArea
                                                        placeholder="Nhập mô tả Open Graph"
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* Allow Indexing - Common for both languages */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'Allow Search Engine Indexing' : 'Cho Phép Lập Chỉ Mục'}
                                    </span>
                                }
                                name={['seoInformation', 'allowIndexing']}
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch />
                            </Form.Item>

                            {/* OG Images - Common for both languages */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'OG Images (Social Sharing)' : 'Hình Ảnh OG (Chia Sẻ Xã Hội)'}
                                    </span>
                                }
                            >
                                <div className="flex gap-4 flex-wrap">
                                    {ogImages.map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative w-40 h-40 rounded-xl overflow-hidden border bg-gray-50 group"
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt={`OG ${i + 1}`} />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(img)}
                                                    className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                                                >
                                                    <EyeOutlined className="text-[#41398B]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOgImage(i)}
                                                    className="bg-white rounded-full p-2 shadow hover:bg-red-50"
                                                >
                                                    <DeleteOutlined className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Upload Box */}
                                    <Upload
                                        accept="image/*"
                                        showUploadList={false}
                                        beforeUpload={handleOgImageUpload}
                                    >
                                        <div className="w-40 h-40 border-2 border-dashed border-[#d1d5db] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                            <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500 font-['Manrope']">
                                                {activeTab === 'en' ? 'Upload Image' : 'Tải Lên Hình'}
                                            </span>
                                        </div>
                                    </Upload>
                                </div>
                            </Form.Item>

                            {/* Save Button */}
                            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                                {blogData && (
                                    <Button
                                        size="large"
                                        onClick={onCancel}
                                        className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        {activeTab === 'vi' ? 'Hủy' : 'Cancel'}
                                    </Button>
                                )}
                                {can('blogs.blogCms', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                    >
                                        {activeTab === 'vi'
                                            ? (blogData ? 'Lưu Cài Đặt SEO' : 'Tạo Blog')
                                            : (blogData ? 'Save SEO Settings' : 'Create Blog')
                                        }
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>
                </div>
            </div>

            {/* Preview Modal */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                >
                    <div
                        className="relative max-w-2xl w-full rounded-xl overflow-hidden bg-black/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-3 right-3 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-full p-2 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={previewImage}
                            className="w-full h-full object-contain rounded-xl"
                            alt="Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
