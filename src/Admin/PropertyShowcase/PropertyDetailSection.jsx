import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Bed,
  Bath,
  Ruler,
  Layers,
  Eye,
  House,
  SlidersHorizontal,
  Armchair,
  ArrowLeft,
  ArrowRight,
  X,
  PlayIcon,
  Mail,
  Send,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SiMessenger, SiZalo } from "react-icons/si";
import { translations } from "../../Language/translations";
import { safeVal, safeArray } from "@/utils/display";
import { getAgent, addFavorite } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { useNavigate } from 'react-router-dom';
import { getListingProperties } from '../../Api/action';
import { Skeleton, Tooltip } from 'antd';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../Context/FavoritesContext';

/* -------------------------------------------------------
   MEDIA PREVIEW MODAL
------------------------------------------------------- */
const MediaPreviewModal = ({ url, type, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="relative max-w-3xl w-full mx-4 rounded-2xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 z-10 right-3 bg-[#41398B]/90 hover:bg-[#41398B] text-white p-2 rounded-full shadow"
        >
          <X className="cursor-pointer" size={20} />
        </button>
        {type === "video" ? (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-[70vh] object-contain rounded-lg bg-black"
          />
        ) : (
          <img
            src={url}
            alt="Preview"
            className="w-full max-h-[80vh] object-contain rounded-lg bg-[#F8F7FC]"
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   SLIDER (kept same UI — only added safety)
------------------------------------------------------- */
function SimpleSlider({ items, type = "image" }) {
  const safeItems = safeArray(items).filter((x) => !!x);
  const [index, setIndex] = useState(0);

  if (!safeItems.length) return null;

  const next = () => setIndex((i) => (i + 1) % safeItems.length);
  const prev = () =>
    setIndex((i) => (i - 1 + safeItems.length) % safeItems.length);

  return (
    <div className="relative w-full">
      <div className="rounded-xl overflow-hidden border">
        {type === "video" ? (
          <video controls className="w-full h-[400px] object-cover rounded-lg">
            <source src={safeItems[index]} type="video/mp4" />
          </video>
        ) : (
          <img
            src={safeItems[index]}
            className="w-full h-[400px] object-cover rounded-lg"
          />
        )}
      </div>

      {safeItems.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#41398B] p-2 rounded-full text-white cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#41398B] p-2 rounded-full text-white cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function PropertyDetailsSection({ property }) {
  // references for scrolling
  /* -------------------------------------------------------
     SAFE data extraction using helpers
  ------------------------------------------------------- */
  const { language } = useLanguage();

  // Helper for localized values
  const getLocalizedValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
  };

  const p = property || {};
  const info = p.propertyInformation || {};
  const list = p.listingInformation || {};
  const fin = p.financialDetails || {};
  const what = p.whatNearby || {};

  // Use safeVal (English/Code) for logic checks
  const type = safeVal(list?.listingInformationTransactionType);
  // Use getLocalizedValue for Display
  const typeDisplay = getLocalizedValue(list?.listingInformationTransactionType);

  const videos = safeArray(p?.imagesVideos?.propertyVideo);
  const floorplans = safeArray(p?.imagesVideos?.floorPlan);
  const utilities = safeArray(p?.propertyUtility);

  const visList = p.listingInformationVisibility || {};
  const visProp = p.propertyInformationVisibility || {};
  const visFin = p.financialVisibility || {};
  const visDec = p.descriptionVisibility || {};
  const visWhatNearby = p.whatNearbyVisibility || false;
  const visVideo = p.videoVisibility || {};
  const visFloor = p.floorImageVisibility || {};

  const { isFavorite, addFavorite: addFavoriteContext, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const [recentProperties, setRecentProperties] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const t = translations[language];
  const sectionRefs = {
    Overview: useRef(null),
    "Property Utility": useRef(null),
    "Payment Overview": useRef(null),
    Video: useRef(null),
    "Floor Plans": useRef(null),
  };

  const [previewUrl, setPreviewUrl] = useState(null); // Preview state
  const [agentData, setAgentData] = useState(null); // Agent CMS data
  const [agentLoading, setAgentLoading] = useState(true); // Loading state
  const [sending, setSending] = useState(false); // Sending state
  const [message, setMessage] = useState(''); // Message state

  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        setLoadingRecent(true);
        const res = await getListingProperties({ page: 1, limit: 4, sortBy: 'newest' });
        let props = res.data?.data || [];

        // Filter out current property if present
        if (p._id || list.listingInformationPropertyId) {
          const currentId = p._id || list.listingInformationPropertyId;
          props = props.filter(item => (item._id !== currentId && item.listingInformation?.listingInformationPropertyId !== currentId));
        }

        setRecentProperties(props.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent properties:', error);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecentProperties();
  }, [p._id, list.listingInformationPropertyId]);

  // Fetch agent data on mount
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setAgentLoading(true);
        const response = await getAgent();
        const data = response.data.data;
        setAgentData(data);
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setAgentLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  const handleSendRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      CommonToaster("Please login to send request", 'error');
      return;
    }

    try {
      setSending(true);
      const propId = p._id || list.listingInformationPropertyId;
      if (!propId) {
        CommonToaster('Invalid property data', 'error');
        return;
      }

      const res = await addFavorite(propId, message);
      if (res.data.success) {
        CommonToaster('Request sent successfully', 'success');
        setMessage(''); // Clear message after success
      } else {
        CommonToaster('Failed to send request', 'error');
      }

    } catch (error) {
      console.error('Error sending request:', error);
      if (error.response && error.response.status === 401) {
        // Handled by interceptor usually, but safe to add
      } else {
        CommonToaster('Error sending request', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  const scrollTo = (name) => {
    sectionRefs[name]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };



  const show = (flag) => flag === false || flag === undefined;

  function formatDate(dateStr) {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // fallback if already formatted

    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', options).replace(/ /g, "-");
  }

  const TABS = [
    { key: "Overview", label: t.overview },
    { key: "Property Utility", label: t.propertyUtility },
    { key: "Payment Overview", label: t.paymentOverview },
    { key: "Video", label: t.video },
    { key: "Floor Plans", label: t.floorPlans },
  ];

  return (
    <div className="bg-[#F8F7FC] pb-40">
      {/* -------------------------------------------------------
         Tabs (UI preserved exactly)
      ------------------------------------------------------- */}
      <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => scrollTo(tab.key)}
            className={`relative px-5 py-3 text-sm font-medium`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1320px] mx-auto">
        {/* -------------------------------------------------------
           LEFT CONTENT (UI preserved)
        ------------------------------------------------------- */}
        <div
          id="scrollContainer"
          className="lg:col-span-2 overflow-y-auto lg:h-[85vh] pr-2 custom-scrollbar"
        >
          {/* -------------------------------------------------------
             OVERVIEW
          ------------------------------------------------------- */}
          <section
            ref={sectionRefs["Overview"]}
            className="bg-white p-6 rounded-2xl mb-12"
          >
            <h2 className="text-xl font-semibold mb-5">{t.overview}</h2>

            <div className="grid grid-cols-2 ml-3 md:grid-cols-4 gap-8">
              {show(p.listingInformationVisibility?.propertyId) && (
                <OverviewCard
                  icon={<House />}
                  label={`${t.propertyId}:`}
                  value={safeVal(list?.listingInformationPropertyId)}
                />
              )}
              {show(visList.transactionType) && (
                <OverviewCard
                  icon={<SlidersHorizontal />}
                  label={`${t.propertyType}:`}
                  value={getLocalizedValue(list?.listingInformationPropertyType)}
                />
              )}
              {show(visProp.bedrooms) && (
                <OverviewCard
                  icon={<Bed />}
                  label={`${t.bedrooms}:`}
                  value={`${safeVal(info?.informationBedrooms)} ${t.rooms}`}
                />
              )}
              {show(visProp.bathrooms) && (
                <OverviewCard
                  icon={<Bath />}
                  label={`${t.bathrooms}:`}
                  value={`${safeVal(info?.informationBathrooms)} ${t.rooms}`}
                />
              )}
              {show(visProp.furnishing) && (
                <OverviewCard
                  icon={<Armchair />}
                  label={`${t.furnishing}:`}
                  value={getLocalizedValue(info?.informationFurnishing)}
                />
              )}
              {show(visProp.unit) && (
                <OverviewCard
                  icon={<Ruler />}
                  label={`${t.size}:`}
                  value={`${safeVal(info?.informationUnitSize)} ${t.sqft || 'm²'}`}
                />
              )}
              {show(visProp.floorRange) && (
                <OverviewCard
                  icon={<Layers />}
                  label={`${t.floorRange}:`}
                  value={getLocalizedValue(info?.informationFloors)}
                />
              )}
              {show(visProp.view) && (
                <OverviewCard
                  icon={<Eye />}
                  label={`${t.view}:`}
                  value={getLocalizedValue(info?.informationView)}
                />
              )}
            </div>
          </section>

          {/* Check in check out */}
          {type === "Home Stay" && (
            <section className="bg-white p-6 rounded-2xl mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {show(visFin.checkIn) && (
                  <InfoItem
                    label={`${t.checkIn}:`}
                    value={safeVal(fin?.financialDetailsCheckIn)}
                  />
                )}
                {show(visFin.checkOut) && (
                  <InfoItem
                    label={`${t.checkOutLabel}:`}
                    value={safeVal(fin?.financialDetailsCheckOut)}
                  />
                )}
              </div>
            </section>
          )}
          {/*  */}

          {/* -------------------------------------------------------
             ECOPARK SECTION (UI preserved)
          ------------------------------------------------------- */}
          <section className="bg-white p-6 rounded-2xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {show(visList.projectCommunity) && (
                <EcoparkItem
                  label={`${t.projectCommunity}:`}
                  value={getLocalizedValue(list?.listingInformationProjectCommunity)}
                />
              )}

              {show(visList.areaZone) && (
                <EcoparkItem
                  label={`${t.areaZone}:`}
                  value={getLocalizedValue(list?.listingInformationZoneSubArea)}
                />
              )}

              {show(visList.blockName) && (
                <EcoparkItem
                  label={`${t.block}:`}
                  value={getLocalizedValue(list?.listingInformationBlockName)}
                />
              )}
              {(type === "Sale" || type === "Lease") &&
                show(visList.availableFrom) && (
                  <EcoparkItem
                    label={`${t.availableFrom}:`}
                    value={formatDate(list?.listingInformationAvailableFrom)}
                  />
                )}
            </div>
          </section>

          {/* -------------------------------------------------------
             DESCRIPTION (UI preserved)
          ------------------------------------------------------- */}
          {show(visWhatNearby) && (
            <section className="bg-white p-6 rounded-2xl mb-12">
              <h2 className="text-xl font-semibold mb-5">{t.description}</h2>
              <p className="text-gray-700 leading-6">
                {getLocalizedValue(what?.whatNearbyDescription) ||
                  t.noDescription}
              </p>
            </section>
          )}

          {/* -------------------------------------------------------
             PROPERTY UTILITY (UI preserved)
          ------------------------------------------------------- */}
          <section
            ref={sectionRefs["Property Utility"]}
            className="bg-white p-6 rounded-2xl mb-12"
          >
            <h2 className="text-xl font-semibold mb-5">{t.propertyUtility}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {utilities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-b py-3 last:border-b-0"
                >
                  <img
                    src={item?.propertyUtilityIcon}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-medium">
                    {safeVal(item?.propertyUtilityUnitName)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* -------------------------------------------------------
             PAYMENT OVERVIEW (UI preserved)
          ------------------------------------------------------- */}
          <section
            ref={sectionRefs["Payment Overview"]}
            className="bg-white p-6 rounded-2xl mb-16"
          >
            <h2 className="text-xl font-semibold mb-4">{t.paymentOverview}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {show(visFin.deposit) && (
                <InfoItem
                  label={`${t.deposit}:`}
                  value={safeVal(fin?.financialDetailsDeposit)}
                />
              )}
              {show(visFin.paymentTerm) && (
                <InfoItem
                  label={`${t.paymentTerms}:`}
                  value={safeVal(fin?.financialDetailsMainFee)}
                />
              )}
            </div>
          </section>

          {/* -------------------------------------------------------
             VIDEO (Thumbnails + Popup)
          ------------------------------------------------------- */}
          {show(visVideo.videoVisibility) && videos.length > 0 && (
            <section
              ref={sectionRefs["Video"]}
              className="bg-white p-6 rounded-2xl mb-16"
            >
              <h2 className="text-xl font-semibold mb-5">{t.video}</h2>

              <div className="grid sm:grid-cols-2 gap-5">
                {videos.map((url, i) => (
                  <div
                    key={i}
                    className="relative group rounded-2xl overflow-hidden bg-white transition h-64"
                  >
                    {/* Fake Thumbnail (muted video) */}
                    <video
                      src={url}
                      muted
                      playsInline
                      className="w-full h-full object-contain bg-black/5"
                    />

                    {/* Overlay + Eye */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/0 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setPreviewUrl(url)}
                        className="p-3 bg-[#41398B] rounded-full shadow hover:scale-110 transition"
                      >
                        <PlayIcon
                          className="text-white cursor-pointer"
                          size={20}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* -------------------------------------------------------
             FLOOR PLANS (UI preserved)
          ------------------------------------------------------- */}
          {show(visFloor.floorImageVisibility) && (
            <section
              ref={sectionRefs["Floor Plans"]}
              className="bg-white p-6 rounded-2xl"
            >
              <h2 className="text-xl font-semibold mb-5">{t.floorPlans}</h2>
              <SimpleSlider items={floorplans} type="image" />
            </section>
          )}
        </div>

        {/* -------------------------------------------------------
           RIGHT CONTACT CARD (UI preserved)
        ------------------------------------------------------- */}
        <div className="lg:col-span-1 sticky top-6 h-fit">
          <div className=" bg-white rounded-xl border p-6 shadow-md">
            <h3 className="text-2xl text-[#41398B] font-semibold mb-4">{t.contact}</h3>

            {agentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41398B]"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      agentData?.agentImage
                        ? agentData.agentImage.startsWith('/')
                          ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${agentData.agentImage}`
                          : agentData.agentImage
                        : "/placeholder.jpg"
                    }
                    className="w-[250px] h-full object-cover pb-0"
                    alt="Agent"
                  />
                </div>

                <div>
                  <h3 className="text-xl text-[#41398B] font-semibold mb-4">{t.agent}</h3>
                </div>

                {/* Phone Numbers */}
                {agentData?.agentNumber && Array.isArray(agentData.agentNumber) && agentData.agentNumber.length > 0 && (
                  <div className="mb-4">
                    {agentData.agentNumber.map((phone, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${phone}`} className="hover:text-[#41398B] transition">
                          {phone}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Email Addresses */}
                {agentData?.agentEmail && Array.isArray(agentData.agentEmail) && agentData.agentEmail.length > 0 && (
                  <div className="mb-4">
                    {agentData.agentEmail.map((email, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${email}`} className="hover:text-[#41398B] transition text-sm">
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                )}


                {/* Social Media Links */}
                {(agentData?.agentZaloLink || agentData?.agentMessengerLink || agentData?.agentWhatsappLink) && (
                  <div className="border-t pt-4">
                    <div className="flex gap-3 justify-center">
                      {agentData?.agentZaloLink && (
                        <a
                          href={agentData.agentZaloLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition"
                          title="Zalo"
                        >
                          <SiZalo className="w-5 h-5" />
                        </a>
                      )}

                      {agentData?.agentMessengerLink && (
                        <a
                          href={agentData.agentMessengerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition"
                          title="Messenger"
                        >
                          <SiMessenger className="w-5 h-5" />
                        </a>
                      )}

                      {agentData?.agentWhatsappLink && (
                        <a
                          href={agentData.agentWhatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition"
                          title="WhatsApp"
                        >
                          <FaWhatsapp className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            {/* Message Field */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.message}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.enterMessage}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] transition-all resize-none h-32 text-sm"
              />
            </div>

            {/* Send Request Button */}
            <button
              onClick={handleSendRequest}
              disabled={sending}
              className={`w-full mt-4 text-white cursor-pointer py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-[#41398B] hover:bg-[#352e7a]"
                }`}
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t.sending || "Sending..."}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t.sendRequest || "Send Request"}
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* -------------------------------------------------------
         RECENT PROPERTIES SECTION
      ------------------------------------------------------- */}
      <div className="max-w-[1320px] mx-auto mt-16 px-4 md:px-0">
        <h2 className="text-3xl font-semibold mb-8 text-[#1f1f1f]">
          {t.recentProperties}
        </h2>

        {loadingRecent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl overflow-hidden p-4">
                <Skeleton.Image active className="!w-full !h-56 rounded-2xl mb-4" />
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : recentProperties.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {t.noRecentProperties}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
            {recentProperties.map((prop, index) => (
              <div
                key={prop._id}
                className="card-house style-default hover-image group bg-white rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer shadow-sm hover:shadow-lg"
                onClick={() => {
                  navigate(`/property-showcase/${prop.listingInformation?.listingInformationPropertyId || prop._id}`);
                  window.scrollTo(0, 0);
                }}
              >
                {/* Image */}
                <div className="relative img-style article-thumb h-56 overflow-hidden rounded-2xl m-3">
                  <img
                    style={{ width: "100%" }}
                    src={prop.imagesVideos?.propertyImages?.[0] || '/images/property/dummy-img.avif'}
                    alt={prop.listingInformation?.listingInformationBlockName}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-sm shadow-lg text-white ${(getLocalizedValue(prop.listingInformation?.listingInformationTransactionType) || '').toLowerCase().includes('sale') ? 'bg-[#eb4d4d]' :
                      (getLocalizedValue(prop.listingInformation?.listingInformationTransactionType) || '').toLowerCase().includes('lease') ? 'bg-[#058135]' : 'bg-[#055381]'
                      }`}>
                      {getLocalizedValue(prop.listingInformation?.listingInformationTransactionType)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const pid = prop._id || prop.listingInformation?.listingInformationPropertyId;
                        if (isFavorite(pid)) removeFavorite(pid);
                        else addFavoriteContext(prop);
                      }}
                      className="p-1.5 bg-white rounded-md shadow-sm text-[#000] hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Tooltip title={isFavorite(prop._id || prop.listingInformation?.listingInformationPropertyId)
                        ? (language === 'vi' ? 'Xóa khỏi Yêu thích' : 'Remove from Favorites')
                        : (language === 'vi' ? 'Thêm vào Yêu thích' : 'Add to Favorites')}>
                        <Heart
                          size={18}
                          className={`${isFavorite(prop._id || prop.listingInformation?.listingInformationPropertyId) ? 'fill-[#eb4d4d] text-[#eb4d4d]' : 'text-[#2a2a2a]'}`}
                        />
                      </Tooltip>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="pb-5 px-5">
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    {(() => {
                      const type = getLocalizedValue(prop.listingInformation?.listingInformationTransactionType);
                      const priceSale = prop.financialDetails?.financialDetailsPrice;
                      const priceLease = prop.financialDetails?.financialDetailsLeasePrice;
                      const priceNight = prop.financialDetails?.financialDetailsPricePerNight;
                      const genericPrice = prop.financialDetails?.financialDetailsPrice;
                      const currencyData = prop.financialDetails?.financialDetailsCurrency;
                      const currencyCode = (typeof currencyData === 'object' ? currencyData?.code : currencyData) || '';

                      let displayPrice = t.contactForPrice;
                      let displaySuffix = null;

                      const formatP = (p) => `${Number(p).toLocaleString()} ${currencyCode}`;

                      if (type === 'Sale' && priceSale) {
                        displayPrice = formatP(priceSale);
                      } else if (type === 'Lease' && priceLease) {
                        displayPrice = formatP(priceLease);
                        displaySuffix = ` ${t.monthSuffix}`;
                      } else if (type === 'Home Stay' && priceNight) {
                        displayPrice = formatP(priceNight);
                        displaySuffix = ` ${t.nightSuffix}`;
                      } else if (genericPrice) {
                        displayPrice = formatP(genericPrice);
                      }

                      return (
                        <>
                          <span className="text-xl font-bold text-[#2a2a2a]">{displayPrice}</span>
                          {displaySuffix && <span className="text-sm text-gray-500 font-medium">{displaySuffix}</span>}
                        </>
                      );
                    })()}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#41398B] transition-colors">
                    {getLocalizedValue(prop.listingInformation?.listingInformationPropertyTitle) ||
                      getLocalizedValue(prop.listingInformation?.listingInformationBlockName) ||
                      getLocalizedValue(prop.listingInformation?.listingInformationProjectCommunity) ||
                      t.untitledProperty}
                  </h3>

                  {/* Location */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                    {getLocalizedValue(prop.whatNearby?.whatNearbyDescription) ||
                      getLocalizedValue(prop.listingInformation?.listingInformationZoneSubArea) ||
                      'Description not specified'}
                  </p>

                  {/* Details */}
                  <div className="flex items-center pt-3 border-t border-gray-200 justify-between">
                    {prop.propertyInformation?.informationBedrooms > 0 && (
                      <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                        <Bed size={18} className="text-[#41398B]" />
                        <span className="font-medium">{prop.propertyInformation.informationBedrooms} {t.beds}</span>
                      </div>
                    )}
                    {prop.propertyInformation?.informationBathrooms > 0 && (
                      <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                        <Bath size={18} className="text-[#41398B]" />
                        <span className="font-medium">{prop.propertyInformation.informationBathrooms} {t.baths}</span>
                      </div>
                    )}
                    {prop.propertyInformation?.informationUnitSize > 0 && (
                      <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                        <Ruler size={18} className="text-[#41398B]" />
                        <span className="font-medium">{prop.propertyInformation.informationUnitSize.toLocaleString()} {t.sqft || 'm²'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Video Preview */}
      {
        previewUrl && (
          <MediaPreviewModal
            url={previewUrl}
            type="video"
            onClose={() => setPreviewUrl(null)}
          />
        )
      }
    </div >
  );
}

/* -------------------------------------------------------
   SUB COMPONENTS (UI UNCHANGED – only safeVal applied)
------------------------------------------------------- */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function OverviewCard({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 grid place-content-center border rounded-md hover:bg-black group">
        <div className="group-hover:text-white">{icon}</div>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="font-bold">{value || "-"}</p>
      </div>
    </div>
  );
}

function EcoparkItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="font-bold">{value || "-"}</p>
    </div>
  );
}

function UtilityLine({ icon, label }) {
  return (
    <div className="flex items-center gap-3 border-b py-2 last:border-b-0">
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
