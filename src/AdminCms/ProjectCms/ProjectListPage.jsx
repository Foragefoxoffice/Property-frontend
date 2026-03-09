import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Space, Modal, ConfigProvider, Spin, Select } from "antd";
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, MoreVertical, Pencil, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Calendar, Languages, Eye } from "lucide-react";
import { getAllProjectsAdmin, deleteProject } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";
import { CommonToaster } from "@/Common/CommonToaster";
import { getImageUrl } from "../../utils/imageHelper";
import { translations } from "../../Language/translations";

export default function ProjectListPage() {
    const { language } = useLanguage();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingProjectId, setDeletingProjectId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);

    const t = translations[language];

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await getAllProjectsAdmin();
            setProjects(res.data.data);
        } catch (error) {
            console.error(error);
            CommonToaster(t.toastProjectFetchError, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeletingProjectId(id);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        setSubmitLoading(true);
        try {
            await deleteProject(deletingProjectId);
            CommonToaster(t.toastProjectDeleted, "success");
            setDeleteModalVisible(false);
            setDeletingProjectId(null);
            fetchProjects();
        } catch (error) {
            console.error(error);
            CommonToaster(t.toastProjectDeleteError, "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const filteredProjects = projects.filter((project) => {
        const titleEn = project.title?.en || "";
        const titleVi = project.title?.vi || "";
        const search = searchTerm.toLowerCase();
        return titleEn.toLowerCase().includes(search) || titleVi.toLowerCase().includes(search);
    });

    const totalRows = filteredProjects.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const visibleData = filteredProjects.slice(startIndex, endIndex);

    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

    return (
        <div className="min-h-screen px-6 py-6 font-primary relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t.pageDescription}</p>
                </div>
                <Link to="/dashboard/cms/projects/create">
                    <button className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-lg font-medium transition shadow-md cursor-pointer">
                        <Plus size={18} />
                        {t.createProject}
                    </button>
                </Link>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute top-2.5 left-3 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                />
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">{t.sno}</th>
                                <th className="px-6 py-4 text-left font-medium">{t.title}</th>
                                <th className="px-6 py-4 text-left font-medium">{t.category}</th>
                                <th className="px-6 py-4 text-center font-medium">{t.status}</th>
                                <th className="px-6 py-4 text-right font-medium">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12">
                                        <div className="flex justify-center">
                                            <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                                                <Spin size="large" />
                                            </ConfigProvider>
                                        </div>
                                    </td>
                                </tr>
                            ) : visibleData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">{t.noProjectsFound || "No projects found."}</td>
                                </tr>
                            ) : (
                                visibleData.map((project, i) => (
                                    <tr key={project._id} className="border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500">{startIndex + i + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {project.mainImage && (
                                                    <img src={getImageUrl(project.mainImage)} alt="" className="w-12 h-12 object-cover rounded-md border border-gray-100" />
                                                )}
                                                <span className="font-semibold text-gray-800 line-clamp-1">
                                                    {project.title?.[language] || project.title?.vi || "Untitled"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {project.category?.name?.[language] || project.category?.name?.vi || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${project.published ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                                                {project.published ? t.published : t.draft}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500" onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}>
                                                <MoreVertical size={18} />
                                            </button>
                                            {openMenuIndex === i && (
                                                <div className="absolute right-10 top-10 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 py-1 overflow-hidden text-left">
                                                    <Link to={`/dashboard/cms/projects/edit/${project._id}`}>
                                                        <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition group">
                                                            <span className="w-8 flex justify-center"><Pencil size={15} className="text-blue-600" /></span>
                                                            {t.edit}
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => handleDelete(project._id)} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition group">
                                                        <span className="w-8 flex justify-center"><Trash2 size={15} /></span>
                                                        {t.delete}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                    <button onClick={goToFirst} disabled={currentPage === 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronsLeft size={18} /></button>
                    <button onClick={goToPrev} disabled={currentPage === 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronLeft size={18} /></button>
                    <span className="text-sm font-medium">{language === 'vi' ? 'Trang' : 'Page'} {currentPage} {t.of} {totalPages}</span>
                    <button onClick={goToNext} disabled={currentPage === totalPages} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronRight size={18} /></button>
                    <button onClick={goToLast} disabled={currentPage === totalPages} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronsRight size={18} /></button>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModalVisible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3"><AlertTriangle className="text-red-600 w-5 h-5" /></div>
                            <h3 className="font-bold text-lg text-gray-900">{t.deleteProject}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">{t.deleteConfirmation}</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModalVisible(false)} className="px-5 py-2.5 border rounded-lg text-sm">{t.cancel}</button>
                            <button onClick={handleConfirmDelete} disabled={submitLoading} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm shadow-sm transition disabled:opacity-50">
                                {submitLoading ? t.deleting : t.yesDelete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
