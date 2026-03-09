import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Tabs,
    ConfigProvider,
    Spin,
    Card,
    Space
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    YoutubeOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';

export default function ProjectVideoForm({
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

    // Sync activeTab with headerLang whenever headerLang changes
    useEffect(() => {
        if (headerLang) {
            setActiveTab(headerLang === 'vn' ? 'vi' : 'en');
        }
    }, [headerLang]);

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'vn' ? 'Thư Viện Video' : 'Video Library'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'vn' ? 'Quản lý các danh mục video và liên kết YouTube' : 'Manage video categories and YouTube links'}
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                    className="mb-8"
                                    items={[
                                        {
                                            key: 'vi',
                                            label: <span className="text-sm font-semibold font-['Manrope'] px-4">Tiếng Việt (VN)</span>,
                                            children: (
                                                <Form.Item
                                                    label={<span className="font-bold text-[#374151] text-sm uppercase tracking-wider font-['Manrope']">Tiêu Đề Khu Video</span>}
                                                    name={['projectVideoTitle', 'vi']}
                                                >
                                                    <Input placeholder="Nhập tiêu đề thư viện video" size="large" className="bg-white border-[#e5e7eb] rounded-xl text-[15px] font-['Manrope'] h-12 shadow-sm focus:shadow-md transition-shadow" />
                                                </Form.Item>
                                            )
                                        },
                                        {
                                            key: 'en',
                                            label: <span className="text-sm font-semibold font-['Manrope'] px-4">English (EN)</span>,
                                            children: (
                                                <Form.Item
                                                    label={<span className="font-bold text-[#374151] text-sm uppercase tracking-wider font-['Manrope']">Video Gallery Title</span>}
                                                    name={['projectVideoTitle', 'en']}
                                                >
                                                    <Input placeholder="Enter video gallery title" size="large" className="bg-white border-[#e5e7eb] rounded-xl text-[15px] font-['Manrope'] h-12 shadow-sm focus:shadow-md transition-shadow" />
                                                </Form.Item>
                                            )
                                        }
                                    ]}
                                />

                                {/* Tabs Content Management */}
                                <div className="space-y-8">
                                    <Form.List name="projectVideoTabs">
                                        {(fields, { add, remove }) => (
                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm font-['Manrope']">
                                                    <div>
                                                        <h4 className="text-[#41398B] font-bold text-lg mb-1">
                                                            {activeTab === 'vi' ? 'Cấu Hình Các Phân Khu Video' : 'Video Tab Configuration'}
                                                        </h4>
                                                        <p className="text-purple-600 text-sm opacity-80">
                                                            {activeTab === 'vi'
                                                                ? 'Thêm và quản lý các tab video theo từng chủ đề...'
                                                                : 'Add and manage video tabs by topic...'
                                                            }
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => add()}
                                                        icon={<PlusOutlined />}
                                                        className="bg-[#41398B] hover:bg-[#2f2775] h-11 px-6 rounded-xl font-semibold shadow-lg hover:shadow-purple-200 transition-all font-['Manrope'] border-none text-white"
                                                    >
                                                        {activeTab === 'vi' ? 'Thêm Phân Khu Mới' : 'Add New Tab'}
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-8">
                                                    {fields.map(({ key, name, ...restField }) => (
                                                        <Card
                                                            key={key}
                                                            className="shadow-md hover:shadow-lg transition-all border-gray-100 rounded-3xl overflow-hidden group/tab"
                                                            title={
                                                                <div className="flex items-center justify-between py-2 font-['Manrope']">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                                            {name + 1}
                                                                        </div>
                                                                        <span className="text-gray-800 font-bold">
                                                                            {activeTab === 'vi' ? `Cài đặt Phân Khu #${name + 1}` : `Tab Settings #${name + 1}`}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        danger
                                                                        type="text"
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => remove(name)}
                                                                        className="hover:bg-red-50 font-semibold"
                                                                    >
                                                                        {activeTab === 'vi' ? 'Xóa Phân Khu' : 'Delete Tab'}
                                                                    </Button>
                                                                </div>
                                                            }
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-['Manrope']">
                                                                <Form.Item
                                                                    {...restField}
                                                                    label={<span className="font-semibold text-gray-600">{activeTab === 'vi' ? 'Tiêu đề Tab (VN)' : 'Tab Title (VN)'}</span>}
                                                                    name={[name, 'projectVideoTabTitle', 'vi']}
                                                                    rules={[{ required: true, message: activeTab === 'vi' ? 'Nhập tiêu đề' : 'Enter title' }]}
                                                                >
                                                                    <Input placeholder={activeTab === 'vi' ? "Ví dụ: Video giới thiệu" : "e.g. Introduction Video"} className="h-11 rounded-lg" />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...restField}
                                                                    label={<span className="font-semibold text-gray-600">{activeTab === 'vi' ? 'Tiêu đề Tab (EN)' : 'Tab Title (EN)'}</span>}
                                                                    name={[name, 'projectVideoTabTitle', 'en']}
                                                                    rules={[{ required: true, message: activeTab === 'vi' ? 'Nhập tiêu đề' : 'Enter title' }]}
                                                                >
                                                                    <Input placeholder={activeTab === 'vi' ? "Ví dụ: Intro Video" : "e.g. Intro Video"} className="h-11 rounded-lg" />
                                                                </Form.Item>
                                                            </div>

                                                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 font-['Manrope']">
                                                                <h5 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                                                                    <YoutubeOutlined className="text-red-500 text-xl" />
                                                                    {activeTab === 'vi' ? 'Danh Sách Video YouTube' : 'YouTube Video List'}
                                                                </h5>

                                                                <Form.List name={[name, 'videos']}>
                                                                    {(videoFields, { add: addVideo, remove: removeVideo }) => (
                                                                        <div className="space-y-4">
                                                                            {videoFields.map(({ key: videoKey, name: videoName, ...restVideoField }) => (
                                                                                <Card
                                                                                    key={videoKey}
                                                                                    size="small"
                                                                                    className="bg-white rounded-xl border-gray-200 shadow-sm"
                                                                                >
                                                                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                                                                        <div className="flex-1 w-full">
                                                                                            <Form.Item
                                                                                                {...restVideoField}
                                                                                                label={<span className="text-xs font-bold text-gray-400 uppercase">YouTube Embed URL</span>}
                                                                                                name={[videoName, 'projectVideoEmbeded']}
                                                                                                rules={[{ required: true, message: 'Required' }]}
                                                                                                className="mb-0"
                                                                                            >
                                                                                                <Input
                                                                                                    prefix={<YoutubeOutlined className="text-red-500" />}
                                                                                                    placeholder="https://www.youtube.com/embed/..."
                                                                                                    className="h-10 rounded-lg"
                                                                                                />
                                                                                            </Form.Item>
                                                                                        </div>
                                                                                        <Button
                                                                                            danger
                                                                                            type="text"
                                                                                            icon={<DeleteOutlined />}
                                                                                            onClick={() => removeVideo(videoName)}
                                                                                            className="self-center md:mt-6"
                                                                                        />
                                                                                    </div>
                                                                                    {/* Preview for YouTube URL if exists */}
                                                                                    {form.getFieldValue(['projectVideoTabs', name, 'videos', videoName, 'projectVideoEmbeded']) && (
                                                                                        <div className="mt-4 aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                                                                                            <iframe
                                                                                                width="100%"
                                                                                                height="100%"
                                                                                                src={form.getFieldValue(['projectVideoTabs', name, 'videos', videoName, 'projectVideoEmbeded'])}
                                                                                                title="YouTube video player"
                                                                                                frameBorder="0"
                                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                allowFullScreen
                                                                                            ></iframe>
                                                                                        </div>
                                                                                    )}
                                                                                </Card>
                                                                            ))}
                                                                            <Button
                                                                                type="dashed"
                                                                                onClick={() => addVideo()}
                                                                                block
                                                                                icon={<PlusOutlined />}
                                                                                className="h-12 rounded-xl text-purple-600 border-purple-200 hover:text-purple-700 hover:border-purple-300"
                                                                            >
                                                                                {activeTab === 'vi' ? 'Thêm Video' : 'Add Video'}
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </Form.List>
                                                            </div>
                                                        </Card>
                                                    ))}

                                                    {fields.length === 0 && (
                                                        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <VideoCameraOutlined className="text-3xl text-gray-300" />
                                                            </div>
                                                            <p className="text-gray-400 font-medium italic">
                                                                {activeTab === 'vi'
                                                                    ? 'Không có tab video nào. Nhấp "Thêm Phân Khu Mới" để bắt đầu.'
                                                                    : 'No video tabs. Click "Add New Tab" to get started.'
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Form.List>
                                </div>

                                {/* Save Button */}
                                <div className="flex gap-4 justify-end mt-16 pt-6 border-t border-gray-100">
                                    <Button
                                        size="large"
                                        onClick={onCancel}
                                        className="rounded-xl font-semibold text-[15px] h-12 px-8 font-['Manrope'] border-gray-200 text-gray-600 hover:!text-[#41398B] hover:!border-[#41398B] transition-all"
                                    >
                                        {activeTab === 'vi' ? 'Hủy Bỏ' : 'Cancel'}
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        className="flex items-center gap-2 px-10 h-12 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-xl shadow-lg hover:shadow-purple-200 transition-all font-bold border-none"
                                    >
                                        {activeTab === 'vi'
                                            ? (pageData ? 'Cập Nhật Video' : 'Lưu Video')
                                            : (pageData ? 'Update Videos' : 'Save Videos')
                                        }
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