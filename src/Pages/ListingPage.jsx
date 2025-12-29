import { useState, useEffect, useRef, useCallback } from 'react';
import { getListingProperties } from '../Api/action';
import { Select } from 'antd';

export default function ListingPage() {
    const [selectedCategory, setSelectedCategory] = useState('Lease');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        budget: '',
        minSize: '',
        maxSize: '',
        propertyType: ''
    });
    const [sortBy, setSortBy] = useState('default');
    const [viewMode, setViewMode] = useState('grid');
    const observer = useRef();

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

            if (filters.search) params.search = filters.search;
            if (filters.location) params.location = filters.location;
            if (filters.bedrooms) params.bedrooms = filters.bedrooms;
            if (filters.bathrooms) params.bathrooms = filters.bathrooms;
            if (filters.propertyType) params.propertyType = filters.propertyType;
            if (filters.budget) params.maxPrice = filters.budget;
            if (filters.minSize) params.minSize = filters.minSize;
            if (filters.maxSize) params.maxSize = filters.maxSize;

            const response = await getListingProperties(params);

            if (response.data.success) {
                const newProperties = response.data.data;

                if (isNewSearch) {
                    setProperties(newProperties);
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

    const formatPrice = (price, currency) => {
        if (!price) return 'Contact for Price';
        const currencySymbol = getLocalizedValue(currency) || '$';
        return `${currencySymbol}${Number(price).toLocaleString()}`;
    };

    const getCategoryBadgeClass = (category) => {
        const cat = getLocalizedValue(category).toLowerCase();
        if (cat.includes('lease') || cat.includes('rent')) return 'bg-gradient-to-r from-emerald-500 to-teal-500';
        if (cat.includes('sale') || cat.includes('sell')) return 'bg-gradient-to-r from-rose-500 to-pink-500';
        if (cat.includes('home') || cat.includes('stay')) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    };

    const getCategoryLabel = (category) => {
        const cat = getLocalizedValue(category).toLowerCase();
        if (cat.includes('lease') || cat.includes('rent')) return 'For Rent';
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
                            <p className="text-gray-600 text-sm">Find the perfect place to call home</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex gap-1 bg-purple-50/80 p-1 rounded-xl">
                                <button
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#41398B] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-[#41398B]'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#41398B] text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:text-[#41398B]'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>

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
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                    {/* Sidebar */}
                    <aside className="lg:sticky lg:top-28 h-fit">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 pt-1 shadow-xl border border-purple-100/50">
                            {/* Category */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#41398B] mb-3">Property Type</label>
                                <div className="space-y-2">
                                    {['Lease', 'Sale', 'Home Stay'].map((cat) => (
                                        <button
                                            key={cat}
                                            className={`w-full px-4 py-3 text-left text-sm font-semibold rounded-xl cursor-pointer transition-all ${selectedCategory === cat
                                                ? 'bg-gradient-to-r from-[#41398B] to-[#5b52a3] text-white'
                                                : 'bg-purple-50/50 text-gray-700 hover:bg-purple-100/70'
                                                }`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat === 'Lease' ? 'For Rent' : cat === 'Sale' ? 'For Sale' : 'Homestay'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#41398B] mb-3">Search</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-purple-200/60 rounded-xl text-sm bg-white/80 placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                    placeholder="Search properties..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            {/* Location */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#41398B] mb-3">Location</label>
                                <Select
                                    className="custom-selects"
                                    popupClassName="custom-dropdown"
                                    value={filters.location || undefined}
                                    onChange={(value) => handleFilterChange('location', value || '')}
                                    placeholder="All Cities"
                                    style={{ width: '100%' }}
                                    size="large"
                                    allowClear
                                >
                                    <Select.Option value="hanoi">Hanoi</Select.Option>
                                    <Select.Option value="hcmc">Ho Chi Minh City</Select.Option>
                                    <Select.Option value="danang">Da Nang</Select.Option>
                                    <Select.Option value="haiphong">Hai Phong</Select.Option>
                                </Select>
                            </div>

                            {/* Bedrooms & Bathrooms */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#41398B] mb-2">Bedrooms</label>
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
                                    <label className="block text-xs font-bold text-[#41398B] mb-2">Bathrooms</label>
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

                            {/* Budget */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#41398B] mb-3">Budget</label>
                                <Select
                                    className="custom-selects"
                                    popupClassName="custom-dropdown"
                                    value={filters.budget || undefined}
                                    onChange={(value) => handleFilterChange('budget', value || '')}
                                    placeholder="Max Price"
                                    style={{ width: '100%' }}
                                    size="large"
                                    allowClear
                                >
                                    <Select.Option value="500">Up to $500</Select.Option>
                                    <Select.Option value="1000">Up to $1,000</Select.Option>
                                    <Select.Option value="2000">Up to $2,000</Select.Option>
                                    <Select.Option value="5000">Up to $5,000</Select.Option>
                                    <Select.Option value="10000">$10,000+</Select.Option>
                                </Select>
                            </div>

                            {/* Search Button */}
                            <button
                                className="w-full px-6 py-3.5 bg-gradient-to-r from-[#41398B] to-[#5b52a3] text-white font-bold rounded-xl hover:shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                onClick={handleSearch}
                            >
                                Search Properties
                            </button>
                        </div>
                    </aside>

                    {/* Property Grid */}
                    <main>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 border-4 border-purple-200 border-t-[#41398B] rounded-full animate-spin"></div>
                                <p className="mt-4 text-gray-600 font-medium">Loading properties...</p>
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
                                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-purple-50 hover:border-purple-200 transition-all duration-500 cursor-pointer"
                                            >
                                                {/* Image */}
                                                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100">
                                                    <img
                                                        src={property.imagesVideos?.propertyImages?.[0] || '/images/property/dummy-img.avif'}
                                                        alt={getLocalizedValue(property.listingInformation?.listingInformationBlockName)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    {/* Badges */}
                                                    <div className="absolute top-3 left-3 flex gap-2">
                                                        <span className={`px-3 py-1.5 ${getCategoryBadgeClass(property.listingInformation?.listingInformationTransactionType)} text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg`}>
                                                            {getCategoryLabel(property.listingInformation?.listingInformationTransactionType)}
                                                        </span>
                                                        {property.listingInformation?.listingInformationPropertyType && (
                                                            <span className="px-3 py-1.5 bg-[#41398B]/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">
                                                                {getLocalizedValue(property.listingInformation.listingInformationPropertyType)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    {/* Price */}
                                                    <div className="flex items-baseline gap-1 mb-1">
                                                        <span className="text-2xl font-bold bg-gradient-to-r from-[#41398B] to-[#6b5dd3] bg-clip-text text-transparent">
                                                            {formatPrice(property.financialDetails?.financialDetailsPrice, property.financialDetails?.financialDetailsCurrency)}
                                                        </span>
                                                        {selectedCategory === 'Lease' && <span className="text-sm text-gray-500 font-medium">/month</span>}
                                                        {selectedCategory === 'Sale' && <span className="text-sm text-gray-500 font-medium">/sqft</span>}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#41398B] transition-colors">
                                                        {getLocalizedValue(property.listingInformation?.listingInformationBlockName) ||
                                                            getLocalizedValue(property.listingInformation?.listingInformationProjectCommunity) ||
                                                            'Untitled Property'}
                                                    </h3>

                                                    {/* Location */}
                                                    <p className="text-sm text-gray-500 mb-4 line-clamp-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {getLocalizedValue(property.listingInformation?.listingInformationZoneSubArea) || 'Location not specified'}
                                                    </p>

                                                    {/* Details */}
                                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                                        {property.propertyInformation?.informationBedrooms && (
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                <svg className="w-5 h-5 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                                </svg>
                                                                <span className="font-semibold">{property.propertyInformation.informationBedrooms}</span>
                                                            </div>
                                                        )}
                                                        {property.propertyInformation?.informationBathrooms && (
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                <svg className="w-5 h-5 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                                </svg>
                                                                <span className="font-semibold">{property.propertyInformation.informationBathrooms}</span>
                                                            </div>
                                                        )}
                                                        {property.propertyInformation?.informationUnitSize && (
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                <svg className="w-5 h-5 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                                </svg>
                                                                <span className="font-semibold">{property.propertyInformation.informationUnitSize.toLocaleString()} {getLocalizedValue(property.propertyInformation.informationUnit) || 'sqft'}</span>
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
                                    <div className="flex justify-center items-center py-8">
                                        <div className="w-10 h-10 border-4 border-purple-200 border-t-[#41398B] rounded-full animate-spin"></div>
                                        <p className="ml-3 text-gray-600 font-medium">Loading more...</p>
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
                </div>
            </div>
        </div>
    );
}