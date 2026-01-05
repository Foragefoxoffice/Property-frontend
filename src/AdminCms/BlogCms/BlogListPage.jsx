import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Space, Modal, ConfigProvider, Spin } from "antd";
import { Edit, Trash, Plus, AlertTriangle } from "lucide-react";
import { getAdminBlogs, deleteBlog } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";
import { CommonToaster } from "@/Common/CommonToaster";

export default function BlogListPage() {
    const { language } = useLanguage();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingBlogId, setDeletingBlogId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Translation object
    const translations = {
        en: {
            pageTitle: "Blog Management",
            pageDescription: "Manage your blog posts here",
            createBlog: "Create New Blog",
            title: "Title",
            slug: "Slug",
            author: "Author",
            published: "Published",
            draft: "Draft",
            actions: "Actions",
            deleteBlog: "Delete Blog?",
            deleteConfirmation: "Are you sure you want to delete this blog? This action cannot be undone.",
            yesDelete: "Yes, Delete",
            cancel: "Cancel",
            untitled: "Untitled",
            deleting: "Deleting...",
        },
        vi: {
            pageTitle: "Quản lý Blog",
            pageDescription: "Quản lý các bài viết blog của bạn",
            createBlog: "Tạo Blog mới",
            title: "Tiêu đề",
            slug: "Đường dẫn",
            author: "Tác giả",
            published: "Đã xuất bản",
            draft: "Bản nháp",
            actions: "Hành động",
            deleteBlog: "Xóa Blog?",
            deleteConfirmation: "Bạn có chắc chắn muốn xóa blog này? Hành động này không thể hoàn tác.",
            yesDelete: "Có, Xóa",
            cancel: "Hủy",
            untitled: "Chưa có tiêu đề",
            deleting: "Đang xóa...",
        }
    };

    const t = translations[language];

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await getAdminBlogs();
            setBlogs(res.data.data);
        } catch (error) {
            console.error(error);
            CommonToaster("Failed to fetch blogs", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeletingBlogId(id);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        setSubmitLoading(true);
        try {
            await deleteBlog(deletingBlogId);
            CommonToaster("Blog deleted successfully", "success");
            setDeleteModalVisible(false);
            setDeletingBlogId(null);
            fetchBlogs();
        } catch (error) {
            console.error(error);
            CommonToaster("Failed to delete blog", "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setDeletingBlogId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                    <Spin size="large" />
                </ConfigProvider>
            </div>
        );
    }

    const columns = [
        {
            title: t.title,
            dataIndex: "title",
            key: "title",
            render: (title, record) => (
                <div className="flex items-center gap-4">
                    {record.mainImage && (
                        <img
                            src={record.mainImage}
                            alt={title?.en || "blog"}
                            className="w-12 h-12 object-cover rounded-md"
                        />
                    )}
                    <span className="font-bold text-gray-800 line-clamp-1">{title?.[language] || title?.en || title?.vi || t.untitled}</span>
                </div>
            ),
        },
        {
            title: t.slug,
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <span className="text-gray-500">{slug?.[language] || slug?.en || slug?.vi || '-'}</span>,
        },
        {
            title: t.author,
            dataIndex: "author",
            key: "author",
        },
        {
            title: t.published,
            dataIndex: "published",
            key: "published",
            render: (published) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                        }`}
                >
                    {published ? t.published : t.draft}
                </span>
            ),
        },
        {
            title: t.actions,
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/dashboard/cms/blogs/edit/${record._id}`}>
                        <Button
                            type="text"
                            icon={<Edit className="w-4 h-4 text-blue-600" />}
                            className="flex items-center justify-center hover:bg-blue-50"
                        />
                    </Link>
                    <Button
                        type="text"
                        danger
                        icon={<Trash className="w-4 h-4" />}
                        onClick={() => handleDelete(record._id)}
                        className="flex items-center justify-center hover:bg-red-50"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 font-['Manrope']">
                        {t.pageTitle}
                    </h1>
                    <p className="text-sm text-gray-500 font-['Manrope']">
                        {t.pageDescription}
                    </p>
                </div>
                <Link to="/dashboard/cms/blogs/create">
                    <Button style={{ backgroundColor: '#41398B' }}
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        size="large"
                        className="hover:!bg-[#352e7a] border-none font-['Manrope'] flex items-center gap-2"
                    >
                        {t.createBlog}
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={blogs}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="font-['Manrope']"
                />
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalVisible && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
                        <div className="flex items-center mb-3">
                            <AlertTriangle className="text-red-600 mr-2" />
                            <h3 className="font-semibold text-gray-800">
                                {t.deleteBlog}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            {t.deleteConfirmation}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-5 py-2 border rounded-full hover:bg-gray-100"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={submitLoading}
                                className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
                            >
                                {submitLoading ? t.deleting : t.yesDelete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
