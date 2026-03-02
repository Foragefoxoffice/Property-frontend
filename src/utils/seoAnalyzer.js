/**
 * Utility to analyze SEO fields and content.
 * Returns an object containing boolean checks and an aggregate score (0-100).
 */

export const analyzeSeo = ({ seoSettings, htmlContent, images = [] }) => {
    const { focusKeyword = "", title = "", description = "", slug = "" } = seoSettings || {};

    // Clean strings
    const keyword = focusKeyword.trim().toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    const lowerSlug = slug.toLowerCase();

    // Strip HTML from content to get raw text
    const stripHtml = (html) => {
        if (typeof window === "undefined") {
            // In SSR context, just do a basic replace
            return (html || "").replace(/<[^>]*>?/gm, "").toLowerCase();
        }
        const tmp = document.createElement("div");
        tmp.innerHTML = html || "";
        return (tmp.textContent || tmp.innerText || "").toLowerCase();
    };

    const plainContent = stripHtml(htmlContent);

    const checks = {
        keywordInTitle: { passed: false, suggestion: "Add your focus keyword to the SEO Title." },
        keywordInDescription: { passed: false, suggestion: "Include your focus keyword in the Meta Description." },
        keywordInSlug: { passed: false, suggestion: "Add your focus keyword to the URL Slug." },
        keywordInContent: { passed: false, suggestion: "Use your focus keyword at least once in the page content." },
        titleLengthOK: { passed: false, suggestion: "Make sure your SEO Title is between 30 and 60 characters long." },
        descriptionLengthOK: { passed: false, suggestion: "Make sure your Meta Description is between 120 and 160 characters long." },
        h1Present: { passed: false, suggestion: "Add at least one H1 heading to your page content." },
        imagesHaveAlt: { passed: false, suggestion: "Ensure all images in your content have alternative (alt) text." },
    };

    if (keyword) {
        checks.keywordInTitle.passed = lowerTitle.includes(keyword);
        checks.keywordInDescription.passed = lowerDesc.includes(keyword);
        checks.keywordInSlug.passed = lowerSlug.includes(keyword);
        checks.keywordInContent.passed = plainContent.includes(keyword);
    } else {
        // If no keyword is set, these checks inherently fail.
        checks.keywordInTitle.passed = false;
        checks.keywordInDescription.passed = false;
        checks.keywordInSlug.passed = false;
        checks.keywordInContent.passed = false;

        checks.keywordInTitle.suggestion = "Set a focus keyword first.";
        checks.keywordInDescription.suggestion = "Set a focus keyword first.";
        checks.keywordInSlug.suggestion = "Set a focus keyword first.";
        checks.keywordInContent.suggestion = "Set a focus keyword first.";
    }

    // Title length usually recommended 30-60
    const titleLen = title.trim().length;
    checks.titleLengthOK.passed = titleLen >= 30 && titleLen <= 60;
    if (titleLen < 30) {
        checks.titleLengthOK.suggestion = `SEO Title is too short (${titleLen} chars). Recommended: 30-60.`;
    } else if (titleLen > 60) {
        checks.titleLengthOK.suggestion = `SEO Title is too long (${titleLen} chars). Recommended: 30-60.`;
    }

    // Description length usually recommended 120-160
    const descLen = description.trim().length;
    checks.descriptionLengthOK.passed = descLen >= 120 && descLen <= 160;
    if (descLen < 120) {
        checks.descriptionLengthOK.suggestion = `Meta Description is too short (${descLen} chars). Recommended: 120-160.`;
    } else if (descLen > 160) {
        checks.descriptionLengthOK.suggestion = `Meta Description is too long (${descLen} chars). Recommended: 120-160.`;
    }

    // H1 presence check
    checks.h1Present.passed = /<h1[^>]*>.*?<\/h1>/i.test(htmlContent || "");

    // All images have alt text
    if (images && images.length > 0) {
        // Ensure all images have an alt attribute that's not empty
        checks.imagesHaveAlt.passed = images.every(
            (img) => img && img.alt && img.alt.trim().length > 0
        );
    } else {
        // If no images, it's not a failure
        checks.imagesHaveAlt.passed = true;
    }

    // Calculate score
    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(c => c.passed).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    return { checks, score };
};
