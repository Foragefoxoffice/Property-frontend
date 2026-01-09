// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { CommonToaster } from "./Common/CommonToaster";

export default function ProtectedRoute({ children, allowUser = false }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Check if user has admin role
  // Check if user has admin privileges (any role other than 'user')
  // If allowUser is true, we skip this check for 'user' role
  if (userRole === "user" && !allowUser) {
    CommonToaster("Access Denied: Admin privileges required", "error");
    // Clear storage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    return <Navigate to="/" replace />;
  }

  return children;
}
