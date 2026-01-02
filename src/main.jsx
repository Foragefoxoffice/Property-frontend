import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";
import Login from "./Login/Login.jsx";
import ForgotPassword from "./Login/ForgotPassword.jsx";
import ResetPassword from "./Login/ResetPassword.jsx";

import DashboardLayout from "./Admin/SideBar/DashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { LanguageProvider } from "./Language/LanguageContext.jsx";

import ManageProperty from "./Admin/Property/ManageProperty.jsx";
import PropertyShowcasePage from "./Admin/PropertyShowcase/PropertyShowcasePage.jsx";

import { ToastContainer } from "react-toastify";

// ADMIN PAGES
import PropertyManager from "./Admin/Property/PropertyManager";
import CreatePropertyPage from "./Admin/CreateProperty/CreatePropertyPage";

import Masters from "./Admin/Masters/Masters";
import PropertyMaster from "./Admin/MasterList/PropertyMaster";
import PropertyPage from "./Admin/MasterList/MasterListPage/PropertyPage";
import ZoneSubAreaPage from "./Admin/MasterList/MasterListPage/ZoneSubAreaPage";
import BlockPage from "./Admin/MasterList/MasterListPage/BlockPage";
import PropertTypePage from "./Admin/MasterList/MasterListPage/PropertTypePage";
import AvailabilityStatusPage from "./Admin/MasterList/MasterListPage/AvailabilityStatusPage";
import UnitPage from "./Admin/MasterList/MasterListPage/UnitPage";
import FurnishingPage from "./Admin/MasterList/MasterListPage/FurnishingPage";
import ParkingPage from "./Admin/MasterList/MasterListPage/ParkingPage";
import PetPolicyPage from "./Admin/MasterList/MasterListPage/PetPolicyPage";
import DepositPage from "./Admin/MasterList/MasterListPage/DepositPage";
import PaymentPage from "./Admin/MasterList/MasterListPage/PaymentPage";
import FeeTaxPage from "./Admin/MasterList/MasterListPage/FeeTaxPage";
import LegalDocumentPage from "./Admin/MasterList/MasterListPage/LegalDocumentPage";
import FloorRange from "./Admin/MasterList/MasterListPage/FloorRangePage";
import Currency from "./Admin/Currency/Currency";

import OwnersLandlords from "./Admin/Property/OwnersLandlords";
import OwnerView from "./Admin/AddMembers/OwnerView";
import Staffs from "./Admin/Property/Staffs";
import StaffView from "./Admin/AddMembers/StaffView";

import TrashPage from "./Admin/Trash/TrashPage";
import ManageTrashProperty from "./Admin/Property/ManageTrashProperty.jsx"
import FiltersPage from "./Admin/Filters/Filter.jsx";
import BulkUpload from "./Admin/Property/BulkUpload.jsx";

// Pages
import ListingPage from "./Pages/ListingPage";
import HomepageForm from "./AdminCms/HomepageCms/HomepageForm.jsx";
import CMSPlaceholder from "./AdminCms/CMSPlaceholder.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastContainer
      position="top-right"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      draggable
      pauseOnHover
      theme="colored"
    />

    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ---------- ADMIN + PROTECTED ROUTES ---------- */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <LanguageProvider>
              <DashboardLayout />
            </LanguageProvider>
          </ProtectedRoute>
        }
      >
        {/* ---------- PROPERTY LIST PAGES ---------- */}
        <Route
          path="lease"
          element={<PropertyManager propertyTypeFilter="Lease" />}
        />
        <Route
          path="sale"
          element={<PropertyManager propertyTypeFilter="Sale" />}
        />
        <Route
          path="homestay"
          element={<PropertyManager propertyTypeFilter="Home Stay" />}
        />

        {/* CREATE / EDIT PROPERTY */}
        <Route
          path="lease/create"
          element={<CreatePropertyPage defaultTransactionType="Lease" />}
        />
        <Route
          path="sale/create"
          element={<CreatePropertyPage defaultTransactionType="Sale" />}
        />
        <Route
          path="homestay/create"
          element={<CreatePropertyPage defaultTransactionType="Home Stay" />}
        />

        <Route
          path="lease/edit/:id"
          element={
            <CreatePropertyPage isEditMode defaultTransactionType="Lease" />
          }
        />
        <Route
          path="sale/edit/:id"
          element={
            <CreatePropertyPage isEditMode defaultTransactionType="Sale" />
          }
        />
        <Route
          path="homestay/edit/:id"
          element={
            <CreatePropertyPage
              isEditMode
              defaultTransactionType="Home Stay"
            />
          }
        />

        {/* BULK UPLOAD ROUTES */}
        <Route
          path=":type/bulk-upload"
          element={<BulkUpload />}
        />

        {/* ---------- MASTER ROUTES ---------- */}
        <Route path="masters" element={<Masters />} />
        <Route path="masters/property-master" element={<PropertyMaster />} />
        <Route path="masters/property" element={<PropertyPage />} />
        <Route path="masters/zone-sub-area" element={<ZoneSubAreaPage />} />
        <Route path="masters/block" element={<BlockPage />} />
        <Route path="masters/property-type" element={<PropertTypePage />} />
        <Route
          path="masters/availability-status"
          element={<AvailabilityStatusPage />}
        />
        <Route path="masters/unit" element={<UnitPage />} />
        <Route path="masters/furnishing" element={<FurnishingPage />} />
        <Route path="masters/parking" element={<ParkingPage />} />
        <Route path="masters/pet-policy" element={<PetPolicyPage />} />
        <Route path="masters/deposit" element={<DepositPage />} />
        <Route path="masters/payment" element={<PaymentPage />} />
        <Route path="masters/fee-tax" element={<FeeTaxPage />} />
        <Route
          path="masters/legal-document"
          element={<LegalDocumentPage />}
        />
        <Route path="masters/floor-range" element={<FloorRange />} />
        <Route path="masters/currency" element={<Currency />} />

        {/* ---------- LANDLORD ROUTES ---------- */}
        <Route path="landlords" element={<OwnersLandlords />} />
        <Route path="landlords/:id" element={<OwnerView />} />

        {/* ---------- STAFF ROUTES ---------- */}
        <Route path="staffs" element={<Staffs />} />
        <Route path="staffs/:id" element={<StaffView />} />

        {/* ---------- TRASH ---------- */}
        <Route path="trash" element={<ManageTrashProperty />} />

        {/* CMS ROUTES */}
        <Route path="cms/home" element={<HomepageForm />} />
        <Route path="cms/:section" element={<CMSPlaceholder />} />
      </Route>

      {/* OTHER NON-DASHBOARD PAGES */}
      <Route path="/manage-property" element={<ManageProperty />} />
      <Route path="/filters" element={<FiltersPage />} />
      <Route
        path="/property-showcase/:id"
        element={<PropertyShowcasePage />}
      />
      {/* Pages */}
      <Route path="/listing" element={<ListingPage />} />

      {/* CMS Dashboard */}

    </Routes>
  </BrowserRouter>
);
