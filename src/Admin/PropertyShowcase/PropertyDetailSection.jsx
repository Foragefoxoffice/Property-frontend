// PropertyDetailsSection.jsx (FINAL FIXED VERSION — UI UNCHANGED, LOGIC SAFE)

import React, { useState, useRef } from "react";
import {
  Phone,
  Bed,
  Bath,
  Ruler,
  Layers,
  Eye,
  House,
  SlidersHorizontal,
  Armchair,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { safeVal, safeArray, formatNumber } from "@/utils/display";

/* -------------------------------------------------------
   SLIDER (kept same UI — only added safety)
------------------------------------------------------- */
function SimpleSlider({ items, type = "image" }) {
  const safeItems = safeArray(items).filter((x) => !!x);
  const [index, setIndex] = useState(0);

  if (!safeItems.length) return null;

  const next = () => setIndex((i) => (i + 1) % safeItems.length);
  const prev = () => setIndex((i) => (i - 1 + safeItems.length) % safeItems.length);

  return (
    <div className="relative w-full">
      <div className="rounded-xl overflow-hidden border">
        {type === "video" ? (
          <video controls className="w-full rounded-lg">
            <source src={safeItems[index]} type="video/mp4" />
          </video>
        ) : (
          <img src={safeItems[index]} className="w-full rounded-lg" />
        )}
      </div>

      {safeItems.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#41398B] p-2 rounded-full text-white cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#41398B] p-2 rounded-full text-white cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function PropertyDetailsSection({ property }) {
  // references for scrolling
  const sectionRefs = {
    Overview: useRef(null),
    "Property Utility": useRef(null),
    "Payment Overview": useRef(null),
    Video: useRef(null),
    "Floor Plans": useRef(null),
  };

  const scrollTo = (name) => {
    sectionRefs[name]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* -------------------------------------------------------
     SAFE data extraction using helpers
  ------------------------------------------------------- */
  const p = property || {};
  const info = p.propertyInformation || {};
  const list = p.listingInformation || {};
  const fin = p.financialDetails || {};
  const what = p.whatNearby || {};

  const type = safeVal(list?.listingInformationTransactionType);

  const videos = safeArray(p?.imagesVideos?.propertyVideo);
  const floorplans = safeArray(p?.imagesVideos?.floorPlan);
  const utilities = safeArray(p?.propertyUtility);

  return (
    <div className="bg-[#F8F7FC]">
      {/* -------------------------------------------------------
         Tabs (UI preserved exactly)
      ------------------------------------------------------- */}
      <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto">
        {["Overview", "Property Utility", "Payment Overview", "Video", "Floor Plans"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => scrollTo(tab)}
              className={`relative px-5 py-3 text-sm font-medium`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:px-8 px-4">
        {/* -------------------------------------------------------
           LEFT CONTENT (UI preserved)
        ------------------------------------------------------- */}
        <div id="scrollContainer" className="lg:col-span-2 overflow-y-auto lg:h-[75vh] pr-2">

          {/* -------------------------------------------------------
             OVERVIEW
          ------------------------------------------------------- */}
          <section ref={sectionRefs["Overview"]} className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Overview</h2>

            <div className="grid grid-cols-2 ml-3 md:grid-cols-4 gap-8">
              <OverviewCard icon={<House />} label="Property ID" value={safeVal(list?.listingInformationPropertyId)} />
              <OverviewCard icon={<SlidersHorizontal />} label="Type" value={safeVal(list?.listingInformationPropertyType)} />
              <OverviewCard icon={<Bed />} label="Bedrooms" value={`${safeVal(info?.informationBedrooms)} Rooms`} />
              <OverviewCard icon={<Bath />} label="Bathrooms" value={`${safeVal(info?.informationBathrooms)} Rooms`} />
              <OverviewCard icon={<Armchair />} label="Furnishing" value={safeVal(info?.informationFurnishing)} />
              <OverviewCard icon={<Ruler />} label="Size" value={`${safeVal(info?.informationUnitSize)} m²`} />
              <OverviewCard icon={<Layers />} label="Floors" value={safeVal(info?.informationFloors)} />
              <OverviewCard icon={<Eye />} label="View" value={safeVal(info?.informationView)} />
            </div>
          </section>

          {/* -------------------------------------------------------
             ECOPARK SECTION (UI preserved)
          ------------------------------------------------------- */}
          <section className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Ecopark</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EcoparkItem label="Area / Zone" value={safeVal(list?.listingInformationZoneSubArea)} />
              <EcoparkItem label="Block" value={safeVal(list?.listingInformationBlockName)} />
              <EcoparkItem
                label="Available From"
                value={
                  list?.listingInformationAvailableFrom
                    ? list?.listingInformationAvailableFrom.substring(0, 10)
                    : ""
                }
              />
            </div>
          </section>

          {/* -------------------------------------------------------
             DESCRIPTION (UI preserved)
          ------------------------------------------------------- */}
          <section className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Description</h2>
            <p className="text-gray-700 leading-6">
              {safeVal(what?.whatNearbyDescription) || "No description available"}
            </p>
          </section>

          {/* -------------------------------------------------------
             PROPERTY UTILITY (UI preserved)
          ------------------------------------------------------- */}
          <section ref={sectionRefs["Property Utility"]} className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Property Utility</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {utilities.map((item, index) => (
                <div key={index} className="flex items-center gap-3 border-b py-3 last:border-b-0">
                  <img src={item?.propertyUtilityIcon} className="w-6 h-6 object-contain" />
                  <span className="font-medium">{safeVal(item?.propertyUtilityUnitName)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* -------------------------------------------------------
             PAYMENT OVERVIEW (UI preserved)
          ------------------------------------------------------- */}
          <section ref={sectionRefs["Payment Overview"]} className="bg-white p-6 rounded-2xl mb-16">
            <h2 className="text-xl font-semibold mb-4">Payment Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === "Sale" && (
                <>
                  <InfoItem label="Selling Price" value={`₫ ${formatNumber(fin?.financialDetailsPrice)}`} />
                  <InfoItem label="Deposit" value={safeVal(fin?.financialDetailsDeposit)} />
                </>
              )}

              {type === "Lease" && (
                <>
                  <InfoItem label="Monthly Rent" value={`₫ ${formatNumber(fin?.financialDetailsLeasePrice)}`} />
                  <InfoItem label="Contract Length" value={safeVal(fin?.financialDetailsContractLength)} />
                </>
              )}

              {type === "Home Stay" && (
                <>
                  <InfoItem label="Price Per Night" value={`₫ ${formatNumber(fin?.financialDetailsPricePerNight)}`} />
                  <InfoItem label="Check In" value={safeVal(fin?.financialDetailsCheckIn)} />
                  <InfoItem label="Check Out" value={safeVal(fin?.financialDetailsCheckOut)} />
                </>
              )}
            </div>
          </section>

          {/* -------------------------------------------------------
             VIDEO (UI preserved)
          ------------------------------------------------------- */}
          <section ref={sectionRefs["Video"]} className="bg-white p-6 rounded-2xl mb-16">
            <h2 className="text-xl font-semibold mb-5">Video</h2>
            <SimpleSlider items={videos} type="video" />
          </section>

          {/* -------------------------------------------------------
             FLOOR PLANS (UI preserved)
          ------------------------------------------------------- */}
          <section ref={sectionRefs["Floor Plans"]} className="bg-white p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-5">Floor Plans</h2>
            <SimpleSlider items={floorplans} type="image" />
          </section>
        </div>

        {/* -------------------------------------------------------
           RIGHT CONTACT CARD (UI preserved)
        ------------------------------------------------------- */}
        <div className="lg:col-span-1 sticky top-6 h-fit bg-white rounded-xl border p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Contact</h3>

          <div className="flex items-center gap-3 mb-4">
            <img src="/placeholder.jpg" className="w-14 h-14 rounded-full" />
            <div>
              <p className="font-semibold">Agent</p>
              <p className="text-sm text-gray-500">
                {safeVal(p?.contactManagement?.contactManagementConsultant)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700 mb-5">
            <Phone className="w-4 h-4" />
            <span>{safeVal(p?.contactManagement?.contactManagementConnectingPoint)}</span>
          </div>

          <button className="w-full bg-black text-white py-2 rounded-full mb-3">
            Call
          </button>

          <button className="w-full bg-indigo-600 text-white py-2 rounded-full">
            Book Viewing
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   SUB COMPONENTS (UI UNCHANGED – only safeVal applied)
------------------------------------------------------- */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function OverviewCard({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 grid place-content-center border rounded-md hover:bg-black group">
        <div className="group-hover:text-white">{icon}</div>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="font-bold">{value || "-"}</p>
      </div>
    </div>
  );
}

function EcoparkItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="font-bold">{value || "-"}</p>
    </div>
  );
}

function UtilityLine({ icon, label }) {
  return (
    <div className="flex items-center gap-3 border-b py-2 last:border-b-0">
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}


