import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Select,
    Switch,
    Upload,
    message
} from 'antd';
import { uploadTermsConditionsPageImage } from '../../Api/action';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { usePermissions } from '../../Context/PermissionContext';
import { X } from 'lucide-react';
import SeoPanel from '../../components/Admin/SeoPanel';
import { LabelRow, GenerateAllBanner, buildCmsContent, InputWithCount, TextAreaWithCount } from '../../components/Admin/CmsSeoUtils';
import { CommonToaster } from '@/Common/CommonToaster';

const { TextArea } = Input;

const KeywordTagsInput = ({ value = [], onChange, placeholder, disabled }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newKeyword = e.target.value.trim();
            // Ensure value is an array before spreading
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

export default function TermsCondionsSeoForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang
}) {
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState('vn');
    const [previewImage, setPreviewImage] = useState(null);
    const [ogImage, setOgImage] = useState('');
    const [seoAnalysis, setSeoAnalysis] = useState({ checks: {}, score: 0 });

    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang);
        }
    }, [headerLang]);
    const activeTabTitle = Form.useWatch(`termsconditionsSeoMetaTitle_${activeTab}`, form);
    const activeTabDesc = Form.useWatch(`termsconditionsSeoMetaDescription_${activeTab}`, form);
    const activeTabKeywords = Form.useWatch(`termsconditionsSeoMetaKeywords_${activeTab}`, form);
    const activeTabSlug = Form.useWatch(`termsconditionsSeoSlugUrl_${activeTab}`, form);
    const activeTabCanonical = Form.useWatch(`termsConditionSeoCanonicalUrl_${activeTab}`, form);
    const allowIndexing = Form.useWatch(`termsConditionSeoAllowIndexing`, form);
    const activeTabSchemaType = Form.useWatch(`termsConditionSeoSchemaType_${activeTab}`, form);
    const activeTabOgTitle = Form.useWatch(`termsConditionSeoOgTitle_${activeTab}`, form);
    const activeTabOgDesc = Form.useWatch(`termsConditionSeoOgDescription_${activeTab}`, form);

    const seoData = {
        focusKeyword: Array.isArray(activeTabKeywords) && activeTabKeywords.length > 0 ? activeTabKeywords[0] : "",
        title: activeTabTitle || "",
        description: activeTabDesc || "",
        slug: activeTabSlug || "",
        canonicalUrl: activeTabCanonical || "",
        noIndex: allowIndexing === false,
        schemaType: activeTabSchemaType || "",
        ogImage: ogImage || "",
    };

    // Initialize OG image from pageData
    useEffect(() => {
        if (pageData?.termsConditionSeoOgImage) {
            setOgImage(pageData.termsConditionSeoOgImage);
        } else if (pageData?.termsConditionSeoOgImages && pageData.termsConditionSeoOgImages.length > 0) {
            setOgImage(pageData.termsConditionSeoOgImages[0]);
        }
    }, [pageData]);

    // Force default values for Title and Slug
    useEffect(() => {
        form.setFieldsValue({
            termsconditionsSeoMetaTitle_en: 'Terms & Conditions',
            termsconditionsSeoSlugUrl_en: 'terms-and-conditions',
            termsconditionsSeoMetaTitle_vn: 'Điều Khoản Điều Kiện',
            termsconditionsSeoSlugUrl_vn: 'dieu-khoan-dieu-kien'
        });
    }, [form, pageData]);

    // Helper to render inline suggestion
    const renderSuggestion = (checkKey) => {
        const check = seoAnalysis?.checks?.[checkKey];
        if (check && !check.passed && check.suggestion) {
            return (
                <div style={{ color: '#f97316', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span>💡</span>
                    <span>{check.suggestion}</span>
                </div>
            );
        }
        return null;
    };

    const handleGenerate = (field) => {
        const content = buildCmsContent(activeTab, 'terms');
        const map = {
            metaTitle: `termsconditionsSeoMetaTitle_${activeTab}`,
            metaDescription: `termsconditionsSeoMetaDescription_${activeTab}`,
            metaKeywords: `termsconditionsSeoMetaKeywords_${activeTab}`,
            ogTitle: `termsConditionSeoOgTitle_${activeTab}`,
            ogDescription: `termsConditionSeoOgDescription_${activeTab}`,
        };
        const valMap = {
            metaTitle: content.metaTitle,
            metaDescription: content.metaDesc,
            metaKeywords: content.keywords,
            ogTitle: content.ogTitle,
            ogDescription: content.ogDesc,
        };
        if (map[field]) form.setFieldsValue({ [map[field]]: valMap[field] });
    };

    const handleGenerateAll = () => {
        const content = buildCmsContent(activeTab, 'terms');
        form.setFieldsValue({
            [`termsconditionsSeoMetaTitle_${activeTab}`]: content.metaTitle,
            [`termsconditionsSeoMetaDescription_${activeTab}`]: content.metaDesc,
            [`termsconditionsSeoMetaKeywords_${activeTab}`]: content.keywords,
            [`termsConditionSeoOgTitle_${activeTab}`]: content.ogTitle,
            [`termsConditionSeoOgDescription_${activeTab}`]: content.ogDesc,
        });
        CommonToaster(activeTab === 'en' ? t.toastAllFieldsAutoGenerated : t.toastAllFieldsAutoGeneratedVn, 'success');
    };

    // Handle OG Image upload
    const handleOgImageUpload = async (file) => {
        try {
            const res = await uploadTermsConditionsPageImage(file);
            if (res.data.success) {
                // Construct absolute URL for display/SEO
                const rawUrl = res.data.data.url;
                const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://dev.183housingsolutions.com';

                const absoluteUrl = rawUrl.startsWith('http')
                    ? rawUrl
                    : `${apiBase}${rawUrl}`;

                setOgImage(absoluteUrl);
                form.setFieldsValue({ termsConditionSeoOgImage: absoluteUrl });
                CommonToaster(t.toastImageUploaded, 'success');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            CommonToaster(t.toastImageUploadError, 'error');
        }
        return false; // Prevent auto upload
    };

    // Remove OG Image
    const removeOgImage = () => {
        setOgImage('');
        form.setFieldsValue({ termsConditionSeoOgImage: '' });
    };

    // Handle form submission with OG image
    const handleFormSubmit = (values) => {
        onSubmit({ ...values, termsConditionSeoOgImage: ogImage });
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
                            {headerLang === 'en' ? 'SEO Settings' : 'Cài Đặt SEO'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage Terms & Conditions page SEO and meta information' : 'Quản lý SEO và thông tin meta trang Điều Khoản & Điều Kiện'}
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
                            disabled={!can('cms.termsConditions', 'edit')}
                        >
                            <SeoPanel
                                seoData={seoData}
                                htmlContent={JSON.stringify(pageData) || ""}
                                onAnalysisUpdate={setSeoAnalysis}
                            />
                            <GenerateAllBanner onGenerateAll={handleGenerateAll} lang={activeTab} />

                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="mb-6"
                                items={[
                                    {
                                        key: 'vn',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                Tiếng Việt (VN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                {/* Meta Title */}
                                                <Form.Item
                                                    label={<LabelRow label="Tiêu Đề Meta" onGenerate={() => handleGenerate('metaTitle')} lang={activeTab} />}
                                                    name="termsconditionsSeoMetaTitle_vn"
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <InputWithCount
                                                        placeholder="Nhập tiêu đề meta cho SEO"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={true}
                                                        min={30}
                                                        max={60}
                                                        countLabel="Meta Title"
                                                        suggestions={<>{renderSuggestion('titleLengthOK')}{renderSuggestion('keywordInTitle')}</>}
                                                    />
                                                </Form.Item>

                                                {/* Meta Description */}
                                                <Form.Item
                                                    label={<LabelRow label="Mô Tả Meta" onGenerate={() => handleGenerate('metaDescription')} lang={activeTab} />}
                                                    name="termsconditionsSeoMetaDescription_vn"
                                                    rules={[
                                                        { max: 500, message: 'Tối đa 500 ký tự' }
                                                    ]}
                                                >
                                                    <TextAreaWithCount
                                                        placeholder="Nhập mô tả meta cho SEO"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        min={120}
                                                        max={160}
                                                        countLabel="Meta Description"
                                                        suggestions={<>{renderSuggestion('descriptionLengthOK')}{renderSuggestion('keywordInDescription')}</>}
                                                    />
                                                </Form.Item>

                                                {/* Meta Keywords */}
                                                <Form.Item
                                                    label={<LabelRow label="Từ Khóa Meta" onGenerate={() => handleGenerate('metaKeywords')} lang={activeTab} />}
                                                    name="termsconditionsSeoMetaKeywords_vn"
                                                    initialValue={[]}
                                                    extra={renderSuggestion('keywordInContent')}
                                                >
                                                    <KeywordTagsInput
                                                        placeholder="Nhập từ khóa & nhấn Enter"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Slug URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Đường Dẫn Slug
                                                        </span>
                                                    }
                                                    name="termsconditionsSeoSlugUrl_vn"
                                                    extra={renderSuggestion('keywordInSlug')}
                                                >
                                                    <Input
                                                        placeholder="dieu-khoan-dieu-kien"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={true}
                                                    />
                                                </Form.Item>

                                                {/* Canonical URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Đường Dẫn Canonical
                                                        </span>
                                                    }
                                                    name="termsConditionSeoCanonicalUrl_vn"
                                                >
                                                    <Input
                                                        placeholder="https://example.com/vn/dieu-khoan-dieu-kien"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Schema Type */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Loại Schema
                                                        </span>
                                                    }
                                                    name="termsConditionSeoSchemaType_vn"
                                                >
                                                    <Select
                                                        placeholder="Chọn loại Schema"
                                                        size="large"
                                                        className="w-full"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        options={[
                                                            { label: 'WebPage', value: 'WebPage' },
                                                            { label: 'AboutPage', value: 'AboutPage' },
                                                            { label: 'ContactPage', value: 'ContactPage' },
                                                            { label: 'Article', value: 'Article' },
                                                        ]}
                                                    />
                                                </Form.Item>

                                                {/* OG Title */}
                                                <Form.Item
                                                    label={<LabelRow label="Tiêu Đề OG (Chia Sẻ Xã Hội)" onGenerate={() => handleGenerate('ogTitle')} lang={activeTab} />}
                                                    name="termsConditionSeoOgTitle_vn"
                                                >
                                                    <InputWithCount
                                                        placeholder="Nhập tiêu đề Open Graph"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        min={40}
                                                        max={60}
                                                        countLabel="OG Title"
                                                    />
                                                </Form.Item>

                                                {/* OG Description */}
                                                <Form.Item
                                                    label={<LabelRow label="Mô Tả OG" onGenerate={() => handleGenerate('ogDescription')} lang={activeTab} />}
                                                    name="termsConditionSeoOgDescription_vn"
                                                >
                                                    <TextAreaWithCount
                                                        placeholder="Nhập mô tả Open Graph"
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        min={130}
                                                        max={200}
                                                        countLabel="OG Description"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    },
                                    {
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
                                                    label={<LabelRow label="Meta Title" onGenerate={() => handleGenerate('metaTitle')} lang={activeTab} />}
                                                    name="termsconditionsSeoMetaTitle_en"
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <InputWithCount
                                                        placeholder="Enter meta title for SEO"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={true}
                                                        min={30}
                                                        max={60}
                                                        countLabel="Meta Title"
                                                        suggestions={<>{renderSuggestion('titleLengthOK')}{renderSuggestion('keywordInTitle')}</>}
                                                    />
                                                </Form.Item>

                                                {/* Meta Description */}
                                                <Form.Item
                                                    label={<LabelRow label="Meta Description" onGenerate={() => handleGenerate('metaDescription')} lang={activeTab} />}
                                                    name="termsconditionsSeoMetaDescription_en"
                                                    rules={[
                                                        { max: 500, message: 'Maximum 500 characters allowed' }
                                                    ]}
                                                >
                                                    <TextAreaWithCount
                                                        placeholder="Enter meta description for SEO"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        min={120}
                                                        max={160}
                                                        countLabel="Meta Description"
                                                        suggestions={<>{renderSuggestion('descriptionLengthOK')}{renderSuggestion('keywordInDescription')}</>}
                                                    />
                                                </Form.Item>

                                                {/* Meta Keywords */}
                                                <Form.Item
                                                    label={<LabelRow label="Meta Keywords" onGenerate={() => handleGenerate('metaKeywords')} lang={activeTab} />}
                                                    name="termsconditionsSeoMetaKeywords_en"
                                                    initialValue={[]}
                                                    extra={renderSuggestion('keywordInContent')}
                                                >
                                                    <KeywordTagsInput
                                                        placeholder="Type keyword & press Enter"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Slug URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Slug URL
                                                        </span>
                                                    }
                                                    name="termsconditionsSeoSlugUrl_en"
                                                    extra={renderSuggestion('keywordInSlug')}
                                                >
                                                    <Input
                                                        placeholder="terms-and-conditions"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={true}
                                                    />
                                                </Form.Item>

                                                {/* Canonical URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Canonical URL
                                                        </span>
                                                    }
                                                    name="termsConditionSeoCanonicalUrl_en"
                                                >
                                                    <Input
                                                        placeholder="https://example.com/terms-conditions"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Schema Type */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Schema Type
                                                        </span>
                                                    }
                                                    name="termsConditionSeoSchemaType_en"
                                                >
                                                    <Select
                                                        placeholder="Select Schema Type"
                                                        size="large"
                                                        className="w-full"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        options={[
                                                            { label: 'WebPage', value: 'WebPage' },
                                                            { label: 'AboutPage', value: 'AboutPage' },
                                                            { label: 'ContactPage', value: 'ContactPage' },
                                                            { label: 'Article', value: 'Article' },
                                                        ]}
                                                    />
                                                </Form.Item>

                                                {/* OG Title */}
                                                <Form.Item
                                                    label={<LabelRow label="OG Title (Social Sharing)" onGenerate={() => handleGenerate('ogTitle')} lang={activeTab} />}
                                                    name="termsConditionSeoOgTitle_en"
                                                >
                                                    <InputWithCount
                                                        placeholder="Enter Open Graph title"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        min={40}
                                                        max={60}
                                                        countLabel="OG Title"
                                                    />
                                                </Form.Item>

                                                {/* OG Description */}
                                                <Form.Item
                                                    label={<LabelRow label="OG Description" onGenerate={() => handleGenerate('ogDescription')} lang={activeTab} />}
                                                    name="termsConditionSeoOgDescription_en"
                                                >
                                                    <TextAreaWithCount
                                                        placeholder="Enter Open Graph description"
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.termsConditions', 'edit')}
                                                        min={130}
                                                        max={200}
                                                        countLabel="OG Description"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    },
                                ]}
                            />

                            {/* Allow Indexing - Common for both languages */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'Allow Search Engine Indexing' : 'Cho Phép Lập Chỉ Mục'}
                                    </span>
                                }
                                name="termsConditionSeoAllowIndexing"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch disabled={!can('cms.termsConditions', 'edit')} />
                            </Form.Item>

                            {/* OG Images - Common for both languages */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'OG Image (Social Sharing)' : 'Hình Ảnh OG (Chia Sẻ Xã Hội)'}
                                    </span>
                                }
                            >
                                <div className="flex gap-4 flex-wrap">
                                    {ogImage ? (
                                        <div
                                            className="relative w-40 h-40 rounded-xl overflow-hidden border bg-gray-50 group"
                                        >
                                            <img src={ogImage} className="w-full h-full object-cover" alt="OG Image" />
                                            {can('cms.termsConditions', 'edit') && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(ogImage)}
                                                        className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                                                    >
                                                        <EyeOutlined className="text-[#41398B]" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={removeOgImage}
                                                        className="bg-white rounded-full p-2 shadow hover:bg-red-50"
                                                    >
                                                        <DeleteOutlined className="text-red-500" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Upload Box */
                                        can('cms.termsConditions', 'edit') && (
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
                                        )
                                    )}
                                </div>
                            </Form.Item>

                            {/* Save Button */}
                            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                                {pageData && (
                                    <Button
                                        size="large"
                                        onClick={onCancel}
                                        className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        {activeTab === 'vn' ? 'Hủy' : 'Cancel'}
                                    </Button>
                                )}
                                {can('cms.termsConditions', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Cài Đặt SEO' : 'Tạo Trang')
                                            : (pageData ? 'Save SEO Settings' : 'Create Page')
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