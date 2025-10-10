import React, { useState } from "react";
import Steps from "./Steps";
import CreatePropertyListStep1 from "./CreatePropertyListStep1";
import CreatePropertyListStep2 from "./CreatePropertyListStep2";
import CreatePropertyListStep3 from "./CreatePropertyListStep3";
import { createPropertyListing } from "../../Api/action";

/* =========================================================
   🧰 Safe Object Sanitizer (Handles circular & event leaks)
========================================================= */
function sanitizeObject(input, seen = new WeakSet()) {
  if (input === null || typeof input !== "object") return input;
  if (seen.has(input)) return undefined;
  seen.add(input);

  // Skip events, DOM, Files
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
   🧠 Normalize multilingual + field mapping
========================================================= */
const normalizeMultilingual = (data) => {
  const wrap = (val) =>
    typeof val === "string" ? { en: val, vi: val } : val || { en: "", vi: "" };

  return {
    ...data,
    project: wrap(data.project),
    title: wrap(data.title),
    address: wrap(data.address),
    description: wrap(data.description),
    view: wrap(data.view),
    contractTerms: wrap(data.contractTerms),
    depositPaymentTerms: wrap(data.depositPaymentTerms),
  };
};

/* =========================================================
   🧱 Main Component
========================================================= */
export default function CreatePropertyPage({ goBack }) {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Live update from each step
  const handleStepChange = (updatedStepData) => {
    setPropertyData((prev) => ({ ...prev, ...updatedStepData }));
  };

  const steps = [
    { title: "Create Property", label: "Listing & Property Information" },
    { title: "Create Property", label: "Media & Financial Information" },
    { title: "Create Property", label: "Contact / Management Details" },
    { title: "Create Property", label: "Review & Publish" },
  ];

  const handleNext = (dataFromStep) => {
    // ✅ Merge deeply without overwriting arrays like propertyImages
    const merged = {
      ...propertyData,
      ...dataFromStep,
      propertyImages: [
        ...(propertyData.propertyImages || []),
        ...(dataFromStep.propertyImages || []),
      ],
      propertyVideos: [
        ...(propertyData.propertyVideos || []),
        ...(dataFromStep.propertyVideos || []),
      ],
      floorPlans: [
        ...(propertyData.floorPlans || []),
        ...(dataFromStep.floorPlans || []),
      ],
    };
    setPropertyData(merged);
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  /* =========================================================
     🚀 Submit
  ========================================================== */
  /* =========================================================
   🚀 Submit (Fixed Full Schema Mapping)
========================================================= */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const clean = sanitizeObject(propertyData);
      const normalized = normalizeMultilingual(clean);

      // === Helper to wrap localized strings ===
      const wrap = (val) =>
        typeof val === "string"
          ? { en: val, vi: val }
          : val || { en: "", vi: "" };

      // === Numeric normalization ===
      const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

      // === Array normalization (media, amenities, utilities) ===
      const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

      const payload = {
        propertyId: normalized.propertyId || undefined,
        transactionType: normalized.transactionType || "",

        // 🔹 Localized fields
        project: wrap(normalized.project),
        title: wrap(normalized.title),
        address: wrap(normalized.address),
        description: wrap(normalized.description),
        view: wrap(normalized.view),
        contractTerms: wrap(
          normalized.contractTerms || normalized.contract || ""
        ),
        depositPaymentTerms: wrap(
          normalized.depositPaymentTerms || normalized.depositTerms || ""
        ),

        // 🔹 Basic fields
        propertyType:
          normalized.propertyType || normalized.propertyTypeId || undefined,
        country: normalized.country || "",
        state: normalized.state || "",
        city: normalized.city || "",
        postalCode: normalized.postalCode || "",
        dateListed:
          normalized.dateListed || new Date().toISOString().split("T")[0],
        availabilityStatus:
          normalized.availabilityStatus || normalized.availabilityStatusId,
        availableFrom: normalized.availableFrom || null,

        // 🔹 Property info
        unit: normalized.unit || "",
        unitSize: num(normalized.unitSize),
        bedrooms: num(normalized.bedrooms),
        bathrooms: num(normalized.bathrooms),
        floors: num(normalized.floors),
        floorNumber: num(normalized.floorNumber),
        furnishing: normalized.furnishing || normalized.furnishingId || null,
        yearBuilt: num(normalized.yearBuilt) || null,
        parkingAvailability:
          normalized.parkingAvailability || normalized.parkingId || null,
        petPolicy: normalized.petPolicy || normalized.petPolicyId || null,

        // 🔹 Nearby & Utilities
        whatsNearby: safeArray(normalized.amenities).map((a) => ({
          name: { en: a.name || "", vi: a.name || "" },
          distanceKM: num(a.km || 0),
        })),

        utilities: safeArray(normalized.utilities).map((u) => ({
          name: { en: u.name || "", vi: u.name || "" },
          icon: u.icon || "",
        })),

        // 🔹 Media files
        propertyImages: safeArray(normalized.propertyImages).map((f) =>
          typeof f === "string" ? f : f.url || ""
        ),
        propertyVideos: safeArray(normalized.propertyVideos).map((f) =>
          typeof f === "string" ? f : f.url || ""
        ),
        floorPlans: safeArray(normalized.floorPlans).map((f) =>
          typeof f === "string" ? f : f.url || ""
        ),

        // 🔹 Financial details
        currency: normalized.currency || "USD",
        price: num(normalized.price),
        pricePerUnit: num(normalized.pricePerUnit),
        maintenanceFeeMonthly: num(
          normalized.maintenanceFeeMonthly?.en ||
            normalized.maintenanceFeeMonthly ||
            0
        ),

        // 🔹 Contacts
        owners: safeArray(normalized.owners).map((o) => ({
          role: o.role || "Owner",
          name:
            typeof o.name === "object"
              ? o.name.en || o.name.vi
              : o.name || "Unnamed",
          email: o.email || "",
          phone: o.phone || "",
          notes: o.notes || "",
        })),

        propertyConsultant: normalized.propertyConsultant
          ? {
              role: "Consultant",
              name:
                typeof normalized.propertyConsultant.name === "object"
                  ? normalized.propertyConsultant.name.en ||
                    normalized.propertyConsultant.name.vi
                  : normalized.propertyConsultant.name || "",
            }
          : undefined,

        internalNotes:
          typeof normalized.internalNotes === "object"
            ? normalized.internalNotes.en || ""
            : normalized.internalNotes || "",

        status: normalized.status || "Draft",
      };

      // Clean undefined/null
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === null) delete payload[k];
      });

      console.log("🧾 Final Payload Sent to Backend:", payload);
      const res = await createPropertyListing(payload);

      alert("🎉 Property created successfully!");
      console.log("✅ Property:", res.data.data);
      setStep((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error creating property:", err.response?.data || err);
      alert(err.response?.data?.error || "Error creating property.");
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
      default:
        return (
          <ReviewAndPublish
            data={propertyData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
    }
  };

  return (
    <Steps
      steps={steps}
      currentStep={step}
      onNext={handleNext}
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
