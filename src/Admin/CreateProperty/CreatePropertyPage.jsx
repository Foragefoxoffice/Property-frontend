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
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";


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
  goBack,
  editData = null,
  isEditMode = false,
}) {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [savedId, setSavedId] = useState(null);
  const { language } = useLanguage();

  const t = {
    en: {
      createProperty: "Create Property",
      step1Label: "Listing & Property Information",
      step2Label: "Media & Financial Information",
      step3Label: "Contact / Management Details",
      step4Label: "Review & Publish",
      saving: "Saving...",
      posted: "Property Posted successfully!",
      errorSaving: "Error saving property draft",
    },
    vi: {
      createProperty: "Tạo Bất Động Sản",
      step1Label: "Thông Tin Liệt Kê & Bất Động Sản",
      step2Label: "Phương Tiện & Thông Tin Tài Chính",
      step3Label: "Chi Tiết Liên Hệ / Quản Lý",
      step4Label: "Xem Lại & Đăng Bài",
      saving: "Đang lưu...",
      posted: "Đăng bất động sản thành công!",
      errorSaving: "Lỗi khi lưu bản nháp bất động sản",
    },
  }[language];

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
        ] = await Promise.all([
          getAllProperties(),
          getAllZoneSubAreas(),
          getAllPropertyTypes(),
          getAllAvailabilityStatuses(),
          getAllUnits(),
          getAllFurnishings(),
          getAllParkings(),
          getAllPetPolicies(),
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
        propertyNo: editData.listingInformation?.listingInformationPropertyNo || { en: "", vi: "" },
        zoneId: findIdFromLocalized(
          dropdowns.zones,
          editData.listingInformation?.listingInformationZoneSubArea
        ),
        title: editData.listingInformation?.listingInformationPropertyTitle || {
          en: "",
          vi: "",
        },
        blockName: editData.listingInformation?.listingInformationBlockName || {
          en: "",
          vi: "",
        },
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

    const payload = {
      listingInformation: {
        listingInformationPropertyId: normalized.propertyId || "",
        listingInformationTransactionType: wrap(normalized.transactionType),
        listingInformationProjectCommunity: findLocalized(
          dropdowns.properties,
          normalized.projectId
        ),
        listingInformationPropertyNo: wrap(normalized.propertyNo),
        listingInformationZoneSubArea: findLocalized(
          dropdowns.zones,
          normalized.zoneId
        ),
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
        informationFloors: num(normalized.floors),
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
            ? normalized.currency.symbol || "$"
            : normalized.currency || "$",
        financialDetailsPrice: num(normalized.price),
        financialDetailsTerms: wrap(normalized.contractTerms),
        financialDetailsDeposit: wrap(normalized.depositPaymentTerms),
        financialDetailsMainFee: wrap(normalized.maintenanceFeeMonthly),
        financialDetailsLeasePrice: num(normalized.leasePrice),
        financialDetailsContractLength: normalized.contractLength || "",
        financialDetailsPricePerNight: num(normalized.pricePerNight),
        financialDetailsCheckIn: normalized.checkIn || "",
        financialDetailsCheckOut: normalized.checkOut || "",
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
        typeof mergedData.zoneId === "string"
          ? mergedData.zoneId.trim()
          : mergedData.zoneId?.name?.en || mergedData.zoneId?.name?.vi || "";

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
        res = await updatePropertyListing(editData._id, payload);
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
      CommonToaster(t.errorSaving, "error")
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
          ? `Bất động sản đã được đăng và đánh dấu là ${status === "Published" ? "Đã đăng" : "Bản nháp"}!`
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
    {
      title: t.createProperty,
      label: t.step1Label,
    },
    {
      title: t.createProperty,
      label: t.step2Label,
    },
    {
      title: t.createProperty,
      label: t.step3Label,
    },
    {
      title: t.createProperty,
      label: t.step4Label,
    },
  ];


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CreatePropertyListStep1
            onNext={() => setStep(2)}
            onChange={handleStepChange}
            initialData={propertyData}
          />
        );
      case 2:
        return (
          <CreatePropertyListStep2
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
            onChange={handleStepChange}
            initialData={propertyData}
          />
        );
      case 3:
        return (
          <CreatePropertyListStep3
            onPrev={() => setStep(2)}
            onChange={handleStepChange}
            initialData={propertyData}
            onSave={handleSaveDraft}
          />
        );
      case 4:
        return (
          <CreatePropertyListStep4
            savedId={savedId}
            onPublish={handleSubmitStatus}
            onPrev={() => setStep(3)}   // ✅ add this line
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
