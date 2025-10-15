import React, { useState, useEffect } from "react";
import { Plus, X, ArrowRight, ArrowLeft, Eye } from "lucide-react";
import { Select as AntdSelect } from "antd";
import {
  getAllDeposits,
  getAllPayments,
  getAllCurrencies, // ✅ import currency API
} from "../../Api/action";

/* =========================================================
   💜 SKELETON LOADER (with bg-[#41398b29])
========================================================= */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-40 mb-6"></div>
    {[...Array(3)].map((_, sectionIndex) => (
      <div key={sectionIndex} className="mb-8">
        <div className="h-5 bg-[#41398b29] rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 bg-[#41398b29] rounded w-24"></div>
              <div className="h-12 bg-[#41398b29] rounded"></div>
            </div>
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

export default function CreatePropertyListStep2({
  onNext,
  onPrev,
  onChange,
  initialData = {},
}) {
  const [lang, setLang] = useState("en");
  const [deposits, setDeposits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     🗂️ Load Deposits + Payments + Currencies
  ========================================================== */
  useEffect(() => {
    async function loadDropdowns() {
      try {
        setLoadingCurrencies(true);
        const [depRes, payRes, curRes] = await Promise.all([
          getAllDeposits(),
          getAllPayments(),
          getAllCurrencies(),
        ]);

        setDeposits(
          (depRes.data?.data || []).filter((d) => d.status === "Active")
        );
        setPayments(
          (payRes.data?.data || []).filter((p) => p.status === "Active")
        );

        const allCurrencies = curRes.data?.data || [];
        setCurrencies(allCurrencies);

        // ✅ Find default currency (isDefault: true)
        const defaultCurrency = allCurrencies.find((c) => c.isDefault);

        // ✅ Set default currency automatically if not manually provided
        if (!initialData.currency && defaultCurrency) {
          setForm((p) => ({
            ...p,
            currency: {
              symbol:
                defaultCurrency.currencySymbol?.en ||
                defaultCurrency.currencySymbol?.vi ||
                "$",
              code:
                defaultCurrency.currencyCode?.en ||
                defaultCurrency.currencyCode?.vi ||
                "USD",
              name:
                defaultCurrency.currencyName?.en ||
                defaultCurrency.currencyName?.vi ||
                "US Dollar",
            },
          }));
        }
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      } finally {
        setLoadingCurrencies(false);
        setLoading(false);
      }
    }
    loadDropdowns();
  }, []);

  /* =========================================================
     🏷️ Translations
  ========================================================== */
  const t = {
    en: {
      propertyImages: "Property Images",
      propertyVideo: "Property Video",
      floorPlan: "Floor Plan",
      recommendedImg: "Recommended: (jpg, jpeg, png, webp, svg)",
      recommendedVid: "Recommended: (mp4, webm, mov, avi, mkv)",
      clickUpload: "Click here to upload",
      financialDetails: "Financial Details",
      currency: "Currency",
      price: "Price",
      contractTerms: "Contract Terms",
      depositPaymentTerms: "Deposit",
      maintenanceFeeMonthly: "Payment Terms",
      leasePrice: "Lease Price",
      contractLength: "Contract Length",
      pricePerNight: "Price Per Night",
      checkIn: "Check-In Time",
      typehere: "Type here",
      checkOut: "Check-Out Time",
    },
    vi: {
      propertyImages: "Hình Ảnh Bất Động Sản",
      propertyVideo: "Video Bất Động Sản",
      floorPlan: "Sơ Đồ Mặt Bằng",
      recommendedImg: "Đề xuất: (jpg, jpeg, png, webp, svg)",
      recommendedVid: "Đề xuất: (mp4, webm, mov, avi, mkv)",
      clickUpload: "Nhấn để tải lên",
      financialDetails: "Chi Tiết Tài Chính",
      currency: "Tiền Tệ",
      price: "Giá",
      contractTerms: "Điều Khoản Hợp Đồng",
      depositPaymentTerms: "Tiền gửi",
      maintenanceFeeMonthly: "Điều khoản thanh toán",
      leasePrice: "Giá Thuê",
      contractLength: "Thời Hạn Hợp Đồng",
      pricePerNight: "Giá Mỗi Đêm",
      typehere: "Nhập tại đây",
      checkIn: "Giờ Nhận Phòng",
      checkOut: "Giờ Trả Phòng",
    },
  }[lang];

  const transactionType = initialData.transactionType || "Sale";

  const [form, setForm] = useState({
    currency: initialData.currency || { symbol: "", code: "", name: "" },
    price: initialData.price || "",
    leasePrice: initialData.leasePrice || "",
    contractLength: initialData.contractLength || "",
    pricePerNight: initialData.pricePerNight || "",
    checkIn: initialData.checkIn || "2:00 PM",
    checkOut: initialData.checkOut || "11:00 AM",
    contractTerms: initialData.contractTerms || { en: "", vi: "" },
    depositPaymentTerms: initialData.depositPaymentTerms || { en: "", vi: "" },
    maintenanceFeeMonthly: initialData.maintenanceFeeMonthly || {
      en: "",
      vi: "",
    },
  });

  const [images, setImages] = useState(initialData.propertyImages || []);
  const [videos, setVideos] = useState(initialData.propertyVideos || []);
  const [floorPlans, setFloorPlans] = useState(initialData.floorPlans || []);

  /* ✅ Sync when editing an existing property */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        currency: initialData.currency || prev.currency,
        price: initialData.price || prev.price,
        leasePrice: initialData.leasePrice || prev.leasePrice,
        contractLength: initialData.contractLength || prev.contractLength,
        pricePerNight: initialData.pricePerNight || prev.pricePerNight,
        checkIn: initialData.checkIn || prev.checkIn,
        checkOut: initialData.checkOut || prev.checkOut,
        contractTerms: initialData.contractTerms || prev.contractTerms,
        depositPaymentTerms:
          initialData.depositPaymentTerms || prev.depositPaymentTerms,
        maintenanceFeeMonthly:
          initialData.maintenanceFeeMonthly || prev.maintenanceFeeMonthly,
      }));

      // ✅ Also update media fields
      setImages(initialData.propertyImages || []);
      setVideos(initialData.propertyVideos || []);
      setFloorPlans(initialData.floorPlans || []);
    }
  }, [initialData]);

  /* =========================================================
     📁 Upload Helpers
  ========================================================== */
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    const newFile = { file, url: base64 };
    if (type === "image") setImages((p) => [...p, newFile]);
    if (type === "video") setVideos((p) => [...p, newFile]);
    if (type === "floor") setFloorPlans((p) => [...p, newFile]);
  };

  const handleRemove = (type, i) => {
    if (type === "image") setImages((p) => p.filter((_, x) => x !== i));
    if (type === "video") setVideos((p) => p.filter((_, x) => x !== i));
    if (type === "floor") setFloorPlans((p) => p.filter((_, x) => x !== i));
  };

  /* =========================================================
     🔧 Form Handlers
  ========================================================== */
  const handleChange = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const handleLocalizedChange = (lng, f, v) =>
    setForm((p) => ({
      ...p,
      [f]: { ...(p[f] || { en: "", vi: "" }), [lng]: v },
    }));

  /* =========================================================
     📦 Upload Box Component
  ========================================================== */
  const UploadBox = ({
    label,
    recommended,
    files,
    type,
    accept,
    handleFileUpload,
    handleRemove,
  }) => {
    const [preview, setPreview] = useState(null);

    return (
      <div className="mb-8">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-xs text-gray-500 mb-3">{recommended}</p>

        <div className="flex flex-wrap gap-4">
          {files.map((f, i) => (
            <div
              key={i}
              className="relative w-56 h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
            >
              {type === "video" ? (
                <video
                  src={f.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={f.url}
                  className="w-full h-full object-contain"
                  alt=""
                />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setPreview(f.url)}
                  className="bg-white rounded-full p-2 shadow hover:scale-105 transition"
                >
                  <Eye className="w-4 h-4 cursor-pointer text-gray-700" />
                </button>
                <button
                  onClick={() => handleRemove(type, i)}
                  className="bg-white rounded-full p-2 shadow hover:scale-105 transition"
                >
                  <X className="w-4 h-4 text-gray-700 cursor-pointer" />
                </button>
              </div>
            </div>
          ))}

          {/* Upload Button */}
          <label className="w-60 h-50 border border-dashed border-[#646466] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-all">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 border border-dashed border-[#646466] rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm text-[#646466] mt-2">
                {t.clickUpload}
              </span>
            </div>
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileUpload(e, type)}
              className="hidden"
            />
          </label>
        </div>

        {/* Popup Preview */}
        {preview && (
          <div
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full max-h-[100vh] rounded-xl overflow-hidden flex justify-center p-10"
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 z-9 right-3 cursor-pointer text-white bg-[#41398B] hover:bg-[#41398be6] rounded-full p-1 shadow"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              {type === "video" ? (
                <video
                  src={preview}
                  className="w-full h-full object-contain rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={preview}
                  className="w-full h-full object-contain rounded-lg"
                  alt="Preview"
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* SHOW SKELETON IF LOADING */
  if (loading) return <SkeletonLoader />;

  /* =========================================================
     🧱 RENDER
  ========================================================== */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* 🌐 Language Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {["en", "vi"].map((lng) => (
          <button
            key={lng}
            className={`px-6 py-2 text-sm font-medium ${
              lang === lng
                ? "border-b-2 border-[#41398B] text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setLang(lng)}
          >
            {lng === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
          </button>
        ))}
      </div>

      {/* Upload Sections */}
      <UploadBox
        label={t.propertyImages}
        recommended={t.recommendedImg}
        files={images}
        type="image"
        accept="image/*"
        handleFileUpload={handleFileUpload}
        handleRemove={handleRemove}
      />

      <UploadBox
        label={t.propertyVideo}
        recommended={t.recommendedVid}
        files={videos}
        type="video"
        accept="video/*"
        handleFileUpload={handleFileUpload}
        handleRemove={handleRemove}
      />

      <UploadBox
        label={t.floorPlan}
        recommended={t.recommendedImg}
        files={floorPlans}
        type="floor"
        accept="image/*"
        handleFileUpload={handleFileUpload}
        handleRemove={handleRemove}
      />

      {/* 💰 FINANCIAL DETAILS */}
      <h2 className="text-lg font-semibold mt-8 mb-4">{t.financialDetails}</h2>
      <div className="grid grid-cols-3 gap-5">
        {/* Currency */}
        <div className="flex flex-col">
          <label className="text-sm text-[#131517] font-semibold mb-2">
            {t.currency}
          </label>
          <select
            value={form.currency?.symbol || ""}
            onChange={(e) => {
              const selected = currencies.find(
                (c) => c.currencySymbol?.en === e.target.value
              );
              if (selected) {
                setForm((p) => ({
                  ...p,
                  currency: {
                    symbol: selected.currencySymbol?.en,
                    code: selected.currencyCode?.en,
                    name: selected.currencyName?.en,
                  },
                }));
              }
            }}
            className="appearance-none border border-[#B2B2B3] h-12 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
          >
            <option value="">Select Currency</option>
            {loadingCurrencies ? (
              <option disabled>Loading...</option>
            ) : (
              currencies.map((c) => (
                <option key={c._id} value={c.currencySymbol?.en}>
                  {c.currencyName?.[lang.toUpperCase()] || c.currencyName?.en} (
                  {c.currencySymbol?.en})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Sale / Lease / Homestay pricing */}
        {transactionType === "Sale" && (
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.price}
            </label>
            <input
              type="number"
              placeholder={t.typehere}
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>
        )}

        {transactionType === "Lease" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm text-[#131517] font-semibold mb-2">
                {t.leasePrice}
              </label>
              <input
                type="number"
                value={form.leasePrice}
                placeholder="Type here"
                onChange={(e) => handleChange("leasePrice", e.target.value)}
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[#131517] font-semibold mb-2">
                {t.contractLength}
              </label>
              <input
                type="text"
                value={form.contractLength}
                placeholder="Type here"
                onChange={(e) => handleChange("contractLength", e.target.value)}
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
          </>
        )}

        {transactionType === "Home Stay" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm text-[#131517] font-semibold mb-2">
                {t.pricePerNight}
              </label>
              <input
                type="number"
                placeholder="Type here"
                value={form.pricePerNight}
                onChange={(e) => handleChange("pricePerNight", e.target.value)}
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[#131517] font-semibold mb-2">
                {t.checkIn}
              </label>
              <input
                type="text"
                value={form.checkIn}
                onChange={(e) => handleChange("checkIn", e.target.value)}
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-[#131517] font-semibold mb-2">
                {t.checkOut}
              </label>
              <input
                type="text"
                value={form.checkOut}
                onChange={(e) => handleChange("checkOut", e.target.value)}
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
          </>
        )}

        {/* 🏦 Deposit Type / Select */}
        <div className="flex flex-col col-span-3">
          <label className="text-sm text-[#131517] font-semibold mb-2">
            {t.depositPaymentTerms}
          </label>
          <AntdSelect
            showSearch
            allowClear
            placeholder={
              lang === "en"
                ? "Type or Select Deposit"
                : "Nhập hoặc chọn khoản đặt cọc"
            }
            value={form.depositPaymentTerms?.[lang] || undefined}
            onChange={(value) => {
              // User selected an existing option
              handleLocalizedChange(lang, "depositPaymentTerms", value);
            }}
            onSearch={(val) => {
              // User typed a new value (same logic as Zone in Step 1)
              if (val && val.trim() !== "") {
                handleLocalizedChange(lang, "depositPaymentTerms", val.trim());
              }
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={null}
            className="w-full custom-select"
            popupClassName="custom-dropdown"
            options={deposits.map((opt) => ({
              label: opt.name?.[lang] || "",
              value: opt.name?.[lang] || "",
            }))}
          />
        </div>

        {/* 💳 Payment Terms Type / Select */}
        <div className="flex flex-col col-span-3 mt-3">
          <label className="text-sm text-[#131517] font-semibold mb-2">
            {t.maintenanceFeeMonthly}
          </label>
          <AntdSelect
            showSearch
            allowClear
            placeholder={
              lang === "en"
                ? "Type or Select Payment Term"
                : "Nhập hoặc chọn điều khoản thanh toán"
            }
            value={form.maintenanceFeeMonthly?.[lang] || undefined}
            onChange={(value) => {
              // User selected existing term
              handleLocalizedChange(lang, "maintenanceFeeMonthly", value);
            }}
            onSearch={(val) => {
              // User typed a new payment term (same behavior as Zone)
              if (val && val.trim() !== "") {
                handleLocalizedChange(
                  lang,
                  "maintenanceFeeMonthly",
                  val.trim()
                );
              }
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={null}
            className="w-full custom-select"
            popupClassName="custom-dropdown"
            options={payments.map((opt) => ({
              label: opt.name?.[lang] || "",
              value: opt.name?.[lang] || "", // ✅
            }))}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 items-center text-gray-700 rounded-full hover:bg-gray-100 flex gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={18} />
          {lang === "en" ? "Previous" : "Trước"}
        </button>

        <button
          onClick={() => {
            onChange &&
              onChange({
                ...form,
                propertyImages: images,
                propertyVideos: videos,
                floorPlans,
              });
            onNext(form);
          }}
          className="px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full cursor-pointer flex gap-1.5 items-center"
        >
          {lang === "en" ? "Next" : "Tiếp theo"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
