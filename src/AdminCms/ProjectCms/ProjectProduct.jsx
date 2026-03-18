import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Upload,
    Spin,
    Card,
    Space
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

export default function ProjectProduct({
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

    // Refs for Quill editors
    const titleQuillRefEn = useRef(null);
    const titleQuillRefVi = useRef(null);

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

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        }
        return url;
    };

    // Handle single image upload for products
    const handleProductImageUpload = async (file, index) => {
        try {
            setUploading(true);
            const response = await uploadGeneralImage(file);
            const uploadedUrl = response.data.url;

            const currentProducts = form.getFieldValue('projectProducts') || [];
            if (currentProducts[index]) {
                currentProducts[index].projectProductProductImage = uploadedUrl;
                form.setFieldsValue({ projectProducts: currentProducts });
            }

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

    const handleBeforeUpload = (file, index) => {
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
        handleProductImageUpload(file, index);
        return false;
    };

    const handleSubmit = (values) => {
        onSubmit(values);
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Sản Phẩm Dự Án' : 'Project Products'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý thông tin và danh sách sản phẩm' : 'Manage product information and list'}
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
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Dòng Sản Phẩm</span>}
                                                        name={['projectProductTitle', 'vi']}
                                                    >
                                                        <Input placeholder="Nhập tiêu đề sản phẩm" size="large" className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Dòng Sản Phẩm</span>}
                                                        name={['projectProductDes', 'vi']}
                                                    >
                                                        <ReactQuill
                                                            theme="snow"
                                                            modules={modules}
                                                            className="bg-white rounded-lg mb-12"
                                                            placeholder="Nhập mô tả sản phẩm..."
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
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Product Line Title</span>}
                                                        name={['projectProductTitle', 'en']}
                                                    >
                                                        <Input placeholder="Enter product title" size="large" className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Product Line Description</span>}
                                                        name={['projectProductDes', 'en']}
                                                    >
                                                        <ReactQuill
                                                            theme="snow"
                                                            modules={modules}
                                                            className="bg-white rounded-lg mb-12"
                                                            placeholder="Enter product description..."
                                                        />
                                                    </Form.Item>
                                                </div>
                                            )
                                        }
                                    ]}
                                />

                                {/* Multi Add Products Section */}
                                <div className="pt-6 border-t border-gray-100 font-['Manrope']">
                                    <Form.List name="projectProducts">
                                        {(fields, { add, remove }) => (
                                            <div className="space-y-8">
                                                <div className="flex justify-between items-center mb-6 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                                    <div>
                                                        <span className="font-bold text-[#41398B] text-lg block">
                                                            {activeTab === 'vi' ? 'Danh Sách Sản Phẩm Chi Tiết' : 'Detailed Product List'}
                                                        </span>
                                                        <p className="text-sm text-indigo-600">
                                                            {activeTab === 'vi'
                                                                ? 'Thêm và quản lý các sản phẩm cụ thể (Biệt thự, Căn hộ, Shophouse...)'
                                                                : 'Add and manage specific products (Villas, Apartments, Shophouse...)'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => add()}
                                                        icon={<PlusOutlined />}
                                                        className="bg-[#41398B] hover:bg-[#41398B] border-none h-11 px-6 rounded-xl font-bold font-['Manrope'] shadow-lg shadow-indigo-100"
                                                    >
                                                        {activeTab === 'vi' ? 'Thêm Sản Phẩm' : 'Add Product'}
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    {fields.map(({ key, name, ...restField }) => (
                                                        <Card
                                                            key={key}
                                                            className="shadow-sm hover:shadow-md transition-shadow border-gray-100 rounded-2xl overflow-hidden"
                                                            title={
                                                                <div className="flex items-center justify-between font-['Manrope']">
                                                                    <Space>
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                                            {name + 1}
                                                                        </div>
                                                                        <span className="font-bold text-gray-700">
                                                                            {activeTab === 'vi' ? `Sản Phẩm #${name + 1}` : `Product #${name + 1}`}
                                                                        </span>
                                                                    </Space>
                                                                    <Button
                                                                        type="text"
                                                                        danger
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => remove(name)}
                                                                        className="hover:bg-red-50"
                                                                    >
                                                                        {activeTab === 'vi' ? 'Xóa' : 'Delete'}
                                                                    </Button>
                                                                </div>
                                                            }
                                                        >
                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                                {/* Image Upload Column */}
                                                                <div className="lg:col-span-1">
                                                                    <Form.Item
                                                                        {...restField}
                                                                        label={<span className="font-bold text-gray-500 text-xs uppercase tracking-wider">{activeTab === 'vi' ? 'Hình Ảnh Sản Phẩm' : 'Product Image'}</span>}
                                                                        name={[name, 'projectProductProductImage']}
                                                                        className="mb-0"
                                                                    >
                                                                        <div className="space-y-3">
                                                                            <Upload
                                                                                listType="picture-card"
                                                                                className="product-uploader w-full"
                                                                                showUploadList={false}
                                                                                beforeUpload={(file) => handleBeforeUpload(file, name)}
                                                                            >
                                                                                {form.getFieldValue(['projectProducts', name, 'projectProductProductImage']) ? (
                                                                                    <div className="relative group w-full h-full">
                                                                                        <img
                                                                                            src={getImageUrl(form.getFieldValue(['projectProducts', name, 'projectProductProductImage']))}
                                                                                            alt="Product"
                                                                                            className="w-full h-full object-cover rounded-lg"
                                                                                        />
                                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                                                                            <Button
                                                                                                shape="circle"
                                                                                                icon={<EyeOutlined />}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setPreviewImage(form.getFieldValue(['projectProducts', name, 'projectProductProductImage']));
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex flex-col items-center justify-center h-full">
                                                                                        {uploading ? (
                                                                                            <Spin size="small" />
                                                                                        ) : (
                                                                                            <>
                                                                                                <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                                                                                                <div className="text-xs text-gray-500 font-medium">{activeTab === 'vi' ? 'Tải Ảnh' : 'Upload Image'}</div>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </Upload>
                                                                        </div>
                                                                    </Form.Item>
                                                                </div>

                                                                {/* Content Column */}
                                                                <div className="lg:col-span-2 space-y-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <Form.Item
                                                                            {...restField}
                                                                            label={<span className="font-semibold text-gray-600 text-sm">Tên Sản Phẩm (VN)</span>}
                                                                            name={[name, 'projectProductProductTitle', 'vi']}
                                                                            rules={[{ required: true, message: 'Nhập tên' }]}
                                                                        >
                                                                            <Input placeholder="Ví dụ: Biệt thự đơn lập" className="h-11 rounded-lg" />
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            label={<span className="font-semibold text-gray-600 text-sm">Product Name (EN)</span>}
                                                                            name={[name, 'projectProductProductTitle', 'en']}
                                                                            rules={[{ required: true, message: 'Enter name' }]}
                                                                        >
                                                                            <Input placeholder="e.g. Detached Villa" className="h-11 rounded-lg" />
                                                                        </Form.Item>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <span className="font-semibold text-gray-600 text-sm block">Mô Tả Sản Phẩm (VN)</span>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'projectProductProducDes', 'vi']}
                                                                            className="mb-0"
                                                                        >
                                                                            <ReactQuill
                                                                                theme="snow"
                                                                                modules={{
                                                                                    toolbar: [
                                                                                        ['bold', 'italic', 'underline'],
                                                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                                                        ['clean']
                                                                                    ]
                                                                                }}
                                                                                className="bg-white rounded-lg mb-12"
                                                                                placeholder="Nhập mô tả sản phẩm (Tiếng Việt)..."
                                                                            />
                                                                        </Form.Item>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <span className="font-semibold text-gray-600 text-sm block">Product Description (EN)</span>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'projectProductProducDes', 'en']}
                                                                            className="mb-0"
                                                                        >
                                                                            <ReactQuill
                                                                                theme="snow"
                                                                                modules={{
                                                                                    toolbar: [
                                                                                        ['bold', 'italic', 'underline'],
                                                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                                                        ['clean']
                                                                                    ]
                                                                                }}
                                                                                className="bg-white rounded-lg mb-12"
                                                                                placeholder="Enter product description (English)..."
                                                                            />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}

                                                    {fields.length === 0 && (
                                                        <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                                            <p className="text-gray-400 font-medium italic">
                                                                {activeTab === 'vi' ? 'Chưa có sản phẩm nào được thêm.' : 'No products added yet.'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Form.List>
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
                                        className="flex items-center gap-2 px-6 h-12 bg-[#41398B] hover:bg-[#2f2775] cursor-pointer text-white rounded-xl shadow-md font-bold border-none"
                                    >
                                        {activeTab === 'vi'
                                            ? (pageData?.projectProducts?.length > 0 ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm')
                                            : (pageData?.projectProducts?.length > 0 ? 'Update Products' : 'Save Products')
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </ConfigProvider>

                        <style>{`
                            .product-uploader .ant-upload.ant-upload-select {
                                width: 100% !important;
                                height: 250px !important;
                                border: 2px dashed #d1d5db !important;
                                border-radius: 16px !important;
                                background: #f9fafb !important;
                                transition: all 0.3s ease !important;
                                margin: 0 !important;
                            }
                            .product-uploader .ant-upload.ant-upload-select:hover {
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
                                min-height: 120px;
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
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-center p-4"
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
                            className="w-full h-full object-contain rounded-xl"
                            alt="Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}