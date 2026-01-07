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
  Calendar,
  User,
  Mail,
  Briefcase
} from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { usePermissions } from "../../Context/PermissionContext";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";

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

export default function Staffs({ openStaffView }) {
  const { language } = useLanguage();
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

  // Initial Form State
  const initialFormState = {
    profileImage: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    employeeId: "",
    phone: "",
    role: null, // Dropdown ID/Name
    department: "",
    designation: "",
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
      const [usersRes, rolesRes] = await Promise.all([
        getAllUsers(),
        getRoles()
      ]);

      const allUsers = usersRes.data.data || [];
      const allRoles = rolesRes.data.data || [];
      setRoles(allRoles);
      const staffUsers = allUsers.filter(u => u.role !== 'user');
      setUsers(staffUsers);

    } catch {
      CommonToaster("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      CommonToaster("Maximum image size is 2MB", "error");
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
        firstName: user.firstName || user.name?.split(" ")[0] || "", // Fallback if migrated
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        employeeId: user.employeeId || "",
        phone: user.phone || "",
        role: user.role,
        department: user.department || "",
        designation: user.designation || "",
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
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.firstName || !form.email || !form.employeeId || !form.role) {
      CommonToaster("Please fill all required fields", "error");
      return;
    }

    const payload = {
      ...form,
      // Convert dayjs objects to ISO strings
      dob: form.dob ? form.dob.toISOString() : null,
      joiningDate: form.joiningDate ? form.joiningDate.toISOString() : null,
      // Default password for new staff
      password: editMode ? undefined : "Admin@123"
    };

    try {
      if (editMode && editingUser?._id) {
        // Remove password from update payload to avoid overwriting if not intended
        delete payload.password;

        await updateUser(editingUser._id, payload);
        CommonToaster("Staff updated successfully", "success");
      } else {
        await createUser(payload);
        CommonToaster("Staff created successfully", "success");
      }
      setShowModal(false);
      fetchUsersAndRoles();
    } catch (err) {
      CommonToaster(err.response?.data?.error || "Error saving staff", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteConfirm.id);
      CommonToaster("Staff deleted successfully", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchUsersAndRoles();
    } catch {
      CommonToaster("Error deleting staff", "error");
    }
  };

  const filtered = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen px-6 py-6 bg-gradient-to-b from-white to-[#f3f2ff]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Staffs
        </h1>
        {can("menuStaffs.staffs", "add") && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition shadow-md"
          >
            <Plus size={18} />
            New Staff
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
        />
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Simple Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-48"></div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((user) => (
            <div
              key={user._id}
              className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                {can("menuStaffs.staffs", "edit") && (
                  <button
                    onClick={() => openModal(user)}
                    className="p-1.5 bg-gray-100 hover:bg-[#41398B] hover:text-white rounded-full transition text-gray-600"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {can("menuStaffs.staffs", "delete") && (
                  <button
                    onClick={() => setDeleteConfirm({ show: true, id: user._id })}
                    className="p-1.5 bg-gray-100 hover:bg-red-600 hover:text-white rounded-full transition text-gray-600"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Top Section */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-gray-900 font-bold text-lg leading-tight">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-[#41398B] font-medium mt-0.5">
                    {user.designation || user.role}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {user.employeeId}</p>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  <span>{user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} className="text-gray-400" />
                  <span>{user.department || "N/A"} Department</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No staffs found. Click "New Staff" to add one.
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="text-red-600 w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? "Edit Staff" : "Add Staff"}
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
              <form id="staffForm" onSubmit={handleSubmit} className="space-y-6">

                {/* Top Section: Image & Basic Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Image Upload */}
                    <div className="flex-shrink-0">
                      <label className="relative cursor-pointer w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition overflow-hidden group">
                        {photoPreview ? (
                          <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <Upload size={20} />
                            <span className="mt-1 text-xs font-medium">Upload</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Edit2 className="text-white" size={20} />
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                      <p className="text-xs text-gray-400 text-center mt-2">Max 2MB</p>
                    </div>

                    {/* Name Fields */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name (English) <span className="text-red-500">*</span></label>
                        <input type="text" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name (English)</label>
                        <input type="text" value={form.middleName} onChange={e => setForm({ ...form, middleName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name (English)</label>
                        <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>

                      {/* Email & EMP ID */}
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" placeholder="Login ID" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID <span className="text-red-500">*</span></label>
                        <input type="text" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 border-gray-50">Work Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                      <CustomSelect
                        label="Role *"
                        placeholder="Select Role"
                        value={form.role}
                        onChange={(val) => setForm({ ...form, role: val })}
                        options={roles.map(r => ({ label: r.name, value: r.name }))} // Storing Role Name as value for simplicity, or ID if preferred
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                      <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                      <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                      <input type="text" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#41398B] outline-none" />
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 border-gray-50">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                      <DatePicker
                        className="w-full h-11 border-gray-200 rounded-lg text-sm"
                        format="DD-MM-YYYY"
                        value={form.dob}
                        onChange={(date) => setForm({ ...form, dob: date })}
                      />
                    </div>
                    <div className="col-span-1">
                      <CustomSelect
                        label="Gender"
                        placeholder="Select Gender"
                        value={form.gender}
                        onChange={(val) => setForm({ ...form, gender: val })}
                        options={[
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          { label: "Other", value: "Other" }
                        ]}
                      />
                    </div>
                    <div className="col-span-1 flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Joining</label>
                      <DatePicker
                        className="w-full h-11 border-gray-200 rounded-lg text-sm"
                        format="DD-MM-YYYY"
                        value={form.joiningDate}
                        onChange={(date) => setForm({ ...form, joiningDate: date })}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <CustomSelect
                      label="Status *"
                      placeholder="Status"
                      value={form.status}
                      onChange={(val) => setForm({ ...form, status: val })}
                      options={[
                        { label: "Active", value: "Active" },
                        { label: "Inactive", value: "Inactive" }
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
                Cancel
              </button>
              <button
                type="submit"
                form="staffForm"
                className="px-6 py-2.5 rounded-lg bg-[#41398B] hover:bg-[#41398be3] text-white transition font-medium text-sm shadow-md"
              >
                {editMode ? "Update Staff" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
