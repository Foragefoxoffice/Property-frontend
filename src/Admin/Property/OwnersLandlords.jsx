import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Search,
  X,
  Upload,
  AlertTriangle,
} from "lucide-react";
import {
  getAllOwners,
  createOwner,
  deleteOwner,
  updateOwner,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";

const OwnersLandlords = ({ openOwnerView }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [editMode, setEditMode] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [formData, setFormData] = useState({
    ownerName_en: "",
    ownerName_vi: "",
    ownerType_en: "",
    ownerType_vi: "",
    ownerNumber_en: "",
    ownerNumber_vi: "",
    ownerFacebook_en: "",
    ownerFacebook_vi: "",
    ownerNotes_en: "",
    ownerNotes_vi: "",
    photo: "",
  });

  // ✅ Fetch all owners
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await getAllOwners();
      setOwners(res.data.data || []);
    } catch (err) {
      console.error(err);
      CommonToaster("Failed to load owners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // ✅ Handle input change
  const handleChange = (lang, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [`${field}_${lang.toLowerCase()}`]: value,
    }));
  };

  // ✅ Handle image upload (Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      CommonToaster("Maximum image size is 1MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Open Add Owner Modal
  const openAddModal = () => {
    setEditMode(false);
    setEditingOwner(null);
    setFormData({
      ownerName_en: "",
      ownerName_vi: "",
      ownerType_en: "",
      ownerType_vi: "",
      ownerNumber_en: "",
      ownerNumber_vi: "",
      ownerFacebook_en: "",
      ownerFacebook_vi: "",
      ownerNotes_en: "",
      ownerNotes_vi: "",
      photo: "",
    });
    setPhotoPreview(null);
    setShowModal(true);
  };

  // ✅ Open Edit Owner Modal (with photo)
  const openEditModal = (owner) => {
    setEditMode(true);
    setEditingOwner(owner);
    setFormData({
      ownerName_en: owner.ownerName?.en || "",
      ownerName_vi: owner.ownerName?.vi || "",
      ownerType_en: owner.ownerType?.en || "",
      ownerType_vi: owner.ownerType?.vi || "",
      ownerNumber_en: owner.ownerNumber?.en || "",
      ownerNumber_vi: owner.ownerNumber?.vi || "",
      ownerFacebook_en: owner.ownerFacebook?.en || "",
      ownerFacebook_vi: owner.ownerFacebook?.vi || "",
      ownerNotes_en: owner.ownerNotes?.en || "",
      ownerNotes_vi: owner.ownerNotes?.vi || "",
      photo: owner.photo || "",
    });
    setPhotoPreview(owner.photo || null);
    setShowModal(true);
  };

  // ✅ Add / Edit Owner
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && editingOwner?._id) {
        await updateOwner(editingOwner._id, formData);
        CommonToaster("Owner updated successfully", "success");
      } else {
        await createOwner({ ...formData });
        CommonToaster("Owner created successfully", "success");
      }
      setShowModal(false);
      setPhotoPreview(null);
      fetchOwners();
    } catch (err) {
      console.error(err);
      CommonToaster(
        err.response?.data?.message || "Error saving owner",
        "error"
      );
    }
  };

  // ✅ Delete Owner
  const handleDelete = async () => {
    try {
      await deleteOwner(deleteConfirm.id);
      CommonToaster("Owner deleted successfully", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchOwners();
    } catch (err) {
      CommonToaster("Failed to delete owner", "error");
    }
  };

  const filteredOwners = owners.filter((item) =>
    item.ownerName?.en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">
          Owners / Landlords
        </h1>
        <button
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow hover:bg-gray-800 transition-all"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Owners / Landlords</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 w-full max-w-md shadow-sm mb-6">
        <Search className="text-gray-500 mr-2" size={18} />
        <input
          type="text"
          placeholder="Search"
          className="outline-none flex-1 text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-left px-6 py-3">Contact Number</th>
              <th className="text-left px-6 py-3">Facebook</th>
              <th className="text-center px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : filteredOwners.length > 0 ? (
              filteredOwners.map((item) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-gray-100 transition"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={
                        item.photo ||
                        "https://via.placeholder.com/50x50.png?text=🏠"
                      }
                      alt={item.ownerName?.en}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900">
                      {item.ownerName?.en}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.ownerType?.en}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.ownerNumber?.en}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.ownerFacebook?.en || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openOwnerView(item)}
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                      >
                        <Eye className="text-gray-600" size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                      >
                        <Edit2 className="text-blue-500" size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ show: true, id: item._id })
                        }
                        className="p-2 rounded-full hover:bg-red-50 transition"
                      >
                        <Trash2 className="text-red-500" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Owner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-semibold">
                {editMode ? "Edit Owner / Landlord" : "New Owner / Landlord"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={22} />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b mb-6">
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
                  {lang === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
                </button>
              ))}
            </div>

            {/* Upload Section */}
            <div className="flex gap-6 mb-6">
              <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg w-40 h-40 cursor-pointer hover:border-gray-400 relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload size={20} className="text-gray-500 mb-2" />
                    <span className="text-sm text-gray-600">Upload Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {photoPreview && (
                  <span className="absolute bottom-1 text-xs text-gray-600 bg-white/70 px-2 rounded">
                    Click to Change
                  </span>
                )}
              </label>
              <p className="text-xs text-gray-500">
                Preferred Image Size: 240px × 240px @ 72 DPI <br />
                Maximum size of 1MB.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {["ownerName", "ownerType", "ownerNumber", "ownerFacebook"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {field.replace("owner", "")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Type here (${activeLang})`}
                      value={
                        formData[`${field}_${activeLang.toLowerCase()}`] || ""
                      }
                      onChange={(e) =>
                        handleChange(activeLang, field, e.target.value)
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                )
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder={`Type here (${activeLang})`}
                  rows={3}
                  value={
                    formData[`ownerNotes_${activeLang.toLowerCase()}`] || ""
                  }
                  onChange={(e) =>
                    handleChange(activeLang, "ownerNotes", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  className="px-5 py-2 border rounded-full text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                  {editMode ? "Edit" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Are you sure you want to delete this owner? This action cannot be
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
};

export default OwnersLandlords;
