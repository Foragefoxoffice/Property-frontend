import React, { useState, useMemo } from 'react';
import { Form, Input, Select, Switch, Upload, Button, ConfigProvider, Tabs } from 'antd';
import { ChevronDown, ChevronUp, Layout, Upload as UploadIcon, X, Languages, FileText } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';
import { uploadGeneralImage } from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import { CommonToaster } from '@/Common/CommonToaster';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const { Option } = Select;

export default function ProjectGeneralForm({
    form,
    onSubmit,
    loading,
    categories,
    isOpen,
    onToggle,
    headerLang,
    mainImage,
    setMainImage
}) {
    const { language } = useLanguage();
    const t = translations[language];
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('vi');

    const handleUpload = async (info) => {
        try {
            setUploading(true);
            const file = info.file;
            const res = await uploadGeneralImage(file);
            setMainImage(res.data.url);
            CommonToaster(t.toastImageUploaded, 'success');
        } catch (error) {
            console.error(error);
            CommonToaster(t.toastImageUploadError, 'error');
        } finally {
            setUploading(false);
        }
    };

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean']
        ],
    }), []);

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'color', 'background', 'link'
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div
                onClick={onToggle}
                className="px-6 py-5 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center cursor-pointer hover:from-purple-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <Layout className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {t.generalInfo}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {headerLang === 'en' ? 'Manage basic project details' : 'Quản lý thông tin cơ bản dự án'}
                        </p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>

            {/* Content */}
            {isOpen && (
                <div className="p-8 bg-white">
                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: '#41398B',
                                borderRadius: 10,
                            },
                        }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={(values) => onSubmit(values, mainImage)}
                            onValuesChange={(changedValues) => {
                                if ('published' in changedValues && form.getFieldValue('id')) {
                                    form.submit();
                                }
                            }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Form.Item
                                    label={<div className="flex items-center gap-2 font-bold text-gray-700 font-['Manrope']"><Languages size={16} />{t.projectTitle} (EN)</div>}
                                    name={['title', 'en']}
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Input placeholder="e.g. Luxury Apartment Complex" className="h-12 rounded-xl" />
                                </Form.Item>

                                <Form.Item
                                    label={<div className="flex items-center gap-2 font-bold text-gray-700 font-['Manrope']"><Languages size={16} />{t.projectTitle} (VI)</div>}
                                    name={['title', 'vi']}
                                    rules={[{ required: true, message: 'Bắt buộc' }]}
                                >
                                    <Input placeholder="VD: Khu chung cư cao cấp" className="h-12 rounded-xl" />
                                </Form.Item>

                                <Form.Item
                                    label={<div className="font-bold text-gray-700 font-['Manrope']">{t.category}</div>}
                                    name="category"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Select placeholder={t.selectCategory} className="h-12 rounded-xl">
                                        {categories.map(cat => (
                                            <Option key={cat._id} value={cat._id}>{cat.name?.[language] || cat.name?.vi}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<div className="font-bold text-gray-700 font-['Manrope']">{t.publishedStatus}</div>}
                                >
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <Form.Item name="published" valuePropName="checked" noStyle>
                                            <Switch
                                                checkedChildren={language === 'vi' ? 'Đã đăng' : 'Published'}
                                                unCheckedChildren={language === 'vi' ? 'Bản nháp' : 'Draft'}
                                            />
                                        </Form.Item>
                                        <span className="text-sm text-gray-600 font-medium">{t.visibleOnWebsite}</span>
                                    </div>
                                </Form.Item>
                            </div>

                            {/* Main Description */}
                            <div className="mt-8">
                                <label className="flex items-center gap-2 font-bold text-gray-700 mb-4 font-['Manrope']">
                                    <FileText size={18} className="text-[#41398B]" />
                                    {language === 'vi' ? 'Mô tả chính dự án' : 'Project Main Description'}
                                </label>
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    type="card"
                                    className="custom-tabs"
                                    items={[
                                        {
                                            key: 'vi',
                                            label: 'Tiếng Việt (VI)',
                                            children: (
                                                <Form.Item name={['projectMainDescription', 'vi']}>
                                                    <ReactQuill
                                                        theme="snow"
                                                        modules={modules}
                                                        formats={formats}
                                                        className="h-64 mb-12"
                                                    />
                                                </Form.Item>
                                            )
                                        },
                                        {
                                            key: 'en',
                                            label: 'English (EN)',
                                            children: (
                                                <Form.Item name={['projectMainDescription', 'en']}>
                                                    <ReactQuill
                                                        theme="snow"
                                                        modules={modules}
                                                        formats={formats}
                                                        className="h-64 mb-12"
                                                    />
                                                </Form.Item>
                                            )
                                        }
                                    ]}
                                />
                            </div>

                            {/* Main Image */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4 font-['Manrope']">
                                    {t.projectFeaturedImage}
                                </label>
                                {mainImage ? (
                                    <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden group shadow-md border-2 border-gray-100">
                                        <img src={getImageUrl(mainImage)} alt="Main" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setMainImage('')}
                                                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition transform hover:scale-110 shadow-lg"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Upload.Dragger
                                        customRequest={handleUpload}
                                        showUploadList={false}
                                        className="!rounded-2xl !bg-gray-50 hover:!bg-purple-50 hover:!border-[#41398B] transition-colors"
                                    >
                                        <div className="py-12 flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[#41398B]/10 rounded-full flex items-center justify-center mb-4">
                                                <UploadIcon className="text-[#41398B] w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900 font-['Manrope']">{t.clickOrDragImage}</p>
                                            <p className="text-sm text-gray-500 font-['Manrope']">{t.squareOrRectangularImages}</p>
                                        </div>
                                    </Upload.Dragger>
                                )}
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading || uploading}
                                    className="px-12 h-12 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-xl shadow-lg hover:shadow-purple-200 transition-all font-bold text-base"
                                >
                                    {form.getFieldValue('id') ? t.updateGeneral : t.saveGeneral}
                                </Button>
                            </div>
                        </Form>
                    </ConfigProvider>
                </div>
            )}
        </div>
    );
}
