import React, { useState, useEffect } from "react";
import Steps from "./Steps";
import CreatePropertyListStep1 from "./CreatePropertyListStep1";
import CreatePropertyListStep2 from "./CreatePropertyListStep2";
import CreatePropertyListStep3 from "./CreatePropertyListStep3";
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
} from "../../Api/action";
import CreatePropertyListStep4 from "./CreatePropertyListStep4";
import { CommonToaster } from "../../Common/CommonToaster";

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
    } catch {}
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
  const [dropdowns, setDropdowns] = useState({ properties: [], zones: [] });

  // inside CreatePropertyPage.jsx

  useEffect(() => {
    if (!isEditMode || !editData || Object.keys(dropdowns).length === 0) return;

    const mapped = {
      ...editData,
      propertyId:
        editData.listingInformation?.listingInformationPropertyId || "",
      transactionType:
        editData.listingInformation?.listingInformationTransactionType?.en ||
        "Sale",
      projectId:
        editData.listingInformation?.listingInformationProjectCommunity?._id ||
        editData.listingInformation?.listingInformationProjectCommunity?.en ||
        "",
      zoneId:
        editData.listingInformation?.listingInformationZoneSubArea?._id ||
        editData.listingInformation?.listingInformationZoneSubArea?.en ||
        "",
      title: editData.listingInformation?.listingInformationPropertyTitle || {
        en: "",
        vi: "",
      },
      blockName: editData.listingInformation?.listingInformationBlockName || {
        en: "",
        vi: "",
      },
      propertyType:
        editData.listingInformation?.listingInformationPropertyType?._id ||
        editData.listingInformation?.listingInformationPropertyType?.en ||
        "",
      dateListed: editData.listingInformation?.listingInformationDateListed
        ? editData.listingInformation?.listingInformationDateListed.split(
            "T"
          )[0]
        : "",
      availableFrom:
        editData.listingInformation?.listingInformationAvailableFrom?.split(
          "T"
        )[0] || "",
      availabilityStatus:
        editData.listingInformation?.listingInformationAvailabilityStatus
          ?._id ||
        editData.listingInformation?.listingInformationAvailabilityStatus?.en ||
        "",
      unit:
        editData.propertyInformation?.informationUnit?._id ||
        editData.propertyInformation?.informationUnit?.symbol?.en ||
        "",
      unitSize: editData.propertyInformation?.informationUnitSize || "",
      bedrooms: editData.propertyInformation?.informationBedrooms || "",
      bathrooms: editData.propertyInformation?.informationBathrooms || "",
      floors: editData.propertyInformation?.informationFloors || "",
      furnishing:
        editData.propertyInformation?.informationFurnishing?._id ||
        editData.propertyInformation?.informationFurnishing?.en ||
        "",
      view: editData.propertyInformation?.informationView || { en: "", vi: "" },
      description: editData.whatNearby?.whatNearbyDescription || {
        en: "",
        vi: "",
      },
      utilities: (editData.propertyUtility || []).map((u) => ({
        name: u.propertyUtilityUnitName || { en: "", vi: "" },
        icon: u.propertyUtilityIcon || "",
      })),
      propertyImages:
        editData.imagesVideos?.propertyImages?.map((u) => ({ url: u })) || [],
      propertyVideos:
        editData.imagesVideos?.propertyVideo?.map((u) => ({ url: u })) || [],
      floorPlans:
        editData.imagesVideos?.floorPlan?.map((u) => ({ url: u })) || [],
      currency: editData.financialDetails?.financialDetailsCurrency || "USD",
      price: editData.financialDetails?.financialDetailsPrice || "",
      depositPaymentTerms: editData.financialDetails
        ?.financialDetailsDeposit || { en: "", vi: "" },
      maintenanceFeeMonthly: editData.financialDetails
        ?.financialDetailsMainFee || { en: "", vi: "" },
      leasePrice: editData.financialDetails?.financialDetailsLeasePrice || "",
      contractLength:
        editData.financialDetails?.financialDetailsContractLength || "",
      pricePerNight:
        editData.financialDetails?.financialDetailsPricePerNight || "",
      checkIn: editData.financialDetails?.financialDetailsCheckIn || "",
      checkOut: editData.financialDetails?.financialDetailsCheckOut || "",

      // ✅ Properly restore contact section
      owner:
        typeof editData.contactManagement?.contactManagementOwner === "object"
          ? editData.contactManagement?.contactManagementOwner?.en
          : editData.contactManagement?.contactManagementOwner || "",
      ownerNotes: editData.contactManagement?.contactManagementOwnerNotes || {
        en: "",
        vi: "",
      },
      consultant: editData.contactManagement?.contactManagementConsultant || {
        en: "",
        vi: "",
      },
      connectingPoint:
        typeof editData.contactManagement?.contactManagementConnectingPoint ===
        "object"
          ? editData.contactManagement?.contactManagementConnectingPoint
          : {
              en:
                editData.contactManagement?.contactManagementConnectingPoint ||
                "",
              vi: "",
            },
      connectingPointNotes: editData.contactManagement
        ?.contactManagementConnectingPointNotes || { en: "", vi: "" },
      internalNotes: editData.contactManagement
        ?.contactManagementInternalNotes || { en: "", vi: "" },
      status: editData.status || "Draft",
    };

    setPropertyData(mapped);
  }, [isEditMode, editData, dropdowns]);

  // 🔽 Fetch dropdown data for mapping IDs → localized names
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

  const handleStepChange = (updatedStepData) =>
    setPropertyData((prev) => ({ ...prev, ...updatedStepData }));

  const steps = [
    { title: "Create Property", label: "Listing & Property Information" },
    { title: "Create Property", label: "Media & Financial Information" },
    { title: "Create Property", label: "Contact / Management Details" },
    { title: "Create Property", label: "Review & Publish" },
  ];

  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  /* =========================================================
     🚀 Submit
  ========================================================== */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const clean = sanitizeObject(propertyData);
      const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
      const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

      // ✅ Wrap ensures { en, vi } always exist
      const wrap = (val) => {
        if (!val) return { en: "", vi: "" };
        if (typeof val === "object" && "en" in val && "vi" in val)
          return { en: val.en || "", vi: val.vi || "" };
        if (typeof val === "string") return { en: val, vi: val };
        return { en: "", vi: "" };
      };

      // ✅ Smart dropdown finder (supports id or name)
      // ✅ Enhanced helper that supports both names and symbols
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

        // 👇 Return symbol if unit, else name
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

      // ✅ Ensure `whatsNearby` & `description` always exist before wrap()
      if (!clean.whatsNearby || typeof clean.whatsNearby !== "object") {
        clean.whatsNearby = { en: "", vi: "" };
      }
      if (!clean.description || typeof clean.description !== "object") {
        clean.description = { en: "", vi: "" };
      }

      const normalized = clean;

      // ✅ Build payload with full multilingual wrapping
      const payload = {
        listingInformation: {
          listingInformationPropertyId: normalized.propertyId || "",
          listingInformationTransactionType: wrap(normalized.transactionType),

          listingInformationProjectCommunity: findLocalized(
            dropdowns.properties,
            normalized.projectId
          ),
          listingInformationZoneSubArea: findLocalized(
            dropdowns.zones,
            normalized.zoneId
          ),
          listingInformationPropertyTitle: wrap(normalized.title),
          listingInformationBlockName: wrap(normalized.blockName),

          // ✅ Property Type lookup
          listingInformationPropertyType: findLocalized(
            dropdowns.types,
            normalized.propertyType
          ),

          // listingInformationCountry: normalized.country || "",
          // listingInformationState: normalized.state || "",
          // listingInformationCity: wrap(normalized.city),

          // listingInformationPostalCode: normalized.postalCode || "",
          // listingInformationAddress: wrap(normalized.address),

          listingInformationDateListed:
            normalized.dateListed || new Date().toISOString(),

          // ✅ Availability Status lookup
          listingInformationAvailabilityStatus: findLocalized(
            dropdowns.statuses,
            normalized.availabilityStatus
          ),

          listingInformationAvailableFrom:
            normalized.availableFrom || new Date().toISOString(),
        },

        propertyInformation: {
          informationUnit: findLocalized(
            dropdowns.units,
            normalized.unit,
            true
          ),
          informationUnitSize: num(normalized.unitSize),
          informationBedrooms: num(normalized.bedrooms),
          informationBathrooms: num(normalized.bathrooms),
          informationFloors: num(normalized.floors),
          // informationFloorNumber: num(normalized.floorNumber),
          informationFurnishing: findLocalized(
            dropdowns.furnishings,
            normalized.furnishing
          ),
          // informationYearBuilt: num(normalized.yearBuilt),
          informationView: wrap(normalized.view),
          // informationParkingAvailability: findLocalized(
          //   dropdowns.parkings,
          //   normalized.parkingAvailability
          // ),
          // informationPetPolicy: findLocalized(
          //   dropdowns.pets,
          //   normalized.petPolicy
          // ),
        },

        // ✅ What’s Nearby Section — now fully localized
        whatNearby: {
          // whatNearbyContent: wrap(normalized.whatsNearby),
          whatNearbyDescription: wrap(normalized.description),
          // whatNearbyList: safeArray(normalized.amenities).map((a) => ({
          //   whatNearbyAmenityName: wrap(a.name),
          //   whatNearbyKm: num(a.km),
          // })),
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
          // 🆕 Added 5 new fields
          financialDetailsLeasePrice: num(normalized.leasePrice),
          financialDetailsContractLength: normalized.contractLength || "",
          financialDetailsPricePerNight: num(normalized.pricePerNight),
          financialDetailsCheckIn: normalized.checkIn || "",
          financialDetailsCheckOut: normalized.checkOut || "",
        },

        contactManagement: {
          contactManagementOwner: wrap(normalized.owner),
          contactManagementOwnerNotes: wrap(normalized.ownerNotes),
          contactManagementConsultant: wrap(normalized.consultant),
          contactManagementConnectingPoint: wrap(normalized.connectingPoint),
          contactManagementConnectingPointNotes: wrap(
            normalized.connectingPointNotes
          ),
          contactManagementInternalNotes: wrap(normalized.internalNotes),
        },

        status: normalized.status || "Draft",
      };

      // ✅ Final pass — fill missing language values (duplication safeguard)
      const fillMissingLang = (obj) => {
        Object.keys(obj).forEach((k) => {
          const val = obj[k];
          if (val && typeof val === "object" && "en" in val && "vi" in val) {
            if (!val.en || !val.en.trim()) val.en = val.vi;
            if (!val.vi || !val.vi.trim()) val.vi = val.en;
          } else if (typeof val === "object" && !Array.isArray(val)) {
            fillMissingLang(val);
          }
        });
      };

      fillMissingLang(payload);

      console.log("✅ Final Payload:", payload);

      let res;
      if (isEditMode && editData?._id) {
        res = await updatePropertyListing(editData._id, payload);
        CommonToaster("✅ Property updated successfully!", "success");
      } else {
        res = await createPropertyListing(payload);
        CommonToaster("✅ Property created successfully!", "success");
      }

      console.log("🧾 Created:", res.data.data);
      setStep((prev) => prev + 1);
      if (goBack) goBack();
    } catch (err) {
      console.error(
        "❌ Error creating/updating property:",
        err.response?.data || err
      );
      CommonToaster(
        "Error saving property. " + (err.response?.data?.error || ""),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
            onNext={() => setStep(4)}
            onPrev={() => setStep(2)}
            onChange={handleStepChange}
            initialData={propertyData}
          />
        );
      case 4:
        return <CreatePropertyListStep4 onSubmit={handleSubmit} />; // ✅ FIXED
      default:
        return null;
    }
  };

  return (
    <Steps
      steps={steps}
      currentStep={step}
      onNext={() => {
        // Move forward if next step exists
        if (step < steps.length) setStep((prev) => prev + 1);
      }}
      onPrev={handlePrev}
      onCancel={goBack}
      onSubmit={handleSubmit}
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
