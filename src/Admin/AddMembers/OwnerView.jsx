import React, { useEffect, useState } from "react";
import { ArrowLeft, PhoneCall, Facebook } from "lucide-react";
import { getAllOwners } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";

export default function OwnerView({ ownerId, goBack }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await getAllOwners();
        const foundOwner = res.data.data.find((o) => o._id === ownerId);
        if (!foundOwner) {
          CommonToaster("Owner not found", "error");
          goBack();
          return;
        }
        setOwner(foundOwner);
      } catch (err) {
        console.error(err);
        CommonToaster("Failed to fetch owner details", "error");
      } finally {
        setLoading(false);
      }
    };
    if (ownerId) fetchOwner();
  }, [ownerId]);

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
            {/* Facebook Icon */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-200"></div>

            {/* Photo Skeleton */}
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              <div>
                <div className="w-44 h-44 rounded-xl bg-gray-200"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>

            {/* Info Skeleton */}
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
        Owner not found.
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

  // ✅ Default avatar (replace with your actual path)
  const defaultImage = "/images/dummy-img.jpg";

  // ✅ Build Facebook link properly
  let facebookLink = "";
  const fbUsername = ownerFacebook?.en?.trim();
  if (fbUsername) {
    if (fbUsername.startsWith("http")) {
      facebookLink = fbUsername;
    } else {
      facebookLink = `https://facebook.com/${fbUsername}`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {ownerName?.en || "Owner Details"}
          </h1>
        </div>

        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row gap-8 border border-gray-100">
          {/* Facebook Icon */}
          {facebookLink ? (
            <a
              href={facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 bg-white border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <Facebook className="text-gray-700" size={20} />
            </a>
          ) : (
            <div className="absolute top-4 right-4 bg-gray-100 border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full opacity-60 cursor-not-allowed">
              <Facebook className="text-gray-400" size={20} />
            </div>
          )}

          {/* Photo */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            <div>
              <div className="w-44 h-44 rounded-xl overflow-hidden bg-[#e7e4fb] flex items-center justify-center">
                <img
                  src={photo || defaultImage}
                  alt={ownerName?.en || "Owner"}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-800 mt-4">
                <span className="font-medium">Type:</span>{" "}
                <span className="text-gray-700">
                  {ownerType?.en || "Owner"}
                </span>
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-gray-800">
            <h2 className="text-lg font-semibold mb-1">
              {ownerName?.en || "Unnamed Owner"}
            </h2>

            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <PhoneCall size={16} />
              <span className="text-sm">
                {ownerNumber?.en || "+84 00000 00000"}
              </span>
            </div>

            <h3 className="font-medium text-gray-800 mb-1">Notes</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {ownerNotes?.en ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis aliquam justo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum eleifend at libero aliquet porta. Sed eros eros, consectetur sed arcu quis, hendrerit rutrum tortor."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
