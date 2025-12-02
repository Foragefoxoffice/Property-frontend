import React, { useEffect, useState } from "react";
import { ArrowLeft, PhoneCall, Facebook } from "lucide-react";
import { getAllOwners } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useParams, useNavigate } from "react-router-dom";

export default function OwnerView() {
  const { language } = useLanguage();
  const t = translations[language];
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await getAllOwners();
        const foundOwner = res.data.data.find((o) => o._id === id);
        if (!foundOwner) {
          CommonToaster(language === "vi" ? "Không tìm thấy chủ sở hữu" : "Owner not found", "error");
          navigate(-1);
          return;
        }
        setOwner(foundOwner);
      } catch {
        CommonToaster(language === "vi" ? "Không thể tải chi tiết chủ sở hữu" : "Failed to fetch owner details", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOwner();
  }, [id, language]);


  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
        <div className="w-full max-w-3xl animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-gray-200"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>

          {/* Card Skeleton */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row gap-8 border border-gray-100">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              <div>
                <div className="w-44 h-44 rounded-xl bg-gray-200"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-11/12 bg-gray-200 rounded"></div>
                <div className="h-3 w-10/12 bg-gray-200 rounded"></div>
                <div className="h-3 w-9/12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (!owner)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        {language === "vi" ? "Không tìm thấy chủ sở hữu." : "Owner not found."}
      </div>
    );

  const {
    ownerName,
    ownerNumber,
    ownerNotes,
    ownerType,
    ownerFacebook,
    photo,
  } = owner;

  const defaultImage = "/dummy-img.jpg";

  // Build Facebook link properly
  let facebookLink = "";
  const fbUsername = ownerFacebook?.[language]?.trim();
  if (fbUsername) {
    facebookLink = fbUsername.startsWith("http")
      ? fbUsername
      : `https://facebook.com/${fbUsername}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white cursor-pointer transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {language === "vi"
              ? ownerName?.vi || "Chi tiết chủ sở hữu"
              : ownerName?.en || "Owner Details"}
          </h1>
        </div>

        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-md px-6 py-8 border border-gray-100 flex gap-6">

          {/* LEFT SIDE – Owner Info */}
          <div className="flex-1">

            {/* ✅ NAME */}
            <h2 className="text-lg font-semibold text-gray-800">
              {owner.ownerName?.[language] || owner.ownerName?.en || "Unnamed Owner"}
            </h2>

            {/* ✅ ALL PHONE NUMBERS */}
            {owner.phoneNumbers?.length > 0 &&
              owner.phoneNumbers.map((num, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 mt-3">
                  <PhoneCall size={16} />
                  <span className="text-sm">{num || "-"} </span>
                </div>
              ))}

            {/* ✅ ALL EMAIL ADDRESSES */}
            {owner.emailAddresses?.length > 0 &&
              owner.emailAddresses.map((email, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-sm">{email || "-"}</span>
                </div>
              ))}

            {/* ✅ NOTES */}
            <h3 className="font-medium text-gray-800 mt-5">
              {language === "vi" ? "Ghi chú" : "Notes"}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-line">
              {owner.ownerNotes?.[language] ||
                owner.ownerNotes?.en ||
                (language === "vi"
                  ? "Không có ghi chú nào cho chủ sở hữu này."
                  : "No notes available for this owner.")}
            </p>
          </div>

          {/* RIGHT SIDE – ALL SOCIAL ICONS */}
          <div className="flex flex-col items-end gap-3">

            {owner.socialMedia_iconName?.length > 0 &&
              owner.socialMedia_iconName.map((icon, i) => {
                const link =
                  owner.socialMedia_link_en?.[i] ||
                  owner.socialMedia_link_vi?.[i] ||
                  "";

                const finalLink = link.startsWith("http") ? link : `https://${link}`;

                return (
                  <a
                    key={i}
                    href={finalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition"
                  >
                    <Facebook size={20} className="text-gray-700" />
                  </a>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
