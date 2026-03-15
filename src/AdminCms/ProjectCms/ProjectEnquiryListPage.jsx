import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "antd";
import {
    Search,
    ArrowLeft,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Trash2,
    AlertTriangle,
    X,
    Eye,
    Mail,
    Building2
} from "lucide-react";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function ProjectEnquiryListPage() {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);
    const { language } = useLanguage();
    const isVI = language === "vi";

    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, count: 0 });
    const [messageModal, setMessageModal] = useState({ show: false, message: "", userName: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Pagination
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/project-enquiry`);
            setEnquiries(res.data.data || []);
        } catch (error) {
            console.error("Error fetching project enquiries:", error);
            CommonToaster(isVI ? "Lỗi khi lấy dữ liệu" : "Error fetching data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    // Search and Sort Logic
    const processedEnquiries = [...enquiries]
        .filter(item =>
            item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name-asc") return a.fullName.localeCompare(b.fullName);
            if (sortBy === "name-desc") return b.fullName.localeCompare(a.fullName);
            if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            return 0;
        });

    // Pagination logic
    const totalRows = processedEnquiries.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const visibleData = processedEnquiries.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (totalRows === 0) setCurrentPage(1);
    }, [totalRows, totalPages]);

    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

    // Checkbox handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = visibleData.map((item) => item._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const isAllSelected = visibleData.length > 0 && selectedIds.length === visibleData.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < visibleData.length;

    // Bulk delete handler
    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        setDeleteConfirm({ show: true, count: selectedIds.length });
    };

    const handleBulkDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`${import.meta.env.VITE_API_URL}/project-enquiry`, {
                data: { ids: selectedIds },
            });

            setSelectedIds([]);
            setDeleteConfirm({ show: false, count: 0 });
            await fetchEnquiries();

            const successMsg = isVI
                ? `Đã xóa ${deleteConfirm.count} yêu cầu thành công!`
                : `Successfully deleted ${deleteConfirm.count} enquiries!`;
            CommonToaster(successMsg, "success");
        } catch (error) {
            console.error(error);
            const errorMsg = isVI
                ? "Xóa thất bại. Vui lòng thử lại."
                : "Failed to delete. Please try again.";
            CommonToaster(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xl bg-[#41398B] text-white hover:bg-[#352e7a] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {isVI ? "Yêu cầu dự án" : "Project Enquiries"}
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={isVI ? "Tìm kiếm..." : "Search enquiries..."}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#41398B] focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Sort Filter */}
                    <Select
                        value={sortBy}
                        onChange={(value) => setSortBy(value)}
                        className="w-full sm:w-48 custom-selects"
                        popupClassName="custom-dropdown"
                        placeholder={isVI ? "Sắp xếp theo" : "Sort by"}
                    >
                        <Select.Option value="newest">{isVI ? "Mới nhất" : "Newest First"}</Select.Option>
                        <Select.Option value="oldest">{isVI ? "Cũ nhất" : "Oldest First"}</Select.Option>
                        <Select.Option value="name-asc">{isVI ? "Tên (A-Z)" : "Name (A-Z)"}</Select.Option>
                        <Select.Option value="name-desc">{isVI ? "Tên (Z-A)" : "Name (Z-A)"}</Select.Option>
                    </Select>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDeleteClick}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer whitespace-nowrap animate-in fade-in duration-200"
                        >
                            <Trash2 size={16} />
                            {isVI ? `Xóa (${selectedIds.length})` : `Delete (${selectedIds.length})`}
                        </button>
                    )}
                </div>
            </div>

            <div className={`transition-opacity overflow-x-auto rounded-xl border border-gray-100 shadow-sm ${loading ? "opacity-50" : "opacity-100"}`}>
                {loading ? (
                    <CommonSkeleton rows={6} />
                ) : (
                    <table className="w-full text-sm border-collapse min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium w-12">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeSelected;
                                        }}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 cursor-pointer accent-[#41398B]"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left font-medium">{isVI ? "Dự án" : "Project"}</th>
                                <th className="px-6 py-4 text-left font-medium">{isVI ? "Họ tên" : "Full Name"}</th>
                                <th className="px-6 py-4 text-left font-medium">{isVI ? "Số điện thoại" : "Phone"}</th>
                                <th className="px-6 py-4 text-left font-medium">{isVI ? "Tin nhắn" : "Message"}</th>
                                <th className="px-6 py-4 text-left font-medium">{isVI ? "Ngày" : "Date"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Mail className="w-12 h-12 text-gray-300 mb-2" />
                                            <p className="font-medium text-gray-400">
                                                {isVI ? "Không có dữ liệu yêu cầu dự án." : "No project enquiries found."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visibleData.map((row, i) => (
                                    <tr key={row._id} className="bg-white hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row._id)}
                                                onChange={() => handleSelectOne(row._id)}
                                                className="w-4 h-4 cursor-pointer accent-[#41398B]"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-[#41398B]/10 flex items-center justify-center text-[#41398B]">
                                                    <Building2 size={14} />
                                                </div>
                                                <span className="font-medium text-gray-900">{row.projectName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{row.fullName}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.phone}</td>
                                        <td className="px-6 py-4">
                                            {row.message && row.message.length > 30 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="block max-w-[150px] truncate text-gray-500" title={row.message}>
                                                        {row.message}
                                                    </span>
                                                    <button
                                                        onClick={() => setMessageModal({ show: true, message: row.message, userName: row.fullName })}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#41398B] bg-[#41398B]/5 hover:bg-[#41398B]/10 rounded-lg transition-colors border border-[#41398B]/10 whitespace-nowrap cursor-pointer"
                                                    >
                                                        <Eye size={12} />
                                                        {isVI ? 'Xem chi tiết' : 'View Details'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 italic text-xs">
                                                    {row.message || "-"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                            {new Date(row.createdAt).toLocaleDateString(isVI ? 'vi-VN' : 'en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white border border-t-0 border-gray-100 rounded-b-xl text-sm text-gray-700 shadow-sm gap-4">
                 <div className="flex items-center gap-2">
                    <span>{isVI ? "Số hàng mỗi trang:" : "Rows per page:"}</span>
                    <select
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:ring-2 focus:ring-[#41398B] focus:border-transparent outline-none bg-white transition-all shadow-sm"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-medium">
                        {totalRows === 0 ? "0–0" : `${startIndex + 1}–${endIndex} ${isVI ? "trên" : "of"} ${totalRows}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={goToFirst} 
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                            <ChevronsLeft size={20} />
                        </button>
                        <button 
                            onClick={goToPrev} 
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={goToNext} 
                            disabled={currentPage === totalPages || totalRows === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button 
                            onClick={goToLast} 
                            disabled={currentPage === totalPages || totalRows === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                            <ChevronsRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 transition-all animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mr-4">
                                <AlertTriangle className="text-red-500 w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">
                                {isVI ? "Xác nhận xóa" : "Confirm Delete"}
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {isVI
                                ? `Bạn có chắc chắn muốn xóa ${deleteConfirm.count} yêu cầu đã chọn? Hành động này không thể hoàn tác.`
                                : `Are you sure you want to delete ${deleteConfirm.count} selected enquiries? This action cannot be undone.`}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, count: 0 })}
                                className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors cursor-pointer"
                            >
                                {isVI ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-sm shadow-lg shadow-red-200 transition-all cursor-pointer active:scale-95"
                            >
                                {isVI ? "Xóa" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Details Modal */}
            {messageModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 transition-all animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#41398B]/10 flex items-center justify-center shadow-inner">
                                    <Mail className="text-[#41398B] w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800">
                                        {isVI ? 'Chi tiết tin nhắn' : 'Message Details'}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {isVI ? 'Từ' : 'From'}: <span className="text-[#41398B]">{messageModal.userName || 'Unknown'}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMessageModal({ show: false, message: "", userName: "" })}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {messageModal.message}
                            </p>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => setMessageModal({ show: false, message: "", userName: "" })}
                                className="px-8 py-3 bg-[#41398B] text-white rounded-xl hover:bg-[#352e7a] font-bold text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
                            >
                                {isVI ? 'Đóng' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
