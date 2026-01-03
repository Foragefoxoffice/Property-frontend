import { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { CommonToaster } from '@/Common/CommonToaster';

const { TextArea } = Input;

export default function AboutPageHistoryForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle
}) {
    const [activeTab, setActiveTab] = useState('en');

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'Our History' : 'Lịch Sử Của Chúng Tôi'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Manage company history and timeline' : 'Quản lý lịch sử và dòng thời gian công ty'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSubmit}
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
                                                English (EN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                {/* History Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            History Section Title
                                                        </span>
                                                    }
                                                    name="aboutHistoryTitle_en"
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Our Journey Through Time"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* History Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            History Description
                                                        </span>
                                                    }
                                                    name="aboutHistoryDescription_en"
                                                    rules={[
                                                        { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Describe your company's history and milestones"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    },
                                    {
                                        key: 'vn',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                Tiếng Việt (VN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                {/* History Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Phần Lịch Sử
                                                        </span>
                                                    }
                                                    name="aboutHistoryTitle_vn"
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Hành Trình Của Chúng Tôi"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* History Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Lịch Sử
                                                        </span>
                                                    }
                                                    name="aboutHistoryDescription_vn"
                                                    rules={[
                                                        { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Mô tả lịch sử và các mốc quan trọng của công ty"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* Timeline Section */}
                            <div className="mt-8 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-md font-bold text-gray-800 font-['Manrope']">
                                        {activeTab === 'en' ? 'Timeline Events' : 'Sự Kiện Dòng Thời Gian'}
                                    </h4>
                                </div>

                                <Form.List name="aboutHistoryTimeline">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                                <div
                                                    key={key}
                                                    className="relative mb-6 p-6 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 rounded-xl border-2 border-purple-100"
                                                >
                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(name)}
                                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all"
                                                    >
                                                        <DeleteOutlined className="text-lg" />
                                                    </button>

                                                    <div className="mb-4">
                                                        <span className="inline-block px-3 py-1 bg-[#41398B] text-white text-xs font-semibold rounded-full">
                                                            {activeTab === 'en' ? `Event ${index + 1}` : `Sự Kiện ${index + 1}`}
                                                        </span>
                                                    </div>

                                                    {/* Date Field (Common for both languages) */}
                                                    <Form.Item
                                                        {...restField}
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                {activeTab === 'en' ? 'Year/Date' : 'Năm/Ngày'}
                                                            </span>
                                                        }
                                                        name={[name, 'date']}
                                                        rules={[
                                                            { max: 50, message: activeTab === 'en' ? 'Maximum 50 characters' : 'Tối đa 50 ký tự' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder={activeTab === 'en' ? '2024' : '2024'}
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>

                                                    {/* English Fields */}
                                                    {activeTab === 'en' && (
                                                        <>
                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Event Title
                                                                    </span>
                                                                }
                                                                name={[name, 'title_en']}
                                                                rules={[
                                                                    { max: 200, message: 'Maximum 200 characters allowed' }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder="Moving Forward Together"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Event Description
                                                                    </span>
                                                                }
                                                                name={[name, 'description_en']}
                                                                rules={[
                                                                    { max: 500, message: 'Maximum 500 characters allowed' }
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Describe this milestone in your company's history"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    )}

                                                    {/* Vietnamese Fields */}
                                                    {activeTab === 'vn' && (
                                                        <>
                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Tiêu Đề Sự Kiện
                                                                    </span>
                                                                }
                                                                name={[name, 'title_vn']}
                                                                rules={[
                                                                    { max: 200, message: 'Tối đa 200 ký tự' }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder="Tiến Lên Cùng Nhau"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Mô Tả Sự Kiện
                                                                    </span>
                                                                }
                                                                name={[name, 'description_vn']}
                                                                rules={[
                                                                    { max: 500, message: 'Tối đa 500 ký tự' }
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Mô tả mốc quan trọng này trong lịch sử công ty"
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Timeline Button */}
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                                size="large"
                                                className="!border-[#41398B] !text-[#41398B] hover:!bg-purple-50 rounded-[10px] h-12 font-semibold font-['Manrope']"
                                            >
                                                {activeTab === 'en' ? 'Add Timeline Event' : 'Thêm Sự Kiện'}
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </div>

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
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                >
                                    {activeTab === 'vn'
                                        ? (pageData ? 'Lưu Lịch Sử' : 'Tạo Trang')
                                        : (pageData ? 'Save History' : 'Create Page')
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
