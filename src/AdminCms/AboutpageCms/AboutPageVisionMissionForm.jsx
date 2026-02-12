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
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';

const { TextArea } = Input;

export default function AboutPageVisionMissionForm({
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
    const [activeTab, setActiveTab] = useState('vn');

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'Vision & Mission' : 'Tầm Nhìn & Sứ Mệnh'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage your vision and mission statements' : 'Quản lý tầm nhìn và sứ mệnh của bạn'}
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
                            disabled={!can('cms.aboutUs', 'edit')}
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
                                                {/* Vision Section - Vietnamese */}
                                                <div className="mb-8 p-5 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Tầm Nhìn Của Chúng Tôi
                                                    </h4>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Tiêu Đề Tầm Nhìn
                                                            </span>
                                                        }
                                                        name="aboutVisionTitle_vn"
                                                        rules={[
                                                            { max: 200, message: 'Tối đa 200 ký tự' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Tầm Nhìn Cho Tương Lai"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Mô Tả Tầm Nhìn
                                                            </span>
                                                        }
                                                        name="aboutVisionDescription_vn"
                                                        rules={[
                                                            { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Mô tả tầm nhìn cho tương lai của công ty..."
                                                            rows={4}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Mission Section - Vietnamese */}
                                                <div className="mb-6 p-5 bg-gradient-to-br from-green-50/50 to-teal-50/50 rounded-xl border border-green-100">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                        </svg>
                                                        Sứ Mệnh Của Chúng Tôi
                                                    </h4>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Tiêu Đề Sứ Mệnh
                                                            </span>
                                                        }
                                                        name="aboutMissionTitle_vn"
                                                        rules={[
                                                            { max: 200, message: 'Tối đa 200 ký tự' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Tuyên Bố Sứ Mệnh"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Mô Tả Sứ Mệnh
                                                            </span>
                                                        }
                                                        name="aboutMissionDescription_vn"
                                                        rules={[
                                                            { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Mô tả sứ mệnh và giá trị cốt lõi..."
                                                            rows={4}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>
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
                                                {/* Vision Section */}
                                                <div className="mb-8 p-5 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Our Vision
                                                    </h4>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Vision Title
                                                            </span>
                                                        }
                                                        name="aboutVisionTitle_en"
                                                        rules={[
                                                            { max: 200, message: 'Maximum 200 characters allowed' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Our Vision for the Future"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Vision Description
                                                            </span>
                                                        }
                                                        name="aboutVisionDescription_en"
                                                        rules={[
                                                            { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Describe your vision for the company's future..."
                                                            rows={4}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Mission Section */}
                                                <div className="mb-6 p-5 bg-gradient-to-br from-green-50/50 to-teal-50/50 rounded-xl border border-green-100">
                                                    <h4 className="font-bold text-[#374151] mb-4 text-base font-['Manrope'] flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                        </svg>
                                                        Our Mission
                                                    </h4>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Mission Title
                                                            </span>
                                                        }
                                                        name="aboutMissionTitle_en"
                                                        rules={[
                                                            { max: 200, message: 'Maximum 200 characters allowed' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="Our Mission Statement"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Mission Description
                                                            </span>
                                                        }
                                                        name="aboutMissionDescription_en"
                                                        rules={[
                                                            { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder="Describe your mission and core values..."
                                                            rows={4}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>
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
                                {can('cms.aboutUs', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Tầm Nhìn & Sứ Mệnh' : 'Tạo Trang')
                                            : (pageData ? 'Save Vision & Mission' : 'Create Page')
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
