import React, { useState } from "react";
import {
  Home,
  Users,
  UserCog,
  LayoutGrid,
  Key,
  BedDouble,
  ChevronDown,
} from "lucide-react";
import PropertyMaster from "../MasterList/PropertyMaster";
import Masters from "../Masters/Masters";
import PropertyPage from "../MasterList/MasterListPage/PropertyPage";
import ZoneSubAreaPage from "../MasterList/MasterListPage/ZoneSubAreaPage";
import PropertTypePage from "../MasterList/MasterListPage/PropertTypePage";
import AvailabilityStatusPage from "../MasterList/MasterListPage/AvailabilityStatusPage";
import UnitPage from "../MasterList/MasterListPage/UnitPage";
import FurnishingPage from "../MasterList/MasterListPage/FurnishingPage";
import ParkingPage from "../MasterList/MasterListPage/ParkingPage";
import PetPolicyPage from "../MasterList/MasterListPage/PetPolicyPage";
import ManageProperty from "../Property/ManageProperty";
import CreatePropertyPage from "../CreateProperty/CreatePropertyPage";
import DepositPage from "../MasterList/MasterListPage/DepositPage";
import PaymentPage from "../MasterList/MasterListPage/PaymentPage";
import OwnersLandlords from "../Property/OwnersLandlords";
import Staffs from "../Property/Staffs";
import OwnerView from "../AddMembers/OwnerView";
import Currency from "../Currency/Currency";
import Header from "../Header/Header";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import StaffView from "../AddMembers/StaffView";
import PropertyManager from "../Property/PropertyManager";
import { Chevron } from "react-day-picker";
import BlockPage from "../MasterList/MasterListPage/BlockPage";
import FeeTaxPage from "../MasterList/MasterListPage/FeeTaxPage";
import LegalDocumentPage from "../MasterList/MasterListPage/LegalDocumentPage";

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState("Properties");
  const [subPage, setSubPage] = useState(null);
  const [subSubPage, setSubSubPage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const { language } = useLanguage();
  const t = translations[language]; // shorthand for translations

  const menuItems = [
    {
      key: "Properties",
      label: t.properties,
      icon: <Home className="w-4 h-4" />,
    },
    {
      key: "Owners / Landlords",
      label: t.owners,
      icon: <Users className="w-4 h-4" />,
    },
    { key: "Staffs", label: t.staffs, icon: <UserCog className="w-4 h-4" /> },
    {
      key: "Masters",
      label: t.masters,
      icon: <LayoutGrid className="w-4 h-4" />,
    },
  ];

  const renderPage = () => {
    if (activePage === "Masters") {
      if (subPage === "PropertyMaster") {
        if (subSubPage === "PropertyPage")
          return <PropertyPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "ZoneSubAreaPage")
          return <ZoneSubAreaPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "BlockPage")
          return <BlockPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "PropertyTypePage")
          return <PropertTypePage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "AvailabilityStatusPage")
          return <AvailabilityStatusPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "UnitPage")
          return <UnitPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "FurnishingPage")
          return <FurnishingPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "ParkingPage")
          return <ParkingPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "PetPolicyPage")
          return <PetPolicyPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "DepositPage")
          return <DepositPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "PaymentPage")
          return <PaymentPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "FeeTaxPage")
          return <FeeTaxPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "LegalDocumentPage")
          return <LegalDocumentPage goBack={() => setSubSubPage(null)} />;

        return (
          <PropertyMaster
            goBack={() => setSubPage(null)}
            openPropertyPage={() => setSubSubPage("PropertyPage")}
            openZoneSubAreaPage={() => setSubSubPage("ZoneSubAreaPage")}
            openBlockPage={() => setSubSubPage("BlockPage")}
            openPropertyTypePage={() => setSubSubPage("PropertyTypePage")}
            openAvailabilityStatusPage={() =>
              setSubSubPage("AvailabilityStatusPage")
            }
            openUnitPage={() => setSubSubPage("UnitPage")}
            openFurnishingPage={() => setSubSubPage("FurnishingPage")}
            openParkingPage={() => setSubSubPage("ParkingPage")}
            openPetPolicyPage={() => setSubSubPage("PetPolicyPage")}
            openDepositPage={() => setSubSubPage("DepositPage")}
            openPaymentPage={() => setSubSubPage("PaymentPage")}
            openFeeTaxPage={() => setSubSubPage("FeeTaxPage")}
            openLegalDocumentPage={() => setSubSubPage("LegalDocumentPage")}
          />
        );
      }
      if (subPage === "CurrencyPage") {
        return <Currency goBack={() => setSubPage(null)} />;
      }
      return (
        <Masters
          openPropertyMaster={() => setSubPage("PropertyMaster")}
          openCurrencyPage={() => setSubPage("CurrencyPage")}
        />
      );
    }

    switch (activePage) {
      case "Properties":
        if (
          subPage?.startsWith("CreateProperty") ||
          subPage === "EditProperty"
        ) {
          let transactionType = "Sale"; // ✅ default fallback

          if (subPage && subPage.startsWith("CreateProperty-")) {
            const type = subPage.replace("CreateProperty-", "").trim();
            if (type && type !== "null" && type !== "undefined" && type !== "")
              transactionType = type;
          }

          return (
            <div className="p-0">
              <CreatePropertyPage
                goBack={() => setSubPage(transactionType)}
                editData={selectedProperty}
                isEditMode={subPage === "EditProperty"}
                defaultTransactionType={transactionType} // ✅ always clean value
              />
            </div>
          );
        }

        // 🟣 Add submenu handling here
        if (["Sale", "Lease", "Home Stay"].includes(subPage)) {
          return (
            <div className="p-8 pt-3">
              <PropertyManager
                propertyTypeFilter={subPage} // Pass tab type: Sale / Lease / Home Stay
                openCreateProperty={
                  () => setSubPage(`CreateProperty-${subPage}`) // include transaction type
                }
                openEditProperty={(property) => {
                  setSelectedProperty(property);
                  setSubPage("EditProperty");
                }}
              />
            </div>
          );
        }

        // Default fallback
        return (
          <div className="p-8 pt-3">
            <PropertyManager
              openCreateProperty={
                () => setSubPage(`CreateProperty-${subPage}`) // include transaction type
              }
              openEditProperty={(property) => {
                setSelectedProperty(property);
                setSubPage("EditProperty");
              }}
            />
          </div>
        );

      case "Owners / Landlords":
        if (subPage === "ViewOwner") {
          return (
            <div className="p-0">
              <OwnerView
                ownerId={selectedProperty}
                goBack={() => setSubPage(null)}
              />
            </div>
          );
        }

        return (
          <div className="p-8 text-lg pt-3 font-semibold">
            <OwnersLandlords
              openOwnerView={(owner) => {
                setSelectedProperty(owner._id);
                setSubPage("ViewOwner");
              }}
            />
          </div>
        );

      case "Staffs":
        if (subPage === "ViewStaff") {
          return (
            <div className="p-0">
              <StaffView
                staffId={selectedProperty}
                goBack={() => setSubPage(null)}
              />
            </div>
          );
        }

        return (
          <div className="p-8 pt-3 text-lg font-semibold">
            <Staffs
              openStaffView={(staff) => {
                setSelectedProperty(staff._id);
                setSubPage("ViewStaff");
              }}
            />
          </div>
        );
    }
  };

  return (
    <>
      <Header />
      <div className="flex h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
        {/* Sidebar */}
        {/* Sidebar */}
        <div className="w-[280px] flex flex-col items-center py-6">
          <div className="flex flex-col w-full gap-4 px-4">
            {menuItems.map((item) => (
              <div key={item.key} className="w-full">
                <button
                  onClick={() => {
                    if (item.key === "Properties") {
                      setActivePage((prev) =>
                        prev === "Properties" && subPage ? "" : "Properties"
                      );
                      setSubPage(null);
                      setSubSubPage(null);
                    } else {
                      setActivePage(item.key);
                      setSubPage(null);
                      setSubSubPage(null);
                    }
                  }}
                  className={`group flex w-full cursor-pointer items-center justify-between gap-3 px-2 pr-3 py-2 rounded-full transition-all duration-200 ${activePage === item.key
                    ? "bg-[#41398B] text-white"
                    : "text-gray-700 hover:bg-[#41398B] hover:text-white"
                    }`}
                >
                  {/* Left Section (icon + label) */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-3 rounded-full transition-all duration-200 ${activePage === item.key
                        ? "bg-[#fff] text-[#41398B]"
                        : "bg-[#E8E8FF] text-[#41398B] group-hover:bg-white group-hover:text-[#41398B]"
                        }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-sm font-medium ${activePage === item.key
                        ? "text-white"
                        : "text-gray-800 group-hover:text-white"
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Right Section (Chevron only for Properties) */}
                  {item.key === "Properties" && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${activePage === "Properties" ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  )}
                </button>

                {/* Submenu for Properties */}
                {item.key === "Properties" && activePage === "Properties" && (
                  <div className="mt-2 ml-4 flex flex-col gap-2 animate-slideDown">
                    {[
                      {
                        key: "Lease",
                        label: "Lease",
                        icon: <Key className="w-4 h-4" />,
                      },
                      {
                        key: "Sale",
                        label: "Sale",
                        icon: <Home className="w-4 h-4" />,
                      },
                      {
                        key: "Home Stay",
                        label: "Home Stay",
                        icon: <BedDouble className="w-4 h-4" />,
                      },
                    ].map((sub) => {
                      const isActive =
                        subPage === sub.key ||
                        subPage?.startsWith(`CreateProperty-${sub.key}`);
                      return (
                        <button
                          key={sub.key}
                          onClick={() => setSubPage(sub.key)}
                          className={`flex items-center cursor-pointer gap-3 text-left text-sm px-1 py-1 rounded-full transition-all duration-150 ${isActive
                            ? "bg-[#41398B] text-white font-semibold"
                            : "text-gray-700 hover:bg-[#EAE8FD] hover:text-[#41398B]"
                            }`}
                        >
                          <span
                            className={`p-3 rounded-full ${isActive
                              ? "bg-white text-[#41398B]"
                              : "bg-[#E8E8FF] text-[#41398B]"
                              }`}
                          >
                            {sub.icon}
                          </span>
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto">{renderPage()}</div>
      </div>
    </>
  );
};

export default DashboardLayout;
