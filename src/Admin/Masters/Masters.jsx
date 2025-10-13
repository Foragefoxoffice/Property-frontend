import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Masters({ openPropertyMaster, openCurrencyPage }) {
  const items = [
    { name: "Properties", onClick: openPropertyMaster },
    { name: "Currency", onClick: openCurrencyPage },
    { name: "" },
  ];

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Masters</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className={`flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-300 ${item.name ? "cursor-pointer" : "opacity-40 cursor-default"
              }`}
          >
            <span className="text-gray-800 font-medium text-base">
              {item.name}
            </span>
            {item.name && (
              <div className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full hover:bg-black hover:text-white transition-colors duration-200">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
