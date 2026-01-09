// PropertyShowcasePage.jsx
import React, { useState, useEffect } from "react";
import { getSingleListingByPropertyID } from "@/Api/action";
import { useParams } from "react-router-dom";
import PropertyHome from "./PropertyHome";
import PropertyDetailsSection from "./PropertyDetailSection";

import Loader from "@/components/Loader/Loader";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function PropertyShowcasePage() {
  const { id } = useParams(); // id is the property id in URL
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getSingleListingByPropertyID(id);
        // API may return success + data (object) or an array; handle both
        const payload = res?.data?.data ?? null;
        if (!payload) {
          // In some older endpoints it might return data as array -> take first
          const alt = res?.data ?? null;
          if (Array.isArray(alt) && alt.length) {
            if (mounted) setProperty(alt[0]);
          } else {
            if (mounted) setProperty(null);
          }
        } else {
          if (mounted) setProperty(payload);
        }
        if (mounted) console.log("Fetched property:", res?.data);
      } catch (err) {
        console.error("Error fetching property:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <Loader />;
  }
  if (!property) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t.propertyNotFound}</h2>
          <p className="text-gray-500">{t.noPropertyData} <strong>{id}</strong></p>
        </div>
      </div>
    );
  }

  // Render page with property data
  return (
    <>
      <Header />
      <div className="fade-in">

        <PropertyHome property={property} />
        <PropertyDetailsSection property={property} />
      </div>
      <Footer />
    </>
  );
}
