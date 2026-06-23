import React, { useState, useEffect } from 'react';
import { Eye, X, Plus } from 'lucide-react';
import { Select as AntdSelect, Switch, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { uploadPrivacyPolicyPageImage } from '../../Api/action';
import { usePermissions } from '../../Context/PermissionContext';
import SeoPanel from '../../components/Admin/SeoPanel';
import { CommonToaster } from '@/Common/CommonToaster';
import { buildCmsContent } from '../../components/Admin/CmsSeoUtils';

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

const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://api.183housingsolutions.com';
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function PrivacyPolicySeoForm({
    form,
    onSubmit,
    loading,
    pageData,
    onCancel,
    isOpen,
    onToggle,
    headerLang
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
                metaTitle: { en: pageData.privacyPolicySeoMetaTitle_en || "", vn: pageData.privacyPolicySeoMetaTitle_vn || "" },
                metaDescription: { en: pageData.privacyPolicySeoMetaDescription_en || "", vn: pageData.privacyPolicySeoMetaDescription_vn || "" },
                metaKeywords: { en: pageData.privacyPolicySeoMetaKeywords_en || [], vn: pageData.privacyPolicySeoMetaKeywords_vn || [] },
                slugUrl: { en: pageData.privacyPolicySeoSlugUrl_en || "", vn: pageData.privacyPolicySeoSlugUrl_vn || "" },
                canonicalUrl: { en: pageData.privacyPolicySeoCanonicalUrl_en || "", vn: pageData.privacyPolicySeoCanonicalUrl_vn || "" },
                schemaType: { en: pageData.privacyPolicySeoSchemaType_en || "", vn: pageData.privacyPolicySeoSchemaType_vn || "" },
                ogTitle: { en: pageData.privacyPolicySeoOgTitle_en || "", vn: pageData.privacyPolicySeoOgTitle_vn || "" },
                ogDescription: { en: pageData.privacyPolicySeoOgDescription_en || "", vn: pageData.privacyPolicySeoOgDescription_vn || "" },
                allowIndexing: pageData.privacyPolicySeoAllowIndexing !== false,
                ogImage: pageData.privacyPolicySeoOgImage || (pageData.privacyPolicySeoOgImages && pageData.privacyPolicySeoOgImages[0]) || "",
            });
        }
    }, [pageData]);

    // Initial Defaults
    useEffect(() => {
        if (!pageData) {
            setSeo(prev => ({
                ...prev,
                metaTitle: {
                    en: prev.metaTitle.en || 'Privacy Policy',
                    vn: prev.metaTitle.vn || 'Chính Sách Bảo Mật'
                },
                slugUrl: {
                    en: prev.slugUrl.en || 'privacy-policy',
                    vn: prev.slugUrl.vn || 'chinh-sach-bao-mat'
                }
            }));
        }
    }, [pageData]);

    const handleChange = (field, lang, value) => {
        setSeo(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value }
        }));
    };

    const handleAutoGenerate = (field) => {
        const content = buildCmsContent(activeLang, 'privacy');
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
        const content = buildCmsContent(activeLang, 'privacy');
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
            const response = await uploadPrivacyPolicyPageImage(file);
            if (response.data.success) {
                const url = response.data.data.url;
                setSeo(prev => ({ ...prev, ogImage: url }));
                CommonToaster(activeLang === "vn" ? "Hình ảnh đã tải lên!" : "Image uploaded!", "success");
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
        const payload = {
            privacyPolicySeoMetaTitle_en: seo.metaTitle.en,
            privacyPolicySeoMetaTitle_vn: seo.metaTitle.vn,
            privacyPolicySeoMetaDescription_en: seo.metaDescription.en,
            privacyPolicySeoMetaDescription_vn: seo.metaDescription.vn,
            privacyPolicySeoMetaKeywords_en: seo.metaKeywords.en,
            privacyPolicySeoMetaKeywords_vn: seo.metaKeywords.vn,
            privacyPolicySeoSlugUrl_en: seo.slugUrl.en,
            privacyPolicySeoSlugUrl_vn: seo.slugUrl.vn,
            // Compute Canonical dynamically if empty
            privacyPolicySeoCanonicalUrl_en: seo.canonicalUrl.en || `https://183housingsolutions.com${seo.slugUrl.en !== '/' ? (seo.slugUrl.en.startsWith('/') ? seo.slugUrl.en : '/' + seo.slugUrl.en) : ''}`,
            privacyPolicySeoCanonicalUrl_vn: seo.canonicalUrl.vn || `https://183housingsolutions.com${seo.slugUrl.vn !== '/' ? (seo.slugUrl.vn.startsWith('/') ? seo.slugUrl.vn : '/' + seo.slugUrl.vn) : ''}`,
            privacyPolicySeoSchemaType_en: seo.schemaType.en,
            privacyPolicySeoSchemaType_vn: seo.schemaType.vn,
            privacyPolicySeoAllowIndexing: seo.allowIndexing,
            privacyPolicySeoOgTitle_en: seo.ogTitle.en,
            privacyPolicySeoOgTitle_vn: seo.ogTitle.vn,
            privacyPolicySeoOgDescription_en: seo.ogDescription.en,
            privacyPolicySeoOgDescription_vn: seo.ogDescription.vn,
            privacyPolicySeoOgImage: seo.ogImage
        };
        onSubmit(payload);
    };

    const currentFocusKeyword = Array.isArray(seo.metaKeywords?.[activeLang]) && seo.metaKeywords[activeLang].length > 0 ? seo.metaKeywords[activeLang][0] : "";
    const dynamicCanonicalUrl = `https://183housingsolutions.com${seo.slugUrl?.[activeLang] !== '/' ? (seo.slugUrl?.[activeLang]?.startsWith('/') ? seo.slugUrl[activeLang] : '/' + seo.slugUrl[activeLang]) : ''}`;

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
                            {headerLang === 'en' ? 'Manage Privacy Policy page SEO and meta information' : 'Quản lý SEO và thông tin meta trang Chính Sách Bảo Mật'}
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
                                {labels.slugUrl[activeLang]} <span className="font-normal text-gray-500 text-xs ml-2">(Customizable for SEO)</span>
                            </label>
                        </div>
                        <div>
                            <input
                                key={`${activeLang}-slugUrl`}
                                placeholder="about-us"
                                className={inputClass}
                                value={seo.slugUrl[activeLang] || ""}
                                onChange={(e) => {
                                    let val = e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-');
                                    handleChange("slugUrl", activeLang, val);
                                }}
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

                    {/* ✅ CANONICAL */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block">
                            {labels.canonicalUrl[activeLang]} <span className="font-normal text-gray-500 text-xs ml-2">(Auto-generated - Non-editable)</span>
                        </label>
                        <input
                            placeholder="https://183housingsolutions.com/..."
                            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                            value={seoData.canonicalUrl}
                            readOnly
                        />
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
                                { label: "WebPage", value: "WebPage" },
                                { label: "AboutPage", value: "AboutPage" },
                                { label: "ContactPage", value: "ContactPage" },
                                { label: "Article", value: "Article" },
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
                            disabled={!can('cms.privacyPolicy', 'edit')}
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
                        <p className="text-xs text-gray-500 mb-3">(jpg, jpeg, png, webp, svg)</p>
                        <div className="flex gap-4 flex-wrap">
                            {seo.ogImage ? (
                                <div className="relative w-70 h-60 rounded-xl overflow-hidden border bg-gray-50 group">
                                    <img src={getAbsoluteUrl(seo.ogImage)} className="w-full h-full object-cover" />
                                    {can('cms.privacyPolicy', 'edit') && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100">
                                            <button type="button" onClick={() => setPreview(getAbsoluteUrl(seo.ogImage))} className="bg-white cursor-pointer rounded-full p-2 shadow">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={removeOgImage} className="bg-white cursor-pointer rounded-full p-2 shadow text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                can('cms.privacyPolicy', 'edit') && (
                                    <label className={`w-70 h-60 border border-dashed border-[#646466] rounded-xl flex flex-col items-center justify-center ${isOgUploading ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer bg-white hover:bg-gray-50'}`}>
                                        {isOgUploading ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="animate-spin h-8 w-8 text-[#41398B] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-xs mt-2 text-[#646466]">{activeLang === "vn" ? "Đang tải lên..." : "Uploading..."}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-18 h-18 border border-dashed border-[#646466] rounded-full flex items-center justify-center">
                                                    <Plus className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <span className="text-xs mt-2 text-[#646466]">{activeLang === "vn" ? "Bấm vào đây để tải lên" : "Click here to upload"}</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleOgUpload} className="hidden" disabled={isOgUploading} />
                                    </label>
                                )
                            )}
                        </div>
                    </div>

                    {/* ✅ PREVIEW MODAL */}
                    {preview && (
                        <div onClick={() => setPreview(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                            <div className="relative max-w-2xl w-full rounded-xl overflow-hidden bg-black/20" onClick={(e) => e.stopPropagation()}>
                                <button type="button" onClick={() => setPreview(null)} className="absolute top-3 right-3 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-full p-2 z-10">
                                    <X className="w-5 h-5" />
                                </button>
                                <img src={preview} className="w-full h-full object-contain rounded-xl" alt="Preview" />
                            </div>
                        </div>
                    )}

                    {/* ✅ SAVE BUTTON */}
                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                        {pageData && (
                            <Button size="large" onClick={onCancel} className="rounded-[10px] font-semibold text-[15px] h-12 px-6 font-['Manrope'] border-[#d1d5db] text-[#374151] hover:!text-[#41398B] hover:!border-[#41398B]">
                                {activeLang === 'vn' ? 'Hủy' : 'Cancel'}
                            </Button>
                        )}
                        {can('cms.privacyPolicy', 'edit') && (
                            <Button
                                type="primary"
                                onClick={handleComplete}
                                size="large"
                                icon={<SaveOutlined />}
                                loading={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-lg shadow-md"
                            >
                                {activeLang === 'vn' ? (pageData ? 'Lưu Cài Đặt SEO' : 'Tạo Trang') : (pageData ? 'Save SEO Settings' : 'Create Page')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}