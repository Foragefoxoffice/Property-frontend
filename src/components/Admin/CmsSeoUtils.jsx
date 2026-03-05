/**
 * Shared SEO utilities for CMS page forms.
 * Provides: CharCountIndicator, GenBtn, buildCmsContent, InputWithCount, TextAreaWithCount
 */
import { forwardRef } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;

// ── Character count indicator ────────────────────────────────
export const CharCountIndicator = ({ value = "", min, max, label }) => {
    const len = (value || "").trim().length;
    const isAbove = len > max;
    const isOptimal = len >= min && len <= max;
    const color = isOptimal ? "#22c55e" : isAbove ? "#ef4444" : len > 0 ? "#f97316" : "#9ca3af";
    const pct = Math.min((len / max) * 100, 100);
    const optimalStart = (min / max) * 100;
    const statusText = isOptimal
        ? "✓ Good length"
        : isAbove
            ? `Too long — shorten by ${len - max} chars`
            : len > 0
                ? `${min - len} more chars to reach minimum`
                : `Add ${label}`;

    return (
        <div style={{ marginTop: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color }}>{statusText}</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color }}>
                    {len} / {max}{" "}
                    <span style={{ color: "#9ca3af", fontWeight: "normal" }}>({min}–{max} recommended)</span>
                </span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", background: "#e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: `${optimalStart}%`, width: `${100 - optimalStart}%`, height: "100%", background: "#d1fae5" }} />
                <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: "100%", background: color, transition: "width 0.15s ease, background 0.15s ease" }} />
            </div>
        </div>
    );
};

// ── Small generate button ─────────────────────────────────────
export const GenBtn = ({ onClick, lang }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            fontSize: "12px", color: "#41398B",
            background: "#f0effe", border: "1px solid #c4b5fd",
            borderRadius: "6px", padding: "3px 10px",
            cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap",
        }}
    >
        ✨ {lang === "vn" || lang === "vi" ? "Tự động tạo" : "Generate"}
    </button>
);

// ── Field label row (label + generate button side by side) ────
export const LabelRow = ({ label, onGenerate, lang }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <span className="font-semibold text-[#374151] text-sm font-['Manrope']">{label}</span>
        <GenBtn onClick={onGenerate} lang={lang} />
    </div>
);

// ── Generate All banner ───────────────────────────────────────
export const GenerateAllBanner = ({ onGenerateAll, lang }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(135deg, #f0effe 0%, #e8f5e9 100%)",
        border: "1px solid #c4b5fd", borderRadius: "10px", padding: "12px 16px",
        marginBottom: "16px",
    }}>
        <div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#3730a3" }}>
                ✨ {lang === "vn" || lang === "vi" ? "Tự động tạo nội dung SEO" : "Auto Generate SEO Content"}
            </p>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                {lang === "vn" || lang === "vi"
                    ? "Tạo tiêu đề, mô tả và từ khóa tự động"
                    : "Generate title, description & keywords automatically"}
            </p>
        </div>
        <button
            type="button"
            onClick={onGenerateAll}
            style={{
                background: "#41398B", color: "#fff", border: "none", borderRadius: "8px",
                padding: "8px 18px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}
        >
            {lang === "vn" || lang === "vi" ? "✨ Tạo tất cả" : "✨ Generate All"}
        </button>
    </div>
);

// ── Page-specific SEO content library ────────────────────────
const CMS_CONTENT = {
    home: {
        en: {
            metaTitle: "183 Housing Solutions | Vietnam Real Estate",
            metaDesc: "Find your perfect property in Vietnam with 183 Housing Solutions. Browse premium apartments, houses, and villas available for rent and sale across prime locations.",
            keywords: ["real estate Vietnam", "apartments for rent", "houses for sale", "183 Housing Solutions", "Vietnam property", "rental apartments"],
            ogTitle: "183 Housing Solutions | Premium Vietnam Properties",
            ogDesc: "Explore the best real estate listings in Vietnam. Find apartments, villas, and houses for rent or purchase in prime locations with 183 Housing Solutions today.",
        },
        vn: {
            metaTitle: "183 Housing Solutions | Bất Động Sản Việt Nam",
            metaDesc: "Tìm bất động sản lý tưởng tại Việt Nam cùng 183 Housing Solutions. Duyệt căn hộ, nhà phố và biệt thự cao cấp để cho thuê và mua bán tại các khu vực đắc địa.",
            keywords: ["bất động sản", "căn hộ cho thuê", "nhà đất Việt Nam", "183 Housing Solutions", "thuê căn hộ", "mua bán nhà"],
            ogTitle: "183 Housing Solutions | Bất Động Sản Cao Cấp",
            ogDesc: "Khám phá danh sách bất động sản tốt nhất tại Việt Nam. Căn hộ, nhà phố và biệt thự cao cấp cho thuê và mua bán tại các vị trí đắc địa cùng 183 Housing Solutions.",
        },
    },
    about: {
        en: {
            metaTitle: "About Us | 183 Housing Solutions",
            metaDesc: "Learn about 183 Housing Solutions, your trusted real estate partner in Vietnam. We specialize in property rentals, sales, and professional consulting services.",
            keywords: ["about us", "real estate agency", "property consultant Vietnam", "183 Housing Solutions", "trusted real estate"],
            ogTitle: "About 183 Housing Solutions | Real Estate Experts",
            ogDesc: "Discover who we are at 183 Housing Solutions. Trusted real estate experts in Vietnam offering rentals, sales, and property consulting tailored to your needs.",
        },
        vn: {
            metaTitle: "Về chúng tôi | 183 Housing Solutions",
            metaDesc: "Tìm hiểu về 183 Housing Solutions, đối tác bất động sản đáng tin cậy tại Việt Nam. Chuyên tư vấn cho thuê, mua bán và đầu tư bất động sản chuyên nghiệp.",
            keywords: ["về chúng tôi", "công ty bất động sản", "tư vấn bất động sản", "183 Housing Solutions", "bất động sản Việt Nam"],
            ogTitle: "Về 183 Housing Solutions | Chuyên Gia Bất Động Sản",
            ogDesc: "Khám phá 183 Housing Solutions – đối tác bất động sản chuyên nghiệp tại Việt Nam, cung cấp dịch vụ cho thuê, mua bán và tư vấn đầu tư bất động sản uy tín.",
        },
    },
    contact: {
        en: {
            metaTitle: "Contact Us | 183 Housing Solutions",
            metaDesc: "Get in touch with 183 Housing Solutions for property inquiries, viewings, and expert real estate advice. Our team is ready to help you find your perfect home.",
            keywords: ["contact us", "real estate inquiry", "property viewing", "183 Housing Solutions", "get in touch"],
            ogTitle: "Contact 183 Housing Solutions | We're Here to Help",
            ogDesc: "Reach out to 183 Housing Solutions for all your real estate needs. Our expert team is available to assist with property search, viewings, and investment advice.",
        },
        vn: {
            metaTitle: "Liên Hệ | 183 Housing Solutions",
            metaDesc: "Liên hệ với 183 Housing Solutions để được tư vấn bất động sản, xem nhà và nhận hỗ trợ chuyên nghiệp. Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ.",
            keywords: ["liên hệ", "tư vấn bất động sản", "xem nhà", "183 Housing Solutions", "hỗ trợ"],
            ogTitle: "Liên Hệ 183 Housing Solutions | Chúng Tôi Luôn Sẵn Sàng",
            ogDesc: "Liên hệ với đội ngũ 183 Housing Solutions để được tư vấn toàn diện về bất động sản tại Việt Nam. Chúng tôi hỗ trợ tìm kiếm, xem nhà và đầu tư bất động sản.",
        },
    },
    terms: {
        en: {
            metaTitle: "Terms & Conditions | 183 Housing Solutions",
            metaDesc: "Read the terms and conditions for using 183 Housing Solutions services. Understand your rights, responsibilities, and our service policies in detail.",
            keywords: ["terms and conditions", "service policy", "user agreement", "183 Housing Solutions", "legal terms"],
            ogTitle: "Terms & Conditions | 183 Housing Solutions",
            ogDesc: "Review the terms and conditions governing use of 183 Housing Solutions services. Stay informed about your rights and responsibilities as a user of our platform.",
        },
        vn: {
            metaTitle: "Điều Khoản & Điều Kiện | 183 Housing Solutions",
            metaDesc: "Đọc các điều khoản và điều kiện sử dụng dịch vụ của 183 Housing Solutions. Tìm hiểu quyền lợi, trách nhiệm và chính sách dịch vụ áp dụng cho người dùng.",
            keywords: ["điều khoản sử dụng", "chính sách dịch vụ", "điều kiện", "183 Housing Solutions", "thỏa thuận người dùng"],
            ogTitle: "Điều Khoản & Điều Kiện | 183 Housing Solutions",
            ogDesc: "View xét các điều khoản và điều kiện điều chỉnh việc sử dụng dịch vụ của 183 Housing Solutions. Nắm rõ quyền và trách nhiệm của bạn khi sử dụng nền tảng.",
        },
    },
    privacy: {
        en: {
            metaTitle: "Privacy Policy | 183 Housing Solutions",
            metaDesc: "Read the privacy policy of 183 Housing Solutions to understand how we collect, use, and protect your personal data and information securely.",
            keywords: ["privacy policy", "data protection", "personal information", "183 Housing Solutions", "GDPR"],
            ogTitle: "Privacy Policy | 183 Housing Solutions",
            ogDesc: "Understand how 183 Housing Solutions collects, uses, and safeguards your personal information. Your privacy and data security are our top priorities.",
        },
        vn: {
            metaTitle: "Chính Sách Bảo Mật | 183 Housing Solutions",
            metaDesc: "Đọc chính sách bảo mật của 183 Housing Solutions để hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn một cách an toàn.",
            keywords: ["chính sách bảo mật", "bảo vệ dữ liệu", "thông tin cá nhân", "183 Housing Solutions", "quyền riêng tư"],
            ogTitle: "Chính Sách Bảo Mật | 183 Housing Solutions",
            ogDesc: "Tìm hiểu cách 183 Housing Solutions thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn. Quyền riêng tư và bảo mật dữ liệu là ưu tiên hàng đầu của chúng tôi.",
        },
    },
    blog: {
        en: {
            metaTitle: "Real Estate Insights | 183 Housing Solutions News",
            metaDesc: "Stay updated with the latest real estate news, property tips, and market insights from 183 Housing Solutions. Expert advice for buyers, renters, and investors.",
            keywords: ["real estate blog", "property tips", "market insights", "183 Housing Solutions", "real estate news"],
            ogTitle: "183 Housing Solutions News | Real Estate Insights",
            ogDesc: "Read expert real estate articles, property guides, and market analysis from 183 Housing Solutions. Your go-to source for Vietnam property insights.",
        },
        vi: {
            metaTitle: "Tin Tức Bất Động Sản | News 183 Housing Solutions",
            metaDesc: "Cập nhật tin tức bất động sản, mẹo mua nhà và thông tin thị trường từ 183 Housing Solutions. Tư vấn chuyên sâu cho người mua, thuê và đầu tư bất động sản.",
            keywords: ["blog bất động sản", "mẹo mua nhà", "thị trường bất động sản", "183 Housing Solutions", "tin tức nhà đất"],
            ogTitle: "News 183 Housing Solutions | Tin Tức Bất Động Sản",
            ogDesc: "Đọc các bài viết, hướng dẫn và phân tích thị trường bất động sản từ chuyên gia 183 Housing Solutions. Nguồn thông tin tin cậy về bất động sản Việt Nam.",
        },
    },
};

/**
 * Returns page-specific SEO content for CMS forms.
 * @param {string} lang - "en", "vn", or "vi"
 * @param {string} pageType - "home" | "about" | "contact" | "terms" | "privacy" | "blog"
 * @param {string} [blogTitle] - Optional blog post title for blog-type generation
 */
export const buildCmsContent = (lang, pageType, blogTitle = "") => {
    const l = lang === "vi" ? "vi" : lang; // normalize "vi"/"vn"
    const page = CMS_CONTENT[pageType] || CMS_CONTENT.home;
    const content = page[l] || page.en || page.vn || page.vi;

    // For blog, override title/desc with the actual blog post title if available
    if (pageType === "blog" && blogTitle) {
        const cleanTitle = blogTitle.replace(/[<>]/g, "").trim();
        const titleEn = `${cleanTitle} | 183 Housing Solutions`.slice(0, 60);
        const titleVi = `${cleanTitle} | 183 Housing Solutions`.slice(0, 60);
        const descEn = `Read our latest article: ${cleanTitle}. Stay informed with expert real estate insights, tips, and market news from 183 Housing Solutions.`.slice(0, 160);
        const descVi = `Đọc bài viết mới nhất: ${cleanTitle}. Cập nhật tin tức, mẹo và phân tích thị trường bất động sản từ 183 Housing Solutions.`.slice(0, 160);
        return {
            metaTitle: l === "vi" ? titleVi : titleEn,
            metaDesc: l === "vi" ? descVi : descEn,
            keywords: content.keywords,
            ogTitle: (l === "vi" ? titleVi : titleEn).slice(0, 60),
            ogDesc: (l === "vi" ? descVi : descEn).slice(0, 200),
        };
    }

    return {
        metaTitle: content.metaTitle,
        metaDesc: content.metaDesc,
        keywords: content.keywords,
        ogTitle: content.ogTitle,
        ogDesc: content.ogDesc,
    };
};

// ── Input + CharCountIndicator (forwardRef so Form.Item injects value/onChange) ──
export const InputWithCount = forwardRef(({ value = '', onChange, min, max, countLabel, suggestions, ...rest }, ref) => (
    <div>
        <Input ref={ref} value={value} onChange={onChange} {...rest} />
        <CharCountIndicator value={value} min={min} max={max} label={countLabel} />
        {suggestions}
    </div>
));
InputWithCount.displayName = 'InputWithCount';

// ── TextArea + CharCountIndicator ──────────────────────────────
export const TextAreaWithCount = forwardRef(({ value = '', onChange, min, max, countLabel, suggestions, ...rest }) => (
    <div>
        <TextArea value={value} onChange={onChange} {...rest} />
        <CharCountIndicator value={value} min={min} max={max} label={countLabel} />
        {suggestions}
    </div>
));
TextAreaWithCount.displayName = 'TextAreaWithCount';
