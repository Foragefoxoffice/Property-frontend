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
  const { language } = useLanguage();
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

      const res = await addFavorite(propId);
      if (res.data.success) {
        CommonToaster('Request sent successfully', 'success');
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

  /* -------------------------------------------------------
     SAFE data extraction using helpers
  ------------------------------------------------------- */
  const p = property || {};
  const info = p.propertyInformation || {};
  const list = p.listingInformation || {};
  const fin = p.financialDetails || {};
  const what = p.whatNearby || {};

  const type = safeVal(list?.listingInformationTransactionType);

  const videos = safeArray(p?.imagesVideos?.propertyVideo);
  const floorplans = safeArray(p?.imagesVideos?.floorPlan);
  const utilities = safeArray(p?.propertyUtility);

  const visList = p.listingInformationVisibility || {};
  const visProp = p.propertyInformationVisibility || {};
  const visFin = p.financialVisibility || {};
  const visDec = p.descriptionVisibility || {};
  const visVideo = p.videoVisibility || {};
  const visFloor = p.floorImageVisibility || {};

  const show = (flag) => flag === false || flag === undefined;

  function formatDate(dateStr) {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // fallback if already formatted

    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/ /g, "-");
  }

  return (
    <div className="bg-[#F8F7FC] pb-40">
      {/* -------------------------------------------------------
         Tabs (UI preserved exactly)
      ------------------------------------------------------- */}
      <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          "Overview",
          "Property Utility",
          "Payment Overview",
          "Video",
          "Floor Plans",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => scrollTo(tab)}
            className={`relative px-5 py-3 text-sm font-medium`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1320px] mx-auto">
        {/* -------------------------------------------------------
           LEFT CONTENT (UI preserved)
        ------------------------------------------------------- */}
        <div
          id="scrollContainer"
          className="lg:col-span-2 overflow-y-auto lg:h-[75vh] pr-2"
        >
          {/* -------------------------------------------------------
             OVERVIEW
          ------------------------------------------------------- */}
          <section
            ref={sectionRefs["Overview"]}
            className="bg-white p-6 rounded-2xl mb-12"
          >
            <h2 className="text-xl font-semibold mb-5">Overview</h2>

            <div className="grid grid-cols-2 ml-3 md:grid-cols-4 gap-8">
              {show(p.listingInformationVisibility?.propertyId) && (
                <OverviewCard
                  icon={<House />}
                  label="Property ID:"
                  value={safeVal(list?.listingInformationPropertyId)}
                />
              )}
              {show(visList.transactionType) && (
                <OverviewCard
                  icon={<SlidersHorizontal />}
                  label="Property Type:"
                  value={safeVal(list?.listingInformationPropertyType)}
                />
              )}
              {show(visProp.bedrooms) && (
                <OverviewCard
                  icon={<Bed />}
                  label="Bedrooms:"
                  value={`${safeVal(info?.informationBedrooms)} Rooms`}
                />
              )}
              {show(visProp.bathrooms) && (
                <OverviewCard
                  icon={<Bath />}
                  label="Bathrooms:"
                  value={`${safeVal(info?.informationBathrooms)} Rooms`}
                />
              )}
              {show(visProp.furnishing) && (
                <OverviewCard
                  icon={<Armchair />}
                  label="Furnishing:"
                  value={safeVal(info?.informationFurnishing)}
                />
              )}
              {show(visProp.unit) && (
                <OverviewCard
                  icon={<Ruler />}
                  label="Size:"
                  value={`${safeVal(info?.informationUnitSize)} m²`}
                />
              )}
              {show(visProp.floorRange) && (
                <OverviewCard
                  icon={<Layers />}
                  label="Floor Range:"
                  value={safeVal(info?.informationFloors)}
                />
              )}
              {show(visProp.view) && (
                <OverviewCard
                  icon={<Eye />}
                  label="View:"
                  value={safeVal(info?.informationView)}
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
                    label="Check In:"
                    value={safeVal(fin?.financialDetailsCheckIn)}
                  />
                )}
                {show(visFin.checkOut) && (
                  <InfoItem
                    label="Check Out:"
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
              <EcoparkItem
                label="Project / Community:"
                value={safeVal(list?.listingInformationProjectCommunity)}
              />

              {show(visList.areaZone) && (
                <EcoparkItem
                  label="Area / Zone:"
                  value={safeVal(list?.listingInformationZoneSubArea)}
                />
              )}

              {show(visList.blockName) && (
                <EcoparkItem
                  label="Block:"
                  value={safeVal(list?.listingInformationBlockName)}
                />
              )}
              {(type === "Sale" || type === "Lease") &&
                show(visList.availableFrom) && (
                  <EcoparkItem
                    label="Available From:"
                    value={formatDate(list?.listingInformationAvailableFrom)}
                  />
                )}
            </div>
          </section>

          {/* -------------------------------------------------------
             DESCRIPTION (UI preserved)
          ------------------------------------------------------- */}
          {show(visDec.descriptionVisibility) && (
            <section className="bg-white p-6 rounded-2xl mb-12">
              <h2 className="text-xl font-semibold mb-5">Description</h2>
              <p className="text-gray-700 leading-6">
                {safeVal(what?.whatNearbyDescription) ||
                  "No description available"}
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
            <h2 className="text-xl font-semibold mb-5">Property Utility</h2>

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
            <h2 className="text-xl font-semibold mb-4">Payment Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {show(visFin.deposit) && (
                <InfoItem
                  label="Deposit:"
                  value={safeVal(fin?.financialDetailsDeposit)}
                />
              )}
              {show(visFin.paymentTerm) && (
                <InfoItem
                  label="Payment Terms:"
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
              <h2 className="text-xl font-semibold mb-5">Video</h2>

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
              <h2 className="text-xl font-semibold mb-5">Floor Plans</h2>
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
            {/* Send Request Button */}
            <button
              onClick={handleSendRequest}
              disabled={sending}
              className={`w-full mt-6  text-white cursor-pointer py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-[#41398B] hover:bg-[#352e7a]"
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

      {/* Modal for Video Preview */}
      {previewUrl && (
        <MediaPreviewModal
          url={previewUrl}
          type="video"
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
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
