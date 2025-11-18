import React, { useState, useEffect } from "react";
import Steps from "./Steps";
import CreatePropertyListStep1 from "./CreatePropertyListStep1";
import CreatePropertyListStep2 from "./CreatePropertyListStep2";
import CreatePropertyListStep3 from "./CreatePropertyListStep3";
import CreatePropertyListStep4 from "./CreatePropertyListStep4";
import {
  createPropertyListing,
  getAllProperties,
  getAllZoneSubAreas,
  getAllPropertyTypes,
  getAllAvailabilityStatuses,
  getAllUnits,
  getAllFurnishings,
  getAllParkings,
  getAllPetPolicies,
  updatePropertyListing,
  createZoneSubArea,
  createPayment,
  getAllPayments,
  createDeposit,
  getAllDeposits,
  getAllFeeTax,
  getAllLegalDocuments,
  getAllCurrencies,
  getAllOwners,
  getAllStaffs,
  getMe,
  getNextPropertyId,
  getAllBlocks,
  getAllFloorRanges,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import CreatePropertyListStep4SEO from "./CreatePropertyListStep4SEO";
import { useNavigate } from "react-router-dom";
/* =========================================================
   🧰 Safe Object Sanitizer
========================================================= */
function sanitizeObject(input, seen = new WeakSet()) {
  if (input === null || typeof input !== "object") return input;
  if (seen.has(input)) return undefined;
  seen.add(input);

  if (
    input instanceof File ||
    input instanceof Blob ||
    input instanceof Event ||
    input instanceof PointerEvent ||
    input instanceof HTMLElement ||
    input instanceof Window
  )
    return undefined;

  if (Array.isArray(input))
    return input
      .map((v) => sanitizeObject(v, seen))
      .filter((v) => v !== undefined);

  const result = {};
  for (const key in input) {
    try {
      if (key.startsWith("__react") || key.startsWith("_owner")) continue;
      const val = sanitizeObject(input[key], seen);
      if (val !== undefined) result[key] = val;
    } catch { }
  }
  return result;
}

/* =========================================================
   🧱 Main Component
========================================================= */
export default function CreatePropertyPage({
  editData = null,
  isEditMode = false,
  defaultTransactionType = null, // ✅ add this line
}) {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [savedId, setSavedId] = useState(null);
  const { language } = useLanguage();
  const [step3Api, setStep3Api] = useState({
    owners: [],
    staffs: [],
    me: null,
    loading: true,
  });
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const t = {
    en: {
      createProperty: "Create Property",
      step1Label: "Listing & Property Information",
      step2Label: "Library & finance Information",
      step3Label: "Landlord Information",
      step4Label: "Review & Publish",
      saving: "Saving...",
      posted: "Property Posted successfully!",
      errorSaving: "Error saving property draft",
    },
    vi: {
      createProperty: "Tạo Bất Động Sản",
      step1Label: "Thông Tin Liệt Kê & Bất Động Sản",
      step2Label: "Thông tin thư viện & tài chính",
      step3Label: "Thông tin chủ nhà",
      step4Label: "Xem Lại & Đăng Bài",
      saving: "Đang lưu...",
      posted: "Đăng bất động sản thành công!",
      errorSaving: "Lỗi khi lưu bản nháp bất động sản",
    },
  }[language];

  const getStepTitle = () => {
    if (defaultTransactionType === "Lease") {
      return language === "vi"
        ? "Tạo Bất Động Sản Cho Thuê"
        : "Create Lease Property";
    }
    if (defaultTransactionType === "Sale") {
      return language === "vi"
        ? "Tạo Bất Động Sản Bán"
        : "Create Sale Property";
    }
    if (defaultTransactionType === "Home Stay") {
      return language === "vi"
        ? "Tạo Bất Động Sản Home Stay"
        : "Create Home Stay Property";
    }

    // ✅ fallback to default original text
    return t.createProperty;
  };

  // ✅ Auto-generate propertyId based on selected Transaction Type
  useEffect(() => {
    if (!propertyData.transactionType) return;

    getNextPropertyId(propertyData.transactionType)
      .then((res) => {
        setPropertyData((prev) => ({
          ...prev,
          propertyId: res.data.nextId, // ✅ Save ID
        }));
      })
      .catch((err) => console.error("Property ID Error:", err));
  }, [propertyData.transactionType]);

  useEffect(() => {
    async function loadStep3Data() {
      try {
        const [ownersRes, staffsRes, meRes] = await Promise.all([
          getAllOwners(),
          getAllStaffs(),
          getMe(),
        ]);

        setStep3Api({
          owners: ownersRes.data?.data || [],
          staffs: staffsRes.data?.data || [],
          me: meRes?.data?.data || null,
          loading: false,
        });
      } catch (err) {
        console.log("Step3 API error:", err);
        setStep3Api((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStep3Data();
  }, []);

  /* =========================================================
     🔽 Fetch dropdown data first
  ========================================================== */
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [
          propsRes,
          zonesRes,
          typesRes,
          statusesRes,
          unitsRes,
          furnRes,
          parkRes,
          petRes,
          blocksRes,
          floorRangeRes,
          feeTaxRes,
          legalRes,
          depositsRes,
          paymentsRes,
          currenciesRes,
        ] = await Promise.all([
          getAllProperties(),
          getAllZoneSubAreas(),
          getAllPropertyTypes(),
          getAllAvailabilityStatuses(),
          getAllUnits(),
          getAllFurnishings(),
          getAllParkings(),
          getAllPetPolicies(),
          getAllBlocks(),
          getAllFloorRanges(),
          getAllFeeTax(),
          getAllLegalDocuments(),
          getAllDeposits(),
          getAllPayments(),
          getAllCurrencies(),
        ]);

        setDropdowns({
          properties: propsRes.data?.data || [],
          zones: zonesRes.data?.data || [],
          types: typesRes.data?.data || [],
          statuses: statusesRes.data?.data || [],
          units: unitsRes.data?.data || [],
          furnishings: furnRes.data?.data || [],
          parkings: parkRes.data?.data || [],
          pets: petRes.data?.data || [],
          blocks: blocksRes.data?.data || [],
          floorRanges: floorRangeRes.data?.data || [],
          feeTaxes: feeTaxRes.data?.data || [],
          legalDocs: legalRes.data?.data || [],
          deposits: depositsRes.data?.data || [],
          payments: paymentsRes.data?.data || [],
          currencies: currenciesRes.data?.data || [],
        });
      } catch (err) {
        console.error("Dropdown fetch error:", err);
      }
    }
    loadDropdowns();
  }, []);

  /* =========================================================
     🧩 Helper: Find ID from localized name
  ========================================================== */
  function findIdFromLocalized(arr, localized) {
    if (!arr || !localized) return "";
    const valEn = localized.en?.trim() || "";
    const valVi = localized.vi?.trim() || "";
    const found = arr.find(
      (i) =>
        i.name?.en === valEn ||
        i.name?.vi === valVi ||
        i.symbol?.en === valEn ||
        i.symbol?.vi === valVi
    );
    return found?._id || "";
  }

  /* =========================================================
     🔁 Load Edit Data into Form (after dropdowns are ready)
  ========================================================== */
  useEffect(() => {
    if (isEditMode && editData && Object.keys(dropdowns).length > 0) {
      const mapped = {
        // Listing info
        propertyId:
          editData.listingInformation?.listingInformationPropertyId || "",
        transactionType:
          editData.listingInformation?.listingInformationTransactionType?.en ||
          "",
        projectId: findIdFromLocalized(
          dropdowns.properties,
          editData.listingInformation?.listingInformationProjectCommunity
        ),
        propertyNo: editData.listingInformation
          ?.listingInformationPropertyNo || { en: "", vi: "" },
        zoneId: findIdFromLocalized(
          dropdowns.zones,
          editData.listingInformation?.listingInformationZoneSubArea
        ),

        zoneName:
          editData.listingInformation?.listingInformationZoneSubArea?.en ||
          editData.listingInformation?.listingInformationZoneSubArea?.vi ||
          "",

        zoneNameText:
          editData.listingInformation?.listingInformationZoneSubArea?.en ||
          editData.listingInformation?.listingInformationZoneSubArea?.vi ||
          "",
        title: editData.listingInformation?.listingInformationPropertyTitle || {
          en: "",
          vi: "",
        },
        // BLOCK
        blockId: findIdFromLocalized(
          dropdowns.blocks,
          editData.listingInformation?.listingInformationBlockName
        ),

        blockName: editData.listingInformation?.listingInformationBlockName || {
          en: "",
          vi: "",
        },

        blockNameText:
          editData.listingInformation?.listingInformationBlockName?.en ||
          editData.listingInformation?.listingInformationBlockName?.vi ||
          "",
        propertyType: findIdFromLocalized(
          dropdowns.types,
          editData.listingInformation?.listingInformationPropertyType
        ),
        dateListed:
          editData.listingInformation?.listingInformationDateListed?.split(
            "T"
          )[0] || "",
        availableFrom:
          editData.listingInformation?.listingInformationAvailableFrom?.split(
            "T"
          )[0] || "",
        availabilityStatus: findIdFromLocalized(
          dropdowns.statuses,
          editData.listingInformation?.listingInformationAvailabilityStatus
        ),

        // Property info
        unit: findIdFromLocalized(
          dropdowns.units,
          editData.propertyInformation?.informationUnit
        ),
        unitSize: editData.propertyInformation?.informationUnitSize || "",
        bedrooms: editData.propertyInformation?.informationBedrooms || "",
        bathrooms: editData.propertyInformation?.informationBathrooms || "",
        floors: editData.propertyInformation?.informationFloors || "",
        furnishing: findIdFromLocalized(
          dropdowns.furnishings,
          editData.propertyInformation?.informationFurnishing
        ),
        view: editData.propertyInformation?.informationView || {
          en: "",
          vi: "",
        },

        // Utilities
        utilities:
          editData.propertyUtility?.map((u) => ({
            name: u.propertyUtilityUnitName || { en: "", vi: "" },
            icon: u.propertyUtilityIcon || "",
          })) || [],

        // Description
        description: editData.whatNearby?.whatNearbyDescription || {
          en: "",
          vi: "",
        },

        // Images/Videos
        propertyImages:
          editData.imagesVideos?.propertyImages?.map((url) => ({ url })) || [],
        propertyVideos:
          editData.imagesVideos?.propertyVideo?.map((url) => ({ url })) || [],
        floorPlans:
          editData.imagesVideos?.floorPlan?.map((url) => ({ url })) || [],

        // Financial
        currency: {
          symbol: editData.financialDetails?.financialDetailsCurrency || "$",
        },
        price: editData.financialDetails?.financialDetailsPrice || "",
        leasePrice: editData.financialDetails?.financialDetailsLeasePrice || "",
        contractLength:
          editData.financialDetails?.financialDetailsContractLength || "",
        pricePerNight:
          editData.financialDetails?.financialDetailsPricePerNight || "",
        checkIn: editData.financialDetails?.financialDetailsCheckIn || "",
        checkOut: editData.financialDetails?.financialDetailsCheckOut || "",
        contractTerms: editData.financialDetails?.financialDetailsTerms || {
          en: "",
          vi: "",
        },
        depositPaymentTerms: editData.financialDetails
          ?.financialDetailsDeposit || {
          en: "",
          vi: "",
        },
        maintenanceFeeMonthly: editData.financialDetails
          ?.financialDetailsMainFee || {
          en: "",
          vi: "",
        },

        financialDetailsAgentFee:
          editData.financialDetails?.financialDetailsAgentFee || 0,

        financialDetailsAgentPaymentAgenda: editData.financialDetails
          ?.financialDetailsAgentPaymentAgenda || {
          en: "",
          vi: "",
        },

        financialDetailsFeeTax: editData.financialDetails
          ?.financialDetailsFeeTax || {
          en: "",
          vi: "",
        },

        financialDetailsLegalDoc: editData.financialDetails
          ?.financialDetailsLegalDoc || {
          en: "",
          vi: "",
        },

        // Contact management
        contactManagement: {
          contactManagementOwner: editData.contactManagement
            ?.contactManagementOwner || {
            en: "",
            vi: "",
          },
          contactManagementOwnerNotes: editData.contactManagement
            ?.contactManagementOwnerNotes || {
            en: "",
            vi: "",
          },
          contactManagementConsultant: editData.contactManagement
            ?.contactManagementConsultant || {
            en: "",
            vi: "",
          },
          contactManagementConnectingPoint: editData.contactManagement
            ?.contactManagementConnectingPoint || {
            en: "",
            vi: "",
          },
          contactManagementConnectingPointNotes: editData.contactManagement
            ?.contactManagementConnectingPointNotes || { en: "", vi: "" },
          contactManagementInternalNotes: editData.contactManagement
            ?.contactManagementInternalNotes || {
            en: "",
            vi: "",
          },
          contactManagementSource: editData.contactManagement
            ?.contactManagementSource || { en: "", vi: "" },
          contactManagementAgentFee:
            editData.contactManagement?.contactManagementAgentFee || 0,
        },
        seoInformation: {
          metaTitle: editData.seoInformation?.metaTitle || { en: "", vi: "" },
          metaDescription: editData.seoInformation?.metaDescription || {
            en: "",
            vi: "",
          },
          metaKeywords: editData.seoInformation?.metaKeywords || {
            en: [],
            vi: [],
          },
          slugUrl: editData.seoInformation?.slugUrl || { en: "", vi: "" },
          canonicalUrl: editData.seoInformation?.canonicalUrl || {
            en: "",
            vi: "",
          },
          schemaType: editData.seoInformation?.schemaType || { en: "", vi: "" },
          ogTitle: editData.seoInformation?.ogTitle || { en: "", vi: "" },
          ogDescription: editData.seoInformation?.ogDescription || {
            en: "",
            vi: "",
          },
          ogImages: editData.seoInformation?.ogImages || [],
          allowIndexing:
            editData.seoInformation?.allowIndexing !== undefined
              ? editData.seoInformation.allowIndexing
              : true,
        },

        status: editData.status || "Draft",
      };

      setPropertyData(mapped);
      setSavedId(editData._id);
    }
  }, [isEditMode, editData, dropdowns]);

  /* =========================================================
     📦 Build payload
  ========================================================== */
  const buildPayload = (normalized, dropdowns) => {
    const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
    const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
    const wrap = (val) => {
      if (!val) return { en: "", vi: "" };
      if (typeof val === "object" && "en" in val && "vi" in val)
        return { en: val.en || "", vi: val.vi || "" };
      if (typeof val === "string") return { en: val, vi: val };
      return { en: "", vi: "" };
    };

    const findLocalized = (arr, id, isUnit = false) => {
      if (!arr || !id) return { en: "", vi: "" };
      const item = arr.find(
        (i) =>
          i._id === id ||
          i._id === String(id) ||
          i.name?.en === id ||
          i.name?.vi === id ||
          i.symbol?.en === id ||
          i.symbol?.vi === id
      );
      if (!item) return { en: id, vi: id };

      if (isUnit) {
        return {
          en: item.symbol?.en || "",
          vi: item.symbol?.vi || "",
        };
      } else {
        return {
          en: item.name?.en || "",
          vi: item.name?.vi || "",
        };
      }
    };

    // ✅ Ensure SEO object always exists & sanitized
    const seo = normalized.seoInformation || {
      metaTitle: { en: "", vi: "" },
      metaDescription: { en: "", vi: "" },
      metaKeywords: { en: [], vi: [] },
      slugUrl: { en: "", vi: "" },
      canonicalUrl: { en: "", vi: "" },
      schemaType: { en: "", vi: "" },
      ogTitle: { en: "", vi: "" },
      ogDescription: { en: "", vi: "" },
      ogImages: [],
      allowIndexing: true,
    };

    // ✅ Helper for simple localized fields
    const wrapLocalized = (obj) => ({
      en: obj?.en ?? "",
      vi: obj?.vi ?? "",
    });

    const payload = {
      listingInformation: {
        listingInformationPropertyId: normalized.propertyId || "",
        listingInformationTransactionType: wrap(normalized.transactionType),
        listingInformationProjectCommunity: findLocalized(
          dropdowns.properties,
          normalized.projectId
        ),
        listingInformationPropertyNo: wrap(normalized.propertyNo),
        listingInformationZoneSubArea: wrap(normalized.zoneName),
        listingInformationPropertyTitle: wrap(normalized.title),
        listingInformationBlockName: wrap(normalized.blockName),
        listingInformationPropertyType: findLocalized(
          dropdowns.types,
          normalized.propertyType
        ),
        listingInformationDateListed:
          normalized.dateListed || new Date().toISOString(),
        listingInformationAvailabilityStatus: findLocalized(
          dropdowns.statuses,
          normalized.availabilityStatus
        ),
        listingInformationAvailableFrom:
          normalized.availableFrom || new Date().toISOString(),
      },

      propertyInformation: {
        informationUnit: findLocalized(dropdowns.units, normalized.unit, true),
        informationUnitSize: num(normalized.unitSize),
        informationBedrooms: num(normalized.bedrooms),
        informationBathrooms: num(normalized.bathrooms),
        informationFloors: wrap(normalized.floors),
        informationFurnishing: findLocalized(
          dropdowns.furnishings,
          normalized.furnishing
        ),
        informationView: wrap(normalized.view),
      },

      whatNearby: {
        whatNearbyDescription: wrap(normalized.description),
      },

      propertyUtility: safeArray(normalized.utilities).map((u) => ({
        propertyUtilityUnitName: wrap(u.name),
        propertyUtilityIcon: u.icon || "",
      })),

      imagesVideos: {
        propertyImages: safeArray(normalized.propertyImages).map((f) =>
          typeof f === "string" ? f : f.url || ""
        ),
        propertyVideo: safeArray(normalized.propertyVideos).map((f) =>
          typeof f === "string" ? f : f.url || ""
        ),
        floorPlan: safeArray(normalized.floorPlans).map((f) =>
          typeof f === "string" ? f : f.url || ""
        ),
      },

      financialDetails: {
        financialDetailsCurrency:
          typeof normalized.currency === "object"
            ? normalized.currency.name || "USD"
            : normalized.currency || "USD",
        financialDetailsPrice: num(normalized.price),
        financialDetailsTerms: wrap(normalized.contractTerms),
        financialDetailsDeposit: wrap(normalized.depositPaymentTerms),
        financialDetailsMainFee: wrap(normalized.maintenanceFeeMonthly),
        financialDetailsLeasePrice: num(normalized.leasePrice),
        financialDetailsContractLength: normalized.contractLength || "",
        financialDetailsPricePerNight: num(normalized.pricePerNight),
        financialDetailsCheckIn: normalized.checkIn || "",
        financialDetailsCheckOut: normalized.checkOut || "",
        financialDetailsAgentFee: num(normalized.financialDetailsAgentFee),
        financialDetailsAgentPaymentAgenda: wrap(
          normalized.financialDetailsAgentPaymentAgenda
        ),
        financialDetailsFeeTax: wrap(normalized.financialDetailsFeeTax),
        financialDetailsLegalDoc: wrap(normalized.financialDetailsLegalDoc),
      },

      contactManagement: {
        contactManagementOwner: wrap(
          normalized.contactManagement?.contactManagementOwner
        ),
        contactManagementOwnerNotes: wrap(
          normalized.contactManagement?.contactManagementOwnerNotes
        ),
        contactManagementConsultant: wrap(
          normalized.contactManagement?.contactManagementConsultant
        ),
        contactManagementConnectingPoint: wrap(
          normalized.contactManagement?.contactManagementConnectingPoint
        ),
        contactManagementConnectingPointNotes: wrap(
          normalized.contactManagement?.contactManagementConnectingPointNotes
        ),
        contactManagementInternalNotes: wrap(
          normalized.contactManagement?.contactManagementInternalNotes
        ),
        contactManagementSource: wrap(
          normalized.contactManagement?.contactManagementSource
        ),
        contactManagementAgentFee: parseFloat(
          normalized.contactManagement?.contactManagementAgentFee || 0
        ),
      },
      /* ✅ VISIBILITY SETTINGS */
      listingInformationVisibility: normalized.listingInformationVisibility || {
        transactionType: false,
        propertyId: false,
        projectCommunity: false,
        areaZone: false,
        blockName: false,
        propertyNo: false,
        dateListed: false,
        availableFrom: false,
        availabilityStatus: false,
      },

      propertyInformationVisibility:
        normalized.propertyInformationVisibility || {
          unit: false,
          unitSize: false,
          bedrooms: false,
          bathrooms: false,
          floorRange: false,
          furnishing: false,
          view: false,
        },

      titleVisibility: normalized.titleVisibility || false,
      descriptionVisibility: normalized.descriptionVisibility || false,
      propertyUtilityVisibility: normalized.propertyUtilityVisibility || false,

      videoVisibility: normalized.videoVisibility ?? false,
      floorImageVisibility: normalized.floorImageVisibility ?? false,

      financialVisibility: {
        contractLength: normalized.financialVisibility?.contractLength ?? false,
        deposit: normalized.financialVisibility?.deposit ?? false,
        paymentTerm: normalized.financialVisibility?.paymentTerm ?? false,
        feeTaxes: normalized.financialVisibility?.feeTaxes ?? false,
        legalDocs: normalized.financialVisibility?.legalDocs ?? false,
        agentFee: normalized.financialVisibility?.agentFee ?? false,
        checkIn: normalized.financialVisibility?.checkIn ?? false,
        checkOut: normalized.financialVisibility?.checkOut ?? false,
        maintenanceFeeMonthly:
          normalized.financialVisibility?.maintenanceFeeMonthly ?? false,
        depositPaymentTerms:
          normalized.financialVisibility?.depositPaymentTerms ?? false,
      },

      // SEO
      seoInformation: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        metaKeywords: seo.metaKeywords,
        slugUrl: seo.slugUrl,
        canonicalUrl: seo.canonicalUrl,
        schemaType: seo.schemaType,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        ogImages: seo.ogImages || [],
        allowIndexing: seo.allowIndexing,
      },
      status: normalized.status || "Draft",
    };

    return payload;
  };

  /* =========================================================
   💾 Save Draft (Final Fixed Version)
========================================================= */
  const handleSaveDraft = async (dataFromStep = null) => {
    setLoading(true);
    try {
      const mergedData = sanitizeObject({
        ...propertyData,
        ...(dataFromStep || {}),
      });

      if (mergedData.blockNameText) {
        mergedData.blockName = {
          en: mergedData.blockNameText,
          vi: mergedData.blockNameText,
        };
      }
      if (mergedData.zoneName) {
        mergedData.zone = {
          en: mergedData.zoneName,
          vi: mergedData.zoneName,
        };
      }
      const payload = buildPayload(mergedData, dropdowns);

      /* 🟢 AUTO-CREATE NEW ZONE / DEPOSIT / PAYMENT TERMS BEFORE SAVING */

      // ✅ Helper: Normalize any localized field (string or object)
      const normalizeLocalized = (val) => {
        if (!val) return { en: "", vi: "" };
        if (typeof val === "string") return { en: val.trim(), vi: val.trim() };
        if (typeof val === "object") {
          const en = val.en?.trim() || val.vi?.trim() || "";
          const vi = val.vi?.trim() || val.en?.trim() || "";
          return { en, vi };
        }
        return { en: "", vi: "" };
      };

      const zoneName =
        mergedData.zoneName || mergedData.zone?.en || mergedData.zone?.vi || "";
      const deposit = normalizeLocalized(mergedData.depositPaymentTerms);
      const paymentTerm = normalizeLocalized(mergedData.maintenanceFeeMonthly);

      const depositNameEn = deposit.en;
      const depositNameVi = deposit.vi;
      const paymentTermNameEn = paymentTerm.en;
      const paymentTermNameVi = paymentTerm.vi;

      /* === 🏙️ ZONE === */
      const isExistingZone =
        dropdowns.zones?.some((z) => z._id === zoneName) ||
        dropdowns.zones?.some(
          (z) => z.name?.en === zoneName || z.name?.vi === zoneName
        );

      if (zoneName && !isExistingZone && typeof zoneName === "string") {
        try {
          await createZoneSubArea({
            code_en: zoneName.slice(0, 3).toUpperCase(),
            code_vi: zoneName.slice(0, 3).toUpperCase(),
            name_en: zoneName,
            name_vi: zoneName,
            status: "Active",
          });

          const zonesRes = await getAllZoneSubAreas();
          setDropdowns((prev) => ({
            ...prev,
            zones: zonesRes.data?.data || [],
          }));
        } catch (zoneErr) {
          console.warn("Zone creation skipped:", zoneErr.message);
        }
      }

      /* === 🏦 DEPOSIT === */
      const isExistingDeposit =
        dropdowns.deposits?.some(
          (d) => d.name?.en === depositNameEn || d.name?.vi === depositNameVi
        ) || false;

      if ((depositNameEn || depositNameVi) && !isExistingDeposit) {
        try {
          await createDeposit({
            code_en: (depositNameEn || depositNameVi).slice(0, 3).toUpperCase(),
            code_vi: (depositNameEn || depositNameVi).slice(0, 3).toUpperCase(),
            name_en: depositNameEn || depositNameVi,
            name_vi: depositNameVi || depositNameEn,
            status: "Active",
          });

          const depRes = await getAllDeposits();
          setDropdowns((prev) => ({
            ...prev,
            deposits: depRes.data?.data || [],
          }));
        } catch (depErr) {
          console.warn("Deposit creation skipped:", depErr.message);
        }
      }

      /* === 💳 PAYMENT TERM === */
      const isExistingPayment =
        dropdowns.payments?.some(
          (p) =>
            p.name?.en === paymentTermNameEn || p.name?.vi === paymentTermNameVi
        ) || false;

      if ((paymentTermNameEn || paymentTermNameVi) && !isExistingPayment) {
        try {
          await createPayment({
            code_en: (paymentTermNameEn || paymentTermNameVi)
              .slice(0, 3)
              .toUpperCase(),
            code_vi: (paymentTermNameEn || paymentTermNameVi)
              .slice(0, 3)
              .toUpperCase(),
            name_en: paymentTermNameEn || paymentTermNameVi,
            name_vi: paymentTermNameVi || paymentTermNameEn,
            status: "Active",
          });

          const payRes = await getAllPayments();
          setDropdowns((prev) => ({
            ...prev,
            payments: payRes.data?.data || [],
          }));
        } catch (payErr) {
          console.warn("Payment term creation skipped:", payErr.message);
        }
      }

      /* 🟢 END AUTO-CREATION BLOCK */
      let res;
      if (isEditMode && editData?._id) {
        res = await updatePropertyListing(String(editData._id), payload);
      } else if (savedId) {
        res = await updatePropertyListing(savedId, payload);
      } else {
        res = await createPropertyListing(payload);
      }

      const id = res?.data?.data?._id;
      setSavedId(id);
      setStep(4);
    } catch (err) {
      console.error("❌ Draft save error:", err);
      CommonToaster(t.errorSaving, "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     🚀 Publish or Update Status
  ========================================================== */
  const handleSubmitStatus = async (status) => {
    if (!savedId) return;
    setLoading(true);
    try {
      await updatePropertyListing(savedId, { status });
      CommonToaster(
        language === "vi"
          ? `Bất động sản đã được đăng và đánh dấu là ${status === "Published" ? "Đã đăng" : "Bản nháp"
          }!`
          : `Property Posted and marked as ${status}!`,
        "success"
      );
      if (goBack) goBack();
    } catch (err) {
      console.error(err);
      CommonToaster("❌ Error updating status", "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Step Change
  ========================================================== */
  const handleStepChange = (updatedStepData) => {
    setPropertyData((prev) => ({ ...prev, ...updatedStepData }));
  };

  const steps = [
    { title: getStepTitle(), label: t.step1Label },
    { title: getStepTitle(), label: t.step2Label },
    { title: getStepTitle(), label: t.step3Label },
    { title: getStepTitle(), label: "SEO Information" },
    { title: getStepTitle(), label: t.step4Label },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CreatePropertyListStep1
            onNext={() => setStep(2)}
            onChange={handleStepChange}
            initialData={propertyData}
            defaultTransactionType={defaultTransactionType}
            dropdowns={dropdowns}
          />
        );
      case 2:
        return (
          <CreatePropertyListStep2
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
            onChange={handleStepChange}
            initialData={propertyData}
            dropdowns={dropdowns}
            dropdownLoading={!dropdowns.currencies}
          />
        );
      case 3:
        return (
          <CreatePropertyListStep3
            onPrev={() => setStep(2)}
            onChange={handleStepChange}
            initialData={propertyData}
            onSave={handleSaveDraft}
            owners={step3Api.owners}
            staffs={step3Api.staffs}
            me={step3Api.me}
            loading={step3Api.loading}
          />
        );
      case 4:
        return (
          <CreatePropertyListStep4SEO
            onNext={() =>
              handleSaveDraft({
                seoInformation: propertyData.seoInformation,
              }).then(() => setStep(5))
            }
            onPrev={() => setStep(3)}
            onChange={handleStepChange}
            initialData={propertyData}
          />
        );

      case 5:
        return (
          <CreatePropertyListStep4
            savedId={savedId}
            onPublish={() => handleSubmitStatus("Published")}
            onPrev={() => setStep(4)}
          />
        );

      default:
        return null;
    }
  };

  /* =========================================================
     Render
  ========================================================== */
  return (
    <Steps
      steps={steps}
      currentStep={step}
      onNext={() => step < steps.length && setStep(step + 1)}
      onPrev={() => setStep((s) => Math.max(1, s - 1))}
      onCancel={goBack}
      onSubmit={() => handleSubmitStatus("Published")} // ✅ NEW
    >
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
          </div>
        )}
        {renderStepContent()}
      </div>
    </Steps>
  );
}
