import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Pencil,
  Share2,
  X,
} from "lucide-react";
import {
  getAllPropertyListings,
  deletePropertyListing,
  permanentlyDeleteProperty,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useNavigate } from "react-router-dom";
import { Dropdown, Menu } from "antd";
import { MoreVertical } from "lucide-react";
import FiltersPage from "../Filters/Filter";

export default function ManageProperty({
  openCreateProperty,
  openEditProperty,
  onViewProperty,
  filterByTransactionType,
  trashMode = false,
}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

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
    let list = properties;
    // ⭐ Filter by selected tab (Lease / Sale / Home Stay)
    list = list.filter((p) => {
      const type =
        p.listingInformation?.listingInformationTransactionType?.[language] ||
        p.listingInformation?.listingInformationTransactionType?.en ||
        "";

      return type.toLowerCase().trim() === filterByTransactionType.toLowerCase().trim();
    });

    if (appliedFilters) {

      const f = appliedFilters;

      list = list.filter((property) => {

        const info = property.listingInformation || {};
        const pi = property.propertyInformation || {};

        // Helper -> match any EN/VI text object
        const matchTextObj = (apiObj, filterObj) => {
          if (!filterObj || !filterObj.name) return true;
          if (!apiObj) return false;

          const apiEn = apiObj.en?.toLowerCase() || "";
          const apiVi = apiObj.vi?.toLowerCase() || "";
          const filterName = filterObj.name.toLowerCase();

          return apiEn.includes(filterName) || apiVi.includes(filterName);
        };

        // Helper -> match numeric ranges
        const matchNumber = (apiValue, filterValue) => {
          if (!filterValue) return true;
          return Number(apiValue) === Number(filterValue);
        };

        // PROJECT
        if (!matchTextObj(info.listingInformationProjectCommunity, f.projectId))
          return false;

        // ZONE
        if (!matchTextObj(info.listingInformationZoneSubArea, f.zoneId))
          return false;

        // BLOCK
        if (!matchTextObj(info.listingInformationBlockName, f.blockId))
          return false;

        // PROPERTY TYPE
        if (!matchTextObj(info.listingInformationPropertyType, f.propertyType))
          return false;

        // PROPERTY NUMBER (simple text)
        if (
          f.propertyNumber &&
          !(
            info.listingInformationPropertyNo?.en?.toLowerCase().includes(f.propertyNumber.toLowerCase()) ||
            info.listingInformationPropertyNo?.vi?.toLowerCase().includes(f.propertyNumber.toLowerCase())
          )
        )
          return false;

        // FLOOR RANGE
        if (!matchTextObj(pi.informationFloors, f.floorRange))
          return false;

        // CURRENCY
        if (
          f.currency &&
          f.currency.name &&
          info.financialDetailsCurrency?.toLowerCase() !== f.currency.name.toLowerCase()
        )
          return false;

        // PRICE RANGE
        const price = Number(info.financialDetailsPrice) || 0;

        if (f.priceFrom && price < Number(f.priceFrom)) return false;
        if (f.priceTo && price > Number(f.priceTo)) return false;

        return true;
      });
    }

    // Trash + Search
    list = list.filter((p) => {
      if (trashMode && p.status !== "Archived") return false;
      if (!trashMode && p.status === "Archived") return false;

      const title =
        p.listingInformation?.listingInformationPropertyTitle?.[language] ||
        p.listingInformation?.listingInformationPropertyTitle?.en ||
        "";

      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return list;
  }, [properties, appliedFilters, searchTerm, language, filterByTransactionType]);



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
      if (trashMode) {
        // 🔥 Permanent delete
        await permanentlyDeleteProperty(deleteConfirm.id);

        CommonToaster(
          language === "vi"
            ? "Đã xóa vĩnh viễn bất động sản"
            : "Property permanently deleted",
          "success"
        );
      } else {
        // 🗑️ Move to trash
        await deletePropertyListing(deleteConfirm.id);

        CommonToaster(
          language === "vi"
            ? "Đã chuyển vào thùng rác"
            : "Moved to trash",
          "success"
        );
      }

      // ✅ Remove from UI
      setProperties((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
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
        <h1 className="text-3xl font-semibold text-gray-900">
          {filterByTransactionType === "Lease"
            ? t.propertyTitleLease
            : filterByTransactionType === "Sale"
              ? t.propertyTitleSale
              : filterByTransactionType === "Home Stay"
                ? t.propertyTitleHomeStay
                : ""}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilterPopup(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {t.filter}
          </button>

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
          className="w-full pl-10 pr-4 py-3 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white"
        />
      </div>

      {/* ACTIVE FILTER BADGES + CLEAR BUTTON */}
      {appliedFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4">

          {/* BADGES */}
          {Object.entries(appliedFilters).map(([key, val]) =>
            val && (typeof val === "string" ? val : val?.name) ? (
              <span
                key={key}
                className="bg-[#41398B] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {key}: {typeof val === "string" ? val : val?.name}

                <button
                  onClick={() =>
                    setAppliedFilters((prev) => ({ ...prev, [key]: "" }))
                  }
                  className="text-white ml-1 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null
          )}

          {/* CLEAR ALL */}
          <button
            onClick={() => setAppliedFilters(null)}
            className="ml-2 text-sm underline text-red-600 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}


      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#EAE9EE] text-gray-600 text-left h-18">
              <tr>
                <th className="px-6 py-3 font-medium text-[#111111]">
                  {t.propertyId}
                </th>
                <th className="px-6 py-3 font-medium text-[#111111]">
                  {t.propertyNo}
                </th>
                <th className="px-6 py-3 font-medium text-[#111111]">
                  {t.propertyType}
                </th>
                <th className="px-6 py-3 font-medium text-[#111111]">
                  {t.availabilitystatus}
                </th>
                <th className="px-6 py-3 font-medium text-[#111111]">
                  {t.publishTheWebsite}
                </th>
                <th className="px-6 py-3 font-medium text-[#111111] text-right"></th>
              </tr>
            </thead>

            <tbody>
              {currentRows.map((p, i) => {
                const info = p.listingInformation || {};
                const transactionType =
                  info.listingInformationTransactionType?.[language] ||
                  info.listingInformationTransactionType?.en ||
                  "—";
                const propertyType =
                  info.listingInformationPropertyType?.[language] ||
                  info.listingInformationPropertyType?.en ||
                  "—";
                const propertyNo =
                  info.listingInformationPropertyNo?.[language] ||
                  info.listingInformationPropertyNo?.en ||
                  "—";
                const blockName =
                  info.listingInformationBlockName?.[language] ||
                  info.listingInformationBlockName?.en ||
                  "—";

                return (
                  <tr
                    key={p._id || i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                  >
                    {/* 🏠 Property Image + Info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {info.listingInformationPropertyId || "—"}
                        </p>
                      </div>
                    </td>

                    {/* 🔹 Transaction Type */}
                    <td className="px-6 py-6 capitalize">{propertyNo}</td>

                    {/* 🔹 Property Type */}
                    <td className="px-6 py-4">{propertyType}</td>

                    {/* 🔹 Block Name */}
                    <td className="px-6 py-4">{blockName}</td>

                    {/* 🔹 Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-6 py-1.5 rounded-full text-sm font-medium ${p.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Draft"
                              ? "bg-[#FFF3DE] text-[#FFA600]"
                              : "bg-gray-200 text-gray-700"
                            }`}
                        >
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

                    {/* 🔹 Actions */}
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        style={{ justifyItems: "anchor-center" }}
                        onClick={() =>
                          navigate(`/property-showcase/${p?.listingInformation?.listingInformationPropertyId}`)
                        }
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>

                      <button
                        onClick={() => openEditProperty(p)}
                        style={{ justifyItems: "anchor-center" }}
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer"
                      >
                        <Pencil color="#1d47ffff" className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        style={{ justifyItems: "anchor-center" }}
                        onClick={() => confirmDelete(p._id)}
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                      <Dropdown
                        trigger={["click"]}
                        menu={{
                          items: [
                            { key: "1", label: "Dummy Option 1" },
                            { key: "2", label: "Dummy Option 2" },
                            { key: "3", label: "Dummy Option 3" },
                          ],
                        }}
                        placement="bottomRight"
                      >
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer flex items-center justify-center"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </Dropdown>

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
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">

            {/* ✅ Title */}
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-black-800">
                {trashMode
                  ? (language === "vi" ? "Bạn có chắc chắn tuyệt đối không?" : "Are you absolutely sure?")
                  : (language === "vi" ? "Chuyển vào thùng rác?" : "Move to Trash?")}
              </h3>
            </div>

            {/* ✅ Description */}
            <p className="text-gray-600 text-sm mb-6">
              {trashMode
                ? (
                  language === "vi"
                    ? "Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn tài khoản của bạn và xóa dữ liệu khỏi máy chủ của chúng tôi."
                    : "This action cannot be undone. This will permanently delete your account and remove your data from our servers."
                )
                : (
                  language === "vi"
                    ? "Bất động sản sẽ được chuyển vào thùng rác và có thể khôi phục lại sau này."
                    : "This property will be moved to trash and can be restored later."
                )}
            </p>

            {/* ✅ Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {language === "vi" ? "Hủy" : "Cancel"}
              </button>

              <button
                onClick={handleDelete}
                className={`px-6 py-2 rounded-full text-white 
            ${trashMode ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {trashMode
                  ? (language === "vi" ? "Xóa vĩnh viễn" : "Delete Permanently")
                  : (language === "vi" ? "Chuyển vào thùng rác" : "Move to Trash")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl p-6 overflow-y-auto max-h-[90vh]">

            {/* CLOSE BUTTON */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowFilterPopup(false)}
                className="px-4 py-1 rounded-full cursor-pointer"
              >
                <X />
              </button>
            </div>

            <FiltersPage
              defaultFilters={appliedFilters}
              onApply={(data) => {
                setAppliedFilters(data);
                setShowFilterPopup(false);
                setCurrentPage(1);
              }}
            />
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
