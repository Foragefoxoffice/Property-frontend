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
                                footerNumber: []
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
                                                    <Form.Item
                                                        label={<span className="font-semibold text-gray-700 font-['Manrope']">Email Address</span>}
                                                        name="footerEmail"
                                                        rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                                                    >
                                                        <Input placeholder="contact@example.com" className="h-11 rounded-lg" />
                                                    </Form.Item>

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
                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                                                    <h3 className="text-md font-bold text-[#41398B] mb-4 font-['Manrope']">Footer Icons (Social Media)</h3>
                                                    <Form.List name="footerIcons">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="bg-white p-4 rounded-lg mb-3 border border-purple-200">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="flex-1 space-y-3">
                                                                                <Form.Item
                                                                                    {...field}
                                                                                    label={<span className="text-sm font-['Manrope']">Icon Name</span>}
                                                                                    name={[field.name, 'icon']}
                                                                                    className="mb-0"
                                                                                    rules={[{ required: true, message: 'Please select an icon' }]}
                                                                                >
                                                                                    <Select
                                                                                        showSearch
                                                                                        placeholder="Select Lucide icon"
                                                                                        size="large"
                                                                                        className="w-full"
                                                                                        optionFilterProp="value"
                                                                                        options={lucideIconNames.map(name => {
                                                                                            const Icon = LucideIcons[name];
                                                                                            return {
                                                                                                value: name,
                                                                                                label: (
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        {Icon && <Icon size={16} />}
                                                                                                        <span>{name}</span>
                                                                                                    </div>
                                                                                                ),
                                                                                            };
                                                                                        })}
                                                                                    />
                                                                                </Form.Item>
                                                                                <Form.Item
                                                                                    {...field}
                                                                                    label={<span className="text-sm font-['Manrope']">Link URL</span>}
                                                                                    name={[field.name, 'link']}
                                                                                    className="mb-0"
                                                                                    rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                                                                                >
                                                                                    <Input placeholder="https://..." className="h-11 rounded-lg" />
                                                                                </Form.Item>

                                                                                {/* Icon Preview */}
                                                                                <Form.Item noStyle shouldUpdate>
                                                                                    {() => {
                                                                                        const icons = form.getFieldValue('footerIcons') || [];
                                                                                        const currentIcon = icons[index]?.icon;
                                                                                        return currentIcon ? (
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <span>Preview:</span>
                                                                                                {renderIcon(currentIcon)}
                                                                                                <span className="font-mono text-xs">{currentIcon}</span>
                                                                                            </div>
                                                                                        ) : null;
                                                                                    }}
                                                                                </Form.Item>
                                                                            </div>
                                                                            <Button
                                                                                danger
                                                                                type="text"
                                                                                icon={<DeleteOutlined />}
                                                                                onClick={() => remove(field.name)}
                                                                                className="mt-8"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    type="dashed"
                                                                    onClick={() => add()}
                                                                    block
                                                                    icon={<PlusOutlined />}
                                                                    size="large"
                                                                    className="h-12 rounded-lg border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 font-['Manrope']"
                                                                >
                                                                    Add Social Icon
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
