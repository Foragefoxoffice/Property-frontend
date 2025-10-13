import React from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function PropertyMaster({
  goBack,
  openPropertyPage,
  openZoneSubAreaPage,
  openPropertyTypePage,
  openAvailabilityStatusPage,
  openUnitPage,
  openFurnishingPage,
  openParkingPage,
  openPetPolicyPage,
  openDepositPage,
  openPaymentPage,
}) {
  const propertyData = [
    {
      name: "Project / Community",
      description:
        "The name of the residential or commercial project or community where the property is located.",
    },
    {
      name: "Zone / Sub-area",
      description:
        "The specific section, block, or zone within a project or district — used for internal location mapping or filtering.",
    },
    {
      name: "Property Type",
      description: "Defines the category or kind of property.",
    },
    {
      name: "Availability Status",
      description:
        "Indicates whether the property is available or occupied, and its current listing state.",
    },
    {
      name: "Unit",
      description:
        "Defines the measurement unit used for the property's area (size) — determines how the property's dimensions and price per area are displayed.",
    },
    {
      name: "Furnishing",
      description:
        "Describes the furniture and appliance condition or level of furnishing.",
    },
    {
      name: "Deposit",
      description:
        "Specifies the required deposit amount or percentage for booking or leasing the property.",
    },
    {
      name: "Payment terms",
      description: "Details the payment schedule and conditions.",
    },
    // {
    //   name: "Parking Availability",
    //   description:
    //     "Specifies whether parking is available, and if so, what kind.",
    // },
    // {
    //   name: "Pet Policy",
    //   description:
    //     "States whether pets are allowed in the property or building.",
    // },
  ];

  const handleClick = (name) => {
    if (name === "Project / Community") openPropertyPage();
    else if (name === "Zone / Sub-area") openZoneSubAreaPage();
    else if (name === "Property Type") openPropertyTypePage();
    else if (name === "Availability Status") openAvailabilityStatusPage();
    else if (name === "Unit") openUnitPage();
    else if (name === "Furnishing") openFurnishingPage();
    else if (name === "Parking Availability") openParkingPage();
    else if (name === "Pet Policy") openPetPolicyPage();
    else if (name === "Deposit") openDepositPage();
    else if (name === "Payment terms") openPaymentPage();
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">
          Property Masters
        </h2>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_4fr_auto] bg-gray-50 font-medium text-gray-800 px-6 py-3 border-b border-gray-200">
          <div>Property Masters</div>
          <div>Description</div>
          <div></div>
        </div>

        {propertyData.map((item, index) => (
          <div
            key={index}
            onClick={() => handleClick(item.name)}
            className={`grid grid-cols-[2fr_4fr_auto] items-center px-6 py-4 text-sm text-gray-700 cursor-pointer ${index % 2 === 1 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-100 transition-colors`}
          >
            <div className="font-medium">{item.name}</div>
            <div className="text-gray-600 leading-snug">{item.description}</div>
            <div className="flex justify-end">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full hover:bg-black hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
