import axios from "axios";

// ✅ Create axios instance
const API = axios.create({
  baseURL: (
    import.meta.env.VITE_API_URL || "https://dev.placetest.in/api/v1"
  ).replace(/\/$/, ""),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically attach JWT token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log bulk upload requests
    if (config.url?.includes('bulk-upload')) {
      console.log("📤 Axios Request Config:", {
        url: config.url,
        method: config.method,
        data: config.data,
        dataKeys: config.data ? Object.keys(config.data) : []
      });
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
      window.location.href = "/";
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
// ❗ FINAL, CORRECT DELETE FUNCTION
export const deleteProjectCommunity = (id) => API.delete(`/property/${id}`);
export const getSingleListingByPropertyID = (id) =>
  API.get(`/create-property/pid/${id}`);

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
export const permanentlyDeleteProperty = (id) =>
  API.delete(`/create-property/permanent-delete/${id}`);

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

// ✅ BLOCK APIs
export const getAllBlocks = (params) => API.get("/block", { params });
export const createBlock = (data) => API.post("/block", data);
export const updateBlock = (id, data) => API.put(`/block/${id}`, data);
export const deleteBlock = (id) => API.delete(`/block/${id}`);

/* =========================================================
   📌 FEE / TAX APIs
========================================================= */
export const getAllFeeTax = (params) => API.get("/feetax", { params });
export const createFeeTax = (data) => API.post("/feetax", data);
export const updateFeeTax = (id, data) => API.put(`/feetax/${id}`, data);
export const deleteFeeTax = (id) => API.delete(`/feetax/${id}`);

/* =========================================================
   📄 LEGAL DOCUMENT APIs
========================================================= */
export const getAllLegalDocuments = (params) =>
  API.get("/legaldocument", { params });
export const createLegalDocument = (data) => API.post("/legaldocument", data);
export const updateLegalDocument = (id, data) =>
  API.put(`/legaldocument/${id}`, data);
export const deleteLegalDocument = (id) => API.delete(`/legaldocument/${id}`);

/* =========================================================
   🏢 FLOOR RANGE APIs
========================================================= */
export const getAllFloorRanges = (params) => API.get("/floorrange", { params });
export const createFloorRange = (data) => API.post("/floorrange", data);
export const updateFloorRange = (id, data) =>
  API.put(`/floorrange/${id}`, data);
export const deleteFloorRange = (id) => API.delete(`/floorrange/${id}`);

export const createPropertyListing = (data) => {
  console.log(
    "🔍 Creating Property via:",
    API.defaults.baseURL + "/create-property"
  );
  return API.post("/create-property", data);
};
export const getAllPropertyListings = (params) =>
  API.get("/create-property", { params });
export const getSingleProperty = (id) =>
  API.get(`/create-property/${id}`);
export const updatePropertyListing = (id, data) =>
  API.put(`/create-property/${id}`, data);
export const deletePropertyListing = (id) =>
  API.delete(`/create-property/${id}`);
export const getNextPropertyId = (transactionType) =>
  API.get(`/create-property/next-id`, {
    params: { transactionType },
  });

/* =========================================================
   📋 COPY PROPERTY APIs
========================================================= */
export const copyPropertyToSale = (id) =>
  API.post(`/create-property/copy/sale/${id}`);

export const copyPropertyToLease = (id) =>
  API.post(`/create-property/copy/lease/${id}`);

export const copyPropertyToHomeStay = (id) =>
  API.post(`/create-property/copy/homestay/${id}`);
export const restoreProperty = (id) =>
  API.put(`/create-property/restore/${id}`);



// NEW — Get by Transaction Type + Pagination
export const getPropertiesByTransactionType = (params) =>
  API.get("/create-property/transaction", { params });

export const getTrashProperties = (params) =>
  API.get("/create-property/trash", { params });

// NEW — Optimized Listing Page API with Filters
export const getListingProperties = (params) =>
  API.get("/create-property/listing", { params });

/* =========================================================
   📤 BULK UPLOAD APIs
========================================================= */
export const bulkUploadProperties = (csvData, transactionType, validateOnly = false) => {
  console.log("🎯 bulkUploadProperties called with:");
  console.log("   - csvData (length):", csvData?.length);
  console.log("   - transactionType:", transactionType);
  console.log("   - validateOnly:", validateOnly);
  console.log("   - Payload being sent:", { csvData: csvData?.substring(0, 30) + "...", transactionType, validateOnly });

  return API.post("/create-property/bulk-upload", { csvData, transactionType, validateOnly });
};

/* =========================================================
   🏠 HOME BANNER CMS APIs
========================================================= */
export const getAllHomeBanners = (params) => API.get("/home-banner", { params });
export const getHomeBannerById = (id) => API.get(`/home-banner/${id}`);
export const createHomeBanner = (data) => API.post("/home-banner", data);
export const updateHomeBanner = (id, data) => API.put(`/home-banner/${id}`, data);
export const deleteHomeBanner = (id) => API.delete(`/home-banner/${id}`);
export const getActiveHomeBanner = () => API.get("/home-banner/active");
export const uploadBannerImage = (file) => {
  const formData = new FormData();
  formData.append("backgroundImage", file);

  // Use plain axios to avoid Content-Type conflicts
  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_URL || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/home-banner/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🏠 HOME PAGE CMS APIs
========================================================= */
export const getHomePage = () => API.get("/home-page");
export const createHomePage = (data) => API.post("/home-page", data);
export const updateHomePage = (id, data) => API.put(`/home-page/${id}`, data);
export const uploadHomePageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_URL || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/home-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};



/* =========================================================
   📄 ABOUT PAGE CMS APIs
========================================================= */
export const getAboutPage = () => API.get("/about-page");
export const createAboutPage = (data) => API.post("/about-page", data);
export const updateAboutPage = (id, data) => API.put(`/about-page/${id}`, data);
export const uploadAboutPageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_URL || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/about-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   📞 CONTACT PAGE CMS APIs
========================================================= */
export const getContactPage = () => API.get("/contact-page");
export const createContactPage = (data) => API.post("/contact-page", data);
export const updateContactPage = (id, data) => API.put(`/contact-page/${id}`, data);
export const uploadContactPageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_URL || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/contact-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   ✨ EXPORT DEFAULT
========================================================= */
export default API;
