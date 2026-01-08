import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, Tabs, ConfigProvider, Spin, Select } from "antd";
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, MoreVertical, Pencil, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Calendar, Languages } from "lucide-react";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";
import { usePermissions } from "../../Context/PermissionContext";
import { CommonToaster } from "@/Common/CommonToaster";

export default function CategoryListPage() {
    const { language } = useLanguage();
    const { can } = usePermissions();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [activeTab, setActiveTab] = useState("en");

    const [formData, setFormData] = useState({
        name: { en: "", vi: "" }
    });

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
            setFormData({
                name: {
                    en: category.name?.en || "",
                    vi: category.name?.vi || ""
                }
            });
        } else {
            setFormData({
                name: { en: "", vi: "" }
            });
        }
        setActiveTab("en");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: { en: "", vi: "" } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const payload = {
            name: formData.name
        };

        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, payload);
                CommonToaster("Category updated successfully", "success");
            } else {
                await createCategory(payload);
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



    // Filter & Pagination Logic
    const filteredCategories = categories.filter((cat) => {
        const nameEn = cat.name?.en || "";
        const nameVi = cat.name?.vi || "";
        const search = searchTerm.toLowerCase();
        return nameEn.toLowerCase().includes(search) || nameVi.toLowerCase().includes(search);
    });

    const totalRows = filteredCategories.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const visibleData = filteredCategories.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (totalRows > 0 && currentPage === 0) setCurrentPage(1);
    }, [totalRows, totalPages, currentPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                    <Spin size="large" />
                </ConfigProvider>
            </div>
        );
    }

    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

    return (
        <div className="min-h-screen px-6 py-6 font-primary relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t.pageTitle}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t.pageDescription}
                    </p>
                </div>
                {can('blogs.category', 'add') && (
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition shadow-md cursor-pointer"
                    >
                        <Plus size={18} />
                        {t.addCategory}
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
                <Search className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                />
            </div>

            {/* Table */}
            <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">{t.name}</th>
                                <th className="px-6 py-4 text-left font-medium">{t.slug}</th>
                                <th className="px-6 py-4 text-left font-medium">{t.createdAt}</th>
                                <th className="px-6 py-4 text-right font-medium">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-gray-500">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                visibleData.map((category, i) => (
                                    <tr
                                        key={category._id}
                                        className="border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-700">
                                            {category.name?.[language] || category.name?.en || category.name?.vi || t.noName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {category.slug?.[language] || category.slug?.en || category.slug?.vi || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(category.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500"
                                                onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuIndex === i && (
                                                <div className="absolute right-10 top-10 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 py-1 overflow-hidden">
                                                    {can('blogs.category', 'edit') && (
                                                        <button
                                                            onClick={() => {
                                                                handleOpenModal(category);
                                                                setOpenMenuIndex(null);
                                                            }}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition group"
                                                        >
                                                            <span className="w-8 flex justify-center">
                                                                <Pencil size={15} className="text-blue-600 group-hover:scale-110 transition" />
                                                            </span>
                                                            {t.editCategory}
                                                        </button>
                                                    )}
                                                    {can('blogs.category', 'delete') && (
                                                        <button
                                                            onClick={() => {
                                                                confirmDelete(category._id);
                                                                setOpenMenuIndex(null);
                                                            }}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition group"
                                                        >
                                                            <span className="w-8 flex justify-center">
                                                                <Trash2 size={15} className="group-hover:scale-110 transition" />
                                                            </span>
                                                            {t.yesDelete.replace("Yes, ", "")}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Bar */}
            <div className="flex justify-end items-center px-6 py-2 bg-white rounded-xl text-sm text-gray-700 mt-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span>{language === "vi" ? "Số hàng mỗi trang:" : "Rows per page:"}</span>
                        <Select
                            value={rowsPerPage}
                            onChange={(val) => {
                                setRowsPerPage(val);
                                setCurrentPage(1);
                            }}
                            className="w-16 h-8"
                            suffixIcon={null}
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <Select.Option key={n} value={n}>
                                    {n}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <span className="font-medium text-gray-600">
                        {totalRows === 0
                            ? "0–0"
                            : `${startIndex + 1}–${endIndex} ${language === "vi" ? "trên" : "of"} ${totalRows}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToFirst}
                            disabled={currentPage === 1}
                            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            onClick={goToPrev}
                            disabled={currentPage === 1}
                            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={goToNext}
                            disabled={currentPage === totalPages || totalRows === 0}
                            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={goToLast}
                            disabled={currentPage === totalPages || totalRows === 0}
                            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? t.editCategory : t.addNewCategory}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 bg-[#F9FAFB]">
                            {/* Global Language Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-gray-200 bg-[#F9FAFB]">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("en")}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "en"
                                        ? "text-[#41398B] border-b-2 border-[#41398B]"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Languages size={16} />
                                    English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("vi")}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "vi"
                                        ? "text-[#41398B] border-b-2 border-[#41398B]"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Languages size={16} />
                                    Tiếng Việt
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        {activeTab === 'en' ? 'Category Name' : 'Tên Danh Mục'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder={activeTab === 'en' ? "e.g. Real Estate" : "VD: Bất động sản"}
                                        value={activeTab === 'en' ? formData.name.en : formData.name.vi}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            name: {
                                                ...formData.name,
                                                [activeTab]: e.target.value
                                            }
                                        })}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition bg-white"
                                    >
                                        {t.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="px-6 py-2.5 rounded-lg bg-[#41398B] hover:bg-[#41398be3] text-white text-sm font-medium shadow-md transition disabled:opacity-70"
                                    >
                                        {submitLoading ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (editingCategory ? t.update : t.create)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
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
                )
            }
        </div >
    );
}
