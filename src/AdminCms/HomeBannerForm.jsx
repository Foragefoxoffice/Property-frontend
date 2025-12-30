import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Switch,
    InputNumber,
    message,
    Spin,
    Tabs,
    ConfigProvider
} from 'antd';
import {
    SaveOutlined,
    EditOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import {
    getAllHomeBanners,
    createHomeBanner,
    updateHomeBanner,
} from '../Api/action';

const { TextArea } = Input;

export default function HomeBannerForm() {
    const [form] = Form.useForm();
    const [bannerData, setBannerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('en');
    const [isEditing, setIsEditing] = useState(false);

    // Fetch the single home banner
    const fetchBanner = async () => {
        try {
            setLoading(true);
            const response = await getAllHomeBanners();
            const banners = response.data.data || [];

            if (banners.length > 0) {
                const banner = banners.find(b => b.isActive) || banners[0];
                setBannerData(banner);
                form.setFieldsValue({
                    heroTitle_en: banner.heroTitle_en,
                    heroDescription_en: banner.heroDescription_en,
                    buttonText_en: banner.buttonText_en,
                    heroTitle_vn: banner.heroTitle_vn,
                    heroDescription_vn: banner.heroDescription_vn,
                    buttonText_vn: banner.buttonText_vn,
                    buttonLink: banner.buttonLink,
                    backgroundImage: banner.backgroundImage,
                    backgroundVideo: banner.backgroundVideo,
                    isActive: banner.isActive,
                    displayOrder: banner.displayOrder,
                });
            } else {
                setBannerData(null);
                form.resetFields();
            }
        } catch (error) {
            message.error('Failed to fetch banner');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanner();
    }, []);

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const payload = {
                heroTitle_en: values.heroTitle_en,
                heroDescription_en: values.heroDescription_en,
                buttonText_en: values.buttonText_en,
                heroTitle_vn: values.heroTitle_vn,
                heroDescription_vn: values.heroDescription_vn,
                buttonText_vn: values.buttonText_vn,
                buttonLink: values.buttonLink,
                backgroundImage: values.backgroundImage || '',
                backgroundVideo: values.backgroundVideo || '',
                isActive: values.isActive !== undefined ? values.isActive : true,
                displayOrder: values.displayOrder || 0,
            };

            if (bannerData) {
                await updateHomeBanner(bannerData._id, payload);
                message.success('Banner updated successfully!');
            } else {
                await createHomeBanner(payload);
                message.success('Banner created successfully!');
            }

            setIsEditing(false);
            fetchBanner();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save banner');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !bannerData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                    <Spin size="large" />
                </ConfigProvider>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#e5e7eb]">
            <h2 style={{
                color: '#111827',
                fontSize: '26px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '32px',
                fontFamily: 'Manrope, sans-serif'
            }}>
                Home Page Banner
            </h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    isActive: true,
                    displayOrder: 0,
                }}
            >
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
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
                                            label={
                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                    Hero Title
                                                </span>
                                            }
                                            name="heroTitle_en"
                                            rules={[
                                                { required: true, message: 'Please enter hero title in English' },
                                                { max: 200, message: 'Maximum 200 characters allowed' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="Your Trusted Partner in Quality Cotton, Fibers & Textile Machinery"
                                                size="large"
                                                disabled={!isEditing && bannerData}
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                    Hero Description
                                                </span>
                                            }
                                            name="heroDescription_en"
                                            rules={[
                                                { required: true, message: 'Please enter hero description in English' },
                                                { max: 500, message: 'Maximum 500 characters allowed' }
                                            ]}
                                        >
                                            <TextArea
                                                placeholder="Empowering Vietnam's Textile Industry Since 2016"
                                                rows={4}
                                                disabled={!isEditing && bannerData}
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[16px] font-['Manrope'] resize-none"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                    Button Text
                                                </span>
                                            }
                                            name="buttonText_en"
                                            rules={[
                                                { required: true, message: 'Please enter button text in English' },
                                                { max: 50, message: 'Maximum 50 characters allowed' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="Explore Products"
                                                size="large"
                                                disabled={!isEditing && bannerData}
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
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
                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                    Tiêu Đề Hero
                                                </span>
                                            }
                                            name="heroTitle_vn"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập tiêu đề hero bằng tiếng Việt' },
                                                { max: 200, message: 'Tối đa 200 ký tự' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="Đối Tác Tin Cậy Của Bạn Về Bông, Sợi & Máy Móc Dệt May Chất Lượng"
                                                size="large"
                                                disabled={!isEditing && bannerData}
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                    Mô Tả Hero
                                                </span>
                                            }
                                            name="heroDescription_vn"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập mô tả hero bằng tiếng Việt' },
                                                { max: 500, message: 'Tối đa 500 ký tự' }
                                            ]}
                                        >
                                            <TextArea
                                                placeholder="Trao Quyền Cho Ngành Dệt May Việt Nam Từ Năm 2016"
                                                rows={4}
                                                disabled={!isEditing && bannerData}
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] resize-none"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                                                    Văn Bản Nút
                                                </span>
                                            }
                                            name="buttonText_vn"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập văn bản nút bằng tiếng Việt' },
                                                { max: 50, message: 'Tối đa 50 ký tự' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="Khám Phá Sản Phẩm"
                                                size="large"
                                                disabled={!isEditing && bannerData}
                                                className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                                            />
                                        </Form.Item>
                                    </>
                                )
                            }
                        ]}
                    />
                </ConfigProvider>

                <Form.Item
                    label={
                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                            Button Link
                        </span>
                    }
                    name="buttonLink"
                    rules={[{ required: true, message: 'Please enter button link' }]}
                >
                    <Input
                        placeholder="https://cotco-vn.com/machines"
                        size="large"
                        prefix={<GlobalOutlined className="text-gray-400" />}
                        disabled={!isEditing && bannerData}
                        className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">
                            Hero Background Image / Video
                            <span className="text-xs text-gray-400 ml-2 font-normal">
                                (Recommended: 1920x1080px | Max Video Size: 10MB)
                            </span>
                        </span>
                    }
                >
                    <Form.Item
                        name="backgroundImage"
                        noStyle
                    >
                        <Input
                            placeholder="Image URL: https://example.com/hero-bg.jpg"
                            size="large"
                            className="mb-3 bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                            disabled={!isEditing && bannerData}
                        />
                    </Form.Item>

                    <Form.Item
                        name="backgroundVideo"
                        noStyle
                    >
                        <Input
                            placeholder="Video URL: https://example.com/hero-bg.mp4"
                            size="large"
                            disabled={!isEditing && bannerData}
                            className="bg-white border-[#d1d5db] rounded-[10px] text-[15px] font-['Manrope'] h-12"
                        />
                    </Form.Item>
                </Form.Item>

                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-[#e5e7eb]">
                    {bannerData && !isEditing ? (
                        <Button
                            type="primary"
                            size="large"
                            icon={<EditOutlined />}
                            onClick={() => setIsEditing(true)}
                            className="!bg-[#41398B] !border-[#41398B] rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] shadow-sm hover:!bg-[#352e7a]"
                        >
                            Edit Banner
                        </Button>
                    ) : (
                        <>
                            {bannerData && (
                                <Button
                                    size="large"
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchBanner();
                                    }}
                                    className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]"
                                >
                                    Cancel
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
                                {bannerData ? 'Update Banner' : 'Create Banner'}
                            </Button>
                        </>
                    )}
                </div>
            </Form>
        </div>
    );
}
