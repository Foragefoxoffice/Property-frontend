import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Search,
  X,
  CirclePlus,
  AlertTriangle,
  ChevronsLeft,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
} from "lucide-react";
import {
  getAllOwners,
  createOwner,
  deleteOwner,
  updateOwner,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

const OwnersLandlords = ({ openOwnerView }) => {
  const { language } = useLanguage();
  const t = translations[language];

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
      CommonToaster(
        language === "vi"
          ? "Không thể tải danh sách chủ sở hữu / chủ nhà"
          : "Failed to load owners",
        "error"
      );
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

  // ✅ Handle image upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      CommonToaster(
        language === "vi"
          ? "Kích thước ảnh tối đa là 1MB"
          : "Maximum image size is 1MB",
        "error"
      );
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Open Add Modal
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

  // ✅ Open Edit Modal
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

  // ✅ Submit Owner (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && editingOwner?._id) {
        await updateOwner(editingOwner._id, formData);
        CommonToaster(
          language === "vi"
            ? "Cập nhật chủ sở hữu / chủ nhà thành công"
            : "Owner updated successfully",
          "success"
        );
      } else {
        await createOwner({ ...formData });
        CommonToaster(
          language === "vi"
            ? "Thêm chủ sở hữu / chủ nhà thành công"
            : "Owner created successfully",
          "success"
        );
      }
      setShowModal(false);
      setPhotoPreview(null);
      fetchOwners();
    } catch (err) {
      console.error(err);
      CommonToaster(
        err.response?.data?.message ||
          (language === "vi"
            ? "Lỗi khi lưu thông tin chủ sở hữu / chủ nhà"
            : "Error saving owner"),
        "error"
      );
    }
  };

  // ✅ Delete Owner
  const handleDelete = async () => {
    try {
      await deleteOwner(deleteConfirm.id);
      CommonToaster(
        language === "vi"
          ? "Xóa chủ sở hữu / chủ nhà thành công"
          : "Owner deleted successfully",
        "success"
      );
      setDeleteConfirm({ show: false, id: null });
      fetchOwners();
    } catch (err) {
      CommonToaster(
        language === "vi"
          ? "Không thể xóa chủ sở hữu / chủ nhà"
          : "Failed to delete owner",
        "error"
      );
    }
  };

  const filteredOwners = owners.filter((item) =>
    (item.ownerName?.[language] || item.ownerName?.en || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">{t.owners}</h1>
        <button
          className="flex items-center gap-2 text-sm text-white px-4 py-4 rounded-full shadow bg-[#41398B] hover:bg-[#41398be3] transition-all cursor-pointer"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>
            {language === "vi"
              ? "Chủ sở hữu / Chủ nhà mới"
              : "New Owner / Landlord"}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white rounded-full px-4 py-4 w-full max-w-md shadow-sm mb-6">
        <Search className="text-gray-500 mr-4" size={18} />
        <input
          type="text"
          placeholder={language === "vi" ? "Tìm kiếm" : "Search"}
          className="outline-none flex-1 text-gray-700 placeholder-gray-400 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="text-left px-6 py-3">
                {language === "vi" ? "Tên" : "Name"}
              </th>
              <th className="text-left px-6 py-3">
                {language === "vi" ? "Loại" : "Type"}
              </th>
              <th className="text-left px-6 py-3">
                {language === "vi" ? "Số liên hệ" : "Contact Number"}
              </th>
              <th className="text-left px-6 py-3">Facebook</th>
              <th className="text-center px-6 py-3">
                {language === "vi" ? "Hành động" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  {language === "vi" ? "Đang tải..." : "Loading..."}
                </td>
              </tr>
            ) : filteredOwners.length > 0 ? (
              filteredOwners.map((item) => (
                <tr key={item._id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={item.photo || "/images/dummy-img.jpg"}
                      alt={item.ownerName?.[language] || item.ownerName?.en}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <span className="font-medium text-gray-900">
                      {item.ownerName?.[language] || item.ownerName?.en}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.ownerType?.[language] || item.ownerType?.en}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.ownerNumber?.[language] || item.ownerNumber?.en}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.ownerFacebook?.[language] ||
                      item.ownerFacebook?.en ||
                      "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        style={{ justifyItems: "anchor-center" }}
                        onClick={() => openOwnerView(item)}
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10"
                      >
                        <Eye className="text-gray-600" size={18} />
                      </button>
                      <button
                        style={{ justifyItems: "anchor-center" }}
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10"
                      >
                        <Edit2 className="text-blue-500" size={18} />
                      </button>
                      <button
                        style={{ justifyItems: "anchor-center" }}
                        onClick={() =>
                          setDeleteConfirm({ show: true, id: item._id })
                        }
                        className="p-2 rounded-full hover:bg-red-50 transition border border-gray-300 h-10 w-10"
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
                  {language === "vi"
                    ? "Không có kết quả phù hợp."
                    : "No results found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                ? "Bạn có chắc chắn muốn xóa chủ sở hữu / chủ nhà này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this owner/landlord? This action cannot be undone."}
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

      {/* ✅ Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-base font-semibold">
                {editMode
                  ? language === "vi"
                    ? "Chỉnh sửa chủ sở hữu / chủ nhà"
                    : "Edit Owner / Landlord"
                  : language === "vi"
                  ? "Thêm chủ sở hữu / chủ nhà mới"
                  : "New Owner / Landlord"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-100 bg-[#41398B] hover:bg-[#41398be3] p-1 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 px-6">
              {["EN", "VI"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-5 py-3 text-sm font-medium transition-all cursor-pointer ${
                    activeLang === lang
                      ? "border-b-2 border-[#41398B] text-black bg-white"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {lang === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* Upload */}
              <div className="flex gap-6 mb-6">
                <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg w-32 h-32 cursor-pointer hover:border-gray-400 bg-gray-50">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <CirclePlus size={18} className="text-gray-500 mb-1" />
                      <span className="text-xs text-gray-600">
                        {language === "vi" ? "Tải ảnh lên" : "Upload Photo"}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <p className="text-sm text-gray-500 self-center leading-relaxed">
                  {language === "vi"
                    ? "Kích thước hình ảnh ưu tiên: 240px x 240px @ 72 DPI — Tối đa: 1MB"
                    : "Preferred image size: 240px x 240px @ 72 DPI — Max: 1MB"}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {[
                  {
                    key: "ownerName",
                    label: language === "vi" ? "Tên" : "Name",
                  },
                  {
                    key: "ownerType",
                    label: language === "vi" ? "Loại" : "Type",
                  },
                  {
                    key: "ownerNumber",
                    label: language === "vi" ? "Số liên hệ" : "Contact Number",
                  },
                  { key: "ownerFacebook", label: "Facebook" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        language === "vi" ? "Nhập tại đây" : "Type here"
                      }
                      value={
                        formData[`${key}_${activeLang.toLowerCase()}`] || ""
                      }
                      onChange={(e) =>
                        handleChange(activeLang, key, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    {language === "vi" ? "Ghi chú" : "Notes"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder={
                      language === "vi" ? "Nhập tại đây" : "Type here"
                    }
                    rows={3}
                    value={
                      formData[`ownerNotes_${activeLang.toLowerCase()}`] || ""
                    }
                    onChange={(e) =>
                      handleChange(activeLang, "ownerNotes", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none resize-none"
                  />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-6 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 border border-gray-300 rounded-full text-gray-700 text-sm hover:bg-gray-100"
                  >
                    {language === "vi" ? "Hủy" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full text-sm cursor-pointer"
                  >
                    {editMode
                      ? language === "vi"
                        ? "Cập nhật"
                        : "Edit"
                      : language === "vi"
                      ? "Thêm"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnersLandlords;
