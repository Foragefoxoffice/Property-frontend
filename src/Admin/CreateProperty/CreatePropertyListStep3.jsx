import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CreatePropertyListStep3({ onNext, onPrev, initialData = {} }) {
    const [lang, setLang] = useState("en");
    const [form, setForm] = useState({
        ownerId: "",
        ownerName: "",
        consultantId: "",
        notes: "",
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const labels = {
        en: {
            title: "Contact / Management Details",
            ownerLandlordSelect: "Owners / Landlord",
            ownerLandlordText: "Owner / Landlord",
            consultant: "Property Consultant",
            notes: "Internal Notes",
            placeholderSelect: "Search and Select",
            placeholderType: "Type here",
        },
        vi: {
            title: "Chi Tiết Liên Hệ / Quản Lý",
            ownerLandlordSelect: "Chủ Sở Hữu / Người Cho Thuê",
            ownerLandlordText: "Chủ Sở Hữu / Người Cho Thuê",
            consultant: "Tư Vấn Viên Bất Động Sản",
            notes: "Ghi Chú Nội Bộ",
            placeholderSelect: "Tìm kiếm và chọn",
            placeholderType: "Nhập tại đây",
        },
    };

    const t = labels[lang];

    const Select = ({ label, name, required }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    name={name}
                    value={form[name] || ""}
                    onChange={(e) => handleChange(name, e.target.value)}
                    className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
                >
                    <option value="">{t.placeholderSelect}</option>
                    <option value="id1">John Doe</option>
                    <option value="id2">Jane Smith</option>
                    <option value="id3">Michael Nguyen</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );

    const Textarea = ({ label, name, required }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                name={name}
                value={form[name] || ""}
                onChange={(e) => handleChange(name, e.target.value)}
                placeholder={t.placeholderType}
                rows={4}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Language Toggle */}
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    className={`px-6 py-2 text-sm font-medium ${lang === "en"
                        ? "border-b-2 border-black text-black"
                        : "text-gray-500 hover:text-black"
                        }`}
                    onClick={() => setLang("en")}
                >
                    English (EN)
                </button>
                <button
                    className={`px-6 py-2 text-sm font-medium ${lang === "vi"
                        ? "border-b-2 border-black text-black"
                        : "text-gray-500 hover:text-black"
                        }`}
                    onClick={() => setLang("vi")}
                >
                    Tiếng Việt (VI)
                </button>
            </div>

            {/* Section Title */}
            <h2 className="text-lg font-semibold mb-6">{t.title}</h2>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
                <Select
                    label={t.ownerLandlordSelect}
                    name="ownerId"
                    required
                />
                <Textarea
                    label={t.ownerLandlordText}
                    name="ownerName"
                    required
                />
                <Select
                    label={t.consultant}
                    name="consultantId"
                    required
                />
                <Textarea
                    label={t.notes}
                    name="notes"
                    required
                />
            </div>
            <div className="mt-10 flex justify-between">
                <button
                    onClick={() => onPrev()}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-full"
                >
                    ← Previous
                </button>
                <button
                    onClick={() =>
                        onNext({
                            contactManagement: {
                                ownersLandlord: { en: form.ownerId, vi: form.ownerId },
                                ownerLandlordText: { en: form.ownerName, vi: form.ownerName },
                                propertyConsultant: { en: form.consultantId, vi: form.consultantId },
                                internalNotes: { en: form.notes, vi: form.notes },
                            },
                        })
                    }
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                    Submit
                </button>
            </div>

        </div>
    );
}
