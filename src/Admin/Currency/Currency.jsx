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
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  markCurrencyAsDefault,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import CommonSkeleton from "../../Common/CommonSkeleton";

export default function Currency({ goBack }) {
  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [tableLang, setTableLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [currencyOptions, setCurrencyOptions] = useState([]); // 💰 new state for API currencies
  const [form, setForm] = useState({
    code_en: "",
    code_vi: "",
    name_en: "",
    name_vi: "",
    symbol_en: "",
    symbol_vi: "",
    status: "Active",
  });

  // ✅ Fetch stored currencies from backend
  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const res = await getAllCurrencies();
      setCurrencies(res.data.data || []);
    } catch (error) {
      console.error("Failed to load currencies", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch currency list from ExchangeRate API
  const fetchCurrencyList = async () => {
    try {
      const res = await fetch(
        "https://v6.exchangerate-api.com/v6/49143fe10e6464ddc9170966/codes"
      );
      const data = await res.json();
      if (data.supported_codes) {
        setCurrencyOptions(data.supported_codes);
      }
    } catch (err) {
      console.error("Failed to fetch currency codes", err);
      CommonToaster("Failed to fetch currency codes", "error");
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchCurrencyList(); // load currency options once
  }, []);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit
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

      if (editingCurrency) {
        await updateCurrency(editingCurrency._id, form);
        CommonToaster("Currency updated successfully", "success");
      } else {
        await createCurrency(form);
        CommonToaster("Currency added successfully", "success");
      }

      setShowModal(false);
      setEditingCurrency(null);
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        symbol_en: "",
        symbol_vi: "",
        status: "Active",
      });
      fetchCurrencies();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong";
      CommonToaster(message, "error");
    }
  };

  // ✅ Edit
  const handleEdit = (currency) => {
    setEditingCurrency(currency);
    setForm({
      code_en: currency.currencyCode.en,
      code_vi: currency.currencyCode.vi,
      name_en: currency.currencyName.en,
      name_vi: currency.currencyName.vi,
      symbol_en: currency.currencySymbol.en,
      symbol_vi: currency.currencySymbol.vi,
      status: currency.status,
    });
    setShowModal(true);
  };

  // ✅ Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
  const handleDelete = async () => {
    try {
      await deleteCurrency(deleteConfirm.id);
      CommonToaster("Currency deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchCurrencies();
    } catch {
      CommonToaster("Failed to delete currency", "error");
    }
  };

  // ✅ Toggle status
  const handleToggleStatus = async (currency) => {
    const newStatus = currency.status === "Active" ? "Inactive" : "Active";
    try {
      await updateCurrency(currency._id, { status: newStatus });
      CommonToaster(`Marked as ${newStatus}`, "success");
      fetchCurrencies();
    } catch {
      CommonToaster("Failed to update status", "error");
    }
  };

  // ✅ Mark as default
  const handleMarkDefault = async (id) => {
    try {
      await markCurrencyAsDefault(id);
      CommonToaster("Marked as default successfully", "success");
      fetchCurrencies();
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
          <h2 className="text-2xl font-semibold text-gray-900">
            Currency Master
          </h2>
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
            onClick={() => {
              setShowModal(true);
              setEditingCurrency(null);
              setForm({
                code_en: "",
                code_vi: "",
                name_en: "",
                name_vi: "",
                symbol_en: "",
                symbol_vi: "",
                status: "Active",
              });
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Currency
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <CommonSkeleton rows={6} />
      ) : (
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Code</th>
              <th className="px-6 py-3 font-medium">Currency Name</th>
              <th className="px-6 py-3 font-medium">Symbol</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No currencies found.
                </td>
              </tr>
            ) : (
              currencies.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-6 py-3">
                    {tableLang === "EN"
                      ? row.currencyCode.en
                      : row.currencyCode.vi}
                  </td>
                  <td className="px-6 py-3">
                    {tableLang === "EN"
                      ? row.currencyName.en
                      : row.currencyName.vi}
                  </td>
                  <td className="px-6 py-3">
                    {tableLang === "EN"
                      ? row.currencySymbol.en
                      : row.currencySymbol.vi}
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
                      <span className="text-yellow-500 text-xs font-medium">
                        ⭐
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
                          ⭐ Mark as Default
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

      {/* ✅ Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-lg relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCurrency ? "Edit Currency" : "New Currency"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b px-6">
              <button
                onClick={() => setActiveLang("EN")}
                className={`py-3 px-4 font-medium text-sm ${
                  activeLang === "EN"
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500"
                }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setActiveLang("VI")}
                className={`py-3 px-4 font-medium text-sm ${
                  activeLang === "VI"
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500"
                }`}
              >
                Tiếng Việt (VI)
              </button>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-5 space-y-5">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name={`code_${activeLang.toLowerCase()}`}
                  value={form[`code_${activeLang.toLowerCase()}`]}
                  onChange={handleChange}
                  placeholder="Type here"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* ✅ Currency Name and Code (Stores full text like “Indian Rupee (INR)”) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Name and Code <span className="text-red-500">*</span>
                </label>
                <select
                  name={`name_${activeLang.toLowerCase()}`}
                  value={form[`name_${activeLang.toLowerCase()}`]}
                  onChange={(e) => {
                    const selectedText = e.target.value;
                    const match = currencyOptions.find(
                      ([code, name]) => `${name} (${code})` === selectedText
                    );

                    if (match) {
                      const [code, name] = match;
                      setForm((prev) => ({
                        ...prev,
                        [`name_${activeLang.toLowerCase()}`]: `${name} (${code})`,
                        [`code_${activeLang.toLowerCase()}`]: code,
                      }));
                    } else {
                      handleChange(e);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select</option>
                  {currencyOptions.map(([code, name]) => {
                    const displayValue = `${name} (${code})`;
                    return (
                      <option key={code} value={displayValue}>
                        {displayValue}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Symbol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name={`symbol_${activeLang.toLowerCase()}`}
                  value={form[`symbol_${activeLang.toLowerCase()}`]}
                  onChange={handleChange}
                  placeholder="Type here"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border border-gray-400 rounded-full text-gray-800 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 font-medium"
              >
                {editingCurrency ? "Update" : "Add"}
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
              Are you sure you want to delete this currency?
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
