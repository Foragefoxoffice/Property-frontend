import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Space, Modal, ConfigProvider, Spin, Select } from "antd";
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, MoreVertical, Pencil, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Calendar, Languages, Eye, Clock, User, Tag, Share2, ExternalLink } from "lucide-react";
import { getAdminBlogs, deleteBlog } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { CommonToaster } from "@/Common/CommonToaster";
import { getImageUrl } from "../../utils/imageHelper";

export default function BlogListPage() {
    const { language } = useLanguage();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingBlogId, setDeletingBlogId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);

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
            CommonToaster(t.toastNewsFetchError, "error");
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
            CommonToaster(t.toastNewsDeleted, "success");
            setDeleteModalVisible(false);
            setDeletingBlogId(null);
            fetchBlogs();
        } catch (error) {
            console.error(error);
            CommonToaster(t.toastNewsDeleteError, "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setDeletingBlogId(null);
    };



    // Filter & Pagination Logic
    const filteredBlogs = blogs.filter((blog) => {
        const titleEn = blog.title?.en || "";
        const titleVi = blog.title?.vi || "";
        const search = searchTerm.toLowerCase();
        return titleEn.toLowerCase().includes(search) || titleVi.toLowerCase().includes(search);
    });

    const totalRows = filteredBlogs.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const visibleData = filteredBlogs.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (totalRows > 0 && currentPage === 0) setCurrentPage(1);
    }, [totalRows, totalPages, currentPage]);

    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

    return (
        <div className="min-h-screen px-6 py-6 font-primary relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t.newsManagement}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t.newsManagementDescription}
                    </p>
                </div>
                <Link to="/dashboard/cms/blogs/create">
                    <button
                        className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-lg font-medium transition shadow-md cursor-pointer"
                    >
                        <Plus size={18} />
                        {t.createNews}
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
                <Search className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                />
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">{t.snoNews}</th>
                                <th className="px-6 py-4 text-left font-medium">{t.newsTitle}</th>
                                <th className="px-6 py-4 text-left font-medium">{t.newsAuthor}</th>
                                <th className="px-6 py-4 text-center font-medium">{t.newsPublished}</th>
                                <th className="px-6 py-4 text-right font-medium">{t.newsActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12">
                                        <div className="flex justify-center">
                                            <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                                                <Spin size="large" />
                                            </ConfigProvider>
                                        </div>
                                    </td>
                                </tr>
                            ) : visibleData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        {t.noNewsFound}
                                    </td>
                                </tr>
                            ) : (
                                visibleData.map((blog, i) => (
                                    <tr
                                        key={blog._id}
                                        className="border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-gray-500">
                                            {startIndex + i + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {blog.mainImage && (
                                                    <img
                                                        src={getImageUrl(blog.mainImage)}
                                                        alt={blog.title?.en}
                                                        className="w-12 h-12 object-cover rounded-md border border-gray-100"
                                                    />
                                                )}
                                                <span className="font-semibold text-gray-800 line-clamp-1">
                                                    {blog.title?.[language] || blog.title?.en || blog.title?.vi || t.untitledNews}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {blog.author}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${blog.published
                                                    ? "bg-green-50 text-green-700 border-green-100"
                                                    : "bg-gray-50 text-gray-500 border-gray-100"
                                                    }`}
                                            >
                                                {blog.published ? t.newsPublished : t.newsDraft}
                                            </span>
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
                                                    <Link
                                                        to={`/blogs/${blog.slug?.[language] || blog.slug?.en || blog.slug?.vi}`}
                                                        target="_blank"
                                                        onClick={() => setOpenMenuIndex(null)}
                                                    >
                                                        <button
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition group"
                                                        >
                                                            <span className="w-8 flex justify-center">
                                                                <Eye size={15} className="text-[#41398B] group-hover:scale-110 transition" />
                                                            </span>
                                                            {t.viewNewsDetails}
                                                        </button>
                                                    </Link>
                                                    <Link to={`/dashboard/cms/blogs/edit/${blog._id}`}>
                                                        <button
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition group"
                                                        >
                                                            <span className="w-8 flex justify-center">
                                                                <Pencil size={15} className="text-blue-600 group-hover:scale-110 transition" />
                                                            </span>
                                                            {t.editNews}
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            handleDelete(blog._id);
                                                            setOpenMenuIndex(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition group"
                                                    >
                                                        <span className="w-8 flex justify-center">
                                                            <Trash2 size={15} className="group-hover:scale-110 transition" />
                                                        </span>
                                                        {t.yesDeleteNews.replace("Yes, ", "")}
                                                    </button>
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
                        <span>{t.rowsPerPage}</span>
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
                            : `${startIndex + 1}–${endIndex} ${t.of} ${totalRows}`}
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

            {/* Delete Confirmation Modal */}
            {deleteModalVisible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <AlertTriangle className="text-red-600 w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">
                                {t.deleteNewsMsg}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            {t.deleteNewsConfirmation}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={submitLoading}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition disabled:opacity-50"
                            >
                                {submitLoading ? t.deletingNews : t.yesDeleteNews}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
