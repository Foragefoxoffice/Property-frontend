import React, { useState } from "react";
import {
  Home,
  Users,
  UserCog,
  LayoutGrid,
  Key,
  BedDouble,
  ChevronDown,
  Trash,
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
import BlockPage from "../MasterList/MasterListPage/BlockPage";
import FeeTaxPage from "../MasterList/MasterListPage/FeeTaxPage";
import LegalDocumentPage from "../MasterList/MasterListPage/LegalDocumentPage";
import FloorRange from "../MasterList/MasterListPage/FloorRangePage";
import TrashPage from "../Trash/TrashPage";

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState("Lease");
  const [subPage, setSubPage] = useState(null);
  const [subSubPage, setSubSubPage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertiesOpen, setPropertiesOpen] = useState(true);

  const { language } = useLanguage();
  const t = translations[language];

  const menuItems = [
    { key: "Lease", label: "Lease", icon: <Key className="w-4 h-4" /> },
    { key: "Sale", label: "Sale", icon: <Home className="w-4 h-4" /> },
    { key: "Home Stay", label: "Home Stay", icon: <BedDouble className="w-4 h-4" /> },
    { key: "Landlords", label: t.owners, icon: <Users className="w-4 h-4" /> },
    { key: "Staffs", label: t.staffs, icon: <UserCog className="w-4 h-4" /> },
    { key: "Masters", label: t.masters, icon: <LayoutGrid className="w-4 h-4" /> },
    { key: "Trash", label: "Trash", icon: <Trash className="w-4 h-4" /> },
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
        if (subSubPage === "FloorRangePage")
          return <FloorRange goBack={() => setSubSubPage(null)} />;

        return (
          <PropertyMaster
            goBack={() => setSubPage(null)}
            openPropertyPage={() => setSubSubPage("PropertyPage")}
            openZoneSubAreaPage={() => setSubSubPage("ZoneSubAreaPage")}
            openBlockPage={() => setSubSubPage("BlockPage")}
            openPropertyTypePage={() => setSubSubPage("PropertyTypePage")}
            openAvailabilityStatusPage={() => setSubSubPage("AvailabilityStatusPage")}
            openUnitPage={() => setSubSubPage("UnitPage")}
            openFurnishingPage={() => setSubSubPage("FurnishingPage")}
            openParkingPage={() => setSubSubPage("ParkingPage")}
            openPetPolicyPage={() => setSubSubPage("PetPolicyPage")}
            openDepositPage={() => setSubSubPage("DepositPage")}
            openPaymentPage={() => setSubSubPage("PaymentPage")}
            openFeeTaxPage={() => setSubSubPage("FeeTaxPage")}
            openLegalDocumentPage={() => setSubSubPage("LegalDocumentPage")}
            openFloorRangePage={() => setSubSubPage("FloorRangePage")}
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

    if (["Lease", "Sale", "Home Stay"].includes(activePage)) {
      if (subPage?.startsWith("CreateProperty") || subPage === "EditProperty") {
        let transactionType = activePage;

        if (subPage?.startsWith("CreateProperty-")) {
          const type = subPage.replace("CreateProperty-", "").trim();
          if (type) transactionType = type;
        }

        return (
          <div className="p-0">
            <CreatePropertyPage
              goBack={() => setSubPage(transactionType)}
              editData={selectedProperty}
              isEditMode={subPage === "EditProperty"}
              defaultTransactionType={transactionType}
            />
          </div>
        );
      }

      return (
        <div className="p-8 pt-3">
          <PropertyManager
            propertyTypeFilter={activePage}
            openCreateProperty={() =>
              setSubPage(`CreateProperty-${activePage}`)
            }
            openEditProperty={(property) => {
              setSelectedProperty(property);
              setSubPage("EditProperty");
            }}
          />
        </div>
      );
    }

    if (activePage === "Landlords") {
      if (subPage === "ViewOwner") {
        return <OwnerView ownerId={selectedProperty} goBack={() => setSubPage(null)} />;
      }

      return (
        <div className="p-8 pt-3">
          <OwnersLandlords
            openOwnerView={(owner) => {
              setSelectedProperty(owner._id);
              setSubPage("ViewOwner");
            }}
          />
        </div>
      );
    }

    if (activePage === "Staffs") {
      if (subPage === "ViewStaff") {
        return <StaffView staffId={selectedProperty} goBack={() => setSubPage(null)} />;
      }

      return (
        <div className="p-8 pt-3">
          <Staffs
            openStaffView={(staff) => {
              setSelectedProperty(staff._id);
              setSubPage("ViewStaff");
            }}
          />
        </div>
      );
    }

    // ✅ ✅ FINAL TRASH PAGE — Correct Placement
    if (activePage === "Trash") {
      return <TrashPage />;
    }
  };


  return (
    <>
      <Header />
      <div className="flex h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
        {/* ✅ Sidebar */}
        <div className="w-[280px] flex flex-col items-center py-6">
          <div className="flex flex-col w-full gap-4 px-4">

            {/* ✅ Properties Dropdown */}
            <div className="w-full">
              <button
                onClick={() => setPropertiesOpen(!propertiesOpen)}
                className="group flex w-full cursor-pointer items-center justify-between gap-3 px-2 pr-3 py-2 rounded-full transition-all duration-200 
                  text-gray-700 hover:bg-[#41398B] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white group-hover:text-[#41398B]">
                    <Home className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium group-hover:text-white">
                    Properties
                  </span>
                </div>
                <span
                  className={`transition-transform duration-200 ${propertiesOpen ? "rotate-180" : ""}`}
                >
                  <ChevronDown />
                </span>
              </button>

              {propertiesOpen && (
                <div className="ml-10 mt-2 flex flex-col gap-2">
                  {["Lease", "Sale", "Home Stay"].map((key) => {
                    const item = menuItems.find((m) => m.key === key);
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActivePage(item.key);
                          setSubPage(null);
                          setSubSubPage(null);
                        }}
                        className={`group flex w-full cursor-pointer items-center gap-3 px-2 pr-3 py-2 rounded-full transition-all duration-200 
                          ${activePage === item.key
                            ? "bg-[#41398B] text-white"
                            : "text-gray-700 hover:bg-[#41398B] hover:text-white"
                          }`}
                      >
                        <span
                          className={`p-3 rounded-full transition-all duration-200 ${activePage === item.key
                            ? "bg-white text-[#41398B]"
                            : "bg-[#E8E8FF] text-[#41398B] group-hover:bg-white group-hover:text-[#41398B]"
                            }`}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ✅ Other menu items */}
            {menuItems
              .filter((m) => !["Lease", "Sale", "Home Stay"].includes(m.key))
              .map((item) => (
                <div key={item.key} className="w-full">
                  <button
                    onClick={() => {
                      setActivePage(item.key);
                      setSubPage(null);
                      setSubSubPage(null);
                    }}
                    className={`group flex w-full cursor-pointer items-center justify-between gap-3 px-2 pr-3 py-2 rounded-full transition-all duration-200 
                      ${activePage === item.key
                        ? "bg-[#41398B] text-white"
                        : "text-gray-700 hover:bg-[#41398B] hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`p-3 rounded-full transition-all duration-200 ${activePage === item.key
                          ? "bg-white text-[#41398B]"
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
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* ✅ Main Content */}
        <div className="flex-1 overflow-auto">{renderPage()}</div>
      </div>
    </>
  );
};

export default DashboardLayout;
