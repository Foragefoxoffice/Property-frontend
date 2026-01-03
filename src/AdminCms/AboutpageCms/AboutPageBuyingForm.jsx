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
    DeleteOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { uploadAboutPageImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { X } from 'lucide-react';

const { TextArea } = Input;

export default function AboutPageBuyingForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle
}) {
    const [activeTab, setActiveTab] = useState('en');
    const [stepImages, setStepImages] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [uploading, setUploading] = useState({});

    // Initialize step images from pageData
    useEffect(() => {
        if (pageData?.aboutBuyingSteps) {
            const images = {};
            pageData.aboutBuyingSteps.forEach((step, index) => {
                if (step.image) {
                    images[index] = step.image;
                }
            });
            setStepImages(images);
        }
    }, [pageData]);

    // Handle image upload for a specific step
    const handleImageUpload = async (file, stepIndex) => {
        try {
            setUploading(prev => ({ ...prev, [stepIndex]: true }));
            const response = await uploadAboutPageImage(file);
            const uploadedUrl = response.data.data.url;

            // Update step images state
            setStepImages(prev => ({ ...prev, [stepIndex]: uploadedUrl }));

            // Update form field
            const steps = form.getFieldValue('aboutBuyingSteps') || [];
            steps[stepIndex] = { ...steps[stepIndex], image: uploadedUrl };
            form.setFieldsValue({ aboutBuyingSteps: steps });

            CommonToaster('Image uploaded successfully!', 'success');
            return false;
        } catch (error) {
            CommonToaster('Failed to upload image', 'error');
            console.error(error);
            return false;
        } finally {
            setUploading(prev => ({ ...prev, [stepIndex]: false }));
        }
    };

    const handleBeforeUpload = (file, stepIndex) => {
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
        handleImageUpload(file, stepIndex);
        return false;
    };

    // Remove step image
    const removeStepImage = (stepIndex) => {
        setStepImages(prev => {
            const newImages = { ...prev };
            delete newImages[stepIndex];
            return newImages;
        });

        const steps = form.getFieldValue('aboutBuyingSteps') || [];
        steps[stepIndex] = { ...steps[stepIndex], image: '' };
        form.setFieldsValue({ aboutBuyingSteps: steps });
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'Buying Process' : 'Quy Trình Mua'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Manage homebuying steps and process' : 'Quản lý các bước mua nhà'}
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
                                                {/* Buying Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Process Section Title
                                                        </span>
                                                    }
                                                    name="aboutBuyingTitle_en"
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Homebuying Steps"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Buying Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Process Description
                                                        </span>
                                                    }
                                                    name="aboutBuyingDescription_en"
                                                    rules={[
                                                        { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Describe your buying/process steps"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
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
                                                {/* Buying Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Phần Quy Trình
                                                        </span>
                                                    }
                                                    name="aboutBuyingTitle_vn"
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Các Bước Mua Nhà"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Buying Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Quy Trình
                                                        </span>
                                                    }
                                                    name="aboutBuyingDescription_vn"
                                                    rules={[
                                                        { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Mô tả các bước trong quy trình mua nhà"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* Steps Section */}
                            <div className="mt-8 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-md font-bold text-gray-800 font-['Manrope']">
                                        {activeTab === 'en' ? 'Process Steps' : 'Các Bước Quy Trình'}
                                    </h4>
                                </div>

                                <Form.List name="aboutBuyingSteps">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                                <div
                                                    key={key}
                                                    className="relative mb-6 p-6 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 rounded-xl border-2 border-purple-100"
                                                >
                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            remove(name);
                                                            // Clean up image state
                                                            setStepImages(prev => {
                                                                const newImages = { ...prev };
                                                                delete newImages[index];
                                                                return newImages;
                                                            });
                                                        }}
                                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all"
                                                    >
                                                        <DeleteOutlined className="text-lg" />
                                                    </button>

                                                    <div className="mb-4">
                                                        <span className="inline-block px-3 py-1 bg-[#41398B] text-white text-xs font-semibold rounded-full">
                                                            {activeTab === 'en' ? `Step ${index + 1}` : `Bước ${index + 1}`}
                                                        </span>
                                                    </div>

                                                    {/* English Fields */}
                                                    {activeTab === 'en' && (
                                                        <>
                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Step Title
                                                                    </span>
                                                                }
                                                                name={[name, 'title_en']}
                                                                rules={[
                                                                    { max: 200, message: 'Maximum 200 characters allowed' }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder="Discover Your Dream Home"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Step Description
                                                                    </span>
                                                                }
                                                                name={[name, 'description_en']}
                                                                rules={[
                                                                    { max: 500, message: 'Maximum 500 characters allowed' }
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Browse through a curated selection of properties tailored to your lifestyle and budget."
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    )}

                                                    {/* Vietnamese Fields */}
                                                    {activeTab === 'vn' && (
                                                        <>
                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Tiêu Đề Bước
                                                                    </span>
                                                                }
                                                                name={[name, 'title_vn']}
                                                                rules={[
                                                                    { max: 200, message: 'Tối đa 200 ký tự' }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder="Khám Phá Ngôi Nhà Mơ Ước"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Mô Tả Bước
                                                                    </span>
                                                                }
                                                                name={[name, 'description_vn']}
                                                                rules={[
                                                                    { max: 500, message: 'Tối đa 500 ký tự' }
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Duyệt qua các bất động sản được tuyển chọn phù hợp với lối sống và ngân sách của bạn."
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    )}

                                                    {/* Step Image Upload */}
                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                {activeTab === 'en' ? 'Step Image' : 'Hình Ảnh Bước'}
                                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                                    (Recommended: 800x600px, Max: 5MB)
                                                                </span>
                                                            </span>
                                                        }
                                                    >
                                                        <div className="flex gap-4 items-start">
                                                            {stepImages[index] ? (
                                                                <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                                                    <img
                                                                        src={stepImages[index].startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${stepImages[index]}` : stepImages[index]}
                                                                        alt={`Step ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {/* Preview Button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewImage(stepImages[index])}
                                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                            title="Preview"
                                                                        >
                                                                            <EyeOutlined className="text-[#41398B] text-lg" />
                                                                        </button>

                                                                        {/* Re-upload Button */}
                                                                        <Upload
                                                                            showUploadList={false}
                                                                            beforeUpload={(file) => handleBeforeUpload(file, index)}
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
                                                                            onClick={() => removeStepImage(index)}
                                                                            className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                            title="Delete"
                                                                        >
                                                                            <X className="text-red-500 w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Upload
                                                                    showUploadList={false}
                                                                    beforeUpload={(file) => handleBeforeUpload(file, index)}
                                                                >
                                                                    <div className="w-48 h-36 border-2 border-dashed border-[#d1d5db] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                                                        <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                                                                        <span className="text-xs text-gray-500 font-['Manrope']">
                                                                            {activeTab === 'en' ? 'Upload Image' : 'Tải Lên Hình'}
                                                                        </span>
                                                                    </div>
                                                                </Upload>
                                                            )}
                                                        </div>

                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'image']}
                                                            noStyle
                                                        >
                                                            <Input type="hidden" />
                                                        </Form.Item>
                                                    </Form.Item>
                                                </div>
                                            ))}

                                            {/* Add Step Button */}
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                                size="large"
                                                className="!border-[#41398B] !text-[#41398B] hover:!bg-purple-50 rounded-[10px] h-12 font-semibold font-['Manrope']"
                                            >
                                                {activeTab === 'en' ? 'Add Process Step' : 'Thêm Bước Quy Trình'}
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
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
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                >
                                    {activeTab === 'vn'
                                        ? (pageData ? 'Lưu Quy Trình Mua' : 'Tạo Trang')
                                        : (pageData ? 'Save Process Steps' : 'Create Page')
                                    }
                                </Button>
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
