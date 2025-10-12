import React, { useState, useEffect } from "react";
import { ChevronDown, Eye, X } from "lucide-react";
import { getAllOwners, getAllStaffs, getMe } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";

/* 🔹 Helper: Find matching ID by localized name */
function findIdByName(arr, valueObj) {
  if (!valueObj || typeof valueObj !== "object") return "";
  const valEn = valueObj.en || "";
  const valVi = valueObj.vi || "";
  const match = arr.find(
    (item) =>
      item.ownerName?.en === valEn ||
      item.ownerName?.vi === valVi ||
      item.staffsName?.en === valEn ||
      item.staffsName?.vi === valVi
  );
  return match ? match._id : "";
}

export default function CreatePropertyListStep3({
  onNext,
  onPrev,
  onChange,
  initialData = {},
}) {
  const [lang, setLang] = useState("en");
  const [owners, setOwners] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedConnect, setSelectedConnect] = useState(null);

  const [showOwnerView, setShowOwnerView] = useState(false);
  const [showConsultantView, setShowConsultantView] = useState(false);
  const [showConnectView, setShowConnectView] = useState(false);

  const [form, setForm] = useState({
    owner: initialData.owner || "",
    ownerNotes: initialData.ownerNotes || { en: "", vi: "" },
    consultant: initialData.consultant || "",
    connectingPoint: initialData.connectingPoint || "",
    connectingPointNotes: initialData.connectingPointNotes || {
      en: "",
      vi: "",
    },
    internalNotes: initialData.internalNotes || { en: "", vi: "" },
  });

  /* =========================================================
     🔹 Fetch Owners, Staffs & Logged-in User
  ========================================================= */
  const fetchData = async () => {
    try {
      const [ownersRes, staffsRes, meRes] = await Promise.all([
        getAllOwners(),
        getAllStaffs(),
        getMe(),
      ]);

      const ownersData = ownersRes.data.data || [];
      const staffsData = staffsRes.data.data || [];
      const userData = meRes?.data?.data || meRes?.data || {};

      setOwners(ownersData);
      setStaffs(staffsData);

      // ✅ Auto-fill Property Consultant with logged-in user
      if (userData?.name) {
        const nameEn =
          typeof userData.name === "object" ? userData.name.en : userData.name;
        const nameVi =
          typeof userData.name === "object" ? userData.name.vi : userData.name;

        setForm((prev) => ({
          ...prev,
          consultant: { en: nameEn, vi: nameVi },
        }));

        setSelectedConsultant({
          staffsName: { en: nameEn, vi: nameVi },
          staffsId: userData._id,
          staffsRole: userData.role?.name || "Consultant",
          staffsImage: userData.photo,
          staffsNumber: userData.phone || "-",
          staffsNotes: userData.notes || "",
        });
      }
    } catch (err) {
      console.error(err);
      CommonToaster("Failed to load data", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================================================
     🔹 Handle localized input fields
  ========================================================= */
  const handleLocalizedChange = (lng, field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { en: "", vi: "" }), [lng]: value },
    }));
  };

  /* =========================================================
     🌐 Translations
  ========================================================= */
  const t = {
    en: {
      title: "Contact / Management Details",
      owner: "Owner / Landlord",
      ownerNotes: "Owner Notes",
      consultant: "Property Consultant (You)",
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
      consultant: "Tư Vấn Viên Bất Động Sản (Bạn)",
      connectingPoint: "Điểm Liên Hệ",
      connectingPointNotes: "Ghi chú về Điểm Liên Hệ",
      internalNotes: "Ghi chú nội bộ",
      selectOwner: "Chọn Chủ Sở Hữu",
      selectConnect: "Chọn Điểm Liên Hệ",
      next: "Tiếp →",
      prev: "← Trước",
    },
  }[lang];

  /* =========================================================
     🧱 UI
  ========================================================= */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* 🌐 Language Tabs */}
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
        {/* 🏠 Owner / Landlord */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.owner}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={findIdByName(owners, form.owner)}
                onChange={(e) => {
                  const ownerId = e.target.value;
                  const selected = owners.find((o) => o._id === ownerId);
                  setSelectedOwner(selected);
                  setForm((prev) => ({
                    ...prev,
                    owner: selected
                      ? { en: selected.ownerName.en, vi: selected.ownerName.vi }
                      : { en: "", vi: "" },
                  }));
                }}
                className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
              >
                <option value="">{t.selectOwner}</option>
                {owners.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.ownerName?.[lang] || opt.ownerName?.en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            {selectedOwner && (
              <button
                onClick={() => setShowOwnerView(true)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Eye className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>

        {/* 📝 Owner Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.ownerNotes} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.ownerNotes?.[lang] || ""}
            onChange={(e) =>
              handleLocalizedChange(lang, "ownerNotes", e.target.value)
            }
            rows={3}
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 🔗 Connecting Point */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.connectingPoint}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={findIdByName(staffs, form.connectingPoint)}
                onChange={(e) => {
                  const staffId = e.target.value;
                  const selected = staffs.find((s) => s._id === staffId);
                  setSelectedConnect(selected);
                  setForm((prev) => ({
                    ...prev,
                    connectingPoint: selected
                      ? {
                          en: selected.staffsName.en,
                          vi: selected.staffsName.vi,
                        }
                      : { en: "", vi: "" },
                  }));
                }}
                className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
              >
                <option value="">{t.selectConnect}</option>
                {staffs.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.staffsName?.[lang] || s.staffsName?.en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            {selectedConnect && (
              <button
                onClick={() => setShowConnectView(true)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Eye className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>

        {/* 📝 Connecting Point Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.connectingPointNotes}
          </label>
          <textarea
            value={form.connectingPointNotes?.[lang] || ""}
            onChange={(e) =>
              handleLocalizedChange(
                lang,
                "connectingPointNotes",
                e.target.value
              )
            }
            rows={3}
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 👩‍💼 Property Consultant (auto-filled from getMe) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.consultant}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.consultant?.[lang] || ""}
              disabled
              className="border rounded-lg w-full px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        {/* 📝 Internal Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t.internalNotes}
          </label>
          <textarea
            value={form.internalNotes?.[lang] || ""}
            onChange={(e) =>
              handleLocalizedChange(lang, "internalNotes", e.target.value)
            }
            rows={3}
            className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      {/* 🔸 Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          {t.prev}
        </button>
        <button
          onClick={() => {
            onChange && onChange(form);
            onNext(form);
          }}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          {t.next}
        </button>
      </div>

      {/* 👁 Popups */}
      {showOwnerView && selectedOwner && (
        <PopupCard
          onClose={() => setShowOwnerView(false)}
          title="Owner / Landlord"
          data={{
            image: selectedOwner.ownerImage || selectedOwner.photo,
            name: selectedOwner.ownerName,
            type: selectedOwner.ownerType,
            number: selectedOwner.ownerNumber,
            facebook: selectedOwner.ownerFacebook,
            notes: selectedOwner.ownerNotes,
          }}
          lang={lang}
        />
      )}

      {showConsultantView && selectedConsultant && (
        <PopupCard
          onClose={() => setShowConsultantView(false)}
          title="Property Consultant"
          data={selectedConsultant}
          lang={lang}
        />
      )}

      {showConnectView && selectedConnect && (
        <PopupCard
          onClose={() => setShowConnectView(false)}
          title="Connecting Point"
          data={{
            image: selectedConnect.staffsImage,
            name: selectedConnect.staffsName,
            id: selectedConnect.staffsId,
            role: selectedConnect.staffsRole,
            number: selectedConnect.staffsNumber,
            notes: selectedConnect.staffsNotes,
          }}
          lang={lang}
        />
      )}
    </div>
  );
}

/* =========================================================
   🔹 Reusable PopupCard Component
========================================================= */
const PopupCard = ({ onClose, title, data, lang }) => {
  // ✅ Helper: extract localized or plain string safely
  const safeText = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object")
      return val[lang] || val.en || JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={
              data.image || "https://via.placeholder.com/100x100.png?text=👤"
            }
            alt={safeText(data.name)}
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <h3 className="text-xl font-semibold">{safeText(data.name)}</h3>
            {data.type && (
              <p className="text-gray-600 text-sm capitalize">
                {safeText(data.type)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          {data.id && (
            <p>
              <strong>ID:</strong> {safeText(data.id)}
            </p>
          )}
          {data.number && (
            <p>
              <strong>📞 Contact:</strong> {safeText(data.number)}
            </p>
          )}
          {data.facebook && (
            <p>
              <strong>🔗 Facebook:</strong>{" "}
              <a
                href={safeText(data.facebook)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {safeText(data.facebook)}
              </a>
            </p>
          )}
          {data.role && (
            <p>
              <strong>Role:</strong> {safeText(data.role)}
            </p>
          )}
          {data.notes && (
            <p>
              <strong>🗒 Notes:</strong> {safeText(data.notes) || "N/A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
