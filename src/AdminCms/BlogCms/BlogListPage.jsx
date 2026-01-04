import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Space, Modal, message, ConfigProvider, Spin } from "antd";
import { Edit, Trash, Plus } from "lucide-react";
import { getAdminBlogs, deleteBlog } from "../../Api/action";

export default function BlogListPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingBlogId, setDeletingBlogId] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await getAdminBlogs();
            setBlogs(res.data.data);
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeletingBlogId(id);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteBlog(deletingBlogId);
            message.success("Blog deleted successfully");
            setDeleteModalVisible(false);
            setDeletingBlogId(null);
            fetchBlogs();
        } catch (error) {
            console.error(error);
            message.error("Failed to delete blog");
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
            title: "Title",
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
                    <span className="font-bold text-gray-800 line-clamp-1">{title?.en || title?.vi || 'Untitled'}</span>
                </div>
            ),
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <span className="text-gray-500">{slug?.en || slug?.vi || '-'}</span>,
        },
        {
            title: "Author",
            dataIndex: "author",
            key: "author",
        },
        {
            title: "Published",
            dataIndex: "published",
            key: "published",
            render: (published) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                        }`}
                >
                    {published ? "Published" : "Draft"}
                </span>
            ),
        },
        {
            title: "Actions",
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
                        Blog Management
                    </h1>
                    <p className="text-sm text-gray-500 font-['Manrope']">
                        Manage your blog posts here
                    </p>
                </div>
                <Link to="/dashboard/cms/blogs/create">
                    <Button style={{ backgroundColor: '#41398B' }}
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        size="large"
                        className="hover:!bg-[#352e7a] border-none font-['Manrope'] flex items-center gap-2"
                    >
                        Create New Blog
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

            <Modal
                title="Are you sure you want to delete this blog?"
                open={deleteModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText="Yes, Delete"
                okType="danger"
                cancelText="Cancel"
            >
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
