import React, { createContext, useContext, useEffect, useState } from "react";
import { getRoles } from "../Api/action";

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isApprover, setIsApprover] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = async () => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");
        setUserRole(role);

        if (role && token) {
            try {
                const res = await getRoles();
                if (res?.data?.data) {
                    const rolesData = res.data.data;
                    // Robust matching: trim and lowercase
                    const currentRole = rolesData.find(r => r.name?.trim().toLowerCase() === role.trim().toLowerCase());

                    if (currentRole) {
                        setPermissions(currentRole.permissions);
                        setIsApprover(currentRole.isApprover || false);
                        setLoading(false);
                        return currentRole.permissions;
                    } else {
                        console.warn(`PermissionContext: Role '${role}' not found in DB. Available:`, rolesData.map(r => r.name));
                        setPermissions(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        } else {
            setPermissions(null);
            setUserRole(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const isHidden = (path, customPermissions = null) => {
        const role = userRole || localStorage.getItem("userRole");
        if (!role) return true;

        // Super Admin has access to everything
        if (role.toLowerCase() === 'super admin') return false;

        if (role.toLowerCase() === 'admin' && !permissions && !customPermissions) return false;

        const currentPermissions = customPermissions || permissions;
        if (!currentPermissions) return true;

        const parts = path.split('.');
        let current = currentPermissions;
        for (const part of parts) {
            if (current && current[part]) {
                current = current[part];
            } else {
                return false;
            }
        }
        return current.hide === true || current.hide === "true";
    };

    const can = (path, action) => {
        const role = userRole || localStorage.getItem("userRole");
        if (!role) return false;

        // Super Admin has access to everything
        if (role.toLowerCase() === 'super admin') return true;

        if (role.toLowerCase() === 'admin' && !permissions) return true;

        if (!permissions) return false;

        const parts = path.split('.');
        let current = permissions;
        for (const part of parts) {
            if (current && current[part]) {
                current = current[part];
            } else {
                return true;
            }
        }

        const value = current[action];
        return value === true || value === "true";
    };

    const getFirstAccessiblePath = (customPermissions = null) => {
        const role = userRole || localStorage.getItem("userRole");
        if (!role) return "/login";

        // Super Admin default
        if (role.toLowerCase() === 'super admin') return "/dashboard/lease";

        const priorityPaths = [
            { path: "properties.lease", route: "/dashboard/lease" },
            { path: "properties.sale", route: "/dashboard/sale" },
            { path: "properties.homestay", route: "/dashboard/homestay" },
            { path: "userManagement.userDetails", route: "/dashboard/user-details" },
            { path: "userManagement.enquires", route: "/dashboard/enquiry" },
            { path: "menuStaffs.roles", route: "/dashboard/roles" },
            { path: "menuStaffs.staffs", route: "/dashboard/staffs" },
            { path: "otherEnquiry.contactEnquiry", route: "/dashboard/contact-enquiry" },
            { path: "blogs.subscription", route: "/dashboard/subscription" },
            { path: "cms.homePage", route: "/dashboard/cms/home" },
            { path: "blogs.blogCms", route: "/dashboard/cms/blogs" },
            { path: "landlords", route: "/dashboard/landlords" },
            { path: "masters", route: "/dashboard/masters" },
            { path: "settings.notification", route: "/dashboard/settings/notification" },
            { path: "settings.testimonials", route: "/dashboard/settings/testimonials" }
        ];

        for (const item of priorityPaths) {
            if (!isHidden(item.path, customPermissions)) {
                return item.route;
            }
        }

        return "/dashboard/profile";
    };

    return (
        <PermissionContext.Provider value={{ isHidden, can, getFirstAccessiblePath, userRole, isApprover, loading, refreshPermissions: fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};
