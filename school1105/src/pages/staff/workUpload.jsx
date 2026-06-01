import React, { useState, useEffect } from "react";
import {
    FaUpload,
    FaFileAlt,
    FaImage,
    FaPaperPlane,
    FaTrashAlt,
    FaPlus,
    FaTimes,
    FaFileSignature,
    FaCalendarAlt,
    FaEdit,
    FaBookOpen,
    FaRegFilePdf,
    FaEye
} from "react-icons/fa";
import { localurl } from "../../api/api";
import { showSuccess, showError } from "../../Component/common/alert";
import Swal from "sweetalert2";

const WorkUpload = () => {
    const [classList, setClassList] = useState([]);
    const [workList, setWorkList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    const [formData, setFormData] = useState({
        class_id: "",
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const staff_id = authData.id;

    const imageBase = localurl.replace("/api/", "/");

    useEffect(() => {
        fetchClasses();
        fetchWorkHistory();
    }, []);

    const fetchClasses = async () => {
        try {
            // Fetch combined class and section data
            const res = await fetch(`${localurl}get_class_sections/${school_id}`);
            const data = await res.json();
            if (data.success) setClassList(data.row);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWorkHistory = async () => {
        try {
            const res = await fetch(`${localurl}get_staff_work/${school_id}/${session_id}/${staff_id}`);
            const data = await res.json();
            if (data.success) setWorkList(data.row || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getClassName = (id) => {
        const cls = classList.find(c => String(c.id) === String(id));
        return cls ? cls.class_name : "N/A";
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ 
            class_id: "", 
            title: "", 
            description: "",
            date: new Date().toISOString().split('T')[0]
        });
        setFile(null);
        setFilePreview(null);
        setShowModal(true);
    };

    const openEditModal = (work) => {
        setIsEditing(true);
        setEditId(work.id);
        setFormData({
            class_id: work.class_id,
            title: work.title,
            description: work.description,
            date: work.date ? new Date(work.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setFile(null);
        setFilePreview(work.file_path && !work.file_path.toLowerCase().endsWith('.pdf') ? `${imageBase}uploads/employee/${work.file_path}` : null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.class_id || !formData.title) {
            showError("Please fill required fields");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append("school_id", school_id);
        data.append("session_id", session_id);
        data.append("staff_id", staff_id);
        data.append("class_id", formData.class_id);
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("date", formData.date);
        if (file) data.append("file", file);

        try {
            const url = isEditing ? `${localurl}update_work/${editId}` : `${localurl}upload_work`;

            const res = await fetch(url, {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.success) {
                showSuccess(isEditing ? "Work updated successfully" : "Work assigned successfully");
                setShowModal(false);
                fetchWorkHistory();
            } else {
                showError(result.message);
            }
        } catch (err) {
            showError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this work assignment!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0860C4',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`${localurl}delete_work/${id}`, { method: "PUT" });
                const result = await res.json();
                if (result.success) {
                    showSuccess("Deleted successfully");
                    fetchWorkHistory();
                }
            } catch (err) {
                showError("Failed to delete");
            }
        }
    };

    return (
        <div className="p-2 md:p-8 bg-[#F8FAFC] min-h-screen font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                {/* TOP HEADER CARD */}
                <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
                        <div className="h-14 w-14 md:h-16 md:w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0860C4] shadow-inner">
                            <FaFileSignature size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 ">Academic Assignments</h1>
                            <p className="text-gray-400 text-[10px] md:text-xs font-bold tracking-widest mt-1 flex items-center justify-center md:justify-start gap-2">
                                <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Manage student coursework
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-[#0860C4] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 group"
                    >
                        <FaPlus className="group-hover:rotate-90 transition-transform" /> Assign New Work
                    </button>
                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white max-w-full custom-scrollbar">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-[#0860C4] text-white">
                                <th className="px-3 py-3 border-r border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider w-12">No.</th>
                                <th className="px-4 py-3 border-r border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Class & Date</th>
                                <th className="px-4 py-3 border-r border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider">Work Details</th>
                                <th className="px-3 py-3 border-r border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider">File</th>
                                <th className="px-3 py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {workList.map((work, index) => (
                                <tr key={work.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 border border-slate-200 text-sm font-normal text-slate-600">{index + 1}</td>
                                    <td className="px-4 py-3 border border-slate-200 whitespace-nowrap">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-xs font-normal text-slate-700">
                                                {new Date(work.date).toLocaleDateString('en-GB')}
                                            </span>
                                            <span className="px-2 py-0.5 bg-blue-50 text-[#0860C4] text-[10px] font-bold rounded border border-blue-100">
                                                {getClassName(work.class_id)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border border-slate-200 text-left">
                                        <div className="max-w-xs mx-auto">
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{work.title}</p>
                                            <p className="text-[11px] text-slate-500 line-clamp-1">{work.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border border-slate-200">
                                        {work.file_path ? (
                                            <a
                                                href={`${imageBase}uploads/employee/${work.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#0860C4] hover:underline text-xs font-bold"
                                            >
                                                View {work.file_path.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'}
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 italic">No File</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 border border-slate-200">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(work)}
                                                className="p-1.5 rounded bg-blue-50 text-[#0860C4] hover:bg-blue-100 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(work.id)}
                                                className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {workList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center text-slate-400 font-bold text-sm">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden px-2 pb-24 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Assignments</h2>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{workList.length} Total</span>
                </div>
                
                {workList.length > 0 ? (
                    workList.map((work, index) => (
                        <div key={work.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-start gap-4">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-[#0860C4] font-bold text-xs shadow-inner">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{work.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                                            Class {getClassName(work.class_id)} • {new Date(work.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                {work.image && (
                                    <button 
                                        onClick={() => window.open(`${imageBase}uploads/homework/${work.image}`, "_blank")}
                                        className="h-8 w-8 bg-blue-50 text-[#0860C4] rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-all"
                                    >
                                        <FaEye size={14} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="px-4 py-3 bg-slate-50/30">
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">"{work.description || "No instructions provided."}"</p>
                            </div>

                            <div className="p-3 bg-white flex gap-2">
                                <button 
                                    onClick={() => openEditModal(work)}
                                    className="flex-1 py-2.5 bg-blue-50 text-[#0860C4] rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:bg-blue-100 transition-colors"
                                >
                                    <FaEdit size={12} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(work.id)}
                                    className="flex-1 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:bg-rose-100 transition-colors"
                                >
                                    <FaTrashAlt size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 mx-2">
                        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                            <FaFileSignature size={32} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Work Found</p>
                    </div>
                )}
            </div>

            {/* MODAL - ADD / EDIT */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>

                    <div className="bg-white rounded-[1.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20 flex flex-col max-h-[95vh]">
                        {/* Compact Header */}
                        <div className="px-5 py-4 bg-[#0860C4] text-white relative shrink-0">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-tight">{isEditing ? "Edit Assignment" : "Assign New Work"}</h3>
                                    <p className="text-blue-100 text-[10px] font-medium opacity-80">
                                        {isEditing ? "Update coursework details" : "Publish new tasks for students"}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
                                    <FaTimes size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Optimized Form Body */}
                        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <select
                                        required
                                        id="target-class"
                                        className="peer w-full p-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#0860C4] outline-none text-sm font-normal text-slate-700 transition-all appearance-none cursor-pointer"
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    >
                                        <option value="">Choose Class</option>
                                        {classList.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                    </select>
                                    <label htmlFor="target-class" className="absolute left-2 -top-2 px-1 bg-white text-[10px] font-bold text-slate-400 peer-focus:text-[#0860C4]">
                                        Class
                                    </label>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <FaBookOpen size={12} />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <input
                                        required
                                        id="assignment-date"
                                        type="date"
                                        className="peer w-full p-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#0860C4] outline-none text-sm font-normal text-slate-700 transition-all"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <label htmlFor="assignment-date" className="absolute left-2 -top-2 px-1 bg-white text-[10px] font-bold text-slate-400 peer-focus:text-[#0860C4]">
                                        Date
                                    </label>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    required
                                    id="assignment-title"
                                    type="text"
                                    placeholder=" "
                                    className="peer w-full p-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#0860C4] outline-none text-sm font-normal text-slate-700 transition-all"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <label htmlFor="assignment-title" className="absolute left-2 -top-2 px-1 bg-white text-[10px] font-bold text-slate-400 peer-focus:text-[#0860C4]">
                                    Title
                                </label>
                            </div>

                            <div className="relative">
                                <textarea
                                    id="description"
                                    rows="2"
                                    placeholder=" "
                                    className="peer w-full p-2.5 rounded-lg bg-white border border-slate-300 focus:border-[#0860C4] outline-none text-sm font-normal text-slate-700 transition-all resize-none leading-relaxed"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <label htmlFor="description" className="absolute left-2 -top-2 px-1 bg-white text-[10px] font-bold text-slate-400 peer-focus:text-[#0860C4]">
                                    Description
                                </label>
                            </div>

                            {/* Compact File Upload */}
                            <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm 
                                            ${file || filePreview ? 'bg-[#0860C4] text-white' : 'bg-white text-slate-300'}`}>
                                            {filePreview && !file?.name?.toLowerCase().endsWith('.pdf') ? (
                                                <img src={filePreview} className="h-full w-full rounded-lg object-cover" />
                                            ) : (
                                                <FaUpload size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-700 line-clamp-1">
                                                {file ? file.name : (filePreview ? "Current File" : "No file selected")}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Image or PDF (Max 5MB)</p>
                                        </div>
                                    </div>
                                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
                                    <label htmlFor="file-upload" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-[#0860C4] hover:bg-blue-50 cursor-pointer transition-all">
                                        {file || filePreview ? "Change" : "Browse"}
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold uppercase hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button disabled={loading} className="flex-[1.5] py-2.5 rounded-lg bg-[#0860C4] text-white text-[11px] font-bold uppercase hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    {loading ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>{isEditing ? "Update" : "Assign Now"}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkUpload;
