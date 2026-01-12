import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Select,
    Upload,
    Spin
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';
import * as LucideIcons from 'lucide-react';
import { uploadContactPageImage } from '../../Api/action';

const { TextArea } = Input;

export default function ContactPageReachOutForm({
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
    const [activeTab, setActiveTab] = useState('en');

    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang);
        }
    }, [headerLang]);
    const [iconUploading, setIconUploading] = useState(null);

    const handleIconUpload = async (file, index) => {
        try {
            setIconUploading(index);
            const response = await uploadContactPageImage(file);
            const uploadedUrl = response.data.data.url;

            // Get current icons list
            const icons = form.getFieldValue('contactReachOutSocialIcons') || [];
            // Update the specific icon at index
            if (!icons[index]) icons[index] = {};
            icons[index].icon = uploadedUrl;

            form.setFieldsValue({ contactReachOutSocialIcons: icons });
            CommonToaster('Icon uploaded successfully!', 'success');
            return false;
        } catch (error) {
            CommonToaster('Failed to upload icon', 'error');
            console.error(error);
            return false;
        } finally {
            setIconUploading(null);
        }
    };

    const handleBeforeIconUpload = (file, index) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            CommonToaster('You can only upload image files!', 'error');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            CommonToaster('Image must be smaller than 5MB!', 'error');
            return Upload.LIST_IGNORE;
        }
        handleIconUpload(file, index);
        return false;
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
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'Reach Out Section' : 'Phần Liên Hệ'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage contact information and social media' : 'Quản lý thông tin liên hệ và mạng xã hội'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-2 bg-white border-t border-gray-100">
                    <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSubmit}
                            onFinishFailed={onFormFinishFailed}
                            disabled={!can('cms.contactUs', 'edit')}
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
                                                <div className="bg-purple-50 p-4 rounded-xl space-y-3 mt-6">
                                                    <h4 className="font-semibold text-[#41398B] text-sm font-['Manrope']">Get In Touch Section</h4>
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
                                                {/* Phone Numbers */}
                                                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-3">
                                                        Phone Numbers
                                                    </h4>
                                                    <Form.List name="contactReachOutNumberContent">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="flex gap-2 mb-1">
                                                                        <Form.Item
                                                                            {...field}
                                                                            className="mb-0 flex-1"
                                                                            rules={[
                                                                                { required: true, message: 'Please enter a phone number' },
                                                                                { max: 100, message: 'Maximum 100 characters allowed' }
                                                                            ]}
                                                                        >
                                                                            <Input
                                                                                placeholder="+1 234 567 8900"
                                                                                size="large"
                                                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                            />
                                                                        </Form.Item>
                                                                        {can('cms.contactUs', 'edit') && (
                                                                            <Button
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                onClick={() => remove(field.name)}
                                                                                className="flex items-center justify-center h-12 w-12"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {can('cms.contactUs', 'edit') && (
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => add()}
                                                                        block
                                                                        icon={<PlusOutlined />}
                                                                        size="large"
                                                                        className="border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 rounded-[10px] h-12 font-['Manrope']"
                                                                    >
                                                                        Add Phone Number
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>

                                                {/* Email Addresses */}
                                                < div className="bg-gray-50 p-4 rounded-xl mb-4" >
                                                    <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-3">
                                                        Email Addresses
                                                    </h4>
                                                    <Form.List name="contactReachOutEmailContent">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="flex gap-2 mb-1">
                                                                        <Form.Item
                                                                            {...field}
                                                                            className="mb-0 flex-1"
                                                                            rules={[
                                                                                { required: true, message: 'Please enter an email address' },
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
                                                                        {can('cms.contactUs', 'edit') && (
                                                                            <Button
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                onClick={() => remove(field.name)}
                                                                                className="flex items-center justify-center h-12 w-12"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {can('cms.contactUs', 'edit') && (
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => add()}
                                                                        block
                                                                        icon={<PlusOutlined />}
                                                                        size="large"
                                                                        className="border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 rounded-[10px] h-12 font-['Manrope']"
                                                                    >
                                                                        Add Email Address
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </div>

                                                {/* Social Media Icons */}
                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl">
                                                    <h4 className="font-semibold text-[#41398B] text-sm font-['Manrope'] mb-4">
                                                        Social Media Icons
                                                    </h4>
                                                    <Form.List name="contactReachOutSocialIcons">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map((field, index) => (
                                                                    <div key={field.key} className="flex items-center gap-4 mb-3 bg-white p-3 rounded-lg border-2 border-purple-100">
                                                                        {/* Upload Icon Box */}
                                                                        <Form.Item
                                                                            {...field}
                                                                            name={[field.name, 'icon']}
                                                                            rules={[{ required: true, message: 'Required' }]}
                                                                            className="mb-0"
                                                                        >
                                                                            <Form.Item shouldUpdate noStyle>
                                                                                {() => {
                                                                                    const icons = form.getFieldValue('contactReachOutSocialIcons') || [];
                                                                                    const currentIcon = icons[index]?.icon;

                                                                                    return (
                                                                                        <Upload
                                                                                            name="icon"
                                                                                            listType="picture-card"
                                                                                            showUploadList={false}
                                                                                            disabled={!can('cms.contactUs', 'edit')}
                                                                                            beforeUpload={(file) => handleBeforeIconUpload(file, index)}
                                                                                            className="w-[60px] h-[60px] flex-shrink-0 [&>.ant-upload]:!w-[60px] [&>.ant-upload]:!h-[60px] [&>.ant-upload]:!border-purple-200 [&>.ant-upload]:!bg-gray-50 [&>.ant-upload]:!rounded-lg overflow-hidden [&>.ant-upload]:!m-0"
                                                                                        >
                                                                                            {currentIcon ? (
                                                                                                <div className="w-full bg-[#41398B] rounded-lg h-full relative group">
                                                                                                    <img
                                                                                                        src={currentIcon.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${currentIcon}` : currentIcon}
                                                                                                        alt="icon"
                                                                                                        className="w-full h-full object-contain p-1"
                                                                                                    />
                                                                                                    {/* Loading Spinner for Icon */}
                                                                                                    {iconUploading === index && (
                                                                                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                                                                            <Spin size="small" />
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="flex flex-col items-center justify-center h-full text-purple-300 hover:text-[#41398B] transition-colors">
                                                                                                    {iconUploading === index ? (
                                                                                                        <Spin size="small" />
                                                                                                    ) : (
                                                                                                        <PlusOutlined className="text-xl" />
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </Upload>
                                                                                    );
                                                                                }}
                                                                            </Form.Item>
                                                                        </Form.Item>

                                                                        <div className="flex-1">
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
                                                                        </div>

                                                                        {can('cms.contactUs', 'edit') && (
                                                                            <Button
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                onClick={() => remove(field.name)}
                                                                                className="flex items-center justify-center h-12 w-12"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {can('cms.contactUs', 'edit') && (
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
                                                                )}
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
                                {can('cms.contactUs', 'edit') && (
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
                                )}
                            </div>
                        </Form >
                    </ConfigProvider >
                </div >
            </div >
        </div >
    );
}
