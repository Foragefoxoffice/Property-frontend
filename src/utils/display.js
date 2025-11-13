// utils/display.js
// Small helper utilities for safe display of backend values.

export function safeVal(v) {
    // Return string or number safely from union types:
    // string | number | {en,vi} | null | {}
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number") return v;
    if (typeof v === "object") {
        // prefer en then vi then any primitive inside object
        if ("en" in v && (v.en || v.en === 0)) return v.en;
        if ("vi" in v && (v.vi || v.vi === 0)) return v.vi;
        // fallback: if object contains primitives, return first primitive value
        for (const key of Object.keys(v)) {
            const val = v[key];
            if (typeof val === "string" || typeof val === "number") return val;
        }
    }
    return "";
}

export function safeArray(a) {
    // ensures array or empty array
    if (!a) return [];
    if (Array.isArray(a)) return a;
    return [a];
}

export function formatNumber(num) {
    if (num === null || num === undefined || num === "") return "-";
    const n = Number(num);
    if (Number.isNaN(n)) return String(num);
    return n.toLocaleString();
}
