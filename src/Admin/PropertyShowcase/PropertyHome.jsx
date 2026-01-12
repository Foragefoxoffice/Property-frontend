import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { safeVal, safeArray, formatNumber } from "@/utils/display";
import { CommonToaster } from "@/Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function PropertyHome({ property }) {
  const [current, setCurrent] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];

  // Safe extraction
  const getLocalizedValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
  };

  const images = safeArray(property?.imagesVideos?.propertyImages).filter(Boolean);
  const type = safeVal(property?.listingInformation?.listingInformationTransactionType) || "";
  const propertyType = getLocalizedValue(property?.listingInformation?.listingInformationPropertyType) || "";
  const title = getLocalizedValue(property?.listingInformation?.listingInformationPropertyTitle) || "";
  const priceSale = property?.financialDetails?.financialDetailsPrice;
  const priceLease = property?.financialDetails?.financialDetailsLeasePrice;
  const priceNight = property?.financialDetails?.financialDetailsPricePerNight;
  const currencyData = property?.financialDetails?.financialDetailsCurrency;
  const currencyCode = (typeof currencyData === 'object' ? currencyData?.code : currencyData) || '';

  useEffect(() => {
    if (!images.length) return;
    const int = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(int);
  }, [images.length]);

  const getShowcasePrice = () => {
    if (type === "Sale" && priceSale) return `${formatNumber(priceSale)} ${currencyCode}`;
    if (type === "Lease" && priceLease) return `${formatNumber(priceLease)} ${currencyCode} ${t.monthSuffix}`;
    if (type === "Home Stay" && priceNight) return `${formatNumber(priceNight)} ${currencyCode} ${t.nightSuffix}`;
    return t.contactForPrice;
  };

  const getLocalizedType = (typeVal) => {
    if (!typeVal) return "—";
    const lower = typeVal.toLowerCase();
    if (lower.includes("sale")) return t.sale;
    if (lower.includes("lease")) return t.lease;
    if (lower.includes("home") || lower.includes("stay")) return t.homeStay;
    return typeVal;
  };

  const getTypeColor = () => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('sale')) return "#FFE6E7";
    if (lower.includes('lease')) return "#DAFFF9";
    if (lower.includes('home') || lower.includes('stay')) return "#DEF6FE";
    return "#F2F2F2";
  };

  const handleShare = async () => {
    const shareData = {
      title: title || t.property,
      text: `${t.checkOutProperty} ${title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        CommonToaster(t.linkCopied, "success");
      } catch (err) {
        console.error("Failed to copy:", err);
        CommonToaster(t.failedCopy, "error");
      }
    }
  };

  return (
    <div className="bg-white md:h-[700px] flex flex-col lg:flex-row border-b">
      {/* LEFT: Text */}
      <div className="w-full lg:w-1/2 p-6 pl-12 flex flex-col justify-center gap-8 order-2 lg:order-1">
        <div>
          <div className="flex flex-wrap gap-3 mb-3">
            <span
              className="text-black text-md px-3 py-1 rounded-full font-semibold"
              style={{ backgroundColor: getTypeColor() }}
            >
              {t.for} {getLocalizedType(type)}
            </span>
            <span className="bg-[#F8F7F3] text-black text-md px-3 py-1 rounded-full font-semibold">
              {propertyType || "—"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug mb-4">
            {title || t.untitledProperty}
          </h1>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-700 border border-gray-300 px-3 py-2 rounded-full cursor-pointer w-fit hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            {t.share}
          </button>
        </div>

        <div>
          <p className="text-gray-700 mb-2">{t.price}:</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{getShowcasePrice()}</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Images */}
      <div className="w-full lg:w-2/3 relative order-1 lg:order-2">
        <div className="relative w-full h-[700px] overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={images[current]}
                alt={`property-img-${current}`}
                className="object-cover w-full h-[700px]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-[50vh] flex items-center justify-center bg-gray-200">
              <span className="text-gray-600">{t.noImages}</span>
            </div>
          )}
        </div>

        {/* Thumbnails (desktop) */}
        {images.length > 0 && (
          <div
            className="absolute lg:top-8 lg:right-4 hidden lg:flex flex-col gap-3 max-h-[calc(700px-4rem)] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 transparent'
            }}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${current === i ? "border-black scale-105" : "border-transparent hover:border-gray-300"}`}
              >
                <img src={img} alt={`thumb-${i}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
