import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2, Calendar as CalendarIcon, Upload, Briefcase, Languages, AlertCircle, Camera } from "lucide-react";
import { getMe, updateUser, updatePassword, getAllStaffs, updateStaff, uploadGeneralImage } from "../Api/action";
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

                // Always populate basic userForm as a baseline/fallback
                setUserForm({
                    name: userData.name || "",
                    mobile: userData.phone || userData.mobile || "",
                    email: userData.email || "",
                    employeeId: userData.employeeId || "",
                    profileImage: userData.profileImage || "",
                });

                if (userData.role === "user") {
                    setIsStaff(false);
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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            CommonToaster("Max image size 5MB", "error");
            return;
        }

        try {
            const res = await uploadGeneralImage(file);
            if (res.data.success) {
                const imageUrl = res.data.url;
                // Update both to keep in sync and handle fallbacks
                setUserForm(prev => ({ ...prev, profileImage: imageUrl }));
                if (isStaff) {
                    setStaffForm(prev => ({ ...prev, profileImage: imageUrl }));
                }
                CommonToaster("Image uploaded successfully!", "success");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            CommonToaster("Failed to upload image", "error");
        }
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

            console.log("📤 Updating User Profile. ID:", userId, "Payload:", payload);
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

        if (!staffData?._id) {
            console.warn("⚠️ No staff record found. Falling back to User update for basic info.");
            // Fallback: try updating the basic User record
            return handleUserUpdate(e);
        }

        console.log("📤 Updating Staff Profile. ID:", staffData._id, "Payload:", payload);
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
        firstName: language === "vi" ? "Tên" : "First Name",
        middleName: language === "vi" ? "Tên Đệm" : "Middle Name",
        lastName: language === "vi" ? "Họ" : "Last Name",
        department: language === "vi" ? "Phòng Ban" : "Department",
        designation: language === "vi" ? "Chức Vụ" : "Designation",
        phone: language === "vi" ? "Số Điện Thoại" : "Phone Number",
        dob: language === "vi" ? "Ngày Sinh" : "Date of Birth",
        gender: language === "vi" ? "Giới Tính" : "Gender",
        male: language === "vi" ? "Nam" : "Male",
        female: language === "vi" ? "Nữ" : "Female",
        email: language === "vi" ? "Email (Tên Đăng Nhập)" : "Email (Login ID)",
        employeeId: language === "vi" ? "Mã Nhân Viên" : "Employee ID",
        other: language === "vi" ? "Khác" : "Other",
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#41398B]" size={40} /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{isStaff ? (language === "vi" ? "Hồ Sơ Nhân Viên" : "Staff Profile") : (t?.myProfile || "My Profile")}</h1>
                <p className="text-gray-500">{isStaff ? (language === "vi" ? "Quản lý thông tin và mật khẩu của bạn." : "Manage your account settings and password.") : (t?.manageAccount || "Manage your account settings and password.")}</p>
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

                        {/* Profile Image Display */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => document.getElementById('userPhoto').click()}
                            >
                                <div className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center transition-all group-hover:ring-4 group-hover:ring-[#41398B]/20">
                                    {userForm.profileImage ? (
                                        <img src={userForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                    <Camera className="text-white w-8 h-8 drop-shadow-md" />
                                </div>
                                <input
                                    id="userPhoto"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {language === "vi" ? "Nhấp để thay đổi ảnh" : "Click to change photo"}
                            </p>
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
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
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
                            {language === "vi" ? "Chi Tiết Nhân Viên" : "Staff Details"}
                        </h2>
                    </div>

                    <form onSubmit={handleStaffUpdate} className="space-y-6">

                        {/* Profile Image Display */}
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => document.getElementById('staffPhoto').click()}
                            >
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-all group-hover:ring-4 group-hover:ring-[#41398B]/20">
                                    {staffForm.profileImage ? (
                                        <img src={staffForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-300 select-none">
                                            {staffForm.firstName?.en ? staffForm.firstName.en.charAt(0).toUpperCase() : ""}
                                            {staffForm.lastName?.en ? staffForm.lastName.en.charAt(0).toUpperCase() : ""}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                    <Camera className="text-white w-8 h-8 drop-shadow-md" />
                                </div>
                                <input
                                    id="staffPhoto"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {language === "vi" ? "Nhấp để thay đổi ảnh" : "Click to change photo"}
                            </p>
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
                                    value={staffForm.firstName[language]}
                                    onChange={(e) => setStaffForm({ ...staffForm, firstName: { ...staffForm.firstName, [language]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.middleName}</label>
                                <input
                                    type="text"
                                    value={staffForm.middleName[language]}
                                    onChange={(e) => setStaffForm({ ...staffForm, middleName: { ...staffForm.middleName, [language]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.lastName}</label>
                                <input
                                    type="text"
                                    value={staffForm.lastName[language]}
                                    onChange={(e) => setStaffForm({ ...staffForm, lastName: { ...staffForm.lastName, [language]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.department}</label>
                                <input
                                    type="text"
                                    value={staffForm.department[language]}
                                    onChange={(e) => setStaffForm({ ...staffForm, department: { ...staffForm.department, [language]: e.target.value } })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.designation}</label>
                                <input
                                    type="text"
                                    value={staffForm.designation[language]}
                                    onChange={(e) => setStaffForm({ ...staffForm, designation: { ...staffForm.designation, [language]: e.target.value } })}
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
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {language === "vi" ? "Cập Nhật Hồ Sơ" : "Update Staff Profile"}
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
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
