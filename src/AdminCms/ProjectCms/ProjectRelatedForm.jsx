import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Spin
} from 'antd';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';
import {
    SaveOutlined,
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';

export default function ProjectRelatedForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang
}) {
    const [activeTab, setActiveTab] = useState('vi');

    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang === 'vn' ? 'vi' : 'en');
        }
    }, [headerLang]);

    const { language } = useLanguage();
    const t = translations[language];

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Dự Án Liên Quan' : 'Related Projects'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý tiêu đề phần dự án liên quan' : 'Manage related projects section title'}
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                            label: (
                                                <span className="text-sm font-semibold font-['Manrope']">
                                                    Tiếng Việt (VN)
                                                </span>
                                            ),
                                            children: (
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Dự Án Liên Quan
                                                        </span>
                                                    }
                                                    name={['relatedProjectTitle', 'vi']}
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Dự Án Liên Quan"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>
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
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Related Projects Title
                                                        </span>
                                                    }
                                                    name={['relatedProjectTitle', 'en']}
                                                    rules={[
                                                        { required: true, message: 'Please enter title' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Related Projects"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>
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
                                        {activeTab === 'vi' ? 'Lưu Tiêu Đề' : 'Save Title'}
                                    </Button>
                                </div>
                            </Form>
                        </ConfigProvider>
                    </Spin>
                </div>
            </div>
        </div>
    );
}
