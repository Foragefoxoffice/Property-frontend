import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider
} from 'antd';
import {
    SaveOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { usePermissions } from '../../Context/PermissionContext';

const { TextArea } = Input;

export default function HomePageBlogForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang // Receive the global language prop
}) {

    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState('vn');

    // Sync activeTab with headerLang whenever headerLang changes
    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang);
        }
    }, [headerLang]);

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'Blog Section' : 'Phần Blog'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage your blog section content' : 'Quản lý nội dung phần blog'}
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
                            disabled={!can('cms.homePage', 'edit')}
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
                                                            Tiêu Đề Phần Blog
                                                        </span>
                                                    }
                                                    name="homeBlogTitle_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề blog' },
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tin Tức & Thông Tin Mới Nhất"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Phần Blog
                                                        </span>
                                                    }
                                                    name="homeBlogDescription_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập mô tả blog' },
                                                        { max: 500, message: 'Tối đa 500 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Cập nhật xu hướng bất động sản mới nhất, thông tin thị trường và lời khuyên từ chuyên gia"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
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
                                                            Blog Section Title
                                                        </span>
                                                    }
                                                    name="homeBlogTitle_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter blog title in English' },
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Latest News & Insights"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Blog Section Description
                                                        </span>
                                                    }
                                                    name="homeBlogDescription_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter blog description in English' },
                                                        { max: 500, message: 'Maximum 500 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Stay updated with the latest property trends, market insights, and expert advice"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
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
                                {can('cms.homePage', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Phần Blog' : 'Tạo Trang')
                                            : (pageData ? 'Save Blog Section' : 'Create Page')
                                        }
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </ConfigProvider>
                </div>
            </div>
        </div>
    );
}
