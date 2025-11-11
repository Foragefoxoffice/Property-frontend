import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Bed,
  Bath,
  Ruler,
  Layers,
  Eye,
  AirVent,
  Tv,
  Wifi,
  Dumbbell,
  ShieldCheck,
  Camera,
  House,
  SlidersHorizontal,
  Armchair,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

function SimpleSlider({ items, type = "image" }) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % items.length);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Slide */}
      <div className="rounded-xl overflow-hidden border">
        {type === "video" ? (
          <video controls className="w-full rounded-lg">
            <source src={items[index]} type="video/mp4" />
          </video>
        ) : (
          <img src={items[index]} className="w-full rounded-lg" />
        )}
      </div>

      {/* Navigation Arrows (show only if >1) */}
      {items.length > 1 && (
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

export default function PropertyDetailsSection({ property }) {
  const [activeTab, setActiveTab] = useState("Overview");

  const sectionRefs = {
    Overview: useRef(null),
    "Property Utility": useRef(null),
    "Payment Overview": useRef(null),
    Video: useRef(null),
    "Floor Plans": useRef(null),
  };

  // ✅ Extract property data
  const p = property;
  const info = p?.propertyInformation;
  const list = p?.listingInformation;
  const fin = p?.financialDetails;
  const what = p?.whatNearby;
  const type = list?.listingInformationTransactionType?.en;
  const videos = p?.imagesVideos?.propertyVideo || [];
  const floorplans = p?.imagesVideos?.floorPlan || [];

  const tabs = [
    "Overview",
    "Property Utility",
    "Payment Overview",
    "Video",
    "Floor Plans",
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="bg-[#F8F7FC]">
      {/* Tabs */}
      <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`relative px-5 py-3 text-sm font-medium ${
              activeTab === tab
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black"></span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:px-8 px-4">
        {/* LEFT SIDE */}
        <div
          id="scrollContainer"
          className="lg:col-span-2 overflow-y-auto lg:h-[75vh] pr-2"
        >
          {/* ✅ OVERVIEW */}
          <section
            ref={sectionRefs["Overview"]}
            className="bg-white p-6 rounded-2xl mb-12"
          >
            <h2 className="text-xl font-semibold mb-5">Overview</h2>

            <div className="grid grid-cols-2 ml-3 md:grid-cols-4 gap-8">
              <OverviewCard
                icon={<House />}
                label="Property ID"
                value={list?.listingInformationPropertyId}
              />
              <OverviewCard
                icon={<SlidersHorizontal />}
                label="Type"
                value={list?.listingInformationPropertyType?.en}
              />
              <OverviewCard
                icon={<Bed />}
                label="Bedrooms"
                value={`${info?.informationBedrooms} Rooms`}
              />
              <OverviewCard
                icon={<Bath />}
                label="Bathrooms"
                value={`${info?.informationBathrooms} Rooms`}
              />
              <OverviewCard
                icon={<Armchair />}
                label="Furnishing"
                value={info?.informationFurnishing?.en}
              />
              <OverviewCard
                icon={<Ruler />}
                label="Size"
                value={`${info?.informationUnitSize} m²`}
              />
              <OverviewCard
                icon={<Layers />}
                label="Floors"
                value={info?.informationFloors}
              />
              <OverviewCard
                icon={<Eye />}
                label="View"
                value={info?.informationView?.en}
              />
            </div>
          </section>

          {/* ✅ ECOPARK SECTION */}
          <section className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Ecopark</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EcoparkItem
                label="Area / Zone"
                value={list?.listingInformationZoneSubArea?.en}
              />
              <EcoparkItem
                label="Block"
                value={list?.listingInformationBlockName?.en}
              />
              <EcoparkItem
                label="Available From"
                value={list?.listingInformationAvailableFrom?.substring(0, 10)}
              />
            </div>
          </section>

          {/* ✅ DESCRIPTION SECTION */}
          <section className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Description</h2>

            <p className="text-gray-700 leading-6">
              {what?.whatNearbyDescription?.en || "No description available"}
            </p>
          </section>

          {/* ✅ PROPERTY UTILITY SECTION */}
          <section
            ref={sectionRefs["Property Utility"]}
            className="bg-white p-6 rounded-2xl mb-12"
          >
            <h2 className="text-xl font-semibold mb-5">Property Utility</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {p?.propertyUtility?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-b py-3 last:border-b-0"
                >
                  {/* Icon */}
                  <img
                    src={item?.propertyUtilityIcon}
                    className="w-6 h-6 object-contain"
                  />

                  {/* Label */}
                  <span className="font-medium">
                    {item?.propertyUtilityUnitName?.en}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ✅ PAYMENT OVERVIEW */}
          <section
            ref={sectionRefs["Payment Overview"]}
            className="bg-white p-6 rounded-2xl mb-16"
          >
            <h2 className="text-xl font-semibold mb-4">Payment Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === "Sale" && (
                <>
                  <InfoItem
                    label="Selling Price"
                    value={`₫ ${fin?.financialDetailsPrice}`}
                  />
                  <InfoItem
                    label="Deposit"
                    value={fin?.financialDetailsDeposit?.en}
                  />
                </>
              )}

              {type === "Lease" && (
                <>
                  <InfoItem
                    label="Monthly Rent"
                    value={`₫ ${fin?.financialDetailsLeasePrice}`}
                  />
                  <InfoItem
                    label="Contract Length"
                    value={fin?.financialDetailsContractLength}
                  />
                </>
              )}

              {type === "Home Stay" && (
                <>
                  <InfoItem
                    label="Price Per Night"
                    value={`₫ ${fin?.financialDetailsPricePerNight}`}
                  />
                  <InfoItem
                    label="Check In"
                    value={fin?.financialDetailsCheckIn}
                  />
                  <InfoItem
                    label="Check Out"
                    value={fin?.financialDetailsCheckOut}
                  />
                </>
              )}
            </div>
          </section>

          {/* ✅ VIDEO */}
          {/* ✅ VIDEO SECTION (Slider) */}
          <section
            ref={sectionRefs["Video"]}
            className="bg-white p-6 rounded-2xl mb-16"
          >
            <h2 className="text-xl font-semibold mb-5">Video</h2>
            <SimpleSlider items={videos} type="video" />
          </section>

          {/* ✅ FLOOR PLAN SECTION (Slider) */}
          <section
            ref={sectionRefs["Floor Plans"]}
            className="bg-white p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold mb-5">Floor Plans</h2>
            <SimpleSlider items={floorplans} type="image" />
          </section>
        </div>

        {/* ✅ RIGHT CONTACT CARD */}
        <div className="lg:col-span-1 sticky top-6 h-fit bg-white rounded-xl border p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Contact</h3>

          <div className="flex items-center gap-3 mb-4">
            <img src="/placeholder.jpg" className="w-14 h-14 rounded-full" />
            <div>
              <p className="font-semibold">Agent</p>
              <p className="text-sm text-gray-500">
                {p?.contactManagement?.contactManagementConsultant?.en}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700 mb-5">
            <Phone className="w-4 h-4" />
            <span>
              {p?.contactManagement?.contactManagementConnectingPoint?.en}
            </span>
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

/* ✅ SUB COMPONENTS */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value}</p>
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
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function EcoparkItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="font-bold">{value}</p>
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
