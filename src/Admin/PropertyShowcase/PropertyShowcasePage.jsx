import React, { useState, useEffect } from "react";
import PropertyDetailsSection from "./PropertyDetailSection";
import { getSingleListingByPropertyID } from "@/Api/action";
import { useParams } from "react-router-dom";
import PropertyHome from "./PropertyHome";

const PropertyShowcasePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSingleListingByPropertyID(id);
        console.log("🏠 Fetched property data:", res.data.data);
        setProperty(res.data.data);
      } catch (err) {
        console.error("❌ Error fetching property:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col relative items-center justify-center h-screen bg-white">
        <img
          src="/images/login/logo.png"
          alt="Loading..."
          className="w-40 h-40 object-contain mb-4 animate-pulse"
        />

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
      <PropertyHome property={property} />
      <PropertyDetailsSection property={property} />
    </div>
  );
};

export default PropertyShowcasePage;
