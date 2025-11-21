import React, { useState, useEffect } from "react";
import { Select as AntdSelect } from "antd";
import {
  getAllProperties,
  getAllZoneSubAreas,
  getAllBlocks,
  getAllPropertyTypes,
  getAllFloorRanges,
  getAllCurrencies,
} from "@/Api/action";
import { ArrowRight } from "lucide-react";

/* ======================================================
   SIMPLE TEXT INPUT
====================================================== */
const Input = ({ label, value, onChange, name, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder || ""}
      className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
    />
  </div>
);

/* ======================================================
   SELECT WITH EN/VI SUPPORT
====================================================== */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  lang,
}) => {
  const { Option } = AntdSelect;

  const getOptionLabel = (opt) => {
    if (opt.name) {
      return lang === "vi"
        ? opt.name.vi || opt.name.en
        : opt.name.en || opt.name.vi;
    }
    return opt.label || opt.value || "";
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>

      <AntdSelect
        showSearch
        allowClear
        placeholder={placeholder || "Select"}
        value={value?.id || undefined}
        onChange={(val, option) =>
          onChange(name, { id: val, name: option?.label })
        }
        optionFilterProp="children"
        className="w-full h-12 custom-select"
        popupClassName="custom-dropdown"
      >
        {options.map((opt) => {
          const label = getOptionLabel(opt);
          return (
            <Option
              key={opt._id || opt.id}
              value={opt._id || opt.id}
              label={label}
            >
              {label}
            </Option>
          );
        })}
      </AntdSelect>
    </div>
  );
};

/* ======================================================
   LABEL SET
====================================================== */
const t = {
  en: {
    propertyInfo: "Property Information",
    priceRange: "Price Range",
    project: "Project / Community",
    zone: "Area / Zone",
    block: "Block Name",
    propertyType: "Property Type",
    propertyNumber: "Property Number",
    floorRange: "Floor Range",
    currency: "Currency",
    from: "From",
    to: "To",
    cancel: "Cancel",
    apply: "Apply",
    clear: "Clear Filters",
  },
  vi: {
    propertyInfo: "Thông tin bất động sản",
    priceRange: "Khoảng giá",
    project: "Dự án / Khu dân cư",
    zone: "Khu vực / Vùng",
    block: "Tên khối",
    propertyType: "Loại bất động sản",
    propertyNumber: "Số bất động sản",
    floorRange: "Phạm vi tầng",
    currency: "Tiền tệ",
    from: "Từ",
    to: "Đến",
    cancel: "Hủy",
    apply: "Áp dụng",
    clear: "Xóa bộ lọc",
  },
};

/* ======================================================
   MAIN FILTERS COMPONENT
====================================================== */
export default function FiltersPage({ onApply, defaultFilters }) {
  const [lang, setLang] = useState("en");

  // All dropdown datasets
  const [projects, setProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [floorRanges, setFloorRanges] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    projectId: null,
    zoneId: null,
    blockId: null,
    propertyType: null,
    propertyNumber: "",
    floorRange: null,
    currency: null,
    priceFrom: "",
    priceTo: "",
  });

  const update = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================================================
       APPLY DEFAULT FILTER VALUES
    ======================================================= */
  useEffect(() => {
    if (defaultFilters) {
      setFilters(defaultFilters);
    }
  }, [defaultFilters]);

  /* ======================================================
       LOAD ALL DROPDOWNS
    ======================================================= */

  useEffect(() => {
  if (!filters.projectId) {
    setZones([]);
    setBlocks([]);
    update("zoneId", null);
    update("blockId", null);
    return;
  }

  const selectedProject = projects.find(p => p._id === filters.projectId.id);

  setZones(selectedProject?.zones || []);
  setBlocks([]); // reset blocks

  update("zoneId", null);
  update("blockId", null);
}, [filters.projectId]);

useEffect(() => {
  if (!filters.zoneId) {
    setBlocks([]);
    update("blockId", null);
    return;
  }

  const selectedZone = zones.find(z => z._id === filters.zoneId.id);

  setBlocks(selectedZone?.blocks || []);
  update("blockId", null);
}, [filters.zoneId]);


useEffect(() => {
  const load = async () => {
    try {
      const [p, t, f, c] = await Promise.all([
        getAllProperties(),
        getAllPropertyTypes(),
        getAllFloorRanges(),
        getAllCurrencies(),
      ]);

      setProjects(p.data?.data || []);
      setPropertyTypes(t.data?.data || []);
      setFloorRanges(f.data?.data || []);
      setCurrencies(c.data?.data || []);
    } catch (err) {
      console.error("Filter dropdown load error:", err);
    }
  };

  load();
}, []);


  /* ======================================================
       RENDER
    ======================================================= */
  return (
    <div className="min-h-screen rounded-2xl p-10">
      {/* === Language Switch === */}
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

      {/* === Property Information === */}
      <h3 className="text-lg font-semibold mb-5">{t[lang].propertyInfo}</h3>

      <div className="grid grid-cols-3 gap-7">
        <Select
  label={t[lang].project}
  name="projectId"
  value={filters.projectId}
  onChange={update}
  options={projects}
  lang={lang}
/>

<Select
  label={t[lang].zone}
  name="zoneId"
  value={filters.zoneId}
  onChange={update}
  options={zones}
  lang={lang}
/>

<Select
  label={t[lang].block}
  name="blockId"
  value={filters.blockId}
  onChange={update}
  options={blocks}
  lang={lang}
/>

        <Select
          label={t[lang].propertyType}
          name="propertyType"
          value={filters.propertyType}
          onChange={update}
          options={propertyTypes}
          lang={lang}
        />

        <Input
          label={t[lang].propertyNumber}
          name="propertyNumber"
          value={filters.propertyNumber}
          onChange={update}
          placeholder="Type here"
        />

        <Select
          label={t[lang].floorRange}
          name="floorRange"
          value={filters.floorRange}
          onChange={update}
          options={floorRanges}
          lang={lang}
        />
      </div>

      {/* === Price Range === */}
      <h3 className="text-lg font-semibold mt-8 mb-5">{t[lang].priceRange}</h3>

      <div className="grid grid-cols-3 gap-7">
        <Select
          label={t[lang].currency}
          name="currency"
          value={filters.currency}
          onChange={update}
          options={currencies}
          lang={lang}
        />

        <Input
          label={t[lang].from}
          name="priceFrom"
          value={filters.priceFrom}
          onChange={update}
          placeholder="Type here"
        />
        <Input
          label={t[lang].to}
          name="priceTo"
          value={filters.priceTo}
          onChange={update}
          placeholder="Type here"
        />
      </div>

      {/* === Buttons === */}
      <div className="flex justify-end gap-4 mt-10">
        {/* CLEAR FILTERS */}
        <button
          onClick={() =>
            setFilters({
              projectId: null,
              zoneId: null,
              blockId: null,
              propertyType: null,
              propertyNumber: "",
              floorRange: null,
              currency: null,
              priceFrom: "",
              priceTo: "",
            })
          }
          className="px-6 py-2 rounded-full cursor-pointer border border-gray-400 text-gray-700"
        >
          {t[lang].clear}
        </button>

        {/* APPLY FILTERS */}
        <button
          onClick={() => onApply(filters)}
          className="px-6 py-2 bg-[#41398B] flex items-center gap-1 hover:bg-[#41398Be3] text-white rounded-full cursor-pointer"
        >
          {t[lang].apply}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
