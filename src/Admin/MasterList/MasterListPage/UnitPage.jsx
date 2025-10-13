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
  Star,
} from "lucide-react";
import {
  createUnit,
  deleteUnit,
  updateUnit,
  getAllUnits,
  markUnitAsDefault,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";

export default function UnitPage({ goBack }) {
  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [tableLang, setTableLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // ✅ Pagination State
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    code_en: "",
    code_vi: "",
    name_en: "",
    name_vi: "",
    symbol_en: "",
    symbol_vi: "",
    status: "Active",
  });

  // ✅ Fetch all Units
  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await getAllUnits();
      setUnits(res.data.data || []);
    } catch (error) {
      console.error("Failed to load units", error);
      CommonToaster("Failed to load units", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Derived pagination values
  const totalRows = units.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = units.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (totalRows === 0) setCurrentPage(1);
  }, [totalRows, totalPages, currentPage]);

  // ✅ Handle form change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add / Edit
  const handleSubmit = async () => {
    try {
      const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi } = form;
      if (
        !code_en ||
        !code_vi ||
        !name_en ||
        !name_vi ||
        !symbol_en ||
        !symbol_vi
      ) {
        CommonToaster("Please fill all English and Vietnamese fields", "error");
        return;
      }

      if (editingUnit) {
        await updateUnit(editingUnit._id, form);
        CommonToaster("Unit updated successfully", "success");
      } else {
        await createUnit(form);
        CommonToaster("Unit added successfully", "success");
      }

      setShowModal(false);
      setEditingUnit(null);
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        symbol_en: "",
        symbol_vi: "",
        status: "Active",
      });
      await fetchUnits();
      setCurrentPage(1);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong";
      CommonToaster(message, "error");
    }
  };

  // ✅ Edit
  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setForm({
      code_en: unit.code.en,
      code_vi: unit.code.vi,
      name_en: unit.name.en,
      name_vi: unit.name.vi,
      symbol_en: unit.symbol.en,
      symbol_vi: unit.symbol.vi,
      status: unit.status,
    });
    setShowModal(true);
  };

  // ✅ Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
  const handleDelete = async () => {
    try {
      await deleteUnit(deleteConfirm.id);
      CommonToaster("Unit deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      await fetchUnits();
      if (
        (currentPage - 1) * rowsPerPage >= units.length - 1 &&
        currentPage > 1
      ) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    } catch {
      CommonToaster("Failed to delete unit", "error");
    }
  };

  // ✅ Toggle Status
  const handleToggleStatus = async (unit) => {
    const newStatus = unit.status === "Active" ? "Inactive" : "Active";
    try {
      await updateUnit(unit._id, { status: newStatus });
      CommonToaster(`Marked as ${newStatus}`, "success");
      fetchUnits();
    } catch {
      CommonToaster("Failed to update status", "error");
    }
  };

  const handleMarkDefault = async (id) => {
    try {
      await markUnitAsDefault(id);
      CommonToaster("Marked as default successfully", "success");
      fetchUnits();
    } catch {
      CommonToaster("Failed to mark as default", "error");
    }
  };

  // Pagination handlers
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
          <h2 className="text-2xl font-semibold text-gray-900">New Unit</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-600" />
            <div
              onClick={() =>
                setTableLang((prev) => (prev === "EN" ? "VI" : "EN"))
              }
              className="cursor-pointer flex items-center bg-gray-200 rounded-full px-2 py-1 text-xs font-medium"
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
            Add Unit
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"
          }`}
      >
        {loading ? (
          <CommonSkeleton rows={6} />
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Unit Name</th>
                <th className="px-6 py-3 font-medium">Symbol</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No units found.
                  </td>
                </tr>
              ) : (
                visibleData.map((row, i) => (
                  <tr
                    key={row._id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-3">
                      {tableLang === "EN" ? row.code.en : row.code.vi}
                    </td>
                    <td className="px-6 py-3">
                      {tableLang === "EN" ? row.name.en : row.name.vi}
                    </td>
                    <td className="px-6 py-3">
                      {tableLang === "EN" ? row.symbol.en : row.symbol.vi}
                    </td>
                    <td className="px-6 py-3 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                          }`}
                      >
                        {row.status}
                      </span>
                      {row.isDefault && (
                        <span className="text-white bg-yellow-400 w-8 h-8 grid place-content-center text-2xl rounded-full font-medium">
                          <Star className=" " />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        onClick={() =>
                          setOpenMenuIndex(openMenuIndex === i ? null : i)
                        }
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>

                      {openMenuIndex === i && (
                        <div className="absolute right-8 top-10 bg-white border rounded-lg shadow-lg z-50 w-44 py-2">
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleEdit(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleToggleStatus(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {row.status === "Active"
                              ? "Mark as Inactive"
                              : "Mark as Active"}
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleMarkDefault(row._id);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Mark as Default
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              confirmDelete(row._id);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Pagination Bar */}
      <div className="flex justify-end items-center px-6 py-3 bg-white rounded-b-2xl text-sm text-gray-700 mt-4">
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
      {/* ✅ Add/Edit Modal (Styled like others) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingUnit ? "Edit Unit" : "New Unit"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUnit(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
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

            {/* Form Inputs */}
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
                      Unit Name<span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Symbol<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="symbol_en"
                      placeholder="Type here"
                      value={form.symbol_en}
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
                      Tên đơn vị<span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ký hiệu<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="symbol_vi"
                      placeholder="Type here"
                      value={form.symbol_vi}
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
                  setEditingUnit(null);
                }}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white transition cursor-pointer"
              >
                {editingUnit ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this Unit?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
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
    </div>
  );
}
