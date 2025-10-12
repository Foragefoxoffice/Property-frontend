import React, { useState } from "react";
import { Home, Users, UserCog, LayoutGrid } from "lucide-react";
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

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState("Properties");
  const [subPage, setSubPage] = useState(null);
  const [subSubPage, setSubSubPage] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const menuItems = [
    { name: "Properties", icon: <Home className="w-4 h-4" /> },
    { name: "Owners / Landlords", icon: <Users className="w-4 h-4" /> },
    { name: "Staffs", icon: <UserCog className="w-4 h-4" /> },
    { name: "Masters", icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  const renderPage = () => {
    if (activePage === "Masters") {
      if (subPage === "PropertyMaster") {
        if (subSubPage === "PropertyPage")
          return <PropertyPage goBack={() => setSubSubPage(null)} />;
        if (subSubPage === "ZoneSubAreaPage")
          return <ZoneSubAreaPage goBack={() => setSubSubPage(null)} />;
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

        return (
          <PropertyMaster
            goBack={() => setSubPage(null)}
            openPropertyPage={() => setSubSubPage("PropertyPage")}
            openZoneSubAreaPage={() => setSubSubPage("ZoneSubAreaPage")}
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
        if (subPage === "CreateProperty" || subPage === "EditProperty") {
          return (
            <div className="p-0">
              <CreatePropertyPage
                goBack={() => setSubPage(null)}
                editData={selectedProperty} // ✅ Pass data here
                isEditMode={subPage === "EditProperty"} // ✅ Flag for edit mode
              />
            </div>
          );
        }
        return (
          <div className="p-8">
            <ManageProperty
              openCreateProperty={() => setSubPage("CreateProperty")}
              openEditProperty={(property) => {
                setSelectedProperty(property); // ✅ store clicked property
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
                ownerId={selectedProperty} // using the same variable for convenience
                goBack={() => setSubPage(null)}
              />
            </div>
          );
        }

        return (
          <div className="p-8 text-lg font-semibold">
            <OwnersLandlords
              openOwnerView={(owner) => {
                setSelectedProperty(owner._id); // store selected owner id
                setSubPage("ViewOwner"); // navigate to view mode
              }}
            />
          </div>
        );

      case "Staffs":
        return (
          <div className="p-8 text-lg font-semibold">
            <Staffs />
          </div>
        );
      default:
        return <div className="p-8">Select a menu item</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-white to-[#f3f2ff]">
      {/* Sidebar */}
      <div className="w-[280px] bg-gradient-to-b from-white to-[#f3f2ff] flex flex-col items-center py-6 shadow-sm">
        <div className="text-3xl font-extrabold tracking-wide text-black mb-8">
          ZEPRA
        </div>
        <div className="flex flex-col w-full gap-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActivePage(item.name);
                setSubPage(null);
                setSubSubPage(null);
              }}
              className={`group flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                activePage === item.name
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-black hover:text-white"
              }`}
            >
              <span
                className={`p-2 rounded-full transition-all duration-200 ${
                  activePage === item.name
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 group-hover:bg-white group-hover:text-black"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-sm font-medium ${
                  activePage === item.name
                    ? "text-white"
                    : "text-gray-800 group-hover:text-white"
                }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-tl-3xl shadow-inner overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default DashboardLayout;
