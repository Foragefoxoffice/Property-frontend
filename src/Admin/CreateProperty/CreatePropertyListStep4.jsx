import React, { useState } from "react";
import { Play, Image as ImageIcon, FileText, ChevronDown } from "lucide-react";

export default function CreatePropertyListStep4({ onSubmit, propertyData = {} }) {
  const [lang, setLang] = useState("en");
  const t = {
    en: {
      reviewTitle: "Review Property Details",
      reviewSubtitle:
        "Please review all entered details before submitting. You can edit them later if needed.",
      listingInfo: "Listing Information",
      propertyInfo: "Property Information",
      media: "Media Gallery",
      financial: "Financial Details",
      contact: "Contact / Management",
      submit: "Submit Property",
    },
    vi: {
      reviewTitle: "Xem lại thông tin Bất Động Sản",
      reviewSubtitle:
        "Vui lòng kiểm tra lại tất cả thông tin trước khi gửi. Bạn có thể chỉnh sửa sau nếu cần.",
      listingInfo: "Thông Tin Niêm Yết",
      propertyInfo: "Thông Tin Bất Động Sản",
      media: "Thư Viện Hình Ảnh",
      financial: "Chi Tiết Tài Chính",
      contact: "Thông Tin Liên Hệ / Quản Lý",
      submit: "Gửi Bất Động Sản",
    },
  }[lang];

  const safe = (val) =>
    typeof val === "object" ? val?.[lang] || val?.en || val?.vi || "" : val || "";

  const formatCurrency = (val, currency) =>
    val ? `${Number(val).toLocaleString()} ${currency || ""}` : "-";

  const mediaSection = (label, files, type) => (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-800 mb-3">{label}</h3>
      <div className="flex flex-wrap gap-3">
        {files?.length ? (
          files.map((file, i) => (
            <div
              key={i}
              className="relative w-40 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
            >
              {type === "video" ? (
                <video
                  src={file.url || file}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={file.url || file}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-40 h-28 border border-dashed border-gray-300 rounded-xl text-gray-400">
            {type === "video" ? (
              <Play className="w-5 h-5 mb-1" />
            ) : (
              <ImageIcon className="w-5 h-5 mb-1" />
            )}
            <span className="text-xs">No files</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f3f6] p-10">
      {/* Header + Lang Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.reviewTitle}</h1>
          <p className="text-gray-600 mt-1">{t.reviewSubtitle}</p>
        </div>

        <div className="flex bg-white border border-gray-200 rounded-full overflow-hidden">
          {["en", "vi"].map((lng) => (
            <button
              key={lng}
              onClick={() => setLang(lng)}
              className={`px-4 py-1.5 text-sm font-medium ${lang === lng
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black"
                }`}
            >
              {lng === "en" ? "EN" : "VI"}
            </button>
          ))}
        </div>
      </div>

      {/* CARD: Listing Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.listingInfo}</h2>
        <div className="grid grid-cols-3 gap-4 text-gray-700 text-sm">
          <p><strong>Property ID:</strong> {propertyData.propertyId || "-"}</p>
          <p><strong>Transaction Type:</strong> {propertyData.transactionType}</p>
          <p><strong>Project / Community:</strong> {safe(propertyData.projectId)}</p>
          <p><strong>Area / Zone:</strong> {safe(propertyData.zoneId)}</p>
          <p><strong>Block Name:</strong> {safe(propertyData.blockName)}</p>
          <p><strong>Property Title:</strong> {safe(propertyData.title)}</p>
          <p><strong>Property Type:</strong> {safe(propertyData.propertyType)}</p>
          <p><strong>Date Listed:</strong> {propertyData.dateListed || "-"}</p>
          <p><strong>Available From:</strong> {propertyData.availableFrom || "-"}</p>
          <p><strong>Availability Status:</strong> {safe(propertyData.availabilityStatus)}</p>
        </div>
      </div>

      {/* CARD: Property Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.propertyInfo}</h2>
        <div className="grid grid-cols-3 gap-4 text-gray-700 text-sm">
          <p><strong>Unit:</strong> {safe(propertyData.unit)}</p>
          <p><strong>Unit Size:</strong> {propertyData.unitSize || "-"}</p>
          <p><strong>Bedrooms:</strong> {propertyData.bedrooms || "-"}</p>
          <p><strong>Bathrooms:</strong> {propertyData.bathrooms || "-"}</p>
          <p><strong>Floors:</strong> {propertyData.floors || "-"}</p>
          <p><strong>Furnishing:</strong> {safe(propertyData.furnishing)}</p>
          <p><strong>View:</strong> {safe(propertyData.view)}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-600 text-sm whitespace-pre-line">
            {safe(propertyData.description) || "-"}
          </p>
        </div>

        {propertyData.utilities?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">Utilities</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              {propertyData.utilities.map((u, i) => (
                <li key={i}>
                  • {safe(u.name)} {u.icon && `(${u.icon})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CARD: Media */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.media}</h2>
        {mediaSection("Property Images", propertyData.propertyImages, "image")}
        {mediaSection("Property Videos", propertyData.propertyVideos, "video")}
        {mediaSection("Floor Plans", propertyData.floorPlans, "image")}
      </div>

      {/* CARD: Financial */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.financial}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
          <p><strong>Currency:</strong> {propertyData.currency || "-"}</p>
          <p><strong>Price:</strong> {formatCurrency(propertyData.price, propertyData.currency)}</p>
          <p><strong>Deposit:</strong> {safe(propertyData.depositPaymentTerms)}</p>
          <p><strong>Payment Terms:</strong> {safe(propertyData.maintenanceFeeMonthly)}</p>
          <p><strong>Lease Price:</strong> {formatCurrency(propertyData.leasePrice, propertyData.currency)}</p>
          <p><strong>Contract Length:</strong> {propertyData.contractLength || "-"}</p>
          <p><strong>Price per Night:</strong> {formatCurrency(propertyData.pricePerNight, propertyData.currency)}</p>
          <p><strong>Check-in:</strong> {propertyData.checkIn || "-"}</p>
          <p><strong>Check-out:</strong> {propertyData.checkOut || "-"}</p>
        </div>
      </div>

      {/* CARD: Contact / Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.contact}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Owner:</strong> {propertyData.owner || "-"}</p>
          <p><strong>Consultant:</strong> {safe(propertyData.consultant)}</p>
          <p><strong>Connecting Point:</strong> {safe(propertyData.connectingPoint)}</p>
          <p><strong>Connecting Notes:</strong> {safe(propertyData.connectingPointNotes)}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Internal Notes</h3>
          <p className="text-gray-600 text-sm whitespace-pre-line">
            {safe(propertyData.internalNotes) || "-"}
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          className="px-10 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          {t.submit}
        </button>
      </div>
    </div>
  );
}
