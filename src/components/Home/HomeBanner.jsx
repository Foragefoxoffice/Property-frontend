import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Spin } from 'antd';
import {
    getAllProperties,
    getAllZoneSubAreas,
    getAllPropertyTypes,
    getAllCurrencies,
    getAllBlocks
} from '../../Api/action';
import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../Language/LanguageContext';

export default function HomeBanner({ homePageData }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [selectedTab, setSelectedTab] = useState('For Rent');
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    // Dropdown data
    const [projects, setProjects] = useState([]);
    const [zones, setZones] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    // Comprehensive filters matching ListingPage
    const [filters, setFilters] = useState({
        propertyId: '',
        keyword: '',
        projectId: '',
        zoneId: '',
        blockId: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        currency: '',
        minPrice: '',
        maxPrice: ''
    });

    // Load dropdown data on mount
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [projectsRes, zonesRes, blocksRes, typesRes, currenciesRes] = await Promise.all([
                    getAllProperties(),
                    getAllZoneSubAreas(),
                    getAllBlocks(),
                    getAllPropertyTypes(),
                    getAllCurrencies()
                ]);

                setProjects(projectsRes.data?.data || []);
                setZones(zonesRes.data?.data || []);
                setBlocks(blocksRes.data?.data || []);
                setPropertyTypes(typesRes.data?.data || []);
                setCurrencies(currenciesRes.data?.data || []);
            } catch (error) {
                console.error('Error loading dropdown data:', error);
            }
        };

        loadDropdownData();
    }, []);

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.en || value.vi || '';
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        // Navigate to listing page with filters
        const category = selectedTab === 'For Rent' ? 'Lease' : 'Sale';
        const params = new URLSearchParams({
            type: category,
            ...(filters.propertyId && { propertyId: filters.propertyId }),
            ...(filters.keyword && { keyword: filters.keyword }),
            ...(filters.projectId && { projectId: filters.projectId }),
            ...(filters.zoneId && { zoneId: filters.zoneId }),
            ...(filters.blockId && { blockId: filters.blockId }),
            ...(filters.propertyType && { propertyType: filters.propertyType }),
            ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
            ...(filters.bathrooms && { bathrooms: filters.bathrooms }),
            ...(filters.currency && { currency: filters.currency }),
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice })
        });
        navigate(`/listing?${params.toString()}`);
    };

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Otherwise, prepend the backend base URL
        const baseURL = import.meta.env.VITE_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    return (
        <>
            <div className="relative min-h-[100vh] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: homePageData?.backgroundImage
                        ? `url(${getImageUrl(homePageData.backgroundImage)})`
                        : 'url("/images/property/home-banner.jpg")'
                }}>
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    {/* Title & Description */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-8xl font-medium text-black mb-4 animate-fadeInUp">
                            {language === 'en'
                                ? (homePageData?.heroTitle_en || 'Find The Best Place')
                                : (homePageData?.heroTitle_vn || 'Tìm Nơi Tốt Nhất')
                            }
                        </h1>
                        <p className="text-xl text-[#5c6368] font-medium max-w-2xl mx-auto animate-fadeInUp animation-delay-200">
                            {language === 'en'
                                ? (homePageData?.heroDescription_en || 'This stunning coastal villa in Malibu offers panoramic ocean views, open-concept living, and elegant modern design.')
                                : (homePageData?.heroDescription_vn || 'Biệt thự ven biển tuyệt đẹp này ở Malibu mang đến tầm nhìn toàn cảnh ra đại dương, không gian sống mở và thiết kế hiện đại thanh lịch.')
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className='mt-[-80px] relative z-20 animate-slideUpFade animation-delay-400'>
                {/* Tabs */}
                <div className="flex gap-3 justify-center">
                    <button
                        className={`px-8 py-3 rounded-t-md font-semibold text-base cursor-pointer transition-all ${selectedTab === 'For Rent'
                            ? 'bg-[#fff] text-[#41398B]'
                            : 'bg-[#00000066] text-[#fff] hover:bg-gray-200 hover:text-[#41398B]'
                            }`}
                        onClick={() => setSelectedTab('For Rent')}
                    >
                        For Rent
                    </button>
                    <button
                        className={`px-8 py-3 rounded-t-md font-semibold text-base cursor-pointer transition-all ${selectedTab === 'For Sale'
                            ? 'bg-[#fff] text-[#41398B]'
                            : 'bg-[#00000066] text-[#fff] hover:bg-gray-200 hover:text-[#41398B]'
                            }`}
                        onClick={() => setSelectedTab('For Sale')}
                    >
                        For Sale
                    </button>
                    <button
                        className={`px-8 py-3 rounded-t-md font-semibold text-base cursor-pointer transition-all ${selectedTab === 'Home Stay'
                            ? 'bg-[#fff] text-[#41398B]'
                            : 'bg-[#00000066] text-[#fff] hover:bg-gray-200 hover:text-[#41398B]'
                            }`}
                        onClick={() => setSelectedTab('Home Stay')}
                    >
                        Home Stay
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 max-w-7xl mx-auto">
                    {/* Main Filters Row - Horizontal Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pt-2">
                        {/* Looking For (Keyword) */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                Looking For
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                placeholder="Search keyword"
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                            />
                        </div>

                        {/* Location (Area/Zone) */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                Location
                            </label>
                            <Select
                                className="custom-selectss"
                                popupClassName="custom-dropdown"
                                value={filters.zoneId || undefined}
                                onChange={(value) => handleFilterChange('zoneId', value || '')}
                                placeholder="All Cities"
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {zones.map((zone) => (
                                    <Select.Option key={zone._id} value={getLocalizedValue(zone.name)}>
                                        {getLocalizedValue(zone.name) || 'Unnamed'}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                Bedrooms
                            </label>
                            <Select
                                className="custom-selectss"
                                popupClassName="custom-dropdown"
                                value={filters.bedrooms || undefined}
                                onChange={(value) => handleFilterChange('bedrooms', value || '')}
                                placeholder="Any Bedrooms"
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                            >
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                                <Select.Option value="4">4+</Select.Option>
                            </Select>
                        </div>

                        {/* Your Budget (Max Price) */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                Your Budget
                            </label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                placeholder="Max. Price"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                        {/* Bottom Row - Show More Button & Search Button */}
                        <div className="flex items-end gap-3">
                            {/* Show More Filters Button */}
                            <button
                                className="flex items-center gap-2 px-4 py-3 border cursor-pointer border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                onClick={() => setShowMoreFilters(!showMoreFilters)}
                            >
                                <SlidersHorizontal />
                            </button>

                            {/* Search Button */}
                            <button
                                className="px-8 py-2.5 bg-[#41398B] hover:bg-[#41398be1] text-white font-bold rounded-lg hover:shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Expandable More Filters Section */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${showMoreFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className={`mb-6 transform transition-all duration-500 ${showMoreFilters ? 'translate-y-0' : '-translate-y-4'
                            }`}>
                            {/* Second Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                                {/* Bathrooms */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Bathrooms
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.bathrooms || undefined}
                                        onChange={(value) => handleFilterChange('bathrooms', value || '')}
                                        placeholder="Any"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                    >
                                        <Select.Option value="1">1</Select.Option>
                                        <Select.Option value="2">2</Select.Option>
                                        <Select.Option value="3">3+</Select.Option>
                                    </Select>
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Property Type
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.propertyType || undefined}
                                        onChange={(value) => handleFilterChange('propertyType', value || '')}
                                        placeholder="Select Type"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {propertyTypes.map((type) => (
                                            <Select.Option key={type._id} value={getLocalizedValue(type.name)}>
                                                {getLocalizedValue(type.name) || 'Unnamed'}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Project / Community */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Project / Community
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.projectId || undefined}
                                        onChange={(value) => handleFilterChange('projectId', value || '')}
                                        placeholder="Select Project"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {projects.map((project) => (
                                            <Select.Option key={project._id} value={getLocalizedValue(project.name)}>
                                                {getLocalizedValue(project.name) || 'Unnamed'}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Block Name */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Block Name
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.blockId || undefined}
                                        onChange={(value) => handleFilterChange('blockId', value || '')}
                                        placeholder="Select Block"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {blocks.map((block) => (
                                            <Select.Option key={block._id} value={getLocalizedValue(block.name)}>
                                                {getLocalizedValue(block.name) || 'Unnamed'}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {/* Third Row - Price Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                                {/* Currency */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Currency
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.currency || undefined}
                                        onChange={(value) => handleFilterChange('currency', value || '')}
                                        placeholder="Select Currency"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                    >
                                        {currencies.map((curr) => {
                                            const code = getLocalizedValue(curr.currencyCode) || getLocalizedValue(curr.currencyName) || 'N/A';
                                            const symbol = getLocalizedValue(curr.currencySymbol) || '';
                                            return (
                                                <Select.Option key={curr._id} value={code}>
                                                    {code} {symbol && `(${symbol})`}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </div>

                                {/* Min Price */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Min Price
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                </div>

                                {/* Max Price */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        Max Price
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
