import React, { useState, useEffect, useMemo } from "react";
import { analyzeSeo } from "../../utils/seoAnalyzer";

const SeoPanel = ({ seoData, htmlContent = "", images = [], onAnalysisUpdate }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [analysis, setAnalysis] = useState({ checks: {}, score: 0 });

    // Fallback defaults mapping to the schema's `seo` object structure
    const currentData = {
        focusKeyword: seoData?.focusKeyword || "",
        title: seoData?.title || "",
        description: seoData?.description || "",
        slug: seoData?.slug || "",
        canonicalUrl: seoData?.canonicalUrl || "",
        noIndex: seoData?.noIndex || false,
    };

    // Run analysis whenever inputs or content change
    useEffect(() => {
        const result = analyzeSeo({
            seoSettings: currentData,
            htmlContent,
            images,
        });
        setAnalysis(result);
    }, [
        currentData.focusKeyword,
        currentData.title,
        currentData.description,
        currentData.slug,
        htmlContent,
        images,
    ]);

    // Export analysis to parent if callback provided
    useEffect(() => {
        if (onAnalysisUpdate && analysis) {
            onAnalysisUpdate(analysis);
        }
    }, [analysis, onAnalysisUpdate]);

    const { checks, score } = analysis;

    // Score Color Logic
    const scoreColor = useMemo(() => {
        if (score >= 80) return "#22c55e"; // Green
        if (score >= 50) return "#f97316"; // Orange
        return "#ef4444"; // Red
    }, [score]);

    const CheckItem = ({ label, checkData }) => {
        const passed = checkData?.passed;
        const suggestion = checkData?.suggestion;

        return (
            <div style={{ marginBottom: "12px", borderBottom: "1px dashed #e5e7eb", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ color: passed ? "#22c55e" : "#ef4444", fontWeight: "bold", marginTop: passed ? "0px" : "2px", fontSize: "16px" }}>
                        {passed ? "✔" : "❌"}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "14px", color: "#374151", fontWeight: passed ? "normal" : "500" }}>
                            {passed ? label : (suggestion || label)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "20px", background: "#fff" }}>
            {/* HEADER */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: "16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: isOpen ? "1px solid #e5e7eb" : "none",
                    backgroundColor: "#f9fafb",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                        SEO Settings & Analysis
                    </h3>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            fontSize: "13px",
                            fontWeight: "600",
                        }}
                    >
                        <span>Score:</span>
                        <span style={{ color: scoreColor }}>{score}/100</span>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: scoreColor }} />
                    </div>
                </div>
                <span style={{ fontSize: "18px", color: "#6b7280" }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* CONTENT */}
            {isOpen && (
                <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
                        {/* LEFT: GOOGLE PREVIEW */}
                        <div style={{ flex: "1 1 min0", minWidth: "300px" }}>
                            <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef", height: "100%" }}>
                                <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "600", color: "#495057", textTransform: "uppercase" }}>Google Search Preview</p>

                                <div style={{ fontFamily: "arial, sans-serif" }}>
                                    <div style={{ fontSize: "14px", color: "#202124", marginBottom: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ background: "#e8eaed", borderRadius: "50%", width: "24px", height: "24px", display: "inline-block" }}></span>
                                        <span>yoursite.com <span style={{ color: "#5f6368" }}>› {currentData.slug || "page-slug"}</span></span>
                                    </div>
                                    <div style={{ fontSize: "20px", color: "#1a0dab", textDecoration: "none", cursor: "pointer", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {currentData.title || "Please enter a SEO Title"}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#4d5156", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {currentData.description || "Provide a meta description by editing the field in the form. This will help users understand what this page is about."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: CHECKLIST */}
                        <div style={{ flex: "1 1 min0", minWidth: "300px" }}>
                            <p style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>Analysis Checklist</p>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <CheckItem label="Focus Keyword in Title" checkData={checks.keywordInTitle} />
                                <CheckItem label="Focus Keyword in Meta Description" checkData={checks.keywordInDescription} />
                                <CheckItem label="Focus Keyword in URL Slug" checkData={checks.keywordInSlug} />
                                <CheckItem label="Focus Keyword in Content" checkData={checks.keywordInContent} />
                                <CheckItem label="Title length is good (30-60 chars)" checkData={checks.titleLengthOK} />
                                <CheckItem label="Meta description length is good (120-160 chars)" checkData={checks.descriptionLengthOK} />
                                <CheckItem label="At least one H1 heading in content" checkData={checks.h1Present} />
                                <CheckItem label="All images have alt text" checkData={checks.imagesHaveAlt} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeoPanel;
