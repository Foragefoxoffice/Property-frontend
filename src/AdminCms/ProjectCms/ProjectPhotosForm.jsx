import { useState, useEffect, useMemo } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Spin,
    Card,
    Typography,
} from 'antd';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined,
    FolderAddOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { uploadGeneralImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { X } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ProjectPhotosForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang
}) {
    const { language } = useLanguage();
    const t = translations[language];
    const [activeTab, setActiveTab] = useState('vi');

    // Sync activeTab with headerLang whenever headerLang changes
    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang === 'vn' ? 'vi' : 'en');
        }
    }, [headerLang]);

    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Get current tab images from form state (actually we need to manage this via Form or separate state)
    // To keep it consistent, let's use Form's state for everything besides binary image preview.
    // However, antd Form doesn't easily store the binary/url list for custom uploaders without some mapping.
    // I will use local state for each tab's images or just use form methods.

    // Ant Design's Form.List is good. I will use it.

    const handleImageUpload = async (file, addImageCallback) => {
        try {
            setUploading(true);
            const response = await uploadGeneralImage(file);
            const uploadedUrl = response.data.url;

            addImageCallback({
                url: uploadedUrl,
                description: { en: '', vi: '' }
            });
            CommonToaster(t.toastImageUploaded, 'success');
        } catch (error) {
            CommonToaster(t.toastImageUploadError, 'error');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleBeforeUpload = (file, addImageCallback) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            CommonToaster(t.toastImageTypeError, 'error');
            return Upload.LIST_IGNORE;
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            CommonToaster(t.toastImageSizeError10MB, 'error');
            return Upload.LIST_IGNORE;
        }
        handleImageUpload(file, addImageCallback);
        return false;
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        }
        return url;
    };

    const handleSubmit = (values) => {
        onSubmit(values);
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-pink-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a1 1 0 011.414 0L12 14l4.586-4.586a1 1 0 011.414 0L20 16m-7-4V7m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Thư Viện Ảnh (Tabs)' : 'Photo Library Tabs'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý các tab hình ảnh và mô tả theo từng phân khu' : 'Manage categorised photo tabs and descriptions'}
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <Spin spinning={loading}>
                        <ConfigProvider theme={{
                            token: { colorPrimary: '#41398B' },
                            components: {
                                Tabs: {
                                    cardBg: '#f9fafb',
                                }
                            }
                        }}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                onFinishFailed={onFormFinishFailed}
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    className="mb-8"
                                    items={[
                                        {
                                            key: 'vi',
                                            label: <span className="text-sm font-semibold font-['Manrope'] px-4">Tiếng Việt (VN)</span>,
                                            children: (
                                                <Form.Item
                                                    label={<span className="font-bold text-[#374151] text-sm uppercase tracking-wider font-['Manrope']">Tiêu Đề Khu Ảnh</span>}
                                                    name={['projectPhotoTitle', 'vi']}
                                                >
                                                    <Input placeholder="Nhập tiêu đề thư viện ảnh" size="large" className="bg-white border-[#e5e7eb] rounded-xl text-[15px] font-['Manrope'] h-12 shadow-sm focus:shadow-md transition-shadow" />
                                                </Form.Item>
                                            )
                                        },
                                        {
                                            key: 'en',
                                            label: <span className="text-sm font-semibold font-['Manrope'] px-4">English (EN)</span>,
                                            children: (
                                                <Form.Item
                                                    label={<span className="font-bold text-[#374151] text-sm uppercase tracking-wider font-['Manrope']">Gallery Title</span>}
                                                    name={['projectPhotoTitle', 'en']}
                                                >
                                                    <Input placeholder="Enter photo gallery title" size="large" className="bg-white border-[#e5e7eb] rounded-xl text-[15px] font-['Manrope'] h-12 shadow-sm focus:shadow-md transition-shadow" />
                                                </Form.Item>
                                            )
                                        }
                                    ]}
                                />

                                {/* Tabs Content Management */}
                                <div className="space-y-8">
                                    <Form.List name="projectPhotoTabs">
                                        {(fields, { add, remove }) => (
                                            <div className="space-y-12">
                                                <div className="flex items-center justify-between bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm font-['Manrope']">
                                                    <div>
                                                        <h4 className="text-[#41398B] font-bold text-lg mb-1">
                                                            {activeTab === 'vi' ? 'Cấu Hình Các Phân Khu' : 'Tab Configuration'}
                                                        </h4>
                                                        <p className="text-purple-600 text-sm opacity-80">
                                                            {activeTab === 'vi'
                                                                ? 'Thêm và quản lý các tab hình ảnh như: Mặt bằng, Tiến độ, Vị trí...'
                                                                : 'Add and manage image tabs such as: Layout, Progress, Location...'
                                                            }
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => add()}
                                                        icon={<PlusOutlined />}
                                                        className="bg-[#41398B] hover:bg-[#2f2775] h-11 px-6 rounded-xl font-semibold shadow-lg hover:shadow-purple-200 transition-all font-['Manrope'] border-none"
                                                    >
                                                        {activeTab === 'vi' ? 'Thêm Phân Khu Mới' : 'Add New Tab'}
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-8">
                                                    {fields.map(({ key, name, ...restField }) => (
                                                        <Card
                                                            key={key}
                                                            className="shadow-md hover:shadow-lg transition-all border-gray-100 rounded-3xl overflow-hidden group/tab"
                                                            title={
                                                                <div className="flex items-center justify-between py-2 font-['Manrope']">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                                            {name + 1}
                                                                        </div>
                                                                        <span className="text-gray-800 font-bold">
                                                                            {activeTab === 'vi' ? `Cài đặt Phân Khu #${name + 1}` : `Tab Settings #${name + 1}`}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        danger
                                                                        type="text"
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => remove(name)}
                                                                        className="hover:bg-red-50 font-semibold"
                                                                    >
                                                                        {activeTab === 'vi' ? 'Xóa Phân Khu' : 'Delete Tab'}
                                                                    </Button>
                                                                </div>
                                                            }
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-['Manrope']">
                                                                <Form.Item
                                                                    {...restField}
                                                                    label={<span className="font-semibold text-gray-600">{activeTab === 'vi' ? 'Tiêu đề Tab (VN)' : 'Tab Title (VN)'}</span>}
                                                                    name={[name, 'tabTitle', 'vi']}
                                                                    rules={[{ required: true, message: activeTab === 'vi' ? 'Nhập tiêu đề' : 'Enter title' }]}
                                                                >
                                                                    <Input placeholder={activeTab === 'vi' ? "Ví dụ: Phân khu thấp tầng" : "e.g. Low-rise area"} className="h-11 rounded-lg" />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...restField}
                                                                    label={<span className="font-semibold text-gray-600">{activeTab === 'vi' ? 'Tiêu đề Tab (EN)' : 'Tab Title (EN)'}</span>}
                                                                    name={[name, 'tabTitle', 'en']}
                                                                    rules={[{ required: true, message: activeTab === 'vi' ? 'Nhập tiêu đề' : 'Enter title' }]}
                                                                >
                                                                    <Input placeholder={activeTab === 'vi' ? "Ví dụ: Low-rise area" : "e.g. Low-rise area"} className="h-11 rounded-lg" />
                                                                </Form.Item>
                                                            </div>

                                                            {/* Nested Form.List for Images in this Tab */}
                                                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 font-['Manrope']">
                                                                <h5 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                                                                    <EyeOutlined className="text-purple-500" />
                                                                    {activeTab === 'vi' ? 'Danh Sách Hình Ảnh' : 'Image List'}
                                                                </h5>

                                                                <Form.List name={[name, 'images']}>
                                                                    {(imgFields, { add: addImg, remove: removeImg }) => (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                            {imgFields.map(({ key: imgKey, name: imgName, ...restImgField }) => (
                                                                                <div key={imgKey} className="flex flex-col bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group/img">
                                                                                    <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden group-hover:shadow-md transition-shadow">
                                                                                        <img
                                                                                            src={getImageUrl(form.getFieldValue(['projectPhotoTabs', name, 'images', imgName, 'url']))}
                                                                                            className="w-full h-full object-cover"
                                                                                            alt="Gallery"
                                                                                        />
                                                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                            <Button
                                                                                                shape="circle"
                                                                                                icon={<EyeOutlined />}
                                                                                                onClick={() => setPreviewImage(form.getFieldValue(['projectPhotoTabs', name, 'images', imgName, 'url']))}
                                                                                            />
                                                                                            <Button
                                                                                                shape="circle"
                                                                                                danger
                                                                                                icon={<DeleteOutlined />}
                                                                                                onClick={() => removeImg(imgName)}
                                                                                            />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-3 font-['Manrope']">
                                                                                        <Form.Item
                                                                                            {...restImgField}
                                                                                            name={[imgName, 'description', 'vi']}
                                                                                            className="mb-0"
                                                                                        >
                                                                                            <TextArea placeholder={activeTab === 'vi' ? "Mô tả (VN)" : "Description (VN)"} rows={2} className="text-xs rounded-md border-gray-100 focus:border-purple-300" />
                                                                                        </Form.Item>
                                                                                        <Form.Item
                                                                                            {...restImgField}
                                                                                            name={[imgName, 'description', 'en']}
                                                                                            className="mb-0"
                                                                                        >
                                                                                            <TextArea placeholder={activeTab === 'vi' ? "Mô tả (EN)" : "Description (EN)"} rows={2} className="text-xs rounded-md border-gray-100 focus:border-purple-300" />
                                                                                        </Form.Item>
                                                                                        {/* Hidden URL field */}
                                                                                        <Form.Item name={[imgName, 'url']} hidden>
                                                                                            <Input />
                                                                                        </Form.Item>
                                                                                    </div>
                                                                                </div>
                                                                            ))}

                                                                            <Upload
                                                                                listType="picture-card"
                                                                                className="photo-uploader"
                                                                                showUploadList={false}
                                                                                beforeUpload={(file) => handleBeforeUpload(file, addImg)}
                                                                                multiple
                                                                            >
                                                                                <div className="flex flex-col items-center justify-center p-4 font-['Manrope']">
                                                                                    {uploading ? <Spin size="small" /> : <><PlusOutlined className="text-xl mb-1" /> <div className="text-xs">{activeTab === 'vi' ? 'Tải Lên' : 'Upload'}</div></>}
                                                                                </div>
                                                                            </Upload>
                                                                        </div>
                                                                    )}
                                                                </Form.List>
                                                            </div>
                                                        </Card>
                                                    ))}

                                                    {fields.length === 0 && (
                                                        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <FolderAddOutlined className="text-3xl text-gray-300" />
                                                            </div>
                                                            <p className="text-gray-400 font-medium italic">
                                                                {activeTab === 'vi'
                                                                    ? 'Không có tab nào được tạo. Nhấp "Thêm Phân Khu Mới" để bắt đầu.'
                                                                    : 'No tabs created. Click "Add New Tab" to get started.'
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Form.List>
                                </div>

                                {/* Save Button */}
                                <div className="flex gap-4 justify-end mt-16 pt-6 border-t border-gray-100">
                                    <Button
                                        size="large"
                                        onClick={onCancel}
                                        className="rounded-xl font-semibold text-[15px] h-12 px-8 font-['Manrope'] border-gray-200 text-gray-600 hover:!text-[#41398B] hover:!border-[#41398B] transition-all"
                                    >
                                        {activeTab === 'vi' ? 'Hủy Bỏ' : 'Cancel'}
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-10 h-12 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-xl shadow-lg hover:shadow-purple-200 transition-all font-bold border-none"
                                    >
                                        {activeTab === 'vi'
                                            ? (pageData ? 'Cập Nhật Thư Viện' : 'Lưu Thư Viện')
                                            : (pageData ? 'Update Gallery' : 'Save Gallery')
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </ConfigProvider>

                        <style>{`
                            .photo-uploader .ant-upload.ant-upload-select {
                                width: 100% !important;
                                min-height: 160px !important;
                                border: 2px dashed #e5e7eb !important;
                                border-radius: 12px !important;
                                background: #f9fafb !important;
                                transition: all 0.3s ease !important;
                                margin: 0 !important;
                            }
                            .photo-uploader .ant-upload.ant-upload-select:hover {
                                border-color: #41398B !important;
                                background: #fff !important;
                            }
                        `}</style>
                    </Spin>
                </div>
            </div>

            {/* Preview Modal */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex justify-center items-center p-6"
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-black/20 group"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 z-10 transition-all border border-white/20 shadow-xl"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={getImageUrl(previewImage)}
                            className="w-full h-full object-contain"
                            alt="Preview"
                        />
                        <div className="absolute bottom-4 left-4 text-white/60 text-xs font-mono">
                            {previewImage}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}