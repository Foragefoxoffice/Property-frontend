import React, { useState } from "react";
import { Plus, X, Eye, RotateCw } from "lucide-react";

export default function CreatePropertyListStep2({ onNext, onPrev, initialData = {} }) {
    const [lang, setLang] = useState("en");

    const labels = {
        en: {
            propertyImages: "Property Images",
            propertyVideo: "Property Video",
            floorPlan: "Floor Plan",
            recommendedImg: "Recommended: (jpg, jpeg, png, webp, svg)",
            recommendedVid: "Recommended: (mp4, webm, mov, avi, mkv)",
            clickUpload: "Click here to upload",
            financialDetails: "Financial details",
            currency: "Currency",
            price: "Price",
            pricePerUnit: "Price per unit",
            contractTerms: "Contract Terms",
            depositTerms: "Deposit / Payment Terms",
            maintenance: "Maintenance Fee / Service Charge (Monthly)",
        },
        vi: {
            propertyImages: "Hình Ảnh Bất Động Sản",
            propertyVideo: "Video Bất Động Sản",
            floorPlan: "Sơ Đồ Mặt Bằng",
            recommendedImg: "Đề xuất: (jpg, jpeg, png, webp, svg)",
            recommendedVid: "Đề xuất: (mp4, webm, mov, avi, mkv)",
            clickUpload: "Nhấn để tải lên",
            financialDetails: "Chi Tiết Tài Chính",
            currency: "Tiền Tệ",
            price: "Giá",
            pricePerUnit: "Giá mỗi đơn vị",
            contractTerms: "Điều Khoản Hợp Đồng",
            depositTerms: "Điều Khoản / Thanh Toán",
            maintenance: "Phí Bảo Trì / Dịch Vụ (Hàng Tháng)",
        },
    };
    const t = labels[lang];

    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [floorPlans, setFloorPlans] = useState([]);

    const handleFileUpload = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);

        if (type === "image") setImages((prev) => [...prev, { file, url }]);
        if (type === "video") setVideos((prev) => [...prev, { file, url }]);
        if (type === "floor") setFloorPlans((prev) => [...prev, { file, url }]);
    };

    const handleRemove = (type, index) => {
        if (type === "image")
            setImages((prev) => prev.filter((_, i) => i !== index));
        if (type === "video")
            setVideos((prev) => prev.filter((_, i) => i !== index));
        if (type === "floor")
            setFloorPlans((prev) => prev.filter((_, i) => i !== index));
    };

    const UploadBox = ({ label, recommended, files, type, accept }) => (
        <div className="mb-8">
            <p className="font-semibold text-gray-800 mb-1">{label}</p>
            <p className="text-xs text-gray-500 mb-3">{recommended}</p>
            <div className="flex flex-wrap gap-4">
                {files.map((f, i) => (
                    <div
                        key={i}
                        className="relative w-56 h-40 rounded-xl overflow-hidden border"
                    >
                        {type === "video" ? (
                            <video
                                src={f.url}
                                className="w-full h-full object-cover"
                                controls
                            />
                        ) : (
                            <img src={f.url} className="w-full h-full object-cover" />
                        )}
                        <button
                            onClick={() => handleRemove(type, i)}
                            className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                ))}

                {/* Upload Box */}
                <label className="w-56 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-500 transition">
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-sm">{t.clickUpload}</span>
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileUpload(e, type)}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Language Tabs */}
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

            {/* Upload Sections */}
            <UploadBox
                label={t.propertyImages}
                recommended={t.recommendedImg}
                files={images}
                type="image"
                accept="image/*"
            />
            <UploadBox
                label={t.propertyVideo}
                recommended={t.recommendedVid}
                files={videos}
                type="video"
                accept="video/*"
            />
            <UploadBox
                label={t.floorPlan}
                recommended={t.recommendedImg}
                files={floorPlans}
                type="floor"
                accept="image/*"
            />

            {/* Financial Details */}
            <h2 className="text-lg font-semibold mt-8 mb-4">{t.financialDetails}</h2>
            <div className="grid grid-cols-3 gap-5">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        {t.currency}
                    </label>
                    <select className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none">
                        <option value="USD">USD</option>
                        <option value="VND">VND</option>
                        <option value="INR">INR</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        {t.price} *
                    </label>
                    <input
                        type="text"
                        placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        {t.pricePerUnit} *
                    </label>
                    <input
                        type="text"
                        placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        {t.contractTerms}
                    </label>
                    <input
                        type="text"
                        placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        {t.depositTerms} *
                    </label>
                    <input
                        type="text"
                        placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        {t.maintenance} *
                    </label>
                    <input
                        type="text"
                        placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
                    />
                </div>
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
                            media: [
                                ...images.map((i) => ({ url: i.url, type: "image" })),
                                ...videos.map((v) => ({ url: v.url, type: "video" })),
                                ...floorPlans.map((f) => ({ url: f.url, type: "floorplan" })),
                            ],
                            financialDetails: {
                                currency: { en: "USD", vi: "USD" },
                                price: { en: "500000", vi: "500000" },
                                pricePerUnit: { en: "1000", vi: "1000" },
                                contractTerms: { en: "6 months", vi: "6 tháng" },
                                depositTerms: { en: "50% upfront", vi: "50% trước" },
                                maintenanceFee: { en: "100/month", vi: "100/tháng" },
                            },
                        })
                    }
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                    Next →
                </button>
            </div>

        </div>
    );
}
