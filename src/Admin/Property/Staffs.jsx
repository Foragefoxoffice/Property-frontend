import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertTriangle,
  MoveHorizontal,
  Phone,
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
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    staffsImage: "",
    staffsName_en: "",
    staffsName_vi: "",
    staffsId: "",
    staffsRole_en: "",
    staffsRole_vi: "",
    staffsNumber: "",
    staffsEmail: "", // ✅ added
    staffsNotes_en: "",
    staffsNotes_vi: "",
  });

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await getAllStaffs();
      setStaffs(res.data.data || []);
    } catch {
      CommonToaster("Failed to fetch staffs", "error");
    } finally {
      setLoading(false);
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

  const openModal = (staff = null) => {
    if (staff) {
      setEditMode(true);
      setEditingStaff(staff);
      const filledForm = {
        staffsImage: staff.staffsImage || "",
        staffsName_en: staff.staffsName?.en || "",
        staffsName_vi: staff.staffsName?.vi || "",
        staffsId: staff.staffsId || "",
        staffsEmail: staff.staffsEmail || "", // ✅ include
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
        staffsEmail: "",
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
      staffsEmail: form.staffsEmail?.trim() || "",
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

  const filtered = staffs.filter((s) => {
    const name =
      activeLang === "VI" ? s?.staffsName?.vi || "" : s?.staffsName?.en || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  /* Skeleton Loader */
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl p-5 shadow-sm bg-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-10 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Staffs</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 shadow-md"
        >
          <Plus size={18} /> New Staff
        </button>
      </div>

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

      {/* Staff Cards or Empty State */}
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all">
  {loading ? (
    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
  ) : filtered.length > 0 ? (
    filtered.map((staff, i) => (
      <div
        key={staff._id}
        className="relative rounded-2xl p-5 shadow-sm"
        style={{ background: colors[i % colors.length] }}
      >
        {/* Top Right Double Arrow */}
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/40 transition border border-gray-400 cursor-pointer"
          onClick={() => console.log('Double arrow clicked:', staff._id)}
        >
          <MoveHorizontal size={18} className="text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src={staff.staffsImage || 'image/dummy-img.png'}
            alt={staff.staffsName?.en}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">
              {staff.staffsName?.en}
            </h3>
            <p className="text-sm text-gray-600">ID: {staff.staffsId}</p>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 mt-8">
          <div className="mt-4 text-sm text-gray-700">
            <p>
              <span className="font-medium">Role:</span>{' '}
              {staff.staffsRole?.en}
            </p>
            <p className="mt-1 flex items-center gap-1">
              <Phone size={16} /> {staff.staffsNumber}
            </p>
          </div>
          <div>
            <button
              onClick={() => openModal(staff)}
              className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <Edit2 size={16} className="text-blue-500" />
            </button>
            <button
              onClick={() =>
                setDeleteConfirm({ show: true, id: staff._id })
              }
              className="p-2 rounded-full hover:bg-red-50 cursor-pointer"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
      <img
        src="https://cdn-icons-png.flaticon.com/512/7486/7486742.png"
        alt="No staff"
        className="w-20 h-20 opacity-70 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        No Staffs Found
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        You haven’t added any staff yet. Click below to get started.
      </p>
      <button
        onClick={() => openModal()}
        className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
      >
        <Plus size={16} /> Add New Staff
      </button>
    </div>
  )}
</div>


      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex py-12 items-start justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editMode ? "Edit Staff" : "New Staff"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X size={20} className="text-gray-500 hover:text-black" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b mb-6">
              {["EN", "VI"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-5 py-2 text-sm font-semibold transition ${
                    activeLang === lang
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500"
                  }`}
                >
                  {lang === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="">
              {/* Upload Section */}
              <div className="flex  items-center gap-4">
                <label className="relative cursor-pointer group w-full sm:w-40 h-40 border border-dashed rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={22} />
                      <span className="mt-1 text-sm font-medium">
                        Upload Photo
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <p className="text-[12px] text-gray-500 mt-2 leading-snug text-center sm:text-left">
                  Preferred Image Size: 240px × 240px @ 72 DPI Maximum size of
                  1MB.
                </p>
              </div>

              {/* Input Fields */}
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    value={form[`staffsName_${activeLang.toLowerCase()}`] || ""}
                    onChange={(e) =>
                      handleChange(activeLang, "staffsName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff ID<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="staffsId"
                    placeholder="Type here"
                    value={form.staffsId}
                    onChange={handleBaseChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Type here"
                    value={form[`staffsRole_${activeLang.toLowerCase()}`] || ""}
                    onChange={(e) =>
                      handleChange(activeLang, "staffsRole", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="staffsNumber"
                    placeholder="Type here"
                    value={form.staffsNumber}
                    onChange={handleBaseChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="staffsEmail"
                    placeholder="Type here"
                    value={form.staffsEmail}
                    onChange={handleBaseChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Type here"
                    value={
                      form[`staffsNotes_${activeLang.toLowerCase()}`] || ""
                    }
                    onChange={(e) =>
                      handleChange(activeLang, "staffsNotes", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-full hover:bg-gray-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 text-sm font-medium"
              >
                {editMode ? "Update" : "Add"}
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
