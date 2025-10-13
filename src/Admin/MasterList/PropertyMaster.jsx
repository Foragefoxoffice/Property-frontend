import React from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function PropertyMaster({
  goBack,
  openPropertyPage,
  openZoneSubAreaPage,
  openPropertyTypePage,
  openAvailabilityStatusPage,
  openUnitPage,
  openFurnishingPage,
  // openParkingPage,
  // openPetPolicyPage,
  openDepositPage,
  openPaymentPage,
}) {
  const { language } = useLanguage();

  const propertyData = [
    {
      name: language === "vi" ? "Dự án / Khu dân cư" : "Project / Community",
      description:
        language === "vi"
          ? "Tên của dự án hoặc khu dân cư (nhà ở hoặc thương mại) nơi bất động sản tọa lạc."
          : "The name of the residential or commercial project or community where the property is located.",
      onClick: openPropertyPage,
    },
    {
      name: language === "vi" ? "Khu vực / Tiểu khu" : "Zone / Sub-area",
      description:
        language === "vi"
          ? "Khu vực, khối hoặc tiểu khu cụ thể trong dự án hoặc quận — dùng để xác định vị trí nội bộ hoặc lọc."
          : "The specific section, block, or zone within a project or district — used for internal location mapping or filtering.",
      onClick: openZoneSubAreaPage,
    },
    {
      name: language === "vi" ? "Loại bất động sản" : "Property Type",
      description:
        language === "vi"
          ? "Xác định danh mục hoặc loại bất động sản."
          : "Defines the category or kind of property.",
      onClick: openPropertyTypePage,
    },
    {
      name: language === "vi" ? "Trạng thái khả dụng" : "Availability Status",
      description:
        language === "vi"
          ? "Chỉ ra tình trạng của bất động sản — đang trống, đã được thuê, hoặc đang được niêm yết."
          : "Indicates whether the property is available or occupied, and its current listing state.",
      onClick: openAvailabilityStatusPage,
    },
    {
      name: language === "vi" ? "Đơn vị đo lường" : "Unit",
      description:
        language === "vi"
          ? "Định nghĩa đơn vị đo được sử dụng cho diện tích bất động sản — xác định cách hiển thị kích thước và giá theo diện tích."
          : "Defines the measurement unit used for the property's area (size) — determines how the property's dimensions and price per area are displayed.",
      onClick: openUnitPage,
    },
    {
      name: language === "vi" ? "Tình trạng nội thất" : "Furnishing",
      description:
        language === "vi"
          ? "Mô tả tình trạng hoặc mức độ đầy đủ của nội thất và thiết bị trong bất động sản."
          : "Describes the furniture and appliance condition or level of furnishing.",
      onClick: openFurnishingPage,
    },
    {
      name: language === "vi" ? "Tiền đặt cọc" : "Deposit",
      description:
        language === "vi"
          ? "Chỉ định số tiền hoặc phần trăm đặt cọc cần thiết khi thuê hoặc mua bất động sản."
          : "Specifies the required deposit amount or percentage for booking or leasing the property.",
      onClick: openDepositPage,
    },
    {
      name: language === "vi" ? "Điều khoản thanh toán" : "Payment terms",
      description:
        language === "vi"
          ? "Chi tiết lịch trình thanh toán và các điều kiện liên quan."
          : "Details the payment schedule and conditions.",
      onClick: openPaymentPage,
    },
    // Optional future items:
    // {
    //   name: language === "vi" ? "Chính sách thú cưng" : "Pet Policy",
    //   description:
    //     language === "vi"
    //       ? "Cho biết liệu thú cưng có được phép trong bất động sản hoặc tòa nhà không."
    //       : "States whether pets are allowed in the property or building.",
    //   onClick: openPetPolicyPage,
    // },
  ];

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
          {language === "vi"
            ? "Danh mục quản lý bất động sản"
            : "Property Masters"}
        </h2>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_4fr_auto] bg-gray-50 font-medium text-gray-800 px-6 py-3 border-b border-gray-200">
          <div>{language === "vi" ? "Danh mục" : "Property Masters"}</div>
          <div>{language === "vi" ? "Mô tả" : "Description"}</div>
          <div></div>
        </div>

        {propertyData.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className={`grid grid-cols-[2fr_4fr_auto] items-center px-6 py-4 text-sm text-gray-700 cursor-pointer ${
              index % 2 === 1 ? "bg-gray-50" : "bg-white"
            } hover:bg-gray-100 transition-colors`}
          >
            <div className="font-medium">{item.name}</div>
            <div className="text-gray-600 leading-snug">{item.description}</div>
            <div className="flex justify-end">
              <button className="w-8 h-8 flex items-center justify-center border border-[#41398B] rounded-full hover:bg-[#41398B] hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
