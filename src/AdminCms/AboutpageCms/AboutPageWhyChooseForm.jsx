import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
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
import { uploadAboutPageImage } from '../../Api/action';

const { TextArea } = Input;



export default function AboutPageWhyChooseForm({
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
    const [iconUploading, setIconUploading] = useState(null); // Track which icon is uploading

    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang);
        }
    }, [headerLang]);

    // Handle icon upload
    const handleIconUpload = async (file, index) => {
        try {
            setIconUploading(index);
            const response = await uploadAboutPageImage(file);
            const uploadedUrl = response.data.data.url;

            // Get current boxes list
            const boxes = form.getFieldValue('aboutWhyChooseBoxes') || [];
            // Update the specific icon at index
            if (!boxes[index]) boxes[index] = {};
            boxes[index].icon = uploadedUrl;

            form.setFieldsValue({ aboutWhyChooseBoxes: boxes });
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
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'Why Choose Us' : 'Tại Sao Chọn Chúng Tôi'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage why choose us section' : 'Quản lý phần tại sao chọn chúng tôi'}
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
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Tiêu Đề Phần
                                                        </span>
                                                    }
                                                    name="aboutWhyChooseTitle_vn"
                                                    rules={[
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tại Sao Chọn Chúng Tôi"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Mô Tả Phần
                                                        </span>
                                                    }
                                                    name="aboutWhyChooseDescription_vn"
                                                    rules={[
                                                        { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Mô tả lý do khách hàng nên chọn bạn"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Văn Bản Nút
                                                        </span>
                                                    }
                                                    name="aboutWhyChooseButtonText_vn"
                                                    rules={[
                                                        { max: 50, message: 'Tối đa 50 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tìm Hiểu Thêm"
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
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Section Title
                                                        </span>
                                                    }
                                                    name="aboutWhyChooseTitle_en"
                                                    rules={[
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Why Choose Us"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Section Description
                                                        </span>
                                                    }
                                                    name="aboutWhyChooseDescription_en"
                                                    rules={[
                                                        { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Describe why customers should choose you"
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                            Button Text
                                                        </span>
                                                    }
                                                    name="aboutWhyChooseButtonText_en"
                                                    rules={[
                                                        { max: 50, message: 'Maximum 50 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Learn More"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* Button Link (Common) */}
                            <Form.Item
                                label={
                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                        {activeTab === 'en' ? 'Button Link' : 'Liên Kết Nút'}
                                    </span>
                                }
                                name="aboutWhyChooseButtonLink"
                            >
                                <Input
                                    placeholder="https://example.com/contact"
                                    size="large"
                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                />
                            </Form.Item>

                            {/* Why Choose Boxes Section */}
                            <div className="mt-8 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-md font-bold text-gray-800 font-['Manrope']">
                                        {activeTab === 'en' ? 'Why Choose Boxes' : 'Hộp Lý Do Chọn'}
                                    </h4>
                                </div>

                                <Form.List name="aboutWhyChooseBoxes">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                                <div
                                                    key={key}
                                                    className="relative mb-6 p-6 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-xl border-1 border-[#41398b1c]"
                                                >
                                                    {/* Delete Button */}
                                                    {can('cms.aboutUs', 'edit') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(name)}
                                                            className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all"
                                                        >
                                                            <DeleteOutlined className="text-lg" />
                                                        </button>
                                                    )}

                                                    <div className="mb-4">
                                                        <span className="inline-block px-3 py-1 bg-[#41398B] text-white text-xs font-semibold rounded-full">
                                                            {activeTab === 'en' ? `Box ${index + 1}` : `Hộp ${index + 1}`}
                                                        </span>
                                                    </div>

                                                    {/* Icon Upload */}
                                                    <Form.Item
                                                        {...restField}
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Icon
                                                            </span>
                                                        }
                                                        name={[name, 'icon']}
                                                        rules={[{ required: true, message: 'Icon is required' }]}
                                                    >
                                                        <Form.Item shouldUpdate noStyle>
                                                            {() => {
                                                                const boxes = form.getFieldValue('aboutWhyChooseBoxes') || [];
                                                                const currentIcon = boxes[index]?.icon;

                                                                return (
                                                                    <Upload
                                                                        name="icon"
                                                                        listType="picture-card"
                                                                        showUploadList={false}
                                                                        disabled={!can('cms.aboutUs', 'edit')}
                                                                        beforeUpload={(file) => handleBeforeIconUpload(file, index)}
                                                                        className="w-[80px] h-[80px] flex-shrink-0 [&>.ant-upload]:!w-[80px] [&>.ant-upload]:!h-[80px] [&>.ant-upload]:!border-purple-200 [&>.ant-upload]:!bg-gray-50 [&>.ant-upload]:!rounded-lg overflow-hidden [&>.ant-upload]:!m-0"
                                                                    >
                                                                        {currentIcon ? (
                                                                            <div className="w-full bg-white rounded-lg h-full relative group border border-gray-200">
                                                                                <img
                                                                                    src={currentIcon.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${currentIcon}` : currentIcon}
                                                                                    alt="icon"
                                                                                    className="w-full h-full object-contain p-2"
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
                                                                                    <>
                                                                                        <PlusOutlined className="text-2xl mb-1" />
                                                                                        <span className="text-xs">Upload</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Upload>
                                                                );
                                                            }}
                                                        </Form.Item>
                                                    </Form.Item>

                                                    {/* English Fields */}
                                                    {activeTab === 'en' && (
                                                        <>
                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Box Title
                                                                    </span>
                                                                }
                                                                name={[name, 'title_en']}
                                                                rules={[
                                                                    { max: 200, message: 'Maximum 200 characters allowed' }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder="Personalized Support"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Box Description
                                                                    </span>
                                                                }
                                                                name={[name, 'description_en']}
                                                                rules={[
                                                                    { max: 500, message: 'Maximum 500 characters allowed' }
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Receive tailored assistance from our experienced team..."
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
                                                                        Tiêu Đề Hộp
                                                                    </span>
                                                                }
                                                                name={[name, 'title_vn']}
                                                                rules={[
                                                                    { max: 200, message: 'Tối đa 200 ký tự' }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder="Hỗ Trợ Cá Nhân Hóa"
                                                                    size="large"
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                label={
                                                                    <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                        Mô Tả Hộp
                                                                    </span>
                                                                }
                                                                name={[name, 'description_vn']}
                                                                rules={[
                                                                    { max: 500, message: 'Tối đa 500 ký tự' }
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    placeholder="Nhận hỗ trợ phù hợp từ đội ngũ giàu kinh nghiệm..."
                                                                    rows={3}
                                                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Box Button */}
                                            {can('cms.aboutUs', 'edit') && (
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                    size="large"
                                                    className="!border-[#41398B] !text-[#41398B] hover:!bg-purple-50 rounded-[10px] h-12 font-semibold font-['Manrope']"
                                                >
                                                    {activeTab === 'en' ? 'Add Why Choose Box' : 'Thêm Hộp Lý Do'}
                                                </Button>
                                            )}
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
                                {can('cms.aboutUs', 'edit') && (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Phần Tại Sao Chọn' : 'Tạo Trang')
                                            : (pageData ? 'Save Why Choose Section' : 'Create Page')
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
