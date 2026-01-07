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
import { X } from 'lucide-react';

const { TextArea } = Input;

export default function AboutPageSeoForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle
}) {
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState('en');
    const [previewImage, setPreviewImage] = useState(null);
    const [ogImages, setOgImages] = useState([]);

    // Initialize OG images from pageData
    useEffect(() => {
        if (pageData?.aboutSeoOgImages) {
            setOgImages(pageData.aboutSeoOgImages);
        }
    }, [pageData]);

    // Handle keyword input
    const handleKeywordKeyDown = (e, lang) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const keyword = e.target.value.trim();
            const currentKeywords = form.getFieldValue(`aboutSeoMetaKeywords_${lang}`) || [];
            form.setFieldsValue({
                [`aboutSeoMetaKeywords_${lang}`]: [...currentKeywords, keyword]
            });
            e.target.value = '';
        }
    };

    // Remove keyword
    const removeKeyword = (lang, index) => {
        const currentKeywords = form.getFieldValue(`aboutSeoMetaKeywords_${lang}`) || [];
        form.setFieldsValue({
            [`aboutSeoMetaKeywords_${lang}`]: currentKeywords.filter((_, i) => i !== index)
        });
    };

    // Handle OG Image upload
    const handleOgImageUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newImages = [...ogImages, e.target.result];
            setOgImages(newImages);
            form.setFieldsValue({ aboutSeoOgImages: newImages });
        };
        reader.readAsDataURL(file);
        return false; // Prevent auto upload
    };

    // Remove OG Image
    const removeOgImage = (index) => {
        const newImages = ogImages.filter((_, i) => i !== index);
        setOgImages(newImages);
        form.setFieldsValue({ aboutSeoOgImages: newImages });
    };

    // Handle form submission with OG images
    const handleFormSubmit = (values) => {
        onSubmit({ ...values, aboutSeoOgImages: ogImages });
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
                            {activeTab === 'en' ? 'SEO Settings' : 'Cài Đặt SEO'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Manage about page SEO and meta information' : 'Quản lý SEO trang giới thiệu và thông tin meta'}
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
                            disabled={!can('cms.aboutUs', 'edit')}
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
                                                {/* Meta Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Meta Title
                                                        </span>
                                                    }
                                                    name="aboutSeoMetaTitle_en"
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Enter meta title for SEO"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Meta Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Meta Description
                                                        </span>
                                                    }
                                                    name="aboutSeoMetaDescription_en"
                                                    rules={[
                                                        { max: 500, message: 'Maximum 500 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Enter meta description for SEO"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Meta Keywords */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Meta Keywords
                                                        </span>
                                                    }
                                                    name="aboutSeoMetaKeywords_en"
                                                    initialValue={[]}
                                                >
                                                    <div className="border border-[#d1d5db] rounded-[10px] px-3 py-2 min-h-[120px]">
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(form.getFieldValue('aboutSeoMetaKeywords_en') || []).map((kw, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="bg-[#41398B] px-3 py-1 text-white rounded-md flex items-center gap-2"
                                                                >
                                                                    <span className="text-sm">{kw}</span>
                                                                    {can('cms.aboutUs', 'edit') && (
                                                                        <button
                                                                            type="button"
                                                                            className="text-red-300 hover:text-red-100"
                                                                            onClick={() => removeKeyword('en', i)}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Type keyword & press Enter"
                                                            onKeyDown={(e) => handleKeywordKeyDown(e, 'en')}
                                                            className="outline-none w-full text-[15px] font-['Manrope']"
                                                            disabled={!can('cms.aboutUs', 'edit')}
                                                        />
                                                    </div>
                                                </Form.Item>

                                                {/* Slug URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Slug URL
                                                        </span>
                                                    }
                                                    name="aboutSeoSlugUrl_en"
                                                >
                                                    <Input
                                                        placeholder="about"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Canonical URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Canonical URL
                                                        </span>
                                                    }
                                                    name="aboutSeoCanonicalUrl_en"
                                                >
                                                    <Input
                                                        placeholder="https://example.com/about"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Schema Type */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Schema Type
                                                        </span>
                                                    }
                                                    name="aboutSeoSchemaType_en"
                                                >
                                                    <Select
                                                        placeholder="Select Schema Type"
                                                        size="large"
                                                        className="w-full"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                        options={[
                                                            { label: 'Product', value: 'Product' },
                                                            { label: 'RealEstateAgent', value: 'RealEstateAgent' },
                                                            { label: 'Residence', value: 'Residence' },
                                                            { label: 'Apartment', value: 'Apartment' },
                                                            { label: 'SingleFamilyResidence', value: 'SingleFamilyResidence' },
                                                            { label: 'House', value: 'House' },
                                                            { label: 'Hotel', value: 'Hotel' },
                                                            { label: 'Place', value: 'Place' },
                                                            { label: 'LocalBusiness', value: 'LocalBusiness' },
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
                                                    name="aboutSeoOgTitle_en"
                                                >
                                                    <Input
                                                        placeholder="Enter Open Graph title"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* OG Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            OG Description
                                                        </span>
                                                    }
                                                    name="aboutSeoOgDescription_en"
                                                >
                                                    <TextArea
                                                        placeholder="Enter Open Graph description"
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.aboutUs', 'edit')}
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
                                                {/* Meta Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Meta
                                                        </span>
                                                    }
                                                    name="aboutSeoMetaTitle_vn"
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tiêu đề meta cho SEO"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Meta Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Meta
                                                        </span>
                                                    }
                                                    name="aboutSeoMetaDescription_vn"
                                                    rules={[
                                                        { max: 500, message: 'Tối đa 500 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Nhập mô tả meta cho SEO"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Meta Keywords */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Từ Khóa Meta
                                                        </span>
                                                    }
                                                    name="aboutSeoMetaKeywords_vn"
                                                    initialValue={[]}
                                                >
                                                    <div className="border border-[#d1d5db] rounded-[10px] px-3 py-2 min-h-[120px]">
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(form.getFieldValue('aboutSeoMetaKeywords_vn') || []).map((kw, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="bg-[#41398B] px-3 py-1 text-white rounded-md flex items-center gap-2"
                                                                >
                                                                    <span className="text-sm">{kw}</span>
                                                                    {can('cms.aboutUs', 'edit') && (
                                                                        <button
                                                                            type="button"
                                                                            className="text-red-300 hover:text-red-100"
                                                                            onClick={() => removeKeyword('vn', i)}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Nhập từ khóa & nhấn Enter"
                                                            onKeyDown={(e) => handleKeywordKeyDown(e, 'vn')}
                                                            className="outline-none w-full text-[15px] font-['Manrope']"
                                                            disabled={!can('cms.aboutUs', 'edit')}
                                                        />
                                                    </div>
                                                </Form.Item>

                                                {/* Slug URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Đường Dẫn Slug
                                                        </span>
                                                    }
                                                    name="aboutSeoSlugUrl_vn"
                                                >
                                                    <Input
                                                        placeholder="gioi-thieu"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Canonical URL */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Đường Dẫn Canonical
                                                        </span>
                                                    }
                                                    name="aboutSeoCanonicalUrl_vn"
                                                >
                                                    <Input
                                                        placeholder="https://example.com/vn/gioi-thieu"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* Schema Type */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Loại Schema
                                                        </span>
                                                    }
                                                    name="aboutSeoSchemaType_vn"
                                                >
                                                    <Select
                                                        placeholder="Chọn loại Schema"
                                                        size="large"
                                                        className="w-full"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                        options={[
                                                            { label: 'Product', value: 'Product' },
                                                            { label: 'RealEstateAgent', value: 'RealEstateAgent' },
                                                            { label: 'Residence', value: 'Residence' },
                                                            { label: 'Apartment', value: 'Apartment' },
                                                            { label: 'SingleFamilyResidence', value: 'SingleFamilyResidence' },
                                                            { label: 'House', value: 'House' },
                                                            { label: 'Hotel', value: 'Hotel' },
                                                            { label: 'Place', value: 'Place' },
                                                            { label: 'LocalBusiness', value: 'LocalBusiness' },
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
                                                    name="aboutSeoOgTitle_vn"
                                                >
                                                    <Input
                                                        placeholder="Nhập tiêu đề Open Graph"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                {/* OG Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả OG
                                                        </span>
                                                    }
                                                    name="aboutSeoOgDescription_vn"
                                                >
                                                    <TextArea
                                                        placeholder="Nhập mô tả Open Graph"
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.aboutUs', 'edit')}
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
                                name="aboutSeoAllowIndexing"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch disabled={!can('cms.aboutUs', 'edit')} />
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
                                            {can('cms.aboutUs', 'edit') && (
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
                                            )}
                                        </div>
                                    ))}

                                    {/* Upload Box */}
                                    {can('cms.aboutUs', 'edit') && (
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
                                {can('cms.aboutUs', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
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
