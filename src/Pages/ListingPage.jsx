import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    getListingProperties,
    getAllProperties,
    getAllZoneSubAreas,
    getAllBlocks,
    getAllPropertyTypes,
    getAllCurrencies
} from '../Api/action';
import { Select, Skeleton, Tooltip } from 'antd';
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import { usePermissions } from '../Context/PermissionContext';
import Loader from '@/components/Loader/Loader';
import { Heart, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/Language/LanguageContext';
import { useFavorites } from '../Context/FavoritesContext';
import { translations } from '@/Language/translations';

export default function ListingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { can } = usePermissions();
    const { language } = useLanguage();
    const t = translations[language];
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const [showFilters, setShowFilters] = useState(false);

    // Initialize category from URL or default to 'All'
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const type = searchParams.get('type');
        return (type && ['Lease', 'Sale', 'Home Stay'].includes(type)) ? type : 'All';
    });

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);

    const handleToggleFavorite = async (e, property) => {
        e.stopPropagation();
        const propertyId = property._id || property.listingInformation?.listingInformationPropertyId;
        if (isFavorite(propertyId)) {
            await removeFavorite(propertyId);
        } else {
            await addFavorite(property);
        }
    };

    // Dropdown data
    const [projects, setProjects] = useState([]);
    const [zones, setZones] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    // Comprehensive filters matching dashboard
    const [filters, setFilters] = useState({
        propertyId: searchParams.get('propertyId') || '',
        keyword: searchParams.get('keyword') || '',
        projectId: searchParams.get('projectId') || '',
        zoneId: searchParams.get('zoneId') || '',
        blockId: searchParams.get('blockId') || '',
        propertyType: searchParams.get('propertyType') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        bathrooms: searchParams.get('bathrooms') || '',
        currency: searchParams.get('currency') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || ''
    });
    const [sortBy, setSortBy] = useState('default');
    const observer = useRef();

    // ⚡ Simple cache to avoid redundant API calls
    const cacheRef = useRef({});

    // Sync state with URL params when they change (e.g. Back button)
    useEffect(() => {
        const type = searchParams.get('type');
        const newFilters = {
            propertyId: searchParams.get('propertyId') || '',
            keyword: searchParams.get('keyword') || '',
            projectId: searchParams.get('projectId') || '',
            zoneId: searchParams.get('zoneId') || '',
            blockId: searchParams.get('blockId') || '',
            propertyType: searchParams.get('propertyType') || '',
            bedrooms: searchParams.get('bedrooms') || '',
            bathrooms: searchParams.get('bathrooms') || '',
            currency: searchParams.get('currency') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || ''
        };

        const targetType = (type && ['Lease', 'Sale', 'Home Stay'].includes(type)) ? type : 'All';
        const typeChanged = targetType !== selectedCategory;
        const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(filters);

        if (typeChanged) {
            setSelectedCategory(targetType);
            if (filtersChanged) setFilters(newFilters);
        } else if (filtersChanged) {
            setFilters(newFilters);
            setProperties([]);
            setPage(1);
            setHasMore(true);
            fetchProperties(1, true, newFilters);
        }
    }, [searchParams]);

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

                // ✅ Filter to only show Active items in dropdowns
                const filterActive = (items) => items.filter(item => item.status === "Active");

                setProjects(filterActive(projectsRes.data?.data || []));
                setZones(filterActive(zonesRes.data?.data || []));
                setBlocks(filterActive(blocksRes.data?.data || []));

                // ✅ Filter property types based on permissions
                const activeTypes = filterActive(typesRes.data?.data || []);
                const filteredTypes = activeTypes.filter(type => {
                    // Check permissions for each transaction type
                    const hasLeaseAccess = can('properties.lease', 'view');
                    const hasSaleAccess = can('properties.sale', 'view');
                    const hasHomestayAccess = can('properties.homestay', 'view');

                    // If user has access to all, show all types
                    if (hasLeaseAccess && hasSaleAccess && hasHomestayAccess) {
                        return true;
                    }

                    // For now, show all active types if user has any access
                    return true;
                });

                setPropertyTypes(filteredTypes);
                setCurrencies(filterActive(currenciesRes.data?.data || []));
            } catch (error) {
                console.error('Error loading dropdown data:', error);
            }
        };

        loadDropdownData();
    }, [can]);

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

    const fetchProperties = async (currentPage, isNewSearch = false, filterOverrides = null) => {
        if (isNewSearch) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = {
                type: selectedCategory === 'All' ? '' : selectedCategory,
                page: currentPage,
                limit: 10,
                sortBy: sortBy
            };

            const activeFilters = filterOverrides || filters;

            // Add comprehensive filters
            if (activeFilters.propertyId) params.propertyId = activeFilters.propertyId;
            if (activeFilters.keyword) params.keyword = activeFilters.keyword;
            if (activeFilters.projectId) params.projectId = activeFilters.projectId;
            if (activeFilters.zoneId) params.zoneId = activeFilters.zoneId;
            if (activeFilters.blockId) params.blockId = activeFilters.blockId;
            if (activeFilters.propertyType) params.propertyType = activeFilters.propertyType;
            if (activeFilters.bedrooms) params.bedrooms = activeFilters.bedrooms;
            if (activeFilters.bathrooms) params.bathrooms = activeFilters.bathrooms;
            if (activeFilters.currency) params.currency = activeFilters.currency;
            if (activeFilters.minPrice) params.minPrice = activeFilters.minPrice;
            if (activeFilters.maxPrice) params.maxPrice = activeFilters.maxPrice;

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
        return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
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
        if (cat.includes('lease') || cat.includes('rent')) return t.forRent;
        if (cat.includes('sale') || cat.includes('sell')) return t.forSale;
        if (cat.includes('home') || cat.includes('stay')) return t.homestay;
        return getLocalizedValue(category);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff]">
                {/* Modern Header */}
                <div className="">
                    <div className="max-w-7xl mx-auto px-6 py-5">
                        <div className="flex items-center gap-3 text-sm mb-4">
                            <a href="/" className="text-gray-500 hover:text-[#41398B] font-medium transition-colors">{t.home}</a>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#41398B] font-semibold">{t.properties}</span>
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-1">
                                    {t.discoverDreamProperty}
                                </h1>
                                <p className="text-gray-900 text-md">{t.findPerfectPlace}</p>
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
                                    <Select.Option value="default">{t.defaultSort}</Select.Option>
                                    <Select.Option value="price-low">{t.priceLowHigh}</Select.Option>
                                    <Select.Option value="price-high">{t.priceHighLow}</Select.Option>
                                    <Select.Option value="newest">{t.newest}</Select.Option>
                                    <Select.Option value="oldest">{t.oldest}</Select.Option>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto py-5 md:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                        {/* Sidebar */}
                        <aside className="lg:sticky lg:top-24 h-fit self-start w-full lg:w-auto">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-purple-100/50">
                                {/* Category - Horizontal Scroll on Mobile */}
                                <div className="mb-4">
                                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        {['All', 'Lease', 'Sale', 'Home Stay'].map((cat) => (
                                            <button
                                                key={cat}
                                                className={`flex-none px-4 py-2 lg:py-3 lg:px-4 text-sm lg:text-md font-semibold rounded-xl cursor-pointer transition-all whitespace-nowrap ${selectedCategory === cat
                                                    ? 'bg-gradient-to-r from-[#41398B] to-[#5b52a3] text-white'
                                                    : 'bg-purple-50/50 text-gray-700 hover:bg-purple-100/70'
                                                    }`}
                                                onClick={() => setSelectedCategory(cat)}
                                            >
                                                {cat === 'All' ? t.viewAll : cat === 'Lease' ? t.forRent : cat === 'Sale' ? t.forSale : t.homestay}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Filter Toggle */}
                                <button
                                    className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-[#41398B] font-bold rounded-xl mb-4 shadow-sm active:bg-gray-50 transition-colors"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter size={18} />
                                    <span>{showFilters ? (language === 'vi' ? 'Ẩn bộ lọc' : 'Hide Filters') : (language === 'vi' ? 'Hiển thị bộ lọc' : 'Show Filters')}</span>
                                    {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {/* Detailed Filters */}
                                <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                                    <div className="border-t border-gray-200 mt-0 mb-4 hidden lg:block"></div>
                                    <h3 className="text-[22px] font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-2 hidden lg:block">{t.lookingFor}</h3>

                                    {/* Property ID / Keyword Search */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.propertyIdOrKeyword}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border border-purple-200/60 rounded-lg text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                            placeholder={t.propertyIdOrKeyword}
                                            value={filters.keyword}
                                            onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                        />
                                    </div>
                                    <h3 className="text-[22px] font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-2 hidden lg:block">{t.location}</h3>
                                    {/* Project / Community */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.projectCommunity}</label>
                                        <Select
                                            className="custom-selects"
                                            popupClassName="custom-dropdown"
                                            value={filters.projectId || undefined}
                                            onChange={(value) => handleFilterChange('projectId', value || '')}
                                            placeholder={t.projectCommunity}
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
                                        <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.areaZone}</label>
                                        <Select
                                            className="custom-selects"
                                            popupClassName="custom-dropdown"
                                            value={filters.zoneId || undefined}
                                            onChange={(value) => handleFilterChange('zoneId', value || '')}
                                            placeholder={t.areaZone}
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
                                        <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.blockName}</label>
                                        <Select
                                            className="custom-selects"
                                            popupClassName="custom-dropdown"
                                            value={filters.blockId || undefined}
                                            onChange={(value) => handleFilterChange('blockId', value || '')}
                                            placeholder={t.blockName}
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
                                        <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.propertyType}</label>
                                        <Select
                                            className="custom-selects"
                                            popupClassName="custom-dropdown"
                                            value={filters.propertyType || undefined}
                                            onChange={(value) => handleFilterChange('propertyType', value || '')}
                                            placeholder={t.propertyType}
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
                                            <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.bedrooms}</label>
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
                                            <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.bathrooms}</label>
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
                                    <h3 className="text-[22px] font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent mb-2 hidden lg:block">{t.priceRange}</h3>

                                    {/* Currency */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.currency}</label>
                                        <Select
                                            className="custom-selects"
                                            popupClassName="custom-dropdown"
                                            value={filters.currency || undefined}
                                            onChange={(value) => handleFilterChange('currency', value || '')}
                                            placeholder={t.currency}
                                            style={{ width: '100%' }}
                                            size="large"
                                            allowClear
                                        >
                                            {currencies.map((curr) => {
                                                const name = getLocalizedValue(curr.currencyName) || 'N/A';
                                                const code = getLocalizedValue(curr.currencyCode) || '';
                                                return (
                                                    <Select.Option key={curr._id} value={code}>
                                                        {name} ({code})
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    </div>

                                    {/* Min & Max Price */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.minPrice}</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2.5 border border-purple-200/60 rounded-lg text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                                placeholder={t.minPrice}
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#2a2a2a] mb-2">{t.maxPrice}</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2.5 border border-purple-200/60 rounded-lg text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                                placeholder={t.maxPrice}
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
                                        {t.applyFilters}
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Property Grid */}
                        <main>
                            {loading ? (
                                <Loader />
                            ) : properties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl">
                                    <svg className="w-24 h-24 text-purple-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h2 className="text-2xl font-bold text-gray-700 mb-2">{t.noPropertiesFound}</h2>
                                    <p className="text-gray-500">{t.adjustFilters}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4 md:p-0">
                                        {properties.map((property, index) => {
                                            const isLastProperty = properties.length === index + 1;
                                            return (
                                                <div
                                                    key={property._id}
                                                    ref={isLastProperty ? lastPropertyRef : null}
                                                    className="card-house style-default hover-image group bg-white rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer"
                                                    onClick={() => {
                                                        const id = property.listingInformation?.listingInformationPropertyId || property._id;
                                                        const slug = getLocalizedValue(property.seoInformation?.slugUrl);
                                                        // Navigate to ID/Slug or just ID
                                                        navigate(`/property-showcase/${id}${slug ? `/${slug}` : ''}`);
                                                    }}
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
                                                        {/* Favorite Button */}
                                                        <div className="absolute top-3 right-3 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                                            <button
                                                                onClick={(e) => handleToggleFavorite(e, property)}
                                                                className="p-1 bg-white rounded-md shadow-sm text-[#000] hover:scale-105 transition-transform cursor-pointer"
                                                            >
                                                                <Tooltip title={isFavorite(property._id)
                                                                    ? (language === 'vi' ? 'Xóa khỏi Yêu thích' : 'Remove from Favorites')
                                                                    : (language === 'vi' ? 'Thêm vào Yêu thích' : 'Add to Favorites')}>
                                                                    <Heart
                                                                        size={16}
                                                                        className={`${isFavorite(property._id) ? 'fill-[#eb4d4d] text-[#eb4d4d]' : 'text-[#2a2a2a]'}`}
                                                                    />
                                                                </Tooltip>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="pt-2 pb-5 px-2">
                                                        {/* Price */}
                                                        <div className="flex items-baseline gap-0 mb-0">
                                                            {(() => {
                                                                const type = getLocalizedValue(property.listingInformation?.listingInformationTransactionType);
                                                                const priceSale = property.financialDetails?.financialDetailsPrice;
                                                                const priceLease = property.financialDetails?.financialDetailsLeasePrice;
                                                                const priceNight = property.financialDetails?.financialDetailsPricePerNight;
                                                                const genericPrice = property.financialDetails?.financialDetailsPrice;

                                                                // Handle currency safely (extract code)
                                                                const currencyData = property.financialDetails?.financialDetailsCurrency;
                                                                const currencyCode = (typeof currencyData === 'object' ? currencyData?.code : currencyData) || '';

                                                                let displayPrice = t.contactForPrice;
                                                                let displaySuffix = null;

                                                                // Helper to format price with currency
                                                                const formatP = (p) => `${Number(p).toLocaleString()} ${currencyCode}`;

                                                                if (type === 'Sale' && priceSale) {
                                                                    displayPrice = formatP(priceSale);
                                                                } else if (type === 'Lease' && priceLease) {
                                                                    displayPrice = formatP(priceLease);
                                                                    displaySuffix = ' / month';
                                                                } else if (type === 'Home Stay' && priceNight) {
                                                                    displayPrice = formatP(priceNight);
                                                                    displaySuffix = ' / night';
                                                                } else if (genericPrice) {
                                                                    displayPrice = formatP(genericPrice);
                                                                    if (selectedCategory === 'Lease') {
                                                                        displaySuffix = ' / month';
                                                                    } else if (selectedCategory === 'Home Stay') {
                                                                        displaySuffix = ' / night';
                                                                    }
                                                                }

                                                                return (
                                                                    <>
                                                                        <span className="text-[22px] font-bold text-[#2a2a2a]">{displayPrice}</span>
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
                                                                t.untitledProperty}
                                                        </h3>

                                                        {/* Location / Nearby */}
                                                        <p className="text-[16px] text-gray-500 mb-4 line-clamp-3">
                                                            {getLocalizedValue(property.whatNearby?.whatNearbyDescription) ||
                                                                getLocalizedValue(property.listingInformation?.listingInformationZoneSubArea) ||
                                                                'Description not specified'}
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
            <Footer />
        </>
    );
}