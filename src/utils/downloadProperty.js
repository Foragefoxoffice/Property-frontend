import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import logoImg from '../assets/image/footer_logo.png';

export const downloadPropertyDetails = async (property, language = "en") => {
  try {
    const zip = new JSZip();

    // 1. Fetch Logo and Hero Image
    let logoBase64 = null;
    try {
      const response = await fetch(logoImg);
      const blob = await response.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to load logo", e);
    }

    const images = property.imagesVideos?.propertyImages || [];
    let heroImageBase64 = null;
    let heroImageFormat = 'JPEG';
    const imgFolder = zip.folder("Images");

    if (images.length > 0) {
      const promises = images.map(async (imgUrl, index) => {
        try {
          if (!imgUrl) return;

          // Ensure absolute URL if the path is relative
          let fullImgUrl = imgUrl;
          if (!fullImgUrl.startsWith('http')) {
            const baseUrl = import.meta.env.VITE_API_URL 
              ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
              : 'https://api.183housingsolutions.com';
            fullImgUrl = `${baseUrl}/${imgUrl.replace(/^\//, '')}`;
          }

          const response = await fetch(fullImgUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          
          let ext = fullImgUrl.split('?')[0].split('.').pop().toLowerCase();
          if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
            ext = 'jpg';
          }

          if (index === 0) {
            heroImageFormat = ext === 'png' ? 'PNG' : 'JPEG';
            heroImageBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }

          imgFolder.file(`image_${index + 1}.${ext}`, blob);
        } catch (error) {
          console.error(`Failed to fetch image: ${imgUrl} (tried ${imgUrl})`, error);
        }
      });
      await Promise.all(promises);
    }

    // 2. Generate PDF using jsPDF directly
    const doc = new jsPDF();
    const info = property.listingInformation || {};
    const propInfo = property.propertyInformation || {};
    const finDetails = property.financialDetails || {};
    const contact = property.contactManagement || {};
    const nearby = property.whatNearby || {};

    const getLocal = (field) => {
      if (!field) return "—";
      if (typeof field === "string") return field;
      return field[language] || field.en || "—";
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
    };

    let cursorY = 15;

    // Draw beautiful header with theme color #41398B
    doc.setFillColor(65, 57, 139);
    doc.rect(0, 0, 210, 28, 'F');

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 8, 40, 12);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(info.listingInformationPropertyId || "Property Details", 196, 18, { align: "right" });

    cursorY = 36;

    // Property Title & Subtitle
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.setFontSize(16);
    const propTitle = getLocal(info.listingInformationPropertyTitle);
    if (propTitle !== "—") {
      doc.text(propTitle, 14, cursorY);
      cursorY += 6;
    }

    doc.setTextColor(107, 114, 128); // Gray 500
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const subtitle = `${getLocal(info.listingInformationTransactionType)} • ${getLocal(info.listingInformationAvailabilityStatus)}`;
    doc.text(subtitle.toUpperCase(), 14, cursorY);
    cursorY += 10;

    // Hero Image
    if (heroImageBase64) {
      // 182 = 210 - (14 * 2) margins
      doc.addImage(heroImageBase64, heroImageFormat, 14, cursorY, 182, 100);
      cursorY += 105;
    }

    // Prepare data
    const createRow = (label, value) => {
      const cleanVal = (value === null || value === undefined) ? "—" : String(value).trim();
      return cleanVal !== "—" && cleanVal !== "" ? { label, value: cleanVal } : null;
    };

    const currency = finDetails.financialDetailsCurrency || "USD";

    const listingData = [
      createRow("Property ID", info.listingInformationPropertyId),
      createRow("Property No", getLocal(info.listingInformationPropertyNo)),
      createRow("Transaction Type", getLocal(info.listingInformationTransactionType)),
      createRow("Property Type", getLocal(info.listingInformationPropertyType)),
      createRow("Status", getLocal(info.listingInformationAvailabilityStatus)),
      createRow("Date Listed", formatDate(info.listingInformationDateListed)),
      createRow("Available From", formatDate(info.listingInformationAvailableFrom)),
      createRow("Project / Community", getLocal(info.listingInformationProjectCommunity)),
      createRow("Zone / Sub Area", getLocal(info.listingInformationZoneSubArea)),
      createRow("Block Name", getLocal(info.listingInformationBlockName)),
    ].filter(Boolean);

    const propData = [
      createRow("Unit", getLocal(propInfo.informationUnit)),
      createRow("Unit Size", propInfo.informationUnitSize ? `${propInfo.informationUnitSize} sqm` : null),
      createRow("Bedrooms", propInfo.informationBedrooms),
      createRow("Bathrooms", propInfo.informationBathrooms),
      createRow("Floors", propInfo.informationFloors),
      createRow("Furnishing", getLocal(propInfo.informationFurnishing)),
      createRow("View", getLocal(propInfo.informationView)),
    ].filter(Boolean);

    const finData = [
      finDetails.financialDetailsPrice ? createRow("Price", `${currency} ${finDetails.financialDetailsPrice}`) : null,
      finDetails.financialDetailsLeasePrice ? createRow("Lease Price", `${currency} ${finDetails.financialDetailsLeasePrice}`) : null,
      finDetails.financialDetailsPricePerNight ? createRow("Price / Night", `${currency} ${finDetails.financialDetailsPricePerNight}`) : null,
      createRow("Terms", getLocal(finDetails.financialDetailsTerms)),
      createRow("Deposit", getLocal(finDetails.financialDetailsDeposit)),
      createRow("Main Fee", getLocal(finDetails.financialDetailsMainFee)),
      createRow("Contract Length", getLocal(finDetails.financialDetailsContractLength)),
      createRow("Check In", finDetails.financialDetailsCheckIn),
      createRow("Check Out", finDetails.financialDetailsCheckOut),
      createRow("Agent Fee", getLocal(finDetails.financialDetailsAgentFee)),
      createRow("Fee & Tax", getLocal(finDetails.financialDetailsFeeTax)),
      createRow("Legal Document", getLocal(finDetails.financialDetailsLegalDoc)),
    ].filter(Boolean);

    const contactData = [
      createRow("Owner Name", getLocal(contact.contactManagementOwner)),
      createRow("Owner Phone", contact.contactManagementOwnerPhone?.join(", ")),
      createRow("Owner Notes", getLocal(contact.contactManagementOwnerNotes)),
      createRow("Consultant", getLocal(contact.contactManagementConsultant)),
      createRow("Connecting Point", getLocal(contact.contactManagementConnectingPoint)),
      createRow("Connecting Point Notes", getLocal(contact.contactManagementConnectingPointNotes)),
      createRow("Internal Notes", getLocal(contact.contactManagementInternalNotes)),
      createRow("Source", getLocal(contact.contactManagementSource)),
    ].filter(Boolean);

    // Combine data into 4-column tables (2 column visual layout)
    const generateTableBody = (data1, data2) => {
      const maxLen = Math.max(data1.length, data2.length);
      const rows = [];
      for (let i = 0; i < maxLen; i++) {
        const item1 = data1[i] || { label: "", value: "" };
        const item2 = data2[i] || { label: "", value: "" };
        rows.push([item1.label, item1.value, item2.label, item2.value]);
      }
      return rows;
    };

    const drawSection = (title1, data1, title2, data2) => {
      if (data1.length === 0 && data2.length === 0) return;

      const bodyRows = generateTableBody(data1, data2);

      autoTable(doc, {
        startY: cursorY,
        head: [[title1.toUpperCase(), "", title2.toUpperCase(), ""]],
        body: bodyRows,
        theme: 'plain',
        headStyles: {
          fillColor: [243, 244, 246], // Tailwind gray-100
          textColor: [65, 57, 139], // Theme color
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 3,
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [229, 231, 235],
          lineWidth: { bottom: 0.1 }
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: 'bold', textColor: [75, 85, 99] },
          1: { textColor: [17, 24, 39] },
          2: { cellWidth: 38, fontStyle: 'bold', textColor: [75, 85, 99] },
          3: { textColor: [17, 24, 39] }
        },
        willDrawCell: function (data) {
          // If empty cell, don't draw bottom border
          if (data.row.section === 'body' && !data.cell.raw) {
            data.cell.styles.lineWidth = 0;
          }
        },
        didDrawPage: function (data) {
          cursorY = data.cursor.y + 10;
        }
      });
    };

    drawSection("Listing Information", listingData, "Property Information", propData);
    drawSection("Financial Details", finData, "Contact Management", contactData);

    // Utilities & Nearby
    let utilsHtml = [];
    if (property.propertyUtility && property.propertyUtility.length > 0) {
      const utilsList = property.propertyUtility.map(u => getLocal(u.propertyUtilityUnitName)).filter(Boolean).join(", ");
      utilsHtml = [createRow("Utilities", utilsList)].filter(Boolean);
    }

    let nearbyHtml = [];
    const nearbyDesc = getLocal(nearby.whatNearbyDescription);
    if (nearbyDesc && nearbyDesc !== "—") {
      nearbyHtml = [createRow("Description", nearbyDesc)].filter(Boolean);
    }

    if (utilsHtml.length > 0 || nearbyHtml.length > 0) {
      drawSection("Utilities & Amenities", utilsHtml, "What's Nearby", nearbyHtml);
    }

    // Add Page Numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Page ${i} of ${pageCount} - Generated by 183 Housing Solutions`, 105, 290, { align: "center" });
    }

    const pdfBlob = doc.output('blob');
    zip.file(`Property_${info.listingInformationPropertyId || "Details"}.pdf`, pdfBlob);

    // 3. Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Property_${info.listingInformationPropertyId || "Archive"}.zip`);
    return { success: true };
  } catch (error) {
    console.error("Error generating property archive:", error);
    return { success: false, error };
  }
};
