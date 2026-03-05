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
    Mail
} from "lucide-react";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../Context/SocketContext";

export default function ContactEnquiry() {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);
    const { language } = useLanguage();
    const isVI = language === "vi";
    const { socket, isConnected } = useSocket();

    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, count: 0 });
    const [messageModal, setMessageModal] = useState({ show: false, message: "", userName: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Pagination
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/contact-enquiry`);
            setEnquiries(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    // Socket.IO listener for real-time contact enquiry notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewContactEnquiry = (data) => {
            console.log('🔔 New contact enquiry received:', data);

            // Add the new enquiry to the list
            setEnquiries((prev) => [data.enquiry, ...prev]);

            // Show notification toast
            CommonToaster(
                isVI
                    ? `Yêu cầu liên hệ mới từ ${data.enquiry.firstName} ${data.enquiry.lastName}`
                    : `New contact enquiry from ${data.enquiry.firstName} ${data.enquiry.lastName}`,
                "info"
            );
        };

        socket.on('newContactEnquiry', handleNewContactEnquiry);

        return () => {
            socket.off('newContactEnquiry', handleNewContactEnquiry);
        };
    }, [socket, isVI]);

    // Search and Sort Logic
    const processedEnquiries = [...enquiries]
        .filter(item =>
            item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name-asc") return a.firstName.localeCompare(b.firstName);
            if (sortBy === "name-desc") return b.firstName.localeCompare(a.firstName);
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
            await axios.delete(`${import.meta.env.VITE_API_URL}/contact-enquiry/bulk-delete`, {
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
                        className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xl bg-[#41398B] text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {isVI ? "Yêu cầu liên hệ" : "Contact Enquiries"}
                    </h2>
                </div>

                <div style={{ alignItems: "baseline" }} className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
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
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer whitespace-nowrap"
                        >
                            <Trash2 size={16} />
                            {isVI ? `Xóa (${selectedIds.length})` : `Delete (${selectedIds.length})`}
                        </button>
                    )}
                </div>
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                {loading ? (
                    <CommonSkeleton rows={6} />
                ) : (
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeSelected;
                                        }}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left font-medium">{isVI ? "Tên" : "First Name"}</th>
                                <th className="px-6 py-3 text-left font-medium">{isVI ? "Họ" : "Last Name"}</th>
                                <th className="px-6 py-3 text-left font-medium">Email</th>
                                <th className="px-6 py-3 text-left font-medium">{isVI ? "Số điện thoại" : "Phone"}</th>
                                <th className="px-6 py-3 text-left font-medium">{isVI ? "Chủ đề" : "Subject"}</th>
                                <th className="px-6 py-3 text-left font-medium">{isVI ? "Tin nhắn" : "Message"}</th>
                                <th className="px-6 py-3 text-left font-medium">{isVI ? "Ngày" : "Date"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-500">
                                        {isVI ? "Không có dữ liệu." : "No records found."}
                                    </td>
                                </tr>
                            ) : (
                                visibleData.map((row, i) => (
                                    <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}>
                                        <td className="px-6 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row._id)}
                                                onChange={() => handleSelectOne(row._id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-3">{row.firstName}</td>
                                        <td className="px-6 py-3">{row.lastName}</td>
                                        <td className="px-6 py-3">{row.email}</td>
                                        <td className="px-6 py-3">{row.phone}</td>
                                        <td className="px-6 py-3">{row.subject}</td>
                                        <td className="px-6 py-3">
                                            {row.message && row.message.length > 30 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="block max-w-[150px] truncate text-gray-500 text-xs" title={row.message}>
                                                        {row.message}
                                                    </span>
                                                    <button
                                                        onClick={() => setMessageModal({ show: true, message: row.message, userName: `${row.firstName} ${row.lastName}` })}
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#41398B] bg-[#41398B]/5 hover:bg-[#41398B]/10 rounded-md transition-colors border border-[#41398B]/10 whitespace-nowrap cursor-pointer"
                                                    >
                                                        <Eye size={12} />
                                                        {isVI ? 'View chi tiết' : 'View Details'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="block text-gray-500 text-xs">
                                                    {row.message || "-"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">{new Date(row.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex justify-end items-center px-6 py-3 bg-white rounded-b-2xl text-sm text-gray-700 mt-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span>{isVI ? "Số hàng mỗi trang:" : "Rows per page:"}</span>
                        <select
                            className="border rounded-md px-2 py-1 text-gray-700"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            {[5, 10, 20].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <span>
                        {totalRows === 0 ? "0–0" : `${startIndex + 1}–${endIndex} ${isVI ? "trên" : "of"} ${totalRows}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={goToFirst} disabled={currentPage === 1}><ChevronsLeft size={16} /></button>
                        <button onClick={goToPrev} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                        <button onClick={goToNext} disabled={currentPage === totalPages || totalRows === 0}><ChevronRight size={16} /></button>
                        <button onClick={goToLast} disabled={currentPage === totalPages || totalRows === 0}><ChevronsRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <AlertTriangle className="text-red-600 w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800">
                                {isVI ? "Xác nhận xóa" : "Confirm Delete"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {isVI
                                ? `Bạn có chắc chắn muốn xóa ${deleteConfirm.count} yêu cầu đã chọn? Hành động này không thể hoàn tác.`
                                : `Are you sure you want to delete ${deleteConfirm.count} selected enquiries? This action cannot be undone.`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, count: 0 })}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                            >
                                {isVI ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition"
                            >
                                {isVI ? "Xóa" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Message Details Modal */}
            {messageModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#41398B]/10 flex items-center justify-center">
                                    <Mail className="text-[#41398B] w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">
                                        {isVI ? 'Chi tiết tin nhắn' : 'Message Details'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {isVI ? 'Từ' : 'From'}: {messageModal.userName || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMessageModal({ show: false, message: "", userName: "" })}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-[60vh] overflow-y-auto">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {messageModal.message}
                            </p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setMessageModal({ show: false, message: "", userName: "" })}
                                className="px-5 py-2.5 bg-[#41398B] text-white rounded-lg hover:bg-[#352e7a] font-medium text-sm shadow-sm transition cursor-pointer"
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