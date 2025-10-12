import React, { useEffect, useState } from "react";
import { Eye, Globe, Loader2 } from "lucide-react";
import {
  getAllPropertyListings,
  updatePropertyListing,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";

export default function CreatePropertyListStep4({ savedId, onPublish }) {
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("Draft");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!savedId) return;
      setLoading(true);
      try {
        const res = await getAllPropertyListings();
        const found = res.data.data.find((p) => p._id === savedId);
        if (found) {
          setProperty(found);
          setStatus(found.status || "Draft");
        }
      } catch (err) {
        console.error(err);
        CommonToaster("Failed to load property data", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [savedId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading property details...
      </div>
    );

  if (!property)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        No property found.
      </div>
    );

  const li = property.listingInformation || {};
  const pi = property.propertyInformation || {};
  const fd = property.financialDetails || {};
  const cm = property.contactManagement || {};
  const iv = property.imagesVideos || {};
  const wn = property.whatNearby || {};

  const safe = (v) => (typeof v === "object" ? v[lang] || v.en || "" : v || "");

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-10 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Review & Publish Property
        </h1>

        <div className="flex items-center gap-6">
          {/* Language Switch */}
          <div className="flex items-center gap-3 border rounded-full px-3 py-1.5 shadow-sm">
            <Globe className="w-4 h-4 text-gray-500" />
            {["en", "vi"].map((lng) => (
              <button
                key={lng}
                onClick={() => setLang(lng)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  lang === lng
                    ? "text-black"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {lng.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Status & Publish */}
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-xl px-3 py-1.5 bg-white text-sm shadow-sm"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
            <button
              onClick={() => onPublish(status)}
              className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto py-10 px-6 sm:px-10">
        {/* === Listing Information === */}
        <Section title="Listing Information">
          <Grid3>
            <Field
              label="Property ID"
              value={li.listingInformationPropertyId}
            />
            <Field
              label="Transaction Type"
              value={safe(li.listingInformationTransactionType)}
            />
            <Field
              label="Project / Community"
              value={safe(li.listingInformationProjectCommunity)}
            />
            <Field
              label="Area / Zone"
              value={safe(li.listingInformationZoneSubArea)}
            />
            <Field label="Block" value={safe(li.listingInformationBlockName)} />
            <Field
              label="Property Title"
              value={safe(li.listingInformationPropertyTitle)}
            />
            <Field
              label="Property Type"
              value={safe(li.listingInformationPropertyType)}
            />
            <Field
              label="Date Listed"
              value={li.listingInformationDateListed?.split("T")[0]}
            />
            <Field
              label="Available From"
              value={li.listingInformationAvailableFrom?.split("T")[0]}
            />
            <Field
              label="Availability Status"
              value={safe(li.listingInformationAvailabilityStatus)}
            />
          </Grid3>
        </Section>

        {/* === Property Information === */}
        <Section title="Property Information">
          <Grid3>
            <Field label="Unit" value={safe(pi.informationUnit)} />
            <Field label="Unit Size" value={pi.informationUnitSize} />
            <Field label="Bedrooms" value={pi.informationBedrooms} />
            <Field label="Bathrooms" value={pi.informationBathrooms} />
            <Field label="Floors" value={pi.informationFloors} />
            <Field label="Furnishing" value={safe(pi.informationFurnishing)} />
            <Field label="View" value={safe(pi.informationView)} />
          </Grid3>
        </Section>

        {/* === Description === */}
        <Section title="Description">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {safe(wn.whatNearbyDescription) || "No description provided."}
          </p>
        </Section>

        {/* === Property Utility === */}
        <Section title="Property Utility">
          {property.propertyUtility?.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {property.propertyUtility.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition"
                >
                  <span className="font-medium text-gray-800">
                    {safe(u.propertyUtilityUnitName)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {u.propertyUtilityIcon}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No utilities added.</p>
          )}
        </Section>

        {/* === Media Sections === */}
        <Section title="Property Images">
          <MediaGrid files={iv.propertyImages} type="image" />
        </Section>

        <Section title="Property Videos">
          <MediaGrid files={iv.propertyVideo} type="video" />
        </Section>

        <Section title="Floor Plans">
          <MediaGrid files={iv.floorPlan} type="image" />
        </Section>

        {/* === Financial Details === */}
        <Section title="Financial Details">
          <Grid3>
            <Field label="Currency" value={fd.financialDetailsCurrency} />
            <Field label="Price" value={fd.financialDetailsPrice} />
            <Field label="Deposit" value={safe(fd.financialDetailsDeposit)} />
            <Field
              label="Payment Terms"
              value={safe(fd.financialDetailsMainFee)}
            />
            <Field label="Lease Price" value={fd.financialDetailsLeasePrice} />
            <Field
              label="Contract Length"
              value={fd.financialDetailsContractLength}
            />
            <Field
              label="Price per Night"
              value={fd.financialDetailsPricePerNight}
            />
            <Field label="Check-in" value={fd.financialDetailsCheckIn} />
            <Field label="Check-out" value={fd.financialDetailsCheckOut} />
            <Field
              label="Contract Terms"
              value={safe(fd.financialDetailsTerms)}
            />
          </Grid3>
        </Section>

        {/* === Contact Management === */}
        <Section title="Contact / Management Details">
          <Grid3>
            <Field
              label="Owner / Landlord"
              value={safe(cm.contactManagementOwner)}
            />
            <Field
              label="Owner Notes"
              value={safe(cm.contactManagementOwnerNotes)}
            />
            <Field
              label="Consultant"
              value={safe(cm.contactManagementConsultant)}
            />
            <Field
              label="Connecting Point"
              value={safe(cm.contactManagementConnectingPoint)}
            />
            <Field
              label="Connecting Notes"
              value={safe(cm.contactManagementConnectingPointNotes)}
            />
            <Field
              label="Internal Notes"
              value={safe(cm.contactManagementInternalNotes)}
            />
          </Grid3>
        </Section>
      </div>
    </div>
  );
}

/* === Reusable Components === */

const Section = ({ title, children }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="h-[2px] flex-1 ml-4 bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      {children}
    </div>
  </div>
);

const Grid3 = ({ children }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </p>
    <div className="bg-gray-50 border rounded-lg px-3 py-2 text-gray-900 text-sm">
      {value || "—"}
    </div>
  </div>
);

const MediaGrid = ({ files = [], type }) => {
  if (!files?.length)
    return <p className="text-gray-500">No media uploaded.</p>;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
      {files.map((url, i) => (
        <div
          key={i}
          className="relative group rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition"
        >
          {type === "video" ? (
            <video
              src={url}
              controls
              className="w-full h-52 object-cover bg-black/5"
            />
          ) : (
            <img
              src={url}
              alt=""
              className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
        </div>
      ))}
    </div>
  );
};
