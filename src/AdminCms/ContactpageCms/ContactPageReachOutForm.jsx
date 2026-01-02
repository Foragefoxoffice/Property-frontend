import { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Select
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { CommonToaster } from '@/Common/CommonToaster';
import * as LucideIcons from 'lucide-react';

const { TextArea } = Input;

// Get all Lucide icon names
const lucideIconNames = Object.keys(LucideIcons).filter(
    key => typeof LucideIcons[key] === 'function' && key !== 'createLucideIcon'
);

export default function ContactPageReachOutForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle
}) {
    const [activeTab, setActiveTab] = useState('en');

    // Render Lucide Icon by name
    const renderIcon = (iconName) => {
        const IconComponent = LucideIcons[iconName];
        if (!IconComponent) return null;
        return <IconComponent className="w-5 h-5" />;
    };

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">Reach Out Section</h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">Manage contact information and social media</p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                            <div className="space-y-4">
                                                {/* Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Section Title
                                                        </span>
                                                    }
                                                    name="contactReachOutTitle_en"
                                                    rules={[{ max: 200, message: 'Maximum 200 characters allowed' }]}
                                                >
                                                    <Input
                                                        placeholder="Reach Out to Us"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Section Description
                                                        </span>
                                                    }
                                                    name="contactReachOutDescription_en"
                                                    rules={[{ max: 1000, message: 'Maximum 1000 characters allowed' }]}
                                                >
                                                    <TextArea
                                                        placeholder="We'd love to hear from you..."
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                    />
                                                </Form.Item>

                                                {/* Address */}
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope']">Address Information</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Heading</span>}
                                                        name="contactReachOutAddressHead_en"
                                                        rules={[{ max: 100, message: 'Maximum 100 characters allowed' }]}
                                                    >
                                                        <Input
                                                            placeholder="Our Address"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Content</span>}
                                                        name="contactReachOutAddressContent_en"
                                                        rules={[{ max: 500, message: 'Maximum 500 characters allowed' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="123 Main Street, City, Country"
                                                            rows={2}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Phone Number */}
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope']">Phone Number</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Heading</span>}
                                                        name="contactReachOutNumberHead_en"
                                                        rules={[{ max: 100, message: 'Maximum 100 characters allowed' }]}
                                                    >
                                                        <Input
                                                            placeholder="Call Us"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Email */}
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope']">Email</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Heading</span>}
                                                        name="contactReachOutEmailHead_en"
                                                        rules={[{ max: 100, message: 'Maximum 100 characters allowed' }]}
                                                    >
                                                        <Input
                                                            placeholder="Email Us"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Follow Us Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Follow Us Title
                                                        </span>
                                                    }
                                                    name="contactReachOutFollowTitle_en"
                                                    rules={[{ max: 100, message: 'Maximum 100 characters allowed' }]}
                                                >
                                                    <Input
                                                        placeholder="Follow Us"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Get In Touch */}
                                                <div className="bg-blue-50 p-4 rounded-xl space-y-3 mt-6">
                                                    <h4 className="font-semibold text-blue-700 text-sm font-['Manrope']">Get In Touch Section</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Title</span>}
                                                        name="contactReachOutGetinTitle_en"
                                                        rules={[{ max: 200, message: 'Maximum 200 characters allowed' }]}
                                                    >
                                                        <Input
                                                            placeholder="Get In Touch"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Description</span>}
                                                        name="contactReachOutGetinDescription_en"
                                                        rules={[{ max: 1000, message: 'Maximum 1000 characters allowed' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Send us a message..."
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </div>
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
                                            <div className="space-y-4">
                                                {/* Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Phần
                                                        </span>
                                                    }
                                                    name="contactReachOutTitle_vn"
                                                    rules={[{ max: 200, message: 'Tối đa 200 ký tự' }]}
                                                >
                                                    <Input
                                                        placeholder="Liên Hệ Với Chúng Tôi"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Description */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Phần
                                                        </span>
                                                    }
                                                    name="contactReachOutDescription_vn"
                                                    rules={[{ max: 1000, message: 'Tối đa 1000 ký tự' }]}
                                                >
                                                    <TextArea
                                                        placeholder="Chúng tôi rất mong được nghe từ bạn..."
                                                        rows={3}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                    />
                                                </Form.Item>

                                                {/* Address */}
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope']">Thông Tin Địa Chỉ</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Tiêu Đề</span>}
                                                        name="contactReachOutAddressHead_vn"
                                                        rules={[{ max: 100, message: 'Tối đa 100 ký tự' }]}
                                                    >
                                                        <Input
                                                            placeholder="Địa Chỉ Của Chúng Tôi"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Nội Dung</span>}
                                                        name="contactReachOutAddressContent_vn"
                                                        rules={[{ max: 500, message: 'Tối đa 500 ký tự' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="123 Đường Chính, Thành Phố, Quốc Gia"
                                                            rows={2}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Phone Number */}
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope']">Số Điện Thoại</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Tiêu Đề</span>}
                                                        name="contactReachOutNumberHead_vn"
                                                        rules={[{ max: 100, message: 'Tối đa 100 ký tự' }]}
                                                    >
                                                        <Input
                                                            placeholder="Gọi Cho Chúng Tôi"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Email */}
                                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope']">Email</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Tiêu Đề</span>}
                                                        name="contactReachOutEmailHead_vn"
                                                        rules={[{ max: 100, message: 'Tối đa 100 ký tự' }]}
                                                    >
                                                        <Input
                                                            placeholder="Email Cho Chúng Tôi"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Follow Us Title */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Theo Dõi
                                                        </span>
                                                    }
                                                    name="contactReachOutFollowTitle_vn"
                                                    rules={[{ max: 100, message: 'Tối đa 100 ký tự' }]}
                                                >
                                                    <Input
                                                        placeholder="Theo Dõi Chúng Tôi"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Get In Touch */}
                                                <div className="bg-blue-50 p-4 rounded-xl space-y-3 mt-6">
                                                    <h4 className="font-semibold text-blue-700 text-sm font-['Manrope']">Phần Liên Hệ</h4>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Tiêu Đề</span>}
                                                        name="contactReachOutGetinTitle_vn"
                                                        rules={[{ max: 200, message: 'Tối đa 200 ký tự' }]}
                                                    >
                                                        <Input
                                                            placeholder="Liên Hệ"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="text-sm font-['Manrope']">Mô Tả</span>}
                                                        name="contactReachOutGetinDescription_vn"
                                                        rules={[{ max: 1000, message: 'Tối đa 1000 ký tự' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Gửi tin nhắn cho chúng tôi..."
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope']"
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'common',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                Common Fields
                                            </span>
                                        ),
                                        children: (
                                            <div className="space-y-4">
                                                {/* Phone Number Content */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Phone Number
                                                        </span>
                                                    }
                                                    name="contactReachOutNumberContent"
                                                    rules={[{ max: 100, message: 'Maximum 100 characters allowed' }]}
                                                >
                                                    <Input
                                                        placeholder="+1 234 567 8900"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Email Content */}
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Email Address
                                                        </span>
                                                    }
                                                    name="contactReachOutEmailContent"
                                                    rules={[
                                                        { type: 'email', message: 'Please enter a valid email' },
                                                        { max: 100, message: 'Maximum 100 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="contact@example.com"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Social Media Icons */}
                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl">
                                                    <h4 className="font-semibold text-purple-700 text-sm font-['Manrope'] mb-4">
                                                        Social Media Icons
                                                    </h4>
                                                    <Form.List name="contactReachOutSocialIcons">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="bg-white p-4 rounded-lg mb-3 border-2 border-purple-100">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="flex-1 space-y-3">
                                                                                <Form.Item
                                                                                    {...field}
                                                                                    label={<span className="text-sm font-['Manrope']">Icon Name</span>}
                                                                                    name={[field.name, 'icon']}
                                                                                    className="mb-0"
                                                                                >
                                                                                    <Select
                                                                                        showSearch
                                                                                        placeholder="Select Lucide icon"
                                                                                        size="large"
                                                                                        className="w-full"
                                                                                        optionFilterProp="children"
                                                                                        filterOption={(input, option) =>
                                                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                                                        }
                                                                                        options={lucideIconNames.map(name => ({
                                                                                            value: name,
                                                                                            label: name,
                                                                                        }))}
                                                                                    />
                                                                                </Form.Item>

                                                                                <Form.Item
                                                                                    {...field}
                                                                                    label={<span className="text-sm font-['Manrope']">Link URL</span>}
                                                                                    name={[field.name, 'link']}
                                                                                    className="mb-0"
                                                                                    rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                                                                                >
                                                                                    <Input
                                                                                        placeholder="https://facebook.com/yourpage"
                                                                                        size="large"
                                                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                                    />
                                                                                </Form.Item>

                                                                                {/* Icon Preview */}
                                                                                <Form.Item noStyle shouldUpdate>
                                                                                    {() => {
                                                                                        const icons = form.getFieldValue('contactReachOutSocialIcons') || [];
                                                                                        const currentIcon = icons[index]?.icon;
                                                                                        return currentIcon ? (
                                                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                <span>Preview:</span>
                                                                                                {renderIcon(currentIcon)}
                                                                                                <span className="font-mono text-xs">{currentIcon}</span>
                                                                                            </div>
                                                                                        ) : null;
                                                                                    }}
                                                                                </Form.Item>
                                                                            </div>

                                                                            <Button
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                onClick={() => remove(field.name)}
                                                                                className="mt-7"
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    type="dashed"
                                                                    onClick={() => add()}
                                                                    block
                                                                    icon={<PlusOutlined />}
                                                                    size="large"
                                                                    className="border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 rounded-[10px] h-12 font-['Manrope']"
                                                                >
                                                                    Add Social Media Icon
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>
                                            </div>
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
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                >
                                    {activeTab === 'vn'
                                        ? (pageData ? 'Lưu Phần Liên Hệ' : 'Tạo Trang')
                                        : (pageData ? 'Save Reach Out Section' : 'Create Page')
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
