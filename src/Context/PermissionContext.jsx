import React, { createContext, useContext, useEffect, useState } from "react";
import { getRoles } from "../Api/action";

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [userRole, setUserRole] = useState(null);
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

    const isHidden = (path) => {
        if (!userRole) return true;

        if (userRole.toLowerCase() === 'admin' && !permissions) return false;

        if (!permissions) return true;

        const parts = path.split('.');
        let current = permissions;
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
        if (!userRole) return false;

        if (userRole.toLowerCase() === 'admin' && !permissions) return true;

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
        return value !== true && value !== "true";
    };

    return (
        <PermissionContext.Provider value={{ isHidden, can, userRole, loading, refreshPermissions: fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};
