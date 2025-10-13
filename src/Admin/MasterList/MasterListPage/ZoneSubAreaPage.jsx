import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  X,
  Pencil,
  Eye,
  Trash2,
  AlertTriangle,
  Languages,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import {
  createZoneSubArea,
  deleteZoneSubArea,
  updateZoneSubArea,
  getAllZoneSubAreas,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";

export default function ZoneSubAreaPage({ goBack }) {
  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [tableLang, setTableLang] = useState("EN");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    code_en: "",
    code_vi: "",
    name_en: "",
    name_vi: "",
    status: "Active",
  });

  // ✅ Fetch all Zone/Sub-areas
  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await getAllZoneSubAreas();
      setZones(res.data.data || []);
    } catch (error) {
      console.error("Failed to load Zone/Sub-area", error);
      CommonToaster("Failed to load Zone/Sub-area", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Derived pagination values
  const totalRows = zones.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = zones.slice(startIndex, endIndex);

  // Ensure currentPage is valid if rows or rowsPerPage change
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (totalRows === 0) setCurrentPage(1);
  }, [totalRows, totalPages, currentPage]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add / Edit (with validation + duplicate check)
  const handleSubmit = async () => {
    try {
      if (
        !form.code_en.trim() ||
        !form.code_vi.trim() ||
        !form.name_en.trim() ||
        !form.name_vi.trim()
      ) {
        CommonToaster("Please fill all English and Vietnamese fields", "error");
        return;
      }

      if (editingZone) {
        await updateZoneSubArea(editingZone._id, form);
        CommonToaster("Zone/Sub-area updated successfully", "success");
      } else {
        await createZoneSubArea(form);
        CommonToaster("Zone/Sub-area added successfully", "success");
      }

      setShowModal(false);
      setEditingZone(null);
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        status: "Active",
      });
      // Refresh and reset to first page so user sees newly added item
      await fetchZones();
      setCurrentPage(1);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";
      if (message.toLowerCase().includes("already exists")) {
        CommonToaster("Zone/Sub-area code already exists", "error");
      } else {
        CommonToaster(message, "error");
      }
    }
  };

  // ✅ Edit
  const handleEdit = (zone) => {
    setEditingZone(zone);
    setForm({
      code_en: zone.code.en,
      code_vi: zone.code.vi,
      name_en: zone.name.en,
      name_vi: zone.name.vi,
      status: zone.status,
    });
    setShowModal(true);
  };

  // ✅ Delete (with confirmation modal)
  const confirmDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleDelete = async () => {
    try {
      await deleteZoneSubArea(deleteConfirm.id);
      CommonToaster("Zone/Sub-area deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      // Refresh after delete. If last item on last page deleted, move page back.
      await fetchZones();
      if (
        (currentPage - 1) * rowsPerPage >= zones.length - 1 &&
        currentPage > 1
      ) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    } catch (err) {
      CommonToaster("Failed to delete Zone/Sub-area", "error");
    }
  };

  // ✅ Toggle Status
  const handleToggleStatus = async (zone) => {
    const newStatus = zone.status === "Active" ? "Inactive" : "Active";
    try {
      await updateZoneSubArea(zone._id, { status: newStatus });
      CommonToaster(`Zone/Sub-area marked as ${newStatus}`, "success");
      fetchZones();
    } catch (err) {
      CommonToaster("Failed to update status", "error");
    }
  };

  // Pagination controls
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-white to-[#f3f2ff] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            Zone / Sub-area
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-600" />
            <div
              onClick={() =>
                setTableLang((prev) => (prev === "EN" ? "VI" : "EN"))
              }
              className={`cursor-pointer flex items-center bg-gray-200 rounded-full px-2 py-1 text-xs font-medium`}
            >
              <span
                className={`transition-all duration-300 px-2 py-1 rounded-full ${tableLang === "EN" ? "bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white" : "text-gray-600"
                  }`}
              >
                EN
              </span>
              <span
                className={`transition-all duration-300 px-2 py-1 rounded-full ${tableLang === "VI" ? "bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white" : "text-gray-600"
                  }`}
              >
                VI
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white px-4 py-2 rounded-full transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Zone / Sub-area
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"
          }`}
      >
        {loading ? (
          <CommonSkeleton rows={6} />
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">
                  {tableLang === "EN" ? "Code (EN)" : "Mã (VI)"}
                </th>
                <th className="px-6 py-3 font-medium">
                  {tableLang === "EN"
                    ? "Zone / Sub-area (EN)"
                    : "Khu vực / Tiểu khu (VI)"}
                </th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No Zone/Sub-area found.
                  </td>
                </tr>
              ) : (
                visibleData.map((row, i) => {
                  // compute absolute index if needed
                  const absoluteIndex = startIndex + i;
                  return (
                    <tr
                      key={row._id}
                      className={`${absoluteIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition relative`}
                    >
                      <td className="px-6 py-3">
                        {tableLang === "EN" ? row.code.en : row.code.vi}
                      </td>
                      <td className="px-6 py-3">
                        {tableLang === "EN" ? row.name.en : row.name.vi}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right relative">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === row._id ? null : row._id
                            )
                          }
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {openMenuId === row._id && (
                          <div className="absolute right-8 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44 py-2">
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                handleEdit(row);
                                setOpenMenuId(null);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                handleToggleStatus(row);
                                setOpenMenuId(null);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {row.status === "Active"
                                ? "Mark as Inactive"
                                : "Mark as Active"}
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => {
                                confirmDelete(row._id);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="flex justify-end items-center px-6 py-3 bg-white rounded-b-2xl text-sm text-gray-700">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:outline-none cursor-pointer"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <span>
            {totalRows === 0
              ? "0–0 of 0"
              : `${startIndex + 1}–${endIndex} of ${totalRows}`}
          </span>

          <div className="flex items-center gap-2 text-gray-700">
            <button
              onClick={goToFirst}
              disabled={currentPage === 1}
              className={`p-1 rounded cursor-pointer ${currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className={`p-1 rounded cursor-pointer ${currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages || totalRows === 0}
              className={`p-1 rounded cursor-pointer ${currentPage === totalPages || totalRows === 0
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={goToLast}
              disabled={currentPage === totalPages || totalRows === 0}
              className={`p-1 rounded cursor-pointer ${currentPage === totalPages || totalRows === 0
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this Zone/Sub-area? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Styled + Correct Labels for Zone/Sub-area) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingZone ? "Edit Zone / Sub-area" : "New Zone / Sub-area"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingZone(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex justify-start gap-8 px-6">
              <button
                onClick={() => setActiveLang("EN")}
                className={`py-3 font-medium transition-all ${activeLang === "EN"
                  ? "text-black border-b-2 border-[#41398B]"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setActiveLang("VI")}
                className={`py-3 font-medium transition-all ${activeLang === "VI"
                  ? "text-black border-b-2 border-[#41398B]"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                Tiếng Việt (VI)
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {activeLang === "EN" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code_en"
                      placeholder="Type here"
                      value={form.code_en}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zone / Sub-area<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      placeholder="Type here"
                      value={form.name_en}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code_vi"
                      placeholder="Type here"
                      value={form.code_vi}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khu vực / Tiểu khu<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_vi"
                      placeholder="Type here"
                      value={form.name_vi}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end items-center gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingZone(null);
                }}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full text-white bg-[#41398B] hover:bg-[#41398be3] cursor-pointer transition cursor-pointer"
              >
                {editingZone ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
