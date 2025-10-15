import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Building2,
  BedDouble,
  Bath,
  Ruler,
  Layers,
  Eye,
  Tv,
  Wifi,
  AirVent,
  Dumbbell,
  ShieldCheck,
  Camera,
  House,
  SlidersHorizontal,
  Bed,
  Armchair,
} from "lucide-react";

export default function PropertyDetailsSection() {
  const [activeTab, setActiveTab] = useState("Overview");

  const sectionRefs = {
    Overview: useRef(null),
    "Property Utility": useRef(null),
    "Payment Overview": useRef(null),
    Video: useRef(null),
    "Floor Plans": useRef(null),
  };

  const tabs = [
    "Overview",
    "Property Utility",
    "Payment Overview",
    "Video",
    "Floor Plans",
  ];

  // Smooth scroll when clicking a tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Accurate scroll tracking
  useEffect(() => {
    const container = document.getElementById("scrollContainer");
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerBottom = containerRect.bottom;

        let maxVisible = 1000;
        let visibleSection = activeTab;

        Object.entries(sectionRefs).forEach(([tab, ref]) => {
          const el = ref.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const visibleHeight =
              Math.min(rect.bottom, containerBottom) -
              Math.max(rect.top, containerTop);
            if (visibleHeight > maxVisible && visibleHeight > 0) {
              maxVisible = visibleHeight;
              visibleSection = tab;
            }
          }
        });

        if (visibleSection !== activeTab) setActiveTab(visibleSection);
        ticking = false;
      });
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  return (
    <div className="bg-[#F8F7FC]">
      {/* Tabs */}
      <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`relative px-5 py-3 text-sm sm:text-base font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black rounded-t-md transition-all duration-300"></span>
            )}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:px-8 px-4">
        {/* LEFT CONTENT */}
        <div
          id="scrollContainer"
          className="lg:col-span-2 overflow-y-auto lg:h-[75vh] pr-2 scroll-smooth scrollbar-hide scroll-top-padding"
        >
          {/* OVERVIEW SECTION */}
          <section
            ref={sectionRefs["Overview"]}
            data-tab="Overview"
            className="rounded-2xl p-6 mb-12 bg-white"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900">
              Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <OverviewCard
                icon={<House />}
                label="Property ID"
                value="423146"
              />
              <OverviewCard
                icon={<SlidersHorizontal />}
                label="Property Type"
                value="Villa"
              />
              <OverviewCard icon={<Bed />} label="Bedrooms" value="3 Rooms" />
              <OverviewCard icon={<Bath />} label="Bathrooms" value="3 Rooms" />
              <OverviewCard
                icon={<Armchair />}
                label="Furnishing"
                value="Fully Furnished"
              />
              <OverviewCard icon={<Ruler />} label="Size" value="110 m²" />
              <OverviewCard icon={<Layers />} label="Floors" value="8" />
              <OverviewCard icon={<Eye />} label="View" value="River View" />
            </div>
          </section>

          {/* ECOPARK SECTION */}
          <section
            ref={sectionRefs["Ecopark"]}
            data-tab="Ecopark"
            className="bg-white rounded-2xl p-6 mb-12"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900">
              Ecopark
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EcoparkItem label="Area / Zone" value="Aqua Bay" />
              <EcoparkItem label="Block" value="Apartment in Ecopark" />
              <EcoparkItem label="Available From" value="09-Oct-2025" />
            </div>
          </section>

          {/* DESCRIPTION SECTION */}
          <section
            ref={sectionRefs["Description"]}
            data-tab="Description"
            className="bg-white rounded-2xl p-6 mb-16"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900">
              Description
            </h2>
            <div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
                Casa Lomas de Machalí offers a perfect blend of comfort,
                privacy, and nature. Nestled in one of Machalí’s most secure and
                peaceful residential areas, this beautiful property features
                modern architecture, open interiors, and large windows that fill
                the home with natural light.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                Its tranquil surroundings and convenient access to local
                amenities make it ideal for families or anyone seeking a serene
                lifestyle just minutes from Rancagua.
              </p>
              <button className="text-gray-900 text-sm sm:text-base font-semibold hover:underline">
                View More
              </button>
            </div>
          </section>

          {/* PROPERTY UTILITY */}
          <section
            ref={sectionRefs["Property Utility"]}
            data-tab="Property Utility"
            className="bg-white p-6 rounded-2xl mb-16"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900">
              Property Utility
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <UtilityLine icon={<AirVent />} label="Heating" />
              <UtilityLine icon={<Tv />} label="Cable TV" />
              <UtilityLine icon={<AirVent />} label="Air Conditioning" />
              <UtilityLine
                icon={<ShieldCheck />}
                label="Carbon monoxide alarm"
              />
              <UtilityLine icon={<Wifi />} label="Wifi" />
              <UtilityLine icon={<Layers />} label="Solar power" />
              <UtilityLine icon={<Camera />} label="Security cameras" />
              <UtilityLine icon={<Dumbbell />} label="Fireplace" />
              <UtilityLine
                icon={<ShieldCheck />}
                label="Self check-in with lockbox"
              />
              <UtilityLine icon={<AirVent />} label="Ventilation" />
            </div>
          </section>

          {/* PAYMENT OVERVIEW */}
          <section
            ref={sectionRefs["Payment Overview"]}
            data-tab="Payment Overview"
            className="bg-white rounded-2xl p-6 mb-16"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Payment Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-800">
              <InfoItem label="Deposit" value="30%" />
              <InfoItem
                label="Project Status"
                value="Ready, Handover by 100% upon completion"
              />
            </div>
          </section>

          {/* VIDEO SECTION */}
          <section
            ref={sectionRefs["Video"]}
            data-tab="Video"
            className="bg-[#F8F7FC] rounded-2xl p-6 mb-16"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900">
              Video
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <video
                  controls
                  poster="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                  className="w-full h-full object-cover rounded-lg"
                >
                  <source
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent rounded-lg" />
              </div>
            </div>
          </section>

          {/* FLOOR PLANS */}
          <section
            ref={sectionRefs["Floor Plans"]}
            data-tab="Floor Plans"
            className="bg-white rounded-2xl p-6"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Floor Plans
            </h2>
            <img
              src="/images/property/floor.jpg"
              alt="Floor Plan"
              className="rounded-lg object-cover w-full"
            />
          </section>
        </div>

        {/* RIGHT CONTACT CARD */}
        <div className="lg:col-span-1 order-1 lg:order-none">
          {/* Desktop / Tablet Contact Card */}
          <div className="hidden lg:block sticky top-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Contact</h3>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Agent"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">Jorge R.</p>
                <p className="text-gray-500 text-sm">Property Consultant</p>
                <p className="text-gray-500 text-sm break-all">
                  183housingsolutions@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700 mb-5">
              <Phone className="w-4 h-4" />
              <span>+1 555-678-8888</span>
            </div>

            <button className="w-full bg-black text-white py-2 rounded-full mb-3 hover:bg-gray-800 transition text-sm sm:text-base">
              Call To Dealer
            </button>
            <button className="w-full bg-[#41398B] text-white py-2 rounded-full hover:bg-[#41398be3] transition text-sm sm:text-base">
              Book Viewing
            </button>
          </div>

          {/* Mobile Sticky Contact Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex items-center justify-between px-4 py-3 lg:hidden z-50">
            <div className="flex items-center gap-3">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Agent"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col leading-tight">
                <p className="text-sm font-semibold text-gray-900">Jorge R.</p>
                <p className="text-xs text-gray-500">Property Consultant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-black text-white text-xs px-6 py-2 rounded-full hover:bg-gray-800 transition">
                Call
              </button>
              <button className="bg-indigo-600 text-white text-xs px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub Components
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function OverviewCard({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 grid place-content-center border border-gray-300 rounded-md">
        <div className="text-gray-500 mt-1">{icon}</div>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}

function EcoparkItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}:</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}

function UtilityLine({ icon, label }) {
  return (
    <div className="flex items-center justify-start gap-3 border-b border-gray-100 py-2 last:border-b-0">
      <span className="text-gray-700">{icon}</span>
      <span className="text-gray-900 text-sm font-medium">{label}</span>
    </div>
  );
}
