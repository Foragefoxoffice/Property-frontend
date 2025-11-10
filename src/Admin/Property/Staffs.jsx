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
  CirclePlus,
} from "lucide-react";
import {
  getAllStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { Select } from "antd";

const colors = ["#E8E6FF", "#E0FFF9", "#FFECEC", "#E6F5FF"];
const CustomSelect = ({ label, name, value, onChange, options = [], lang }) => {
  const { Option } = Select;
  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>
      <Select
        showSearch
        allowClear
        value={value || undefined}
        placeholder={lang === "vi" ? "Chọn" : "Select"}
        optionFilterProp="children"
        onChange={(val) => onChange(val)}
        className="w-full h-10 custom-select"
        popupClassName="custom-dropdown"
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default function Staffs({ openStaffView }) {
  const { language } = useLanguage();
  const t = translations[language];

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
    staffsEmail: "",
    staffsId: "",
    staffsRole_en: "",
    staffsRole_vi: "",
    staffsGender: "",
    staffsNumbers: [""],
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
      CommonToaster(
        language === "vi"
          ? "Không thể tải danh sách nhân viên"
          : "Failed to fetch staffs",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const addPhoneField = () => {
    setForm(prev => ({
      ...prev,
      staffsNumbers: [...prev.staffsNumbers, ""]
    }));
  };

  const updatePhoneField = (index, value) => {
    const updated = [...form.staffsNumbers];
    updated[index] = value;
    setForm(prev => ({ ...prev, staffsNumbers: updated }));
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
        staffsEmail: staff.staffsEmail || "",
        staffsId: staff.staffsId || "",
        staffsRole_en: staff.staffsRole?.en || "",
        staffsRole_vi: staff.staffsRole?.vi || "",
        staffsGender: staff.staffsGender || "",
        staffsNumbers: staff.staffsNumbers?.length
          ? staff.staffsNumbers
          : [""], // ✅ Always array
        staffsNotes_en: staff.staffsNotes?.en || "",
        staffsNotes_vi: staff.staffsNotes?.vi || "",
      };

      setForm(filledForm);
      setPhotoPreview(staff.staffsImage || null);
    } else {
      setEditMode(false);
      setEditingStaff(null);

      setForm({
        staffsImage: "",
        staffsName_en: "",
        staffsName_vi: "",
        staffsEmail: "",
        staffsId: "",
        staffsRole_en: "",
        staffsRole_vi: "",
        staffsGender: "",
        staffsNumbers: [""], // ✅ Always array
        staffsNotes_en: "",
        staffsNotes_vi: "",
      });

      setPhotoPreview(null);
    }

    setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      staffsNumbers: form.staffsNumbers.filter(n => n.trim() !== "")
    };
    try {
      if (editMode && editingStaff?._id) {
        await updateStaff(editingStaff._id, payload);
        CommonToaster(
          language === "vi"
            ? "Cập nhật nhân viên thành công"
            : "Staff updated successfully",
          "success"
        );
      } else {
        await createStaff(payload);
        CommonToaster(
          language === "vi"
            ? "Thêm nhân viên thành công"
            : "Staff added successfully",
          "success"
        );
      }
      setShowModal(false);
      fetchStaffs();
    } catch {
      CommonToaster(
        language === "vi"
          ? "Lỗi khi lưu thông tin nhân viên"
          : "Error saving staff",
        "error"
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteConfirm.id);
      CommonToaster(
        language === "vi"
          ? "Xóa nhân viên thành công"
          : "Staff deleted successfully",
        "success"
      );
      setDeleteConfirm({ show: false, id: null });
      fetchStaffs();
    } catch {
      CommonToaster(
        language === "vi" ? "Không thể xóa nhân viên" : "Error deleting staff",
        "error"
      );
    }
  };

  const filtered = staffs.filter((s) => {
    const name =
      activeLang === "VI" ? s?.staffsName?.vi || "" : s?.staffsName?.en || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl p-5 shadow-sm bg-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#41398b29] rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#41398b29] rounded w-2/3"></div>
          <div className="h-3 bg-[#41398b29] rounded w-1/3"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-[#41398b29] rounded w-1/2"></div>
        <div className="h-3 bg-[#41398b29] rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-4 bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          {language === "vi" ? "Nhân viên" : "Staffs"}
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full cursor-pointer shadow-md"
        >
          <Plus size={18} />
          {language === "vi" ? "Nhân viên mới" : "New Staff"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={language === "vi" ? "Tìm kiếm" : "Search staff..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-[#B2B2B3] focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white"
        />
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length > 0 ? (
          filtered.map((staff, i) => (
            <div
              key={staff._id}
              className="relative rounded-2xl p-6 shadow-sm border border-gray-200"
              style={{ background: colors[i % colors.length] }}
            >
              {/* Expand / View Button */}
              <button
                onClick={() => openStaffView(staff)}
                className="absolute top-3 right-3 p-1.5 rounded-full border border-gray-400 hover:bg-white/50 transition cursor-pointer"
              >
                <MoveHorizontal size={18} className="text-gray-700" />
              </button>

              {/* Top Section */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center">
                  <img
                    src={staff.staffsImage || "/dummy-img.jpg"}
                    alt="profile"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-gray-900 font-semibold text-lg leading-tight">
                    {staff.staffsName?.[language] || staff.staffsName?.en}
                  </h3>

                  <p className="text-sm text-gray-700 mt-0.5">
                    {language === "vi" ? "ID:" : "ID:"} {staff.staffsId}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-end mt-6">
                {/* Role Section */}
                <div>
                  <p className="text-xs text-gray-500">
                    {language === "vi" ? "Chức vụ" : "Role"}
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {staff.staffsRole?.[language] || staff.staffsRole?.en}
                  </p>
                </div>

                {/* Phone Section */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={16} />
                  {staff.staffsNumbers?.[0] || "-"}
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
              {language === "vi" ? "Không có nhân viên nào" : "No Staffs Found"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {language === "vi"
                ? "Bạn chưa thêm nhân viên nào. Nhấn bên dưới để bắt đầu."
                : "You haven’t added any staff yet. Click below to get started."}
            </p>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full"
            >
              <Plus size={16} />{" "}
              {language === "vi" ? "Thêm nhân viên" : "Add New Staff"}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
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
                ? "Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this staff? This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {language === "vi" ? "Hủy" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 cursor-pointer rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                {language === "vi" ? "Xóa" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex py-12 items-start justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editMode
                  ? language === "vi"
                    ? "Chỉnh sửa nhân viên"
                    : "Edit Staff"
                  : language === "vi"
                    ? "Thêm nhân viên mới"
                    : "New Staff"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-100 bg-[#41398B] hover:bg-[#41398be3] p-1 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b mb-6">
              {["EN", "VI"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-5 py-2 text-sm font-semibold cursor-pointer ${activeLang === lang
                    ? "border-b-2 border-[#41398B] text-black"
                    : "text-gray-500"
                    }`}
                >
                  {lang === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Upload Section */}
              <div className="flex items-center gap-4 mb-4">
                <label className="relative cursor-pointer w-40 h-40 border border-dashed rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
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
                        {language === "vi" ? "Tải ảnh lên" : "Upload Photo"}
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
                <p className="text-xs text-gray-500 leading-snug">
                  {language === "vi"
                    ? "Kích thước ảnh đề xuất: 240x240px @72DPI (tối đa 1MB)"
                    : "Preferred Image Size: 240x240px @72DPI (Max 1MB)"}
                </p>
              </div>

              {/* Input Fields */}
              <div className="flex flex-col gap-4">
                {[
                  {
                    key: "staffsName",
                    label: language === "vi" ? "Tên" : "Name",
                  },
                  {
                    key: "staffsRole",
                    label: language === "vi" ? "Chức vụ" : "Role",
                  },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      {label}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        language === "vi" ? "Nhập tại đây" : "Type here"
                      }
                      value={form[`${key}_${activeLang.toLowerCase()}`] || ""}
                      onChange={(e) =>
                        handleChange(activeLang, key, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="staffsEmail"
                    value={form.staffsEmail}
                    onChange={handleBaseChange}
                    placeholder={
                      language === "vi" ? "Nhập tại đây" : "Type here"
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                  />
                </div>

                <div>
                  <CustomSelect
                    label={language === "vi" ? "Giới tính" : "Gender"}
                    name="staffsGender"
                    lang={language}
                    value={form.staffsGender}
                    onChange={(val) => setForm((p) => ({ ...p, staffsGender: val }))}
                    options={[
                      { value: "Male", label: language === "vi" ? "Nam" : "Male" },
                      { value: "Female", label: language === "vi" ? "Nữ" : "Female" },
                      { value: "Other", label: language === "vi" ? "Khác" : "Other" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    {language === "vi" ? "Mã nhân viên" : "Staff ID"}
                  </label>
                  <input
                    type="text"
                    name="staffsId"
                    value={form.staffsId}
                    onChange={handleBaseChange}
                    placeholder={
                      language === "vi" ? "Nhập tại đây" : "Type here"
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    {language === "vi" ? "Số điện thoại" : "Phone Number"}
                  </label>

                  {form.staffsNumbers.map((num, idx) => (
                    <div key={idx} className="flex items-center gap-3 mt-2">
                      <input
                        type="text"
                        placeholder={language === "vi" ? "Nhập tại đây" : "Type here"}
                        value={num}
                        onChange={(e) => updatePhoneField(idx, e.target.value)}
                        className="border rounded-lg px-3 py-3 text-sm w-full"
                      />

                      {idx === form.staffsNumbers.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              staffsNumbers: [...p.staffsNumbers, ""],
                            }))
                          }
                        >
                          <CirclePlus className="cursor-pointer" size={22} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              staffsNumbers: p.staffsNumbers.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <X className="cursor-pointer" size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    {language === "vi" ? "Ghi chú" : "Notes"}
                  </label>
                  <textarea
                    rows="2"
                    placeholder={
                      language === "vi" ? "Nhập tại đây" : "Type here"
                    }
                    value={
                      form[`staffsNotes_${activeLang.toLowerCase()}`] || ""
                    }
                    onChange={(e) =>
                      handleChange(activeLang, "staffsNotes", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#41398B] outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 cursor-pointer py-2 border border-gray-300 rounded-full text-gray-700 text-sm hover:bg-gray-100"
                >
                  {language === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 cursor-pointer bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full text-sm"
                >
                  {editMode
                    ? language === "vi"
                      ? "Cập nhật"
                      : "Update"
                    : language === "vi"
                      ? "Thêm"
                      : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
