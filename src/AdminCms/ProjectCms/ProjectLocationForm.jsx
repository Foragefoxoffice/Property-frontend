import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Spin,
    Divider
} from 'antd';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import {
    SaveOutlined,
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadGeneralImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { X } from 'lucide-react';

export default function ProjectLocationForm({
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

    const [locationImages, setLocationImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Refs for Quill
    const quillRefEn = useRef(null);
    const quillRefVi = useRef(null);

    useEffect(() => {
        if (pageData) {
            setLocationImages(pageData.projectLocationImages || []);
        } else {
            setLocationImages([]);
        }
    }, [pageData]);

    // Helper for uploading image in Quill editor
    const imageHandler = (quillRef) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const res = await uploadGeneralImage(file);
                    const url = getImageUrl(res.data.url);

                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', url);
                } catch (error) {
                    CommonToaster(t.toastImageUploadError, 'error');
                    console.error(error);
                }
            }
        };
    };

    // Quill Modules
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' },
                { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const modulesEn = useMemo(() => ({
        ...modules,
        toolbar: {
            ...modules.toolbar,
            handlers: {
                image: () => imageHandler(quillRefEn)
            }
        }
    }), [modules]);

    const modulesVi = useMemo(() => ({
        ...modules,
        toolbar: {
            ...modules.toolbar,
            handlers: {
                image: () => imageHandler(quillRefVi)
            }
        }
    }), [modules]);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image', 'video', 'align', 'color', 'background'
    ];

    // Handle image upload
    const handleImageUpload = async (file) => {
        if (locationImages.length >= 3) {
            CommonToaster(t.toastImageMaxError, 'error');
            return false;
        }

        try {
            setUploading(true);
            const response = await uploadGeneralImage(file);
            const uploadedUrl = response.data.url;

            setLocationImages(prev => {
                const updated = [...prev, uploadedUrl];
                return updated;
            });
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
        setLocationImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        });
        CommonToaster(t.toastImageRemoved, 'info');
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        }
        return url;
    };

    const handleSubmit = (values) => {
        onSubmit(values, locationImages);
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl mt-0">
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Vị Trí Dự Án' : 'Project Location'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý thông tin vị trí và bản đồ' : 'Manage location information and maps'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Vị Trí</span>}
                                                        name={['projectLocationTitle', 'vi']}
                                                    >
                                                        <Input placeholder="Nhập tiêu đề vị trí" size="large" className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Nội Dung Vị Trí</span>}
                                                        name={['projectLocationDes', 'vi']}
                                                    >
                                                        <ReactQuill
                                                            ref={quillRefVi}
                                                            theme="snow"
                                                            modules={modulesVi}
                                                            formats={formats}
                                                            className="rounded-lg"
                                                            placeholder="Nhập nội dung vị trí..."
                                                        />
                                                    </Form.Item>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'en',
                                            label: <span className="text-sm font-semibold font-['Manrope']">English (EN)</span>,
                                            children: (
                                                <div className="space-y-6">
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Location Title</span>}
                                                        name={['projectLocationTitle', 'en']}
                                                    >
                                                        <Input placeholder="Enter location title" size="large" className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Location Description</span>}
                                                        name={['projectLocationDes', 'en']}
                                                    >
                                                        <ReactQuill
                                                            ref={quillRefEn}
                                                            theme="snow"
                                                            modules={modulesEn}
                                                            formats={formats}
                                                            className="rounded-lg"
                                                            placeholder="Enter location description content..."
                                                        />
                                                    </Form.Item>
                                                </div>
                                            )
                                        }
                                    ]}
                                />

                                {/* Location Images Section (Max 3) */}
                                <div className="mt-12 pt-6 border-t border-gray-200">
                                    <h4 className="text-md font-bold text-gray-800 font-['Manrope'] mb-2">
                                        {activeTab === 'vi' ? 'Hình Ảnh Vị Trí (Tối đa 3)' : 'Location Images (Max 3)'}
                                    </h4>
                                    <p className="text-sm text-gray-500 mb-6 font-['Manrope'] font-medium">
                                        {activeTab === 'vi' ? 'Vui lòng tải lên tối đa 3 hình ảnh minh họa cho vị trí dự án.' : 'Please upload up to 3 images representing the project location.'}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {locationImages.map((imgUrl, idx) => (
                                            <div key={idx} className="relative group h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:border-purple-300">
                                                <img src={getImageUrl(imgUrl)} alt={`Location ${idx}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button shape="circle" icon={<EyeOutlined />} onClick={() => setPreviewImage(imgUrl)} />
                                                    <Button shape="circle" danger icon={<DeleteOutlined />} onClick={() => removeImage(idx)} />
                                                </div>
                                                <div className="absolute top-2 left-2 bg-[#41398B] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        ))}

                                        {locationImages.length < 3 && (
                                            <Upload
                                                listType="picture-card"
                                                className="location-uploader h-48"
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
                                                            <div className="text-sm text-gray-500 font-['Manrope'] font-medium">
                                                                {activeTab === 'vi' ? 'Tải Lên' : 'Upload'}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </Upload>
                                        )}
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
                                        className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md font-['Manrope'] h-12 border-none"
                                    >
                                        {activeTab === 'vi'
                                            ? (pageData ? 'Cập Nhật Vị Trí' : 'Lưu Vị Trí')
                                            : (pageData ? 'Update Location' : 'Save Location')
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </ConfigProvider>

                        <style>{`
                            .location-uploader .ant-upload.ant-upload-select {
                                width: 100% !important;
                                height: 100% !important;
                                min-height: 192px !important;
                                border: 2px dashed #d1d5db !important;
                                border-radius: 12px !important;
                                background: #f9fafb !important;
                                transition: all 0.3s ease !important;
                                margin: 0 !important;
                            }
                            .location-uploader .ant-upload.ant-upload-select:hover {
                                border-color: #41398B !important;
                                background: #f5f3ff !important;
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
                                min-height: 200px;
                                padding: 16px !important;
                                font-family: 'Manrope', sans-serif !important;
                            }
                            .ql-editor.ql-blank::before {
                                color: #9ca3af !important;
                                font-style: normal !important;
                                left: 16px !important;
                            }
                            /* Ensure icons are visible and correctly colored */
                            .ql-stroke {
                                stroke: #4b5563 !important;
                            }
                            .ql-fill {
                                fill: #4b5563 !important;
                            }
                            .ql-picker {
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
                            className="absolute top-3 right-3 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-full p-2 z-10 transition-all shadow-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={getImageUrl(previewImage)}
                            className="w-full h-full object-contain rounded-xl shadow-2xl"
                            alt="Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}