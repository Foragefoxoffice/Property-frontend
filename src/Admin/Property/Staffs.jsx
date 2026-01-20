import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Phone,
  User,
  Mail,
  Briefcase,
  Languages,
  MoreVertical,
  Pencil,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  getAllStaffs,
  getRoles
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations"; // Import global translations
import { usePermissions } from "../../Context/PermissionContext";
import { Select } from "antd";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const CustomSelect = ({ label, value, onChange, options = [], placeholder }) => {
  const { Option } = Select;
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <Select
        showSearch
        allowClear
        value={value || undefined}
        placeholder={placeholder}
        optionFilterProp="children"
        onChange={onChange}
        className="w-full h-11 custom-select"
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

const CustomDatePicker = ({ label, value, onChange }) => {
  const [date, setDate] = React.useState(value ? new Date(value.format("YYYY-MM-DD")) : null);

  React.useEffect(() => {
    if (value && (!date || new Date(value.format("YYYY-MM-DD")).getTime() !== date.getTime())) {
      setDate(new Date(value.format("YYYY-MM-DD")));
    }
  }, [value]); // eslint-disable-line

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    onChange(dayjs(format(selectedDate, "yyyy-MM-dd")));
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between text-left font-normal border border-gray-200 rounded-lg px-4 py-2.5 h-auto hover:bg-gray-50 ${!date && "text-muted-foreground"
              }`}
          >
            {date ? format(date, "dd/MM/yyyy") : <span>Select date</span>}
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            modifiers={{ disabled: { after: new Date(2100, 0, 1) } }}
            initialFocus={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function Staffs({ openStaffView }) {
  const { language } = useLanguage();
  const t = translations[language]; // Use global translations
  const { can } = usePermissions();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("en"); // Language tab state
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal specific translations based on activeTab (internal to form)
  const modalT = {
    personalDetails: activeTab === "vi" ? "Thông Tin Cá Nhân" : "Personal Details",
    workInformation: activeTab === "vi" ? "Thông Tin Công Việc" : "Work Information",
    dateOfBirth: activeTab === "vi" ? "Ngày Sinh" : "Date of Birth",
    gender: activeTab === "vi" ? "Giới Tính" : "Gender",
    selectGender: activeTab === "vi" ? "Chọn Giới Tính" : "Select Gender",
    dateOfJoining: activeTab === "vi" ? "Ngày Vào Làm" : "Date of Joining",
    status: activeTab === "vi" ? "Trạng Thái" : "Status",
    active: activeTab === "vi" ? "Hoạt Động" : "Active",
    inactive: activeTab === "vi" ? "Ngưng Hoạt Động" : "Inactive",
    male: activeTab === "vi" ? "Nam" : "Male",
    female: activeTab === "vi" ? "Nữ" : "Female",
    other: activeTab === "vi" ? "Khác" : "Other",
    addStaff: activeTab === "vi" ? "Thêm Nhân Viên" : "Add Staff",
    editStaff: activeTab === "vi" ? "Chỉnh Sửa Nhân Viên" : "Edit Staff",
    updateStaff: activeTab === "vi" ? "Cập Nhật" : "Update Staff",
    cancel: activeTab === "vi" ? "Hủy" : "Cancel",
  };

  // Initial Form State
  const initialFormState = {
    profileImage: "",
    firstName: { en: "", vi: "" },
    middleName: { en: "", vi: "" },
    lastName: { en: "", vi: "" },
    email: "",
    employeeId: "",
    phone: "",
    role: null, // Dropdown ID/Name
    department: { en: "", vi: "" },
    designation: { en: "", vi: "" },
    dob: null,
    gender: null,
    joiningDate: null,
    status: "Active"
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        getAllStaffs(),
        getRoles()
      ]);

      const allRoles = rolesRes.data.data || [];
      const allStaffs = staffRes.data.data || [];

      // Map Staff API format to Frontend format
      const mappedStaffs = allStaffs.map(s => {
        // Simple name splitting for visual editing
        const nameEn = s.staffsName?.en || "";
        const nameVi = s.staffsName?.vi || "";
        const partsEn = nameEn.split(" ");
        const partsVi = nameVi.split(" ");

        return {
          _id: s._id,
          profileImage: s.staffsImage,
          firstName: { en: partsEn[0] || "", vi: partsVi[0] || "" },
          middleName: { en: partsEn.length > 2 ? partsEn[1] : "", vi: partsVi.length > 2 ? partsVi[1] : "" },
          lastName: { en: partsEn[partsEn.length - 1] || "", vi: partsVi[partsVi.length - 1] || "" },
          email: s.staffsEmail,
          employeeId: s.staffsId,
          phone: s.staffsNumbers?.[0] || "",
          role: s.staffsRole?.en || "", // Assuming role is same
          department: { en: s.staffsDepartment?.en || "", vi: s.staffsDepartment?.vi || "" },
          designation: { en: s.staffsDesignation?.en || "", vi: s.staffsDesignation?.vi || "" },
          dob: s.staffsDob ? s.staffsDob : null,
          gender: s.staffsGender,
          joiningDate: s.staffsJoiningDate ? s.staffsJoiningDate : null,
          status: s.status,
          name: s.staffsName?.en // for quick search access
        };
      });

      setRoles(allRoles);
      setUsers(mappedStaffs);

    } catch {
      CommonToaster(t.failedFetch || "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      CommonToaster(t.maxImageSize || "Max image size 2MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setForm((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const openModal = (user = null) => {
    if (user) {
      setEditMode(true);
      setEditingUser(user);
      setForm({
        profileImage: user.profileImage || "",
        firstName: { en: user.firstName?.en || "", vi: user.firstName?.vi || "" },
        middleName: { en: user.middleName?.en || "", vi: user.middleName?.vi || "" },
        lastName: { en: user.lastName?.en || "", vi: user.lastName?.vi || "" },
        email: user.email || "",
        employeeId: user.employeeId || "",
        phone: user.phone || "",
        role: user.role,
        department: { en: user.department?.en || "", vi: user.department?.vi || "" },
        designation: { en: user.designation?.en || "", vi: user.designation?.vi || "" },
        dob: user.dob ? dayjs(user.dob) : null,
        gender: user.gender,
        joiningDate: user.joiningDate ? dayjs(user.joiningDate) : null,
        status: user.status || "Active"
      });
      setPhotoPreview(user.profileImage || null);
    } else {
      setEditMode(false);
      setEditingUser(null);
      setForm(initialFormState);
      setPhotoPreview(null);
    }
    setActiveTab("en"); // Reset to English tab
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation needs to check sub-fields
    if (!form.firstName.en || !form.firstName.vi || !form.email || !form.employeeId || !form.role) {
      CommonToaster("Please fill all required fields in both languages", "error");
      return;
    }

    // Construct full names
    const fullNameEn = [form.firstName.en, form.middleName.en, form.lastName.en].filter(Boolean).join(" ");
    const fullNameVi = [form.firstName.vi, form.middleName.vi, form.lastName.vi].filter(Boolean).join(" ");

    const payload = {
      staffsImage: form.profileImage,
      staffsName_en: fullNameEn,
      staffsName_vi: fullNameVi,
      staffsId: form.employeeId,
      staffsRole_en: form.role,
      staffsRole_vi: form.role, // Assuming same for now
      staffsDepartment_en: form.department.en,
      staffsDepartment_vi: form.department.vi,
      staffsDesignation_en: form.designation.en,
      staffsDesignation_vi: form.designation.vi,
      staffsEmail: form.email,
      staffsNumbers: [form.phone],
      staffsGender: form.gender,
      staffsDob: form.dob ? form.dob.toISOString() : null,
      staffsJoiningDate: form.joiningDate ? form.joiningDate.toISOString() : null,
      staffsNotes_en: "",
      staffsNotes_vi: "",
      status: form.status
    };

    try {
      if (editMode && editingUser?._id) {
        await updateStaff(editingUser._id, payload);
        CommonToaster(t.staffUpdated || "Staff updated successfully", "success");
      } else {
        await createStaff(payload);
        CommonToaster(t.staffCreated || "Staff created successfully", "success");
      }
      setShowModal(false);
      fetchUsersAndRoles();
    } catch (err) {
      CommonToaster(err.response?.data?.error || t.errorSaving || "Error saving staff", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteConfirm.id);
      CommonToaster(t.staffDeleted || "Staff deleted successfully", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchUsersAndRoles();
    } catch (err) {
      CommonToaster(err.response?.data?.error || t.errorDeleting || "Error deleting staff", "error");
    }
  };

  const filtered = users.filter((u) => {
    const fullNameEn = `${u.firstName?.en || ""} ${u.lastName?.en || ""}`.toLowerCase();
    const fullNameVi = `${u.firstName?.vi || ""} ${u.lastName?.vi || ""}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullNameEn.includes(search) ||
      fullNameVi.includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.employeeId.toLowerCase().includes(search);
  });

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (totalRows > 0 && currentPage === 0) setCurrentPage(1); // Ensure at least page 1 if data exists
  }, [totalRows, totalPages, currentPage]);

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  return (
    <div className="min-h-screen px-2 py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          {t.manageStaffs}
        </h1>
        {can("menuStaffs.staffs", "add") && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition shadow-md cursor-pointer"
          >
            <Plus size={18} />
            {t.newStaff}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`${t.search}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
        />
      </div>

      {/* Table */}
      <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
        {loading ? (
          // Simple Skeleton
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#EAE9EE] text-gray-600 text-left h-18">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-[#111111]">
                    {t.staffInfo}
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-[#111111]">
                    {t.contact}
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-[#111111]">
                    {t.deptRole}
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-[#111111]">
                    {t.status}
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-[#111111]">
                    {t.action}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      {t.noStaffsFound}
                    </td>
                  </tr>
                ) : (
                  visibleData.map((user, i) => (
                    <tr
                      key={user._id}
                      className={`border-b last:border-0 border-gray-100 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      {/* Staff Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt="profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 leading-tight">
                              {user.firstName?.[language] || user.firstName?.en || ""} {user.lastName?.[language] || user.lastName?.en || ""}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {user.employeeId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={14} />
                            <span className="truncate max-w-[150px]" title={user.email}>
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={14} />
                            <span>{user.phone || "N/A"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Dept / Role */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-800">
                            {user.department?.[language] || user.department?.en || "N/A"}
                          </span>
                          <span className="text-xs text-[#41398B] bg-[#41398B]/10 px-2 py-0.5 rounded-full mt-1">
                            {user.role}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {user.status === "Active" ? (
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium border border-green-100">
                            <ShieldCheck size={13} /> {t.active}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-medium border border-red-100">
                            <ShieldAlert size={13} /> {t.inactive}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative">
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500"
                          onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuIndex === i && (
                          <div className="absolute right-10 top-10 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 py-1 overflow-hidden">
                            {can("menuStaffs.staffs", "edit") && user.role !== "Super Admin" && (
                              <button
                                onClick={() => {
                                  openModal(user);
                                  setOpenMenuIndex(null);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition group"
                              >
                                <span className="w-8 flex justify-center">
                                  <Pencil size={15} className="text-blue-600 group-hover:scale-110 transition" />
                                </span>
                                {t.editStaff}
                              </button>
                            )}

                            {can("menuStaffs.staffs", "delete") && user.role !== "Super Admin" && (
                              <button
                                onClick={() => {
                                  setDeleteConfirm({ show: true, id: user._id });
                                  setOpenMenuIndex(null);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition group"
                              >
                                <span className="w-8 flex justify-center">
                                  <Trash2 size={15} className="group-hover:scale-110 transition" />
                                </span>
                                {t.delete}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalRows > 0 && (
        <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50 mt-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>{t.rowsPerPage}:</span>
            <select value={rowsPerPage} onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }} className="border rounded-md text-gray-700 focus:outline-none px-2 py-1">
              {[5, 10, 20, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p>
              {totalRows === 0
                ? `0–0 ${t.of} 0`
                : `${(currentPage - 1) * rowsPerPage + 1}–${Math.min((currentPage * rowsPerPage), totalRows)
                } ${t.of} ${totalRows}`}
            </p>

            <button onClick={goToPrev} disabled={currentPage === 1} className={`p-1 px-2 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}>
              &lt;
            </button>
            <button onClick={goToNext} disabled={currentPage === totalPages} className={`p-1 px-2 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}>
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="text-red-600 w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t.confirmDeletion}</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {t.deleteMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium shadow-sm"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? t.editStaff : t.newStaff}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[#F9FAFB]">
              {/* Global Language Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200 sticky top-0 bg-[#F9FAFB] z-10 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "en"
                    ? "text-[#41398B] border-b-2 border-[#41398B]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Languages size={16} />
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("vi")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "vi"
                    ? "text-[#41398B] border-b-2 border-[#41398B]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Languages size={16} />
                  Tiếng Việt
                </button>
              </div>

              <form id="staffForm" onSubmit={handleSubmit} className="space-y-6">

                {/* Top Section: Basic Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  {/* English Fields */}
                  {activeTab === "en" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            placeholder="Enter First Name"
                            type="text"
                            required
                            value={form.firstName.en}
                            onChange={e => setForm({ ...form, firstName: { ...form.firstName, en: e.target.value } })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name</label>
                          <input
                            placeholder="Enter Middle Name"
                            type="text"
                            value={form.middleName.en}
                            onChange={e => setForm({ ...form, middleName: { ...form.middleName, en: e.target.value } })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                          <input
                            placeholder="Enter Last Name"
                            type="text"
                            value={form.lastName.en}
                            onChange={e => setForm({ ...form, lastName: { ...form.lastName, en: e.target.value } })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            placeholder="Enter Email"
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Employee ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            placeholder="Enter Employee ID"
                            type="text"
                            required
                            value={form.employeeId}
                            onChange={e => setForm({ ...form, employeeId: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vietnamese Fields */}
                  {activeTab === "vi" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tên <span className="text-red-500">*</span>
                          </label>
                          <input
                            placeholder="Nhập Tên"
                            type="text"
                            required
                            value={form.firstName.vi}
                            onChange={e => setForm({ ...form, firstName: { ...form.firstName, vi: e.target.value } })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên Đệm</label>
                          <input
                            placeholder="Nhập Tên Đệm"
                            type="text"
                            value={form.middleName.vi}
                            onChange={e => setForm({ ...form, middleName: { ...form.middleName, vi: e.target.value } })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ</label>
                          <input
                            placeholder="Nhập Họ"
                            type="text"
                            value={form.lastName.vi}
                            onChange={e => setForm({ ...form, lastName: { ...form.lastName, vi: e.target.value } })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Địa Chỉ Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            placeholder="Nhập Email"
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Mã Nhân Viên <span className="text-red-500">*</span>
                          </label>
                          <input
                            placeholder="Nhập Mã Nhân Viên"
                            type="text"
                            required
                            value={form.employeeId}
                            onChange={e => setForm({ ...form, employeeId: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Work Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 border-gray-50">{modalT.workInformation}</h3>

                  {/* English Fields */}
                  {activeTab === "en" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1">
                        <CustomSelect
                          label="Role *"
                          placeholder="Select Role"
                          value={form.role}
                          onChange={(val) => setForm({ ...form, role: val })}
                          options={roles.map(r => ({ label: r.name, value: r.name }))}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                        <input placeholder="Enter Mobile" type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                        <input placeholder="Enter Department" type="text" value={form.department.en} onChange={e => setForm({ ...form, department: { ...form.department, en: e.target.value } })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                        <input placeholder="Enter Designation" type="text" value={form.designation.en} onChange={e => setForm({ ...form, designation: { ...form.designation, en: e.target.value } })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                    </div>
                  )}

                  {/* Vietnamese Fields */}
                  {activeTab === "vi" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1">
                        <CustomSelect
                          label="Vai Trò *"
                          placeholder="Chọn Vai Trò"
                          value={form.role}
                          onChange={(val) => setForm({ ...form, role: val })}
                          options={roles.map(r => ({ label: r.name, value: r.name }))}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Số Điện Thoại</label>
                        <input placeholder="Nhập Số Điện Thoại" type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phòng Ban</label>
                        <input placeholder="Nhập Phòng Ban" type="text" value={form.department.vi} onChange={e => setForm({ ...form, department: { ...form.department, vi: e.target.value } })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Chức Danh</label>
                        <input placeholder="Nhập Chức Danh" type="text" value={form.designation.vi} onChange={e => setForm({ ...form, designation: { ...form.designation, vi: e.target.value } })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 border-gray-50">{modalT.personalDetails}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <CustomDatePicker
                        label={modalT.dateOfBirth}
                        value={form.dob}
                        onChange={(date) => setForm({ ...form, dob: date })}
                      />
                    </div>
                    <div className="col-span-1">
                      <CustomSelect
                        label={modalT.gender}
                        placeholder={modalT.selectGender}
                        value={form.gender}
                        onChange={(val) => setForm({ ...form, gender: val })}
                        options={[
                          { label: modalT.male, value: "Male" },
                          { label: modalT.female, value: "Female" },
                          { label: modalT.other, value: "Other" }
                        ]}
                      />
                    </div>
                    <div className="col-span-1">
                      <CustomDatePicker
                        label={modalT.dateOfJoining}
                        value={form.joiningDate}
                        onChange={(date) => setForm({ ...form, joiningDate: date })}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <CustomSelect
                      label={`${modalT.status} *`}
                      placeholder={modalT.status}
                      value={form.status}
                      onChange={(val) => setForm({ ...form, status: val })}
                      options={[
                        { label: modalT.active, value: "Active" },
                        { label: modalT.inactive, value: "Inactive" }
                      ]}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium text-sm shadow-sm"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                form="staffForm"
                className="px-6 py-2.5 rounded-lg bg-[#41398B] hover:bg-[#41398be3] text-white transition font-medium text-sm shadow-md"
              >
                {editMode ? t.updateStaff : t.addStaff}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
