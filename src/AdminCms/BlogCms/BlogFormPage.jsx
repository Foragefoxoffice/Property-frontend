
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    Form,
    Input,
    Button,
    Switch,
    message,
    Card,
    Spin,
    Select,
    Tabs,
    Divider,
    Tooltip
} from "antd";
import {
    SaveOutlined,
    ArrowLeftOutlined,
    CloudUploadOutlined,
    EyeOutlined,
    InfoCircleOutlined,
    GlobalOutlined,
    FileTextOutlined,
    SearchOutlined
} from "@ant-design/icons";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
    createBlog,
    getBlogById,
    updateBlog,
    uploadBlogImage,
    getCategories,
} from "../../Api/action";
import { getImageUrl } from "../../utils/imageHelper";

export default function BlogFormPage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [categories, setCategories] = useState([]);

    // SEO Preview State
    const [activeTab, setActiveTab] = useState('en');

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchBlogData();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.data);
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    const fetchBlogData = async () => {
        setInitLoading(true);
        try {
            const res = await getBlogById(id);
            const blog = res.data.data;
            form.setFieldsValue(blog);
            setImageUrl(blog.mainImage);
        } catch (error) {
            message.error("Failed to load blog details");
            console.error(error);
        } finally {
            setInitLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadBlogImage(file);
            const url = res.data.url;
            setImageUrl(url);
            message.success("Image uploaded successfully");
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.error || "Image upload failed";
            message.error(errorMsg);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                mainImage: imageUrl,
            };

            if (isEditMode) {
                await updateBlog(id, payload);
                message.success("Blog updated successfully");
            } else {
                await createBlog(payload);
                message.success("Blog created successfully");
            }
            navigate("/dashboard/cms/blogs");
        } catch (error) {
            console.error(error);
            message.error(
                error.response?.data?.error || "Failed to save blog"
            );
        } finally {
            setLoading(false);
        }
    };

    // --- Editor Configuration ---

    const quillRefEn = useRef(null);
    const quillRefVi = useRef(null);

    const imageHandler = (quillRef) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const res = await uploadBlogImage(file);
                    const url = getImageUrl(res.data.url);

                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', url);
                } catch (error) {
                    message.error('Image upload failed');
                    console.error(error);
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' },
                { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: () => {
                    // Determine which editor is active based on activeTab
                    // This is a bit tricky with tabs, so we might need individual handlers or pass the specific ref
                    // Simplification: We will assign specific handlers in the render
                }
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    // Custom modules for each tab to bind correct ref
    const modulesEn = useMemo(() => ({
        ...modules,
        toolbar: {
            ...modules.toolbar,
            handlers: {
                ...modules.toolbar.handlers,
                image: () => imageHandler(quillRefEn)
            }
        }
    }), [modules]);

    const modulesVi = useMemo(() => ({
        ...modules,
        toolbar: {
            ...modules.toolbar,
            handlers: {
                ...modules.toolbar.handlers,
                image: () => imageHandler(quillRefVi)
            }
        }
    }), [modules]);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'align', 'color', 'background'
    ];

    // --- Components ---

    const SEOCard = ({ lang }) => (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg border-b border-gray-200 pb-2">
                <SearchOutlined className="text-[#41398B]" />
                SEO Configuration ({lang.toUpperCase()})
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Form.Item
                    name={['seoInformation', 'metaTitle', lang]}
                    label="Meta Title"
                    tooltip="Title that appears in search results (recycle content title if needed)"
                >
                    <Input placeholder="SEO Title" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                    name={['seoInformation', 'metaDescription', lang]}
                    label="Meta Description"
                    tooltip="Brief summary for search results"
                >
                    <Input.TextArea rows={3} placeholder="SEO Description..." className="rounded-lg" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name={['seoInformation', 'slugUrl', lang]}
                        label="Slug Override"
                    >
                        <Input addonBefore="/" placeholder="my-blog-post" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item
                        name={['seoInformation', 'canonicalUrl', lang]}
                        label="Canonical URL"
                    >
                        <Input placeholder="https://..." className="rounded-lg" />
                    </Form.Item>
                </div>

                {/* Live Google Preview */}
                <Form.Item shouldUpdate>
                    {() => {
                        const title = form.getFieldValue(['seoInformation', 'metaTitle', lang]) || form.getFieldValue(['title', lang]) || "Your Page Title";
                        const desc = form.getFieldValue(['seoInformation', 'metaDescription', lang]) || "This is how your page description will look in search results. It is important to keep it concise and relevant.";
                        const slug = form.getFieldValue(['seoInformation', 'slugUrl', lang]) || "your-slug-url";

                        return (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Google Search Preview</div>
                                <div className="font-sans">
                                    <div className="flex items-center gap-2 text-sm text-[#202124] mb-1">
                                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">🌐</div>
                                        <span>example.com</span>
                                        <span className="text-gray-400">›</span>
                                        <span>{slug}</span>
                                    </div>
                                    <h3 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        )
                    }}
                </Form.Item>

                <Divider />

                <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                        name={['seoInformation', 'metaKeywords', lang]}
                        label="Keywords"
                        className="col-span-2"
                    >
                        <Select mode="tags" placeholder="Enter keywords..." />
                    </Form.Item>

                    <Form.Item
                        name={['seoInformation', 'allowIndexing', lang]}
                        label="Search Indexing"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Indexed" unCheckedChildren="Hidden" defaultChecked />
                    </Form.Item>
                </div>
            </div>
        </div>
    );

    const tabItems = [
        {
            key: 'en',
            label: (
                <span className="flex items-center gap-2 px-2">
                    <span className="text-lg">🇺🇸</span> English
                </span>
            ),
            children: (
                <div className="animate-fadeIn">
                    <Card className="shadow-sm rounded-xl border-gray-100 !border-t-0 rounded-tl-none">
                        <Form.Item
                            name={['title', 'en']}
                            label={<span className="font-semibold text-gray-700">Page Title</span>}
                            rules={[{ required: true, message: "Please enter title" }]}
                        >
                            <Input size="large" placeholder="Enter blog title in English..." className="rounded-lg font-bold text-lg" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-gray-700">Content</span>}
                            name={['content', 'en']}
                            rules={[{ required: true, message: "Please enter content" }]}
                        >
                            <ReactQuill
                                ref={quillRefEn}
                                theme="snow"
                                modules={modulesEn}
                                formats={formats}
                                className="h-[400px] mb-12 rounded-lg"
                            />
                        </Form.Item>

                        <SEOCard lang="en" />
                    </Card>
                </div>
            ),
        },
        {
            key: 'vi',
            label: (
                <span className="flex items-center gap-2 px-2">
                    <span className="text-lg">🇻🇳</span> Vietnamese
                </span>
            ),
            children: (
                <div className="animate-fadeIn">
                    <Card className="shadow-sm rounded-xl border-gray-100 !border-t-0 rounded-tl-none">
                        <Form.Item
                            name={['title', 'vi']}
                            label={<span className="font-semibold text-gray-700">Tiêu đề bài viết</span>}
                            rules={[{ required: true, message: "Nhập tiêu đề" }]}
                        >
                            <Input size="large" placeholder="Nhập tiêu đề tiếng Việt..." className="rounded-lg font-bold text-lg" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-semibold text-gray-700">Nội dung</span>}
                            name={['content', 'vi']}
                            rules={[{ required: true, message: "Nhập nội dung" }]}
                        >
                            <ReactQuill
                                ref={quillRefVi}
                                theme="snow"
                                modules={modulesVi}
                                formats={formats}
                                className="h-[400px] mb-12 rounded-lg"
                            />
                        </Form.Item>

                        <SEOCard lang="vi" />
                    </Card>
                </div>
            ),
        },
    ];

    if (initLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <Spin size="large" tip="Loading Editor..." />
            </div>
        );
    }

    return (
        <div className="font-['Manrope'] min-h-screen bg-gray-50/50 pb-20">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ published: true, author: "Admin" }}
            >
                {/* --- Sticky Header --- */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard/cms/blogs">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    shape="circle"
                                    className="border-gray-300 hover:border-[#41398B] hover:text-[#41398B]"
                                />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 m-0 leading-tight">
                                    {isEditMode ? "Editing Blog Post" : "Create New Post"}
                                </h1>
                                <p className="text-xs text-gray-500 m-0">
                                    {isEditMode ? "Update your content details below" : "Fill in the details to publish a new article"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button size="large" onClick={() => navigate('/dashboard/cms/blogs')}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={loading}
                                size="large"
                                className="bg-[#41398B] hover:!bg-[#352e7a] px-8 shadow-lg shadow-indigo-100"
                            >
                                {isEditMode ? "Save Changes" : "Publish Post"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* --- Main Workspace --- */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT: Main Editor Area */}
                        <div className="lg:col-span-8">
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                items={tabItems}
                                type="card"
                                className="custom-tabs"
                            />
                        </div>

                        {/* RIGHT: Sidebar Settings */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Publishing Status Card */}
                            <Card className="shadow-sm rounded-xl border-gray-100" title="Publishing">
                                <Form.Item
                                    name="published"
                                    className="mb-0"
                                    valuePropName="checked"
                                >
                                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <span className="font-semibold text-gray-700">Visibility Status</span>
                                        <Switch checkedChildren="Published" unCheckedChildren="Draft" />
                                    </div>
                                </Form.Item>
                                <div className="mt-4 text-xs text-gray-400">
                                    <InfoCircleOutlined className="mr-1" />
                                    Draft posts are only visible to admins.
                                </div>
                            </Card>

                            {/* Organization Card */}
                            <Card className="shadow-sm rounded-xl border-gray-100" title="Organization">
                                <Form.Item
                                    name="author"
                                    label="Author"
                                    rules={[{ required: true }]}
                                >
                                    <Input size="large" prefix={<GlobalOutlined className="text-gray-400" />} placeholder="Author name" className="rounded-lg" />
                                </Form.Item>

                                <Form.Item
                                    name="category"
                                    label="Category"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder="Select Category"
                                        size="large"
                                        className="rounded-lg"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {categories.map((cat) => (
                                            <Select.Option key={cat._id} value={cat._id}>
                                                {cat.name?.en || cat.name?.vi || 'Unnamed'}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Divider className="my-4" />

                                <Form.Item label="Featured Image">
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#41398B] transition-colors group cursor-pointer relative">
                                        {imageUrl ? (
                                            <div className="relative">
                                                <img src={getImageUrl(imageUrl)} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
                                                <div
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-medium cursor-pointer"
                                                    onClick={() => { setImageUrl(""); form.setFieldValue("mainImage", ""); }}
                                                >
                                                    Remove Image
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block py-8">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <div className="mb-3">
                                                    <span className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-[#41398B]">
                                                        <CloudUploadOutlined className="text-xl" />
                                                    </span>
                                                </div>
                                                <div className="text-gray-900 font-semibold">Click to upload</div>
                                                <div className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF</div>
                                            </label>
                                        )}
                                    </div>
                                </Form.Item>
                            </Card>

                            {/* Metadata Card */}
                            <Card className="shadow-sm rounded-xl border-gray-100" title="Metadata">
                                <Form.Item name={['tags', 'en']} label="Tags (EN)">
                                    <Select mode="tags" placeholder="Add tags..." className="w-full" />
                                </Form.Item>
                                <Form.Item name={['tags', 'vi']} label="Tags (VI)">
                                    <Select mode="tags" placeholder="Thêm thẻ..." className="w-full" />
                                </Form.Item>
                            </Card>

                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
}

