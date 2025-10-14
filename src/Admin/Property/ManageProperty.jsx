import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Share2,
  Eye,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import {
  getAllPropertyListings,
  deletePropertyListing,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import commonimg from "../../assets/image/commonimg.jpg";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function ManageProperty({
  openCreateProperty,
  openEditProperty,
}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const { language } = useLanguage();
  const t = translations[language];

  // ✅ Fetch properties
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await getAllPropertyListings();
        if (res?.data?.success) setProperties(res.data.data || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // ✅ Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const info = p.listingInformation || {};
      const title =
        info.listingInformationPropertyTitle?.[language] ||
        info.listingInformationPropertyTitle?.en ||
        "";
      const type =
        info.listingInformationTransactionType?.[language] ||
        info.listingInformationTransactionType?.en ||
        "";
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (info.listingInformationPropertyId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, properties, language]);

  // ✅ Pagination logic
  const totalRows = filteredProperties.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = filteredProperties.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // ✅ Delete property
  const handleDelete = async () => {
    try {
      await deletePropertyListing(deleteConfirm.id);
      setProperties((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
      CommonToaster(
        language === "vi"
          ? "Xóa bất động sản thành công"
          : "Property deleted successfully",
        "success"
      );
    } catch (err) {
      console.error("Error deleting property:", err);
      CommonToaster(
        language === "vi"
          ? "Xóa bất động sản thất bại"
          : "Failed to delete property",
        "error"
      );
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });

  return (
    <div className="min-h-screen px-2 py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">{t.properties}</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={openCreateProperty}
            className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-full shadow-md"
          >
            <Plus className="w-4 h-4" />
            {t.addProperty}
          </button>
        </div>
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
          className="w-full pl-10 pr-4 py-2 rounded-full border border-[#B2B2B3] focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#EAE9EE] text-gray-600 text-left h-18">
              <tr>
                <th className="px-6 py-3 font-medium text-[#111111]">{t.property}</th>
                <th className="px-6 py-3 font-medium text-[#111111]">{t.transactionType}</th>
                <th className="px-6 py-3 font-medium text-[#111111]">{t.location}</th>
                <th className="px-6 py-3 font-medium text-[#111111]">{t.propertyType}</th>
                <th className="px-6 py-3 font-medium text-[#111111]">{t.status}</th>
                <th className="px-6 py-3 font-medium text-[#111111] text-right">
                  {language === "vi" ? "Hành động" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((p, i) => {
                const info = p.listingInformation || {};
                const img = p.imagesVideos?.propertyImages?.[0];
                const title =
                  info.listingInformationPropertyTitle?.[language] ||
                  info.listingInformationPropertyTitle?.en ||
                  "—";
                const type =
                  info.listingInformationTransactionType?.[language] ||
                  info.listingInformationTransactionType?.en ||
                  "—";
                const propertyType =
                  info.listingInformationAvailabilityStatus?.[language] ||
                  info.listingInformationAvailabilityStatus?.en ||
                  "—";

                return (
                  <tr
                    key={p._id || i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={img || commonimg}
                        alt="Property"
                        className="w-14 h-14 rounded-lg object-cover"
                        onError={(e) => (e.target.src = commonimg)}
                      />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {t.propertyCode}: {info.listingInformationPropertyId || "—"}
                        </p>
                        <p className="text-gray-900 font-semibold">{title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{type}</td>
                    <td className="px-6 py-4">
                      {info.listingInformationBlockName?.[language] ||
                        info.listingInformationBlockName?.en ||
                        "—"}
                    </td>
                    <td className="px-6 py-4">{propertyType}</td>

                    {/* ✅ Updated Status Display */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${p.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-200 text-gray-700"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${p.status === "Published"
                              ? "bg-green-600"
                              : p.status === "Draft"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                              }`}
                          ></span>
                          {/* ✅ Localized Status Label */}
                          {p.status === "Published"
                            ? language === "vi"
                              ? "Đã đăng"
                              : "Published"
                            : p.status === "Draft"
                              ? language === "vi"
                                ? "Bản nháp"
                                : "Draft"
                              : p.status || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button style={{
                        justifyItems: "anchor-center"
                      }} className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button style={{
                        justifyItems: "anchor-center"
                      }} className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button style={{
                        justifyItems: "anchor-center"
                      }}
                        onClick={() => openEditProperty(p)}
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button style={{
                        justifyItems: "anchor-center"
                      }}
                        onClick={() => confirmDelete(p._id)}
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    {language === "vi"
                      ? "Không tìm thấy bất động sản"
                      : "No properties found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Pagination */}
      {!loading && totalRows > 0 && (
        <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50 mt-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>{t.rowsPerPage}:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border rounded-md text-gray-700 focus:outline-none px-2 py-1"
            >
              {[5, 10, 20, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p>
              {startIndex + 1}-{Math.min(endIndex, totalRows)} {t.of}{" "}
              {totalRows}
            </p>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-1 px-2 rounded ${currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              &lt;
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1 px-2 rounded ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                {language === "vi" ? "Xác nhận xóa" : "Confirm Deletion"}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              {language === "vi"
                ? "Bạn có chắc chắn muốn xóa bất động sản này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this property? This action cannot be undone."}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {language === "vi" ? "Hủy" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                {language === "vi" ? "Xóa" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ Skeleton Loader Component */
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-6 py-4 bg-white"
        >
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-18 h-14 bg-[#41398b29] rounded-lg" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3 bg-[#41398b29] rounded w-2/3" />
              <div className="h-3 bg-[#41398b29] rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-[#41398b29] rounded w-24" />
          <div className="h-3 bg-[#41398b29] rounded w-20" />
          <div className="h-3 bg-[#41398b29] rounded w-24" />
          <div className="h-6 bg-[#41398b29] rounded-full w-20" />
          <div className="flex gap-3">
            {[...Array(4)].map((__, j) => (
              <div key={j} className="w-10 h-10 bg-[#41398b29] rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
