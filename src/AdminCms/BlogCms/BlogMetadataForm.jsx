import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Switch,
    Upload,
    ConfigProvider,
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { uploadBlogImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { X } from 'lucide-react';

export default function BlogMetadataForm({
    form,
    onSubmit,
    loading,
    blogData,
    onCancel,
    isOpen,
    onToggle,
    categories,
    isEditMode
}) {
    const [activeTab, setActiveTab] = useState('vn');
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Update main image when blogData changes
    useEffect(() => {
        if (blogData?.mainImage) {
            setMainImageUrl(blogData.mainImage);
        }
    }, [blogData]);

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadBlogImage(file);
            const uploadedUrl = response.data.url;

            form.setFieldsValue({ mainImage: uploadedUrl });
            setMainImageUrl(uploadedUrl);
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

    // Remove main image
    const removeMainImage = () => {
        setMainImageUrl('');
        form.setFieldsValue({ mainImage: '' });
        CommonToaster('Image removed', 'info');
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'Blog Metadata' : 'Metadata Blog'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Manage category, tags, author, and featured image' : 'Quản lý danh mục, thẻ, tác giả và hình đại diện'}
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Accordion Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSubmit}
                            onFinishFailed={onFormFinishFailed}
                            initialValues={{ published: true }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Author */}
                                <Form.Item
                                    label={
                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                            {activeTab === 'en' ? 'Author' : 'Tác Giả'}
                                        </span>
                                    }
                                    name="author"
                                    rules={[{ required: true, message: activeTab === 'en' ? 'Please enter author name' : 'Vui lòng nhập tên tác giả' }]}
                                >
                                    <Input
                                        placeholder={activeTab === 'en' ? 'Author name' : 'Tên tác giả'}
                                        size="large"
                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                    />
                                </Form.Item>

                                {/* Category */}
                                <Form.Item
                                    label={
                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                            {activeTab === 'en' ? 'Category' : 'Danh Mục'}
                                        </span>
                                    }
                                    name="category"
                                    rules={[{ required: true, message: activeTab === 'en' ? 'Please select a category' : 'Vui lòng chọn danh mục' }]}
                                >
                                    <Select
                                        placeholder={activeTab === 'en' ? 'Select Category' : 'Chọn Danh Mục'}
                                        size="large"
                                        className="rounded-[10px]"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {categories.map((cat) => (
                                            <Select.Option key={cat._id} value={cat._id}>
                                                {cat.name?.en || cat.name?.vi || 'Unnamed'}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            {/* Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item
                                    label={
                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                            Tags (EN)
                                        </span>
                                    }
                                    name={['tags', 'en']}
                                >
                                    <Select
                                        mode="tags"
                                        placeholder="Add tags..."
                                        size="large"
                                        className="rounded-[10px]"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                            Tags (VI)
                                        </span>
                                    }
                                    name={['tags', 'vi']}
                                >
                                    <Select
                                        mode="tags"
                                        placeholder="Thêm thẻ..."
                                        size="large"
                                        className="rounded-[10px]"
                                    />
                                </Form.Item>
                            </div>

                            {/* Published Status */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'Publishing Status' : 'Trạng Thái Xuất Bản'}
                                    </span>
                                }
                                name="published"
                                valuePropName="checked"
                            >
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <span className="font-semibold text-gray-700 font-['Manrope']">
                                        {activeTab === 'en' ? 'Visibility Status' : 'Trạng Thái Hiển Thị'}
                                    </span>
                                    <Switch
                                        checkedChildren={activeTab === 'en' ? 'Published' : 'Đã Xuất Bản'}
                                        unCheckedChildren={activeTab === 'en' ? 'Draft' : 'Bản Nháp'}
                                    />
                                </div>
                            </Form.Item>

                            {/* Featured Image */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'Featured Image' : 'Hình Đại Diện'}
                                        <span className="text-xs text-gray-400 ml-2 font-normal">
                                            (Recommended: 1200x630px, Max: 5MB)
                                        </span>
                                    </span>
                                }
                            >
                                <div className="space-y-3">
                                    {mainImageUrl ? (
                                        <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                            <img
                                                src={mainImageUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${mainImageUrl}` : mainImageUrl}
                                                alt="Featured"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Icon Buttons Overlay */}
                                            <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100">
                                                {/* Preview Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(mainImageUrl)}
                                                    className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                    title="Preview"
                                                >
                                                    <EyeOutlined className="text-[#41398B] text-lg" />
                                                </button>

                                                {/* Re-upload Button */}
                                                <Upload
                                                    showUploadList={false}
                                                    beforeUpload={handleBeforeUpload}
                                                >
                                                    <button
                                                        type="button"
                                                        className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                        title="Change Image"
                                                    >
                                                        <ReloadOutlined className="text-blue-600 text-lg" />
                                                    </button>
                                                </Upload>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={removeMainImage}
                                                    className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                    title="Delete"
                                                >
                                                    <X className="text-red-500 w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Upload
                                            name="mainImage"
                                            listType="picture-card"
                                            className="featured-uploader"
                                            showUploadList={false}
                                            beforeUpload={handleBeforeUpload}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-blue-600" />
                                                <div className="text-sm text-gray-500 font-['Manrope']">
                                                    {activeTab === 'en' ? 'Upload Image' : 'Tải Lên Hình'}
                                                </div>
                                            </div>
                                        </Upload>
                                    )}

                                    <Form.Item
                                        name="mainImage"
                                        noStyle
                                    >
                                        <Input type="hidden" />
                                    </Form.Item>
                                </div>
                            </Form.Item>

                            {/* Save Button */}
                            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                                <Button
                                    size="large"
                                    onClick={onCancel}
                                    className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                >
                                    {activeTab === 'vn' ? 'Hủy' : 'Cancel'}
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                >
                                    {activeTab === 'vn'
                                        ? (blogData ? 'Lưu Metadata' : 'Tạo Blog')
                                        : (blogData ? 'Save Metadata' : 'Create Blog')
                                    }
                                </Button>
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                    .featured-uploader .ant-upload.ant-upload-select {
                        width: 192px !important;
                        height: 144px !important;
                        border: 2px dashed #d1d5db !important;
                        border-radius: 12px !important;
                        background: #f9fafb !important;
                        transition: all 0.3s ease !important;
                    }
                    .featured-uploader .ant-upload.ant-upload-select:hover {
                        border-color: #41398B !important;
                        background: #f3f4f6 !important;
                    }
                    .featured-uploader .ant-upload-list {
                        display: none !important;
                    }
                `}</style>
                </div>
            </div>

            {/* Preview Modal */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                >
                    <div
                        className="relative max-w-4xl w-full rounded-xl overflow-hidden bg-black/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-3 right-3 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-full p-2 z-10 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={previewImage.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${previewImage}` : previewImage}
                            className="w-full h-full object-contain rounded-xl"
                            alt="Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
