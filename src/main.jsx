import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login/Login.jsx";
import ForgotPassword from "./Login/ForgotPassword.jsx";
import ResetPassword from "./Login/ResetPassword.jsx";
import DashboardLayout from "./Admin/SideBar/DashboardLayout.jsx";
import { ToastContainer } from "react-toastify";
import ManageProperty from "./Admin/Property/ManageProperty.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { LanguageProvider } from "./Language/LanguageContext.jsx";
import PropertyShowcasePage from "./Admin/PropertyShowcase/PropertyShowcasePage";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LanguageProvider>
                <DashboardLayout />{" "}
              </LanguageProvider>
            </ProtectedRoute>
          }
        />
        <Route path="/manage-property" element={<ManageProperty />} />
        <Route
          path="/property-showcase/:id"
          element={<PropertyShowcasePage />}
        />
        {/* Add other routes as needed */}
      </Routes>
    </StrictMode>
  </BrowserRouter>
);
