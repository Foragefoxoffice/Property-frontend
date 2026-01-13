import React, { useState, useEffect } from "react";
import {
    Search,
    Mail,
    Phone,
    User,
    CheckCircle,
    X,
    MapPin,
    Calendar,
    ArrowRight,
    Bed,
    Bath,
    Maximize,
    ExternalLink,
    Eye,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { getAllEnquiries, markEnquiryAsRead, deleteEnquiry } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { usePermissions } from "../../Context/PermissionContext";

export default function Enquires() {
    const [enquiries, setEnquiries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

    // Language
    const { language } = useLanguage();
    const t = translations[language];
    const { can } = usePermissions();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await getAllEnquiries();
            if (res.data.success) {
                setEnquiries(res.data.data || []);
            }
        } catch {
            CommonToaster("Failed to fetch enquiries", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id, currentStatus) => {
        try {
            await markEnquiryAsRead(id, !currentStatus);
            setEnquiries(prev => prev.map(item =>
                item._id === id ? { ...item, isRead: !currentStatus } : item
            ));
            CommonToaster(currentStatus ? t.markAsUnread : t.markAsRead, "success");
        } catch (error) {
            console.error(error);
            CommonToaster("Failed to update status", "error");
        }
    };

    const confirmDelete = (id) => {
        setDeleteConfirm({ show: true, id });
    };

    const handleDelete = async () => {
        try {
            await deleteEnquiry(deleteConfirm.id);
            setEnquiries(prev => prev.filter(item => item._id !== deleteConfirm.id));
            setDeleteConfirm({ show: false, id: null });
            CommonToaster("Enquiry deleted successfully", "success");
        } catch (error) {
            console.error(error);
            CommonToaster("Failed to delete enquiry", "error");
        }
    };

    const filteredEnquiries = enquiries.filter(item =>
        item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalRows = filteredEnquiries.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = filteredEnquiries.slice(startIndex, startIndex + rowsPerPage);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.en || value.vi || '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen px-2 py-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-semibold text-gray-900">{t.enquires}</h1>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={`${t.search}...`}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white border border-gray-200"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-6">
                        <CommonSkeleton rows={5} />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-gray-700">
                                <thead className="bg-[#EAE9EE] text-gray-600 text-left h-18">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-[#111111]">{t.name}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111]">{t.email}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111]">{t.number}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111]">{t.addedOn}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111]">{t.listing}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111]">{t.message || "Message"}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111] text-center">{t.status}</th>
                                        <th className="px-6 py-3 font-medium text-[#111111] text-center">{t.actions || "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.map((item, i) => (
                                        <tr
                                            key={item._id}
                                            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-200`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${item.isRead ? 'bg-gray-100 text-gray-500' : 'bg-[#41398B]/10 text-[#41398B]'}`}>
                                                        {item.userName ? item.userName.charAt(0).toUpperCase() : <User size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium ${item.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                                            {item.userName || "Unknown"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                                    <Mail size={14} className="text-gray-400" />
                                                    <span className="truncate max-w-[200px]" title={item.userEmail}>{item.userEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.userPhone ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                                        <Phone size={14} className="text-gray-400" />
                                                        {item.userPhone}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-300 italic">No number</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedProperty(item)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#41398B] bg-[#41398B]/5 hover:bg-[#41398B]/10 rounded-lg transition-colors border border-[#41398B]/10"
                                                    >
                                                        {t.viewProperty} <ArrowRight size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="block max-w-[150px] truncate text-gray-500 text-xs" title={item.message}>
                                                    {item.message || "-"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => handleMarkRead(item._id, item.isRead)}
                                                    className={`p-1.5 rounded-full transition-all duration-200 inline-flex items-center justify-center ${item.isRead
                                                        ? 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
                                                        : 'text-green-500 hover:text-green-600 hover:bg-green-50 scale-110'
                                                        }`}
                                                    title={item.isRead ? t.markAsUnread : t.markAsRead}
                                                >
                                                    {item.isRead ? (
                                                        <CheckCircle size={20} />
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="w-5 h-5 rounded-full border-2 border-current" />
                                                            <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping" />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                {can("userManagement.enquires", "delete") && (
                                                    <button
                                                        onClick={() => confirmDelete(item._id)}
                                                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Delete Enquiry"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {currentRows.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-16 text-center text-gray-500">
                                                {t.noEnquiriesFound}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalRows > 0 && (
                <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50 mt-4 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <span>{t.rowsPerPage}:</span>
                        <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="border rounded-md text-gray-700 focus:outline-none px-2 py-1">
                            {[5, 10, 20, 25, 50].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <p>
                            {`${startIndex + 1}–${Math.min(startIndex + rowsPerPage, totalRows)} ${t.of} ${totalRows}`}
                        </p>

                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-1 px-2 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}
                        >
                            &lt;
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-1 px-2 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}

            {/* Property Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedProperty(null)}
                    />

                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <h3 className="text-lg font-bold text-gray-900">{t.enquiryDetails}</h3>
                            <button
                                onClick={() => setSelectedProperty(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 scrollbar-hide">
                            <h4 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">
                                {selectedProperty.properties?.length || 0} {t.properties || "Properties"} in this Enquiry
                            </h4>

                            <div className="space-y-8">
                                {selectedProperty.properties?.map((prop, idx) => (
                                    <div key={prop._id || idx} className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                        {/* Image */}
                                        <div className="w-full md:w-5/12 flex-shrink-0">
                                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                                                <img
                                                    src={prop.imagesVideos?.propertyImages?.[0] || 'https://via.placeholder.com/600x400'}
                                                    alt="Property"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/50 uppercase tracking-wide">
                                                        {getLocalizedValue(prop.listingInformation?.listingInformationTransactionType) || 'Property'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="w-full md:w-7/12 flex flex-col">
                                            <div className="">
                                                <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                                    {getLocalizedValue(prop.listingInformation?.listingInformationPropertyTitle) || "Untitled Property"}
                                                </h2>

                                                <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                                    {getLocalizedValue(prop.whatNearby?.whatNearbyDescription) ||
                                                        getLocalizedValue(prop.listingInformation?.listingInformationZoneSubArea) ||
                                                        "Description not available"}
                                                </p>

                                                <div className="flex flex-wrap gap-3 mb-4">
                                                    {prop.propertyInformation?.informationBedrooms > 0 && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <Bed size={14} className="text-gray-400" />
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {prop.propertyInformation.informationBedrooms} {t.beds}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {prop.propertyInformation?.informationBathrooms > 0 && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <Bath size={14} className="text-gray-400" />
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {prop.propertyInformation.informationBathrooms} {t.baths}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {prop.propertyInformation?.informationUnitSize > 0 && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <Maximize size={14} className="text-gray-400" />
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {prop.propertyInformation.informationUnitSize} m²
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Section */}
                                            <div className="mt-auto">
                                                <div className="flex items-end justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs text-[#2a2a2a] uppercase tracking-wider font-semibold mb-1">{t.price}</p>
                                                        <p className="text-[#41398B] font-bold text-xl tracking-tight">
                                                            {prop.financialDetails?.financialDetailsPrice ?
                                                                `₫ ${Number(prop.financialDetails?.financialDetailsPrice).toLocaleString()}` :
                                                                (prop.financialDetails?.financialDetailsLeasePrice ?
                                                                    `₫ ${Number(prop.financialDetails?.financialDetailsLeasePrice).toLocaleString()} / month` :
                                                                    "Contact for Price")
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    {formatDate(prop.listingInformation?.listingInformationDateListed || prop.createdAt) && (
                                                        <div className="flex items-center text-[12px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                            <Calendar size={12} className="mr-1.5" />
                                                            {t.posted} {formatDate(prop.listingInformation?.listingInformationDateListed || prop.createdAt)}
                                                        </div>
                                                    )}

                                                    <a
                                                        href={`/property-showcase/${prop.listingInformation?.listingInformationPropertyId}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#41398B] text-white text-xs font-semibold rounded-lg hover:bg-[#352e7a] transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        {t.viewFullDetails} <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 border border-gray-200 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <AlertTriangle className="text-red-600 w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800">
                                {t.deleteEnquiryQuestion}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {t.deleteEnquiryConfirm}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null })}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition"
                            >
                                {t.delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}