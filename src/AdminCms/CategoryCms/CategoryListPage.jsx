import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { Search, Plus, Trash2, X, AlertTriangle, MoreVertical, Pencil, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Calendar, Languages } from "lucide-react";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";
import { usePermissions } from "../../Context/PermissionContext";
import { CommonToaster } from "@/Common/CommonToaster";
import { translations } from "../../Language/translations";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { translateError } from "../../utils/translateError";

export default function CategoryListPage() {
    const { language } = useLanguage();
    const t = translations[language];
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
    const [activeTab, setActiveTab] = useState("vi");

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
            CommonToaster(t.errorFetchingCategories, "error");
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
            CommonToaster(t.categoryDeleted, "success");
            fetchCategories();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error("Delete Error:", error);
            const msg = error.response?.data?.error || error.response?.data?.message || t.errorDeletingCategory;
            CommonToaster(translateError(msg, t), "error");
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
                CommonToaster(t.categoryUpdated, "success");
            } else {
                await createCategory(payload);
                CommonToaster(t.categoryCreated, "success");
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || error.response?.data?.message || t.errorSavingCategory;
            CommonToaster(translateError(msg, t), "error");
        } finally {
            setSubmitLoading(false);
        }
    };

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


    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

    return (
        <div className="min-h-screen px-2 py-2 font-primary relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {t.categoriesTitle}
                    </h1>
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
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={`${t.search}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                />
            </div>

            {/* Table */}
            <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                {loading ? (
                    <div className="p-6 bg-white rounded-2xl border border-gray-100">
                        <CommonSkeleton rows={5} />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-[#EAE9EE] text-gray-600 text-left h-18">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium text-[#111111]">{t.name}</th>
                                    <th className="px-6 py-4 text-left font-medium text-[#111111]">{t.slug}</th>
                                    <th className="px-6 py-4 text-left font-medium text-[#111111]">{t.createdAt}</th>
                                    <th className="px-6 py-4 text-right font-medium text-[#111111]">{t.actions}</th>
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
                                            className={`border-b last:border-0 border-gray-100 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
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
                )}
            </div>

            {/* Pagination Bar */}
            {!loading && totalRows > 0 && (
                <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50 mt-4 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <span>{t.rowsPerPage}:</span>
                        <select value={rowsPerPage} onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }} className="border rounded-md text-gray-700 focus:outline-none px-2 py-1">
                            {[5, 10, 20, 25, 50].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <p>
                            {totalRows === 0
                                ? `0–0 ${t.of} 0`
                                : `${startIndex + 1}–${endIndex} ${t.of} ${totalRows}`}
                        </p>
                        <button
                            onClick={goToPrev}
                            disabled={currentPage === 1}
                            className={`p-1 px-2 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}
                        >
                            &lt;
                        </button>
                        <button
                            onClick={goToNext}
                            disabled={currentPage === totalPages || totalRows === 0}
                            className={`p-1 px-2 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}

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
                                    onClick={() => setActiveTab("vi")}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "vi"
                                        ? "text-[#41398B] border-b-2 border-[#41398B]"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Languages size={16} />
                                    Tiếng Việt
                                </button>
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
                                        {submitLoading ? t.saving : (editingCategory ? t.update : t.create)}
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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                    <AlertTriangle className="text-red-600 w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-800">
                                    {t.deleteCategoryQuestion}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-5">
                                {t.deleteCategoryConfirm}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-5 py-2.5 border rounded-lg hover:bg-gray-50 text-sm font-medium"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitLoading}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium shadow-sm"
                                >
                                    {submitLoading ? t.deleting : t.yesDelete}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
