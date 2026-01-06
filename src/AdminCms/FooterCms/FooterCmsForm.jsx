import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    ConfigProvider,
    Upload,
    Spin,
    Tabs,
    Select
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { getFooter, updateFooter, uploadFooterImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { onFormFinishFailed } from '@/utils/formValidation';
import { useLanguage } from '../../Language/LanguageContext';
import { X, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const { TextArea } = Input;

// Get all Lucide icon names
const lucideIconNames = Object.keys(LucideIcons).filter(name =>
    name !== 'createLucideIcon' &&
    name !== 'icons' &&
    name !== 'default' &&
    /^[A-Z]/.test(name)
);

export default function FooterCmsForm() {
    const { language } = useLanguage();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [footerData, setFooterData] = useState(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [iconUploading, setIconUploading] = useState(null); // Track which icon is uploading
    const [previewImage, setPreviewImage] = useState(null);
    const [activeTab, setActiveTab] = useState('en');

    // Translation object
    const translations = {
        en: {
            pageTitle: 'Footer Management',
            pageDescription: 'Manage your website footer content',
            saveButton: 'Save Footer',
            cancelButton: 'Cancel',
            fetchError: 'Failed to fetch footer data',
            uploadSuccess: 'Logo uploaded successfully!',
            uploadError: 'Failed to upload logo',
            updateSuccess: 'Footer updated successfully!',
            updateError: 'Failed to update footer',
            imageRemoved: 'Logo removed',
            invalidFileType: 'You can only upload image files!',
            fileSizeError: 'Image must be smaller than 5MB!',
            tabs: {
                en: 'English (EN)',
                vn: 'Tiếng Việt (VN)',
                common: 'Common Fields'
            }
        },
        vi: {
            pageTitle: 'Quản lý Footer',
            pageDescription: 'Quản lý nội dung footer trang web',
            saveButton: 'Lưu Footer',
            cancelButton: 'Hủy',
            fetchError: 'Không thể tải dữ liệu footer',
            uploadSuccess: 'Tải lên logo thành công!',
            uploadError: 'Không thể tải lên logo',
            updateSuccess: 'Cập nhật footer thành công!',
            updateError: 'Không thể cập nhật footer',
            imageRemoved: 'Đã xóa logo',
            invalidFileType: 'Bạn chỉ có thể tải lên file hình ảnh!',
            fileSizeError: 'Hình ảnh phải nhỏ hơn 5MB!',
            tabs: {
                en: 'English (EN)',
                vn: 'Tiếng Việt (VN)',
                common: 'Thông tin chung'
            }
        }
    };

    const t = translations[language];

    // Fetch footer data
    useEffect(() => {
        fetchFooterData();
    }, []);

    const fetchFooterData = async () => {
        try {
            setFetchLoading(true);
            const response = await getFooter();
            const data = response.data.data;
            setFooterData(data);
            if (data) {
                setLogoUrl(data.footerLogo || '');
                // Ensure footerEmail is an array
                if (data.footerEmail && typeof data.footerEmail === 'string') {
                    data.footerEmail = [data.footerEmail];
                } else if (!data.footerEmail) {
                    data.footerEmail = [];
                }
                form.setFieldsValue(data);
            }
        } catch (error) {
            console.error('Error fetching footer:', error);
            // CommonToaster(t.fetchError, 'error'); // Suppress error if API not ready
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadFooterImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ footerLogo: uploadedUrl });
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

    const handleIconUpload = async (file, index) => {
        try {
            setIconUploading(index);
            const response = await uploadFooterImage(file);
            const uploadedUrl = response.data.data.url;

            // Get current icons list
            const icons = form.getFieldValue('footerIcons') || [];
            // Update the specific icon at index
            if (!icons[index]) icons[index] = {};
            icons[index].icon = uploadedUrl;

            form.setFieldsValue({ footerIcons: icons });
            CommonToaster(t.uploadSuccess, 'success');
            return false;
        } catch (error) {
            CommonToaster(t.uploadError, 'error');
            console.error(error);
            return false;
        } finally {
            setIconUploading(null);
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

    const handleBeforeIconUpload = (file, index) => {
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
        handleIconUpload(file, index);
        return false;
    };

    // Remove logo
    const removeLogo = () => {
        setLogoUrl('');
        form.setFieldValue('footerLogo', '');
        CommonToaster(t.imageRemoved, 'info');
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            // Ensure footerNumber is an array of strings (it might be objects if not handled carefully, but Antd Form.List with plain Input returns array of strings if name is simple)
            // But here we might want to wrap/unwrap. 
            // Actually, if we use Form.List with just valid inputs, it returns array of values.

            await updateFooter(values);
            CommonToaster(t.updateSuccess, 'success');
            fetchFooterData();
        } catch (error) {
            console.error('Error updating footer:', error);
            CommonToaster(t.updateError, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        form.resetFields();
        if (footerData) {
            form.setFieldsValue(footerData);
            setLogoUrl(footerData.footerLogo || '');
        } else {
            setLogoUrl('');
        }
    };

    // Render Lucide Icon by name
    const renderIcon = (iconName) => {
        const IconComponent = LucideIcons[iconName];
        if (!IconComponent) return null;
        return <IconComponent className="w-5 h-5" />;
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
                            initialValues={{
                                footerIcons: [],
                                footerNumber: [],
                                footerEmail: []
                            }}
                        >
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="mb-6"
                                items={[
                                    {
                                        key: 'en',
                                        label: <span className="font-semibold font-['Manrope']">{t.tabs.en}</span>,
                                        children: (
                                            <div className="space-y-4 pt-4">
                                                {/* Address Section */}
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                    <h3 className="text-md font-bold text-gray-700 mb-4 font-['Manrope']">Address Section</h3>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Address Label</span>}
                                                        name="footerAddressLable_en"
                                                        rules={[{ required: true, message: 'Please enter address label' }]}
                                                    >
                                                        <Input placeholder="e.g. Find Us" className="h-11 rounded-lg" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Address Content</span>}
                                                        name="footerAddress_en"
                                                        rules={[{ required: true, message: 'Please enter address' }]}
                                                    >
                                                        <TextArea rows={3} placeholder="123 Street Name, City, Country" className="rounded-lg" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Copyright Text</span>}
                                                        name="footerCopyRight_en"
                                                    >
                                                        <Input placeholder="e.g. 183 Housing Solutions" className="h-11 rounded-lg" />
                                                    </Form.Item>
                                                </div>

                                                {/* Labels Section */}
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                    <h3 className="text-md font-bold text-gray-700 mb-4 font-['Manrope']">Section Labels</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">Number Label</span>}
                                                            name="footerNumberLable_en"
                                                        >
                                                            <Input placeholder="e.g. Call Us" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">Email Label</span>}
                                                            name="footerEmailLable_en"
                                                        >
                                                            <Input placeholder="e.g. Email Us" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">"Our Company" Label</span>}
                                                            name="footerOurCompanyLable_en"
                                                        >
                                                            <Input placeholder="e.g. Our Company" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">"Quick Links" Label</span>}
                                                            name="footerQuickLinksLable_en"
                                                        >
                                                            <Input placeholder="e.g. Quick Links" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                    </div>
                                                </div>

                                                {/* Newsletter Section */}
                                                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                                                    <h3 className="text-md font-bold text-[#41398B] mb-4 font-['Manrope']">Newsletter Section</h3>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Join Our News Title</span>}
                                                        name="footerJoinOurNewsTitle_en"
                                                    >
                                                        <Input placeholder="e.g. Subscribe to our Newsletter" className="h-11 rounded-lg" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Join Our News Description</span>}
                                                        name="footerJoinOurNewsDescription_en"
                                                    >
                                                        <TextArea rows={3} placeholder="Stay updated with our latest news..." className="rounded-lg" />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'vn',
                                        label: <span className="font-semibold font-['Manrope']">{t.tabs.vn}</span>,
                                        children: (
                                            <div className="space-y-4 pt-4">
                                                {/* Address Section */}
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                    <h3 className="text-md font-bold text-gray-700 mb-4 font-['Manrope']">Địa Chỉ</h3>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Nhãn Địa Chỉ</span>}
                                                        name="footerAddressLable_vn"
                                                        rules={[{ required: true, message: 'Vui lòng nhập nhãn địa chỉ' }]}
                                                    >
                                                        <Input placeholder="Vd: Tìm Chúng Tôi" className="h-11 rounded-lg" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Nội Dung Địa Chỉ</span>}
                                                        name="footerAddress_vn"
                                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                                                    >
                                                        <TextArea rows={3} placeholder="123 Tên Đường, Thành Phố, Quốc Gia" className="rounded-lg" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Nội Dung Bản Quyền</span>}
                                                        name="footerCopyRight_vn"
                                                    >
                                                        <Input placeholder="Vd: 183 Housing Solutions" className="h-11 rounded-lg" />
                                                    </Form.Item>
                                                </div>

                                                {/* Labels Section */}
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                    <h3 className="text-md font-bold text-gray-700 mb-4 font-['Manrope']">Nhãn Các Phần</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">Nhãn Số Điện Thoại</span>}
                                                            name="footerNumberLable_vn"
                                                        >
                                                            <Input placeholder="Vd: Gọi Chúng Tôi" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">Nhãn Email</span>}
                                                            name="footerEmailLable_vn"
                                                        >
                                                            <Input placeholder="Vd: Email Chúng Tôi" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">Nhãn "Công Ty Chúng Tôi"</span>}
                                                            name="footerOurCompanyLable_vn"
                                                        >
                                                            <Input placeholder="Vd: Công Ty Chúng Tôi" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={<span className="font-semibold text-gray-700 font-['Manrope']">Nhãn "Liên Kết Nhanh"</span>}
                                                            name="footerQuickLinksLable_vn"
                                                        >
                                                            <Input placeholder="Vd: Liên Kết Nhanh" className="h-11 rounded-lg" />
                                                        </Form.Item>
                                                    </div>
                                                </div>

                                                {/* Newsletter Section */}
                                                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                                                    <h3 className="text-md font-bold text-[#41398B] mb-4 font-['Manrope']">Bản Tin</h3>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Tiêu Đề Bản Tin</span>}
                                                        name="footerJoinOurNewsTitle_vn"
                                                    >
                                                        <Input placeholder="Vd: Đăng Ký Nhận Bản Tin" className="h-11 rounded-lg" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Mô Tả Bản Tin</span>}
                                                        name="footerJoinOurNewsDescription_vn"
                                                    >
                                                        <TextArea rows={3} placeholder="Cập nhật tin tức mới nhất..." className="rounded-lg" />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'common',
                                        label: <span className="font-semibold font-['Manrope']">{t.tabs.common}</span>,
                                        children: (
                                            <div className="space-y-6 pt-4">
                                                {/* Footer Logo */}
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                    <h3 className="text-md font-bold text-gray-700 mb-4 font-['Manrope']">Footer Logo</h3>
                                                    <Form.Item label={<span className="font-semibold text-gray-700 font-['Manrope']">Upload Logo</span>}>
                                                        <div className="space-y-3">
                                                            {logoUrl ? (
                                                                <div className="relative w-64 h-24 rounded-xl overflow-hidden border-2 border-gray-200 bg-white group">
                                                                    <img
                                                                        src={logoUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${logoUrl}` : logoUrl}
                                                                        alt="Footer Logo"
                                                                        className="w-full h-full object-contain p-2"
                                                                    />
                                                                    <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewImage(logoUrl)}
                                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                            title="Preview"
                                                                        >
                                                                            <EyeOutlined className="text-[#41398B] text-lg" />
                                                                        </button>
                                                                        <Upload showUploadList={false} beforeUpload={handleBeforeUpload}>
                                                                            <button
                                                                                type="button"
                                                                                className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                                title="Change Logo"
                                                                            >
                                                                                <ReloadOutlined className="text-blue-600 text-lg" />
                                                                            </button>
                                                                        </Upload>
                                                                        <button
                                                                            type="button"
                                                                            onClick={removeLogo}
                                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                            title="Delete"
                                                                        >
                                                                            <X className="text-red-500 w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Upload
                                                                    name="footerLogo"
                                                                    listType="picture-card"
                                                                    className="logo-uploader"
                                                                    showUploadList={false}
                                                                    beforeUpload={handleBeforeUpload}
                                                                >
                                                                    <div className="flex flex-col items-center justify-center h-full">
                                                                        <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                                        <div className="text-sm text-gray-500 font-['Manrope']">Upload Logo</div>
                                                                    </div>
                                                                </Upload>
                                                            )}
                                                            <Form.Item name="footerLogo" noStyle>
                                                                <input type="hidden" />
                                                            </Form.Item>
                                                        </div>
                                                    </Form.Item>
                                                </div>

                                                {/* Email & Numbers */}
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                    <h3 className="text-md font-bold text-gray-700 mb-4 font-['Manrope']">Contact Info</h3>
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-2">Email Addresses</h4>
                                                    <Form.List name="footerEmail">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="flex gap-2 mb-2">
                                                                        <Form.Item
                                                                            {...field}
                                                                            className="mb-0 flex-1"
                                                                            rules={[
                                                                                { required: true, message: 'Please enter an email' },
                                                                                { type: 'email', message: 'Please enter a valid email' }
                                                                            ]}
                                                                        >
                                                                            <Input placeholder="contact@example.com" className="h-11 rounded-lg" />
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
                                                                    Add Email Address
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form.List>

                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-2">Phone Numbers</h4>
                                                    <Form.List name="footerNumber">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="flex gap-2 mb-2">
                                                                        <Form.Item
                                                                            {...field}
                                                                            className="mb-0 flex-1"
                                                                            rules={[{ required: true, message: 'Please enter a phone number' }]}
                                                                        >
                                                                            <Input placeholder="+1 234 567 8900" className="h-11 rounded-lg" />
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
                                                                    Add Phone Number
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>

                                                {/* Social Media Icons */}
                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                                                    <h3 className="text-md font-bold text-[#41398B] mb-6 font-['Manrope']">Social Icons</h3>
                                                    <Form.List name="footerIcons">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="flex items-center gap-4 mb-1 bg-white pr-4 rounded-xl">
                                                                        {/* Upload Icon Box */}
                                                                        <Form.Item
                                                                            {...field}
                                                                            name={[field.name, 'icon']}
                                                                            rules={[{ required: true, message: 'Required' }]}
                                                                            className="mb-0"
                                                                        >
                                                                            <Form.Item shouldUpdate noStyle>
                                                                                {() => {
                                                                                    const icons = form.getFieldValue('footerIcons') || [];
                                                                                    const currentIcon = icons[index]?.icon;

                                                                                    return (
                                                                                        <Upload
                                                                                            name="icon"
                                                                                            listType="picture-card"
                                                                                            showUploadList={false}
                                                                                            beforeUpload={(file) => handleBeforeIconUpload(file, index)}
                                                                                            className="w-[60px] h-[60px] flex-shrink-0 [&>.ant-upload]:!w-[60px] [&>.ant-upload]:!h-[60px] [&>.ant-upload]:!border-purple-200 [&>.ant-upload]:!bg-gray-50 [&>.ant-upload]:!rounded-lg overflow-hidden [&>.ant-upload]:!m-0"
                                                                                        >
                                                                                            {currentIcon ? (
                                                                                                <div className="w-full bg-[#41398B] rounded-lg h-full relative group">
                                                                                                    <img
                                                                                                        src={currentIcon.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${currentIcon}` : currentIcon}
                                                                                                        alt="icon"
                                                                                                        className="w-full h-full object-contain p-1"
                                                                                                    />
                                                                                                    {/* Loading Spinner for Icon */}
                                                                                                    {iconUploading === index && (
                                                                                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                                                                            <Spin size="small" />
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="flex flex-col items-center justify-center h-full text-purple-300 hover:text-[#41398B] transition-colors">
                                                                                                    {iconUploading === index ? (
                                                                                                        <Spin size="small" />
                                                                                                    ) : (
                                                                                                        <PlusOutlined className="text-xl" />
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </Upload>
                                                                                    );
                                                                                }}
                                                                            </Form.Item>
                                                                        </Form.Item>

                                                                        {/* Link Input */}
                                                                        <Form.Item
                                                                            {...field}
                                                                            name={[field.name, 'link']}
                                                                            className="mb-0 flex-1"
                                                                            rules={[{ required: true, message: 'Link is required' }, { type: 'url', message: 'Valid URL required' }]}
                                                                        >
                                                                            <Input
                                                                                placeholder="Paste URL here..."
                                                                                className="h-[44px] bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 rounded-lg focus:border-[#41398B] hover:border-[#41398B] font-['Manrope']"
                                                                            />
                                                                        </Form.Item>

                                                                        {/* Remove Button */}
                                                                        <Button
                                                                            danger
                                                                            type="text"
                                                                            onClick={() => remove(field.name)}
                                                                            className="h-[36px] px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 font-medium text-sm flex items-center gap-2"
                                                                        >
                                                                            <DeleteOutlined /> Remove
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    onClick={() => add()}
                                                                    className="h-[58px] px-6 py-5 rounded-xl bg-[#41398B] text-white border-none font-bold text-[15px] mt-2 w-full flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition-all hover:scale-[1.01]"
                                                                >
                                                                    <PlusOutlined /> Add Social Icon
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            </div>
                                        )
                                    }
                                ]}
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-100">
                                {footerData && (
                                    <Button
                                        size="large"
                                        onClick={handleCancel}
                                        className="rounded-xl font-semibold text-[15px] h-12 px-8 font-['Manrope'] border-gray-300 text-gray-600 hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        {t.cancelButton}
                                    </Button>
                                )}
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
