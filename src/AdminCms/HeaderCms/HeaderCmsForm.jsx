import { useState, useEffect } from 'react';
import {
    Form,
    Button,
    ConfigProvider,
    Upload,
    Spin
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { getHeader, updateHeader, uploadHeaderImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { useLanguage } from '../../Language/LanguageContext';
import { usePermissions } from '../../Context/PermissionContext';
import { X } from 'lucide-react';

export default function HeaderCmsForm() {
    const { language } = useLanguage();
    const { can } = usePermissions();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [headerData, setHeaderData] = useState(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Translation object
    const translations = {
        en: {
            pageTitle: 'Header Management',
            pageDescription: 'Manage your website header logo',
            logoLabel: 'Header Logo',
            logoHint: '(Recommended: 200x60px, Max: 5MB)',
            uploadImage: 'Upload Logo',
            saveButton: 'Save Header',
            cancelButton: 'Cancel',
            fetchError: 'Failed to fetch header data',
            uploadSuccess: 'Logo uploaded successfully!',
            uploadError: 'Failed to upload logo',
            updateSuccess: 'Header updated successfully!',
            updateError: 'Failed to update header',
            imageRemoved: 'Logo removed',
            invalidFileType: 'You can only upload image files!',
            fileSizeError: 'Image must be smaller than 5MB!',
        },
        vi: {
            pageTitle: 'Quản lý Header',
            pageDescription: 'Quản lý logo header trang web',
            logoLabel: 'Logo Header',
            logoHint: '(Khuyến nghị: 200x60px, Tối đa: 5MB)',
            uploadImage: 'Tải Lên Logo',
            saveButton: 'Lưu Header',
            cancelButton: 'Hủy',
            fetchError: 'Không thể tải dữ liệu header',
            uploadSuccess: 'Tải lên logo thành công!',
            uploadError: 'Không thể tải lên logo',
            updateSuccess: 'Cập nhật header thành công!',
            updateError: 'Không thể cập nhật header',
            imageRemoved: 'Đã xóa logo',
            invalidFileType: 'Bạn chỉ có thể tải lên file hình ảnh!',
            fileSizeError: 'Hình ảnh phải nhỏ hơn 5MB!',
        }
    };

    const t = translations[language];

    // Fetch header data
    useEffect(() => {
        fetchHeaderData();
    }, []);

    const fetchHeaderData = async () => {
        try {
            setFetchLoading(true);
            const response = await getHeader();
            const data = response.data.data;
            setHeaderData(data);
            setLogoUrl(data?.headerLogo || '');
            form.setFieldsValue({
                headerLogo: data?.headerLogo || ''
            });
        } catch (error) {
            console.error('Error fetching header:', error);
            CommonToaster(t.fetchError, 'error');
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadHeaderImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ headerLogo: uploadedUrl });
            setLogoUrl(uploadedUrl);
            CommonToaster(t.uploadSuccess, 'success');

            return false;
        } catch (error) {
            CommonToaster(t.uploadError, 'error');
            console.error(error);
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleBeforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            CommonToaster(t.invalidFileType, 'error');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            CommonToaster(t.fileSizeError, 'error');
            return Upload.LIST_IGNORE;
        }
        handleImageUpload(file);
        return false;
    };

    // Remove logo
    const removeLogo = () => {
        setLogoUrl('');
        form.setFieldsValue({ headerLogo: '' });
        CommonToaster(t.imageRemoved, 'info');
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await updateHeader(values);
            CommonToaster(t.updateSuccess, 'success');
            fetchHeaderData();
        } catch (error) {
            console.error('Error updating header:', error);
            CommonToaster(t.updateError, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        form.setFieldsValue({
            headerLogo: headerData?.headerLogo || ''
        });
        setLogoUrl(headerData?.headerLogo || '');
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                    <Spin size="large" />
                </ConfigProvider>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 font-['Manrope']">
                    {t.pageTitle}
                </h1>
                <p className="text-sm text-gray-500 font-['Manrope']">
                    {t.pageDescription}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                <div className="p-8">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            disabled={!can('cms.header', 'edit')}
                        >
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {t.logoLabel}
                                        <span className="text-xs text-gray-400 ml-2 font-normal">
                                            {t.logoHint}
                                        </span>
                                    </span>
                                }
                            >
                                <div className="space-y-3">
                                    {logoUrl ? (
                                        <div className="relative w-64 h-24 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                            <img
                                                src={logoUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${logoUrl}` : logoUrl}
                                                alt="Header Logo"
                                                className="w-full h-full object-contain p-2"
                                            />
                                            {/* Icon Buttons Overlay */}
                                            <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                                                {/* Preview Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(logoUrl)}
                                                    className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                    title="Preview"
                                                >
                                                    <EyeOutlined className="text-[#41398B] text-lg" />
                                                </button>

                                                {can('cms.header', 'edit') && (
                                                    <Upload
                                                        showUploadList={false}
                                                        beforeUpload={handleBeforeUpload}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                            title="Change Logo"
                                                        >
                                                            <ReloadOutlined className="text-blue-600 text-lg" />
                                                        </button>
                                                    </Upload>
                                                )}

                                                {can('cms.header', 'edit') && (
                                                    <button
                                                        type="button"
                                                        onClick={removeLogo}
                                                        className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                        title="Delete"
                                                    >
                                                        <X className="text-red-500 w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        can('cms.header', 'edit') ? (
                                            <Upload
                                                name="headerLogo"
                                                listType="picture-card"
                                                className="logo-uploader"
                                                showUploadList={false}
                                                beforeUpload={handleBeforeUpload}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                    <div className="text-sm text-gray-500 font-['Manrope']">
                                                        {t.uploadImage}
                                                    </div>
                                                </div>
                                            </Upload>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
                                                No logo uploaded
                                            </div>
                                        )
                                    )}

                                    <Form.Item
                                        name="headerLogo"
                                        noStyle
                                    >
                                        <input type="hidden" />
                                    </Form.Item>
                                </div>
                            </Form.Item>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-100">
                                {headerData && (
                                    <Button
                                        size="large"
                                        onClick={handleCancel}
                                        className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        {t.cancelButton}
                                    </Button>
                                )}
                                {can('cms.header', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {t.saveButton}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                    .logo-uploader .ant-upload.ant-upload-select {
                        width: 256px !important;
                        height: 96px !important;
                        border: 2px dashed #d1d5db !important;
                        border-radius: 12px !important;
                        background: #f9fafb !important;
                        transition: all 0.3s ease !important;
                    }
                    .logo-uploader .ant-upload.ant-upload-select:hover {
                        border-color: #41398B !important;
                        background: #f3f4f6 !important;
                    }
                    .logo-uploader .ant-upload-list {
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
                        className="relative max-w-4xl w-full rounded-xl overflow-hidden bg-white p-8"
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