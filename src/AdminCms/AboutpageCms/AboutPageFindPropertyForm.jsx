import { useState } from 'react';
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

export default function AboutPageFindPropertyForm({
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
    const [findBgUrl, setFindBgUrl] = useState(pageData?.aboutFindBg || '');
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadAboutPageImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ aboutFindBg: uploadedUrl });
            setFindBgUrl(uploadedUrl);
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

    // Remove image
    const removeImage = () => {
        setFindBgUrl('');
        form.setFieldsValue({ aboutFindBg: '' });
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'Find Property Section' : 'Phần Tìm Bất Động Sản'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Manage about page find property content' : 'Quản lý nội dung tìm bất động sản'}
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
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Find Property Title
                                                        </span>
                                                    }
                                                    name="aboutFindTitle_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter find property title in English' },
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Find Your Dream Property"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Find Property Description
                                                        </span>
                                                    }
                                                    name="aboutFindDescription_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter find property description in English' },
                                                        { max: 500, message: 'Maximum 500 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Search through our extensive collection of properties to find the perfect match for you"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
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
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Tìm Bất Động Sản
                                                        </span>
                                                    }
                                                    name="aboutFindTitle_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề tìm bất động sản' },
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tìm Bất Động Sản Mơ Ước Của Bạn"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Tìm Bất Động Sản
                                                        </span>
                                                    }
                                                    name="aboutFindDescription_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập mô tả tìm bất động sản' },
                                                        { max: 500, message: 'Tối đa 500 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Tìm kiếm trong bộ sưu tập bất động sản phong phú của chúng tôi để tìm sự lựa chọn hoàn hảo cho bạn"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* Background Image Upload */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'Find Property Background Image' : 'Hình Nền Tìm Bất Động Sản'}
                                        <span className="text-xs text-gray-400 ml-2 font-normal">
                                            (Recommended: 1920x1080px, Max: 5MB)
                                        </span>
                                    </span>
                                }
                            >
                                <div className="space-y-3">
                                    {findBgUrl ? (
                                        <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                            <img
                                                src={findBgUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${findBgUrl}` : findBgUrl}
                                                alt="Find Property Background"
                                                className="w-full h-full object-cover"
                                            />
                                            {can('cms.aboutUs', 'edit') && (
                                                <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(findBgUrl)}
                                                        className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                        title="Preview"
                                                    >
                                                        <EyeOutlined className="text-[#41398B] text-lg" />
                                                    </button>
                                                    <Upload showUploadList={false} beforeUpload={handleBeforeUpload}>
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
                                                        onClick={removeImage}
                                                        className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                        title="Delete"
                                                    >
                                                        <X className="text-red-500 w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : can('cms.aboutUs', 'edit') ? (
                                        <Upload
                                            name="aboutFindBg"
                                            listType="picture-card"
                                            className="find-property-uploader"
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
                                    ) : (
                                        <div className="w-48 h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm font-['Manrope']">
                                                {activeTab === 'en' ? 'No image uploaded' : 'Chưa có hình ảnh'}
                                            </span>
                                        </div>
                                    )}

                                    <Form.Item
                                        name="aboutFindBg"
                                        noStyle
                                    >
                                        <Input type="hidden" />
                                    </Form.Item>
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
                                            ? (pageData ? 'Lưu Phần Tìm Bất Động Sản' : 'Tạo Trang')
                                            : (pageData ? 'Save Find Property Section' : 'Create Page')
                                        }
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                        .find-property-uploader .ant-upload.ant-upload-select {
                            width: 192px !important;
                            height: 144px !important;
                            border: 2px dashed #d1d5db !important;
                            border-radius: 12px !important;
                            background: #f9fafb !important;
                            transition: all 0.3s ease !important;
                        }
                        .find-property-uploader .ant-upload.ant-upload-select:hover {
                            border-color: #41398B !important;
                            background: #f3f4f6 !important;
                        }
                        .find-property-uploader .ant-upload-list {
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
