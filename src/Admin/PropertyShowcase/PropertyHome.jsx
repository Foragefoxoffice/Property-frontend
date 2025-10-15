import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Images, Share2 } from "lucide-react";

const images = [
  "/images/property/property1.jpg",
  "/images/property/property2.jpg",
  "/images/property/property3.jpg",
  "/images/property/property4.jpg",
  "/images/property/property5.jpg",
];

export default function PropertyShowcase() {
  const [current, setCurrent] = useState(0);

  // Auto-play logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white md:min-h-screen  flex flex-col lg:flex-row">
      {/* LEFT SECTION (desktop left, mobile bottom) */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center gap-0 md:gap-20 order-2 lg:order-1">
        {/* Top info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
              For Sale
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              Apartment
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-3 leading-snug">
            Modern 2BR Apartment in Ecopark
          </h2>

          <button className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700 border border-gray-400 p-2 rounded-full cursor-pointer w-fit">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Price info */}
        <div>
          <div className="text-gray-700 text-base sm:text-lg font-medium mb-2">
            Price:
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            ₫ 25,000,000
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (desktop right, mobile top) */}
      <div className="w-full lg:w-2/3 relative order-1 lg:order-2">
        {/* Main image */}
        <div className="relative w-full overflow-hidden rounded-none lg:rounded-lg max-h-[90vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              alt="Property"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="object-cover w-full h-[50vh] sm:h-[60vh] lg:h-screen"
            />
          </AnimatePresence>
          {/* Bottom Buttons */}
          <div className="flex gap-3 mt-6 px-3 md:px-0 absolute bottom-4 left-4 z-10">
            <button className="bg-black text-white text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800">
              <Play className="w-4 h-4" /> Play Video
            </button>
            <button className="bg-gray-200 text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-300">
              <Images className="w-4 h-4" /> View All Photo
            </button>
          </div>
        </div>

        {/* Thumbnail Slider (desktop: vertical | mobile: horizontal) */}
        <div className="absolute lg:top-8 lg:right-4 lg:flex lg:flex-col lg:gap-3 hidden lg:block">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-20 h-16 border-2 rounded-lg overflow-hidden transition-all ${
                current === i
                  ? "border-black scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>

        {/* Mobile thumbnail slider */}
        <div className="flex lg:hidden overflow-x-auto gap-3 px-4 py-3 bg-white border-t border-gray-200">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-24 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                current === i
                  ? "border-black scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
