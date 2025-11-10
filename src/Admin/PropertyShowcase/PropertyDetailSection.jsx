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
  Armchair
} from "lucide-react";

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

  const type = list?.listingInformationTransactionType?.en;

  const tabs = [
    "Overview",
    "Property Utility",
    "Payment Overview",
    "Video",
    "Floor Plans",
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-[#F8F7FC]">
      {/* Tabs */}
      <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`relative px-5 py-3 text-sm font-medium ${activeTab === tab ? "text-black" : "text-gray-500 hover:text-black"
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
        <div id="scrollContainer" className="lg:col-span-2 overflow-y-auto lg:h-[75vh] pr-2">

          {/* ✅ OVERVIEW */}
          <section ref={sectionRefs["Overview"]} className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Overview</h2>

            <div className="grid grid-cols-2 ml-3 md:grid-cols-4 gap-8">
              <OverviewCard icon={<House />} label="Property ID" value={list?.listingInformationPropertyId} />
              <OverviewCard icon={<SlidersHorizontal />} label="Type" value={list?.listingInformationPropertyType?.en} />
              <OverviewCard icon={<Bed />} label="Bedrooms" value={`${info?.informationBedrooms} Rooms`} />
              <OverviewCard icon={<Bath />} label="Bathrooms" value={`${info?.informationBathrooms} Rooms`} />
              <OverviewCard icon={<Armchair />} label="Furnishing" value={info?.informationFurnishing?.en} />
              <OverviewCard icon={<Ruler />} label="Size" value={`${info?.informationUnitSize} m²`} />
              <OverviewCard icon={<Layers />} label="Floors" value={info?.informationFloors} />
              <OverviewCard icon={<Eye />} label="View" value={info?.informationView?.en} />
            </div>
          </section>

          {/* ✅ ECOPARK SECTION */}
          <section className="bg-white p-6 rounded-2xl mb-12">
            <h2 className="text-xl font-semibold mb-5">Ecopark</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EcoparkItem label="Area / Zone" value={list?.listingInformationZoneSubArea?.en} />
              <EcoparkItem label="Block" value={list?.listingInformationBlockName?.en} />
              <EcoparkItem label="Available From" value={list?.listingInformationAvailableFrom?.substring(0, 10)} />
            </div>
          </section>

          {/* ✅ PAYMENT OVERVIEW */}
          <section ref={sectionRefs["Payment Overview"]} className="bg-white p-6 rounded-2xl mb-16">
            <h2 className="text-xl font-semibold mb-4">Payment Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {type === "Sale" && (
                <>
                  <InfoItem label="Selling Price" value={`₫ ${fin?.financialDetailsPrice}`} />
                  <InfoItem label="Deposit" value={fin?.financialDetailsDeposit?.en} />
                </>
              )}

              {type === "Lease" && (
                <>
                  <InfoItem label="Monthly Rent" value={`₫ ${fin?.financialDetailsLeasePrice}`} />
                  <InfoItem label="Contract Length" value={fin?.financialDetailsContractLength} />
                </>
              )}

              {type === "Home Stay" && (
                <>
                  <InfoItem label="Price Per Night" value={`₫ ${fin?.financialDetailsPricePerNight}`} />
                  <InfoItem label="Check In" value={fin?.financialDetailsCheckIn} />
                  <InfoItem label="Check Out" value={fin?.financialDetailsCheckOut} />
                </>
              )}

            </div>
          </section>

          {/* ✅ VIDEO */}
          <section ref={sectionRefs["Video"]} className="bg-white p-6 rounded-2xl mb-16">
            <h2 className="text-xl font-semibold mb-5">Video</h2>
            <div className="bg-white rounded-xl border p-4">
              <video controls className="w-full rounded-lg">
                <source src={p?.imagesVideos?.propertyVideo?.[0]} type="video/mp4" />
              </video>
            </div>
          </section>

          {/* ✅ FLOOR PLANS */}
          <section ref={sectionRefs["Floor Plans"]} className="bg-white p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-5">Floor Plan</h2>
            <img src={p?.imagesVideos?.floorPlan?.[0]} className="rounded-lg w-full" />
          </section>
        </div>

        {/* ✅ RIGHT CONTACT CARD */}
        <div className="lg:col-span-1 sticky top-6 h-fit bg-white rounded-xl border p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Contact</h3>

          <div className="flex items-center gap-3 mb-4">
            <img
              src="/placeholder.jpg"
              className="w-14 h-14 rounded-full"
            />
            <div>
              <p className="font-semibold">Agent</p>
              <p className="text-sm text-gray-500">{p?.contactManagement?.contactManagementConsultant?.en}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700 mb-5">
            <Phone className="w-4 h-4" />
            <span>{p?.contactManagement?.contactManagementConnectingPoint?.en}</span>
          </div>

          <button className="w-full bg-black text-white py-2 rounded-full mb-3">Call</button>
          <button className="w-full bg-indigo-600 text-white py-2 rounded-full">Book Viewing</button>
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
