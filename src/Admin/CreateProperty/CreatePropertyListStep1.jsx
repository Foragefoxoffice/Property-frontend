import React, { useState, useEffect, useCallback, memo } from "react";
import { ArrowRight, ChevronDown, CirclePlus, Trash2 } from "lucide-react";
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
import { Select as AntdSelect } from "antd";
import iconOptions from "../../data/iconOptions";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";


/* ======================================================
   REUSABLE INPUT COMPONENTS
====================================================== */
const Input = memo(
  ({ label, name, type = "text", value, onChange, placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder || ""}
        className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
      />
    </div>
  )
);

const Select = memo(({ label, name, value, onChange, options = [], lang }) => (
  <div className="flex flex-col">
    <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="appearance-none border border-[#B2B2B3] h-12 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white"
      >
        <option value="">{lang === "en" ? "Select" : "Chọn"}</option>
        {options.map((opt) => {
          // 👇 If this dropdown is for "unit", show symbol instead of name
          const displayValue =
            name === "unit"
              ? lang === "vi"
                ? opt.symbol?.vi || "—"
                : opt.symbol?.en || "—"
              : lang === "vi"
                ? opt.name?.vi || "Chưa đặt tên"
                : opt.name?.en || "Unnamed";

          return (
            <option key={opt._id} value={opt._id}>
              {displayValue}
            </option>
          );
        })}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
    </div>
  </div>
));

/* ======================================================
   LOCALIZED INPUT + TEXTAREA
====================================================== */
const LocalizedInput = memo(
  ({ label, name, lang, value, onChange, placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label} ({lang === "en" ? "English" : "Tiếng Việt"})
      </label>
      <input
        name={name}
        value={value || ""}
        onChange={(e) => onChange(lang, name, e.target.value)}
        placeholder={
          placeholder || (lang === "en" ? "Type here" : "Nhập tại đây")
        }
        className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
      />
    </div>
  )
);

const LocalizedTextarea = memo(
  ({ label, name, lang, value, onChange, placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label} ({lang === "en" ? "English" : "Tiếng Việt"})
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={(e) => onChange(lang, name, e.target.value)}
        placeholder={
          placeholder || (lang === "en" ? "Type here" : "Nhập tại đây")
        }
        rows={3}
        className="border border-[#B2B2B3] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
      />
    </div>
  )
);

const DatePicker = memo(({ label, name, value, onChange }) => {
  const [date, setDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    // Only update when value changes externally (e.g., editing an existing record)
    if (value && (!date || new Date(value).getTime() !== date.getTime())) {
      setDate(new Date(value));
    }
  }, [value]);

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    onChange({
      target: {
        name,
        value: selectedDate.toISOString().split("T")[0],
      },
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between
 text-left font-normal h-12 border border-[#B2B2B3] rounded-lg px-3 py-2 ${!date && "text-muted-foreground"
              }`}
          >

            {date ? format(date, "PPP") : <span>Select date</span>}
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            modifiers={{ disabled: { after: new Date(2100, 0, 1) } }}
            initialFocus={false} // 👈 disables auto-focus reset
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

/* ✅ Skeleton Loader Component */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-40 mb-6"></div>
    {[...Array(3)].map((_, sectionIndex) => (
      <div key={sectionIndex} className="mb-8">
        <div className="h-5 bg-[#41398b29] rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 bg-[#41398b29] rounded w-24"></div>
              <div className="h-12 bg-[#41398b29] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div className="flex justify-end mt-10">
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
    </div>
  </div>
);


/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function CreatePropertyListStep1({
  initialData = {},
  onNext,
  onChange,
}) {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    ...initialData,
    blockName: initialData.blockName || { en: "", vi: "" },
    title: initialData.title || { en: "", vi: "" },
    address: initialData.address || { en: "", vi: "" },
    description: initialData.description || { en: "", vi: "" },
    view: initialData.view || { en: "", vi: "" },
    whatsNearby: initialData.whatsNearby || { en: "", vi: "" },
    amenities: initialData.amenities || [{ name: "", km: "" }],
    utilities: initialData.utilities || [{ name: "", icon: "" }],
  });
  const [loading, setLoading] = useState(true);

  /* ✅ Sync when editing an existing property */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        // ensure all localized objects are safe
        blockName: initialData.blockName ||
          prev.blockName || { en: "", vi: "" },
        title: initialData.title || prev.title || { en: "", vi: "" },
        address: initialData.address || prev.address || { en: "", vi: "" },
        description: initialData.description ||
          prev.description || { en: "", vi: "" },
        view: initialData.view || prev.view || { en: "", vi: "" },
        whatsNearby: initialData.whatsNearby ||
          prev.whatsNearby || { en: "", vi: "" },
        utilities:
          initialData.utilities && initialData.utilities.length
            ? initialData.utilities
            : prev.utilities,
      }));
    }
  }, [initialData]);

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

  /* Fetch dropdowns once */
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
          const allUnits = (unitRes.data?.data || []).filter(
            (i) => i.status === "Active"
          );
          const defaultUnit = allUnits.find((u) => u.isDefault);

          setDropdowns({
            properties: (propRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
            zones: (zoneRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
            types: (typeRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
            statuses: (statusRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
            units: allUnits,
            furnishings: (furnRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
            parkings: (parkRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
            pets: (petRes.data?.data || []).filter(
              (i) => i.status === "Active"
            ),
          });

          // ✅ Auto-select default unit if not already selected
          setForm((prev) => ({
            ...prev,
            unit: prev.unit || defaultUnit?._id || "",
          }));
        }
      } catch (err) {
        console.error("Error loading dropdowns", err);
      }
      finally {
        setLoading(false);
      }
    }
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  /* Handlers */
  const handleInputChange = useCallback(
    (e) => {
      let name, value;

      if (e?.target) {
        name = e.target.name;
        value = e.target.value;
      } else if (typeof e === "object" && e.name) {
        name = e.name;
        value = e.value;
      } else {
        console.warn("handleInputChange: invalid event structure", e);
        return;
      }

      const newForm = { ...form, [name]: value };
      setForm(newForm);
      onChange && onChange(newForm);
    },
    [form, onChange]
  );

  // 🧠 Add this here ↓↓↓
  const handleLocalizedChange = useCallback((lang, field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { en: "", vi: "" }), [lang]: value },
    }));
  }, []);

  const handleUtilityChange = (i, f, v) =>
    setForm((p) => {
      const u = [...p.utilities];
      u[i][f] = v;
      return { ...p, utilities: u };
    });

  const addUtility = () =>
    setForm((p) => ({
      ...p,
      utilities: [...p.utilities, { name: "", icon: "" }],
    }));

  const removeUtility = (i) =>
    setForm((p) => ({
      ...p,
      utilities: p.utilities.filter((_, x) => x !== i),
    }));

  const t = {
    listingInfo: lang === "en" ? "Listing Information" : "Thông Tin Niêm Yết",
    propertyInfo:
      lang === "en" ? "Property Information" : "Thông Tin Bất Động Sản",
    whatsNearby: lang === "en" ? "What's Nearby?" : "Gần Đây Có Gì?",
    description: lang === "en" ? "Description" : "Mô Tả",
    propertyUtility:
      lang === "en" ? "Property Utility" : "Tiện Ích Bất Động Sản",
  };

  const { Option } = AntdSelect;

  const [searchValue, setSearchValue] = useState("");

  // Filter + prioritize dynamically
  const filteredIcons = iconOptions
    .filter((opt) =>
      opt.labelText.toLowerCase().includes(searchValue.toLowerCase())
    )
    .sort((a, b) => {
      const q = searchValue.toLowerCase();
      const aText = a.labelText.toLowerCase();
      const bText = b.labelText.toLowerCase();
      const aStarts = aText.startsWith(q);
      const bStarts = bText.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aText.localeCompare(bText);
    });

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
      {/* Language Toggle */}
      <div className="flex mb-6 border-b border-gray-200">
        {["en", "vi"].map((lng) => (
          <button
            key={lng}
            className={`px-6 py-2 text-sm font-medium ${lang === lng
              ? "border-b-2 border-[#41398B] text-black"
              : "text-gray-500 hover:text-black"
              }`}
            onClick={() => setLang(lng)}
          >
            {lng === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
          </button>
        ))}
      </div>

      {/* Form Section */}
      <div className=" p-8 pt-2">
        {/* === Listing Info === */}
        <h2 className="text-lg font-semibold mb-8">{t.listingInfo}</h2>
        <div className="grid grid-cols-3 gap-8">
          <Select
            label={lang === "en" ? "Transaction Type" : "Loại giao dịch"}
            name="transactionType"
            lang={lang}
            value={form.transactionType || "Sale"}
            onChange={handleInputChange}
            options={[
              { _id: "Sale", name: { en: "Sale", vi: "Bán" } },
              { _id: "Lease", name: { en: "Lease", vi: "Cho thuê" } },
              { _id: "Home stay", name: { en: "Home stay", vi: "Nhà nghỉ" } },
            ]}
          />

          <Input
            label={lang === "en" ? "Property ID" : "Mã bất động sản"}
            name="propertyId"
            placeholder={lang === "en" ? "e.g. P12345" : "ví dụ: P12345"}
            value={form.propertyId}
            onChange={handleInputChange}
          />

          {/* ✅ Correct Project / Zone Selects */}

          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {lang === "en" ? "Project / Community" : "Dự án / Khu dân cư"}
              <span className="text-red-500">*</span>
            </label>

            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en" ? "Search and Select" : "Tìm kiếm và chọn"
              }
              optionFilterProp="children"
              value={form.projectId || undefined}
              onChange={(value) =>
                handleInputChange({ target: { name: "projectId", value } })
              }
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="w-full custom-select focus:ring-2 focus:ring-gray-300"
              popupClassName="custom-dropdown"
            >
              {dropdowns.properties?.map((project) => (
                <Option key={project._id} value={project._id}>
                  {lang === "vi" ? project.name?.vi : project.name?.en}
                </Option>
              ))}
            </AntdSelect>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {lang === "en" ? "Area / Zone" : "Khu vực / Vùng"}
            </label>

            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Area / Zone"
                  : "Nhập hoặc chọn khu vực / vùng"
              }
              value={form.zoneId || undefined}
              onChange={(value) => handleInputChange({ name: "zoneId", value })}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleInputChange({ name: "zoneId", value: val });
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={dropdowns.zones?.map((zone) => ({
                label: lang === "vi" ? zone.name?.vi : zone.name?.en,
                value: zone._id,
              }))}
            />
          </div>

          <LocalizedInput
            label={lang === "en" ? "Block Name" : "Tên khối"}
            name="blockName"
            lang={lang}
            value={form.blockName?.[lang]}
            onChange={handleLocalizedChange}
          />

          <LocalizedInput
            label={lang === "en" ? "Property Title" : "Tiêu đề bất động sản"}
            name="title"
            lang={lang}
            value={form.title?.[lang]}
            onChange={handleLocalizedChange}
          />

          <Select
            label={lang === "en" ? "Property Type" : "Loại bất động sản"}
            name="propertyType"
            lang={lang}
            options={dropdowns.types}
            value={form.propertyType}
            onChange={handleInputChange}
          />

          {/* <Select
            label="Country"
            name="country"
            lang={lang}
            options={[
              { _id: "VN", name: { en: "Vietnam", vi: "Việt Nam" } },
              { _id: "IN", name: { en: "India", vi: "Ấn Độ" } },
            ]}
            value={form.country}
            onChange={handleInputChange}
          /> */}
          {/* <Input
            label="State"
            name="state"
            value={form.state}
            onChange={handleInputChange}
          />
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleInputChange}
          />
          <Input
            label="Postal Code"
            name="postalCode"
            value={form.postalCode}
            onChange={handleInputChange}
          />
          <LocalizedInput
            label="Address"
            name="address"
            lang={lang}
            value={form.address?.[lang]}
            onChange={handleLocalizedChange}
          /> */}
          <DatePicker
            label={lang === "en" ? "Date Listed" : "Ngày niêm yết"}
            name="dateListed"
            value={form.dateListed}
            onChange={handleInputChange}
          />

          <DatePicker
            label={lang === "en" ? "Available From" : "Có sẵn từ"}
            name="availableFrom"
            value={form.availableFrom}
            onChange={handleInputChange}
          />

          <Select
            label={lang === "en" ? "Availability Status" : "Trạng thái sẵn có"}
            name="availabilityStatus"
            lang={lang}
            options={dropdowns.statuses}
            value={form.availabilityStatus}
            onChange={handleInputChange}
          />

        </div>

        {/* === Property Info === */}
        <h2 className="text-lg font-semibold mt-8 mb-4">{t.propertyInfo}</h2>
        <div className="grid grid-cols-3 gap-5">
          <Select
            label={lang === "en" ? "Unit" : "Đơn vị"}
            name="unit"
            lang={lang}
            options={dropdowns.units}
            value={form.unit}
            onChange={handleInputChange}
          />

          <Input
            label={lang === "en" ? "Unit Size" : "Diện tích"}
            name="unitSize"
            value={form.unitSize}
            onChange={handleInputChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />

          <Input
            label={lang === "en" ? "Bedrooms" : "Phòng ngủ"}
            name="bedrooms"
            value={form.bedrooms}
            onChange={handleInputChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />

          <Input
            label={lang === "en" ? "Bathrooms" : "Phòng tắm"}
            name="bathrooms"
            value={form.bathrooms}
            onChange={handleInputChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />

          <Input
            label={lang === "en" ? "Floors" : "Số tầng"}
            name="floors"
            value={form.floors}
            onChange={handleInputChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />

          {/* <Input
            label="Floor Number"
            name="floorNumber"
            value={form.floorNumber}
            onChange={handleInputChange}
          /> */}
          <Select
            label={lang === "en" ? "Furnishing" : "Trang bị nội thất"}
            name="furnishing"
            lang={lang}
            options={dropdowns.furnishings}
            value={form.furnishing}
            onChange={handleInputChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />

          {/* <Input
            label="Year Built"
            name="yearBuilt"
            type="number"
            value={form.yearBuilt}
            onChange={handleInputChange}
          /> */}
          <LocalizedInput
            label={lang === "en" ? "View" : "Hướng nhìn"}
            name="view"
            lang={lang}
            value={form.view?.[lang]}
            onChange={handleLocalizedChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />

          {/* <Select
            label="Parking Availability"
            name="parkingAvailability"
            lang={lang}
            options={dropdowns.parkings}
            value={form.parkingAvailability}
            onChange={handleInputChange}
          /> */}
          {/* <Select
            label="Pet Policy"
            name="petPolicy"
            lang={lang}
            options={dropdowns.pets}
            value={form.petPolicy}
            onChange={handleInputChange}
          /> */}
        </div>

        {/* === What's Nearby === */}
        {/* <h2 className="text-lg font-semibold mt-8 mb-4">{t.whatsNearby}</h2>
        <LocalizedTextarea
          label="What's Nearby"
          name="whatsNearby"
          lang={lang}
          value={form.whatsNearby?.[lang]}
          onChange={handleLocalizedChange}
        /> */}

        {/* === Amenities === */}
        {/* <h2 className="text-lg font-semibold mt-8 mb-4">
          {lang === "en" ? "Amenities" : "Tiện Ích"}
        </h2>

        {form.amenities.map((a, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-3 mb-4 items-end border-b border-gray-100 pb-3"
          >
            <div className="col-span-1">
              <label className="block text-sm text-[#131517] font-semibold mb-2">
                {lang === "en" ? "Amenity Name (EN)" : "Tên tiện ích (VI)"}
              </label>
              <input
                type="text"
                value={a.name?.[lang] || ""}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.amenities];
                    updated[i].name = {
                      ...(updated[i].name || { en: "", vi: "" }),
                      [lang]: e.target.value,
                    };
                    return { ...prev, amenities: updated };
                  })
                }
                placeholder={
                  lang === "en" ? "Enter English name" : "Nhập tên tiếng Việt"
                }
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>

            <div className="col-span-1">
              <Input
                label="KM"
                name={`amenityKm-${i}`}
                value={a.km}
                onChange={(e) => handleAmenityChange(i, "km", e.target.value)}
              />
            </div>

            <div className="col-span-1 flex justify-end items-center">
              {i > 0 && (
                <button
                  onClick={() => removeAmenity(i)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={addAmenity}
          className="flex items-center g text-[#131517] font-semibold hover:text-black mt-2"
        >
          <Plus className="w-4 h-4" />{" "}
          {lang === "en" ? "Add Amenity" : "Thêm Tiện Ích"}
        </button> */}

        {/* === Description === */}
        <h2 className="text-lg font-semibold mt-8 mb-4">{t.description}</h2>
        <LocalizedTextarea
          label={lang === "en" ? "Description" : "Mô tả"}
          name="description"
          lang={lang}
          value={form.description?.[lang]}
          onChange={handleLocalizedChange}
          placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
        />

        {/* === Property Utility === */}
        <div className="flex justify-between mt-8 mb-4">
          <h2 className="text-lg font-semibold">{t.propertyUtility}</h2>
          <button
            onClick={addUtility}
            className="flex items-center g text-[#131517] font-semibold hover:text-black mt-2 cursor-pointer"
          >
            <CirclePlus size={22} />
          </button>
        </div>
        {form.utilities.map((u, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-3 mb-4 items-baseline border-b border-gray-100 pb-3"
          >
            {/* Utility Name (Language Controlled) */}
            <div className="col-span-1">
              <label className="block text-sm text-[#131517] font-semibold mb-2">
                {lang === "en" ? "Utility Name (EN)" : "Tên tiện ích (VI)"}
              </label>
              <input
                type="text"
                value={u.name?.[lang] || ""}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.utilities];
                    updated[i].name = {
                      ...(updated[i].name || { en: "", vi: "" }),
                      [lang]: e.target.value,
                    };
                    return { ...prev, utilities: updated };
                  })
                }
                placeholder={
                  lang === "en"
                    ? "Enter English name"
                    : "Nhập tên tiện ích tiếng Việt"
                }
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm text-[#131517] font-semibold mb-2 -mt-16.5">
                {lang === "en" ? "Select Icon" : "Chọn Biểu Tượng"}
              </label>

              <AntdSelect
                showSearch
                allowClear
                placeholder={
                  lang === "en"
                    ? "Search and Select Icon"
                    : "Tìm và chọn biểu tượng"
                }
                value={u.icon || undefined}
                onChange={(value) => handleUtilityChange(i, "icon", value)}
                className="w-full custom-select"
                classNames={{ popup: "custom-dropdown" }}
                onSearch={(val) => setSearchValue(val)}
                filterOption={false}
                optionLabelProp="label"
              >
                {filteredIcons.map((item) => (
                  <Option
                    key={item.value}
                    value={item.value}
                    label={
                      <div className="flex items-center gap-2">
                        <img
                          src={item.icon}
                          alt={item.name[lang]}
                          className="w-5 h-5 object-contain"
                        />
                        <span>{item.name[lang]}</span>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.icon}
                        alt={item.name[lang]}
                        className="w-5 h-5 object-contain"
                      />
                      <span>{item.name[lang]}</span>
                    </div>
                  </Option>
                ))}
              </AntdSelect>
            </div>

            {/* Delete Button */}
            <div className="col-span-1 flex justify-start items-end">
              {i > 0 && (
                <button
                  onClick={() => removeUtility(i)}
                  className="p-3 text-red-500 cursor-pointer hover:bg-[#fb2c362b] hover:border-[#fb2c36] rounded-full border border-[#B1B1B1]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Next */}
        <div className="text-end flex justify-end">
          <button
            onClick={() => {
              const syncLangFields = [
                "title",
                "address",
                "description",
                "view",
                "whatsNearby",
              ];
              const updatedForm = { ...form };

              syncLangFields.forEach((field) => {
                const val = updatedForm[field];
                if (val && typeof val === "object") {
                  if (!val.vi || val.vi.trim() === "") val.vi = val.en || "";
                  if (!val.en || val.en.trim() === "") val.en = val.vi || "";
                }
              });

              onChange && onChange(updatedForm);
              onNext(updatedForm);
            }}
            className="mt-4 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full flex items-center cursor-pointer gap-1.5"
          >
            {lang === "en" ? "Next" : "Tiếp theo"} <ArrowRight size={18} />
          </button>

        </div>

      </div>


    </div>
  );
}
