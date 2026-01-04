import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message, Form, Input, Tabs } from "antd";
import { Edit, Trash, Plus } from "lucide-react";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../../Api/action";

export default function CategoryListPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setSubmitLoading(true);
        try {
            await deleteCategory(deleteId);
            message.success("Category deleted successfully");
            fetchCategories();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error("Delete Error:", error);
            message.error(error.response?.data?.error || "Failed to delete category");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            // Populate form for edit
            form.setFieldsValue(category);
        } else {
            // Reset for new
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const onFinish = async (values) => {
        setSubmitLoading(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, values);
                message.success("Category updated successfully");
            } else {
                await createCategory(values);
                message.success("Category created successfully");
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.error || "Failed to save category");
        } finally {
            setSubmitLoading(false);
        }
    };

    const tabItems = [
        {
            key: 'en',
            label: 'English',
            children: (
                <Form.Item
                    name={['name', 'en']}
                    label={<span className="font-semibold text-gray-700">Category Name (EN)</span>}
                    rules={[{ required: true, message: "Please enter category name" }]}
                >
                    <Input size="large" placeholder="e.g. Real Estate" className="rounded-lg" />
                </Form.Item>
            ),
        },
        {
            key: 'vi',
            label: 'Vietnamese',
            children: (
                <Form.Item
                    name={['name', 'vi']}
                    label={<span className="font-semibold text-gray-700">Category Name (VI)</span>}
                    rules={[{ required: true, message: "Please enter category name" }]}
                >
                    <Input size="large" placeholder="e.g. Bất động sản" className="rounded-lg" />
                </Form.Item>
            ),
        },
    ];

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name) => <span className="font-semibold text-gray-700">{name?.en || name?.vi || 'No Name'}</span>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <span className="text-gray-500">{slug?.en || slug?.vi || '-'}</span>,
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<Edit className="w-4 h-4 text-blue-600" />}
                        className="flex items-center justify-center hover:bg-blue-50"
                        onClick={() => handleOpenModal(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<Trash className="w-4 h-4" />}
                        onClick={() => confirmDelete(record._id)}
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
                        Categories
                    </h1>
                    <p className="text-sm text-gray-500 font-['Manrope']">
                        Manage blog categories
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    size="large"
                    className="bg-[#41398B] hover:!bg-[#352e7a] border-none font-['Manrope'] flex items-center gap-2"
                    onClick={() => handleOpenModal(null)}
                >
                    Add Category
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="font-['Manrope']"
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={editingCategory ? "Edit Category" : "Add New Category"}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="pt-4"
                >
                    <Tabs defaultActiveKey="en" items={tabItems} />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitLoading}
                            className="bg-[#41398B] hover:!bg-[#352e7a]"
                        >
                            {editingCategory ? "Update" : "Create"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Category?"
                open={isDeleteModalOpen}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                okText="Yes, Delete"
                okType="danger"
                confirmLoading={submitLoading}
                cancelText="Cancel"
            >
                <p>Are you sure you want to delete this category? This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
