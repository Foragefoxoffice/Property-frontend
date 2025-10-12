import axios from "axios";

// ✅ Create axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach JWT token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global response interceptor (optional but useful)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   🔐 AUTH APIs
========================================================= */
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const getMe = () => API.get("/auth/me");

/* =========================================================
   👤 USER APIs
========================================================= */
export const getAllUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

/* =========================================================
   🏠 PROPERTY APIs (Project / Community)
========================================================= */
export const getAllProperties = (params) => API.get("/property", { params });
export const createProperty = (data) => API.post("/property", data);
export const updateProperty = (id, data) => API.put(`/property/${id}`, data);
export const deleteProperty = (id) => API.delete(`/property/${id}`);

/* =========================================================
   🗺️ ZONE / SUB-AREA APIs
========================================================= */
export const getAllZoneSubAreas = (params) =>
  API.get("/zonesubarea", { params });
export const createZoneSubArea = (data) => API.post("/zonesubarea", data);
export const updateZoneSubArea = (id, data) =>
  API.put(`/zonesubarea/${id}`, data);
export const deleteZoneSubArea = (id) => API.delete(`/zonesubarea/${id}`);

/* =========================================================
   🏢 PROPERTY TYPE APIs
========================================================= */
export const getAllPropertyTypes = (params) =>
  API.get("/propertytype", { params });
export const createPropertyType = (data) => API.post("/propertytype", data);
export const updatePropertyType = (id, data) =>
  API.put(`/propertytype/${id}`, data);
export const deletePropertyType = (id) => API.delete(`/propertytype/${id}`);

/* =========================================================
   📊 AVAILABILITY STATUS APIs
========================================================= */
export const getAllAvailabilityStatuses = (params) =>
  API.get("/availabilitystatus", { params });
export const createAvailabilityStatus = (data) =>
  API.post("/availabilitystatus", data);
export const updateAvailabilityStatus = (id, data) =>
  API.put(`/availabilitystatus/${id}`, data);
export const deleteAvailabilityStatus = (id) =>
  API.delete(`/availabilitystatus/${id}`);

/* =========================================================
   ⚙️ UNIT APIs
========================================================= */
export const getAllUnits = (params) => API.get("/unit", { params });
export const createUnit = (data) => API.post("/unit", data);
export const updateUnit = (id, data) => API.put(`/unit/${id}`, data);
export const deleteUnit = (id) => API.delete(`/unit/${id}`);
export const markUnitAsDefault = (id) => API.put(`/unit/${id}/default`);

/* =========================================================
   🪑 FURNISHING APIs
========================================================= */
export const getAllFurnishings = (params) => API.get("/furnishing", { params });
export const createFurnishing = (data) => API.post("/furnishing", data);
export const updateFurnishing = (id, data) =>
  API.put(`/furnishing/${id}`, data);
export const deleteFurnishing = (id) => API.delete(`/furnishing/${id}`);

/* =========================================================
   🚗 PARKING AVAILABILITY APIs
========================================================= */
export const getAllParkings = (params) => API.get("/parking", { params });
export const createParking = (data) => API.post("/parking", data);
export const updateParking = (id, data) => API.put(`/parking/${id}`, data);
export const deleteParking = (id) => API.delete(`/parking/${id}`);

/* =========================================================
   🐶 PET POLICY APIs
========================================================= */
export const getAllPetPolicies = (params) => API.get("/petpolicy", { params });
export const createPetPolicy = (data) => API.post("/petpolicy", data);
export const updatePetPolicy = (id, data) => API.put(`/petpolicy/${id}`, data);
export const deletePetPolicy = (id) => API.delete(`/petpolicy/${id}`);

//

/* =========================================================
   💰 DEPOSIT APIs
========================================================= */
export const getAllDeposits = (params) => API.get("/deposit", { params });
export const createDeposit = (data) => API.post("/deposit", data);
export const updateDeposit = (id, data) => API.put(`/deposit/${id}`, data);
export const deleteDeposit = (id) => API.delete(`/deposit/${id}`);

/* =========================================================
   💳 PAYMENT APIs
========================================================= */
export const getAllPayments = (params) => API.get("/payment", { params });
export const createPayment = (data) => API.post("/payment", data);
export const updatePayment = (id, data) => API.put(`/payment/${id}`, data);
export const deletePayment = (id) => API.delete(`/payment/${id}`);

/* =========================================================
   👥 OWNERS / LANDLORDS APIs
========================================================= */
export const getAllOwners = (params) => API.get("/owners", { params });
export const createOwner = (data) => API.post("/owners", data);
export const updateOwner = (id, data) => API.put(`/owners/${id}`, data);
export const deleteOwner = (id) => API.delete(`/owners/${id}`);

/* =========================================================
   👥 STAFFS APIs
========================================================= */
export const getAllStaffs = () => API.get("/staffs");
export const createStaff = (data) => API.post("/staffs", data);
export const updateStaff = (id, data) => API.put(`/staffs/${id}`, data);
export const deleteStaff = (id) => API.delete(`/staffs/${id}`);

/* =========================================================
   💵 CURRENCY APIs
========================================================= */
export const getAllCurrencies = (params) => API.get("/currency", { params });
export const createCurrency = (data) => API.post("/currency", data);
export const updateCurrency = (id, data) => API.put(`/currency/${id}`, data);
export const deleteCurrency = (id) => API.delete(`/currency/${id}`);
export const markCurrencyAsDefault = (id) => API.put(`/currency/${id}/default`);

export const createPropertyListing = (data) =>
  API.post("/create-property", data);
export const getAllPropertyListings = (params) =>
  API.get("/create-property", { params });
export const updatePropertyListing = (id, data) =>
  API.put(`/create-property/${id}`, data);
export const deletePropertyListing = (id) =>
  API.delete(`/create-property/${id}`);

/* =========================================================
   ✨ EXPORT DEFAULT
========================================================= */
export default API;
