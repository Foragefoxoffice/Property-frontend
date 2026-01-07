import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    ConfigProvider,
    Upload,
    Spin,
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
    DeleteOutlined,
    WhatsAppOutlined
} from '@ant-design/icons';
import { getAgent, updateAgent, uploadAgentImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { onFormFinishFailed } from '@/utils/formValidation';
import { useLanguage } from '../../Language/LanguageContext';
import { usePermissions } from '../../Context/PermissionContext';
import { Link, MessageCircle, X } from 'lucide-react';

export default function AgentFormCms() {
    const { language } = useLanguage();
    const { can } = usePermissions();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [agentData, setAgentData] = useState(null);
    const [agentImageUrl, setAgentImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Translation object
    const translations = {
        en: {
            pageTitle: 'Agent Management',
            pageDescription: 'Manage your agent contact information',
            saveButton: 'Save Agent Info',
            cancelButton: 'Cancel',
            fetchError: 'Failed to fetch agent data',
            uploadSuccess: 'Image uploaded successfully!',
            uploadError: 'Failed to upload image',
            updateSuccess: 'Agent info updated successfully!',
            updateError: 'Failed to update agent info',
            imageRemoved: 'Image removed',
            invalidFileType: 'You can only upload image files!',
            fileSizeError: 'Image must be smaller than 5MB!',
            // Section Titles
            agentImageSection: 'Agent Image',
            contactInfoSection: 'Contact Information',
            socialMediaSection: 'Social Media Links',
            // Labels
            uploadAgentPhoto: 'Upload Agent Photo',
            uploadPhoto: 'Upload Photo',
            phoneNumbers: 'Phone Numbers',
            emailAddresses: 'Email Addresses',
            zaloLink: 'Zalo Link',
            messengerLink: 'Messenger Link',
            whatsappLink: 'WhatsApp Link',
            // Placeholders
            phonePlaceholder: '+1 234 567 8900',
            emailPlaceholder: 'contact@example.com',
            zaloPlaceholder: 'https://zalo.me/...',
            messengerPlaceholder: 'https://m.me/...',
            whatsappPlaceholder: 'https://wa.me/...',
            // Buttons
            addPhoneNumber: 'Add Phone Number',
            addEmailAddress: 'Add Email Address',
            // Validation Messages
            phoneRequired: 'Please enter a phone number',
            emailRequired: 'Please enter an email',
            validEmail: 'Please enter a valid email',
            validUrl: 'Please enter a valid URL',
        },
        vi: {
            pageTitle: 'Quản lý Đại lý',
            pageDescription: 'Quản lý thông tin liên hệ đại lý',
            saveButton: 'Lưu Thông tin Đại lý',
            cancelButton: 'Hủy',
            fetchError: 'Không thể tải dữ liệu đại lý',
            uploadSuccess: 'Tải lên hình ảnh thành công!',
            uploadError: 'Không thể tải lên hình ảnh',
            updateSuccess: 'Cập nhật thông tin đại lý thành công!',
            updateError: 'Không thể cập nhật thông tin đại lý',
            imageRemoved: 'Đã xóa hình ảnh',
            invalidFileType: 'Bạn chỉ có thể tải lên file hình ảnh!',
            fileSizeError: 'Hình ảnh phải nhỏ hơn 5MB!',
            // Section Titles
            agentImageSection: 'Hình Ảnh Đại Lý',
            contactInfoSection: 'Thông Tin Liên Hệ',
            socialMediaSection: 'Liên Kết Mạng Xã Hội',
            // Labels
            uploadAgentPhoto: 'Tải Lên Ảnh Đại Lý',
            uploadPhoto: 'Tải Lên Ảnh',
            phoneNumbers: 'Số Điện Thoại',
            emailAddresses: 'Địa Chỉ Email',
            zaloLink: 'Liên Kết Zalo',
            messengerLink: 'Liên Kết Messenger',
            whatsappLink: 'Liên Kết WhatsApp',
            // Placeholders
            phonePlaceholder: '+84 123 456 789',
            emailPlaceholder: 'lienhe@example.com',
            zaloPlaceholder: 'https://zalo.me/...',
            messengerPlaceholder: 'https://m.me/...',
            whatsappPlaceholder: 'https://wa.me/...',
            // Buttons
            addPhoneNumber: 'Thêm Số Điện Thoại',
            addEmailAddress: 'Thêm Địa Chỉ Email',
            // Validation Messages
            phoneRequired: 'Vui lòng nhập số điện thoại',
            emailRequired: 'Vui lòng nhập email',
            validEmail: 'Vui lòng nhập email hợp lệ',
            validUrl: 'Vui lòng nhập URL hợp lệ',
        }
    };

    const t = translations[language];

    // Fetch agent data
    useEffect(() => {
        fetchAgentData();
    }, []);

    const fetchAgentData = async () => {
        try {
            setFetchLoading(true);
            const response = await getAgent();
            const data = response.data.data;
            setAgentData(data);
            if (data) {
                setAgentImageUrl(data.agentImage || '');

                // Ensure arrays are properly initialized
                if (data.agentNumber && typeof data.agentNumber === 'string') {
                    data.agentNumber = [data.agentNumber];
                } else if (!data.agentNumber) {
                    data.agentNumber = [];
                }

                if (data.agentEmail && typeof data.agentEmail === 'string') {
                    data.agentEmail = [data.agentEmail];
                } else if (!data.agentEmail) {
                    data.agentEmail = [];
                }

                form.setFieldsValue(data);
            }
        } catch (error) {
            console.error('Error fetching agent:', error);
            // CommonToaster(t.fetchError, 'error'); // Suppress error if API not ready
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadAgentImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ agentImage: uploadedUrl });
            setAgentImageUrl(uploadedUrl);
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

    // Remove image
    const removeImage = () => {
        setAgentImageUrl('');
        form.setFieldValue('agentImage', '');
        CommonToaster(t.imageRemoved, 'info');
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await updateAgent(values);
            CommonToaster(t.updateSuccess, 'success');
            fetchAgentData();
        } catch (error) {
            console.error('Error updating agent:', error);
            CommonToaster(t.updateError, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        form.resetFields();
        if (agentData) {
            form.setFieldsValue(agentData);
            setAgentImageUrl(agentData.agentImage || '');
        } else {
            setAgentImageUrl('');
        }
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
                            onFinishFailed={onFormFinishFailed}
                            disabled={!can('cms.agent', 'edit')}
                            initialValues={{
                                agentNumber: [],
                                agentEmail: []
                            }}
                        >
                            <div className="space-y-6">
                                {/* Agent Image */}
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                                    <h3 className="text-xl font-bold text-[#41398B] mb-4 font-['Manrope']">{t.agentImageSection}</h3>
                                    <Form.Item label={<span className="font-semibold text-gray-700 font-['Manrope']">{t.uploadAgentPhoto}</span>}>
                                        <div className="space-y-3">
                                            {agentImageUrl ? (
                                                <div className="relative w-64 h-64 rounded-xl overflow-hidden border-2 border-gray-200 bg-white group">
                                                    <img
                                                        src={agentImageUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${agentImageUrl}` : agentImageUrl}
                                                        alt="Agent"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewImage(agentImageUrl)}
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
                                                </div>
                                            ) : (
                                                <Upload
                                                    name="agentImage"
                                                    listType="picture-card"
                                                    className="agent-image-uploader"
                                                    showUploadList={false}
                                                    beforeUpload={handleBeforeUpload}
                                                >
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                        <div className="text-sm text-gray-500 font-['Manrope']">{t.uploadPhoto}</div>
                                                    </div>
                                                </Upload>
                                            )}
                                            <Form.Item name="agentImage" noStyle>
                                                <input type="hidden" />
                                            </Form.Item>
                                        </div>
                                    </Form.Item>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4 font-['Manrope']">{t.contactInfoSection}</h3>

                                    {/* Phone Numbers */}
                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-2">{t.phoneNumbers}</h4>
                                    <Form.List name="agentNumber">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map((field, index) => (
                                                    <div key={field.key} className="flex gap-2 mb-2">
                                                        <Form.Item
                                                            {...field}
                                                            className="mb-0 flex-1"
                                                            rules={[{ required: true, message: t.phoneRequired }]}
                                                        >
                                                            <Input placeholder={t.phonePlaceholder} className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Button
                                                            danger
                                                            onClick={() => remove(field.name)}
                                                            icon={<DeleteOutlined />}
                                                            className="h-11 w-11 flex items-center justify-center rounded-lg"
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                    className="h-11 rounded-lg border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 font-['Manrope'] mb-6"
                                                >
                                                    {t.addPhoneNumber}
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>

                                    {/* Email Addresses */}
                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-2">{t.emailAddresses}</h4>
                                    <Form.List name="agentEmail">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map((field, index) => (
                                                    <div key={field.key} className="flex gap-2 mb-2">
                                                        <Form.Item
                                                            {...field}
                                                            className="mb-0 flex-1"
                                                            rules={[
                                                                { required: true, message: t.emailRequired },
                                                                { type: 'email', message: t.validEmail }
                                                            ]}
                                                        >
                                                            <Input placeholder={t.emailPlaceholder} className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Button
                                                            danger
                                                            onClick={() => remove(field.name)}
                                                            icon={<DeleteOutlined />}
                                                            className="h-11 w-11 flex items-center justify-center rounded-lg"
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                    className="h-11 rounded-lg border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 font-['Manrope']"
                                                >
                                                    {t.addEmailAddress}
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                </div>

                                {/* Social Media Links */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                                    <h3 className="text-xl font-bold text-[#41398B] mb-4 font-['Manrope']">{t.socialMediaSection}</h3>

                                    <div className="space-y-4">
                                        <Form.Item
                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">{t.zaloLink}</span>}
                                            name="agentZaloLink"
                                            rules={[{ type: 'url', message: t.validUrl }]}
                                        >
                                            <Input
                                                placeholder={t.zaloPlaceholder}
                                                className="h-11 rounded-lg"
                                                prefix={<span className="text-gray-400"><Link size={16} /></span>}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">{t.messengerLink}</span>}
                                            name="agentMessengerLink"
                                            rules={[{ type: 'url', message: t.validUrl }]}
                                        >
                                            <Input
                                                placeholder={t.messengerPlaceholder}
                                                className="h-11 rounded-lg"
                                                prefix={<span className="text-gray-400"><MessageCircle size={16} /></span>}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">{t.whatsappLink}</span>}
                                            name="agentWhatsappLink"
                                            rules={[{ type: 'url', message: t.validUrl }]}
                                        >
                                            <Input
                                                placeholder={t.whatsappPlaceholder}
                                                className="h-11 rounded-lg"
                                                prefix={<span className="text-gray-400"><WhatsAppOutlined /></span>}
                                            />
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-100">
                                {agentData && (
                                    <Button
                                        size="large"
                                        onClick={handleCancel}
                                        className="rounded-xl font-semibold text-[15px] h-12 px-8 font-['Manrope'] border-gray-300 text-gray-600 hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        {t.cancelButton}
                                    </Button>
                                )}
                                {can('cms.agent', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="bg-[#41398B] hover:!bg-[#352e7a] border-none rounded-xl font-semibold text-[15px] h-12 px-8 font-['Manrope'] shadow-lg shadow-indigo-100"
                                    >
                                        {t.saveButton}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                    .agent-image-uploader .ant-upload.ant-upload-select {
                        width: 256px !important;
                        height: 256px !important;
                        border: 2px dashed #d1d5db !important;
                        border-radius: 12px !important;
                        background: #f9fafb !important;
                        transition: all 0.3s ease !important;
                    }
                    .agent-image-uploader .ant-upload.ant-upload-select:hover {
                        border-color: #41398B !important;
                        background: #f3f4f6 !important;
                    }
                    .agent-image-uploader .ant-upload-list {
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