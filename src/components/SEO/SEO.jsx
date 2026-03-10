import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords = [],
    image,
    url,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    type = 'website',
    allowIndexing = true
}) => {
    const siteTitle = '183 Housing Solutions';
    const currentUrl = url || window.location.href;
    const finalTitle = title || siteTitle;
    const finalOgTitle = ogTitle || finalTitle;
    const finalOgDescription = ogDescription || description;

    // Clean up image URL
    let mainImage = ogImage || image || '/images/favicon.png';
    if (mainImage && !mainImage.startsWith('http')) {
        mainImage = `${window.location.protocol}//${window.location.host}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
    }

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="title" content={finalTitle} />
            <meta name="description" content={description || ''} />
            {keywords && keywords.length > 0 && (
                <meta name="keywords" content={Array.isArray(keywords) ? keywords.join(', ') : keywords} />
            )}
            <meta name="robots" content={allowIndexing ? "index, follow" : "noindex, nofollow"} />
            
            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl || currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={finalOgTitle} />
            <meta property="og:description" content={finalOgDescription || ''} />
            <meta property="og:image" content={mainImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={finalOgTitle} />
            <meta property="twitter:description" content={finalOgDescription || ''} />
            <meta property="twitter:image" content={mainImage} />
        </Helmet>
    );
};

export default SEO;
