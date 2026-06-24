import React, { useState, useEffect } from 'react';
import { Eye, X, Plus } from 'lucide-react';
import { Select as AntdSelect, Switch, Button, Form } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { uploadGeneralImage } from '../../Api/action';
import { usePermissions } from '../../Context/PermissionContext';
import SeoPanel from '../../components/Admin/SeoPanel';
import { CommonToaster } from '@/Common/CommonToaster';
import { buildCmsContent } from '../../components/Admin/CmsSeoUtils';
import { generateSlug } from '../../utils/generateSlug';

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
                className="outline-none w-full text-[15px] font-['Manrope'] bg-transparent"
                disabled={disabled}
            />
        </div>
    );
};

const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://api.183housingsolutions.com';
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ProjectSeoForm({
    form, // Used for compatibility, ignored structurally
    onSubmit,
    loading,
    pageData,
    isOpen,
    onToggle,
    headerLang,
    isProjectPage = false,
    generalForm
}) {
    const { can } = usePermissions();
    const [activeLang, setActiveLang] = useState('vn');
    const [seoAnalysis, setSeoAnalysis] = useState({ checks: {}, score: 0 });
    const [isOgUploading, setIsOgUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    const defaultSEO = {
        metaTitle: { en: "", vn: "" },
        metaDescription: { en: "", vn: "" },
        metaKeywords: { en: [], vn: [] },
        slugUrl: { en: "", vn: "" },
        canonicalUrl: { en: "", vn: "" },
        schemaType: { en: "", vn: "" },
        ogTitle: { en: "", vn: "" },
        ogDescription: { en: "", vn: "" },
        allowIndexing: true,
        ogImage: "",
    };

    const [seo, setSeo] = useState(defaultSEO);

    useEffect(() => {
        if (headerLang) {
            setActiveLang(headerLang === 'en' ? 'en' : 'vn');
        }
    }, [headerLang]);

    // Sync from pageData
    useEffect(() => {
        if (pageData) {
            setSeo({
                metaTitle: { en: pageData.projectSeoMetaTitle_en || "", vn: pageData.projectSeoMetaTitle_vn || "" },
                metaDescription: { en: pageData.projectSeoMetaDescription_en || "", vn: pageData.projectSeoMetaDescription_vn || "" },
                metaKeywords: { en: pageData.projectSeoMetaKeywords_en || [], vn: pageData.projectSeoMetaKeywords_vn || [] },
                slugUrl: { en: pageData.projectSeoSlugUrl_en || "", vn: pageData.projectSeoSlugUrl_vn || "" },
                canonicalUrl: { en: pageData.projectSeoCanonicalUrl_en || "", vn: pageData.projectSeoCanonicalUrl_vn || "" },
                schemaType: { en: pageData.projectSeoSchemaType_en || "", vn: pageData.projectSeoSchemaType_vn || "" },
                ogTitle: { en: pageData.projectSeoOgTitle_en || "", vn: pageData.projectSeoOgTitle_vn || "" },
                ogDescription: { en: pageData.projectSeoOgDescription_en || "", vn: pageData.projectSeoOgDescription_vn || "" },
                allowIndexing: pageData.projectSeoAllowIndexing !== false,
                ogImage: pageData.projectSeoOgImage || "",
            });
        }
    }, [pageData]);

    const watchedTitle = Form.useWatch('title', generalForm);
    const currentTitle = generalForm ? watchedTitle : pageData?.title;

    /* ✅ Sync Slug with Title (Auto-fill) for individual projects */
    useEffect(() => {
        if (!isProjectPage && currentTitle) {
            let slugEn = currentTitle.en ? generateSlug(currentTitle.en) : "";
            let slugVn = currentTitle.vi ? generateSlug(currentTitle.vi) : "";

            if (!slugEn && slugVn) slugEn = slugVn;
            if (!slugVn && slugEn) slugVn = slugEn;

            setSeo(prev => {
                if (prev.slugUrl.en !== slugEn || prev.slugUrl.vn !== slugVn) {
                    return {
                        ...prev,
                        slugUrl: { en: slugEn || prev.slugUrl.en, vn: slugVn || prev.slugUrl.vn }
                    };
                }
                return prev;
            });
        }
    }, [currentTitle, isProjectPage]);

    const handleChange = (field, lang, value) => {
        setSeo(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value }
        }));
    };

    const buildProjectSeoContent = (lang) => {
        if (isProjectPage) {
            return buildCmsContent(lang, 'projectPage');
        }

        const g = (obj) => (obj?.[lang] || obj?.en || obj?.vi || "").trim();

        const cleanText = (html = "") => {
            if (!html) return "";
            let t = html;
            t = t.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#[0-9]+;/gi, " ").replace(/&[a-z]+;/gi, " ");
            t = t.replace(/<[^>]*>/gm, " ");
            t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
            t = t.replace(/\s+/g, " ").trim();
            return t;
        };

        const clamp = (str, max) => str.length <= max ? str : str.slice(0, max).replace(/\s\S*$/, "").trim();
        const hasKw = (str, kw) => kw ? str.toLowerCase().includes(kw.toLowerCase()) : true;

        const title = g(pageData?.title);
        const categoryName = pageData?.category?.name ? g(pageData.category.name) : "Project";
        const locationTitle = g(pageData?.projectLocationTitle);

        const keywords = [categoryName, title, "183 Housing Solutions", "Vietnam Real Estate"]
            .map(k => cleanText(k)).filter(Boolean)
            .filter((v, i, a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i).slice(0, 5);

        const focusKw = keywords[0] || categoryName || title || "";

        let metaTitle = "";
        if (lang === "vn" || lang === "vi") {
            metaTitle = `${title} - ${categoryName} tại 183 Housing Solutions`;
        } else {
            metaTitle = `${title} - ${categoryName} | 183 Housing Solutions`;
        }

        if (focusKw && !hasKw(metaTitle, focusKw)) {
            metaTitle = `${focusKw} ${metaTitle}`;
        }
        metaTitle = clamp(cleanText(metaTitle), 60);

        let metaDesc = "";
        const introTitle = g(pageData?.projectIntroTitle);

        if (lang === "vn" || lang === "vi") {
            const parts = [
                `Khám phá dự án ${title}`,
                categoryName ? `thuộc loại hình ${categoryName}` : "",
                locationTitle ? `vị trí ${locationTitle}` : "",
            ].filter(Boolean);
            metaDesc = parts.join(", ") + ". " + (introTitle || "Liên hệ ngay để nhận thông tin chi tiết và tư vấn miễn phí.");
        } else {
            const parts = [
                `Discover ${title}`,
                categoryName ? `a premium ${categoryName}` : "",
                locationTitle ? `located in ${locationTitle}` : "",
            ].filter(Boolean);
            metaDesc = parts.join(", ") + ". " + (introTitle || "Contact us today for detailed information and free consultation.");
        }

        if (focusKw && !hasKw(metaDesc, focusKw)) {
            metaDesc = `${focusKw} — ${metaDesc}`;
        }
        metaDesc = clamp(cleanText(metaDesc), 160);

        if (metaDesc.length < 120) {
            const filler = (lang === "vn" || lang === "vi")
                ? " Không gian sống lý tưởng, tiện ích đẳng cấp, vị trí đắc địa và cơ hội đầu tư sinh lời cao."
                : " Premium living space, world-class amenities, prime location, and excellent investment opportunity.";
            metaDesc = clamp(`${metaDesc}${filler}`, 160);
        }

        let ogTitle = metaTitle;
        let ogDesc = metaDesc;

        return { metaTitle, metaDesc, keywords, ogTitle, ogDesc };
    };

    const handleAutoGenerate = (field) => {
        const content = buildProjectSeoContent(activeLang);
        const fieldMap = {
            metaTitle: { key: "metaTitle", val: content.metaTitle },
            metaDescription: { key: "metaDescription", val: content.metaDesc },
            metaKeywords: { key: "metaKeywords", val: content.keywords },
            ogTitle: { key: "ogTitle", val: content.ogTitle },
            ogDescription: { key: "ogDescription", val: content.ogDesc },
        };

        if (fieldMap[field]) {
            handleChange(fieldMap[field].key, activeLang, fieldMap[field].val);
            CommonToaster(activeLang === "vn" ? "Đã tạo tự động!" : "Auto-generated!", "success");
        }
    };

    const handleAutoGenerateAll = () => {
        const content = buildProjectSeoContent(activeLang);
        setSeo(prev => ({
            ...prev,
            metaTitle: { ...prev.metaTitle, [activeLang]: content.metaTitle },
            metaDescription: { ...prev.metaDescription, [activeLang]: content.metaDesc },
            metaKeywords: { ...prev.metaKeywords, [activeLang]: content.keywords },
            ogTitle: { ...prev.ogTitle, [activeLang]: content.ogTitle },
            ogDescription: { ...prev.ogDescription, [activeLang]: content.ogDesc },
        }));
        CommonToaster(activeLang === "vn" ? "Đã tạo tất cả tự động!" : "All fields auto-generated!", "success");
    };

    const handleOgUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsOgUploading(true);
            CommonToaster(activeLang === "vn" ? "Đang tải lên..." : "Uploading...", "info");
            const response = await uploadGeneralImage(file);
            if (response.data.success || response.data._id) {
                const rawUrl = response.data.fileUrl || response.data.data?.url || response.data.url;
                if (rawUrl) {
                    const url = getAbsoluteUrl(rawUrl);
                    setSeo(prev => ({ ...prev, ogImage: url }));
                    CommonToaster(activeLang === "vn" ? "Hình ảnh đã tải lên!" : "Image uploaded!", "success");
                }
            }
        } catch (error) {
            console.error("OG Image upload error:", error);
            CommonToaster(activeLang === "vn" ? "Lỗi tải lên" : "Upload error", "error");
        } finally {
            setIsOgUploading(false);
        }
        e.target.value = '';
    };

    const removeOgImage = () => {
        setSeo(prev => ({ ...prev, ogImage: "" }));
    };

    const handleComplete = () => {
        const dynamicCanonicalUrlEn = `https://183housingsolutions.com/project${seo.slugUrl?.en !== '/' ? (seo.slugUrl?.en?.startsWith('/') ? seo.slugUrl.en : '/' + seo.slugUrl.en) : ''}`;
        const dynamicCanonicalUrlVn = `https://183housingsolutions.com/project${seo.slugUrl?.vn !== '/' ? (seo.slugUrl?.vn?.startsWith('/') ? seo.slugUrl.vn : '/' + seo.slugUrl.vn) : ''}`;

        const payload = {
            projectSeoMetaTitle_en: seo.metaTitle.en,
            projectSeoMetaTitle_vn: seo.metaTitle.vn,
            projectSeoMetaDescription_en: seo.metaDescription.en,
            projectSeoMetaDescription_vn: seo.metaDescription.vn,
            projectSeoMetaKeywords_en: seo.metaKeywords.en,
            projectSeoMetaKeywords_vn: seo.metaKeywords.vn,
            projectSeoSlugUrl_en: seo.slugUrl.en,
            projectSeoSlugUrl_vn: seo.slugUrl.vn,
            // Compute Canonical dynamically if empty
            projectSeoCanonicalUrl_en: seo.canonicalUrl.en || dynamicCanonicalUrlEn,
            projectSeoCanonicalUrl_vn: seo.canonicalUrl.vn || dynamicCanonicalUrlVn,
            projectSeoSchemaType_en: seo.schemaType.en,
            projectSeoSchemaType_vn: seo.schemaType.vn,
            projectSeoAllowIndexing: seo.allowIndexing,
            projectSeoOgTitle_en: seo.ogTitle.en,
            projectSeoOgTitle_vn: seo.ogTitle.vn,
            projectSeoOgDescription_en: seo.ogDescription.en,
            projectSeoOgDescription_vn: seo.ogDescription.vn,
            projectSeoOgImage: seo.ogImage
        };
        onSubmit(payload);
    };

    const currentFocusKeyword = Array.isArray(seo.metaKeywords?.[activeLang]) && seo.metaKeywords[activeLang].length > 0 ? seo.metaKeywords[activeLang][0] : "";
    const dynamicCanonicalUrl = `https://183housingsolutions.com/project${seo.slugUrl?.[activeLang] !== '/' ? (seo.slugUrl?.[activeLang]?.startsWith('/') ? seo.slugUrl[activeLang] : '/' + seo.slugUrl[activeLang]) : ''}`;

    const seoData = {
        focusKeyword: currentFocusKeyword,
        title: seo.metaTitle?.[activeLang] || "",
        description: seo.metaDescription?.[activeLang] || "",
        slug: seo.slugUrl?.[activeLang] || "",
        canonicalUrl: seo.canonicalUrl?.[activeLang] || dynamicCanonicalUrl,
        schemaType: seo.schemaType?.[activeLang] || "",
        ogImage: seo.ogImage || "",
        noIndex: seo.allowIndexing === false,
    };

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

    const labels = {
        metaTitle: { en: "Meta Title", vn: "Tiêu đề Meta" },
        metaDescription: { en: "Meta Description", vn: "Mô tả Meta" },
        metaKeywords: { en: "Meta Keywords", vn: "Từ khóa Meta" },
        slugUrl: { en: "Slug URL", vn: "Đường dẫn Slug" },
        canonicalUrl: { en: "Canonical URL", vn: "Đường dẫn Canonical" },
        schemaType: { en: "Schema Type", vn: "Loại Schema" },
        allowIndexing: {
            en: "Allow search engines to index this page",
            vn: "Cho phép công cụ tìm kiếm lập chỉ mục",
        },
        social: {
            en: "Social Sharing (Open Graph)",
            vn: "Chia sẻ xã hội (Open Graph)",
        },
        ogTitle: { en: "OG Title", vn: "Tiêu đề OG" },
        ogDescription: { en: "OG Description", vn: "Mô tả OG" },
        ogImage: { en: "OG Image", vn: "Hình ảnh OG" },
    };

    const inputClass = "border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";
    const textareaClass = "border border-[#B2B2B3] rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div
                className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 font-['Manrope']">
                            {headerLang === 'en' ? 'SEO Settings' : 'Cài Đặt SEO'}
                        </h3>
                        <p className="text-sm text-gray-500 font-['Manrope']">
                            {headerLang === 'en' ? 'Manage Project SEO and meta information' : 'Quản lý SEO và thông tin meta cho Dự án'}
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-8 space-y-6 bg-white border-t border-gray-100">

                    {/* 🌐 LANGUAGE TABS */}
                    <div className="flex items-center justify-between mb-6 border-b border-gray-200">
                        <div className="flex">
                            {["vn", "en"].map((lng) => (
                                <button
                                    key={lng}
                                    type="button"
                                    onClick={() => setActiveLang(lng)}
                                    className={`px-6 py-2 text-sm cursor-pointer font-medium ${activeLang === lng
                                        ? "border-b-2 border-[#41398B] text-black"
                                        : "text-gray-500 hover:text-black"
                                        }`}
                                >
                                    {lng === "vn" ? "Tiếng Việt (VN)" : "English (EN)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ✅ SEO TOOL PANEL */}
                    <SeoPanel
                        seoData={seoData}
                        htmlContent={JSON.stringify(pageData) || ""}
                        onAnalysisUpdate={setSeoAnalysis}
                        activeLang={activeLang}
                    />

                    {/* ✨ AUTO GENERATE ALL BANNER */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "linear-gradient(135deg, #f0effe 0%, #e8f5e9 100%)",
                        border: "1px solid #c4b5fd", borderRadius: "10px", padding: "12px 16px",
                    }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#3730a3" }}>
                                ✨ {activeLang === "vn" ? "Tự động tạo nội dung SEO" : "Auto Generate SEO Content"}
                            </p>
                            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                                {activeLang === "vn"
                                    ? "Tạo tiêu đề, mô tả, từ khóa tự động"
                                    : "Generate title, description & keywords automatically"}
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
                            ✨ {activeLang === "vn" ? "Tạo tất cả" : "Generate All"}
                        </button>
                    </div>

                    {/* ✅ SLUG URL */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold">
                                {labels.slugUrl[activeLang]} <span className="font-normal text-gray-500 text-xs ml-2">(Auto-generated - Non-editable)</span>
                            </label>
                        </div>
                        <div>
                            <input
                                key={`${activeLang}-slugUrl`}
                                placeholder="project-name"
                                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                                value={seo.slugUrl[activeLang] || ""}
                                readOnly
                            />
                            {renderSuggestion('keywordInSlug')}
                        </div>
                    </div>

                    {/* ✅ CANONICAL */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block">
                            {labels.canonicalUrl[activeLang]} {!isProjectPage && <span className="font-normal text-gray-500 text-xs ml-2">(Auto-generated - Non-editable)</span>}
                        </label>
                        <input
                            placeholder="https://183housingsolutions.com/project/..."
                            className={`${inputClass} ${!isProjectPage ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            value={!isProjectPage ? dynamicCanonicalUrl : (seo.canonicalUrl[activeLang] || dynamicCanonicalUrl)}
                            onChange={(e) => {
                                if (isProjectPage) {
                                    handleChange("canonicalUrl", activeLang, e.target.value);
                                }
                            }}
                            readOnly={!isProjectPage}
                        />
                    </div>

                    {/* ✅ META TITLE */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold">{labels.metaTitle[activeLang]}</label>
                            <button type="button" onClick={() => handleAutoGenerate("metaTitle")}
                                style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
                                ✨ {activeLang === "vn" ? "Tự động tạo" : "Generate"}
                            </button>
                        </div>
                        <div>
                            <input
                                key={`${activeLang}-metaTitle`}
                                placeholder="Type Here"
                                className={inputClass}
                                value={seo.metaTitle[activeLang]}
                                onChange={(e) => handleChange("metaTitle", activeLang, e.target.value)}
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
                                ✨ {activeLang === "vn" ? "Tự động tạo" : "Generate"}
                            </button>
                        </div>
                        <div>
                            <textarea
                                key={`${activeLang}-metaDescription`}
                                placeholder="Type here"
                                rows={4}
                                className={textareaClass}
                                value={seo.metaDescription[activeLang]}
                                onChange={(e) => handleChange("metaDescription", activeLang, e.target.value)}
                            />
                            <CharCountIndicator value={seo.metaDescription[activeLang]} min={120} max={160} label="Meta Description" />
                            {renderSuggestion('keywordInDescription')}
                        </div>
                    </div>

                    {/* ✅ META KEYWORDS */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold">{labels.metaKeywords[activeLang]}</label>
                            <button type="button" onClick={() => handleAutoGenerate("metaKeywords")}
                                style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
                                ✨ {activeLang === "vn" ? "Tự động tạo" : "Generate"}
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

                    {/* ✅ SCHEMA TYPE */}
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
                            size="large"
                            popupClassName="custom-dropdown"
                            options={[
                                { label: 'Product', value: 'Product' },
                                { label: 'RealEstateAgent', value: 'RealEstateAgent' },
                                { label: 'Residence', value: 'Residence' },
                                { label: 'Apartment', value: 'Apartment' },
                                { label: 'SingleFamilyResidence', value: 'SingleFamilyResidence' },
                                { label: 'House', value: 'House' },
                                { label: 'Hotel', value: 'Hotel' },
                                { label: 'Place', value: 'Place' },
                                { label: 'LocalBusiness', value: 'LocalBusiness' },
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
                            onChange={(checked) => setSeo(prev => ({ ...prev, allowIndexing: checked }))}
                            style={{ backgroundColor: seo.allowIndexing ? "#41398B" : "#d9d9d9" }}
                        />
                    </div>

                    <div>
                        <h2 className="text-black text-lg font-semibold mt-4">
                            {labels.social[activeLang]}
                        </h2>
                    </div>

                    {/* ✅ OG TITLE */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold">{labels.ogTitle[activeLang]}</label>
                            <button type="button" onClick={() => handleAutoGenerate("ogTitle")}
                                style={{ fontSize: "12px", color: "#41398B", background: "#f0effe", border: "1px solid #c4b5fd", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontWeight: "600" }}>
                                ✨ {activeLang === "vn" ? "Tự động tạo" : "Generate"}
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
                                ✨ {activeLang === "vn" ? "Tự động tạo" : "Generate"}
                            </button>
                        </div>
                        <textarea
                            placeholder="Type here"
                            rows={4}
                            className={textareaClass}
                            value={seo.ogDescription[activeLang]}
                            onChange={(e) => handleChange("ogDescription", activeLang, e.target.value)}
                        />
                        <CharCountIndicator value={seo.ogDescription[activeLang]} min={130} max={200} label="OG Description" />
                    </div>

                    {/* ✅ OG IMAGE */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block">
                            {labels.ogImage[activeLang]}
                        </label>
                        {seo.ogImage ? (
                            <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-gray-200 group">
                                <img src={getAbsoluteUrl(seo.ogImage)} alt="OG Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button type="button" onClick={() => setPreview(getAbsoluteUrl(seo.ogImage))} className="bg-white p-2 rounded-full hover:bg-gray-100">
                                        <Eye size={16} className="text-gray-700" />
                                    </button>
                                    <button type="button" onClick={removeOgImage} className="bg-white p-2 rounded-full hover:bg-red-50">
                                        <X size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-48 h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-[#41398B] transition-colors cursor-pointer flex flex-col items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleOgUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {isOgUploading ? (
                                    <span className="text-sm text-gray-500">Uploading...</span>
                                ) : (
                                    <>
                                        <Plus size={24} className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Upload Image</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ✅ SAVE BUTTON */}
                    <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                        <Button
                            type="primary"
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={handleComplete}
                            loading={loading}
                            className="bg-[#41398B] hover:bg-[#322b70] border-none px-8 h-12 rounded-lg font-semibold shadow-md shadow-indigo-100"
                        >
                            {activeLang === 'vn' ? 'Lưu Thay Đổi SEO' : 'Save SEO Settings'}
                        </Button>
                    </div>

                </div>
            </div>

            {/* FULLSCREEN PREVIEW MODAL */}
            {preview && (
                <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                    <div className="relative max-w-5xl w-full">
                        <button type="button" className="absolute -top-12 right-0 text-white hover:text-gray-300" onClick={() => setPreview(null)}>
                            <X size={32} />
                        </button>
                        <img src={preview} alt="Preview fullscreen" className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}
