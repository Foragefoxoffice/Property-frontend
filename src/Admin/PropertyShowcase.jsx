import React, { useState, useEffect } from "react";
import PropertyShowcase from "../Admin/PropertyShowcase/PropertyHome";
import PropertyDetailsSection from "./PropertyShowcase/PropertyDetailSection";

const PropertyShowcasePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data/component loading
    const timer = setTimeout(() => setLoading(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col relative items-center justify-center h-screen bg-white">
        {/* Loader Image */}
        <img
          src="/images/login/logo.png"
          alt="Loading..."
          className="w-40 h-40 object-contain mb-4 animate-pulse"
        />

        {/* Dots animation */}
        <div
          style={{ fontSize: 30 }}
          className="flex space-x-1 text-[#41398B] absolute top-[55%] text-2xl font-semibold"
        >
          <span className="animate-bounce rounded-full">•</span>
          <span className="animate-bounce delay-150">•</span>
          <span className="animate-bounce delay-300">•</span>
          <span className="animate-bounce delay-300">•</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PropertyShowcase />
      <PropertyDetailsSection />
    </div>
  );
};

export default PropertyShowcasePage;
