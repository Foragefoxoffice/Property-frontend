import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Eye,
  Mail,
  Phone,
  UserCog,
  X,
  MapPin,
  Calendar,
  ExternalLink,
  Bed,
  Bath,
  Ruler,
  Clover,
} from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";
import { Select as AntdSelect, Spin } from "antd";
import OwnerModal from "../Property/OwnerModal";
import { CommonToaster } from "../../Common/CommonToaster";
import { getListingProperties } from "../../Api/action";
import { usePermissions } from "../../Context/PermissionContext";

/* 🔹 Helper: Find matching ID by localized name */
function findIdByName(arr, valueObj) {
  if (!arr || !Array.isArray(arr) || !valueObj || typeof valueObj !== "object") return "";
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

/* 💜 Skeleton Loader */
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
  onComplete,
  initialData = {},
  owners = [],
  staffs = [],
  me = null,
  loading = false,
  isSubmitting,
  refreshOwners,
}) {
  const { isApprover } = usePermissions();
  const handleComplete = async () => {
    const finalStatus = isApprover ? "Published" : "Pending";
    const payload = {
      contactManagement: {
        contactManagementOwner: form.owner || { en: "", vi: "" },
        contactManagementOwnerNotes: form.ownerNotes || { en: "", vi: "" },
        contactManagementConsultant: {
          en: me?.name || "",
          vi: me?.name || "",
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
        contactManagementOwnerPhone: form.ownerPhone || [],
      },
    };
    onChange && onChange(payload);
    await onComplete(finalStatus, payload);
  };
  const [lang, setLang] = useState("vi");
  const initialized = useRef(false);

  const getLocalizedValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return lang === "vi"
      ? value.vi || value.en || ""
      : value.en || value.vi || "";
  };
  useEffect(() => {
    console.log("📌 Owners list:", owners);
  }, [owners]);

  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedConnect, setSelectedConnect] = useState(null);

  const [showOwnerView, setShowOwnerView] = useState(false);
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);

  const [form, setForm] = useState({
    owner: initialData.owner || initialData.contactManagement?.contactManagementOwner || { en: "", vi: "" },
    ownerNotes: initialData.ownerNotes || initialData.contactManagement?.contactManagementOwnerNotes || { en: "", vi: "" },
    consultant: initialData.consultant ||
      initialData.contactManagement?.contactManagementConsultant || {
      en: "",
      vi: "",
    },
    connectingPoint: initialData.connectingPoint || initialData.contactManagement?.contactManagementConnectingPoint || { en: "", vi: "" },
    connectingPointNotes: initialData.connectingPointNotes || initialData.contactManagement?.contactManagementConnectingPointNotes || {
      en: "",
      vi: "",
    },
    internalNotes: initialData.internalNotes || initialData.contactManagement?.contactManagementInternalNotes || { en: "", vi: "" },
    source: initialData.source || initialData.contactManagement?.contactManagementSource || { en: "", vi: "" },
    ownerPhone: initialData.contactManagement?.contactManagementOwnerPhone || [],
    agentFee: initialData.contactManagement?.contactManagementAgentFee || 0,
  });

  useEffect(() => {
    // Wait until initialData has some content (at least contactManagement or similar)
    if (!initialData || Object.keys(initialData).length === 0) return;

    const cm = initialData.contactManagement || {};

    const updatedForm = {
      owner: cm.contactManagementOwner || { en: "", vi: "" },
      ownerNotes: cm.contactManagementOwnerNotes || { en: "", vi: "" },
      consultant: cm.contactManagementConsultant || { en: "", vi: "" },
      connectingPoint: cm.contactManagementConnectingPoint || { en: "", vi: "" },
      connectingPointNotes: cm.contactManagementConnectingPointNotes || {
        en: "",
        vi: "",
      },
      internalNotes: cm.contactManagementInternalNotes || { en: "", vi: "" },
      source: cm.contactManagementSource || { en: "", vi: "" },
      ownerPhone: cm.contactManagementOwnerPhone || [],
      agentFee: cm.contactManagementAgentFee || 0,
    };

    // Pre-select owner & sync phone if missing
    if (updatedForm.owner?.en) {
      const matchOwner = owners.find(
        (o) =>
          o.ownerName?.en === updatedForm.owner.en ||
          o.ownerName?.vi === updatedForm.owner.vi
      );
      setSelectedOwner(matchOwner || null);

      if (matchOwner && (!updatedForm.ownerPhone || updatedForm.ownerPhone.length === 0)) {
        updatedForm.ownerPhone = matchOwner.phoneNumbers || [];
      }
    }

    setForm((prev) => ({ ...prev, ...updatedForm }));

    // Pre-select connecting point 
    if (updatedForm.connectingPoint?.en) {
      const matchStaff = staffs.find(
        (s) =>
          s.staffsName?.en === updatedForm.connectingPoint.en ||
          s.staffsName?.vi === updatedForm.connectingPoint.vi
      );
      setSelectedConnect(matchStaff || null);
    }
  }, [owners, staffs, initialData]);

  /* ✅ Localized setter */
  const handleLocalizedChange = (lng, field, value) => {
    const updated = {
      ...form,
      [field]: { ...(form[field] || { en: "", vi: "" }), [lng]: value },
    };
    setForm(updated);
    onChange &&
      onChange({
        contactManagement: {
          contactManagementOwner: updated.owner || { en: "", vi: "" },
          contactManagementOwnerNotes: updated.ownerNotes || {
            en: "",
            vi: "",
          },
          contactManagementConsultant: updated.consultant || {
            en: "",
            vi: "",
          },
          contactManagementConnectingPoint: updated.connectingPoint || {
            en: "",
            vi: "",
          },
          contactManagementConnectingPointNotes:
            updated.connectingPointNotes || { en: "", vi: "" },
          contactManagementInternalNotes: updated.internalNotes || {
            en: "",
            vi: "",
          },
          contactManagementSource: updated.source || { en: "", vi: "" },
          contactManagementOwnerPhone: updated.ownerPhone || [],
          contactManagementAgentFee: updated.agentFee || 0,
        },
      });
  };

  /* 🌐 Translations */
  const t = {
    en: {
      title: "Landlord Information",
      landlord: "Landlord",
      ownerNotes: "Landlord Notes",
      consultant: "Created By",
      connectingPoint: "Connecting Point",
      connectingPointNotes: "Connecting Point Notes",
      internalNotes: "Internal Notes",
      selectOwner: "Select landlord",
      selectConnect: "Select Connecting Point",
      next: "Next",
      typehere: "Type here",
      prev: "Previous",
    },
    vi: {
      title: "Thông tin chủ nhà",
      landlord: "chủ nhà",
      ownerNotes: "Ghi chú của chủ nhà",
      consultant: "Được tạo bởi",
      connectingPoint: "Điểm Liên Hệ",
      connectingPointNotes: "Ghi chú về Điểm Liên Hệ",
      internalNotes: "Ghi chú nội bộ",
      selectOwner: "Chọn chủ nhà",
      selectConnect: "Chọn Điểm Liên Hệ",
      typehere: "Nhập tại đây",
      next: "Tiếp",
      prev: "Trước",
    },
  }[lang];

  /* ✅ SHOW SKELETON WHILE LOADING */
  if (loading) return <SkeletonLoader />;

  /* ✅ UI (NO CHANGES) */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Language Tabs */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200">
        <div className="flex">
          {["vi", "en"].map((lng) => (
            <button
              key={lng}
              className={`px-6 py-2 text-sm font-medium ${lang === lng
                ? "border-b-2 border-[#41398B] text-black"
                : "text-gray-500 hover:text-black"
                }`}
              onClick={() => setLang(lng)}
            >
              {lng === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
            </button>
          ))}
        </div>

        {/* Complete & Save Button */}
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className={`bg-[#41398B] mt-[-20px] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#322c6d] transition shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {lang === "en" ? "Saving..." : "Đang lưu..."}
            </span>
          ) : (
            lang === "en" ? "Complete & Save" : "Hoàn tất & Lưu"
          )}
        </button>
      </div>

      {/* Add Owner Modal */}
      {showAddOwnerModal && (
        <div style={{ zIndex: 999 }}>
          <OwnerModal
            onClose={() => {
              setShowAddOwnerModal(false);
            }}
            onSuccess={refreshOwners}
          />
        </div>
      )}

      <h2 className="text-lg font-semibold mb-6">{t.title}</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* ----- OWNER SELECT ----- */}
        <div>
          <div className="flex flex-wrap gap-4 items-baseline">
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm text-[#131517] font-semibold">
                {t.landlord}
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
                      const updatedOwner = selected
                        ? {
                          en: selected.ownerName?.en || "",
                          vi: selected.ownerName?.vi || "",
                        }
                        : { en: "", vi: "" };

                      const updatedOwnerPhone = selected?.phoneNumbers || [];

                      const updated = {
                        ...form,
                        owner: updatedOwner,
                      };
                      setForm(updated);

                      onChange &&
                        onChange({
                          contactManagement: {
                            contactManagementOwner: updated.owner,
                            contactManagementOwnerPhone: updatedOwnerPhone,
                            contactManagementOwnerNotes: form.ownerNotes,
                            contactManagementConsultant: form.consultant,
                            contactManagementConnectingPoint:
                              form.connectingPoint,
                            contactManagementConnectingPointNotes:
                              form.connectingPointNotes,
                            contactManagementInternalNotes: form.internalNotes,
                            contactManagementSource: form.source,
                            contactManagementAgentFee: form.agentFee,
                          },
                        });
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    className="w-full custom-select"
                    popupClassName="custom-dropdown"
                    options={owners.map((opt) => {
                      const phone = opt.phoneNumbers?.join(", ") || "";
                      const name = opt.ownerName?.[lang] || opt.ownerName?.en;
                      return {
                        label: phone ? `${name} (${phone})` : name,
                        value: opt._id,
                      };
                    })}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <div
                          className="mt-2 p-3 bg-[#41398B] text-white text-center rounded-lg cursor-pointer flex gap-2 justify-center items-center"
                          onClick={() => setShowAddOwnerModal(true)}
                        >
                          <CirclePlus size={18} /> New Landlords
                        </div>
                      </>
                    )}
                  />
                  {form.ownerPhone && form.ownerPhone.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 px-1">
                      <Phone size={12} className="text-[#41398B]" />
                      <span className="font-medium tracking-wide">
                        {form.ownerPhone.join(", ")}
                      </span>
                    </div>
                  )}
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

            {/* ----- SOURCE TEXT ----- */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm text-[#131517] font-semibold mb-2 block">
                {lang === "en" ? "Source" : "Nguồn"}
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

        {/* ----- OWNER NOTES ----- */}
        <div>
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.ownerNotes}
          </label>
          <textarea
            value={form.ownerNotes?.[lang] || ""}
            placeholder={t.typehere}
            onChange={(e) =>
              handleLocalizedChange(lang, "ownerNotes", e.target.value)
            }
            rows={5}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* ----- CONSULTANT (getMe()) ----- */}
        <div className="flex gap-4 items-baseline">
          <div className="w-full">
            <label className="text-sm text-[#131517] font-semibold mb-3">
              {t.consultant}
            </label>

            <div className="flex items-center gap-2">
              {me ? (
                <input
                  type="text"
                  value={me.name}
                  disabled
                  className="border mt-2 border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
                />
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* ----- INTERNAL NOTES ----- */}
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
            rows={5}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      {/* ----- NAVIGATION BUTTONS ----- */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 gap-1.5 rounded-lg hover:bg-gray-100 flex items-center cursor-pointer"
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
                contactManagementConsultant: {
                  en: me?.name || "",
                  vi: me?.name || "",
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
                contactManagementOwnerPhone: form.ownerPhone || [],
                contactManagementAgentFee: form.agentFee || 0,
              },
            };

            onChange && onChange(payload);
            onNext && onNext();   // <-- THIS WILL MOVE THE USER TO STEP 4

          }}
          className="px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-lg items-center flex gap-1 cursor-pointer"
        >
          {t.next} <ArrowRight size={18} />
        </button>
      </div>

      {/* ----- OWNER POPUP ----- */}
      {showOwnerView && selectedOwner && (
        <OwnerPopupCard
          onClose={() => setShowOwnerView(false)}
          data={selectedOwner}
          lang={lang}
        />
      )}
    </div>
  );
}

/* ✅ POPUP CARDS (UNCHANGED UI) */
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onMouseDown={(e) => { if (e.target === e.currentTarget) { setLoadingProps(false); } }}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {safeText(name) || title || "Staff Details"}
        </h2>

        <div className="relative bg-white rounded-2xl border border-gray-300 shadow-sm p-6 flex gap-8">
          <div>
            <div className="w-44 h-44 rounded-xl overflow-hidden bg-[#e7e4fb] flex items-center justify-center">
              <img
                src={image || defaultImage}
                alt={safeText(name)}
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
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {safeText(notes)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerPopupCard = ({ onClose, data, lang }) => {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      const ownerNameEn = data.ownerName?.en || (typeof data.ownerName === "string" ? data.ownerName : "");
      if (!ownerNameEn) return;
      try {
        setLoadingProps(true);
        const res = await getListingProperties({ owner: ownerNameEn, status: "all" });
        setProperties(res.data.data || []);
      } catch (error) {
        console.error("Error fetching owner properties:", error);
      } finally {
        setLoadingProps(false);
      }
    };
    fetchOwnerProperties();
  }, [data]);

  const safeText = (obj) =>
    typeof obj === "object" ? obj?.[lang] || obj?.en || "" : obj || "";

  const social = data.socialMedia_iconName?.map((icon, i) => ({
    icon,
    link:
      lang === "vi"
        ? data.socialMedia_link_vi?.[i]
        : data.socialMedia_link_en?.[i],
  }));

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative bg-white w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#41398B] to-[#5B52B5] px-8 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-4xl font-bold shadow-lg">
              {safeText(data.ownerName)?.charAt(0)?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold mb-2">
                {safeText(data.ownerName)}
              </h2>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-4">
                {data.phoneNumbers?.map((num, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                  >
                    <Phone size={15} />
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(92vh-180px)] px-6 sm:px-8 py-6">

          {/* Social + Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Social */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {lang === "vi" ? "Mạng xã hội" : "Social Media"}
              </h3>

              <div className="space-y-3">
                {social?.length ? (
                  social.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-[#41398B]/10 text-[#41398B] text-xs font-semibold">
                          {s.icon}
                        </div>

                        <span className="text-sm text-gray-700 truncate max-w-[180px]">
                          {s.link}
                        </span>
                      </div>

                      {s.link && (
                        <a
                          href={
                            s.link.startsWith("http")
                              ? s.link
                              : `https://${s.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#41398B] hover:text-[#352e7a]"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    {lang === "vi"
                      ? "Không có mạng xã hội"
                      : "No social links"}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {lang === "vi" ? "Ghi chú" : "Notes"}
              </h3>

              <div className="bg-white rounded-xl border border-gray-100 p-4 min-h-[140px]">
                <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                  {safeText(data.ownerNotes) ||
                    (lang === "vi"
                      ? "Không có ghi chú"
                      : "No notes available")}
                </p>
              </div>
            </div>
          </div>

          {/* Properties */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                {lang === "vi"
                  ? "Danh sách bất động sản"
                  : "Properties"}
              </h3>

              <div className="text-sm text-gray-500">
                {properties.length}{" "}
                {lang === "vi" ? "bất động sản" : "properties"}
              </div>
            </div>

            {loadingProps ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {properties.map((prop) => {
                  const type =
                    prop.listingInformation
                      ?.listingInformationTransactionType?.en || "";

                  const title =
                    lang === "vi"
                      ? prop.listingInformation
                        ?.listingInformationPropertyTitle?.vi ||
                      prop.listingInformation
                        ?.listingInformationPropertyTitle?.en
                      : prop.listingInformation
                        ?.listingInformationPropertyTitle?.en ||
                      prop.listingInformation
                        ?.listingInformationPropertyTitle?.vi;

                  const location =
                    lang === "vi"
                      ? prop.listingInformation
                        ?.listingInformationProjectCommunity?.vi ||
                      prop.listingInformation
                        ?.listingInformationProjectCommunity?.en
                      : prop.listingInformation
                        ?.listingInformationProjectCommunity?.en ||
                      prop.listingInformation
                        ?.listingInformationProjectCommunity?.vi;

                  const unit =
                    lang === "vi"
                      ? prop.propertyInformation?.informationUnit?.vi ||
                      prop.propertyInformation?.informationUnit?.en
                      : prop.propertyInformation?.informationUnit?.en ||
                      prop.propertyInformation?.informationUnit?.vi;

                  const priceSale =
                    prop.financialDetails?.financialDetailsPrice;

                  const priceLease =
                    prop.financialDetails?.financialDetailsLeasePrice;

                  const currency =
                    prop.financialDetails?.financialDetailsCurrency?.code ||
                    "₫";

                  const displayPrice =
                    type === "Sale"
                      ? priceSale
                      : type === "Lease"
                        ? priceLease
                        : 0;

                  return (
                    <div
                      key={prop._id}
                      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={getImageUrl(prop.imagesVideos?.propertyImages?.[0])}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            e.target.src = "/dummy-img.jpg";
                          }}
                        />

                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                            {type}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${prop.status === "Published"
                              ? "bg-green-500"
                              : prop.status === "Pending"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                              }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2">
                          {title}
                        </h4>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <MapPin size={15} />
                          <span className="line-clamp-1">{location}</span>
                        </div>

                        <div className="flex gap-3 mb-5">
                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Bed size={15} />
                            {prop.propertyInformation
                              ?.informationBedrooms || 0}
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Bath size={15} />
                            {prop.propertyInformation
                              ?.informationBathrooms || 0}
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Ruler size={15} />
                            {prop.propertyInformation
                              ?.informationUnitSize || 0}{" "}
                            {unit || "m²"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 uppercase">
                              {lang === "vi" ? "Giá" : "Price"}
                            </p>

                            <p className="text-xl font-bold text-[#41398B]">
                              {displayPrice
                                ? `${Number(
                                  displayPrice
                                ).toLocaleString()} ${currency}`
                                : "Contact"}
                            </p>
                          </div>

                          <a
                            href={`${import.meta.env.VITE_SITE_URL}/property-showcase/${prop.listingInformation
                              ?.listingInformationPropertyId || prop._id
                              }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-xl bg-[#41398B] hover:bg-[#352e7a] text-white flex items-center justify-center transition"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <p className="text-gray-400">
                  {lang === "vi"
                    ? "Chưa có bất động sản nào."
                    : "No properties found."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
