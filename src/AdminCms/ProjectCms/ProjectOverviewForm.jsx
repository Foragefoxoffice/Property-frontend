import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Spin,
} from 'antd';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadGeneralImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';
import { X } from 'lucide-react';

const { TextArea } = Input;

export default function ProjectOverviewForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang
}) {
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState('vi');

    // Sync activeTab with headerLang whenever headerLang changes
    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang === 'vn' ? 'vi' : 'en');
        }
    }, [headerLang]);

    const { language } = useLanguage();
    const t = translations[language];
    const [overviewImages, setOverviewImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (pageData) {
            setOverviewImages(pageData.projectOverviewImages || []);
        } else {
            setOverviewImages([]);
        }
    }, [pageData]);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image', 'video', 'color', 'background'
    ];

    // Handle multi-image upload
    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadGeneralImage(file);
            const uploadedUrl = response.data.url;

            setOverviewImages(prev => [
                ...prev,
                {
                    url: uploadedUrl,
                    description: { en: '', vi: '' }
                }
            ]);
            CommonToaster(t.toastImageUploaded, 'success');
            return false;
        } catch (error) {
            CommonToaster(t.toastImageUploadError, 'error');
            console.error(error);
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleBeforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            CommonToaster(t.toastImageTypeError, 'error');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            CommonToaster(t.toastImageSizeError, 'error');
            return Upload.LIST_IGNORE;
        }
        handleImageUpload(file);
        return false;
    };

    const removeImage = (index) => {
        setOverviewImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        });
        CommonToaster(t.toastImageRemoved, 'info');
    };

    const handleDescriptionChange = (index, lang, value) => {
        setOverviewImages(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                description: {
                    ...updated[index].description,
                    [lang]: value
                }
            };
            return updated;
        });
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        }
        return url;
    };

    const handleSubmit = (values) => {
        onSubmit(values, overviewImages);
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Tổng Quan Dự Án' : 'Project Overview'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý thông tin tổng quan và bảng biểu' : 'Manage overview information and tables'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                            key: 'vi',
                                            label: <span className="text-sm font-semibold font-['Manrope']">Tiếng Việt (VN)</span>,
                                            children: (
                                                <div className="space-y-6">
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Tổng Quan</span>}
                                                        name={['projectOverviewTitle', 'vi']}
                                                    >
                                                        <Input placeholder="Nhập tiêu đề tổng quan" size="large" className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12" />
                                                    </Form.Item>

                                                    <Form.List name="projectOverviewTable">
                                                        {(fields, { add, remove }) => (
                                                            <div className="mt-8 pt-6 border-t border-gray-100 font-['Manrope']">
                                                                <div className="flex justify-between items-center mb-6">
                                                                    <div>
                                                                        <span className="font-bold text-[#111827] text-md block">
                                                                            {activeTab === 'vi' ? 'Thông Tin Chi Tiết' : 'Specifications List'}
                                                                        </span>
                                                                        <p className="text-xs text-gray-500">
                                                                            {activeTab === 'vi'
                                                                                ? 'Thêm các cặp đầu mục và nội dung vào bảng tổng quan'
                                                                                : 'Add key-value pairs (Head & Description) to the overview table'
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <Button type="primary" onClick={() => add()} icon={<PlusOutlined />} className="bg-[#41398B] hover:bg-[#2f2775] font-['Manrope'] border-none">
                                                                        {activeTab === 'vi' ? 'Thêm Mục Mới' : 'Add New Item'}
                                                                    </Button>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    {fields.map(({ key, name, ...restField }) => (
                                                                        <div key={key} className="flex flex-col md:flex-row items-start gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all group relative">
                                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                                                                <Form.Item
                                                                                    {...restField}
                                                                                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đầu Mục (Head)</span>}
                                                                                    name={[name, 'head', 'vi']}
                                                                                    className="mb-0"
                                                                                    rules={[{ required: true, message: 'Vui lòng nhập' }]}
                                                                                >
                                                                                    <Input placeholder="Ví dụ: Chủ đầu tư" className="h-11 rounded-lg" />
                                                                                </Form.Item>
                                                                                <Form.Item
                                                                                    {...restField}
                                                                                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nội Dung (Des)</span>}
                                                                                    name={[name, 'des', 'vi']}
                                                                                    className="mb-0"
                                                                                    rules={[{ required: true, message: 'Vui lòng nhập' }]}
                                                                                >
                                                                                    <ReactQuill
                                                                                        theme="snow"
                                                                                        modules={{
                                                                                            toolbar: [
                                                                                                ['bold', 'italic', 'underline'],
                                                                                                [{ 'color': [] }],
                                                                                                ['link'],
                                                                                                ['clean']
                                                                                            ]
                                                                                        }}
                                                                                        className="bg-white rounded-lg"
                                                                                        placeholder="Nhập nội dung chi tiết..."
                                                                                    />
                                                                                </Form.Item>
                                                                            </div>
                                                                            <Button
                                                                                shape="circle"
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                className="opacity-40 group-hover:opacity-100 transition-opacity self-start md:mt-8"
                                                                                onClick={() => remove(name)}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {fields.length === 0 && (
                                                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 font-['Manrope']">
                                                                            <p className="text-gray-400 italic">
                                                                                {activeTab === 'vi' ? 'Chưa có thông tin chi tiết nào được tạo.' : 'No specifications created yet.'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'en',
                                            label: <span className="text-sm font-semibold font-['Manrope']">English (EN)</span>,
                                            children: (
                                                <div className="space-y-6">
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Overview Title</span>}
                                                        name={['projectOverviewTitle', 'en']}
                                                    >
                                                        <Input placeholder="Enter overview title" size="large" className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12" />
                                                    </Form.Item>

                                                    <Form.List name="projectOverviewTable">
                                                        {(fields, { add, remove }) => (
                                                            <div className="mt-8 pt-6 border-t border-gray-100 font-['Manrope']">
                                                                <div className="flex justify-between items-center mb-6">
                                                                    <div>
                                                                        <span className="font-bold text-[#111827] text-md block">
                                                                            {activeTab === 'vi' ? 'Thông Tin Chi Tiết' : 'Specifications List'}
                                                                        </span>
                                                                        <p className="text-xs text-gray-500">
                                                                            {activeTab === 'vi'
                                                                                ? 'Thêm các cặp đầu mục và nội dung vào bảng tổng quan'
                                                                                : 'Add key-value pairs (Head & Description) to the overview table'
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <Button type="primary" onClick={() => add()} icon={<PlusOutlined />} className="bg-[#41398B] hover:bg-[#2f2775] font-['Manrope'] border-none">
                                                                        {activeTab === 'vi' ? 'Thêm Mục Mới' : 'Add New Item'}
                                                                    </Button>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    {fields.map(({ key, name, ...restField }) => (
                                                                        <div key={key} className="flex flex-col md:flex-row items-start gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all group relative">
                                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                                                                <Form.Item
                                                                                    {...restField}
                                                                                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Head</span>}
                                                                                    name={[name, 'head', 'en']}
                                                                                    className="mb-0"
                                                                                    rules={[{ required: true, message: 'Required' }]}
                                                                                >
                                                                                    <Input placeholder="e.g. Developer" className="h-11 rounded-lg" />
                                                                                </Form.Item>
                                                                                <Form.Item
                                                                                    {...restField}
                                                                                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>}
                                                                                    name={[name, 'des', 'en']}
                                                                                    className="mb-0"
                                                                                    rules={[{ required: true, message: 'Required' }]}
                                                                                >
                                                                                    <ReactQuill
                                                                                        theme="snow"
                                                                                        modules={{
                                                                                            toolbar: [
                                                                                                ['bold', 'italic', 'underline'],
                                                                                                [{ 'color': [] }],
                                                                                                ['link'],
                                                                                                ['clean']
                                                                                            ]
                                                                                        }}
                                                                                        className="bg-white rounded-lg"
                                                                                        placeholder="Enter details..."
                                                                                    />
                                                                                </Form.Item>
                                                                            </div>
                                                                            <Button
                                                                                shape="circle"
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                className="opacity-40 group-hover:opacity-100 transition-opacity self-start md:mt-8"
                                                                                onClick={() => remove(name)}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {fields.length === 0 && (
                                                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 font-['Manrope']">
                                                                            <p className="text-gray-400 italic">
                                                                                {activeTab === 'vi' ? 'Chưa có thông tin chi tiết nào được tạo.' : 'No specifications created yet.'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            )
                                        }
                                    ]}
                                />

                                {/* Multi Image Upload with Description Section */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h4 className="text-md font-bold text-gray-800 font-['Manrope'] mb-4">
                                        {activeTab === 'vi' ? 'Hình Ảnh Tổng Quan & Mô Tả' : 'Overview Images & Descriptions'}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {overviewImages.map((img, idx) => (
                                            <div key={idx} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                                <div className="relative h-40 w-full rounded-lg overflow-hidden mb-2">
                                                    <img src={getImageUrl(img.url)} alt={`Overview ${idx}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button shape="circle" icon={<EyeOutlined />} onClick={() => setPreviewImage(img.url)} />
                                                        <Button shape="circle" danger icon={<DeleteOutlined />} onClick={() => removeImage(idx)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-bold text-gray-500 uppercase">Tiếng Việt (VN)</span>
                                                        <TextArea
                                                            value={img.description?.vi}
                                                            onChange={(e) => handleDescriptionChange(idx, 'vi', e.target.value)}
                                                            placeholder="Mô tả hình ảnh (VN)"
                                                            rows={2}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-bold text-gray-500 uppercase">English (EN)</span>
                                                        <TextArea
                                                            value={img.description?.en}
                                                            onChange={(e) => handleDescriptionChange(idx, 'en', e.target.value)}
                                                            placeholder="Image description (EN)"
                                                            rows={2}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 left-2 bg-[#41398B] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        ))}

                                        <Upload
                                            name="overviewImage"
                                            listType="picture-card"
                                            className="overview-uploader h-[300px]"
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
                                                            {activeTab === 'vi' ? 'Tải Lên Hình Ảnh' : 'Upload Image'}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Upload>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex gap-3 justify-end mt-12 pt-4 border-t border-gray-200">
                                    <Button
                                        size="large"
                                        onClick={onCancel}
                                        className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                    >
                                        {activeTab === 'vi' ? 'Hủy' : 'Cancel'}
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {activeTab === 'vi'
                                            ? (pageData ? 'Cập Nhật Tổng Quan' : 'Lưu Tổng Quan')
                                            : (pageData ? 'Update Overview' : 'Save Overview')
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </ConfigProvider>

                        <style>{`
                            .overview-uploader .ant-upload.ant-upload-select {
                                width: 100% !important;
                                min-height: 200px !important;
                                border: 2px dashed #d1d5db !important;
                                border-radius: 12px !important;
                                background: #f9fafb !important;
                                transition: all 0.3s ease !important;
                            }
                            .overview-uploader .ant-upload.ant-upload-select:hover {
                                border-color: #41398B !important;
                                background: #f3f4f6 !important;
                            }

                            /* Quill Border & Toolbar Fixes */
                            .quill {
                                border-radius: 12px !important;
                                overflow: hidden !important;
                                border: 1px solid #d1d5db !important;
                                transition: all 0.3s ease;
                                display: flex;
                                flex-direction: column;
                                background: white;
                            }
                            .quill:focus-within {
                                border-color: #41398B !important;
                                box-shadow: 0 0 0 2px rgba(65, 57, 139, 0.1);
                            }
                            .ql-toolbar.ql-snow {
                                border: none !important;
                                border-bottom: 1px solid #e5e7eb !important;
                                background: #f8fafc !important;
                                padding: 8px 12px !important;
                                font-family: 'Manrope', sans-serif !important;
                            }
                            .ql-container.ql-snow {
                                border: none !important;
                                flex: 1;
                                font-family: 'Manrope', sans-serif !important;
                                font-size: 14px !important;
                            }
                            .ql-editor {
                                min-height: 100px;
                                padding: 16px !important;
                                font-family: 'Manrope', sans-serif !important;
                            }
                            .ql-editor.ql-blank::before {
                                color: #9ca3af !important;
                                font-style: normal !important;
                                left: 16px !important;
                            }
                            /* Ensure icons are visible and correctly colored */
                            .ql-snow .ql-stroke {
                                stroke: #4b5563 !important;
                            }
                            .ql-snow .ql-fill {
                                fill: #4b5563 !important;
                            }
                            .ql-snow .ql-picker {
                                color: #4b5563 !important;
                            }
                        `}</style>
                    </Spin>
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