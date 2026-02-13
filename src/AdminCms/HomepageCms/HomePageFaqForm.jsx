import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Space,
    Card
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { uploadHomePageImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { onFormFinishFailed } from '@/utils/formValidation';
import { X } from 'lucide-react';
import { usePermissions } from '../../Context/PermissionContext';

const { TextArea } = Input;

export default function HomePageFaqForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang // Receive the global language prop
}) {

    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState('vn');

    // Sync activeTab with headerLang whenever headerLang changes
    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang);
        }
    }, [headerLang]);

    const [faqBgUrl, setFaqBgUrl] = useState(pageData?.homeFaqBg || '');
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadHomePageImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ homeFaqBg: uploadedUrl });
            setFaqBgUrl(uploadedUrl);
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
        setFaqBgUrl('');
        form.setFieldsValue({ homeFaqBg: '' });
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'FAQ Section' : 'Phần FAQ'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage your FAQ content and questions' : 'Quản lý nội dung và câu hỏi thường gặp'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSubmit}
                            onFinishFailed={onFormFinishFailed}
                            disabled={!can('cms.homePage', 'edit')}
                            initialValues={{
                                faqs: [{ header_en: '', content_en: '', header_vn: '', content_vn: '' }]
                            }}
                        >
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
                                                {/* FAQ Image Section - Vietnamese */}
                                                <div className="rounded-xl mb-6">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Phần Hình Ảnh FAQ
                                                    </h4>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Hình Ảnh FAQ</span>}
                                                        name="homeFaqImageTitle_vn"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập tiêu đề' },
                                                            { max: 200, message: 'Tối đa 200 ký tự' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Câu Hỏi Thường Gặp"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Hình Ảnh FAQ</span>}
                                                        name="homeFaqImageDescription_vn"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập mô tả' },
                                                            { max: 500, message: 'Tối đa 500 ký tự' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Tìm câu trả lời cho các câu hỏi thường gặp về dịch vụ của chúng tôi"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Văn Bản Nút Hình Ảnh FAQ</span>}
                                                        name="homeFaqImageButtonText_vn"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập văn bản nút' },
                                                            { max: 50, message: 'Tối đa 50 ký tự' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Liên Hệ Chúng Tôi"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Đường Dẫn Nút</span>}
                                                        name="homeFaqImageButtonLink"
                                                        rules={[{ required: true, message: 'Vui lòng nhập đường dẫn nút' }]}
                                                    >
                                                        <Input
                                                            placeholder="https://example.com/contact"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Ảnh Nền FAQ
                                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                                    (Khuyên dùng: 1920x1080px, Tối đa: 5MB)
                                                                </span>
                                                            </span>
                                                        }
                                                    >
                                                        <div className="space-y-3">
                                                            {faqBgUrl ? (
                                                                <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                                                    <img
                                                                        src={faqBgUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${faqBgUrl}` : faqBgUrl}
                                                                        alt="FAQ Background"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewImage(faqBgUrl)}
                                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                            title="Xem trước"
                                                                        >
                                                                            <EyeOutlined className="text-[#41398B] text-lg" />
                                                                        </button>
                                                                        <Upload showUploadList={false} beforeUpload={handleBeforeUpload}>
                                                                            <button
                                                                                type="button"
                                                                                className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                                title="Đổi Ảnh"
                                                                            >
                                                                                <ReloadOutlined className="text-blue-600 text-lg" />
                                                                            </button>
                                                                        </Upload>
                                                                        <button
                                                                            type="button"
                                                                            onClick={removeImage}
                                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                            title="Xóa"
                                                                        >
                                                                            <X className="text-red-500 w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Upload
                                                                    name="homeFaqBg"
                                                                    listType="picture-card"
                                                                    className="faq-uploader"
                                                                    showUploadList={false}
                                                                    beforeUpload={handleBeforeUpload}
                                                                >
                                                                    <div className="flex flex-col items-center justify-center h-full">
                                                                        <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                                        <div className="text-sm text-gray-500 font-['Manrope']">Tải Ảnh Lên</div>
                                                                    </div>
                                                                </Upload>
                                                            )}

                                                            <Form.Item
                                                                name="homeFaqBg"
                                                                noStyle
                                                            >
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                        </div>
                                                    </Form.Item>
                                                </div>

                                                {/* FAQ Content Section - Vietnamese */}
                                                <div className="rounded-xl mb-6">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Phần Nội Dung FAQ
                                                    </h4>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề FAQ</span>}
                                                        name="homeFaqTitle_vn"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập tiêu đề FAQ' },
                                                            { max: 200, message: 'Tối đa 200 ký tự' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Câu Hỏi Phổ Biến"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả FAQ</span>}
                                                        name="homeFaqDescription_vn"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập mô tả FAQ' },
                                                            { max: 500, message: 'Tối đa 500 ký tự' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Mọi thứ bạn cần biết về bất động sản và dịch vụ của chúng tôi"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* FAQ Items (Dynamic) - Vietnamese */}
                                                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Câu Hỏi & Trả Lời FAQ
                                                    </h4>

                                                    <Form.List name="faqs">
                                                        {(fields) => (
                                                            <>
                                                                {fields.map(({ key, name, ...restField }, index) => (
                                                                    <Card
                                                                        key={key}
                                                                        className="mb-4 shadow-sm border-2 border-gray-200"
                                                                        title={
                                                                            <span className="font-semibold text-gray-700 font-['Manrope']">
                                                                                Câu Hỏi {index + 1}
                                                                            </span>
                                                                        }
                                                                    >
                                                                        <Form.Item
                                                                            {...restField}
                                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Câu Hỏi</span>}
                                                                            name={[name, 'header_vn']}
                                                                            rules={[
                                                                                { required: true, message: 'Vui lòng nhập tiêu đề câu hỏi' },
                                                                                { max: 200, message: 'Tối đa 200 ký tự' }
                                                                            ]}
                                                                        >
                                                                            <Input
                                                                                placeholder="Chi phí mua nhà bao gồm những gì?"
                                                                                size="large"
                                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                            />
                                                                        </Form.Item>

                                                                        <Form.Item
                                                                            {...restField}
                                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Nội Dung Trả Lời</span>}
                                                                            name={[name, 'content_vn']}
                                                                            rules={[
                                                                                { required: true, message: 'Vui lòng nhập nội dung trả lời' },
                                                                                { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                                            ]}
                                                                        >
                                                                            <TextArea
                                                                                placeholder="Phương pháp của chúng tôi kết hợp các chiến lược cá nhân hóa..."
                                                                                rows={4}
                                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                            />
                                                                        </Form.Item>
                                                                    </Card>
                                                                ))}
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>
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
                                                {/* FAQ Image Section */}
                                                <div className="rounded-xl mb-6">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        FAQ Image Section
                                                    </h4>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">FAQ Image Title</span>}
                                                        name="homeFaqImageTitle_en"
                                                        rules={[
                                                            { required: true, message: 'Please enter FAQ image title in English' },
                                                            { max: 200, message: 'Maximum 200 characters allowed' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Frequently Asked Questions"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">FAQ Image Description</span>}
                                                        name="homeFaqImageDescription_en"
                                                        rules={[
                                                            { required: true, message: 'Please enter FAQ image description in English' },
                                                            { max: 500, message: 'Maximum 500 characters allowed' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Find answers to common questions about our services"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">FAQ Image Button Text</span>}
                                                        name="homeFaqImageButtonText_en"
                                                        rules={[
                                                            { required: true, message: 'Please enter button text in English' },
                                                            { max: 50, message: 'Maximum 50 characters allowed' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Contact Us"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Button Link</span>}
                                                        name="homeFaqImageButtonLink"
                                                        rules={[{ required: true, message: 'Please enter button link' }]}
                                                    >
                                                        <Input
                                                            placeholder="https://example.com/contact"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                FAQ Background Image
                                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                                    (Recommended: 1920x1080px, Max: 5MB)
                                                                </span>
                                                            </span>
                                                        }
                                                    >
                                                        <div className="space-y-3">
                                                            {faqBgUrl ? (
                                                                <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                                                    <img
                                                                        src={faqBgUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${faqBgUrl}` : faqBgUrl}
                                                                        alt="FAQ Background"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewImage(faqBgUrl)}
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
                                                                    name="homeFaqBg"
                                                                    listType="picture-card"
                                                                    className="faq-uploader"
                                                                    showUploadList={false}
                                                                    beforeUpload={handleBeforeUpload}
                                                                >
                                                                    <div className="flex flex-col items-center justify-center h-full">
                                                                        <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                                        <div className="text-sm text-gray-500 font-['Manrope']">Upload Image</div>
                                                                    </div>
                                                                </Upload>
                                                            )}

                                                            <Form.Item
                                                                name="homeFaqBg"
                                                                noStyle
                                                            >
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                        </div>
                                                    </Form.Item>
                                                </div>

                                                {/* FAQ Content Section */}
                                                <div className="rounded-xl mb-6">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        FAQ Content Section
                                                    </h4>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">FAQ Title</span>}
                                                        name="homeFaqTitle_en"
                                                        rules={[
                                                            { required: true, message: 'Please enter FAQ title in English' },
                                                            { max: 200, message: 'Maximum 200 characters allowed' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Common Questions"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">FAQ Description</span>}
                                                        name="homeFaqDescription_en"
                                                        rules={[
                                                            { required: true, message: 'Please enter FAQ description in English' },
                                                            { max: 500, message: 'Maximum 500 characters allowed' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Everything you need to know about our properties and services"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* FAQ Items (Dynamic) */}
                                                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        FAQ Questions & Answers
                                                    </h4>

                                                    <Form.List name="faqs">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map(({ key, name, ...restField }, index) => (
                                                                    <Card
                                                                        key={key}
                                                                        className="mb-4 shadow-sm border-2 border-gray-200 hover:border-purple-300 transition-all"
                                                                        title={
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="font-semibold text-gray-700 font-['Manrope']">
                                                                                    Question {index + 1}
                                                                                </span>
                                                                                {fields.length > 1 && (
                                                                                    <Button
                                                                                        type="text"
                                                                                        danger
                                                                                        icon={<DeleteOutlined />}
                                                                                        onClick={() => remove(name)}
                                                                                        className="font-['Manrope']"
                                                                                    >
                                                                                        Remove
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        }
                                                                    >
                                                                        <Form.Item
                                                                            {...restField}
                                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Question Header</span>}
                                                                            name={[name, 'header_en']}
                                                                            rules={[
                                                                                { required: true, message: 'Please enter question header' },
                                                                                { max: 200, message: 'Maximum 200 characters allowed' }
                                                                            ]}
                                                                        >
                                                                            <Input
                                                                                placeholder="What costs are involved in buying a home?"
                                                                                size="large"
                                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                            />
                                                                        </Form.Item>

                                                                        <Form.Item
                                                                            {...restField}
                                                                            label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Answer Content</span>}
                                                                            name={[name, 'content_en']}
                                                                            rules={[
                                                                                { required: true, message: 'Please enter answer content' },
                                                                                { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                                            ]}
                                                                        >
                                                                            <TextArea
                                                                                placeholder="Our approach combines personalized strategies, data-driven insights, and dedicated support..."
                                                                                rows={4}
                                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                            />
                                                                        </Form.Item>
                                                                    </Card>
                                                                ))}
                                                                <Form.Item>
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => add()}
                                                                        block
                                                                        icon={<PlusOutlined />}
                                                                        size="large"
                                                                        className="!border-2 !border-[#41398B] !text-[#41398B] hover:!border-[#41398B] hover:!text-[#41398B] font-semibold font-['Manrope'] mt-5 h-12"
                                                                    >
                                                                        Add FAQ Question
                                                                    </Button>
                                                                </Form.Item>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* FAQ Save Button */}
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
                                {can('cms.homePage', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Phần FAQ' : 'Tạo Trang')
                                            : (pageData ? 'Save FAQ Section' : 'Create Page')
                                        }
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                        .faq-uploader .ant-upload.ant-upload-select {
                            width: 192px !important;
                            height: 144px !important;
                            border: 2px dashed #d1d5db !important;
                            border-radius: 12px !important;
                            background: #f9fafb !important;
                            transition: all 0.3s ease !important;
                        }
                        .faq-uploader .ant-upload.ant-upload-select:hover {
                            border-color: #41398B !important;
                            background: #f3f4f6 !important;
                        }
                        .faq-uploader .ant-upload-list {
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

