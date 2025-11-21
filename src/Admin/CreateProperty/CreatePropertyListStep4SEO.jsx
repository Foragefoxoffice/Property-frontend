import React, { useState } from "react";
import { Eye, X, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { Select as AntdSelect } from "antd";

export default function CreatePropertyListStep4SEO({
  onNext,
  onPrev,
  onChange,
  initialData,
}) {
  const labels = {
    metaTitle: { en: "Meta Title", vi: "Tiêu đề Meta" },
    metaDescription: { en: "Meta Description", vi: "Mô tả Meta" },
    metaKeywords: { en: "Meta Keywords", vi: "Từ khóa Meta" },
    slugUrl: { en: "Slug URL", vi: "Đường dẫn Slug" },
    canonicalUrl: { en: "Canonical URL", vi: "Đường dẫn Canonical" },
    schemaType: { en: "Schema Type", vi: "Loại Schema" },
    allowIndexing: {
      en: "Allow search engines to index this page",
      vi: "Cho phép công cụ tìm kiếm lập chỉ mục",
    },
    next: {
      en: "Next",
      vi: "Kế tiếp",
    },
    back: {
      en: "Back",
      vi: "Mặt sau",
    },
    upload: {
      en: "Click here to upload",
      vi: "Bấm vào đây để tải lên",
    },
    social: {
      en: "Social Sharing (Open Graph)",
      vi: "Chia sẻ xã hội (Open Graph)",
    },
    ogTitle: { en: "OG Title", vi: "Tiêu đề OG" },
    ogDescription: { en: "OG Description", vi: "Mô tả OG" },
    ogImages: { en: "OG Images", vi: "Hình ảnh OG" },
  };

  /* ---------------------------------------------
       ✅ SEO DATA MODEL
    --------------------------------------------- */
  const defaultSEO = {
    metaTitle: { en: "", vi: "" },
    metaDescription: { en: "", vi: "" },
    metaKeywords: { en: [], vi: [] },
    slugUrl: { en: "", vi: "" },
    canonicalUrl: { en: "", vi: "" },
    schemaType: { en: "", vi: "" },
    ogTitle: { en: "", vi: "" },
    ogDescription: { en: "", vi: "" },
    allowIndexing: true,
    ogImages: [],
  };

  const [activeLang, setActiveLang] = useState("en");

  const [seo, setSeo] = useState(
    initialData.seoInformation
      ? { ...defaultSEO, ...initialData.seoInformation }
      : defaultSEO
  );

  /* ---------------------------------------------
       ✅ UPDATE HANDLER (multilingual)
    --------------------------------------------- */
  const handleChange = (field, lang, value) => {
    const updated = {
      ...seo,
      [field]: { ...seo[field], [lang]: value },
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
  };

  /* ---------------------------------------------
       ✅ KEYWORDS
    --------------------------------------------- */
  const handleKeywordKeyDown = (e) => {
    if (e.key !== "Enter" || !e.target.value.trim()) return;
    e.preventDefault();
    const keyword = e.target.value.trim();

    const updated = {
      ...seo,
      metaKeywords: {
        ...seo.metaKeywords,
        [activeLang]: [...seo.metaKeywords[activeLang], keyword],
      },
    };

    setSeo(updated);
    onChange({ seoInformation: updated });
    e.target.value = "";
  };

  const removeKeyword = (lang, index) => {
    const updated = {
      ...seo,
      metaKeywords: {
        ...seo.metaKeywords,
        [lang]: seo.metaKeywords[lang].filter((_, i) => i !== index),
      },
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
  };

  /* ---------------------------------------------
       ✅ OG IMAGE UPLOAD + DELETE
    --------------------------------------------- */
  const handleOgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const updated = {
        ...seo,
        ogImages: [...seo.ogImages, reader.result],
      };
      setSeo(updated);
      onChange({ seoInformation: updated });
    };
    reader.readAsDataURL(file);
  };

  const removeOgImage = (index) => {
    const updated = {
      ...seo,
      ogImages: seo.ogImages.filter((_, i) => i !== index),
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
  };

  const [preview, setPreview] = useState(null);

  /* ---------------------------------------------
       ✅ RENDER
    --------------------------------------------- */
  // ✅ INPUT STYLE (Identical to Step-2)
  const inputClass =
    "border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

  const textareaClass =
    "border border-[#B2B2B3] rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
      {/* 🌐 LANGUAGE TABS (Same UI as Step-2) */}
      <div className="flex mb-6 border-b border-gray-200">
        {["en", "vi"].map((lng) => (
          <button
            key={lng}
            onClick={() => setActiveLang(lng)}
            className={`px-6 py-2 text-sm cursor-pointer font-medium ${
              activeLang === lng
                ? "border-b-2 border-[#41398B] text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {lng === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
          </button>
        ))}
      </div>

      {/* ✅ META TITLE */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.metaTitle[activeLang]}
        </label>
        <input
          placeholder="Auto Generated"
          className={inputClass}
          value={seo.metaTitle[activeLang]}
          onChange={(e) =>
            handleChange("metaTitle", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ META DESCRIPTION */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.metaDescription[activeLang]}
        </label>
        <textarea
          placeholder="Type here"
          rows={4}
          className={textareaClass}
          value={seo.metaDescription[activeLang]}
          onChange={(e) =>
            handleChange("metaDescription", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ META KEYWORDS */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.metaKeywords[activeLang]}
        </label>
        <div className="border border-[#B2B2B3] rounded-lg px-3 py-2 flex flex-wrap gap-2">
          {seo.metaKeywords[activeLang].map((kw, i) => (
            <div
              key={i}
              className="bg-[#41398B] px-2 py-1 h-full text-white rounded flex items-center gap-1"
            >
              {kw}
              <button
                className="text-red-500 cursor-pointer font-bold"
                onClick={() => removeKeyword(activeLang, i)}
              >
                <X size={15} />
              </button>
            </div>
          ))}
          <textarea
            placeholder="Type keyword & press Enter"
            onKeyDown={handleKeywordKeyDown}
            className="outline-none flex-grow"
            rows={4}
          />
        </div>
      </div>

      {/* ✅ SLUG */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.slugUrl[activeLang]}
        </label>
        <input
          placeholder="Auto Generated and Edit"
          className={inputClass}
          value={seo.slugUrl[activeLang]}
          onChange={(e) => handleChange("slugUrl", activeLang, e.target.value)}
        />
      </div>

      {/* ✅ CANONICAL */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.canonicalUrl[activeLang]}
        </label>
        <input
          placeholder="Auto Generated and Edit"
          className={inputClass}
          value={seo.canonicalUrl[activeLang]}
          onChange={(e) =>
            handleChange("canonicalUrl", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ SCHEMA TYPE (Antd Select SAME UI as Step-2) */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.schemaType[activeLang]}
        </label>
        <AntdSelect
          showSearch
          allowClear
          placeholder="Select Schema Type"
          value={seo.schemaType[activeLang] || undefined}
          onChange={(value) => handleChange("schemaType", activeLang, value)}
          className="w-full custom-select"
          popupClassName="custom-dropdown"
          options={[
            { label: "Product", value: "Product" },
            { label: "RealEstateAgent", value: "RealEstateAgent" },
            { label: "Residence", value: "Residence" },
            { label: "Apartment", value: "Apartment" },
            { label: "SingleFamilyResidence", value: "SingleFamilyResidence" },
            { label: "House", value: "House" },
            { label: "Hotel", value: "Hotel" },
            { label: "Place", value: "Place" },
            { label: "LocalBusiness", value: "LocalBusiness" },
          ]}
        />
      </div>

      {/* ✅ ALLOW INDEXING */}
      <div className="flex items-center gap-3 mt-2">
        <label className="text-md font-md mb-2 block">
          {labels.allowIndexing[activeLang]}
        </label>
        <input
          type="checkbox"
          checked={seo.allowIndexing}
          onChange={(e) => {
            const updated = { ...seo, allowIndexing: e.target.checked };
            setSeo(updated);
            onChange({ seoInformation: updated });
          }}
        />
      </div>
      <div>
        <h2 className="text-black text-lg font-semibold">
          {labels.social[activeLang]}
        </h2>
      </div>

      {/* ✅ OG TITLE */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogTitle[activeLang]}
        </label>
        <input
          placeholder="Auto Generated"
          className={inputClass}
          value={seo.ogTitle[activeLang]}
          onChange={(e) => handleChange("ogTitle", activeLang, e.target.value)}
        />
      </div>

      {/* ✅ OG DESCRIPTION */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogDescription[activeLang]}
        </label>
        <textarea
          placeholder="Type here"
          rows={4}
          className={textareaClass}
          value={seo.ogDescription[activeLang]}
          onChange={(e) =>
            handleChange("ogDescription", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ ✔ OG IMAGES — EXACT Step-2 Upload UI */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogImages[activeLang]}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          (jpg, jpeg, png, webp, svg)
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* ✅ EXISTING IMAGES */}
          {seo.ogImages.map((img, i) => (
            <div
              key={i}
              className="relative w-70 h-60 rounded-xl overflow-hidden border bg-gray-50 group"
            >
              <img src={img} className="w-full h-full object-cover" />

              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
              transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100"
              >
                <button
                  onClick={() => setPreview(img)}
                  className="bg-white cursor-pointer rounded-full p-2 shadow"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeOgImage(i)}
                  className="bg-white cursor-pointer rounded-full p-2 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* ✅ UPLOAD BOX */}
          <label
            className="w-70 h-60 border border-dashed border-[#646466] rounded-xl 
            flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50"
          >
            <div className="w-18 h-18 border border-dashed border-[#646466] rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-500" />
            </div>
            <span className="text-xs mt-2 text-[#646466]">
              {labels.upload[activeLang]}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleOgUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ✅ POPUP PREVIEW (Matches Step-2) */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        >
          <div
            className="relative max-w-md w-full rounded-xl overflow-hidden bg-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={preview}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ✅ FOOTER BUTTONS */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white cursor-pointer border border-gray-300 rounded-full hover:bg-gray-50 flex gap-2 items-center"
        >
          <ArrowLeft size={18} /> {labels.back[activeLang]}
        </button>

       <button
  onClick={() => {
    onChange({ seoInformation: seo });  // keep SEO data
    onNext();  // go to preview
  }}
  className="px-6 py-2 bg-[#41398B] cursor-pointer hover:bg-[#322e7e] text-white rounded-full flex items-center gap-2"
>
  {labels.next[activeLang]} <ArrowRight size={18} />
</button>

      </div>
    </div>
  );
}
