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
  createDeposit,
  deleteDeposit,
  updateDeposit,
  getAllDeposits,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";

export default function DepositPage({ goBack }) {
  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [tableLang, setTableLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [form, setForm] = useState({
    code_en: "",
    code_vi: "",
    name_en: "",
    name_vi: "",
    status: "Active",
  });

  // ✅ Fetch all Deposits
  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await getAllDeposits();
      setDeposits(res.data.data || []);
    } catch (error) {
      console.error("Failed to load Deposits", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add / Edit
  const handleSubmit = async () => {
    try {
      if (!form.code_en || !form.code_vi || !form.name_en || !form.name_vi) {
        CommonToaster("Please fill all English and Vietnamese fields", "error");
        return;
      }

      if (editingDeposit) {
        await updateDeposit(editingDeposit._id, form);
        CommonToaster("Deposit updated successfully", "success");
      } else {
        await createDeposit(form);
        CommonToaster("Deposit added successfully", "success");
      }

      setShowModal(false);
      setEditingDeposit(null);
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        status: "Active",
      });
      fetchDeposits();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong";
      CommonToaster(message, "error");
    }
  };

  // ✅ Edit
  const handleEdit = (deposit) => {
    setEditingDeposit(deposit);
    setForm({
      code_en: deposit.code.en,
      code_vi: deposit.code.vi,
      name_en: deposit.name.en,
      name_vi: deposit.name.vi,
      status: deposit.status,
    });
    setShowModal(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });

  const handleDelete = async () => {
    try {
      await deleteDeposit(deleteConfirm.id);
      CommonToaster("Deposit deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchDeposits();
    } catch {
      CommonToaster("Failed to delete Deposit", "error");
    }
  };

  // ✅ Toggle Status
  const handleToggleStatus = async (deposit) => {
    const newStatus = deposit.status === "Active" ? "Inactive" : "Active";
    try {
      await updateDeposit(deposit._id, { status: newStatus });
      CommonToaster(`Marked as ${newStatus}`, "success");
      fetchDeposits();
    } catch {
      CommonToaster("Failed to update status", "error");
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
          <h2 className="text-2xl font-semibold text-gray-900">Deposit</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
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
            Add Deposit
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className={`transition-opacity duration-300 ${
          loading ? "opacity-50" : "opacity-100"
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
                    ? "Deposit Name (EN)"
                    : "Tên đặt cọc (VI)"}
                </th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No Deposit records found.
                  </td>
                </tr>
              ) : (
                deposits.map((row, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "Active"
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
                          setOpenMenuIndex(openMenuIndex === i ? null : i)
                        }
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>

                      {openMenuIndex === i && (
                        <div className="absolute right-8 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44 py-2">
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

      {/* ✅ Delete Confirmation Modal */}
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
              Are you sure you want to delete this Deposit? This action cannot
              be undone.
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

      {/* ✅ Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingDeposit ? "Edit Deposit" : "New Deposit"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDeposit(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveLang("EN")}
                className={`px-4 py-2 font-medium transition-all ${
                  activeLang === "EN"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setActiveLang("VI")}
                className={`px-4 py-2 font-medium transition-all ${
                  activeLang === "VI"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Tiếng Việt (VI)
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {activeLang === "EN" ? (
                <>
                  <input
                    type="text"
                    name="code_en"
                    placeholder="Code (English)"
                    value={form.code_en}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    name="name_en"
                    placeholder="Deposit Name (English)"
                    value={form.name_en}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    name="code_vi"
                    placeholder="Mã (Vietnamese)"
                    value={form.code_vi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    name="name_vi"
                    placeholder="Tên đặt cọc (Vietnamese)"
                    value={form.name_vi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </>
              )}
            </div>

            <div className="flex justify-end mt-6 gap-3 border-t pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDeposit(null);
                }}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800"
              >
                {editingDeposit ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
