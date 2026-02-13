import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    ConfigProvider,
    Tabs
} from 'antd';
import {
    SaveOutlined
} from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { onFormFinishFailed } from '@/utils/formValidation';
import { usePermissions } from '../../Context/PermissionContext';

export default function TermsCondionsContentForm({
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
    const canEdit = can('cms.termsConditions', 'edit') || can('cms.termsConditions', 'create');

    const [activeTab, setActiveTab] = useState('vn');

    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang);
        }
    }, [headerLang]);

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
        ],
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
                            {headerLang === 'en' ? 'Terms & Conditions Content' : 'Nội Dung Điều Khoản & Điều Kiện'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage the main content of the Terms & Conditions page' : 'Quản lý nội dung chính của trang điều khoản & điều kiện'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSubmit}
                            onFinishFailed={onFormFinishFailed}
                            disabled={!canEdit}
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
                                            <div className="space-y-4">
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Chính Sách
                                                        </span>
                                                    }
                                                    name="termsConditionContentTitle_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề chính sách' },
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tiêu Đề Chính Sách"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Nội Dung
                                                        </span>
                                                    }
                                                    name="termsConditionContent_vn"
                                                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                                >
                                                    <ReactQuill
                                                        theme="snow"
                                                        modules={quillModules}
                                                        className="bg-white rounded-[10px]"
                                                        placeholder="Nhập nội dung ở đây..."
                                                    />
                                                </Form.Item>
                                            </div>
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
                                            <div className="space-y-4">
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Policy Title
                                                        </span>
                                                    }
                                                    name="termsConditionContentTitle_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter policy title in English' },
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Policy Title"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Content
                                                        </span>
                                                    }
                                                    name="termsConditionContent_en"
                                                    rules={[{ required: true, message: 'Please enter content in English' }]}
                                                >
                                                    <ReactQuill
                                                        theme="snow"
                                                        modules={quillModules}
                                                        className="bg-white rounded-[10px]"
                                                        placeholder="Write your content here..."
                                                    />
                                                </Form.Item>
                                            </div>
                                        )
                                    },
                                ]}
                            />

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
                                {canEdit && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Nội Dung' : 'Tạo Trang')
                                            : (pageData ? 'Save Content' : 'Create Page')
                                        }
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>
                    <style>{`
                        .ql-container {
                            border-bottom-left-radius: 10px;
                            border-bottom-right-radius: 10px;
                            min-height: 200px;
                            font-family: 'Manrope', sans-serif;
                        }
                        .ql-toolbar {
                            border-top-left-radius: 10px;
                            border-top-right-radius: 10px;
                            font-family: 'Manrope', sans-serif;
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}