import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

export default function CreatePropertyListStep3({
  onNext,
  onPrev,
  onChange,
  initialData = {},
}) {
  const [lang, setLang] = useState("en");

  const [form, setForm] = useState({
    owners: initialData.owners || [],
    propertyConsultant: initialData.propertyConsultant || {
      name: "",
      role: "Consultant",
    },
    internalNotes: initialData.internalNotes || { en: "", vi: "" },
  });

  // 🔄 Sync with parent on every change
  useEffect(() => {
    onChange && onChange(form);
  }, [form]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalizedChange = (lng, field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { en: "", vi: "" }), [lng]: value },
    }));
  };

  const labels = {
    en: {
      title: "Contact / Management Details",
      owner: "Owner / Landlord",
      consultant: "Property Consultant",
      notes: "Internal Notes",
      placeholderSelect: "Search and Select",
      placeholderType: "Type here",
    },
    vi: {
      title: "Chi Tiết Liên Hệ / Quản Lý",
      owner: "Chủ Sở Hữu / Người Cho Thuê",
      consultant: "Tư Vấn Viên Bất Động Sản",
      notes: "Ghi Chú Nội Bộ",
      placeholderSelect: "Tìm kiếm và chọn",
      placeholderType: "Nhập tại đây",
    },
  };
  const t = labels[lang];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Language Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {["en", "vi"].map((lng) => (
          <button
            key={lng}
            className={`px-6 py-2 text-sm font-medium ${
              lang === lng
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setLang(lng)}
          >
            {lng === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-6">{t.title}</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Owner Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.owner} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <input
            type="text"
            value={form.owners?.[0]?.name?.[lang] || ""}
            onChange={(e) => {
              const updatedOwners = [
                {
                  role: "Owner",
                  name: {
                    ...(form.owners?.[0]?.name || { en: "", vi: "" }),
                    [lang]: e.target.value,
                  },
                },
              ];
              handleInputChange("owners", updatedOwners);
            }}
            placeholder={t.placeholderType}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* Consultant Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.consultant}
          </label>
          <input
            type="text"
            value={form.propertyConsultant.name}
            onChange={(e) =>
              handleInputChange("propertyConsultant", {
                ...form.propertyConsultant,
                name: e.target.value,
              })
            }
            placeholder={t.placeholderType}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* Internal Notes */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t.notes} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.internalNotes?.[lang] || ""}
            onChange={(e) =>
              handleLocalizedChange(lang, "internalNotes", e.target.value)
            }
            placeholder={t.placeholderType}
            rows={3}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          ← Previous
        </button>
        <button
          onClick={() => onNext(form)}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
