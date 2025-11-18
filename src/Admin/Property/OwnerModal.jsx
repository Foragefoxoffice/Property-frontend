import React, { useState } from "react";
import { Upload, X, CirclePlus } from "lucide-react";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { createOwner } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { Select } from "antd";

const uiText = {
  EN: {
    modalTitle: "New Landlord",
    ownerName: "Landlord Name",
    placeholderOwnerName: "Type Landlord Name",
    gender: "Gender",
    phone: "Phone Number",
    placeholderPhone: "Enter phone number",
    email: "Email Address",
    placeholderEmail: "Enter email address",
    social: "Social Media",
    iconPlaceholder: "Icon name",
    linkPlaceholder: "Social link (EN)",
    notes: "Notes",
    placeholderNotes: "Write notes...",
    submit: "Add Landlord",
  },
  VI: {
    modalTitle: "chủ nhà mới",
    ownerName: "Tên chủ nhà",
    placeholderOwnerName: "Nhập tên chủ nhà",
    gender: "Giới tính",
    phone: "Số điện thoại",
    placeholderPhone: "Nhập số điện thoại",
    email: "Địa chỉ Email",
    placeholderEmail: "Nhập Email",
    social: "Mạng xã hội",
    iconPlaceholder: "Tên biểu tượng",
    linkPlaceholder: "Liên kết MXH (VI)",
    notes: "Ghi chú",
    placeholderNotes: "Nhập ghi chú...",
    submit: "Thêm chủ nhà",
  },
};

const CustomSelect = ({ label, value, onChange, options, lang }) => {
  const { Option } = Select;

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <Select
        allowClear
        showSearch
        value={value || undefined}
        onChange={onChange}
        className="w-full h-11 custom-select"
        popupClassName="custom-dropdown"
        placeholder={lang === "VI" ? "Chọn" : "Select"}
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default function OwnerModal({ onClose }) {
  const { language } = useLanguage();

  const [activeLang, setActiveLang] = useState("EN");
  const text = uiText[activeLang];

  const [form, setForm] = useState({
    ownerName_en: "",
    ownerName_vi: "",
    ownerNotes_en: "",
    ownerNotes_vi: "",
    gender: "",
  });

  const [phoneRows, setPhoneRows] = useState([{ number: "" }]);
  const [emailRows, setEmailRows] = useState([{ email: "" }]);
  const [socialMedia, setSocialMedia] = useState([
    { iconName: "", link_en: "", link_vi: "" },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ownerName_en: form.ownerName_en,
      ownerName_vi: form.ownerName_vi,
      ownerNotes_en: form.ownerNotes_en,
      ownerNotes_vi: form.ownerNotes_vi,
      gender: form.gender,

      phoneNumbers: phoneRows.map((p) => p.number.trim()).filter(Boolean),
      emailAddresses: emailRows.map((e) => e.email.trim()).filter(Boolean),

      socialMedia_iconName: socialMedia.map((s) => s.iconName.trim()),
      socialMedia_link_en: socialMedia.map((s) => s.link_en.trim()),
      socialMedia_link_vi: socialMedia.map((s) => s.link_vi.trim()),
    };

    try {
      await createOwner(payload);
      CommonToaster("New Landlord created successfully", "success");
      onClose();
    } catch {
      CommonToaster("Failed to create Landlord", "error");
    }
  };

  const updateSocialRow = (i, key, val) => {
    const next = [...socialMedia];
    next[i][key] = val;
    setSocialMedia(next);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-99 overflow-y-auto py-12 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-[#41398B] p-2 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {text.modalTitle}
        </h2>

        {/* EN/VI Tabs */}
        <div className="flex border-b mb-6">
          {["EN", "VI"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-5 py-2 text-sm font-semibold cursor-pointer ${activeLang === lang
                  ? "border-b-2 border-[#41398B] text-black"
                  : "text-gray-500"
                }`}
            >
              {lang === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Landlord Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {text.ownerName}
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm"
              placeholder={text.placeholderOwnerName}
              value={form[`ownerName_${activeLang.toLowerCase()}`]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  [`ownerName_${activeLang.toLowerCase()}`]: e.target.value,
                }))
              }
            />
          </div>

          {/* Gender */}
          <CustomSelect
            label={text.gender}
            lang={activeLang}
            value={form.gender}
            onChange={(val) => setForm((p) => ({ ...p, gender: val }))}
            options={[
              { value: "Male", label: activeLang === "VI" ? "Nam" : "Male" },
              { value: "Female", label: activeLang === "VI" ? "Nữ" : "Female" },
              { value: "Other", label: activeLang === "VI" ? "Khác" : "Other" },
            ]}
          />

          {/* Phone Numbers */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {text.phone}
            </label>

            {phoneRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-2">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm"
                  placeholder={text.placeholderPhone}
                  value={row.number}
                  onChange={(e) => {
                    const next = [...phoneRows];
                    next[idx].number = e.target.value;
                    setPhoneRows(next);
                  }}
                />

                {idx === phoneRows.length - 1 ? (
                  <CirclePlus
                    className="cursor-pointer"
                    size={22}
                    onClick={() => setPhoneRows([...phoneRows, { number: "" }])}
                  />
                ) : (
                  <X
                    className="cursor-pointer"
                    size={20}
                    onClick={() =>
                      setPhoneRows(phoneRows.filter((_, i) => i !== idx))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Email Addresses */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {text.email}
            </label>

            {emailRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-2">
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm"
                  placeholder={text.placeholderEmail}
                  value={row.email}
                  onChange={(e) => {
                    const next = [...emailRows];
                    next[idx].email = e.target.value;
                    setEmailRows(next);
                  }}
                />

                {idx === emailRows.length - 1 ? (
                  <CirclePlus
                    className="cursor-pointer"
                    size={22}
                    onClick={() => setEmailRows([...emailRows, { email: "" }])}
                  />
                ) : (
                  <X
                    className="cursor-pointer"
                    size={20}
                    onClick={() =>
                      setEmailRows(emailRows.filter((_, i) => i !== idx))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Social Media */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {text.social}
            </label>

            {socialMedia.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-3">
                <input
                  type="text"
                  placeholder={text.iconPlaceholder}
                  value={row.iconName}
                  onChange={(e) =>
                    updateSocialRow(idx, "iconName", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-1/2"
                />

                <input
                  type="text"
                  placeholder={text.linkPlaceholder}
                  value={activeLang === "EN" ? row.link_en : row.link_vi}
                  onChange={(e) =>
                    updateSocialRow(
                      idx,
                      activeLang === "EN" ? "link_en" : "link_vi",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-1/2"
                />

                {idx === socialMedia.length - 1 ? (
                  <CirclePlus
                    className="cursor-pointer"
                    size={20}
                    onClick={() =>
                      setSocialMedia([
                        ...socialMedia,
                        { iconName: "", link_en: "", link_vi: "" },
                      ])
                    }
                  />
                ) : (
                  <X
                    className="cursor-pointer"
                    size={18}
                    onClick={() =>
                      setSocialMedia(socialMedia.filter((_, i) => i !== idx))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {text.notes}
            </label>
            <textarea
              rows="2"
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-full resize-none"
              placeholder={text.placeholderNotes}
              value={form[`ownerNotes_${activeLang.toLowerCase()}`]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  [`ownerNotes_${activeLang.toLowerCase()}`]: e.target.value,
                }))
              }
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 bg-[#41398B] hover:bg-[#41398be3] text-white py-3 rounded-full text-sm"
          >
            {text.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
