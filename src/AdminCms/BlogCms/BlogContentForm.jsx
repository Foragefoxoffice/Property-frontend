import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
} from 'antd';
import {
    SaveOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadBlogImage } from '../../Api/action';
import { getImageUrl } from '../../utils/imageHelper';
import { CommonToaster } from '@/Common/CommonToaster';
import { sanitizeBeforeSave, quillModules, quillFormats } from '@/utils/htmlSanitizer';

export default function BlogContentForm({
    form,
    onSubmit,
    loading,
    blogData,
    onCancel,
    isOpen,
    onToggle,
    isEditMode
}) {
    const [activeTab, setActiveTab] = useState('en');
    const quillRefEn = useRef(null);
    const quillRefVi = useRef(null);

    const imageHandler = (quillRef) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const res = await uploadBlogImage(file);
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

    const modules = useMemo(() => quillModules, []);
    const formats = quillFormats;

    // Custom modules for each tab to bind correct ref
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



    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'News Content' : 'Tin tức Tin tức '}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Write your news post title and content' : 'Viết tiêu đề và nội dung bài viết'}
                        </p>
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
                            onFinish={(values) => {
                                // Sanitize content before saving
                                if (values.content) {
                                    values.content = {
                                        vi: sanitizeBeforeSave(values.content?.vi || ''),
                                        en: sanitizeBeforeSave(values.content?.en || '')
                                    };
                                }
                                onSubmit(values);
                            }}
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
                                                🇺🇸 English (EN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            News Title
                                                        </span>
                                                    }
                                                    name={['title', 'en']}
                                                    rules={[
                                                        { required: true, message: 'Please enter news title in English' },
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Enter news title in English..."
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            News Content
                                                        </span>
                                                    }
                                                    name={['content', 'en']}
                                                    rules={[{ required: true, message: 'Please enter content in English' }]}
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
                                    },
                                    {
                                        key: 'vn',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                🇻🇳 Tiếng Việt (VN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Tin tức
                                                        </span>
                                                    }
                                                    name={['title', 'vi']}
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề tin tức' },
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tiêu đề news..."
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Nội Dung Tin tức
                                                        </span>
                                                    }
                                                    name={['content', 'vi']}
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
                                    }
                                ]}
                            />

                            {/* Save Button */}
                            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                                <Button
                                    size="large"
                                    onClick={onCancel}
                                    className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                >
                                    {activeTab === 'vn' ? 'Hủy' : 'Cancel'}
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                >
                                    {activeTab === 'vn'
                                        ? (blogData ? 'Lưu Nội Dung' : 'Tạo Tin tức')
                                        : (blogData ? 'Save Content' : 'Create Tin tức')
                                    }
                                </Button>
                            </div>
                        </Form>
                    </ConfigProvider>
                </div>
            </div>
        </div>
    );
}
