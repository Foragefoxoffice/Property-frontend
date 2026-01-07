import { useState } from 'react';
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

export default function HomePageAboutForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle
}) {

    const { can } = usePermissions();
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'Who We Are Section' : 'Phần Về Chúng Tôi'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">Manage your about us content</p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Accordion Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                        key: 'en',
                                        label: (
                                            <span className="text-sm font-semibold font-['Manrope']">
                                                English (EN)
                                            </span>
                                        ),
                                        children: (
                                            <>
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">About Title</span>}
                                                    name="homeAboutTitle_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter about title in English' },
                                                        { max: 200, message: 'Maximum 200 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Who We Are"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">About Description</span>}
                                                    name="homeAboutDescription_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter about description in English' },
                                                        { max: 1000, message: 'Maximum 1000 characters allowed' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="We are a leading property solutions provider..."
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Button Text</span>}
                                                    name="homeAboutButtonText_en"
                                                    rules={[
                                                        { required: true, message: 'Please enter button text in English' },
                                                        { max: 50, message: 'Maximum 50 characters allowed' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Learn More"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Step 1 */}
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                    <h4 className="font-semibold text-[#374151] mb-3">Step 1</h4>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 1 Title</span>}
                                                        name="homeAboutStep1Title_en"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <Input
                                                            placeholder="Search Properties"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 1 Description</span>}
                                                        name="homeAboutStep1Des_en"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Browse through our extensive property listings"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Step 2 */}
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                    <h4 className="font-semibold text-[#374151] mb-3">Step 2</h4>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 2 Title</span>}
                                                        name="homeAboutStep2Title_en"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <Input
                                                            placeholder="Schedule Visit"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 2 Description</span>}
                                                        name="homeAboutStep2Des_en"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Book a viewing at your convenience"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Step 3 */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-[#374151] mb-3">Step 3</h4>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 3 Title</span>}
                                                        name="homeAboutStep3Title_en"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <Input
                                                            placeholder="Get Your Keys"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Step 3 Description</span>}
                                                        name="homeAboutStep3Des_en"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Complete the process and move in"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>
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
                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Về Chúng Tôi</span>}
                                                    name="homeAboutTitle_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                                                        { max: 200, message: 'Tối đa 200 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Chúng Tôi Là Ai"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả</span>}
                                                    name="homeAboutDescription_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập mô tả' },
                                                        { max: 1000, message: 'Tối đa 1000 ký tự' }
                                                    ]}
                                                >
                                                    <TextArea
                                                        placeholder="Chúng tôi là nhà cung cấp giải pháp bất động sản hàng đầu..."
                                                        rows={4}
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Văn Bản Nút</span>}
                                                    name="homeAboutButtonText_vn"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng nhập văn bản nút' },
                                                        { max: 50, message: 'Tối đa 50 ký tự' }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Tìm Hiểu Thêm"
                                                        size="large"
                                                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                    />
                                                </Form.Item>

                                                {/* Step 1 VN */}
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                    <h4 className="font-semibold text-[#374151] mb-3">Bước 1</h4>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Bước 1</span>}
                                                        name="homeAboutStep1Title_vn"
                                                        rules={[{ required: true, message: 'Bắt buộc' }]}
                                                    >
                                                        <Input
                                                            placeholder="Tìm Kiếm Bất Động Sản"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Bước 1</span>}
                                                        name="homeAboutStep1Des_vn"
                                                        rules={[{ required: true, message: 'Bắt buộc' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Duyệt qua danh sách bất động sản phong phú của chúng tôi"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Step 2 VN */}
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                    <h4 className="font-semibold text-[#374151] mb-3">Bước 2</h4>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Bước 2</span>}
                                                        name="homeAboutStep2Title_vn"
                                                        rules={[{ required: true, message: 'Bắt buộc' }]}
                                                    >
                                                        <Input
                                                            placeholder="Lên Lịch Xem Nhà"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Bước 2</span>}
                                                        name="homeAboutStep2Des_vn"
                                                        rules={[{ required: true, message: 'Bắt buộc' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Đặt lịch xem nhà theo thời gian thuận tiện"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>

                                                {/* Step 3 VN */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-[#374151] mb-3">Bước 3</h4>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Tiêu Đề Bước 3</span>}
                                                        name="homeAboutStep3Title_vn"
                                                        rules={[{ required: true, message: 'Bắt buộc' }]}
                                                    >
                                                        <Input
                                                            placeholder="Nhận Chìa Khóa"
                                                            size="large"
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">Mô Tả Bước 3</span>}
                                                        name="homeAboutStep3Des_vn"
                                                        rules={[{ required: true, message: 'Bắt buộc' }]}
                                                    >
                                                        <TextArea
                                                            placeholder="Hoàn tất thủ tục và chuyển vào"
                                                            rows={3}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            <Form.Item
                                label={<span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                    {activeTab === 'en' ? 'Button Link' : 'Liên Kết Nút'}
                                </span>}
                                name="homeAboutButtonLink"
                                rules={[{ required: true, message: 'Please enter button link' }]}
                            >
                                <Input
                                    placeholder="https://example.com/about"
                                    size="large"
                                    className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                />
                            </Form.Item>

                            {/* About Save Button */}
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
                                        className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                                    >
                                        {activeTab === 'vn'
                                            ? (pageData ? 'Lưu Phần Về Chúng Tôi' : 'Tạo Trang')
                                            : (pageData ? 'Save About Section' : 'Create Page')
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
