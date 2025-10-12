import React, { useState, useEffect } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import {
  getAllDeposits,
  getAllPayments,
  getAllCurrencies, // ✅ import currency API
} from "../../Api/action";

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
  const UploadBox = ({ label, recommended, files, type, accept }) => (
    <div className="mb-8">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-xs text-gray-500 mb-3">{recommended}</p>
      <div className="flex flex-wrap gap-4">
        {files.map((f, i) => (
          <div
            key={i}
            className="relative w-56 h-40 rounded-xl overflow-hidden border"
          >
            {type === "video" ? (
              <video
                src={f.url}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img src={f.url} className="w-full h-full object-cover" alt="" />
            )}
            <button
              onClick={() => handleRemove(type, i)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ))}

        <label className="w-56 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-500 transition">
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-sm">{t.clickUpload}</span>
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileUpload(e, type)}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

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
                ? "border-b-2 border-black text-black"
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
      />
      <UploadBox
        label={t.propertyVideo}
        recommended={t.recommendedVid}
        files={videos}
        type="video"
        accept="video/*"
      />
      <UploadBox
        label={t.floorPlan}
        recommended={t.recommendedImg}
        files={floorPlans}
        type="floor"
        accept="image/*"
      />

      {/* 💰 FINANCIAL DETAILS */}
      <h2 className="text-lg font-semibold mt-8 mb-4">{t.financialDetails}</h2>
      <div className="grid grid-cols-3 gap-5">
        {/* Currency */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
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
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
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
            <label className="text-sm font-medium text-gray-700 mb-1">
              {t.price}
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>
        )}

        {transactionType === "Lease" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {t.leasePrice}
              </label>
              <input
                type="number"
                value={form.leasePrice}
                onChange={(e) => handleChange("leasePrice", e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {t.contractLength}
              </label>
              <input
                type="text"
                value={form.contractLength}
                onChange={(e) => handleChange("contractLength", e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
          </>
        )}

        {transactionType === "Home stay" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {t.pricePerNight}
              </label>
              <input
                type="number"
                value={form.pricePerNight}
                onChange={(e) => handleChange("pricePerNight", e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {t.checkIn}
              </label>
              <input
                type="text"
                value={form.checkIn}
                onChange={(e) => handleChange("checkIn", e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {t.checkOut}
              </label>
              <input
                type="text"
                value={form.checkOut}
                onChange={(e) => handleChange("checkOut", e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
          </>
        )}

        {/* Deposit Select */}
        <div className="flex flex-col col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.depositPaymentTerms}
          </label>
          <div className="relative">
            <select
              value={form.depositPaymentTerms?.[lang] || ""}
              onChange={(e) =>
                handleLocalizedChange(
                  lang,
                  "depositPaymentTerms",
                  e.target.value
                )
              }
              className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
            >
              <option value="">
                {lang === "en" ? "Select Deposit" : "Chọn khoản đặt cọc"}
              </option>
              {deposits.map((opt) => (
                <option key={opt._id} value={opt.name?.[lang] || ""}>
                  {opt.name?.[lang] || ""}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Payment Terms Select */}
        <div className="flex flex-col col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.maintenanceFeeMonthly}
          </label>
          <div className="relative">
            <select
              value={form.maintenanceFeeMonthly?.[lang] || ""}
              onChange={(e) =>
                handleLocalizedChange(
                  lang,
                  "maintenanceFeeMonthly",
                  e.target.value
                )
              }
              className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
            >
              <option value="">
                {lang === "en"
                  ? "Select Payment Term"
                  : "Chọn điều khoản thanh toán"}
              </option>
              {payments.map((opt) => (
                <option key={opt._id} value={opt.name?.[lang] || ""}>
                  {opt.name?.[lang] || ""}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          ← Previous
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
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
