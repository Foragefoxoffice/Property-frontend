import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function CreatePropertyListStep2({
  onNext,
  onPrev,
  onChange,
  initialData = {},
}) {
  const [lang, setLang] = useState("en");

  const labels = {
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
      pricePerUnit: "Price per unit",
      contractTerms: "Contract Terms",
      depositPaymentTerms: "Deposit / Payment Terms",
      maintenanceFeeMonthly: "Maintenance Fee / Service Charge (Monthly)",
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
      pricePerUnit: "Giá mỗi đơn vị",
      contractTerms: "Điều Khoản Hợp Đồng",
      depositPaymentTerms: "Điều Khoản / Thanh Toán",
      maintenanceFeeMonthly: "Phí Bảo Trì / Dịch Vụ (Hàng Tháng)",
    },
  };

  const t = labels[lang];

  const [form, setForm] = useState({
    currency: initialData.currency || "USD",
    price: initialData.price || "",
    pricePerUnit: initialData.pricePerUnit || "",
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

  // 🔄 Sync with parent on every update
  useEffect(() => {
    onChange &&
      onChange({
        ...form,
        propertyImages: images,
        propertyVideos: videos,
        floorPlans,
      });
  }, [form, images, videos, floorPlans]);

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "image") setImages((prev) => [...prev, { file, url }]);
    if (type === "video") setVideos((prev) => [...prev, { file, url }]);
    if (type === "floor") setFloorPlans((prev) => [...prev, { file, url }]);
  };

  const handleRemove = (type, index) => {
    if (type === "image")
      setImages((prev) => prev.filter((_, i) => i !== index));
    if (type === "video")
      setVideos((prev) => prev.filter((_, i) => i !== index));
    if (type === "floor")
      setFloorPlans((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalizedChange = (lang, field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { en: "", vi: "" }), [lang]: value },
    }));
  };

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

        {/* Upload Box */}
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Language Tabs */}
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

      {/* Financial Details */}
      <h2 className="text-lg font-semibold mt-8 mb-4">{t.financialDetails}</h2>
      <div className="grid grid-cols-3 gap-5">
        {/* Currency */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.currency}
          </label>
          <select
            value={form.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          >
            <option value="USD">USD</option>
            <option value="VND">VND</option>
            <option value="INR">INR</option>
          </select>
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.price}
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* Price per Unit */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.pricePerUnit}
          </label>
          <input
            type="number"
            value={form.pricePerUnit}
            onChange={(e) => handleChange("pricePerUnit", e.target.value)}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* Contract Terms */}
        <div className="flex flex-col col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.contractTerms} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.contractTerms?.[lang]}
            onChange={(e) =>
              handleLocalizedChange(lang, "contractTerms", e.target.value)
            }
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            rows={3}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* Deposit / Payment Terms */}
        <div className="flex flex-col col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.depositPaymentTerms} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.depositPaymentTerms?.[lang]}
            onChange={(e) =>
              handleLocalizedChange(lang, "depositPaymentTerms", e.target.value)
            }
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            rows={3}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* Maintenance Fee */}
        <div className="flex flex-col col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.maintenanceFeeMonthly} (
            {lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.maintenanceFeeMonthly?.[lang]}
            onChange={(e) =>
              handleLocalizedChange(
                lang,
                "maintenanceFeeMonthly",
                e.target.value
              )
            }
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            rows={3}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          ← Previous
        </button>
        <button
          onClick={() => onNext(form)}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
