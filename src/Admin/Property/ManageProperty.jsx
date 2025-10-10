import React, { useState, useMemo } from "react";
import { Search, Filter, Plus, Share2, Eye, Trash2, Pencil } from "lucide-react";

export default function ManageProperty({ openCreateProperty }) {
    const properties = Array.from({ length: 35 }).map((_, i) => ({
        id: `P00000${i + 10}`,
        name: "Silverwood Residences",
        type: ["Penthouse", "Apartment", "Villa"][i % 3],
        transaction: ["Sell", "Lease"][i % 2],
        address: "Ecopark, Hung Yen, Vietnam",
        status: i % 4 === 0 ? "Draft" : "Published",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200",
    }));

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProperties = useMemo(() => {
        return properties.filter(
            (p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transaction.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, properties]);

    const totalRows = filteredProperties.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = filteredProperties.slice(startIndex, endIndex);

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f3f6] px-10 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Manage Property</h1>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-gray-700 hover:bg-gray-50 shadow-sm">
                        <Filter className="w-4 h-4" />
                        Property
                    </button>
                    <button
                        onClick={openCreateProperty}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Add property
                    </button>

                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search property..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 text-left">
                        <tr>
                            <th className="px-6 py-3 font-medium">Property</th>
                            <th className="px-6 py-3 font-medium">Transaction Type</th>
                            <th className="px-6 py-3 font-medium">Property Type</th>
                            <th className="px-6 py-3 font-medium">Address</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((p, i) => (
                            <tr
                                key={i}
                                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                            >
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-14 h-14 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">ID: {p.id}</p>
                                        <p className="text-gray-900 font-semibold">{p.name}</p>
                                    </div>
                                </td>

                                <td className="px-6 py-4 capitalize">{p.transaction}</td>
                                <td className="px-6 py-4 capitalize">{p.type}</td>
                                <td className="px-6 py-4">{p.address}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === "Published"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                        <Share2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                        <Eye className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                        <Pencil className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 rounded-full">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {currentRows.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    No properties found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="border rounded-md text-gray-700 focus:outline-none px-2 py-1"
                        >
                            {[5, 10, 20, 25, 50].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <p>
                            {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
                        </p>
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-1 px-2 rounded ${currentPage === 1
                                ? "text-gray-400"
                                : "hover:bg-gray-100 text-gray-600"
                                }`}
                        >
                            &lt;
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-1 px-2 rounded ${currentPage === totalPages
                                ? "text-gray-400"
                                : "hover:bg-gray-100 text-gray-600"
                                }`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
