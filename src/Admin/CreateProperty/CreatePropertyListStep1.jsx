import React, { useState, useEffect, useCallback, memo } from "react";
import { ArrowLeft, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
    getAllProperties,
    getAllZoneSubAreas,
    getAllPropertyTypes,
    getAllAvailabilityStatuses,
    getAllUnits,
    getAllFurnishings,
    getAllParkings,
    getAllPetPolicies,
} from "../../Api/action";

// =====================
// MEMOIZED INPUT FIELD
// =====================
const Input = memo(({ label, name, type = "text", value, onChange, placeholder }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
            {label} {<span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
        />
    </div>
));

// =====================
// MEMOIZED SELECT FIELD
// =====================
const Select = memo(({ label, name, value, onChange, options = [], placeholder, lang }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
            {label} {<span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value || ""}
                onChange={onChange}
                className="appearance-none border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
            >
                <option value="">{placeholder || (lang === "en" ? "Select" : "Chọn")}</option>
                {options.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                        {lang === "vi" ? opt.name?.vi || "Chưa đặt tên" : opt.name?.en || "Unnamed"}
                    </option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>
    </div>
));

export default function CreatePropertyListStep1({ onNext, initialData = {} }) {
    const [lang, setLang] = useState("en");
    const [form, setForm] = useState({
        ...initialData,
        amenities: initialData.amenities || [{ name: "", km: "" }],
        utilities: initialData.utilities || [{ name: "", icon: "" }],
    });
    const [dropdowns, setDropdowns] = useState({
        properties: [],
        zones: [],
        types: [],
        statuses: [],
        units: [],
        furnishings: [],
        parkings: [],
        pets: [],
    });

    // Fetch dropdown data once
    useEffect(() => {
        let mounted = true;
        async function fetchAll() {
            try {
                const [
                    propRes,
                    zoneRes,
                    typeRes,
                    statusRes,
                    unitRes,
                    furnRes,
                    parkRes,
                    petRes,
                ] = await Promise.all([
                    getAllProperties(),
                    getAllZoneSubAreas(),
                    getAllPropertyTypes(),
                    getAllAvailabilityStatuses(),
                    getAllUnits(),
                    getAllFurnishings(),
                    getAllParkings(),
                    getAllPetPolicies(),
                ]);

                if (mounted) {
                    setDropdowns({
                        properties: propRes.data?.data || [],
                        zones: zoneRes.data?.data || [],
                        types: typeRes.data?.data || [],
                        statuses: statusRes.data?.data || [],
                        units: unitRes.data?.data || [],
                        furnishings: furnRes.data?.data || [],
                        parkings: parkRes.data?.data || [],
                        pets: petRes.data?.data || [],
                    });
                }
            } catch (err) {
                console.error("Error loading dropdowns", err);
            }
        }
        fetchAll();
        return () => {
            mounted = false;
        };
    }, []);

    // Handlers
    const handleChange = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleInputChange = useCallback(
        (e) => handleChange(e.target.name, e.target.value),
        [handleChange]
    );

    const handleAmenityChange = useCallback((i, f, v) => {
        setForm((p) => {
            const u = [...p.amenities];
            u[i][f] = v;
            return { ...p, amenities: u };
        });
    }, []);

    const addAmenity = useCallback(
        () => setForm((p) => ({ ...p, amenities: [...p.amenities, { name: "", km: "" }] })),
        []
    );
    const removeAmenity = useCallback(
        (i) => setForm((p) => ({ ...p, amenities: p.amenities.filter((_, x) => x !== i) })),
        []
    );

    const handleUtilityChange = useCallback((i, f, v) => {
        setForm((p) => {
            const u = [...p.utilities];
            u[i][f] = v;
            return { ...p, utilities: u };
        });
    }, []);

    const addUtility = useCallback(
        () => setForm((p) => ({ ...p, utilities: [...p.utilities, { name: "", icon: "" }] })),
        []
    );
    const removeUtility = useCallback(
        (i) => setForm((p) => ({ ...p, utilities: p.utilities.filter((_, x) => x !== i) })),
        []
    );

    const t = {
        listingInfo: lang === "en" ? "Listing Information" : "Thông Tin Niêm Yết",
        propertyInfo: lang === "en" ? "Property Information" : "Thông Tin Bất Động Sản",
        whatsNearby: lang === "en" ? "What's Nearby?" : "Gần Đây Có Gì?",
        nearbyAmenity: lang === "en" ? "Nearby Amenity Name" : "Tên Tiện Ích Lân Cận",
        km: "KM",
        description: lang === "en" ? "Description" : "Mô Tả",
        propertyUtility: lang === "en" ? "Property Utility" : "Tiện Ích Bất Động Sản",
        utilityName: lang === "en" ? "Utility Name" : "Tên Tiện Ích",
        selectIcon: lang === "en" ? "Select Icon" : "Chọn Biểu Tượng",
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f3f6] p-10">

            {/* Language Toggle */}
            <div className="flex mb-6 border-b border-gray-200">
                {["en", "vi"].map((lng) => (
                    <button
                        key={lng}
                        className={`px-6 py-2 text-sm font-medium ${lang === lng
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-black"
                            }`}
                        onClick={() => setLang(lng)}
                    >
                        {lng === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
                    </button>
                ))}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* Listing Info */}
                <h2 className="text-lg font-semibold mb-4">{t.listingInfo}</h2>
                <div className="grid grid-cols-3 gap-5">
                    <Input label="Property ID" name="propertyId" value={form.propertyId} onChange={handleInputChange} />
                    <Select label="Transaction Type" name="transactionType" lang={lang} value={form.transactionType} onChange={handleInputChange}
                        options={[{ _id: "sell", name: { en: "Sell", vi: "Bán" } }, { _id: "lease", name: { en: "Lease", vi: "Cho Thuê" } }]} />
                    <Select label="Project / Community" name="projectId" lang={lang} options={dropdowns.properties} value={form.projectId} onChange={handleInputChange} />
                    <Select label="Zone / Sub-area" name="zoneId" lang={lang} options={dropdowns.zones} value={form.zoneId} onChange={handleInputChange} />
                    <Input label="Property Title" name="title" value={form.title} onChange={handleInputChange} />
                    <Select label="Property Type" name="propertyType" lang={lang} options={dropdowns.types} value={form.propertyType} onChange={handleInputChange} />
                    <Select label="Country" name="country" lang={lang} options={[{ _id: "VN", name: { en: "Vietnam", vi: "Việt Nam" } }, { _id: "IN", name: { en: "India", vi: "Ấn Độ" } }]} value={form.country} onChange={handleInputChange} />
                    <Input label="State" name="state" value={form.state} onChange={handleInputChange} />
                    <Input label="City" name="city" value={form.city} onChange={handleInputChange} />
                    <Input label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleInputChange} />
                    <Input label="Address" name="address" value={form.address} onChange={handleInputChange} />
                    <Input label="Date Listed" name="dateListed" type="date" value={form.dateListed} onChange={handleInputChange} />
                    <Select label="Availability Status" name="availabilityStatus" lang={lang} options={dropdowns.statuses} value={form.availabilityStatus} onChange={handleInputChange} />
                    <Input label="Available From" name="availableFrom" type="date" value={form.availableFrom} onChange={handleInputChange} />
                </div>

                {/* Property Info */}
                <h2 className="text-lg font-semibold mt-8 mb-4">{t.propertyInfo}</h2>
                <div className="grid grid-cols-3 gap-5">
                    <Select label="Unit" name="unit" lang={lang} options={dropdowns.units} value={form.unit} onChange={handleInputChange} />
                    <Input label="Unit Size" name="unitSize" value={form.unitSize} onChange={handleInputChange} />
                    <Input label="Bedrooms" name="bedrooms" value={form.bedrooms} onChange={handleInputChange} />
                    <Input label="Bathrooms" name="bathrooms" value={form.bathrooms} onChange={handleInputChange} />
                    <Input label="Floors" name="floors" value={form.floors} onChange={handleInputChange} />
                    <Input label="Floor Number" name="floorNumber" value={form.floorNumber} onChange={handleInputChange} />
                    <Select label="Furnishing" name="furnishing" lang={lang} options={dropdowns.furnishings} value={form.furnishing} onChange={handleInputChange} />
                    <Input label="Year Built" name="yearBuilt" type="date" value={form.yearBuilt} onChange={handleInputChange} />
                    <Input label="View" name="view" value={form.view} onChange={handleInputChange} />
                    <Select label="Parking Availability" name="parkingAvailability" lang={lang} options={dropdowns.parkings} value={form.parkingAvailability} onChange={handleInputChange} />
                    <Select label="Pet Policy" name="petPolicy" lang={lang} options={dropdowns.pets} value={form.petPolicy} onChange={handleInputChange} />
                </div>

                {/* What's Nearby */}
                <h2 className="text-lg font-semibold mt-8 mb-4">{t.whatsNearby}</h2>
                <textarea
                    name="whatsNearby"
                    value={form.whatsNearby || ""}
                    onChange={(e) => handleChange("whatsNearby", e.target.value)}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-gray-300 outline-none"
                    placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                />

                {/* Amenities */}
                <div className="mt-6">
                    {form.amenities.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <Input label={t.nearbyAmenity} value={a.name} onChange={(e) => handleAmenityChange(i, "name", e.target.value)} />
                            <Input label={t.km} value={a.km} onChange={(e) => handleAmenityChange(i, "km", e.target.value)} />
                            {i > 0 && (
                                <button onClick={() => removeAmenity(i)} className="p-2 mt-5 text-red-500 hover:bg-red-50 rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={addAmenity} className="flex items-center gap-2 text-sm text-gray-700 hover:text-black">
                        <Plus className="w-4 h-4" /> Add Amenity
                    </button>
                </div>

                {/* Description */}
                <h2 className="text-lg font-semibold mt-8 mb-4">{t.description}</h2>
                <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-gray-300 outline-none"
                    placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                />

                {/* Utilities */}
                <h2 className="text-lg font-semibold mt-8 mb-4">{t.propertyUtility}</h2>
                {form.utilities.map((u, i) => (
                    <div key={i} className="grid grid-cols-2 gap-5 mb-3 items-end">
                        <Input label={t.utilityName} value={u.name} onChange={(e) => handleUtilityChange(i, "name", e.target.value)} />
                        <Select label={t.selectIcon} lang={lang} value={u.icon} onChange={(e) => handleUtilityChange(i, "icon", e.target.value)}
                            options={[{ _id: "wifi", name: { en: "WiFi", vi: "WiFi" } }, { _id: "pool", name: { en: "Swimming Pool", vi: "Hồ Bơi" } }, { _id: "gym", name: { en: "Gym", vi: "Phòng Gym" } }]} />
                        {i > 0 && (
                            <button onClick={() => removeUtility(i)} className="p-2 mt-1 text-red-500 hover:bg-red-50 rounded-full">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={addUtility} className="flex items-center gap-2 text-sm text-gray-700 hover:text-black">
                    <Plus className="w-4 h-4" /> Add Utility
                </button>
            </div>
            <div className="mt-10 flex justify-end">
                <button
                    onClick={() => onNext(form)} // ✅ send step 1 data to parent
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                    Next →
                </button>
            </div>

        </div>
    );
}
