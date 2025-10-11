import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CreatePropertyListStep3({
  onNext,
  onPrev,
  onChange,
  initialData = {},
}) {
  const [lang, setLang] = useState("en");

  const [form, setForm] = useState({
    owner: initialData.owner || "",
    ownerNotes: initialData.ownerNotes || { en: "", vi: "" },
    consultant: initialData.consultant || { en: "", vi: "" },
    connectingPoint: initialData.connectingPoint || { en: "", vi: "" },
    connectingPointNotes: initialData.connectingPointNotes || { en: "", vi: "" },
    internalNotes: initialData.internalNotes || { en: "", vi: "" },
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);


  useEffect(() => {
    onChange && onChange(form);
  }, [form]);

  const handleLocalizedChange = (lng, field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { en: "", vi: "" }), [lng]: value },
    }));
  };

  const t = {
    en: {
      title: "Contact / Management Details",
      owner: "Owner / Landlord",
      ownerNotes: "Owner Notes",
      consultant: "Property Consultant",
      connectingPoint: "Connecting Point",
      connectingPointNotes: "Connecting Point Notes",
      internalNotes: "Internal Notes",
      selectOwner: "Select Owner",
      selectConnect: "Select Connecting Point",
      next: "Next →",
      prev: "← Previous",
    },
    vi: {
      title: "Chi Tiết Liên Hệ / Quản Lý",
      owner: "Chủ Sở Hữu / Người Cho Thuê",
      ownerNotes: "Ghi chú của Chủ Sở Hữu",
      consultant: "Tư Vấn Viên Bất Động Sản",
      connectingPoint: "Điểm Liên Hệ",
      connectingPointNotes: "Ghi chú về Điểm Liên Hệ",
      internalNotes: "Ghi chú nội bộ",
      selectOwner: "Chọn Chủ Sở Hữu",
      selectConnect: "Chọn Điểm Liên Hệ",
      next: "Tiếp →",
      prev: "← Trước",
    },
  }[lang];

  const ownerOptions = [
    { id: "owner1", name: { en: "John Smith", vi: "John Smith" } },
    { id: "owner2", name: { en: "Jane Doe", vi: "Jane Doe" } },
    { id: "owner3", name: { en: "Mr. Nguyen Van A", vi: "Nguyễn Văn A" } },
  ];

  const connectingPointOptions = [
    { id: "email", name: { en: "Email", vi: "Thư điện tử" } },
    { id: "phone", name: { en: "Phone Call", vi: "Cuộc gọi điện thoại" } },
    { id: "meeting", name: { en: "In-person Meeting", vi: "Gặp trực tiếp" } },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* 🌐 Language Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {["en", "vi"].map((lng) => (
          <button
            key={lng}
            className={`px-6 py-2 text-sm font-medium ${lang === lng
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
        {/* 🏠 Owner / Landlord (Select - Common) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.owner}
          </label>
          <div className="relative">
            <select
              value={form.owner}
              onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
              className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
            >
              <option value="">{t.selectOwner}</option>
              {ownerOptions.map((opt) => (
                <option key={opt.id} value={opt.name[lang]}>
                  {opt.name[lang]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 📝 Owner Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.ownerNotes} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.ownerNotes?.[lang] || ""}
            onChange={(e) => handleLocalizedChange(lang, "ownerNotes", e.target.value)}
            rows={3}
            placeholder={
              lang === "en" ? "Type here..." : "Nhập ghi chú của chủ sở hữu..."
            }
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 🔗 Connecting Point (Select) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.connectingPoint} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <div className="relative">
            <select
              value={form.connectingPoint?.[lang] || ""}
              onChange={(e) =>
                handleLocalizedChange(lang, "connectingPoint", e.target.value)
              }
              className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
            >
              <option value="">{t.selectConnect}</option>
              {connectingPointOptions.map((opt) => (
                <option key={opt.id} value={opt.name[lang]}>
                  {opt.name[lang]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 📝 Connecting Point Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.connectingPointNotes} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.connectingPointNotes?.[lang] || ""}
            onChange={(e) =>
              handleLocalizedChange(lang, "connectingPointNotes", e.target.value)
            }
            rows={3}
            placeholder={
              lang === "en" ? "Type here..." : "Nhập ghi chú về điểm liên hệ..."
            }
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 👩‍💼 Property Consultant */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.consultant} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <input
            type="text"
            value={form.consultant?.[lang] || ""}
            onChange={(e) => handleLocalizedChange(lang, "consultant", e.target.value)}
            placeholder={lang === "en" ? "Type here..." : "Nhập tại đây..."}
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 📝 Internal Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.internalNotes} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.internalNotes?.[lang] || ""}
            onChange={(e) =>
              handleLocalizedChange(lang, "internalNotes", e.target.value)
            }
            rows={3}
            placeholder={lang === "en" ? "Type here..." : "Nhập ghi chú nội bộ..."}
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          {t.prev}
        </button>
        <button
          onClick={() => onNext(form)}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}
