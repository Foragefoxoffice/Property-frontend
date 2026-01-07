import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { uploadAboutPageImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';
import { X } from 'lucide-react';

const { TextArea } = Input;

export default function AboutAgentForm({
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
    const [agentImageUrl, setAgentImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Update agent image when pageData changes
    useEffect(() => {
        if (pageData?.aboutAgentImage) {
            setAgentImageUrl(pageData.aboutAgentImage);
        }
    }, [pageData]);

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadAboutPageImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ aboutAgentImage: uploadedUrl });
            setAgentImageUrl(uploadedUrl);
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

    // Remove agent image
    const removeAgentImage = () => {
        setAgentImageUrl('');
        form.setFieldsValue({ aboutAgentImage: '' });
        CommonToaster('Image removed', 'info');
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'About Our Agents' : 'Về Đội Ngũ Của Chúng Tôi'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Manage agent section content' : 'Quản lý nội dung phần đội ngũ'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSubmit}
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
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Title</span>}
                                                    name="aboutAgentTitle_en"
                                                    rules={[{ max: 200, message: 'Max 200 characters' }]}
                                                >
                                                    <Input placeholder="Meet Our Agents" size="large" className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Subtitle</span>}
                                                    name="aboutAgentSubTitle_en"
                                                    rules={[{ max: 200, message: 'Max 200 characters' }]}
                                                >
                                                    <Input placeholder="Professional & Experienced" size="large" className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Description</span>}
                                                    name="aboutAgentDescription_en"
                                                >
                                                    <TextArea placeholder="Short description..." rows={3} className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Content</span>}
                                                    name="aboutAgentContent_en"
                                                >
                                                    <TextArea placeholder="Detailed content..." rows={5} className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Button Text</span>}
                                                    name="aboutAgentButtonText_en"
                                                    rules={[{ max: 50, message: 'Max 50 characters' }]}
                                                >
                                                    <Input placeholder="Contact Us" size="large" className="rounded-[10px]" />
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
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề</span>}
                                                    name="aboutAgentTitle_vn"
                                                    rules={[{ max: 200, message: 'Tối đa 200 ký tự' }]}
                                                >
                                                    <Input placeholder="Gặp Gỡ Chuyên Viên" size="large" className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Phụ</span>}
                                                    name="aboutAgentSubTitle_vn"
                                                    rules={[{ max: 200, message: 'Tối đa 200 ký tự' }]}
                                                >
                                                    <Input placeholder="Chuyên Nghiệp & Giàu Kinh Nghiệm" size="large" className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả</span>}
                                                    name="aboutAgentDescription_vn"
                                                >
                                                    <TextArea placeholder="Mô tả ngắn..." rows={3} className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Nội Dung</span>}
                                                    name="aboutAgentContent_vn"
                                                >
                                                    <TextArea placeholder="Nội dung chi tiết..." rows={5} className="rounded-[10px]" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Nút Bấm</span>}
                                                    name="aboutAgentButtonText_vn"
                                                    rules={[{ max: 50, message: 'Tối đa 50 ký tự' }]}
                                                >
                                                    <Input placeholder="Liên Hệ Ngay" size="large" className="rounded-[10px]" />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            <div className="grid">
                                <Form.Item
                                    label={
                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                            Button Link
                                        </span>
                                    }
                                    name="aboutAgentButtonLink"
                                >
                                    <Input placeholder="/contact-us" size="large" className="rounded-[10px]" />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                            {activeTab === 'en' ? 'Agent Image' : 'Hình Ảnh Đội Ngũ'}
                                            <span className="text-xs text-gray-400 ml-2 font-normal">
                                                (Max: 5MB)
                                            </span>
                                        </span>
                                    }
                                >
                                    <div className="space-y-3">
                                        {agentImageUrl ? (
                                            <div className="relative w-50 h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                                <img
                                                    src={agentImageUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${agentImageUrl}` : agentImageUrl}
                                                    alt="Agent"
                                                    className="w-full h-full object-cover"
                                                />
                                                {can('cms.aboutUs', 'edit') && (
                                                    <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewImage(agentImageUrl)}
                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                            title="Preview"
                                                        >
                                                            <EyeOutlined className="text-[#41398B] text-lg" />
                                                        </button>
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
                                                        <button
                                                            type="button"
                                                            onClick={removeAgentImage}
                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                            title="Delete"
                                                        >
                                                            <X className="text-red-500 w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            can('cms.aboutUs', 'edit') && (
                                                <Upload
                                                    name="aboutAgentImage"
                                                    listType="picture-card"
                                                    className="agent-uploader"
                                                    showUploadList={false}
                                                    beforeUpload={handleBeforeUpload}
                                                >
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                        <div className="text-sm text-gray-500 font-['Manrope']">
                                                            {activeTab === 'en' ? 'Upload Image' : 'Tải Lên Hình'}
                                                        </div>
                                                    </div>
                                                </Upload>
                                            )
                                        )}

                                        <Form.Item name="aboutAgentImage" noStyle>
                                            <Input type="hidden" />
                                        </Form.Item>
                                    </div>
                                </Form.Item>
                            </div>

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
                                            ? (pageData ? 'Lưu Thay Đổi' : 'Tạo Trang')
                                            : (pageData ? 'Save Changes' : 'Create Page')
                                        }
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                    .agent-uploader .ant-upload.ant-upload-select {
                        width: 100% !important;
                        height: 192px !important;
                        border: 2px dashed #d1d5db !important;
                        border-radius: 12px !important;
                        background: #f9fafb !important;
                        transition: all 0.3s ease !important;
                    }
                    .agent-uploader .ant-upload.ant-upload-select:hover {
                        border-color: #41398B !important;
                        background: #f3f4f6 !important;
                    }
                    .agent-uploader .ant-upload-list {
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
