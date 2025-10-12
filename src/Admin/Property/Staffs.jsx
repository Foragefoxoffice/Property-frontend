import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getAllStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";

const colors = ["#E8E6FF", "#E0FFF9", "#FFECEC", "#E6F5FF"];

export default function Staffs() {
  const [staffs, setStaffs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activeLang, setActiveLang] = useState("EN");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [form, setForm] = useState({
    staffsImage: "",
    staffsName_en: "",
    staffsName_vi: "",
    staffsId: "",
    staffsRole_en: "",
    staffsRole_vi: "",
    staffsNumber: "",
    staffsNotes_en: "",
    staffsNotes_vi: "",
  });

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await getAllStaffs();
      setStaffs(res.data.data || []);
    } catch {
      CommonToaster("Failed to fetch staffs", "error");
    }
  };

  const handleChange = (lang, field, value) => {
    setForm((prev) => ({
      ...prev,
      [`${field}_${lang.toLowerCase()}`]: value,
    }));
  };

  const handleBaseChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setForm((prev) => ({ ...prev, staffsImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Open Add/Edit modal
  const openModal = (staff = null) => {
    if (staff) {
      setEditMode(true);
      setEditingStaff(staff);

      const filledForm = {
        staffsImage: staff.staffsImage || "",
        staffsName_en: staff.staffsName?.en || "",
        staffsName_vi: staff.staffsName?.vi || "",
        staffsId: staff.staffsId || "",
        staffsRole_en: staff.staffsRole?.en || "",
        staffsRole_vi: staff.staffsRole?.vi || "",
        staffsNumber: staff.staffsNumber || "",
        staffsNotes_en: staff.staffsNotes?.en || "",
        staffsNotes_vi: staff.staffsNotes?.vi || "",
      };

      setForm(filledForm);
      setPhotoPreview(staff.staffsImage || null);

      setTimeout(() => setShowModal(true), 50);
    } else {
      setEditMode(false);
      setEditingStaff(null);
      setForm({
        staffsImage: "",
        staffsName_en: "",
        staffsName_vi: "",
        staffsId: "",
        staffsRole_en: "",
        staffsRole_vi: "",
        staffsNumber: "",
        staffsNotes_en: "",
        staffsNotes_vi: "",
      });
      setPhotoPreview(null);
      setShowModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      staffsName_en: form.staffsName_en?.trim() || "",
      staffsName_vi: form.staffsName_vi?.trim() || "",
      staffsRole_en: form.staffsRole_en?.trim() || "",
      staffsRole_vi: form.staffsRole_vi?.trim() || "",
    };

    try {
      if (editMode && editingStaff?._id) {
        await updateStaff(editingStaff._id, payload);
        CommonToaster("Staff updated successfully", "success");
      } else {
        await createStaff(payload);
        CommonToaster("Staff added successfully", "success");
      }
      setShowModal(false);
      fetchStaffs();
    } catch {
      CommonToaster("Error saving staff", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteConfirm.id);
      CommonToaster("Staff deleted successfully", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchStaffs();
    } catch {
      CommonToaster("Error deleting staff", "error");
    }
  };

  // ✅ Safe and language-aware search
  const filtered = staffs.filter((s) => {
    const name =
      activeLang === "VI" ? s?.staffsName?.vi || "" : s?.staffsName?.en || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f3f6] px-10 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Staffs</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 shadow-md"
        >
          <Plus size={18} /> New Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white"
        />
      </div>

      {/* Staff Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((staff, i) => (
          <div
            key={staff._id}
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: colors[i % colors.length] }}
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  staff.staffsImage ||
                  "https://via.placeholder.com/60x60.png?text=👤"
                }
                alt={staff.staffsName?.en}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {staff.staffsName?.en}
                </h3>
                <p className="text-sm text-gray-600">ID: {staff.staffsId}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-700">
              <p>
                <span className="font-medium">Role:</span>{" "}
                {staff.staffsRole?.en}
              </p>
              <p className="mt-1">📞 {staff.staffsNumber}</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => openModal(staff)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <Edit2 size={16} className="text-blue-500" />
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: true, id: staff._id })}
                className="p-2 rounded-full hover:bg-red-50"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-lg relative">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold">
                {editMode ? "Edit Staff" : "Add Staff"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} className="text-gray-500 hover:text-black" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b mb-4">
              {["EN", "VI"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeLang === lang
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500"
                  }`}
                >
                  {lang === "EN" ? "English" : "Tiếng Việt"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Upload Image */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border border-dashed flex items-center justify-center text-gray-400">
                      <Upload size={22} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Click to {photoPreview ? "change" : "upload"} image
                </p>
              </div>

              {["staffsName", "staffsRole", "staffsNotes"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={`${field.replace("staffs", "")} (${activeLang})`}
                  value={form[`${field}_${activeLang.toLowerCase()}`] || ""}
                  onChange={(e) =>
                    handleChange(activeLang, field, e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                />
              ))}

              <input
                type="text"
                name="staffsId"
                placeholder="Staff ID"
                value={form.staffsId}
                onChange={handleBaseChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
              />
              <input
                type="text"
                name="staffsNumber"
                placeholder="Phone Number"
                value={form.staffsNumber}
                onChange={handleBaseChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
              />

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-full hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                  {editMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (same as Owners) */}
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
              Are you sure you want to delete this staff? This action cannot be
              undone.
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
    </div>
  );
}
