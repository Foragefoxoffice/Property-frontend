import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Spin,
    Radio
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadProjectOverviewImage } from '../../Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';

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

    const [uploading, setUploading] = useState(false);
    const [mediaType, setMediaType] = useState('image');

    // Refs for Quill
    const quillRefEn = useRef(null);
    const quillRefVi = useRef(null);

    useEffect(() => {
        if (pageData) {
            setMediaType(pageData.mediaType || 'image');
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
                    const res = await uploadProjectOverviewImage(file);
                    const url = getImageUrl(res.data.url);

                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', url);
                } catch (error) {
                    CommonToaster('Image upload failed', 'error');
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

    // Single media upload handler (for the main specific media type: image)
    const handleMediaUpload = async (file) => {
        try {
            setUploading(true);
            const response = await uploadProjectOverviewImage(file);
            const uploadedUrl = response.data.url;

            form.setFieldsValue({
                projectOverviewVideo: uploadedUrl
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
        handleMediaUpload(file);
        return false;
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        }
        return url;
    };

    // Handle form submission
    const handleSubmit = (values) => {
        onSubmit(values);
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Nội Dung Tổng Quan' : 'Overview Content'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý thông tin và đa phương tiện' : 'Manage information and media'}
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
                                initialValues={{ mediaType: 'image' }}
                                onValuesChange={(changedValues) => {
                                    if (changedValues.mediaType) {
                                        setMediaType(changedValues.mediaType);
                                    }
                                }}
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    className="mb-6"
                                    items={[
                                        {
                                            key: 'vi',
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
                                                                Nội Dung Tổng Quan
                                                            </span>
                                                        }
                                                        name={['projectOverviewContent', 'vi']}
                                                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                                    >
                                                        <ReactQuill
                                                            ref={quillRefVi}
                                                            theme="snow"
                                                            modules={modulesVi}
                                                            formats={formats}
                                                            className="h-[400px] mb-12 rounded-lg"
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
                                                                Overview Content
                                                            </span>
                                                        }
                                                        name={['projectOverviewContent', 'en']}
                                                        rules={[{ required: true, message: 'Please enter content' }]}
                                                    >
                                                        <ReactQuill
                                                            ref={quillRefEn}
                                                            theme="snow"
                                                            modules={modulesEn}
                                                            formats={formats}
                                                            className="h-[400px] mb-12 rounded-lg"
                                                        />
                                                    </Form.Item>
                                                </>
                                            )
                                        }
                                    ]}
                                />

                                {/* Media Section */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h4 className="text-md font-bold text-gray-800 font-['Manrope'] mb-4">
                                        {activeTab === 'vi' ? 'Đa Phương Tiện (Hình/Video)' : 'Media (Image/Video)'}
                                    </h4>
                                    <Form.Item
                                        name="mediaType"
                                        className="mb-4"
                                    >
                                        <Radio.Group>
                                            <Radio.Button value="image">{activeTab === 'vi' ? 'Tải Lên Hình Ảnh' : 'Image Upload'}</Radio.Button>
                                            <Radio.Button value="youtube">{activeTab === 'vi' ? 'URL Video YouTube' : 'YouTube Video URL'}</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>

                                    {mediaType === 'image' ? (
                                        <Form.Item
                                            name="projectOverviewVideo"
                                            className="mb-0"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <Upload
                                                    name="projectOverviewMediaUpload"
                                                    listType="picture-card"
                                                    className="project-banner-uploader"
                                                    showUploadList={false}
                                                    beforeUpload={handleBeforeUpload}
                                                >
                                                    {form.getFieldValue('projectOverviewVideo') && !form.getFieldValue('projectOverviewVideo').includes('youtube') ? (
                                                        <img
                                                            src={getImageUrl(form.getFieldValue('projectOverviewVideo'))}
                                                            alt="Media"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full">
                                                            {uploading ? (
                                                                <Spin size="small" />
                                                            ) : (
                                                                <>
                                                                    <PlusOutlined className="text-3xl text-gray-400 mb-2 transition-all hover:text-purple-600" />
                                                                    <div className="text-sm text-gray-500 font-['Manrope']">
                                                                        {activeTab === 'vi' ? 'Tải Lên Khung Ảnh' : 'Upload Image Frame'}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </Upload>
                                                <span className="text-xs text-gray-400">Tối đa 5MB. Hình ảnh sẽ được hiển thị trên trang chủ.</span>
                                            </div>
                                        </Form.Item>
                                    ) : (
                                        <Form.Item
                                            name="projectOverviewVideo"
                                            rules={[{ required: true, message: 'Please enter a valid URL' }]}
                                        >
                                            <Input
                                                placeholder="e.g. https://www.youtube.com/watch?v=XXXXXXX"
                                                size="large"
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                            />
                                        </Form.Item>
                                    )}
                                </div>

                                {/* Save Button */}
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
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
                                            ? (pageData ? 'Cập Nhật' : 'Lưu')
                                            : (pageData ? 'Update' : 'Save')
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </ConfigProvider>

                        <style>{`
                                .project-banner-uploader .ant-upload.ant-upload-select {
                                    width: 250px !important;
                                    height: 150px !important;
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
    );
}