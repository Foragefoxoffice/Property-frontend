import React from "react";
import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getImageUrl } from "./imageHelper";

const fetchFile = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    return await res.blob();
  } catch (error) {
    console.warn("Could not fetch file:", url, error);
    return null;
  }
};

const formatDMY = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const cleanHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/[^\S\n\r]{2,}/g, " ")
    .trim();
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "—";
  const numeric = value.toString().replace(/,/g, "");
  if (isNaN(numeric)) return value;
  return Number(numeric).toLocaleString("en-US");
};

/* === Reusable Components for PDF === */
const Section = ({ title, children }) => (
  <div className="mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-[14px] font-semibold text-[#1f2937]">{title}</h2>
      <div className="h-[2px] flex-1 ml-4 bg-[#e5e7eb]" />
    </div>
    <div className="bg-[#ffffff] border border-[#f3f4f6] rounded-xl p-4 shadow-sm w-full box-border overflow-hidden">
      {children}
    </div>
  </div>
);

const Grid3 = ({ children }) => (
  <div className="grid grid-cols-3 gap-4">{children}</div>
);

const Field = ({ label, value, isTextArea = false }) => (
  <div className="mb-2">
    <p className="text-[11px] text-[#131517] font-semibold mb-1 tracking-wide">
      {label}
    </p>
    <div className={`border border-[#B2B2B3] ${isTextArea ? "min-h-[60px] py-2" : "h-9 flex items-center"} overflow-hidden rounded-md px-2 text-[11px] text-[#374151] bg-[#f9fafb] whitespace-pre-wrap break-words`}>
      {value || "—"}
    </div>
  </div>
);

const PropertyPDFTemplate = ({ property, language = "en" }) => {
  const li = property?.listingInformation || {};
  const pi = property?.propertyInformation || {};
  const fd = property?.financialDetails || {};
  const cm = property?.contactManagement || {};
  const wn = property?.whatNearby || {};

  const safe = (v) => (typeof v === "object" ? v[language] || v.en || "" : v || "");

  const getTransType = () => {
    const raw = safe(li.listingInformationTransactionType).toLowerCase().trim();
    if (raw === "homestay" || raw === "home stay") return "home stay";
    if (raw === "bán" || raw === "sale") return "sale";
    if (raw === "cho thuê" || raw === "lease") return "lease";
    return raw;
  };
  const currentTransType = getTransType();

  const labels = {
    reviewTitle: {
      en: "Review & Publish Property",
      vi: "View lại & Đăng bất động sản",
    },
    listingInfo: { en: "Listing Information", vi: "Thông tin niêm yết" },
    propertyInfo: { en: "Property Information", vi: "Thông tin bất động sản" },
    description: { en: "Description", vi: "Mô tả" },
    propertyUtility: { en: "Property Utility", vi: "Tiện ích bất động sản" },
    financialDetails: { en: "Financial Details", vi: "Chi tiết tài chính" },
    contactManagement: {
      en: "Contact / Management Details",
      vi: "Liên hệ / Quản lý",
    },
    noUtilities: { en: "No utilities added.", vi: "Chưa thêm tiện ích nào." },
    noDescription: { en: "No description provided.", vi: "Không có mô tả." },

    propertyId: { en: "Property ID", vi: "Mã tài sản" },
    transactionType: { en: "Transaction Type", vi: "Loại giao dịch" },
    project: { en: "Project / Community", vi: "Dự án / Khu dân cư" },
    areaZone: { en: "Area / Zone", vi: "Khu vực / Vùng" },
    block: { en: "Block Name", vi: "Tên tòa" },
    propertyTitle: { en: "Property Title", vi: "Tiêu đề bất động sản" },
    propertyType: { en: "Property Type", vi: "Loại căn" },
    dateListed: { en: "Date Listed", vi: "Ngày niêm yết" },
    availableFrom: { en: "Available From", vi: "Có sẵn từ" },
    availabilityStatus: { en: "Availability Status", vi: "Trạng thái sẵn có" },
    lastUpdated: { en: "Last Updated Date", vi: "Ngày cập nhật cuối" },

    unit: { en: "Unit", vi: "Đơn vị" },
    unitSize: { en: "Unit Size", vi: "Diện tích" },
    bedrooms: { en: "Bedrooms", vi: "Ngủ" },
    bathrooms: { en: "Bathrooms", vi: "Vệ sinh" },
    floors: { en: "Floors", vi: "Số tầng" },
    furnishing: { en: "Furnishing", vi: "Trang bị nội thất" },
    view: { en: "View", vi: "View" },

    currency: { en: "Currency", vi: "Tiền tệ" },
    price: { en: "Price", vi: "Giá" },
    deposit: { en: "Deposit", vi: "Đặt cọc" },
    paymentTerms: { en: "Payment Terms", vi: "Điều khoản thanh toán" },
    leasePrice: { en: "Lease Price", vi: "Giá thuê" },
    contractLength: { en: "Contract Length", vi: "Thời hạn hợp đồng" },
    pricePerNight: { en: "Price per Night", vi: "Giá mỗi đêm" },
    checkIn: { en: "Check-in", vi: "Nhận phòng" },
    checkOut: { en: "Check-out", vi: "Trả phòng" },
    contractTerms: { en: "Contract Terms", vi: "Điều khoản hợp đồng" },

    owner: { en: "Landlord", vi: "chủ nhà" },
    ownerNotes: { en: "Landlord Notes", vi: "Ghi chú của chủ nhà" },
    consultant: { en: "Created By", vi: "Được tạo bởi" },
    connectingPoint: { en: "Connecting Point", vi: "Điểm liên hệ" },
    internalNotes: { en: "Internal Notes", vi: "Ghi chú nội bộ" },
  };

  return (
    <div className="bg-[#ffffff] p-6 font-sans text-[#111827] w-full" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {labels.reviewTitle[language]}
        </h1>
      </header>

      <Section title={labels.listingInfo[language]}>
        <Grid3>
          <Field label={labels.transactionType[language]} value={safe(li.listingInformationTransactionType)} />
          <Field label={labels.propertyId[language]} value={safe(li.listingInformationPropertyId)} />
          <Field label={labels.project[language]} value={safe(li.listingInformationProjectCommunity)} />
          <Field label={labels.areaZone[language]} value={safe(li.listingInformationZoneSubArea)} />
          <Field label={labels.block[language]} value={safe(li.listingInformationBlockName)} />
          <Field label={language === "en" ? "Property No" : "Mã căn"} value={safe(li.listingInformationPropertyNo)} />
          <Field label={labels.propertyType[language]} value={safe(li.listingInformationPropertyType)} />
          <Field label={labels.dateListed[language]} value={formatDMY(li.listingInformationDateListed)} />
          {currentTransType !== "home stay" && (
            <>
              <Field label={labels.availableFrom[language]} value={formatDMY(li.listingInformationAvailableFrom)} />
              <Field label={labels.availabilityStatus[language]} value={safe(li.listingInformationAvailabilityStatus)} />
            </>
          )}
          <Field label={labels.lastUpdated[language]} value={formatDMY(li.listingInformationLastUpdated)} />
        </Grid3>
      </Section>

      <Section title={labels.propertyInfo[language]}>
        <Grid3>
          <Field label={labels.unit[language]} value={safe(pi.informationUnit)} />
          <Field label={labels.unitSize[language]} value={pi.informationUnitSize} />
          <Field label={labels.bedrooms[language]} value={pi.informationBedrooms} />
          <Field label={labels.bathrooms[language]} value={pi.informationBathrooms} />
          <Field label={labels.floors[language]} value={safe(pi.informationFloors)} />
          <Field label={labels.furnishing[language]} value={safe(pi.informationFurnishing)} />
          <Field label={labels.view[language]} value={safe(pi.informationView)} />
          <Field label={labels.propertyTitle[language]} value={safe(li.listingInformationPropertyTitle)} />
        </Grid3>
      </Section>

      <Section title={labels.description[language]}>
        <div
          className="text-[#374151] text-[11px] leading-relaxed whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{
            __html: cleanHtml(safe(wn.whatNearbyDescription)) || labels.noDescription[language],
          }}
        />
      </Section>

      <Section title={labels.propertyUtility[language]}>
        {property?.propertyUtility?.length ? (
          <div className="grid grid-cols-3 gap-2">
            {property.propertyUtility.map((u, i) => (
              <div key={i} className="flex items-center bg-[#f9fafb] border rounded-md px-2 py-1.5 shadow-sm">
                <span className="font-medium text-[11px] text-[#1f2937]">
                  {safe(u.propertyUtilityUnitName)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6b7280] text-[11px]">{labels.noUtilities[language]}</p>
        )}
      </Section>

      <Section title={labels.financialDetails[language]}>
        <Grid3>
          <Field label={labels.currency[language]} value={safe(fd.financialDetailsCurrency?.code)} />
          {currentTransType === "sale" && (
            <Field label={labels.price[language]} value={formatNumber(fd.financialDetailsPrice)} />
          )}
          {currentTransType === "lease" && (
            <>
              <Field label={labels.leasePrice[language]} value={formatNumber(fd.financialDetailsLeasePrice)} />
              <Field label={labels.contractLength[language]} value={safe(fd.financialDetailsContractLength)} />
            </>
          )}
          {currentTransType === "home stay" && (
            <>
              <Field label={labels.pricePerNight[language]} value={formatNumber(fd.financialDetailsPricePerNight)} />
              <Field label={labels.checkIn[language]} value={formatDMY(fd.financialDetailsCheckIn)} />
              <Field label={labels.checkOut[language]} value={formatDMY(fd.financialDetailsCheckOut)} />
            </>
          )}
          <Field label={labels.deposit[language]} value={safe(fd.financialDetailsDeposit)} />
          <Field label={labels.paymentTerms[language]} value={safe(fd.financialDetailsPaymentTerms)} />
          {currentTransType === "sale" ? (
            <Field label={labels.contractTerms[language]} value={safe(fd.financialDetailsContractTerms)} />
          ) : (
            <>
              <Field label="Agent Fee" value={safe(fd.financialDetailsAgentFee)} />
              <Field label="Agent Payment Agenda" value={safe(fd.financialDetailsAgentPaymentAgenda)} />
            </>
          )}
        </Grid3>
      </Section>

      <Section title={labels.contactManagement[language]}>
        <Grid3>
          <Field label={labels.owner[language]} value={safe(cm.contactManagementOwnerId?.ownerName)} />
          <Field label={labels.ownerNotes[language]} value={safe(cm.contactManagementLandlordNotes)} />
          <Field label={labels.consultant[language]} value={safe(cm.contactManagementConsultantId?.firstName)} />
          {currentTransType === "home stay" && (
            <Field label={labels.connectingPoint[language]} value={safe(cm.contactManagementConnectingPoint)} />
          )}
          <Field label={labels.internalNotes[language]} value={safe(cm.contactManagementInternalNotes)} isTextArea />
        </Grid3>
      </Section>
    </div>
  );
};

const PDFDocument = ({ property }) => (
  <div id="pdf-content" className="w-full bg-white">
    <PropertyPDFTemplate property={property} language="en" />
    <div style={{ breakBefore: 'page', pageBreakBefore: 'always' }} />
    <PropertyPDFTemplate property={property} language="vi" />
  </div>
);

export const downloadPropertyDetails = async (property, language = "en") => {
  return new Promise((resolve, reject) => {
    try {
      // Create a hidden div to render the React component
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "0";
      container.style.left = "0";
      container.style.zIndex = "-9999";
      container.style.opacity = "0.01";
      container.style.width = "720px";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);

      const root = createRoot(container);

      // Render the component
      root.render(<PDFDocument property={property} />);

      // Temporarily override oklch variables to fix html2canvas crash
      const styleEl = document.createElement("style");
      styleEl.innerHTML = `
        :root, body, * {
          box-sizing: border-box !important;
          --background: #ffffff !important;
          --foreground: #111827 !important;
          --card: #ffffff !important;
          --card-foreground: #111827 !important;
          --popover: #ffffff !important;
          --popover-foreground: #111827 !important;
          --primary: #41398b !important;
          --primary-foreground: #ffffff !important;
          --secondary: #e5e7eb !important;
          --secondary-foreground: #111827 !important;
          --muted: #f3f4f6 !important;
          --muted-foreground: #6b7280 !important;
          --accent: #f3f4f6 !important;
          --accent-foreground: #111827 !important;
          --destructive: #ef4444 !important;
          --border: #e5e7eb !important;
          --input: #e5e7eb !important;
          --ring: #3b82f6 !important;
          --chart-1: #3b82f6 !important;
          --chart-2: #10b981 !important;
          --chart-3: #f59e0b !important;
          --chart-4: #ef4444 !important;
          --chart-5: #8b5cf6 !important;
          --sidebar: #ffffff !important;
          --sidebar-foreground: #111827 !important;
          --sidebar-primary: #41398b !important;
          --sidebar-primary-foreground: #ffffff !important;
          --sidebar-accent: #f3f4f6 !important;
          --sidebar-accent-foreground: #111827 !important;
          --sidebar-border: #e5e7eb !important;
          --sidebar-ring: #3b82f6 !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Wait a moment for React to render
      setTimeout(() => {
        const element = container.querySelector("#pdf-content");
        
        const opt = {
          margin: 10,
          filename: `Property_${property?.listingInformation?.listingInformationPropertyId || "Details"}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1024, scrollX: 0, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
          .set(opt)
          .from(element)
          .output('blob')
          .then(async (pdfBlob) => {
            // Clean up DOM immediately
            document.head.removeChild(styleEl);
            root.unmount();
            document.body.removeChild(container);

            try {
              const zip = new JSZip();
              const filename = opt.filename.replace('.pdf', '');
              
              // Add PDF to zip
              zip.file(`${filename}.pdf`, pdfBlob);

              // Explicitly create folders
              const imgFolder = zip.folder("Images");
              const vidFolder = zip.folder("Videos");

              // Fetch and add images
              const images = property?.imagesVideos?.propertyImages || [];
              if (images.length > 0) {
                await Promise.all(images.map(async (imgPath, index) => {
                  if (!imgPath) return;
                  const url = getImageUrl(imgPath);
                  const blob = await fetchFile(url);
                  if (blob) {
                    const cleanPath = imgPath.split('?')[0];
                    const ext = cleanPath.split('.').pop() || 'jpg';
                    const finalExt = ext.length > 4 ? 'jpg' : ext;
                    imgFolder.file(`Image_${index + 1}.${finalExt}`, blob);
                  }
                }));
              }

              // Fetch and add videos
              const videos = property?.imagesVideos?.propertyVideo || [];
              let debugText = `Property ID: ${property?._id}\n`;
              debugText += `Images count: ${images.length}\n`;
              debugText += `Videos count: ${videos.length}\n`;
              debugText += `Videos type: ${typeof videos}\n`;
              debugText += `Videos value: ${JSON.stringify(videos)}\n\n`;

              if (videos.length > 0) {
                // Ensure it's treated as an array even if it's a string
                const videoArray = Array.isArray(videos) ? videos : [videos];
                await Promise.all(videoArray.map(async (vidPath, index) => {
                  if (!vidPath) {
                    debugText += `Video ${index}: Empty path\n`;
                    return;
                  }
                  const url = getImageUrl(vidPath);
                  debugText += `Video ${index}: Fetching ${url}\n`;
                  try {
                    const blob = await fetchFile(url);
                    if (blob) {
                      debugText += `Video ${index}: Success! Blob size: ${blob.size}\n`;
                      const cleanPath = vidPath.split('?')[0];
                      const ext = cleanPath.split('.').pop() || 'mp4';
                      const finalExt = ext.length > 4 ? 'mp4' : ext;
                      vidFolder.file(`Video_${index + 1}.${finalExt}`, blob);
                    } else {
                      debugText += `Video ${index}: Failed (blob is null)\n`;
                    }
                  } catch (e) {
                    debugText += `Video ${index}: Error - ${e.message}\n`;
                  }
                }));
              }
              
              zip.file("debug_download.txt", debugText);

              // Generate zip and download
              const zipBlob = await zip.generateAsync({ type: "blob" });
              saveAs(zipBlob, `${filename}.zip`);
              resolve({ success: true });
            } catch (zipError) {
              console.error("Error creating zip:", zipError);
              reject(zipError);
            }
          })
          .catch((err) => {
            console.error("PDF generation error:", err);
            document.head.removeChild(styleEl);
            root.unmount();
            document.body.removeChild(container);
            reject(err);
          });
      }, 500); // 500ms delay to ensure rendering is complete
    } catch (error) {
      console.error("Error setting up PDF download:", error);
      reject(error);
    }
  });
};
