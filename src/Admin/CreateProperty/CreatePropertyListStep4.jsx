import React, { useEffect, useState } from "react";
import { ArrowLeft, Eye, Globe, Loader2 } from "lucide-react";
import {
  getAllPropertyListings,
  updatePropertyListing,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";

/* 💜 Skeleton Loader Component */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-64 mb-10"></div>

    {[...Array(5)].map((_, idx) => (
      <div key={idx} className="mb-8">
        <div className="h-4 bg-[#41398b29] rounded w-48 mb-3"></div>
        <div className="grid grid-cols-3 gap-5">
          {[...Array(3)].map((__, i) => (
            <div key={i} className="h-12 bg-[#41398b29] rounded"></div>
          ))}
        </div>
      </div>
    ))}

    <div className="flex justify-between mt-10">
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
    </div>
  </div>
);

export default function CreatePropertyListStep4({ savedId, onPublish, onPrev }) {
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("Draft");
  const { language: lang } = useLanguage();
  const [loading, setLoading] = useState(false);

  const labels = {
    reviewTitle: { en: "Review & Publish Property", vi: "Xem lại & Đăng bất động sản" },
    noProperty: { en: "No property found.", vi: "Không tìm thấy bất động sản." },
    listingInfo: { en: "Listing Information", vi: "Thông tin niêm yết" },
    propertyInfo: { en: "Property Information", vi: "Thông tin bất động sản" },
    description: { en: "Description", vi: "Mô tả" },
    propertyUtility: { en: "Property Utility", vi: "Tiện ích bất động sản" },
    propertyImages: { en: "Property Images", vi: "Hình ảnh bất động sản" },
    propertyVideos: { en: "Property Videos", vi: "Video bất động sản" },
    floorPlans: { en: "Floor Plans", vi: "Bản vẽ sàn" },
    financialDetails: { en: "Financial Details", vi: "Chi tiết tài chính" },
    contactManagement: { en: "Contact / Management Details", vi: "Liên hệ / Quản lý" },
    status: { en: "Status", vi: "Trạng thái" },
    draft: { en: "Draft", vi: "Bản nháp" },
    published: { en: "Published", vi: "Đã đăng" },
    previous: { en: "Previous", vi: "Trước" },
    completed: { en: "Completed", vi: "Hoàn tất" },
    select: { en: "Select", vi: "Chọn" },
    noMedia: { en: "No media uploaded.", vi: "Chưa tải lên hình ảnh hoặc video." },
    noUtilities: { en: "No utilities added.", vi: "Chưa thêm tiện ích nào." },
    noDescription: { en: "No description provided.", vi: "Không có mô tả." },

    // 🏠 Listing Information
    propertyId: { en: "Property ID", vi: "Mã tài sản" },
    transactionType: { en: "Transaction Type", vi: "Loại giao dịch" },
    project: { en: "Project / Community", vi: "Dự án / Khu dân cư" },
    areaZone: { en: "Area / Zone", vi: "Khu vực / Vùng" },
    block: { en: "Block", vi: "Khối" },
    propertyTitle: { en: "Property Title", vi: "Tiêu đề bất động sản" },
    propertyType: { en: "Property Type", vi: "Loại bất động sản" },
    dateListed: { en: "Date Listed", vi: "Ngày niêm yết" },
    availableFrom: { en: "Available From", vi: "Có sẵn từ" },
    availabilityStatus: { en: "Availability Status", vi: "Trạng thái sẵn có" },

    // 🏢 Property Information
    unit: { en: "Unit", vi: "Đơn vị" },
    unitSize: { en: "Unit Size", vi: "Diện tích" },
    bedrooms: { en: "Bedrooms", vi: "Phòng ngủ" },
    bathrooms: { en: "Bathrooms", vi: "Phòng tắm" },
    floors: { en: "Floors", vi: "Số tầng" },
    furnishing: { en: "Furnishing", vi: "Trang bị nội thất" },
    view: { en: "View", vi: "Hướng nhìn" },

    // 💰 Financial Details
    currency: { en: "Currency", vi: "Tiền tệ" },
    price: { en: "Price", vi: "Giá" },
    deposit: { en: "Deposit", vi: "Đặt cọc" },
    paymentTerms: { en: "Payment Terms", vi: "Điều khoản thanh toán" },
    leasePrice: { en: "Lease Price", vi: "Giá thuê" },
    contractLength: { en: "Contract Length", vi: "Thời hạn hợp đồng" },
    pricePerNight: { en: "Price per Night", vi: "Giá mỗi đêm" },
    checkIn: { en: "Check-in", vi: "Nhận phòng" },
    checkOut: { en: "Check-out", vi: "Trả phòng" },
    contractTerms: { en: "Contract Terms", vi: "Điều khoản hợp đồng" },

    // 👤 Contact / Management
    owner: { en: "Owner / Landlord", vi: "Chủ sở hữu / Chủ nhà" },
    ownerNotes: { en: "Owner Notes", vi: "Ghi chú của chủ nhà" },
    consultant: { en: "Consultant", vi: "Tư vấn viên" },
    connectingPoint: { en: "Connecting Point", vi: "Điểm liên hệ" },
    connectingNotes: { en: "Connecting Notes", vi: "Ghi chú liên hệ" },
    internalNotes: { en: "Internal Notes", vi: "Ghi chú nội bộ" },
  };


  useEffect(() => {
    async function load() {
      if (!savedId) return;
      setLoading(true);
      try {
        const res = await getAllPropertyListings();
        const found = res.data.data.find((p) => p._id === savedId);
        if (found) {
          setProperty(found);
          setStatus(found.status || "Draft");
        }
      } catch (err) {
        console.error(err);
        CommonToaster("Failed to load property data", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [savedId]);

  /* 🩶 Show loader while fetching */
  if (loading) return <SkeletonLoader />;

  if (!property)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        {labels.noProperty[lang]}
      </div>
    );

  const li = property.listingInformation || {};
  const pi = property.propertyInformation || {};
  const fd = property.financialDetails || {};
  const cm = property.contactManagement || {};
  const iv = property.imagesVideos || {};
  const wn = property.whatNearby || {};

  const safe = (v) => (typeof v === "object" ? v[lang] || v.en || "" : v || "");

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white px-10 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {labels.reviewTitle[lang]}
        </h1>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto py-6 px-3 sm:px-1">
        {/* === Listing Information === */}
        <Section title={labels.listingInfo[lang]}>
          <Grid3>
            <Field label={labels.propertyId[lang]} value={li.listingInformationPropertyId} />
            <Field
              label={labels.transactionType[lang]}
              value={safe(li.listingInformationTransactionType)}
            />
            <Field
              label={labels.project[lang]}
              value={safe(li.listingInformationProjectCommunity)}
            />
            <Field
              label={labels.areaZone[lang]}
              value={safe(li.listingInformationZoneSubArea)}
            />
            <Field label={labels.block[lang]} value={safe(li.listingInformationBlockName)} />
            <Field
              label={labels.propertyTitle[lang]}
              value={safe(li.listingInformationPropertyTitle)}
            />
            <Field
              label={labels.propertyType[lang]}
              value={safe(li.listingInformationPropertyType)}
            />
            <Field
              label={labels.dateListed[lang]}
              value={li.listingInformationDateListed?.split("T")[0]}
            />
            <Field
              label={labels.availableFrom[lang]}
              value={li.listingInformationAvailableFrom?.split("T")[0]}
            />
            <Field
              label={labels.availabilityStatus[lang]}
              value={safe(li.listingInformationAvailabilityStatus)}
            />
          </Grid3>
        </Section>

        {/* === Property Information === */}
        <Section title={labels.propertyInfo[lang]}>
          <Grid3>
            <Field label={labels.unit[lang]} value={safe(pi.informationUnit)} />
            <Field label={labels.unitSize[lang]} value={pi.informationUnitSize} />
            <Field label={labels.bedrooms[lang]} value={pi.informationBedrooms} />
            <Field label={labels.bathrooms[lang]} value={pi.informationBathrooms} />
            <Field label={labels.floors[lang]} value={pi.informationFloors} />
            <Field label={labels.furnishing[lang]} value={safe(pi.informationFurnishing)} />
            <Field label={labels.view[lang]} value={safe(pi.informationView)} />
          </Grid3>
        </Section>

        {/* === Description === */}
        <Section title={labels.description[lang]}>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {safe(wn.whatNearbyDescription) || labels.noDescription[lang]}
          </p>
        </Section>

        {/* === Property Utility === */}
        <Section title={labels.propertyUtility[lang]}>
          {property.propertyUtility?.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {property.propertyUtility.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition"
                >
                  <span className="font-medium text-gray-800">
                    {safe(u.propertyUtilityUnitName)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {u.propertyUtilityIcon}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No utilities added.</p>
          )}
        </Section>

        {/* === Media Sections === */}
        <Section title={labels.propertyImages[lang]}>
          <MediaGrid files={iv.propertyImages} type="image" />
        </Section>

        <Section title={labels.propertyVideos[lang]}>
          <MediaGrid files={iv.propertyVideo} type="video" />
        </Section>

        <Section title={labels.floorPlans[lang]}>
          <MediaGrid files={iv.floorPlan} type="image" />
        </Section>

        {/* === Financial Details === */}
        <Section title={labels.financialDetails[lang]}>
          <Grid3>
            <Field label={labels.currency[lang]} value={fd.financialDetailsCurrency} />
            <Field label={labels.price[lang]} value={fd.financialDetailsPrice} />
            <Field label={labels.deposit[lang]} value={safe(fd.financialDetailsDeposit)} />
            <Field
              label={labels.paymentTerms[lang]}
              value={safe(fd.financialDetailsMainFee)}
            />
            <Field label={labels.leasePrice[lang]} value={fd.financialDetailsLeasePrice} />
            <Field
              label={labels.contractLength[lang]}
              value={fd.financialDetailsContractLength}
            />
            <Field
              label={labels.pricePerNight[lang]}
              value={fd.financialDetailsPricePerNight}
            />
            <Field label={labels.checkIn[lang]} value={fd.financialDetailsCheckIn} />
            <Field label={labels.checkOut[lang]} value={fd.financialDetailsCheckOut} />
            <Field
              label={labels.contractTerms[lang]}
              value={safe(fd.financialDetailsTerms)}
            />
          </Grid3>
        </Section>

        {/* === Contact Management === */}
        <Section title={labels.contactManagement[lang]}>
          <Grid3>
            <Field
              label={labels.owner[lang]}
              value={safe(cm.contactManagementOwner)}
            />
            <Field
              label={labels.ownerNotes[lang]}
              value={safe(cm.contactManagementOwnerNotes)}
            />
            <Field
              label={labels.consultant[lang]}
              value={safe(cm.contactManagementConsultant)}
            />
            <Field
              label={labels.connectingPoint[lang]}
              value={safe(cm.contactManagementConnectingPoint)}
            />
            <Field
              label={labels.connectingNotes[lang]}
              value={safe(cm.contactManagementConnectingPointNotes)}
            />
            <Field
              label={labels.internalNotes[lang]}
              value={safe(cm.contactManagementInternalNotes)}
            />
          </Grid3>
        </Section>

        {/* === Status and Publish Buttons === */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-10">
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-[#131517] mb-2">
              {labels.status[lang]} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none w-full h-12 border border-[#B2B2B3] rounded-lg px-3 pr-10 py-2 text-gray-700 text-sm bg-white focus:ring-2 focus:ring-[#41398B]/40 focus:border-[#41398B] outline-none transition"
              >
                <option value="">{labels.select[lang]}</option>
                <option value="Draft">{labels.draft[lang]}</option>
                <option value="Published">{labels.published[lang]}</option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-10">
          <button
            onClick={onPrev}
            className="px-6 py-2 bg-white border border-gray-300 items-center text-gray-700 rounded-full hover:bg-gray-100 flex gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={18} /> {labels.previous[lang]}
          </button>
          <button
            onClick={() => onPublish(status)}
            className="px-6 py-3 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            {labels.completed[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}

/* === Reusable Components === */
const Section = ({ title, children }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="h-[2px] flex-1 ml-4 bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      {children}
    </div>
  </div>
);

const Grid3 = ({ children }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-sm text-[#131517] font-semibold mb-2 tracking-wide">
      {label}
    </p>
    <div className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 flex items-center text-sm text-gray-700 bg-gray-50">
      {value || "—"}
    </div>
  </div>
);

const MediaGrid = ({ files = [], type }) => {
  if (!files?.length)
    return <p className="text-gray-500">No media uploaded</p>;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
      {files.map((url, i) => (
        <div
          key={i}
          className="relative group rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition"
        >
          {type === "video" ? (
            <video
              src={url}
              controls
              className="w-full h-50 object-contain bg-black/5"
            />
          ) : (
            <img
              src={url}
              alt=""
              className="w-full h-50 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
        </div>
      ))}
    </div>
  );
};
