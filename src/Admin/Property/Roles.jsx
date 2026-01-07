import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Trash,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { Switch, Collapse, Select } from "antd";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { usePermissions } from "../../Context/PermissionContext";

const { Panel } = Collapse;

export default function Roles() {
    const { can } = usePermissions();
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [loading, setLoading] = useState(true);

    // Definition of the permission structure
    const permissionStructure = [
        {
            label: "Properties",
            key: "properties",
            subModules: [
                { key: "lease", label: "Lease", controls: ["hide", "view", "edit", "delete", "copy"] },
                { key: "sale", label: "Sale", controls: ["hide", "view", "edit", "delete", "copy"] },
                { key: "homestay", label: "Home Stay", controls: ["hide", "view", "edit", "delete", "copy"] }
            ]
        },
        {
            label: "CMS Admin",
            key: "cms",
            subModules: [
                { key: "homePage", label: "Home Page", controls: ["hide", "edit"] },
                { key: "aboutUs", label: "About Us", controls: ["hide", "edit"] },
                { key: "contactUs", label: "Contact Us", controls: ["hide", "edit"] },
                { key: "header", label: "Header", controls: ["hide", "edit"] },
                { key: "footer", label: "Footer", controls: ["hide", "edit"] },
                { key: "agent", label: "Property Consultant", controls: ["hide", "edit"] }
            ]
        },
        {
            label: "Blogs",
            key: "blogs",
            subModules: [
                { key: "category", label: "Category", controls: ["hide", "add", "edit", "delete"] },
                { key: "blogCms", label: "Blog CMS", controls: ["hide", "view", "edit", "delete"] }
            ]
        },
        {
            label: "User Management",
            key: "userManagement",
            subModules: [
                { key: "userDetails", label: "User Details", controls: ["hide", "add", "edit", "delete"] },
                { key: "enquires", label: "Enquires", controls: ["hide"] }
            ]
        },
        {
            label: "Manage Staffs",
            key: "menuStaffs",
            subModules: [
                { key: "roles", label: "Roles", controls: ["hide", "add", "edit", "delete"] },
                { key: "staffs", label: "Staffs", controls: ["hide", "view", "add", "edit", "delete"] }
            ]
        },
        {
            label: "Landlords",
            key: "landlords",
            isDirect: true, // No submodules
            controls: ["hide", "view", "add", "edit", "delete"]
        }
    ];

    // Helper to generate empty permission state
    const generateEmptyPermissions = () => {
        const perms = {};
        permissionStructure.forEach(section => {
            if (section.isDirect) {
                perms[section.key] = {};
                section.controls.forEach(c => (perms[section.key][c] = false));
            } else {
                perms[section.key] = {};
                section.subModules.forEach(sub => {
                    perms[section.key][sub.key] = {};
                    sub.controls.forEach(c => (perms[section.key][sub.key][c] = false));
                });
            }
        });
        return perms;
    };

    const initialFormState = {
        name: "",
        status: "Active",
        permissions: generateEmptyPermissions()
    };

    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await getRoles();
            setRoles(res.data.data || []);
        } catch {
            CommonToaster("Failed to fetch roles", "error");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (role = null) => {
        if (role) {
            setEditMode(true);
            setEditingRole(role);

            // Deep merge logic to ensure structure safety
            const mergedPermissions = generateEmptyPermissions();
            // We assume role.permissions matches our structure mostly
            if (role.permissions) {
                // Manually merge to avoid losing keys if backend misses some
                Object.keys(mergedPermissions).forEach(mainKey => {
                    if (role.permissions[mainKey]) {
                        if (permissionStructure.find(ps => ps.key === mainKey)?.isDirect) {
                            mergedPermissions[mainKey] = { ...mergedPermissions[mainKey], ...role.permissions[mainKey] };
                        } else {
                            // Submodules
                            Object.keys(mergedPermissions[mainKey]).forEach(subKey => {
                                if (role.permissions[mainKey][subKey]) {
                                    mergedPermissions[mainKey][subKey] = { ...mergedPermissions[mainKey][subKey], ...role.permissions[mainKey][subKey] };
                                }
                            });
                        }
                    }
                });
            }

            setForm({
                name: role.name,
                status: role.status,
                permissions: mergedPermissions
            });
        } else {
            setEditMode(false);
            setEditingRole(null);
            setForm(initialFormState);
        }
        setShowModal(true);
    };

    const togglePermission = (mainKey, subKey, type, value) => {
        setForm(prev => {
            const newPerms = { ...prev.permissions };

            if (subKey) {
                // Nested
                newPerms[mainKey] = {
                    ...newPerms[mainKey],
                    [subKey]: {
                        ...newPerms[mainKey][subKey],
                        [type]: value
                    }
                };
            } else {
                // Direct (Landlords)
                newPerms[mainKey] = {
                    ...newPerms[mainKey],
                    [type]: value
                };
            }
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode && editingRole?._id) {
                await updateRole(editingRole._id, form);
                CommonToaster("Role updated successfully", "success");
            } else {
                await createRole(form);
                CommonToaster("Role create successfully", "success");
            }
            setShowModal(false);
            fetchRoles();
        } catch (err) {
            CommonToaster(err.response?.data?.error || "Error saving role", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRole(deleteConfirm.id);
            CommonToaster("Role deleted successfully", "success");
            setDeleteConfirm({ show: false, id: null });
            fetchRoles();
        } catch {
            CommonToaster("Error deleting role", "error");
        }
    };

    const renderToggle = (mainKey, subKey, control) => {
        let checked = false;
        if (subKey) {
            checked = form.permissions[mainKey]?.[subKey]?.[control] || false;
        } else {
            checked = form.permissions[mainKey]?.[control] || false;
        }

        return (
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-1 border border-gray-200">
                <span className="text-gray-700 capitalize text-sm font-medium">
                    {control === 'hide' ? 'Hide Tab' : control.charAt(0).toUpperCase() + control.slice(1)}
                </span>
                <Switch
                    size="small"
                    checked={checked}
                    onChange={(val) => togglePermission(mainKey, subKey, control, val)}
                    className={`${checked ? 'bg-[#41398B]' : 'bg-gray-300'}`}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen px-6 py-6 bg-gradient-to-b from-white to-[#f3f2ff]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                        />
                    </div>

                    {can("menuStaffs.roles", "add") && (
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition shadow-md"
                        >
                            <Plus size={18} /> Add Role
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className={`transform transition-all duration-300 ${loading ? "opacity-70" : "opacity-100"}`}>
                {loading ? (
                    <CommonSkeleton rows={5} />
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">#</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">Name</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">Status</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((role, index) => (
                                    <tr key={role._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-500 font-medium">#{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">{role.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${role.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {role.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            {can("menuStaffs.roles", "edit") && (
                                                <button onClick={() => openModal(role)} className="p-2 bg-white border border-gray-200 hover:bg-[#41398B] hover:text-white rounded-full transition text-gray-600 shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {can("menuStaffs.roles", "delete") && (
                                                <button onClick={() => setDeleteConfirm({ show: true, id: role._id })} className="p-2 bg-white border border-gray-200 hover:bg-red-600 hover:text-white rounded-full transition text-gray-600 shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {roles.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-500">
                                            No roles found. Click "Add Role" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editMode ? "Edit Role" : "Add Role"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[#F9FAFB]">
                            <form id="roleForm" onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter role name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
                                        <Select
                                            value={form.status}
                                            onChange={(value) => setForm({ ...form, status: value })}
                                            className="w-full h-11 custom-select"
                                            popupClassName="custom-dropdown"
                                        >
                                            <Select.Option value="Active">Active</Select.Option>
                                            <Select.Option value="Inactive">Inactive</Select.Option>
                                        </Select>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        Permissions Matrix
                                    </h3>

                                    <div className="space-y-6">
                                        {permissionStructure.map((section) => (
                                            <div key={section.key} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                <div className="px-4 py-3 bg-[#f8f9fa] border-b border-gray-100 flex items-center gap-2">
                                                    <div className="w-1.5 h-5 bg-[#41398B] rounded-full"></div>
                                                    <span className="font-bold text-gray-800">{section.label}</span>
                                                </div>

                                                <div className="p-4">
                                                    {section.isDirect ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                                            {section.controls.map(control => (
                                                                <div key={control}>
                                                                    {renderToggle(section.key, null, control)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {section.subModules.map(sub => (
                                                                <div key={sub.key} className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                                                                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">{sub.label}</h4>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {sub.controls.map(control => (
                                                                            <div key={control}>
                                                                                {renderToggle(section.key, sub.key, control)}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="roleForm"
                                className="px-6 py-2.5 rounded-lg bg-[#41398B] hover:bg-[#41398be3] text-white transition font-medium shadow-md"
                            >
                                {editMode ? "Update Role" : "Create Role"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Delete Role?</h3>
                        <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
                            Are you sure you want to delete this role? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={handleDelete} className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}