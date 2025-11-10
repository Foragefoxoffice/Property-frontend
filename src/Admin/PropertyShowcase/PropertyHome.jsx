import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Images, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PropertyShowcase({ property }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate()
  // ✅ Dynamic Images from backend
  const images = property?.imagesVideos?.propertyImages || [];

  // ✅ Transaction Type
  const type = property?.listingInformation?.listingInformationTransactionType?.en;
  const propertyType = property?.listingInformation?.listingInformationPropertyType?.en;
  const title = property?.listingInformation?.listingInformationPropertyTitle?.en;

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

  return (
    <div className="bg-white md:min-h-screen flex flex-col lg:flex-row">

      {/* LEFT CONTENT */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center gap-10 order-2 lg:order-1">

        {/* Tags */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">
              {type}
            </span>

            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {propertyType}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-semibold leading-snug mb-4">
            {title}
          </h2>

          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 border border-gray-400 px-3 py-2 rounded-full cursor-pointer w-fit">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* ✅ Dynamic PRICE */}
        <div>
          {type === "Sale" && (
            <>
              <p className="text-gray-700 mb-2">Price:</p>
              <p className="text-3xl font-bold">₫ {priceSale}</p>
            </>
          )}

          {type === "Lease" && (
            <>
              <p className="text-gray-700 mb-2">Monthly Rent:</p>
              <p className="text-3xl font-bold">₫ {priceLease}</p>
            </>
          )}

          {type === "Home Stay" && (
            <>
              <p className="text-gray-700 mb-2">Price / Night:</p>
              <p className="text-3xl font-bold">₫ {priceNight}</p>
            </>
          )}
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
              className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition ${current === i ? "border-black scale-105" : "border-transparent hover:border-gray-300"
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
              className={`w-24 h-20 rounded-lg border-2 transition ${current === i ? "border-black scale-105" : "border-transparent hover:border-gray-300"
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
