import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, Tabs, ConfigProvider, Spin } from "antd";
import { Edit, Trash, Plus, AlertTriangle } from "lucide-react";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";
import { CommonToaster } from "@/Common/CommonToaster";

export default function CategoryListPage() {
    const { language } = useLanguage();
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
            CommonToaster("Failed to fetch categories", "error");
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
            CommonToaster("Category deleted successfully", "success");
            fetchCategories();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error("Delete Error:", error);
            CommonToaster(error.response?.data?.error || "Failed to delete category", "error");
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
                CommonToaster("Category updated successfully", "success");
            } else {
                await createCategory(values);
                CommonToaster("Category created successfully", "success");
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            console.error(error);
            CommonToaster(error.response?.data?.error || "Failed to save category", "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Translation object
    const translations = {
        en: {
            pageTitle: "Categories",
            pageDescription: "Manage blog categories",
            addCategory: "Add Category",
            name: "Name",
            slug: "Slug",
            createdAt: "Created At",
            actions: "Actions",
            editCategory: "Edit Category",
            addNewCategory: "Add New Category",
            cancel: "Cancel",
            update: "Update",
            create: "Create",
            deleteCategory: "Delete Category?",
            deleteConfirmation: "Are you sure you want to delete this category? This action cannot be undone.",
            yesDelete: "Yes, Delete",
            noName: "No Name",
        },
        vi: {
            pageTitle: "Danh mục",
            pageDescription: "Quản lý danh mục blog",
            addCategory: "Thêm danh mục",
            name: "Tên",
            slug: "Đường dẫn",
            createdAt: "Ngày tạo",
            actions: "Hành động",
            editCategory: "Chỉnh sửa danh mục",
            addNewCategory: "Thêm danh mục mới",
            cancel: "Hủy",
            update: "Cập nhật",
            create: "Tạo mới",
            deleteCategory: "Xóa danh mục?",
            deleteConfirmation: "Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.",
            yesDelete: "Có, Xóa",
            noName: "Không có tên",
        }
    };

    const t = translations[language];

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
            title: t.name,
            dataIndex: "name",
            key: "name",
            render: (name) => <span className="font-semibold text-gray-700">{name?.[language] || name?.en || name?.vi || t.noName}</span>,
        },
        {
            title: t.slug,
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <span className="text-gray-500">{slug?.[language] || slug?.en || slug?.vi || '-'}</span>,
        },
        {
            title: t.createdAt,
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: t.actions,
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
                        {t.pageTitle}
                    </h1>
                    <p className="text-sm text-gray-500 font-['Manrope']">
                        {t.pageDescription}
                    </p>
                </div>
                <Button
                    style={{ backgroundColor: '#41398B' }}
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    size="large"
                    className="bg-[#41398B] hover:!bg-[#352e7a] border-none font-['Manrope'] flex items-center gap-2"
                    onClick={() => handleOpenModal(null)}
                >
                    {t.addCategory}
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
                title={editingCategory ? t.editCategory : t.addNewCategory}
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
                            {t.cancel}
                        </Button>
                        <Button
                            style={{ backgroundColor: '#41398B' }}
                            type="primary"
                            htmlType="submit"
                            loading={submitLoading}
                            className="bg-[#41398B] hover:!bg-[#352e7a]"
                        >
                            {editingCategory ? t.update : t.create}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
                        <div className="flex items-center mb-3">
                            <AlertTriangle className="text-red-600 mr-2" />
                            <h3 className="font-semibold text-gray-800">
                                {t.deleteCategory}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            {t.deleteConfirmation}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2 border rounded-full hover:bg-gray-100"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={submitLoading}
                                className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
                            >
                                {submitLoading ? (language === 'vi' ? 'Đang xóa...' : 'Deleting...') : t.yesDelete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
