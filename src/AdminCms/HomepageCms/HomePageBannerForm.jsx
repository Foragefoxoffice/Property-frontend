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
    PlusOutlined
} from '@ant-design/icons';
import { uploadHomePageImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';

const { TextArea } = Input;

export default function HomePageBannerForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle
}) {
    const [activeTab, setActiveTab] = useState('en');
    const [bannerImageUrl, setBannerImageUrl] = useState(pageData?.backgroundImage || '');
    const [uploading, setUploading] = useState(false);

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadHomePageImage(file);
            const uploadedUrl = response.data.data.url;

            form.setFieldsValue({ backgroundImage: uploadedUrl });
            setBannerImageUrl(uploadedUrl);
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">Hero / Banner Section</h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">Manage your homepage hero banner</p>
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
                                                            Hero Title
                                                        </span>
                                                    }
                                                    name="heroTitle_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter hero title in English' },
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Your Trusted Property Partner"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Hero Description
                                                        </span>
                                                    }
                                                    name="heroDescription_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter hero description in English' },
                                                        { max: 500, message: 'Maximum 500 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Find your dream property with us"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
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
                                                            Tiêu Đề Hero
                                                        </span>
                                                    }
                                                    name="heroTitle_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề hero bằng tiếng Việt' },
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Đối Tác Bất Động Sản Tin Cậy Của Bạn"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Hero
                                                        </span>
                                                    }
                                                    name="heroDescription_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập mô tả hero bằng tiếng Việt' },
                                                        { max: 500, message: 'Tối đa 500 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Tìm bất động sản mơ ước của bạn cùng chúng tôi"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        Hero Background Image
                                        <span className="text-xs text-gray-400 ml-2 font-normal">
                                            (Recommended: 1920x1080px, Max: 5MB)
                                        </span>
                                    </span>
                                }
                            >
                                <div className="space-y-3">
                                    <Upload
                                        name="backgroundImage"
                                        listType="picture-card"
                                        className="banner-uploader w-[200px] h-[200px]"
                                        showUploadList={false}
                                        beforeUpload={handleBeforeUpload}
                                    >
                                        {bannerImageUrl ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={bannerImageUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${bannerImageUrl}` : bannerImageUrl}
                                                    alt="banner"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                    <div className="text-white text-center">
                                                        <PlusOutlined className="text-2xl mb-2" />
                                                        <div className="text-sm">Change Image</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                <div className="text-sm text-gray-500 font-['Manrope'] opacity-0 hover:opacity-100 transition-opacity">Upload Image</div>
                                            </div>
                                        )}
                                    </Upload>

                                    <Form.Item
                                        name="backgroundImage"
                                        noStyle
                                    >
                                        <Input type="hidden" />
                                    </Form.Item>
                                </div>
                            </Form.Item>

                            {/* Banner Save Button */}
                            <div className="flex gap-3 justify-end mt-6 pt-4">
                                {pageData && (
                                    <Button
                                        size="large"
                                        onClick={onCancel}
                                        className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                >
                                    {pageData ? 'Save Banner' : 'Create Page'}
                                </Button>
                            </div>
                        </Form>
                    </ConfigProvider>

                    <style>{`
                    .banner-uploader .ant-upload.ant-upload-select {
                        width: 100% !important;
                        height: 200px !important;
                        border: 2px dashed #d1d5db !important;
                        border-radius: 12px !important;
                        background: #f9fafb !important;
                        transition: all 0.3s ease !important;
                    }
                    .banner-uploader .ant-upload.ant-upload-select:hover {
                        border-color: #41398B !important;
                        background: #f3f4f6 !important;
                    }
                    .banner-uploader .ant-upload-list {
                        display: none !important;
                    }
                `}</style>
                </div>
            </div>
        </div>
    );
}
