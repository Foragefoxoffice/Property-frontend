// PropertyHome.jsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { safeVal, safeArray, formatNumber } from "@/utils/display";
import { CommonToaster } from "@/Common/CommonToaster";

export default function PropertyHome({ property }) {
  const [current, setCurrent] = useState(0);

  // Safe extraction
  const images = safeArray(property?.imagesVideos?.propertyImages).filter(Boolean);
  const type = safeVal(property?.listingInformation?.listingInformationTransactionType) || "";
  const propertyType = safeVal(property?.listingInformation?.listingInformationPropertyType) || "";
  const title = safeVal(property?.listingInformation?.listingInformationPropertyTitle) || "";
  const priceSale = property?.financialDetails?.financialDetailsPrice;
  const priceLease = property?.financialDetails?.financialDetailsLeasePrice;
  const priceNight = property?.financialDetails?.financialDetailsPricePerNight;

  useEffect(() => {
    if (!images.length) return;
    const int = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(int);
  }, [images.length]);

  const getShowcasePrice = () => {
    if (type === "Sale" && priceSale) return `${formatNumber(priceSale)} ${property?.financialDetails?.financialDetailsCurrency}`;
    if (type === "Lease" && priceLease) return `${formatNumber(priceLease)} ${property?.financialDetails?.financialDetailsCurrency} / month`;
    if (type === "Home Stay" && priceNight) return `${formatNumber(priceNight)} ${property?.financialDetails?.financialDetailsCurrency} / night`;
    return "-";
  };

  const getTypeColor = () => {
    switch (type) {
      case "Sale": return "#FFE6E7";
      case "Lease": return "#DAFFF9";
      case "Home Stay": return "#DEF6FE";
      default: return "#F2F2F2";
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title || "Property",
      text: `Check out this property: ${title}`,
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
        CommonToaster("Link copied to clipboard", "success");
      } catch (err) {
        console.error("Failed to copy:", err);
        CommonToaster("Failed to copy link", "error");
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
              For {type || "—"}
            </span>
            <span className="bg-[#F8F7F3] text-black text-md px-3 py-1 rounded-full font-semibold">
              {propertyType || "—"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold leading-snug mb-4">
            {title || "Untitled property"}
          </h1>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-700 border border-gray-300 px-3 py-2 rounded-full cursor-pointer w-fit hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        <div>
          <p className="text-gray-700 mb-2">Price:</p>
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
              <span className="text-gray-600">No images available</span>
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
