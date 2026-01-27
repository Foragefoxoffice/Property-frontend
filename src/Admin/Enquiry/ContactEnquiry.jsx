import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    ArrowLeft,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Trash2,
} from "lucide-react";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { useLanguage } from "../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function ContactEnquiry() {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);
    const { language } = useLanguage();
    const isVI = language === "vi";

    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

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

    // Pagination logic
    const totalRows = enquiries.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const visibleData = enquiries.slice(startIndex, endIndex);

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
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmMsg = isVI
            ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} yêu cầu đã chọn?`
            : `Are you sure you want to delete ${selectedIds.length} selected enquiries?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            setLoading(true);
            await axios.delete(`${import.meta.env.VITE_API_URL}/contact-enquiry/bulk-delete`, {
                data: { ids: selectedIds },
            });

            setSelectedIds([]);
            await fetchEnquiries();

            const successMsg = isVI
                ? `Đã xóa ${selectedIds.length} yêu cầu thành công!`
                : `Successfully deleted ${selectedIds.length} enquiries!`;
            alert(successMsg);
        } catch (error) {
            console.error(error);
            const errorMsg = isVI
                ? "Xóa thất bại. Vui lòng thử lại."
                : "Failed to delete. Please try again.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen relative">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-[#41398B] text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {isVI ? "Yêu cầu liên hệ" : "Contact Enquiries"}
                    </h2>
                </div>

                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isVI ? `Xóa (${selectedIds.length})` : `Delete (${selectedIds.length})`}
                    </button>
                )}
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
                                            <div className="truncate max-w-xs" title={row.message}>
                                                {row.message}
                                            </div>
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
        </div>
    );
}