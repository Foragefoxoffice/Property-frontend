import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, Eye, X, Building2 } from 'lucide-react';
import { Spin } from 'antd';
import { CommonToaster } from '../../Common/CommonToaster';

export default function ProjectEnquirySection({ projectName, isOpen, onToggle, language }) {
    const isVI = language === 'vi';
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageModal, setMessageModal] = useState({ show: false, message: '', userName: '' });

    useEffect(() => {
        if (isOpen && projectName) {
            fetchEnquiries();
        }
    }, [isOpen, projectName]);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/project-enquiry`);
            // Filter by project name
            const filtered = (res.data.data || []).filter(enq => enq.projectName === projectName);
            setEnquiries(filtered);
        } catch (error) {
            console.error("Error fetching enquiries for project:", error);
            CommonToaster(isVI ? "Lỗi khi lấy dữ liệu" : "Error fetching data", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-[#41398B] text-white' : 'bg-[#41398B]/10 text-[#41398B]'}`}>
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">
                            {isVI ? "Yêu cầu từ khách hàng" : "Customer Enquiries"}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium capitalize">
                            {isVI ? `Danh sách các yêu cầu liên quan đến ${projectName}` : `List of enquiries related to ${projectName}`}
                        </p>
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 border-[#41398B] bg-[#41398B] text-white' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="px-6 py-6 border-t border-gray-100 bg-[#F9FAFB]/50 animate-in slide-in-from-top-2 duration-300">
                    {loading ? (
                        <div className="py-10 flex justify-center"><Spin /></div>
                    ) : enquiries.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                            <Mail className="w-12 h-12 mb-2 opacity-20" />
                            <p className="font-medium">{isVI ? "Chưa có yêu cầu nào cho dự án này" : "No enquiries yet for this project"}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">{isVI ? "Họ tên" : "Full Name"}</th>
                                        <th className="px-4 py-3 font-semibold">{isVI ? "Số điện thoại" : "Phone"}</th>
                                        <th className="px-4 py-3 font-semibold">{isVI ? "Tin nhắn" : "Message"}</th>
                                        <th className="px-4 py-3 font-semibold">{isVI ? "Ngày" : "Date"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {enquiries.map((enq) => (
                                        <tr key={enq._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{enq.fullName}</td>
                                            <td className="px-4 py-3 text-gray-600">{enq.phone}</td>
                                            <td className="px-4 py-3">
                                                {enq.message ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[150px] text-gray-500" title={enq.message}>{enq.message}</span>
                                                        <button 
                                                            onClick={() => setMessageModal({ show: true, message: enq.message, userName: enq.fullName })}
                                                            className="p-1 text-[#41398B] hover:bg-[#41398B]/10 rounded transition-colors cursor-pointer"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {new Date(enq.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Message Modal */}
            {messageModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 transition-all">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#41398B]/10 flex items-center justify-center">
                                    <Mail className="text-[#41398B] w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">
                                    {isVI ? 'Chi tiết tin nhắn' : 'Message Details'}
                                </h3>
                            </div>
                            <button onClick={() => setMessageModal({ show: false, message: '', userName: '' })} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                            <p className="text-sm font-medium text-gray-500 mb-1">{isVI ? 'Từ' : 'From'}: <span className="text-[#41398B]">{messageModal.userName}</span></p>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{messageModal.message}</p>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setMessageModal({ show: false, message: '', userName: '' })}
                                className="px-6 py-2 bg-[#41398B] text-white rounded-lg font-bold hover:bg-[#352e7a] transition-all cursor-pointer"
                            >
                                {isVI ? 'Đóng' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
