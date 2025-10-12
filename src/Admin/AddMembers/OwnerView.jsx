import React, { useEffect, useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";
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
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading owner details...
      </div>
    );

  if (!owner)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Owner not found.
      </div>
    );

  const { ownerName, ownerNumber, ownerNotes, ownerType, photo } = owner;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {ownerName?.en || "Owner Details"}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8 border border-gray-100">
          {/* Photo */}
          <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
            <img
              src={
                photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt={ownerName?.en}
              className="w-48 h-48 rounded-2xl object-cover bg-[#e7e4fb]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-gray-800">
            <h2 className="text-lg font-semibold mb-1">
              {ownerName?.en || "Unnamed Owner"}
            </h2>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Phone size={16} />
              <span className="text-sm">
                {ownerNumber?.en || "+84 00000 00000"}
              </span>
            </div>

            <h3 className="font-medium text-gray-800 mb-1">Notes</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {ownerNotes?.en ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis aliquam justo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum eleifend at libero aliquet porta. Sed eros eros, consectetur sed arcu quis, hendrerit rutrum tortor."}
            </p>

            <p className="text-sm text-gray-800">
              <span className="font-medium">Role:</span>{" "}
              <span className="text-gray-700">
                {ownerType?.en || "Consultant"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
