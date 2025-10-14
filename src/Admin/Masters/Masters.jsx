import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function Masters({ openPropertyMaster, openCurrencyPage }) {
  const { language } = useLanguage();
  const t = translations[language];

  const items = [
    {
      name: language === "vi" ? "Bất động sản" : "Properties",
      onClick: openPropertyMaster,
    },
    {
      name: language === "vi" ? "Tiền tệ" : "Currency",
      onClick: openCurrencyPage,
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
      {/* Header */}
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">
        {language === "vi" ? "Quản lý chính" : "Masters"}
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className={`flex items-center justify-between bg-white rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all duration-300 ${item.name
                ? "cursor-pointer hover:scale-[1.02]"
                : "opacity-40 cursor-default"
              }`}
          >
            {/* Name */}
            <span className="text-gray-800 font-medium text-base">
              {item.name}
            </span>

            {/* Icon */}
            {item.name && (
              <div className="w-8 h-8 flex items-center justify-center border border-[#41398B] rounded-full hover:bg-[#41398B] hover:text-white transition-colors duration-200">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
