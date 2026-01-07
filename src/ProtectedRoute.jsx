// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { CommonToaster } from "./Common/CommonToaster";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Check if user has admin role
  // Check if user has admin privileges (any role other than 'user')
  if (userRole === "user") {
    CommonToaster("Access Denied: Admin privileges required", "error");
    // Clear storage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    return <Navigate to="/" replace />;
  }

  return children;
}
