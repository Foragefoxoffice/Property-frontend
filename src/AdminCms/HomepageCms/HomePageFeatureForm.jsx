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

export default function HomePageFeatureForm({
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'Features Section' : 'Phần Tính Năng'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage your features content' : 'Quản lý nội dung tính năng'}
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
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Tính Năng</span>}
                                                    name="homeFeatureTitle_vn"
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tính Năng Chính Của Chúng Tôi"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Tính Năng</span>}
                                                    name="homeFeatureDescription_vn"
                                                    rules={[
                                                        { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Khám phá điều gì làm cho chúng tôi độc đáo..."
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Văn Bản Nút Tính Năng</span>}
                                                    name="homeFeatureButtonText_vn"
                                                    rules={[
                                                        { max: 50, message: 'Tối đa 50 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="ví dụ: Xem Tất Cả Tài Sản"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
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
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Feature Title</span>}
                                                    name="homeFeatureTitle_en"
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Our Key Features"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Feature Description</span>}
                                                    name="homeFeatureDescription_en"
                                                    rules={[
                                                        { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Discover what makes us unique..."
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Feature Button Text</span>}
                                                    name="homeFeatureButtonText_en"
                                                    rules={[
                                                        { max: 50, message: 'Maximum 50 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="e.g. View All Properties"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            <Form.Item
                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">{activeTab === 'en' ? 'Feature Button Link' : 'Liên Kết Nút Tính Năng'}</span>}
                                name="homeFeatureButtonLink"
                            >
                                <Input
                                    placeholder={activeTab === 'en' ? "/properties" : "/vn/properties"}
                                    size="large"
                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                />
                            </Form.Item>

                            {/* Feature Save Button */}
                            <div className="flex gap-3 justify-end mt-6 pt-4">
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
                                            ? (pageData ? 'Lưu Phần Tính Năng' : 'Tạo Trang')
                                            : (pageData ? 'Save Features Section' : 'Create Page')
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
