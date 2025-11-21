import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Eye,
  Trash2,
  RotateCcw,
  X,
  SlidersHorizontal,
} from "lucide-react";

import {
  getTrashProperties,
  permanentlyDeleteProperty,
  restoreProperty,
} from "../../Api/action";

import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

import { useNavigate } from "react-router-dom";
import FiltersPage from "../Filters/Filter";

/* ======================================================
   🗑️ MANAGE TRASH PROPERTY (Option C - Dropdown Filter)
====================================================== */
export default function ManageTrashProperty() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  // Core state
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Backend pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Dropdown for type filter
  const [selectedType, setSelectedType] = useState("All");

  /* ======================================================
     FETCH TRASHED PROPERTIES
  ====================================================== */
  const fetchProperties = async () => {
    setLoading(true);

    try {
      const res = await getTrashProperties({
        type: selectedType === "All" ? "" : selectedType,
        page: currentPage,
        limit: rowsPerPage,
      });

      if (res?.data?.success) {
        setProperties(res.data.data || []);
        setTotalRows(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching trash:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters/pagination/type changes
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line
  }, [selectedType, currentPage, rowsPerPage]);

  /* ======================================================
     CLIENT SIDE FILTERING / SEARCH
  ====================================================== */
  const filteredRows = useMemo(() => {
    let list = properties;

    // Search
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();

      list = list.filter((p) => {
        const info = p.listingInformation || {};

        const propertyId =
          info.listingInformationPropertyId?.toLowerCase() || "";

        const propertyNo =
          info.listingInformationPropertyNo?.[language]?.toLowerCase() ||
          info.listingInformationPropertyNo?.en?.toLowerCase() ||
          "";

        return (
          propertyId.includes(search) ||
          propertyNo.includes(search) ||
          p.status?.toLowerCase().includes(search)
        );
      });
    }

    return list;
  }, [properties, searchTerm, language]);

  // Final rows
  const currentRows = filteredRows;

  // Pagination helpers
  const startIndex =
    totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

  const endIndex =
    totalRows === 0
      ? 0
      : Math.min((currentPage - 1) * rowsPerPage + currentRows.length, totalRows);

  /* ======================================================
     RESTORE
  ====================================================== */
  const handleRestore = async (id) => {
    try {
      await restoreProperty(id);
      CommonToaster("Restored successfully", "success");

      setProperties((prev) => prev.filter((p) => p._id !== id));
      setTotalRows((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      CommonToaster("Failed to restore", "error");
    }
  };

  /* ======================================================
     PERMANENT DELETE
  ====================================================== */
  const handleDelete = async () => {
    try {
      await permanentlyDeleteProperty(deleteConfirm.id);

      CommonToaster("Property permanently deleted", "success");

      setProperties((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
      setTotalRows((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      CommonToaster("Delete failed", "error");
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="min-h-screen px-2 py-2">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Trash</h1>

        {/* Dropdown + Filters */}
        <div className="flex items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-full px-4 py-2 bg-white"
          >
            <option value="All">All Types</option>
            <option value="Sale">Sale</option>
            <option value="Lease">Lease</option>
            <option value="Home Stay">Home Stay</option>
          </select>

          <button
            onClick={() => setShowFilterPopup(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 rounded-full bg-white focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#EAE9EE] text-gray-600">
              <tr>
                <th className="px-6 py-3">Property ID</th>
                <th className="px-6 py-3">Property No</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Block</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>

            <tbody>
              {currentRows.map((p, i) => {
                const info = p.listingInformation;

                return (
                  <tr
                    key={p._id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-4">
                      {info?.listingInformationPropertyId}
                    </td>

                    <td className="px-6 py-4">
                      {info?.listingInformationPropertyNo?.en || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {info?.listingInformationPropertyType?.en || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {info?.listingInformationBlockName?.en || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                        {p.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      {/* VIEW */}
                      <button
                        onClick={() =>
                          navigate(
                            `/property-showcase/${info?.listingInformationPropertyId}`
                          )
                        }
                        className="p-2 border rounded-full hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* RESTORE */}
                      <button
                        onClick={() => handleRestore(p._id)}
                        className="p-2 border rounded-full hover:bg-gray-100"
                      >
                        <RotateCcw className="w-4 h-4 text-green-600" />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() =>
                          setDeleteConfirm({ show: true, id: p._id })
                        }
                        className="p-2 border rounded-full hover:bg-gray-100"
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
                    No trashed properties
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalRows > 0 && (
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t mt-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p>
              {startIndex}-{endIndex} of {totalRows}
            </p>

            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              &lt;
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Permanently delete this property?
            </h2>

            <p className="text-gray-600 mb-6">
              This cannot be undone. The property will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 border rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-full"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {showFilterPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <button
                onClick={() => setShowFilterPopup(false)}
                className="p-2 rounded-full"
              >
                <X />
              </button>
            </div>

            <FiltersPage
              defaultFilters={appliedFilters}
              onApply={(data) => {
                setAppliedFilters(data);
                setShowFilterPopup(false);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================================================
   Skeleton Loader
====================================================== */
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-6 py-4 bg-white"
        >
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-18 h-14 bg-gray-300 rounded-lg" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3 bg-gray-300 rounded w-2/3" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-300 rounded w-24" />
          <div className="h-3 bg-gray-300 rounded w-20" />
          <div className="h-3 bg-gray-300 rounded w-24" />
          <div className="h-6 bg-gray-300 rounded-full w-20" />
        </div>
      ))}
    </div>
  );
};
