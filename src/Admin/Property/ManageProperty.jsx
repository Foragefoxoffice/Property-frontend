import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Share2,
  Eye,
  Trash2,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import {
  getAllPropertyListings,
  deletePropertyListing,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import commonimg from "../../assets/image/commonimg.jpg";

export default function ManageProperty({
  openCreateProperty,
  openEditProperty,
}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // ✅ Fetch properties
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await getAllPropertyListings();
        console.log("Fetched properties:", res);
        if (res?.data?.success) setProperties(res.data.data || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // ✅ Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const info = p.listingInformation || {};
      return (
        (info.listingInformationPropertyTitle?.en || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (info.listingInformationTransactionType?.en || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (info.listingInformationPropertyId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, properties]);

  // ✅ Pagination logic
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

  // ✅ Delete property
  const handleDelete = async () => {
    try {
      await deletePropertyListing(deleteConfirm.id);
      setProperties((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
      CommonToaster("Property deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting property:", err);
      CommonToaster("Failed to delete property", "error");
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });

  return (
    <div className="min-h-screen px-10 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manage Property
        </h1>

        <div className="flex items-center gap-4">
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-gray-700 hover:bg-gray-50 shadow-sm">
            <Filter className="w-4 h-4" />
            Property
          </button> */}
          <button
            onClick={openCreateProperty}
            className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-full shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add property
          </button>
        </div>
      </div>

      {/* Search */}
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
        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading properties...
          </div>
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Transaction Type</th>
                <th className="px-6 py-3 font-medium">Block Name</th>
                <th className="px-6 py-3 font-medium">Availability</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((p, i) => {
                const info = p.listingInformation || {};
                const img = p.imagesVideos?.propertyImages?.[0];
                return (
                  <tr
                    key={p._id || i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={img || commonimg}
                        alt="Property"
                        className="w-14 h-14 rounded-lg object-cover"
                        onError={(e) => (e.target.src = commonimg)}
                      />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          ID: {info.listingInformationPropertyId || "—"}
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {info.listingInformationPropertyTitle?.en ||
                            "Untitled"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {info.listingInformationTransactionType?.en || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {info.listingInformationBlockName?.en || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {info.listingInformationAvailabilityStatus?.en || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === "Published"
                          ? "bg-green-100 text-green-700"
                          : p.status === "Archived"
                            ? "bg-gray-200 text-gray-700"
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
                      <button
                        onClick={() => openEditProperty(p)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => confirmDelete(p._id)}
                        className="p-2 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No properties found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Pagination */}
      {!loading && totalRows > 0 && (
        <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50 mt-4 rounded-b-2xl">
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
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              &lt;
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1 px-2 rounded ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal (same as AvailabilityStatusPage) */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this property? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
