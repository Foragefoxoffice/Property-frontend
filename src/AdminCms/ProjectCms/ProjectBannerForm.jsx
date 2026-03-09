import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Spin
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import {
    getProjectBanner,
    createProjectBanner,
    updateProjectBanner,
    uploadProjectBannerImage
} from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import { X } from 'lucide-react';

const { TextArea } = Input;

export default function ProjectBannerForm() {
    const { can } = usePermissions();
    const { language } = useLanguage();
    const t = translations[language];
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pageData, setPageData] = useState(null);
    const [pageId, setPageId] = useState(null);
    const [activeTab, setActiveTab] = useState('vn');
    const [bannerImages, setBannerImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Fetch existing data
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getProjectBanner();
            const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;

            if (data) {
                setPageData(data);
                setPageId(data._id);
                form.setFieldsValue({
                    projectBannerTitle: data.projectBannerTitle,
                    projectBannerDesc: data.projectBannerDesc,
                });
                setBannerImages(data.projectBannerImages || []);
            }
        } catch (error) {
            console.error('Failed to fetch project banner data', error);
            CommonToaster('Failed to fetch project banner data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle multi-image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadProjectBannerImage(file);
            const uploadedUrl = response.data.url;

            setBannerImages(prev => {
                const updated = [...prev, uploadedUrl];
                return updated;
            });
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

    // Remove single image
    const removeImage = (index) => {
        setBannerImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        });
        CommonToaster('Image removed', 'info');
    };

    // Get full image URL
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        }
        return url;
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const payload = {
                ...values,
                projectBannerImages: bannerImages,
            };

            if (pageId) {
                await updateProjectBanner(pageId, payload);
                CommonToaster('Project Banner updated successfully!', 'success');
            } else {
                await createProjectBanner(payload);
                CommonToaster('Project Banner created successfully!', 'success');
            }

            fetchData();
        } catch (error) {
            CommonToaster(error.response?.data?.message || 'Failed to save project banner', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 style={{
                color: '#111827',
                fontSize: '30px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '18px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                {language === 'vi' ? 'Quản Lý Banner Dự Án' : 'Project Banner Management'}
            </h2>

            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                                    {language === 'vi' ? 'Banner Dự Án' : 'Project Banner'}
                                </h3>
                                <p className="text-sm text-gray-500 font-['Manrope']">
                                    {language === 'vi' ? 'Quản lý hình ảnh và nội dung banner trang dự án' : 'Manage project page banner images and content'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-2 bg-white border-t border-gray-100">
                        <Spin spinning={loading}>
                            <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmit}
                                    onFinishFailed={onFormFinishFailed}
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
                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Tiêu Đề Banner Dự Án
                                                                </span>
                                                            }
                                                            name={['projectBannerTitle', 'vi']}
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập tiêu đề banner' },
                                                                { max: 200, message: 'Tối đa 200 ký tự' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Dự Án Của Chúng Tôi"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Mô Tả Banner Dự Án
                                                                </span>
                                                            }
                                                            name={['projectBannerDesc', 'vi']}
                                                            rules={[
                                                                { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Nhập mô tả banner dự án..."
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                            />
                                                        </Form.Item>
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
                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Project Banner Title
                                                                </span>
                                                            }
                                                            name={['projectBannerTitle', 'en']}
                                                            rules={[
                                                                { required: true, message: 'Please enter banner title in English' },
                                                                { max: 200, message: 'Maximum 200 characters allowed' }
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Our Projects"
                                                                size="large"
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={
                                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                    Project Banner Description
                                                                </span>
                                                            }
                                                            name={['projectBannerDesc', 'en']}
                                                            rules={[
                                                                { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                            ]}
                                                        >
                                                            <TextArea
                                                                placeholder="Enter project banner description..."
                                                                rows={4}
                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                            />
                                                        </Form.Item>
                                                    </>
                                                )
                                            }
                                        ]}
                                    />

                                    {/* Multi Image Upload Section */}
                                    <Form.Item
                                        label={
                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                {activeTab === 'vn' ? 'Hình Ảnh Banner Dự Án' : 'Project Banner Images'}
                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                    ({activeTab === 'vn' ? 'Cho phép nhiều hình, Tối đa: 5MB mỗi hình' : 'Multiple images allowed, Max: 5MB each'})
                                                </span>
                                            </span>
                                        }
                                    >
                                        <div className="space-y-4">
                                            {/* Image Grid */}
                                            <div className="flex flex-wrap gap-4">
                                                {bannerImages.map((url, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group"
                                                    >
                                                        <img
                                                            src={getImageUrl(url)}
                                                            alt={`Banner ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Overlay Action Buttons */}
                                                        <div className="absolute inset-0 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 bg-black/30 transition-all">
                                                            {/* Preview */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewImage(url)}
                                                                className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                title="Preview"
                                                            >
                                                                <EyeOutlined className="text-[#41398B] text-lg" />
                                                            </button>

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                className="bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                                                                title="Delete"
                                                            >
                                                                <X className="text-red-500 w-5 h-5" />
                                                            </button>
                                                        </div>

                                                        {/* Image counter badge */}
                                                        <div className="absolute top-2 left-2 bg-[#41398B] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Upload Button */}
                                                <Upload
                                                    name="projectBannerImage"
                                                    listType="picture-card"
                                                    className="project-banner-uploader"
                                                    showUploadList={false}
                                                    beforeUpload={handleBeforeUpload}
                                                    multiple
                                                >
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        {uploading ? (
                                                            <Spin size="small" />
                                                        ) : (
                                                            <>
                                                                <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                                <div className="text-sm text-gray-500 font-['Manrope']">
                                                                    {activeTab === 'vn' ? 'Tải Lên Hình' : 'Upload Image'}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </Upload>
                                            </div>

                                            {bannerImages.length > 0 && (
                                                <p className="text-xs text-gray-400 font-['Manrope']">
                                                    {activeTab === 'vn'
                                                        ? `${bannerImages.length} hình ảnh đã tải lên. Di chuột qua để xem trước hoặc xóa.`
                                                        : `${bannerImages.length} image(s) uploaded. Hover over an image to preview or delete it.`
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </Form.Item>

                                    {/* Save Button */}
                                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            icon={<SaveOutlined />}
                                            loading={loading}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                        >
                                            {activeTab === 'vn'
                                                ? (pageData ? 'Lưu Banner' : 'Tạo Banner')
                                                : (pageData ? 'Save Banner' : 'Create Banner')
                                            }
                                        </Button>
                                    </div>
                                </Form>
                            </ConfigProvider>

                            <style>{`
                                .project-banner-uploader .ant-upload.ant-upload-select {
                                    width: 192px !important;
                                    height: 144px !important;
                                    border: 2px dashed #d1d5db !important;
                                    border-radius: 12px !important;
                                    background: #f9fafb !important;
                                    transition: all 0.3s ease !important;
                                }
                                .project-banner-uploader .ant-upload.ant-upload-select:hover {
                                    border-color: #41398B !important;
                                    background: #f3f4f6 !important;
                                }
                                .project-banner-uploader .ant-upload-list {
                                    display: none !important;
                                }
                            `}</style>
                        </Spin>
                    </div>
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
                            src={getImageUrl(previewImage)}
                            className="w-full h-full object-contain rounded-xl"
                            alt="Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}