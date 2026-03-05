import React, { useState, useEffect } from "react";
import { Eye, X, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { Select as AntdSelect, Switch } from "antd";
import SeoPanel from "../../components/Admin/SeoPanel";
import { uploadPropertyMedia } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { usePermissions } from "../../Context/PermissionContext";

const KeywordTagsInput = ({ value = [], onChange, placeholder, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newKeyword = e.target.value.trim();
      const currentKeywords = Array.isArray(value) ? value : [];
      onChange([...currentKeywords, newKeyword]);
      setInputValue('');
    }
  };

  const removeKeyword = (index) => {
    const currentKeywords = Array.isArray(value) ? value : [];
    const newKeywords = currentKeywords.filter((_, i) => i !== index);
    onChange(newKeywords);
  };

  return (
    <div className="border border-[#B2B2B3] rounded-lg px-3 py-2 min-h-[100px] bg-white">
      <div className="flex flex-wrap gap-2 mb-2">
        {(Array.isArray(value) ? value : []).map((kw, i) => (
          <div
            key={i}
            className="bg-[#41398B] px-3 py-1 text-white rounded-md flex items-center gap-2"
          >
            <span className="text-sm">{kw}</span>
            <button
              type="button"
              className="text-red-300 hover:text-red-100 font-bold"
              onClick={() => removeKeyword(i)}
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="outline-none w-full text-[15px] font-['Manrope']"
        disabled={disabled}
      />
    </div>
  );
};

export default function CreatePropertyListStep4SEO({
  onNext,
  onPrev,
  onChange,
  onComplete,
  initialData,
  isSubmitting,
}) {
  const { language: globalLanguage } = useLanguage();
  const { isApprover } = usePermissions();

  const handleComplete = async () => {
    const finalStatus = isApprover ? "Published" : "Pending";

    // ✅ SYNC LANGUAGES BEFORE SAVING
    const syncFields = ["metaTitle", "metaDescription", "ogTitle", "ogDescription", "slugUrl", "canonicalUrl", "schemaType"];
    const updatedSeo = { ...seo };
    syncFields.forEach(f => {
      if (updatedSeo[f] && typeof updatedSeo[f] === "object") {
        if (!updatedSeo[f].vi || updatedSeo[f].vi.trim() === "") updatedSeo[f].vi = updatedSeo[f].en || "";
        if (!updatedSeo[f].en || updatedSeo[f].en.trim() === "") updatedSeo[f].en = updatedSeo[f].vi || "";
      }
    });

    onChange({ seoInformation: updatedSeo });
    await onComplete(finalStatus);
  };

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
      vi: "Trở lại",
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
    ogImage: { en: "OG Image", vi: "Hình ảnh OG" },
    uploading: {
      en: "Uploading OG image...",
      vi: "Đang tải lên hình ảnh OG...",
    },
    uploadSuccess: {
      en: "OG Image uploaded successfully!",
      vi: "Hình ảnh OG đã được tải lên thành công!",
    },
    uploadError: {
      en: "Failed to upload OG Image",
      vi: "Không tải được hình ảnh OG",
    }
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
    ogImage: "", // Changed from ogImages: []
  };

  const [activeLang, setActiveLang] = useState("vi");
  const [seoAnalysis, setSeoAnalysis] = useState({ checks: {}, score: 0 });

  const [seo, setSeo] = useState(() => {
    const data = initialData.seoInformation || defaultSEO;
    return {
      ...defaultSEO,
      ...data,
      ogImage: data.ogImage || (data.ogImages && data.ogImages[0]) || "",
    };
  });

  const seoData = {
    focusKeyword: Array.isArray(seo.metaKeywords?.[activeLang]) && seo.metaKeywords[activeLang].length > 0 ? seo.metaKeywords[activeLang][0] : "",
    title: seo.metaTitle?.[activeLang] || "",
    description: seo.metaDescription?.[activeLang] || "",
    slug: seo.slugUrl?.[activeLang] || "",
    canonicalUrl: seo.canonicalUrl?.[activeLang] || "",
    schemaType: seo.schemaType?.[activeLang] || "",
    ogImage: seo.ogImage || "",
    noIndex: seo.allowIndexing === false,
  };

  /* ✅ Sync with initialData when it changes (Edit Mode) */
  React.useEffect(() => {
    if (initialData?.seoInformation) {
      setSeo((prev) => {
        const propVal = initialData.seoInformation;
        const newUpdates = {};

        const localized = ["metaTitle", "metaDescription", "slugUrl", "canonicalUrl", "schemaType", "ogTitle", "ogDescription"];
        localized.forEach(f => {
          if (propVal[f] && JSON.stringify(propVal[f]) !== JSON.stringify(prev[f])) {
            newUpdates[f] = propVal[f];
          }
        });

        // Keywords (arrays)
        if (propVal.metaKeywords && JSON.stringify(propVal.metaKeywords) !== JSON.stringify(prev.metaKeywords)) {
          newUpdates.metaKeywords = propVal.metaKeywords;
        }

        // Booleans
        if (propVal.allowIndexing !== undefined && propVal.allowIndexing !== prev.allowIndexing) {
          newUpdates.allowIndexing = propVal.allowIndexing;
        }

        // Image
        const propOgImage = propVal.ogImage || (propVal.ogImages && propVal.ogImages[0]) || "";
        if (propOgImage && propOgImage !== prev.ogImage) {
          newUpdates.ogImage = propOgImage;
        }

        if (Object.keys(newUpdates).length > 0) {
          return { ...prev, ...newUpdates };
        }
        return prev;
      });
    }
  }, [initialData]);

  /* ✅ Sync Slug with Title (Auto-fill) */
  useEffect(() => {
    // Check title from propertyData (passed as initialData)
    const titleObj = initialData?.title;
    if (!titleObj) return;

    const titleToSlug = titleObj.en || titleObj.vi;
    if (!titleToSlug) return;

    // Robust slug generator with Vietnamese support
    const generateSlug = (text) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .normalize('NFD') // decompose combined characters (accents)
        .replace(/[\u0300-\u036f]/g, '') // remove accent marks
        .replace(/đ/g, 'd')
        .replace(/ơ/g, 'o')
        .replace(/ư/g, 'u')
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-') // spaces to dashes
        .replace(/-+/g, '-'); // collapse multiple dashes
    };

    const slug = generateSlug(titleToSlug);

    // Always update if it differs, because it's not user-editable anymore
    if (seo.slugUrl?.en !== slug) {
      const updated = {
        ...seo,
        slugUrl: { en: slug, vi: slug },
        // Also auto-fill meta title if empty
        metaTitle: {
          en: seo.metaTitle.en || titleObj.en || titleToSlug,
          vi: seo.metaTitle.vi || titleObj.vi || titleToSlug
        }
      };
      setSeo(updated);
      onChange({ seoInformation: updated });
    }
  }, [initialData?.title]);

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
       ✅ AUTO GENERATE SEO CONTENT
    --------------------------------------------- */
  const buildSeoContent = (lang) => {
    // Get localized string value safely
    const g = (obj) => (obj?.[lang] || obj?.en || obj?.vi || "").trim();

    // Strip ALL HTML tags, entities (&nbsp; &amp; etc.), emojis, and collapse whitespace
    const cleanText = (html = "") => {
      if (!html) return "";
      let t = html;
      // Decode common HTML entities
      t = t.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
           .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
           .replace(/&quot;/gi, '"').replace(/&#[0-9]+;/gi, " ")
           .replace(/&[a-z]+;/gi, " ");
      // Strip HTML tags
      t = t.replace(/<[^>]*>/gm, " ");
      // Strip emojis (Unicode emoji ranges)
      t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
      // Collapse whitespace
      t = t.replace(/\s+/g, " ").trim();
      return t;
    };

    // Clamp to max chars without cutting a word mid-way
    const clamp = (str, max) =>
      str.length <= max ? str : str.slice(0, max).replace(/\s\S*$/, "").trim();

    const hasKw = (str, kw) =>
      kw ? str.toLowerCase().includes(kw.toLowerCase()) : true;

    // ── Pull structured property fields ──────────────────────
    const propertyType = g(initialData?.propertyType);
    const project      = g(initialData?.projectName);
    const zone         = g(initialData?.zoneName);
    const block        = g(initialData?.blockName);
    const furnishing   = g(initialData?.furnishing);
    const view         = g(initialData?.view);
    const txType       = g(initialData?.transactionType);
    const beds         = initialData?.bedrooms   ? Number(initialData.bedrooms)   : null;
    const baths        = initialData?.bathrooms  ? Number(initialData.bathrooms)  : null;
    const size         = initialData?.unitSize   ? Number(initialData.unitSize)   : null;
    const currencyCode = initialData?.currency?.code   || "";
    const currencySym  = initialData?.currency?.symbol || "";
    const price        = initialData?.price      ? Number(initialData.price)      : null;

    // ── KEYWORDS ─────────────────────────────────────────────
    // Only use clean, predictable values — no raw description text
    const keywords = [
      propertyType,
      project,
      zone,
      beds  ? (lang === "vi" ? `${beds} phòng ngủ`  : `${beds} bedroom`)  : "",
      baths ? (lang === "vi" ? `${baths} phòng tắm` : `${baths} bathroom`) : "",
      furnishing,
      txType,
      view,
    ].filter(Boolean)
     .map(k => cleanText(k))
     .filter(Boolean)
     .filter((v, i, a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i)
     .slice(0, 8);

    // Focus keyword = first keyword in the list
    const focusKw = keywords[0] || propertyType || "";

    // ── META TITLE (30–60 chars) ──────────────────────────────
    let metaTitle = "";
    if (lang === "vi") {
      // Pattern: "{X} phòng ngủ {propertyType} tại {project}, {zone}"
      const parts = [
        beds ? `${beds} phòng ngủ` : "",
        propertyType,
        project ? `tại ${project}` : zone ? `tại ${zone}` : "",
        block   ? `toà ${block}`   : "",
      ].filter(Boolean);
      metaTitle = parts.join(" ");
    } else {
      // Pattern: "{beds}BR {baths}BA {propertyType} for {txType} in {project}"
      const parts = [
        beds  ? `${beds}BR`  : "",
        baths ? `${baths}BA` : "",
        propertyType || "Property",
        txType ? `for ${txType}` : "",
        project ? `in ${project}` : zone ? `in ${zone}` : "",
      ].filter(Boolean);
      metaTitle = parts.join(" ");
    }

    // Ensure focus keyword is embedded
    if (focusKw && !hasKw(metaTitle, focusKw)) {
      metaTitle = `${focusKw} ${metaTitle}`;
    }

    metaTitle = clamp(cleanText(metaTitle), 60);

    // If still under 30, add zone/block for context
    if (metaTitle.length < 30) {
      const extra = lang === "vi"
        ? (zone ? `, ${zone}` : block ? `, toà ${block}` : "")
        : (zone ? `, ${zone}` : block ? `, Block ${block}` : "");
      metaTitle = clamp(cleanText(`${metaTitle}${extra}`), 60);
    }

    // ── META DESCRIPTION (120–160 chars) ─────────────────────
    // Build from structured fields only — never from raw description
    let metaDesc = "";
    if (lang === "vi") {
      const parts = [
        beds && baths
          ? `Căn hộ ${beds} phòng ngủ, ${baths} phòng tắm`
          : beds ? `Căn hộ ${beds} phòng ngủ` : "",
        size         ? `diện tích ${size} m²`              : "",
        furnishing   ? `nội thất ${furnishing}`             : "",
        project      ? `tại ${project}`                     : zone ? `tại ${zone}` : "",
        block        ? `toà ${block}`                       : "",
        view         ? `view ${view}`                       : "",
        txType       ? `hình thức ${txType}`                : "",
        price && currencySym ? `giá ${currencySym}${price.toLocaleString()}` : "",
      ].filter(Boolean);
      metaDesc = parts.join(", ") + ". Liên hệ ngay để xem nhà và nhận tư vấn miễn phí.";
    } else {
      const parts = [
        beds && baths
          ? `${beds}-bedroom, ${baths}-bathroom ${propertyType || "property"}`
          : beds ? `${beds}-bedroom ${propertyType || "property"}` : propertyType || "property",
        furnishing   ? `(${furnishing})`                    : "",
        size         ? `${size} sqm`                        : "",
        project      ? `in ${project}`                      : zone ? `in ${zone}` : "",
        block        ? `Block ${block}`                     : "",
        view         ? `with ${view} view`                  : "",
        txType       ? `available for ${txType}`            : "",
        price && currencySym ? `priced at ${currencySym}${price.toLocaleString()} ${currencyCode}`.trim() : "",
      ].filter(Boolean);
      metaDesc = parts.join(", ") + ". Contact us today to schedule a viewing.";
    }

    // Ensure focus keyword is in description
    if (focusKw && !hasKw(metaDesc, focusKw)) {
      metaDesc = `${focusKw} — ${metaDesc}`;
    }

    metaDesc = cleanText(metaDesc);
    metaDesc = clamp(metaDesc, 160);

    // Pad to 120 if still short (add a safe filler sentence)
    if (metaDesc.length < 120) {
      const filler = lang === "vi"
        ? " Không gian sống lý tưởng, tiện nghi đầy đủ, vị trí đắc địa."
        : " Prime location with modern amenities and excellent connectivity.";
      metaDesc = clamp(`${metaDesc}${filler}`, 160);
    }

    // ── OG TITLE (40–60 chars) ────────────────────────────────
    let ogTitle = metaTitle;
    if (ogTitle.length < 40) {
      const suffix = lang === "vi"
        ? (project ? ` – ${project}` : zone ? ` – ${zone}` : "")
        : (project ? ` | ${project}` : zone ? ` | ${zone}` : "");
      ogTitle = clamp(`${ogTitle}${suffix}`, 60);
    }

    // ── OG DESCRIPTION (130–200 chars) ───────────────────────
    // Slightly longer than meta description, re-use same base
    let ogDesc = metaDesc;
    if (ogDesc.length < 130) {
      const extra = lang === "vi"
        ? " Đặt lịch tham quan ngay hôm nay!"
        : " Schedule your viewing today and discover your perfect home!";
      ogDesc = clamp(`${ogDesc}${extra}`, 200);
    }

    return { metaTitle, metaDesc, keywords, ogTitle, ogDesc };
  };

  const handleAutoGenerate = (field) => {
    const content = buildSeoContent(activeLang);
    const fieldMap = {
      metaTitle:       { key: "metaTitle",       val: content.metaTitle  },
      metaDescription: { key: "metaDescription", val: content.metaDesc   },
      metaKeywords:    { key: "metaKeywords",     val: content.keywords   },
      ogTitle:         { key: "ogTitle",          val: content.ogTitle    },
      ogDescription:   { key: "ogDescription",    val: content.ogDesc     },
    };
    if (!fieldMap[field]) return;
    const { key, val } = fieldMap[field];
    const updated = { ...seo, [key]: { ...seo[key], [activeLang]: val } };
    setSeo(updated);
    onChange({ seoInformation: updated });
    CommonToaster(activeLang === "vi" ? "Đã tạo tự động!" : "Auto-generated!", "success");
  };

  const handleAutoGenerateAll = () => {
    const content = buildSeoContent(activeLang);
    const updated = {
      ...seo,
      metaTitle:       { ...seo.metaTitle,       [activeLang]: content.metaTitle  },
      metaDescription: { ...seo.metaDescription, [activeLang]: content.metaDesc   },
      metaKeywords:    { ...seo.metaKeywords,     [activeLang]: content.keywords   },
      ogTitle:         { ...seo.ogTitle,          [activeLang]: content.ogTitle    },
      ogDescription:   { ...seo.ogDescription,    [activeLang]: content.ogDesc     },
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
    CommonToaster(activeLang === "vi" ? "Đã tạo tất cả tự động!" : "All fields auto-generated!", "success");
  };

  /* ---------------------------------------------
       ✅ OG IMAGE UPLOAD + DELETE
    --------------------------------------------- */
  const handleOgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      CommonToaster(labels.uploading[globalLanguage], "info");
      const response = await uploadPropertyMedia(file, "image");
      const url = response.data.url;

      const updated = {
        ...seo,
        ogImage: url,
      };
      setSeo(updated);
      onChange({ seoInformation: updated });
      CommonToaster(labels.uploadSuccess[globalLanguage], "success");
    } catch (error) {
      console.error("OG Image upload error:", error);
      CommonToaster(labels.uploadError[globalLanguage], "error");
    }

    // Reset input
    e.target.value = '';
  };

  const removeOgImage = () => {
    const updated = {
      ...seo,
      ogImage: "",
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
  };

  const [preview, setPreview] = useState(null);

  // Helper to render inline suggestion
  const renderSuggestion = (checkKey) => {
    const check = seoAnalysis?.checks?.[checkKey];
    if (check && !check.passed && check.suggestion) {
      return (
        <div style={{ color: '#f97316', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <span>💡</span>
          <span>{check.suggestion}</span>
        </div>
      );
    }
    return null;
  };

  // Real-time character count indicator with progress bar
  const CharCountIndicator = ({ value = "", min, max, label }) => {
    const len = (value || "").trim().length;
    const isBelow = len < min;
    const isAbove = len > max;
    const isOptimal = !isBelow && !isAbove;

    const color = isOptimal ? "#22c55e" : isAbove ? "#ef4444" : len > 0 ? "#f97316" : "#9ca3af";
    const pct = Math.min((len / max) * 100, 100);
    const optimalStart = (min / max) * 100;

    const statusText = isOptimal
      ? `✓ Good length`
      : isAbove
      ? `Too long — shorten by ${len - max} chars`
      : len > 0
      ? `${min - len} more chars to reach minimum`
      : `Add ${label}`;

    return (
      <div style={{ marginTop: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color }}>{statusText}</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color }}>
            {len} / {max} <span style={{ color: "#9ca3af", fontWeight: "normal" }}>({min}–{max} recommended)</span>
          </span>
        </div>
        <div style={{ height: "4px", borderRadius: "2px", background: "#e5e7eb", position: "relative", overflow: "hidden" }}>
          {/* Optimal zone highlight */}
          <div
            style={{
              position: "absolute",
              left: `${optimalStart}%`,
              width: `${100 - optimalStart}%`,
              height: "100%",
              background: "#d1fae5",
              borderRadius: "2px",
            }}
          />
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              width: `${pct}%`,
              height: "100%",
              background: color,
              borderRadius: "2px",
              transition: "width 0.15s ease, background 0.15s ease",
            }}
          />
        </div>
      </div>
    );
  };

  /* ---------------------------------------------
       ✅ RENDER
    --------------------------------------------- */
  const inputClass =
    "border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

  const textareaClass =
    "border border-[#B2B2B3] rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
      {/* 🌐 LANGUAGE TABS (Same UI as Step-2) */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200">
        <div className="flex">
          {["vi", "en"].map((lng) => (
            <button
              key={lng}
              onClick={() => setActiveLang(lng)}
              className={`px-6 py-2 text-sm cursor-pointer font-medium ${activeLang === lng
                ? "border-b-2 border-[#41398B] text-black"
                : "text-gray-500 hover:text-black"
                }`}
            >
              {lng === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
            </button>
          ))}
        </div>

        {/* Complete & Save Button */}
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className={`bg-[#41398B] mt-[-20px] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#322c6d] transition shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {activeLang === "en" ? "Saving..." : "Đang lưu..."}
            </span>
          ) : (
            activeLang === "en" ? "Complete & Save" : "Hoàn tất & Lưu"
          )}
        </button>
      </div>

      {/* ✅ NEW SEO TOOL PANEL */}
      <SeoPanel
        seoData={seoData}
        htmlContent={initialData.description?.en || ""}
        images={initialData.propertyImages || []}
        onAnalysisUpdate={setSeoAnalysis}
      />

      {/* ✨ AUTO GENERATE ALL BANNER */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(135deg, #f0effe 0%, #e8f5e9 100%)",
        border: "1px solid #c4b5fd", borderRadius: "10px", padding: "12px 16px",
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#3730a3" }}>
            ✨ {activeLang === "vi" ? "Tự động tạo nội dung SEO" : "Auto Generate SEO Content"}
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
            {activeLang === "vi"
              ? "Tạo tiêu đề, mô tả, từ khóa từ dữ liệu bất động sản"
              : "Generate title, description & keywords from property data"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoGenerateAll}
          style={{
            background: "#41398B", color: "#fff", border: "none", borderRadius: "8px",
            padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {activeLang === "vi" ? "✨ Tạo tất cả" : "✨ Generate All"}
        </button>
      </div>

      {/* ✅ SHARED SLUG URL (Non-editable, auto-synced) */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          Slug URL (Shared / Dùng chung) <span className="font-normal text-gray-500 text-xs ml-2">(Auto-generated from Title - Non-editable)</span>
        </label>
        <div>
          <input
            placeholder="my-property-slug"
            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
            value={seo.slugUrl?.en || ""}
            readOnly
          />
          {renderSuggestion('keywordInSlug')}
        </div>
      </div>

      {/* ✅ META TITLE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">{labels.metaTitle[activeLang]}</label>
          <button type="button" onClick={() => handleAutoGenerate("metaTitle")}
            style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
            ✨ {activeLang === "vi" ? "Tự động tạo" : "Generate"}
          </button>
        </div>
        <div>
          <input
            key={`${activeLang}-metaTitle`}
            placeholder="Type Here"
            className={inputClass}
            value={seo.metaTitle[activeLang]}
            onChange={(e) =>
              handleChange("metaTitle", activeLang, e.target.value)
            }
          />
          <CharCountIndicator value={seo.metaTitle[activeLang]} min={30} max={60} label="Meta Title" />
          {renderSuggestion('keywordInTitle')}
        </div>
      </div>

      {/* ✅ META DESCRIPTION */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">{labels.metaDescription[activeLang]}</label>
          <button type="button" onClick={() => handleAutoGenerate("metaDescription")}
            style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
            ✨ {activeLang === "vi" ? "Tự động tạo" : "Generate"}
          </button>
        </div>
        <div>
          <textarea
            key={`${activeLang}-metaDescription`}
            placeholder="Type here"
            rows={4}
            className={textareaClass}
            value={seo.metaDescription[activeLang]}
            onChange={(e) =>
              handleChange("metaDescription", activeLang, e.target.value)
            }
          />
          <CharCountIndicator value={seo.metaDescription[activeLang]} min={120} max={160} label="Meta Description" />
          {renderSuggestion('keywordInDescription')}
        </div>
      </div>

      {/* ✅ META KEYWORDS (Using New Component) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">{labels.metaKeywords[activeLang]}</label>
          <button type="button" onClick={() => handleAutoGenerate("metaKeywords")}
            style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
            ✨ {activeLang === "vi" ? "Tự động tạo" : "Generate"}
          </button>
        </div>
        <div>
          <KeywordTagsInput
            key={`${activeLang}-keywords`}
            value={seo.metaKeywords[activeLang]}
            onChange={(newKeywords) => handleChange("metaKeywords", activeLang, newKeywords)}
            placeholder="Type keyword & press Enter"
          />
          {renderSuggestion('keywordInContent')}
        </div>
      </div>

      {/* ✅ CANONICAL */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.canonicalUrl[activeLang]}
        </label>
        <input
          placeholder="Type Here and Edit"
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
        <Switch
          checked={seo.allowIndexing}
          onChange={(checked) => {
            const updated = { ...seo, allowIndexing: checked };
            setSeo(updated);
            onChange({ seoInformation: updated });
          }}
          style={{
            backgroundColor: seo.allowIndexing ? "#41398B" : "#d9d9d9",
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
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">{labels.ogTitle[activeLang]}</label>
          <button type="button" onClick={() => handleAutoGenerate("ogTitle")}
            style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
            ✨ {activeLang === "vi" ? "Tự động tạo" : "Generate"}
          </button>
        </div>
        <input
          placeholder="Type Here"
          className={inputClass}
          value={seo.ogTitle[activeLang]}
          onChange={(e) => handleChange("ogTitle", activeLang, e.target.value)}
        />
        <CharCountIndicator value={seo.ogTitle[activeLang]} min={40} max={60} label="OG Title" />
      </div>

      {/* ✅ OG DESCRIPTION */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">{labels.ogDescription[activeLang]}</label>
          <button type="button" onClick={() => handleAutoGenerate("ogDescription")}
            style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
            ✨ {activeLang === "vi" ? "Tự động tạo" : "Generate"}
          </button>
        </div>
        <textarea
          placeholder="Type here"
          rows={4}
          className={textareaClass}
          value={seo.ogDescription[activeLang]}
          onChange={(e) =>
            handleChange("ogDescription", activeLang, e.target.value)
          }
        />
        <CharCountIndicator value={seo.ogDescription[activeLang]} min={130} max={200} label="OG Description" />
      </div>

      {/* ✅ ✔ OG IMAGE — Single Slot UI */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogImage[activeLang]}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          (jpg, jpeg, png, webp, svg)
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* ✅ EXISTING IMAGE */}
          {seo.ogImage ? (
            <div
              className="relative w-70 h-60 rounded-xl overflow-hidden border bg-gray-50 group"
            >
              <img src={seo.ogImage} className="w-full h-full object-cover" />

              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
              transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100"
              >
                <button
                  onClick={() => setPreview(seo.ogImage)}
                  className="bg-white cursor-pointer rounded-full p-2 shadow"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={removeOgImage}
                  className="bg-white cursor-pointer rounded-full p-2 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ✅ UPLOAD BOX (Only shown if NO image) */
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
          )}
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
          className="px-6 py-2 bg-white cursor-pointer border border-gray-300 rounded-lg hover:bg-gray-50 flex gap-2 items-center"
        >
          <ArrowLeft size={18} /> {labels.back[activeLang]}
        </button>

        <button
          onClick={() => {
            onChange({ seoInformation: seo });  // keep SEO data
            onNext();  // go to preview
          }}
          className="px-6 py-2 bg-[#41398B] cursor-pointer hover:bg-[#322e7e] text-white rounded-lg flex items-center gap-2"
        >
          {labels.next[activeLang]} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
