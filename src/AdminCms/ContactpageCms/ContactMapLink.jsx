import { useState } from 'react';
import {
    Form,
    Input,
    Button,
    ConfigProvider,
    Alert,
    Tabs
} from 'antd';
import {
    SaveOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { onFormFinishFailed } from '@/utils/formValidation';
import { CommonToaster } from '@/Common/CommonToaster';
import { usePermissions } from '../../Context/PermissionContext';

const { TextArea } = Input;

export default function ContactMapLink({
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
    const [previewMap, setPreviewMap] = useState(false);

    // Decode HTML entities
    const decodeHtmlEntities = (text) => {
        if (!text) return text;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // Extract iframe from the input
    const getIframePreview = () => {
        const iframeCode = form.getFieldValue('contactMapIframe');
        if (!iframeCode) return null;
        return decodeHtmlEntities(iframeCode);
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
                        <EnvironmentOutlined style={{ color: '#fff' }} className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {activeTab === 'en' ? 'Google Map' : 'Bản Đồ Google'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {activeTab === 'en' ? 'Embed Google Maps location' : 'Nhúng vị trí bản đồ Google'}
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
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                                {/* Instructions EN */}
                                                <Alert
                                                    message="How to get Google Maps embed code"
                                                    description={
                                                        <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                                                            <li>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a></li>
                                                            <li>Search for your location</li>
                                                            <li>Click on "Share" button</li>
                                                            <li>Select "Embed a map" tab</li>
                                                            <li>Copy the entire iframe code</li>
                                                            <li>Paste it in the field below</li>
                                                        </ol>
                                                    }
                                                    type="info"
                                                    showIcon
                                                    className="mb-6"
                                                />
                                                <div className='mt-4'>
                                                    {/* Map Iframe Input EN */}
                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Google Maps Iframe Code
                                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                                    (Paste the complete iframe code from Google Maps)
                                                                </span>
                                                            </span>
                                                        }
                                                        name="contactMapIframe"
                                                    >
                                                        <TextArea
                                                            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                                                            rows={6}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[13px] font-mono"
                                                            onChange={() => setPreviewMap(false)}
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
                                                {/* Instructions VN */}
                                                <Alert
                                                    message="Cách lấy mã nhúng Google Maps"
                                                    description={
                                                        <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                                                            <li>Truy cập <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a></li>
                                                            <li>Tìm kiếm địa điểm của bạn</li>
                                                            <li>Nhấn nút "Chia sẻ" (Share)</li>
                                                            <li>Chọn tab "Nhúng bản đồ" (Embed a map)</li>
                                                            <li>Sao chép toàn bộ mã iframe</li>
                                                            <li>Dán mã vào ô bên dưới</li>
                                                        </ol>
                                                    }
                                                    type="info"
                                                    showIcon
                                                    className="mb-6"
                                                />
                                                <div className='mt-4'>
                                                    {/* Map Iframe Input VN */}
                                                    <Form.Item
                                                        label={
                                                            <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                                Mã Iframe Google Maps
                                                                <span className="text-xs text-gray-400 ml-2 font-normal">
                                                                    (Dán mã iframe đầy đủ từ Google Maps)
                                                                </span>
                                                            </span>
                                                        }
                                                        name="contactMapIframe"
                                                    >
                                                        <TextArea
                                                            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                                                            rows={6}
                                                            className="bg-white border-[#d1d5db] rounded-[10px] text-[13px] font-mono"
                                                            onChange={() => setPreviewMap(false)}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            </>
                                        )
                                    }
                                ]}
                            />

                            {/* Preview Button */}
                            <div className="mb-4">
                                <Button
                                    type="dashed"
                                    onClick={() => setPreviewMap(!previewMap)}
                                    className="border-purple-300 text-purple-600 hover:!border-purple-500 hover:!text-purple-700 rounded-[10px] font-['Manrope']"
                                >
                                    {previewMap
                                        ? (activeTab === 'vn' ? 'Ẩn Xem Thử' : 'Hide Preview')
                                        : (activeTab === 'vn' ? 'Xem Thử' : 'Show Preview')
                                    }
                                </Button>
                            </div>

                            {/* Map Preview */}
                            {previewMap && (
                                <div className="mb-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-purple-100">
                                        <h4 className="font-semibold text-gray-700 text-sm font-['Manrope'] mb-3">
                                            {activeTab === 'vn' ? 'Xem Trước Bản Đồ' : 'Map Preview'}
                                        </h4>
                                        <Form.Item noStyle shouldUpdate>
                                            {() => {
                                                const iframeCode = getIframePreview();
                                                if (!iframeCode) {
                                                    return (
                                                        <div className="bg-white p-8 rounded-lg text-center text-gray-400">
                                                            <EnvironmentOutlined className="text-4xl mb-2" />
                                                            <p>{activeTab === 'vn' ? 'Chưa nhập mã bản đồ' : 'No map code entered yet'}</p>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        className="w-full rounded-lg overflow-hidden shadow-md"
                                                        dangerouslySetInnerHTML={{ __html: iframeCode }}
                                                    />
                                                );
                                            }}
                                        </Form.Item>
                                    </div>
                                </div>
                            )}

                            {/* Example */}
                            <Alert
                                message={activeTab === 'vn' ? 'Mã iframe ví dụ' : 'Example iframe code'}
                                description={
                                    <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded mt-2 overflow-x-auto">
                                        {`<iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12..." 
  width="600" 
  height="450" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy" 
  referrerpolicy="no-referrer-when-downgrade">
</iframe>`}
                                    </pre>
                                }
                                type="warning"
                                className="mb-6"
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
                                            ? (pageData ? 'Lưu Bản Đồ' : 'Tạo Trang')
                                            : (pageData ? 'Save Map' : 'Create Page')
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
