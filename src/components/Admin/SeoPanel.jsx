import React, { useState, useEffect, useMemo } from "react";
import { analyzeSeo } from "../../utils/seoAnalyzer";

/* ── Circular score ring ─────────────────────────────────────── */
const ScoreRing = ({ score, color }) => {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const filled = (score / 100) * circ;

    return (
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
                cx="32" cy="32" r={r}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeDasharray={`${filled} ${circ}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
        </svg>
    );
};

/* ── Single check row ────────────────────────────────────────── */
const CheckItem = ({ label, checkData }) => {
    const passed = checkData?.passed;
    const text = passed ? label : (checkData?.suggestion || label);

    return (
        <div style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "9px 12px", borderRadius: "8px",
            background: passed ? "#f0fdf4" : "#fff5f5",
            border: `1px solid ${passed ? "#bbf7d0" : "#fecaca"}`,
            marginBottom: "8px",
        }}>
            <span style={{
                flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%",
                background: passed ? "#22c55e" : "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", color: "#fff", fontWeight: "700", marginTop: "1px",
            }}>
                {passed ? "✓" : "✕"}
            </span>
            <span style={{ fontSize: "13px", lineHeight: "1.45", color: passed ? "#15803d" : "#b91c1c", fontWeight: passed ? "400" : "500" }}>
                {text}
            </span>
        </div>
    );
};

const EMPTY_ARRAY = [];

/* ── Main component ──────────────────────────────────────────── */
const SeoPanel = ({ seoData, htmlContent = "", images = EMPTY_ARRAY, onAnalysisUpdate }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [analysis, setAnalysis] = useState({ checks: {}, score: 0 });

    const currentData = {
        focusKeyword: seoData?.focusKeyword || "",
        title: seoData?.title || "",
        description: seoData?.description || "",
        slug: seoData?.slug || "",
        canonicalUrl: seoData?.canonicalUrl || "",
        schemaType: seoData?.schemaType || "",
        ogImage: seoData?.ogImage || "",
        noIndex: seoData?.noIndex || false,
    };

    useEffect(() => {
        const result = analyzeSeo({ seoSettings: currentData, htmlContent, images });
        setAnalysis(result);
    }, [currentData.focusKeyword, currentData.title, currentData.description, currentData.slug,
        currentData.canonicalUrl, currentData.schemaType, currentData.ogImage, htmlContent, images]);

    useEffect(() => {
        if (onAnalysisUpdate && analysis) onAnalysisUpdate(analysis);
    }, [analysis, onAnalysisUpdate]);

    const { checks, score } = analysis;

    const scoreColor = useMemo(() => {
        if (score >= 80) return "#22c55e";
        if (score >= 50) return "#f97316";
        return "#ef4444";
    }, [score]);

    const scoreLabel = score >= 80 ? "Great" : score >= 50 ? "Needs Work" : "Poor";

    // Order matches the form field sequence top → bottom
    const checkList = [
        { key: "keywordInSlug",        label: "Focus Keyword in URL Slug" },
        { key: "keywordInTitle",       label: "Focus Keyword in Title" },
        { key: "titleLengthOK",        label: "Title length (30–60 chars)" },
        { key: "keywordInDescription", label: "Focus Keyword in Meta Description" },
        { key: "descriptionLengthOK",  label: "Description length (120–160 chars)" },
        { key: "keywordInContent",     label: "Focus Keyword in Content" },
        { key: "canonicalUrlSet",      label: "Canonical URL is set" },
        { key: "schemaTypeSet",        label: "Schema Type is selected" },
        { key: "ogImageSet",           label: "OG Image is uploaded" },
    ];

    const passed = checkList.filter(c => checks[c.key]?.passed);
    const failed = checkList.filter(c => !checks[c.key]?.passed);

    return (
        <div style={{
            borderRadius: "14px", overflow: "hidden",
            boxShadow: "0 2px 12px rgba(65,57,139,0.10)",
            border: "1px solid #e5e7eb", marginBottom: "20px",
        }}>
            {/* ── HEADER ─────────────────────────────────────────── */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #41398B 0%, #6c63d6 100%)",
                    padding: "16px 20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Icon */}
                    <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "18px",
                    }}>
                        🔍
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#fff" }}>
                            SEO Settings & Analysis
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                            {failed.length > 0 ? `${failed.length} issue${failed.length > 1 ? "s" : ""} to fix` : "All checks passed!"}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Score pill */}
                    <div style={{
                        background: "rgba(255,255,255,0.15)", borderRadius: "8px",
                        padding: "6px 14px", display: "flex", alignItems: "center", gap: "8px",
                    }}>
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>Score</span>
                        <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>{score}</span>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>/100</span>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
                    </div>

                    {/* Chevron */}
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: "12px",
                        transition: "transform 0.2s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}>
                        ▼
                    </div>
                </div>
            </div>

            {/* ── BODY ───────────────────────────────────────────── */}
            {isOpen && (
                <div style={{ background: "#fafbff", padding: "20px" }}>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

                        {/* LEFT COLUMN */}
                        <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "16px" }}>

                            {/* Score card */}
                            <div style={{
                                background: "#fff", borderRadius: "12px",
                                border: "1px solid #e5e7eb", padding: "16px",
                                display: "flex", alignItems: "center", gap: "16px",
                            }}>
                                <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
                                    <ScoreRing score={score} color={scoreColor} />
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <span style={{ fontSize: "14px", fontWeight: "800", color: scoreColor, lineHeight: 1 }}>{score}</span>
                                    </div>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: scoreColor }}>{scoreLabel}</p>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                                        {passed.length}/{checkList.length} checks passed
                                    </p>
                                    {/* Mini progress bar */}
                                    <div style={{ height: "5px", width: "140px", background: "#e5e7eb", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${score}%`, background: scoreColor, borderRadius: "3px", transition: "width 0.5s ease" }} />
                                    </div>
                                </div>
                            </div>

                            {/* Google Preview card */}
                            <div style={{
                                background: "#fff", borderRadius: "12px",
                                border: "1px solid #e5e7eb", padding: "16px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                    <div style={{
                                        width: "24px", height: "24px", borderRadius: "50%",
                                        background: "linear-gradient(135deg,#4285f4,#34a853,#fbbc05,#ea4335)",
                                        flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#5f6368", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                                        Google Search Preview
                                    </span>
                                </div>

                                <div style={{ fontFamily: "arial, sans-serif", borderLeft: "3px solid #4285f4", paddingLeft: "10px" }}>
                                    <div style={{ fontSize: "12px", color: "#3c4043", marginBottom: "4px" }}>
                                        yoursite.com
                                        <span style={{ color: "#5f6368" }}> › {currentData.slug || "page-slug"}</span>
                                    </div>
                                    <div style={{
                                        fontSize: "18px", color: "#1a0dab", fontWeight: "400",
                                        marginBottom: "4px", whiteSpace: "nowrap",
                                        overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                        {currentData.title || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Enter an SEO Title…</span>}
                                    </div>
                                    <div style={{
                                        fontSize: "13px", color: "#4d5156", lineHeight: "1.5",
                                        display: "-webkit-box", WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical", overflow: "hidden",
                                    }}>
                                        {currentData.description || <span style={{ fontStyle: "italic" }}>Add a meta description to control what shows here in search results.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN — checklist */}
                        <div style={{ flex: "1 1 280px" }}>
                            <p style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Analysis Checklist
                            </p>

                            {checkList.map(({ key, label }) => (
                                <CheckItem key={key} label={label} checkData={checks[key]} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeoPanel;
