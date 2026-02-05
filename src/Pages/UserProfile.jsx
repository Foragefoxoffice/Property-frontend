import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2, Calendar as CalendarIcon, Upload, Briefcase, Languages, AlertCircle, Camera } from "lucide-react";
import { getMe, updateUser, updatePassword, getAllStaffs, updateStaff } from "../Api/action";
import { CommonToaster } from "../Common/CommonToaster";
import { useLanguage } from "../Language/LanguageContext";
import { translations } from "../Language/translations";
import { Select } from "antd";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const CustomDatePicker = ({ label, value, onChange }) => {
    const [date, setDate] = React.useState(value ? new Date(value) : null);

    React.useEffect(() => {
        if (value && (!date || new Date(value).getTime() !== date.getTime())) {
            setDate(new Date(value));
        }
    }, [value]);

    const handleSelect = (selectedDate) => {
        if (!selectedDate) return;
        setDate(selectedDate);
        onChange(selectedDate.toISOString());
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
                        className={`w-full justify-between text-left font-normal border border-gray-200 rounded-lg px-4 py-2.5 h-auto hover:bg-gray-50 focus:ring-2 focus:ring-[#41398B] ${!date && "text-muted-foreground"
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

export default function UserProfile() {
    const { language } = useLanguage();
    const t = translations[language];

    const [user, setUser] = useState(null); // The auth user
    const [staffData, setStaffData] = useState(null); // The staff record if exists
    const [isStaff, setIsStaff] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    // Profile Form State for USER
    const [userForm, setUserForm] = useState({
        name: "",
        mobile: "",
        email: "",
        employeeId: "",
        profileImage: "",
    });

    // Profile Form State for STAFF
    const [staffForm, setStaffForm] = useState({
        profileImage: "",
        firstName: { en: "", vi: "" },
        middleName: { en: "", vi: "" },
        lastName: { en: "", vi: "" },
        email: "",
        employeeId: "",
        phone: "",
        role: "",
        department: { en: "", vi: "" },
        designation: { en: "", vi: "" },
        dob: null,
        gender: null,
        joiningDate: null,
        status: "Active"
    });

    const [activeTab, setActiveTab] = useState("vi"); // For Staff Multilingual

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await getMe();
            if (res.data) {
                const userData = res.data.data || res.data.user;
                setUser(userData);

                if (userData.role === "user") {
                    setIsStaff(false);
                    setUserForm({
                        name: userData.name || "",
                        mobile: userData.phone || userData.mobile || "", // Handle both just in case
                        email: userData.email || "",
                        employeeId: userData.employeeId || "",
                        profileImage: userData.profileImage || "",
                    });
                    // Sync image to local storage for Header
                    localStorage.setItem("userImage", userData.profileImage || "");
                    window.dispatchEvent(new Event("userProfileUpdated"));
                } else {
                    setIsStaff(true);
                    // Fetch Staff Record
                    const staffRes = await getAllStaffs();
                    const allStaffs = staffRes.data.data || [];
                    const foundStaff = allStaffs.find(s => s.staffsEmail?.toLowerCase() === userData.email?.toLowerCase());

                    if (foundStaff) {
                        setStaffData(foundStaff);
                        // Map Staff Data
                        const nameEn = foundStaff.staffsName?.en || "";
                        const nameVi = foundStaff.staffsName?.vi || "";
                        const partsEn = nameEn.split(" ");
                        const partsVi = nameVi.split(" ");

                        setStaffForm({
                            profileImage: foundStaff.staffsImage || "",
                            firstName: { en: partsEn[0] || "", vi: partsVi[0] || "" },
                            middleName: { en: partsEn.length > 2 ? partsEn[1] : "", vi: partsVi.length > 2 ? partsVi[1] : "" },
                            lastName: { en: partsEn[partsEn.length - 1] || "", vi: partsVi[partsVi.length - 1] || "" },
                            email: foundStaff.staffsEmail || "",
                            employeeId: foundStaff.staffsId || "",
                            phone: foundStaff.staffsNumbers?.[0] || "",
                            role: foundStaff.staffsRole?.en || "", // Assuming same
                            department: { en: foundStaff.staffsDepartment?.en || "", vi: foundStaff.staffsDepartment?.vi || "" },
                            designation: { en: foundStaff.staffsDesignation?.en || "", vi: foundStaff.staffsDesignation?.vi || "" },
                            dob: foundStaff.staffsDob || null,
                            gender: foundStaff.staffsGender || null,
                            joiningDate: foundStaff.staffsJoiningDate || null,
                            status: foundStaff.status || "Active"
                        });
                        // Sync image to local storage for Header
                        localStorage.setItem("userImage", foundStaff.staffsImage || "");
                        window.dispatchEvent(new Event("userProfileUpdated"));
                    } else {
                        // Fallback if staff record not found (shouldn't happen for admin usually)
                        console.warn("Staff record not found linked to this account.");
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            CommonToaster("Failed to load user profile", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            CommonToaster("Max image size 2MB", "error");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            if (isStaff) {
                setStaffForm(prev => ({ ...prev, profileImage: reader.result }));
            } else {
                setUserForm(prev => ({ ...prev, profileImage: reader.result }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUserUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userId = user._id || user.id;
            // Map form back to API expected keys if needed. 
            // updateUser expects { name, mobile, email... }
            // UsersDetails uses { phone }
            const payload = {
                name: userForm.name,
                email: userForm.email,
                phone: userForm.mobile, // Updating phone
                mobile: userForm.mobile, // Sending both to be safe
                employeeId: userForm.employeeId,
                profileImage: userForm.profileImage
            };

            await updateUser(userId, payload);
            CommonToaster("Profile updated successfully!", "success");
            fetchUserData();
        } catch (error) {
            console.error("Error updating profile:", error);
            CommonToaster(error.response?.data?.error || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleStaffUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        if (!staffData?._id) return;

        // Construct names
        const fullNameEn = [staffForm.firstName.en, staffForm.middleName.en, staffForm.lastName.en].filter(Boolean).join(" ");
        const fullNameVi = [staffForm.firstName.vi, staffForm.middleName.vi, staffForm.lastName.vi].filter(Boolean).join(" ");

        const payload = {
            staffsImage: staffForm.profileImage,
            staffsName_en: fullNameEn,
            staffsName_vi: fullNameVi,
            staffsId: staffForm.employeeId,
            staffsRole_en: staffForm.role, // Assuming we don't change role logic here
            staffsRole_vi: staffForm.role,
            staffsDepartment_en: staffForm.department.en,
            staffsDepartment_vi: staffForm.department.vi,
            staffsDesignation_en: staffForm.designation.en,
            staffsDesignation_vi: staffForm.designation.vi,
            staffsEmail: staffForm.email,
            staffsNumbers: [staffForm.phone],
            staffsGender: staffForm.gender,
            staffsDob: staffForm.dob,
            staffsJoiningDate: staffForm.joiningDate,
            status: staffForm.status // Allow updating status or keep as is? Usually staff can't update own status.
        };

        try {
            await updateStaff(staffData._id, payload);
            CommonToaster("Staff profile updated successfully!", "success");
            fetchUserData();
        } catch (error) {
            console.error("Error updating staff profile:", error);
            CommonToaster(error.response?.data?.error || "Failed to update staff profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const toggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (newPassword !== confirmPassword) {
            CommonToaster("New passwords do not match!", "error");
            return;
        }

        setPasswordSaving(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            CommonToaster("Password updated successfully!", "success");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Change password error:", error);
            CommonToaster(error.response?.data?.error || "Failed to update password", "error");
        } finally {
            setPasswordSaving(false);
        }
    };

    const staffT = {
        firstName: activeTab === "vi" ? "Tên" : "First Name",
        middleName: activeTab === "vi" ? "Tên Đệm" : "Middle Name",
        lastName: activeTab === "vi" ? "Họ" : "Last Name",
        department: activeTab === "vi" ? "Phòng Ban" : "Department",
        designation: activeTab === "vi" ? "Chức Vụ" : "Designation",
        phone: activeTab === "vi" ? "Số Điện Thoại" : "Phone Number",
        dob: activeTab === "vi" ? "Ngày Sinh" : "Date of Birth",
        gender: activeTab === "vi" ? "Giới Tính" : "Gender",
        male: activeTab === "vi" ? "Nam" : "Male",
        female: activeTab === "vi" ? "Nữ" : "Female",
        email: activeTab === "vi" ? "Email (Tên Đăng Nhập)" : "Email (Login ID)",
        employeeId: activeTab === "vi" ? "Mã Nhân Viên" : "Employee ID",
        other: activeTab === "vi" ? "Khác" : "Other",
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#41398B]" size={40} /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{isStaff ? (activeTab === "vi" ? "Hồ Sơ Nhân Viên" : "Staff Profile") : (t?.myProfile || "My Profile")}</h1>
                <p className="text-gray-500">{isStaff ? (activeTab === "vi" ? "Quản lý thông tin và mật khẩu của bạn." : "Manage your account settings and password.") : (t?.manageAccount || "Manage your account settings and password.")}</p>
            </div>


            {/* Warning if Staff Record Not Found */}
            {isStaff && !staffData && !loading && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="font-semibold text-lg">Staff Profile Not Found</h3>
                        <p className="opacity-90 mt-1">
                            Your account has the role <strong>{user?.role}</strong>, but no linked Staff Profile was found for email <strong>{user?.email}</strong>.
                            <br />
                            Please contact your administrator to create a Staff entry for this email address.
                        </p>
                    </div>
                </div>
            )}

            {/* --- USER FORM --- */}
            {!isStaff && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <User className="text-[#41398B]" size={20} />
                        {t?.personalInfo || "Personal Information"}
                    </h2>
                    <form onSubmit={handleUserUpdate} className="space-y-6">

                        {/* Profile Image Upload */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {userForm.profileImage ? (
                                        <img src={userForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                                    <Upload className="text-white" size={24} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                                <div className="absolute bottom-0 right-0 bg-[#41398B] text-white p-1.5 rounded-full shadow-md border-2 border-white z-20 pointer-events-none">
                                    <Camera size={14} />
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">{t?.uploadPhoto || "Upload Photo"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.fullName || "Full Name"}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={userForm.name}
                                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                        placeholder={t?.enterName || "Enter your name"}
                                    />
                                </div>
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.mobileNumber || "Mobile Number"}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={userForm.mobile}
                                        onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                        placeholder={t?.enterMobile || "Enter your mobile"}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.emailAddress || "Email Address"}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                        readOnly // Usually email is login ID, maybe keep readOnly
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none cursor-not-allowed"
                                        placeholder={t?.enterEmail || "Enter your email"}
                                    />
                                </div>
                            </div>

                            {/* Employee ID (Read Only for User?) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.userEmployeeId || "User/Employee ID"}</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={userForm.employeeId}
                                        readOnly
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none cursor-not-allowed"
                                        placeholder="ID"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-full font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {t?.saveChanges || "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- STAFF FORM --- */}
            {isStaff && staffData && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <User className="text-[#41398B]" size={20} />
                            {activeTab === "vi" ? "Chi Tiết Nhân Viên" : "Staff Details"}
                        </h2>
                        {/* Language Tabs */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("vi")}
                                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeTab === "vi"
                                    ? "bg-[#41398B] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <Languages size={14} /> Tiếng Việt
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("en")}
                                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeTab === "en"
                                    ? "bg-[#41398B] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <Languages size={14} /> English
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleStaffUpdate} className="space-y-6">

                        {/* Profile Image Upload */}
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {staffForm.profileImage ? (
                                        <img src={staffForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-300 select-none">
                                            {staffForm.firstName?.en ? staffForm.firstName.en.charAt(0).toUpperCase() : ""}
                                            {staffForm.lastName?.en ? staffForm.lastName.en.charAt(0).toUpperCase() : ""}
                                        </span>
                                    )}
                                </div>

                                {/* Hover Overlay */}
                                <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                                    <Upload className="text-white" size={24} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>

                                {/* Edit Icon Badge */}
                                <div className="absolute bottom-1 right-1 bg-[#41398B] text-white p-2 rounded-full shadow-md border-2 border-white z-20 pointer-events-none">
                                    <Camera size={16} />
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-500 font-medium">{t?.uploadPhoto || "Upload Photo"}</p>
                        </div>
                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.email}</label>
                                <input
                                    type="email"
                                    value={staffForm.email}
                                    readOnly // Staff login email should probably be read only or careful
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.employeeId}</label>
                                <input
                                    type="text"
                                    value={staffForm.employeeId}
                                    readOnly
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        {/* Dynamic Fields based on Language */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.firstName}</label>
                                <input
                                    type="text"
                                    value={staffForm.firstName[activeTab]}
                                    onChange={(e) => setStaffForm({ ...staffForm, firstName: { ...staffForm.firstName, [activeTab]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.middleName}</label>
                                <input
                                    type="text"
                                    value={staffForm.middleName[activeTab]}
                                    onChange={(e) => setStaffForm({ ...staffForm, middleName: { ...staffForm.middleName, [activeTab]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.lastName}</label>
                                <input
                                    type="text"
                                    value={staffForm.lastName[activeTab]}
                                    onChange={(e) => setStaffForm({ ...staffForm, lastName: { ...staffForm.lastName, [activeTab]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.department}</label>
                                <input
                                    type="text"
                                    value={staffForm.department[activeTab]}
                                    onChange={(e) => setStaffForm({ ...staffForm, department: { ...staffForm.department, [activeTab]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.designation}</label>
                                <input
                                    type="text"
                                    value={staffForm.designation[activeTab]}
                                    onChange={(e) => setStaffForm({ ...staffForm, designation: { ...staffForm.designation, [activeTab]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.phone}</label>
                                <input
                                    type="text"
                                    value={staffForm.phone}
                                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <CustomDatePicker
                                label={staffT.dob}
                                value={staffForm.dob}
                                onChange={(date) => setStaffForm({ ...staffForm, dob: date })}
                            />
                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{staffT.gender}</label>
                                <Select
                                    value={staffForm.gender}
                                    onChange={(val) => setStaffForm({ ...staffForm, gender: val })}
                                    className="w-full h-[42px]"
                                    options={[
                                        { value: 'Male', label: staffT.male },
                                        { value: 'Female', label: staffT.female },
                                        { value: 'Other', label: staffT.other },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-full font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {activeTab === "vi" ? "Cập Nhật Hồ Sơ" : "Update Staff Profile"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Lock className="text-[#41398B]" size={20} />
                    {t?.changePassword || "Change Password"}
                </h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.currentPassword || "Current Password"}</label>
                            <div className="relative">
                                <input
                                    type={showPassword.current ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShowPassword("current")}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#41398B] transition-colors"
                                >
                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.newPassword || "New Password"}</label>
                            <div className="relative">
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShowPassword("new")}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#41398B] transition-colors"
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.confirmPassword || "Confirm Password"}</label>
                            <div className="relative">
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShowPassword("confirm")}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#41398B] transition-colors"
                                >
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-full font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
                        >
                            {passwordSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {t?.updatePassword || "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
