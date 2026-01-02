import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getListingProperties,
    getAllProperties,
    getAllZoneSubAreas,
    getAllBlocks,
    getAllPropertyTypes,
    getAllCurrencies
} from '../Api/action';
import { Select, Skeleton } from 'antd';

export default function ListingPage() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('Lease');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);

    // Dropdown data
    const [projects, setProjects] = useState([]);
    const [zones, setZones] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    // Comprehensive filters matching dashboard
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
    const [sortBy, setSortBy] = useState('default');
    const observer = useRef();

    // ⚡ Simple cache to avoid redundant API calls
    const cacheRef = useRef({});

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

    const lastPropertyRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    useEffect(() => {
        setProperties([]);
        setPage(1);
        setHasMore(true);
        fetchProperties(1, true);
    }, [selectedCategory]);

    useEffect(() => {
        if (properties.length > 0) {
            setProperties([]);
            setPage(1);
            setHasMore(true);
            fetchProperties(1, true);
        }
    }, [sortBy]);

    useEffect(() => {
        if (page > 1) {
            fetchProperties(page, false);
        }
    }, [page]);

    const fetchProperties = async (currentPage, isNewSearch = false) => {
        if (isNewSearch) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = {
                type: selectedCategory,
                page: currentPage,
                limit: 10,
                sortBy: sortBy
            };

            // Add comprehensive filters
            if (filters.propertyId) params.propertyId = filters.propertyId;
            if (filters.keyword) params.keyword = filters.keyword;
            if (filters.projectId) params.projectId = filters.projectId;
            if (filters.zoneId) params.zoneId = filters.zoneId;
            if (filters.blockId) params.blockId = filters.blockId;
            if (filters.propertyType) params.propertyType = filters.propertyType;
            if (filters.bedrooms) params.bedrooms = filters.bedrooms;
            if (filters.bathrooms) params.bathrooms = filters.bathrooms;
            if (filters.currency) params.currency = filters.currency;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;

            // Create cache key from params
            const cacheKey = JSON.stringify(params);

            // Check cache first
            if (cacheRef.current[cacheKey] && isNewSearch) {
                console.log('⚡ Using cached data');
                const cachedData = cacheRef.current[cacheKey];
                setProperties(cachedData.properties);
                setTotalPages(cachedData.totalPages);
                setHasMore(currentPage < cachedData.totalPages);
                setLoading(false);
                return;
            }

            console.time('⏱️ API Request Time');
            const response = await getListingProperties(params);
            console.timeEnd('⏱️ API Request Time');

            if (response.data.success) {
                const newProperties = response.data.data;

                if (isNewSearch) {
                    setProperties(newProperties);
                    // Cache the first page results
                    cacheRef.current[cacheKey] = {
                        properties: newProperties,
                        totalPages: response.data.totalPages || 0
                    };
                } else {
                    setProperties(prev => [...prev, ...newProperties]);
                }

                setTotalPages(response.data.totalPages || 0);
                setHasMore(currentPage < (response.data.totalPages || 0));
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        setProperties([]);
        setPage(1);
        setHasMore(true);
        fetchProperties(1, true);
    };

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.en || value.vi || '';
    };

    const getCategoryBadgeClass = (category) => {
        const cat = getLocalizedValue(category).toLowerCase();
        if (cat.includes('lease') || cat.includes('rent')) return 'bg-[#058135]';
        if (cat.includes('sale') || cat.includes('sell')) return 'bg-[#eb4d4d]';
        if (cat.includes('home') || cat.includes('stay')) return 'bg-[#055381]';
        return 'bg-[#058135]';
    };

    const getCategoryLabel = (category) => {
        const cat = getLocalizedValue(category).toLowerCase();
        if (cat.includes('lease') || cat.includes('rent')) return 'For Lease';
        if (cat.includes('sale') || cat.includes('sell')) return 'For Sale';
        if (cat.includes('home') || cat.includes('stay')) return 'Homestay';
        return getLocalizedValue(category);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff]">
            {/* Modern Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/50 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center gap-3 text-sm mb-4">
                        <a href="/" className="text-gray-500 hover:text-[#41398B] font-medium transition-colors">Home</a>
                        <span className="text-gray-300">/</span>
                        <span className="text-[#41398B] font-semibold">Properties</span>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-1">
                                Discover Your Dream Property
                            </h1>
                            <p className="text-gray-900 text-md">Find the perfect place to call home</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select
                                className="custom-selects"
                                popupClassName="custom-dropdown"
                                value={sortBy}
                                onChange={(value) => setSortBy(value)}
                                style={{ width: 180 }}
                                size="large"
                            >
                                <Select.Option value="default">Default</Select.Option>
                                <Select.Option value="price-low">Price: Low to High</Select.Option>
                                <Select.Option value="price-high">Price: High to Low</Select.Option>
                                <Select.Option value="newest">Newest</Select.Option>
                                <Select.Option value="oldest">Oldest</Select.Option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar */}
                    <aside className="lg:sticky lg:top-28 h-fit">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100/50 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide">
                            {/* Category */}
                            <div className="mb-3">
                                <div className="space-y-2">
                                    {['Lease', 'Sale', 'Home Stay'].map((cat) => (
                                        <button
                                            key={cat}
                                            className={`w-full px-4 py-3 text-left text-md font-semibold rounded-xl cursor-pointer transition-all ${selectedCategory === cat
                                                ? 'bg-gradient-to-r from-[#41398B] to-[#5b52a3] text-white'
                                                : 'bg-purple-50/50 text-gray-700 hover:bg-purple-100/70'
                                                }`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat === 'Lease' ? 'For Lease' : cat === 'Sale' ? 'For Sale' : 'Homestay'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-0 mb-4"></div>
                            <h3 className="text-[22px] font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-2">Looking For</h3>
                            {/* Property ID / Keyword Search */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Property ID or Keyword</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-purple-200/60 rounded-lg text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                    placeholder="Search by ID or keyword..."
                                    value={filters.keyword}
                                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                />
                            </div>
                            <h3 className="text-[22px] font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-2">Location</h3>
                            {/* Project / Community */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Project / Community</label>
                                <Select
                                    className="custom-selects"
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

                            {/* Area / Zone */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Area / Zone</label>
                                <Select
                                    className="custom-selects"
                                    popupClassName="custom-dropdown"
                                    value={filters.zoneId || undefined}
                                    onChange={(value) => handleFilterChange('zoneId', value || '')}
                                    placeholder="Select Area/Zone"
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

                            {/* Block Name */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Block Name</label>
                                <Select
                                    className="custom-selects"
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

                            {/* Property Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Property Type</label>
                                <Select
                                    className="custom-selects"
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

                            {/* Bedrooms & Bathrooms */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Bedrooms</label>
                                    <Select
                                        className="custom-selects"
                                        popupClassName="custom-dropdown"
                                        value={filters.bedrooms || undefined}
                                        onChange={(value) => handleFilterChange('bedrooms', value || '')}
                                        placeholder="Any"
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
                                <div>
                                    <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Bathrooms</label>
                                    <Select
                                        className="custom-selects"
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
                            </div>

                            <div className="border-t border-gray-200 my-4"></div>
                            <h3 className="text-[22px] font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-2">Price Range</h3>

                            {/* Currency */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Currency</label>
                                <Select
                                    className="custom-selects"
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

                            {/* Min & Max Price */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Min Price</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2.5 border border-purple-200/60 rounded-lg text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#2a2a2a] mb-2">Max Price</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2.5 border border-purple-200/60 rounded-lg text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                className="w-full px-6 py-3.5 bg-gradient-to-r from-[#41398B] to-[#5b52a3] text-white font-bold rounded-xl hover:shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                onClick={handleSearch}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </aside>

                    {/* Property Grid */}
                    <main>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div key={item} className="bg-white rounded-2xl overflow-hidden p-4">
                                        <Skeleton.Image active className="!w-full !h-56 rounded-2xl mb-4" />
                                        <Skeleton active paragraph={{ rows: 3 }} />
                                    </div>
                                ))}
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl">
                                <svg className="w-24 h-24 text-purple-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Properties Found</h2>
                                <p className="text-gray-500">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {properties.map((property, index) => {
                                        const isLastProperty = properties.length === index + 1;
                                        return (
                                            <div
                                                key={property._id}
                                                ref={isLastProperty ? lastPropertyRef : null}
                                                className="card-house style-default hover-image group bg-white rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer"
                                                onClick={() => navigate(`/property-showcase/${property.listingInformation?.listingInformationPropertyId || property._id}`)}
                                            >
                                                {/* Image */}
                                                <div className="relative img-style article-thumb h-56 overflow-hidden rounded-2xl">
                                                    <img
                                                        src={property.imagesVideos?.propertyImages?.[0] || '/images/property/dummy-img.avif'}
                                                        alt={getLocalizedValue(property.listingInformation?.listingInformationBlockName)}
                                                        className="w-full h-full object-cover rounded-2xl"
                                                    />
                                                    {/* Badges */}
                                                    <div className="absolute top-3 left-3 flex gap-2">
                                                        <span className={`px-2 py-1.5 text-[11px] ${getCategoryBadgeClass(property.listingInformation?.listingInformationTransactionType)} text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg`}>
                                                            {getCategoryLabel(property.listingInformation?.listingInformationTransactionType)}
                                                        </span>
                                                        {property.listingInformation?.listingInformationPropertyType && (
                                                            <span className="px-2 py-1.5 text-[11px] bg-[#41398B]/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg">
                                                                {getLocalizedValue(property.listingInformation.listingInformationPropertyType)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="wishlist"><div className="hover-tooltip tooltip-left box-icon"><span className="icon icon-Heart"></span><span className="tooltip">Add to Wishlist</span></div></div>
                                                </div>

                                                {/* Content */}
                                                <div className="pt-5 pb-5 px-2">
                                                    {/* Price */}
                                                    <div className="flex items-baseline gap-0 mb-2">
                                                        {(() => {
                                                            const type = getLocalizedValue(property.listingInformation?.listingInformationTransactionType);
                                                            const priceSale = property.financialDetails?.financialDetailsPrice;
                                                            const priceLease = property.financialDetails?.financialDetailsLeasePrice;
                                                            const priceNight = property.financialDetails?.financialDetailsPricePerNight;
                                                            const genericPrice = property.financialDetails?.financialDetailsPrice;

                                                            let displayPrice = 'Contact for Price';
                                                            let displaySuffix = null;

                                                            if (type === 'Sale' && priceSale) {
                                                                displayPrice = `₫ ${Number(priceSale).toLocaleString()}`;
                                                            } else if (type === 'Lease' && priceLease) {
                                                                displayPrice = `₫ ${Number(priceLease).toLocaleString()}`;
                                                                displaySuffix = ' / month';
                                                            } else if (type === 'Home Stay' && priceNight) {
                                                                displayPrice = `$ ${Number(priceNight).toLocaleString()}`;
                                                                displaySuffix = ' / night';
                                                            } else if (genericPrice) {
                                                                if (selectedCategory === 'Lease') {
                                                                    displayPrice = `₫ ${Number(genericPrice).toLocaleString()}`;
                                                                    displaySuffix = ' / month';
                                                                } else if (selectedCategory === 'Home Stay') {
                                                                    displayPrice = `$ ${Number(genericPrice).toLocaleString()}`;
                                                                    displaySuffix = ' / night';
                                                                } else {
                                                                    displayPrice = `₫ ${Number(genericPrice).toLocaleString()}`;
                                                                }
                                                            }

                                                            return (
                                                                <>
                                                                    <span className="text-2xl font-bold text-[#2a2a2a]">{displayPrice}</span>
                                                                    {displaySuffix && <span className="text-sm text-gray-500 font-medium">{displaySuffix}</span>}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-[22px] font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#41398B] transition-colors">
                                                        {getLocalizedValue(property.listingInformation?.listingInformationPropertyTitle) ||
                                                            getLocalizedValue(property.listingInformation?.listingInformationBlockName) ||
                                                            getLocalizedValue(property.listingInformation?.listingInformationProjectCommunity) ||
                                                            'Untitled Property'}
                                                    </h3>

                                                    {/* Location / Nearby */}
                                                    <p className="text-[16px] text-gray-500 mb-4 line-clamp-3">
                                                        {getLocalizedValue(property.whatNearby?.whatNearbyDescription) ||
                                                            getLocalizedValue(property.listingInformation?.listingInformationZoneSubArea) ||
                                                            'Location not specified'}
                                                    </p>

                                                    {/* Details */}
                                                    <div className="flex items-center pt-3 border-t border-gray-200 justify-between">
                                                        {property.propertyInformation?.informationBedrooms > 0 && (
                                                            <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                                                                <svg
                                                                    className="w-6 h-6 text-[#41398B]"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={1.5}
                                                                        d="M3 7h18M5 7v10M19 7v10M3 17h18M7 10h4a2 2 0 012 2v5M7 10a2 2 0 00-2 2v5"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium text-lg">{property.propertyInformation.informationBedrooms} Bed</span>
                                                            </div>
                                                        )}
                                                        {property.propertyInformation?.informationBathrooms > 0 && (
                                                            <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                                                                <svg className="w-6 h-6 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 14h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM6 14V9a3 3 0 0 1 6 0" />
                                                                </svg>
                                                                <span className="font-medium text-lg">{property.propertyInformation.informationBathrooms} Bath</span>
                                                            </div>
                                                        )}
                                                        {property.propertyInformation?.informationUnitSize > 0 && (
                                                            <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                                                                <svg className="w-6 h-6 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 4.6a2 2 0 0 1 0 2.8l-12 12a2 2 0 0 1-2.8 0l-2-2a2 2 0 0 1 0-2.8l12-12a2 2 0 0 1 2.8 0zM12 7l2 2M10 9l2 2M8 11l2 2" />
                                                                </svg>
                                                                <span className="font-medium text-lg">{property.propertyInformation.informationUnitSize.toLocaleString()} Sqft</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Loading More */}
                                {loadingMore && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="bg-white rounded-2xl overflow-hidden p-4">
                                                <Skeleton.Image active className="!w-full !h-56 rounded-2xl mb-4" />
                                                <Skeleton active paragraph={{ rows: 3 }} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* End */}
                                {!hasMore && properties.length > 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 font-medium">You've reached the end</p>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div >
            </div >
        </div >
    );
}