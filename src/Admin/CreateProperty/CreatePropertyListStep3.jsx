import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  UserCog,
  X,
} from "lucide-react";
import { getAllOwners, getAllStaffs, getMe } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { Select as AntdSelect } from "antd";

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

/* 💜 Skeleton Loader (uses bg-[#41398b29]) */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-64 mb-8"></div>
    {[...Array(4)].map((_, idx) => (
      <div key={idx} className="mb-8">
        <div className="h-4 bg-[#41398b29] rounded w-48 mb-3"></div>
        <div className="h-12 bg-[#41398b29] rounded w-full"></div>
      </div>
    ))}
    <div className="flex justify-between mt-10">
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
    </div>
  </div>
);

export default function CreatePropertyListStep3({
  onNext,
  onPrev,
  onChange,
  onSave,
  initialData = {},
}) {
  const [lang, setLang] = useState("en");
  const [owners, setOwners] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedConnect, setSelectedConnect] = useState(null);

  const [showOwnerView, setShowOwnerView] = useState(false);
  const [showConsultantView, setShowConsultantView] = useState(false);
  const [showConnectView, setShowConnectView] = useState(false);
  const [getUserData, setGetUserData] = useState("Admin");

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

  /* ✅ Sync form when editing existing property */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const cm = initialData.contactManagement || {};

      const updatedForm = {
        owner: initialData.owner ||
          cm.contactManagementOwner || { en: "", vi: "" },
        ownerNotes: initialData.ownerNotes ||
          cm.contactManagementOwnerNotes || { en: "", vi: "" },
        consultant: initialData.consultant ||
          cm.contactManagementConsultant || { en: "", vi: "" },
        connectingPoint: initialData.connectingPoint ||
          cm.contactManagementConnectingPoint || { en: "", vi: "" },
        connectingPointNotes: initialData.connectingPointNotes ||
          cm.contactManagementConnectingPointNotes || { en: "", vi: "" },
        internalNotes: initialData.internalNotes ||
          cm.contactManagementInternalNotes || { en: "", vi: "" },
      };

      setForm((prev) => ({ ...prev, ...updatedForm }));

      // ✅ Auto-set selectedOwner and selectedConnect
      if (owners.length > 0 && updatedForm.owner?.en) {
        const matchOwner = owners.find(
          (o) =>
            o.ownerName?.en === updatedForm.owner.en ||
            o.ownerName?.vi === updatedForm.owner.vi
        );
        if (matchOwner) setSelectedOwner(matchOwner);
      }

      if (staffs.length > 0 && updatedForm.connectingPoint?.en) {
        const matchStaff = staffs.find(
          (s) =>
            s.staffsName?.en === updatedForm.connectingPoint.en ||
            s.staffsName?.vi === updatedForm.connectingPoint.vi
        );
        if (matchStaff) setSelectedConnect(matchStaff);
      }
    }
  }, [initialData, owners, staffs]);

  useEffect(() => {
    getMeData();
  }, []);

  const getMeData = async () => {
    try {
      const response = await getMe();
      setGetUserData(response?.data?.data || "");
    } catch (error) {
      console.log("Userdata", error);
    }
  };

  /* =========================================================
     🔹 Fetch Owners, Staffs & Logged-in User
  ========================================================= */
  const fetchData = async () => {
    try {
      const [ownersRes, staffsRes, meRes] = await Promise.all([
        getAllOwners(),
        getAllStaffs(),
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
    } finally {
      setLoading(false);
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
      consultant: "Created By (You)",
      connectingPoint: "Connecting Point",
      connectingPointNotes: "Connecting Point Notes",
      internalNotes: "Internal Notes",
      selectOwner: "Select Owner",
      selectConnect: "Select Connecting Point",
      next: "Next",
      typehere: "Type here",
      prev: "Previous",
    },
    vi: {
      title: "Chi Tiết Liên Hệ / Quản Lý",
      owner: "Chủ Sở Hữu / Người Cho Thuê",
      ownerNotes: "Ghi chú của Chủ Sở Hữu",
      consultant: "Được tạo bởi (Bạn)",
      connectingPoint: "Điểm Liên Hệ",
      connectingPointNotes: "Ghi chú về Điểm Liên Hệ",
      internalNotes: "Ghi chú nội bộ",
      selectOwner: "Chọn Chủ Sở Hữu",
      selectConnect: "Chọn Điểm Liên Hệ",
      typehere: "Nhập tại đây",
      next: "Tiếp",
      prev: "Trước",
    },
  }[lang];

  /* 🩶 Show Loader while fetching */
  if (loading) return <SkeletonLoader />;

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
                ? "border-b-2 border-[#41398B] text-black"
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
          <div className="flex flex-wrap gap-4 items-baseline">
            {/* 🧩 Owner Select Section */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm text-[#131517] font-semibold">
                {t.owner}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 mt-2">
                  <AntdSelect
                    showSearch
                    allowClear
                    placeholder={t.selectOwner}
                    value={findIdByName(owners, form.owner) || undefined}
                    onChange={(ownerId) => {
                      const selected = owners.find((o) => o._id === ownerId);
                      setSelectedOwner(selected);
                      setForm((prev) => ({
                        ...prev,
                        owner: selected
                          ? {
                              en: selected.ownerName?.en || "",
                              vi: selected.ownerName?.vi || "",
                            }
                          : { en: "", vi: "" },
                      }));
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    className="w-full custom-select focus:ring-2 focus:ring-gray-300"
                    popupClassName="custom-dropdown"
                    options={owners.map((opt) => ({
                      label:
                        opt.ownerName?.[lang] || opt.ownerName?.en || "Unnamed",
                      value: opt._id,
                    }))}
                  />
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

            {/* 🧩 Source Input Section */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm text-[#131517] font-semibold mb-2 block">
                {lang === "en" ? "Source" : "Nguồn"} (
                {lang === "en" ? "English" : "Tiếng Việt"})
              </label>
              <input
                type="text"
                value={form.source?.[lang] || ""}
                placeholder={t.typehere}
                onChange={(e) =>
                  handleLocalizedChange(lang, "source", e.target.value)
                }
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 📝 Owner Notes */}
        <div>
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.ownerNotes} ({lang === "en" ? "English" : "Tiếng Việt"})
          </label>
          <textarea
            value={form.ownerNotes?.[lang] || ""}
            placeholder={t.typehere}
            onChange={(e) =>
              handleLocalizedChange(lang, "ownerNotes", e.target.value)
            }
            rows={3}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 🔗 Connecting Point */}
        <div>
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.connectingPoint}
          </label>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <AntdSelect
                showSearch
                allowClear
                placeholder={t.selectConnect}
                value={findIdByName(staffs, form.connectingPoint) || undefined}
                onChange={(staffId) => {
                  const selected = staffs.find((s) => s._id === staffId);
                  setSelectedConnect(selected);
                  setForm((prev) => ({
                    ...prev,
                    connectingPoint: selected
                      ? {
                          en: selected.staffsName?.en || "",
                          vi: selected.staffsName?.vi || "",
                        }
                      : { en: "", vi: "" },
                  }));
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full custom-select focus:ring-2 focus:ring-gray-300"
                popupClassName="custom-dropdown"
                options={staffs.map((s) => ({
                  label: s.staffsName?.[lang] || s.staffsName?.en || "Unnamed",
                  value: s._id,
                }))}
              />
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
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.connectingPointNotes}
          </label>
          <textarea
            value={form.connectingPointNotes?.[lang] || ""}
            placeholder={t.typehere}
            onChange={(e) =>
              handleLocalizedChange(
                lang,
                "connectingPointNotes",
                e.target.value
              )
            }
            rows={3}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* 👩‍💼 Property Consultant (auto-filled from getMe) */}
        <div className="flex gap-4 items-baseline">
          <div className="w-full">
            <label className="text-sm text-[#131517] font-semibold mb-3">
              {t.consultant}
            </label>
            <div className="flex items-center gap-2">
              {getUserData ? (
                <input
                  type="text"
                  value={getUserData.name}
                  disabled
                  className="border mt-2 border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
                />
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className="text-sm text-[#131517] font-semibold mb-3">
              {lang === "en" ? "Agent Fee" : "Phí Môi Giới"}
            </label>
            <input
              type="number"
              value={form.agentFee || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, agentFee: e.target.value }))
              }
              placeholder={t.typehere}
              className="border mt-2 border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>
        </div>

        {/* 📝 Internal Notes */}
        <div>
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.internalNotes}
          </label>
          <textarea
            value={form.internalNotes?.[lang] || ""}
            placeholder={t.typehere}
            onChange={(e) =>
              handleLocalizedChange(lang, "internalNotes", e.target.value)
            }
            rows={3}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      {/* 🔸 Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 gap-1.5 rounded-full hover:bg-gray-100 flex items-center cursor-pointer"
        >
          <ArrowLeft size={18} /> {t.prev}
        </button>
        <button
          onClick={() => {
            const payload = {
              contactManagement: {
                contactManagementOwner: form.owner || { en: "", vi: "" },
                contactManagementOwnerNotes: form.ownerNotes || {
                  en: "",
                  vi: "",
                },
                contactManagementConsultant: form.consultant || {
                  en: "",
                  vi: "",
                },
                contactManagementConnectingPoint: form.connectingPoint || {
                  en: "",
                  vi: "",
                },
                contactManagementConnectingPointNotes:
                  form.connectingPointNotes || { en: "", vi: "" },
                contactManagementInternalNotes: form.internalNotes || {
                  en: "",
                  vi: "",
                },
                contactManagementSource: form.source || { en: "", vi: "" },
                contactManagementAgentFee: parseFloat(form.agentFee) || 0,
              },
            };

            // 🔹 Pass data directly (not just trigger save)
            onChange && onChange(payload);
            onSave && onSave(payload);
          }}
          className="px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full items-center flex gap-1 cursor-pointer"
        >
          {t.next} <ArrowRight size={18} />
        </button>
      </div>

      {/* 👁 Popups */}
      {showOwnerView && selectedOwner && (
        <OwnerPopupCard
          onClose={() => setShowOwnerView(false)}
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
        <StaffPopupCard
          onClose={() => setShowConsultantView(false)}
          data={selectedConsultant}
          lang={lang}
          title="Property Consultant"
        />
      )}

      {showConnectView && selectedConnect && (
        <StaffPopupCard
          onClose={() => setShowConnectView(false)}
          data={selectedConnect}
          lang={lang}
          title="Connecting Point"
        />
      )}
    </div>
  );
}

const StaffPopupCard = ({ onClose, data, lang, title }) => {
  const safeText = (val) =>
    typeof val === "object" ? val?.[lang] || val?.en || "" : val || "";

  const { image, name, id, role, number, email, notes } = {
    image: data.staffsImage || data.image,
    name: data.staffsName || data.name,
    id: data.staffsId || data.id,
    role: data.staffsRole || data.role,
    number: data.staffsNumber || data.number,
    email: data.staffsEmail || data.email,
    notes: data.staffsNotes || data.notes,
  };

  const defaultImage = "/dummy-img.jpg";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {safeText(name) || title || "Staff Details"}
        </h2>

        {/* Card */}
        <div className="relative bg-white rounded-2xl border border-gray-300 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
          {/* Photo */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            <div>
              <div className="w-44 h-44 rounded-xl overflow-hidden bg-[#e7e4fb] flex items-center justify-center">
                <img
                  src={image || defaultImage}
                  alt={safeText(name) || "Staff"}
                  className="w-full h-full object-cover"
                />
              </div>
              {id && (
                <p className="text-sm text-gray-800 mt-4">
                  <span className="font-medium">Staff ID:</span>{" "}
                  <span className="text-gray-700">{safeText(id)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-gray-800">
            <h2 className="text-lg font-semibold mb-1">
              {safeText(name) || "Unnamed Staff"}
            </h2>

            {role && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <UserCog size={16} />
                <span className="text-sm">{safeText(role)}</span>
              </div>
            )}

            {number && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Phone size={16} />
                <span className="text-sm">{safeText(number)}</span>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Mail size={16} />
                <span className="text-sm">{safeText(email)}</span>
              </div>
            )}

            {notes && (
              <>
                <h3 className="font-medium text-gray-800 mb-1">Notes</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {safeText(notes) || "No notes available for this staff."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   🔹 Owner Popup (Keep First Design)
========================================================= */
const OwnerPopupCard = ({ onClose, data, lang }) => {
  const safeText = (val) =>
    typeof val === "object" ? val?.[lang] || val?.en || "" : val || "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {safeText(data.name) || "Owner"}
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-8 bg-[#fafafa] rounded-2xl p-6 border border-gray-300 relative">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#cfcafc] flex items-center justify-center">
              <img
                src={data.image || "/dummy-img.jpg"}
                alt={safeText(data.name)}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-gray-800">
            <h3 className="text-lg font-semibold mb-2">
              {safeText(data.name) || "Unnamed Owner"}
            </h3>
            {data.number && (
              <p className="text-gray-700 text-sm mb-3">
                📞 {safeText(data.number)}
              </p>
            )}
            {data.notes && (
              <>
                <h4 className="text-sm font-semibold mb-1">Notes</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {safeText(data.notes)}
                </p>
              </>
            )}
            {data.type && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Type:</span> {safeText(data.type)}
              </p>
            )}
          </div>

          {/* Facebook */}
          <div className="absolute top-6 right-6">
            {data.facebook ? (
              <a
                href={
                  safeText(data.facebook).startsWith("http")
                    ? safeText(data.facebook)
                    : `https://facebook.com/${safeText(data.facebook)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-gray-700"
                >
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12Z" />
                </svg>
              </a>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 opacity-40 cursor-not-allowed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-gray-400"
                >
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
