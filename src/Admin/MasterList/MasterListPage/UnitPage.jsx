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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

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
      fetchUnits();
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
      fetchUnits();
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

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-white to-[#f3f2ff] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-all"
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
                className={`transition-all duration-300 px-2 py-1 rounded-full ${
                  tableLang === "EN" ? "bg-black text-white" : "text-gray-600"
                }`}
              >
                EN
              </span>
              <span
                className={`transition-all duration-300 px-2 py-1 rounded-full ${
                  tableLang === "VI" ? "bg-black text-white" : "text-gray-600"
                }`}
              >
                VI
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`transition-opacity ${
          loading ? "opacity-50" : "opacity-100"
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
                units.map((row, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {row.status}
                      </span>
                      {row.isDefault && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.948a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.948c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.285-3.948a1 1 0 00-.363-1.118L2.96 9.375c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.948z" />
                        </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 mr-2 text-yellow-500"
                              fill={row.isDefault ? "currentColor" : "none"}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.948a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.948c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.285-3.948a1 1 0 00-.363-1.118L2.96 9.375c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.948z"
                              />
                            </svg>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <div className="flex justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingUnit ? "Edit Unit" : "New Unit"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUnit(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveLang("EN")}
                className={`px-4 py-2 font-medium ${
                  activeLang === "EN"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setActiveLang("VI")}
                className={`px-4 py-2 font-medium ${
                  activeLang === "VI"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                Vietnamese
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              {activeLang === "EN" ? (
                <>
                  <input
                    type="text"
                    name="code_en"
                    placeholder="Code (EN)"
                    value={form.code_en}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    name="name_en"
                    placeholder="Unit Name (EN)"
                    value={form.name_en}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    name="symbol_en"
                    placeholder="Symbol (EN)"
                    value={form.symbol_en}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    name="code_vi"
                    placeholder="Mã (VI)"
                    value={form.code_vi}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    name="name_vi"
                    placeholder="Tên đơn vị (VI)"
                    value={form.name_vi}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    name="symbol_vi"
                    placeholder="Ký hiệu (VI)"
                    value={form.symbol_vi}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </>
              )}
            </div>

            <div className="flex justify-end mt-6 gap-3 border-t pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUnit(null);
                }}
                className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800"
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
