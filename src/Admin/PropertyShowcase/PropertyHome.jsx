import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Images, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PropertyShowcase({ property }) {
  const [current, setCurrent] = useState(0);
  // ✅ Dynamic Images from backend
  const images = property?.imagesVideos?.propertyImages || [];

  // ✅ Transaction Type
  const type =
    property?.listingInformation?.listingInformationTransactionType?.en;
  const propertyType =
    property?.listingInformation?.listingInformationPropertyType?.en;
  const title =
    property?.listingInformation?.listingInformationPropertyTitle?.en;

  // ✅ Prices based on category
  const priceSale = property?.financialDetails?.financialDetailsPrice;
  const priceLease = property?.financialDetails?.financialDetailsLeasePrice;
  const priceNight = property?.financialDetails?.financialDetailsPricePerNight;

  // ✅ Auto slider
  useEffect(() => {
    if (!images.length) return;
    const int = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(int);
  }, [images]);

  // ✅ Format number with commas
  const formatNumber = (num) => {
    if (!num) return num;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatShowcasePrice = () => {
    if (type === "Sale") {
      return {
        amount: `₫ ${formatNumber(priceSale)}`,
        suffix: "",
      };
    }

    if (type === "Lease") {
      return {
        amount: `₫ ${formatNumber(priceLease)}`,
        suffix: "/month",
      };
    }

    if (type === "Home Stay") {
      return {
        amount: `$ ${formatNumber(priceNight)}`,
        suffix: "/per night",
      };
    }

    return { amount: "-", suffix: "" };
  };

  const { amount: showcaseAmount, suffix: showcaseSuffix } =
    formatShowcasePrice();

  const getTypeColor = () => {
    switch (type) {
      case "Sale":
        return "#FFE6E7";
      case "Lease":
        return "#DAFFF9";
      case "Home Stay":
        return "#DEF6FE";
      default:
        return "#F2F2F2";
    }
  };

  return (
    <div className="bg-white md:min-h-screen flex flex-col lg:flex-row">
      {/* LEFT CONTENT */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center gap-10 order-2 lg:order-1">
        {/* Tags */}
        <div>
          <div className="flex flex-wrap gap-3 mb-3">
            <span
              className="text-black text-md px-3 py-1 rounded-full font-semibold"
              style={{ backgroundColor: getTypeColor() }}
            >
              For {type}
            </span>
            <span className="bg-[#F8F7F3] text-black-600 text-md px-3 py-1 rounded-full font-semibold">
              {propertyType}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl font-semibold leading-snug mb-4">
            {title}
          </h2>

          <button className="flex items-center gap-2 text-black-500 hover:text-gray-700 border border-gray-400 px-3 py-2 rounded-full cursor-pointer w-fit">
            <Share2 className="w-6 h-8" />
          </button>
        </div>

        {/* ✅ Dynamic PRICE */}
        <div>
          <p className="text-gray-700 mb-2">Price:</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{showcaseAmount}</span>
            {showcaseSuffix && (
              <span className="text-gray-500 mb-1 text-sm">
                {showcaseSuffix}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-2/3 relative order-1 lg:order-2">
        <div className="relative w-full overflow-hidden max-h-[90vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              className="object-cover w-full h-[50vh] sm:h-[60vh] lg:h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>

          {/* Buttons */}
          <div className="absolute bottom-4 left-4 flex gap-3 z-10">
            <button className="bg-black text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:bg-gray-800">
              <Play className="w-4 h-4" /> Play Video
            </button>
            <button className="bg-gray-200 px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:bg-gray-300">
              <Images className="w-4 h-4" /> View Photos
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="absolute lg:top-8 lg:right-4 hidden lg:flex flex-col gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                current === i
                  ? "border-black scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img src={img} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>

        {/* Mobile thumbnails */}
        <div className="flex lg:hidden overflow-x-auto gap-3 p-3 bg-white border-t">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-24 h-20 rounded-lg border-2 transition ${
                current === i
                  ? "border-black scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img src={img} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
