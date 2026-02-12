import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";


import App from "./App.jsx";
import "./index.css";
import Login from "./Login/Login.jsx";
import ForgotPassword from "./Login/ForgotPassword.jsx";
import ResetPassword from "./Login/ResetPassword.jsx";

import DashboardLayout from "./Admin/SideBar/DashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { LanguageProvider } from "./Language/LanguageContext.jsx";
import { PermissionProvider } from "./Context/PermissionContext.jsx";
import { FavoritesProvider } from "./Context/FavoritesContext.jsx";
import { SocketProvider } from "./Context/SocketContext.jsx";
import PublicLayout from "./components/Layout/PublicLayout.jsx";
import UserDashboardLayout from "./components/Layout/UserDashboardLayout.jsx";
import UserProfile from "./Pages/UserProfile.jsx";

import ManageProperty from "./Admin/Property/ManageProperty.jsx";
import PropertyShowcasePage from "./Admin/PropertyShowcase/PropertyShowcasePage.jsx";

import { ToastContainer } from "react-toastify";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ScrollUpButton from "./components/ScrollUpButton.jsx";
import FloatingContactButtons from "./components/FloatingContactButtons.jsx";

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
import AboutPageForm from "./AdminCms/AboutpageCms/AboutPageForm.jsx";
import ContactPageForm from "./AdminCms/ContactpageCms/ContactPageForm.jsx";
import CMSPlaceholder from "./AdminCms/CMSPlaceholder.jsx";
import HomePage from "./Pages/HomePage.jsx";
import AboutPage from "./Pages/AboutPage.jsx";
import ContactPage from "./Pages/ContactPage.jsx";
import BlogPage from "./Pages/BlogPage.jsx";
import BlogDetailPage from "./Pages/BlogDetailPage.jsx";
import BlogListPage from "./AdminCms/BlogCms/BlogListPage.jsx";
import BlogBannerPage from "./AdminCms/BlogCms/BlogBannerPage.jsx"; // Added
import BlogCmsForm from "./AdminCms/BlogCms/BlogCmsForm.jsx";
import CategoryListPage from "./AdminCms/CategoryCms/CategoryListPage.jsx";
import HeaderCmsForm from "./AdminCms/HeaderCms/HeaderCmsForm.jsx";
import FooterCmsForm from "./AdminCms/FooterCms/FooterCmsForm.jsx";
import AgentFormCms from "./AdminCms/AgentCms/AgentFormCms.jsx";
import Register from "./Login/Register.jsx";
import UsersDetails from "./Admin/UserDetails/UsersDetails.jsx";
import Roles from "./Admin/Property/Roles.jsx";
import ContactEnquiry from "./Admin/Enquiry/ContactEnquiry.jsx";
import Subscription from "./Admin/Subscription/Subscription.jsx";
import Favorites from "./Pages/Favorites.jsx";
import Enquires from "./Admin/Enquiry/Enquires.jsx";
import TermsCondionsForm from "./AdminCms/TermsCondionsCms/TermsCondionsForm.jsx";
import TermsConditionPage from "./Pages/TermsConditionPage.jsx";
import PrivacyPolicyForm from "./AdminCms/PrivacyPolicyCms/PrivacyPolicyForm.jsx";
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage.jsx";
import Notification from "./Admin/Notification/Notification.jsx";
import TestimonialsCms from "./AdminCms/TestimonialCms/TestimonialsCms.jsx";
import GiveTestimonial from "./Pages/GiveTestimonial.jsx";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <ScrollUpButton />
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

      <LanguageProvider>
        <PermissionProvider>
          <FavoritesProvider>
            <SocketProvider>
              <FloatingContactButtons />
              <Routes>
                {/* ---------- PUBLIC ROUTES ---------- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ---------- ADMIN + PROTECTED ROUTES ---------- */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
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

                  {/* USERMANAGEMENT PAGES */}
                  <Route path="user-details" element={<UsersDetails />} />
                  <Route path="enquiry" element={<Enquires />} />

                  {/* ENQUIRY PAGES */}
                  <Route path="contact-enquiry" element={<ContactEnquiry />} />

                  {/* Subscription PAGES */}
                  <Route path="subscription" element={<Subscription />} />

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

                  {/* ROLES */}
                  <Route path="roles" element={<Roles />} />

                  {/* ---------- STAFF ROUTES ---------- */}
                  <Route path="staffs" element={<Staffs />} />
                  <Route path="staffs/:id" element={<StaffView />} />

                  {/* ---------- TRASH ---------- */}
                  <Route path="trash" element={<ManageTrashProperty />} />

                  {/* CMS ROUTES */}
                  <Route path="cms/home" element={<HomepageForm />} />
                  <Route path="cms/about" element={<AboutPageForm />} />
                  <Route path="cms/contact" element={<ContactPageForm />} />
                  <Route path="cms/blogs" element={<BlogListPage />} />
                  <Route path="cms/blogs/create" element={<BlogCmsForm />} />
                  <Route path="cms/blogs/edit/:id" element={<BlogCmsForm />} />

                  <Route path="cms/categories" element={<CategoryListPage />} />
                  <Route path="cms/header" element={<HeaderCmsForm />} />
                  <Route path="cms/footer" element={<FooterCmsForm />} />
                  <Route path="cms/agent" element={<AgentFormCms />} />
                  <Route path="cms/blog-banner" element={<BlogBannerPage />} />
                  <Route path="cms/:section" element={<CMSPlaceholder />} />
                  <Route path="cms/terms-conditions" element={<TermsCondionsForm />} />
                  <Route path="cms/privacy-policy" element={<PrivacyPolicyForm />} />
                  <Route path="settings/notification" element={<Notification />} />
                  <Route path="settings/testimonials" element={<TestimonialsCms />} />
                  <Route path="profile" element={<UserProfile />} />


                </Route>

                {/* ---------- USER DASHBOARD ---------- */}
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute allowUser={true}>
                      <UserDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="favorites" element={<Favorites isDashboard={true} />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="give-testimonial" element={<GiveTestimonial />} />
                  <Route index element={<Favorites isDashboard={true} />} />
                </Route>

                {/* OTHER NON-DASHBOARD PAGES */}
                <Route path="/manage-property" element={<ManageProperty />} />
                <Route path="/filters" element={<FiltersPage />} />


                {/* Pages with Public Layout */}
                <Route element={<PublicLayout />}>
                  <Route path="/listing" element={<ListingPage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/blogs" element={<BlogPage />} />
                  <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                  <Route path="/terms-conditions" element={<TermsConditionPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

                  <Route path="/property-showcase/:id/:slug?" element={<PropertyShowcasePage />} />
                  <Route path="/favorites" element={<Favorites />} />

                </Route>

                {/* CMS Dashboard */}

              </Routes>
            </SocketProvider>
          </FavoritesProvider>
        </PermissionProvider>
      </LanguageProvider>
    </BrowserRouter>
  </HelmetProvider>
);
