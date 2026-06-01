import React, { useEffect, useState } from "react";
import { get_school, update_school, delete_school } from "../../Api";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { FloatingInput, FloatingInputs, FloatingTextarea } from "../../Component/common/FloatingInput"
import { CommonInput } from "../../Component/common/CommonInput";
import imageCompression from "browser-image-compression";
import { handleApiResponse } from "../../Component/common/alert";

const SchoolList = () => {
    const [schools, setSchools] = useState([]);
    const [search, setSearch] = useState("");
    const [view, setView] = useState({});
    const [editData, setEditData] = useState(null);
    const imageBase = `${import.meta.env.VITE_SERVER_URL}/uploads/`;

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return "/default-school.png";
        if (logoPath.startsWith("data:")) return logoPath; // Base64
        if (logoPath.startsWith("blob:")) return logoPath; // Preview
        return `${imageBase}${logoPath}`;
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        const res = await get_school();
        console.log("API DATA:", res.data)
        setSchools(res.data.row || []);
    };

    // 🔍 SEARCH
    const filtered = schools.filter((item) => {
        const text = search.toLowerCase();
        return (
            item.school_name?.toLowerCase().includes(text) ||
            item.registration_no?.toLowerCase().includes(text) ||
            item.affiliation_no?.toLowerCase().includes(text)
        );
    });

    // 📄 PAGINATION
    const {
        currentPage,
        totalPages,
        currentData,
        setCurrentPage,
        itemsPerPage,
        changeItemsPerPage,
    } = usePagination(filtered);

    // 👁 VIEW
    const toggleView = (id) => {
        setView((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // 🔄 ACTIVE / INACTIVE
    const toggleActive = async (item) => {
        try {
            const newStatus =
                item.delete_status === "show" ? "delete" : "show";

            await delete_school(item.id, {
                delete_status: newStatus,
            });

            // UI update
            setSchools((prev) =>
                prev.map((s) =>
                    s.id === item.id ? { ...s, delete_status: newStatus } : s
                )
            );
        } catch (err) {
            console.log("TOGGLE ERROR:", err);
        }
    };


    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            
            // Define exactly which fields we want to update
            const allowedFields = [
                'school_name', 'registration_no', 'affiliation_no', 'affiliated',
                'phone', 'mobile_no', 'helpLine_no', 'email', 'established_from',
                'username', 'password', 'address', 'school_prefix', 'delete_status'
            ];

            allowedFields.forEach(key => {
                if (editData[key] !== undefined && editData[key] !== null) {
                    formData.append(key, editData[key]);
                }
            });

            // Append the actual file if it exists
            if (editData.logoFile) {
                formData.append("upload_logo", editData.logoFile);
                formData.append("upload_type", "school_logo");
            }

            const res = await update_school(editData.id, formData);
            handleApiResponse(res.data);

            if (res.data.success) {
                fetchSchools(); 
                setEditData(null);
            }
        } catch (err) {
            console.log("UPDATE ERROR:", err.response?.data || err.message);
        }
    };

    const handleLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create a local preview URL
        const previewUrl = URL.createObjectURL(file);
        
        setEditData({
            ...editData,
            logoFile: file,           // 👈 Store the raw file
            logoPreview: previewUrl,   // 👈 Store preview for UI
        });
    };

    return (
        <section className="bg-white rounded-t-2xl p-4">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">

                <h1 className="text-2xl font-bold">Schools</h1>

                <div className="flex items-center border px-3 py-2 gap-2 w-[300px] rounded-2xl">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search School"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="outline-none w-full"
                    />
                </div>

            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full border">

                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >#</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >logo</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >School Id</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >School</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Reg No</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Affiliation</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Phone</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >View</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Status</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Edit</th>

                        </tr>
                    </thead>

                    <tbody>
                        {currentData.map((item, index) => (
                            console.log("ROW DATA:", item),
                            <tr key={item.id} className="bg-white border-t hover:bg-gray-100">

                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap">{item.upload_logo && (
                                    <img
                                        src={getLogoUrl(item.upload_logo)}
                                        className="h-10 w-10 rounded-full border shadow"
                                    />
                                )}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.school_prefix}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.school_name}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.registration_no}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.affiliation_no}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.phone}</td>

                                {/* 👁 VIEW */}
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                    <FaEye
                                        className="cursor-pointer"
                                        onClick={() => toggleView(item.id)}
                                    />

                                    {view[item.id] && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

                                            <div className="bg-white w-[90%] max-w-[900px] rounded-xl shadow-lg overflow-y-auto max-h-[90vh] p-6">

                                                {/* HEADER */}
                                                <div className="flex justify-between items-center mb-6">

                                                    <div className="flex items-center gap-4">
                                                        {item.upload_logo && (
                                                            <img
                                                                src={getLogoUrl(item.upload_logo)}
                                                                className="h-20 w-20 rounded-full border shadow"
                                                            />
                                                        )}
                                                        <h2 className="text-2xl font-bold">
                                                            {item.school_name}
                                                        </h2>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => toggleView(item.id)}
                                                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                        >
                                                            Close
                                                        </button>


                                                    </div>
                                                </div>

                                                {/* BASIC INFO */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm">

                                                    <div>
                                                        <p className="font-semibold">School Name</p>
                                                        <p>{item.school_name}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Registration No</p>
                                                        <p>{item.registration_no}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Affiliation No</p>
                                                        <p>{item.affiliation_no}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Affiliated</p>
                                                        <p>{item.affiliated}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Phone</p>
                                                        <p>{item.phone}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Mobile</p>
                                                        <p>{item.mobile_no}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Helpline No</p>
                                                        <p>{item.helpLine_no}</p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">Email</p>
                                                        <p>{item.email || "-"}</p>
                                                    </div>

                                                </div>

                                                {/* ADDRESS SECTION */}
                                                <div className="mt-6">
                                                    <h3 className="font-bold border-b-2 border-[#0860C4] pb-1 mb-3">
                                                        Address
                                                    </h3>

                                                    <p className="text-sm">{item.address}</p>
                                                </div>

                                                {/* SCHOOL DETAILS */}
                                                <div className="mt-6">
                                                    <h3 className="font-bold border-b-2 border-[#0860C4] pb-1 mb-3">
                                                        School Details
                                                    </h3>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">

                                                        <div>
                                                            <p className="font-semibold">School Prefix</p>
                                                            <p>{item.school_prefix}</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">Established</p>
                                                            <p>{item.established_from}</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">Status</p>
                                                            <p>
                                                                {item.delete_status === "show" ? "Active" : "Inactive"}
                                                            </p>
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* LOGIN INFO */}
                                                <div className="mt-6">
                                                    <h3 className="font-bold border-b-2 border-[#0860C4] pb-1 mb-3">
                                                        Login Information
                                                    </h3>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">

                                                        <div>
                                                            <p className="font-semibold">Username</p>
                                                            <p className="normal-case">{item.username}</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">Password</p>
                                                            <p className="normal-case">{item.password}</p>
                                                        </div>

                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </td>

                                {/* 🔥 TOGGLE */}
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleActive(item)}
                                        className={`w-10 h-5 flex items-center rounded-full  transition-all duration-300 
                                    ${item.delete_status === "show" ? "bg-green-500 " : "bg-red-500 p-1"}`}
                                    >
                                        <div
                                            className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300
                                        ${item.delete_status === "show" ? "translate-x-6" : "translate-x-0"}`}
                                        />
                                    </button>
                                </td>

                                {/* EDIT */}
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">

                                    <RiEdit2Fill
                                        className="cursor-pointer text-[1.3rem] text-green-600"
                                        onClick={() => setEditData(item)}
                                    />

                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            {editData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">

                    <div className="bg-white p-6 rounded-xl w-[700px] max-h-[90vh] overflow-y-auto">

                        <h2 className="text-xl font-bold mb-4">Edit School</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* SCHOOL PREFIX */}
                            <FloatingInput
                                label="School Prefix"
                                value={editData.school_prefix || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, school_prefix: e.target.value })
                                }

                            />

                            {/* SCHOOL NAME */}
                            <FloatingInput
                                label="School Name"
                                value={editData.school_name || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, school_name: e.target.value })
                                }

                            />

                            {/* REGISTRATION NO */}
                            <FloatingInput
                                label="Registration No"
                                value={editData.registration_no || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, registration_no: e.target.value })
                                }

                            />

                            {/* AFFILIATION NO */}
                            <FloatingInput
                                label="Affiliation No"
                                value={editData.affiliation_no || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, affiliation_no: e.target.value })
                                }

                            />

                            {/* AFFILIATED */}
                            <FloatingInput
                                label="Affiliated (CBSE etc)"
                                value={editData.affiliated || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, affiliated: e.target.value })
                                }

                            />

                            {/* PHONE */}
                            <CommonInput
                                label="Phone"
                                name="phone"
                                value={editData.phone || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, phone: e.target.value })
                                }

                            />

                            {/* MOBILE */}
                            <CommonInput
                                label="Mobile No"
                                name="mobile_no"
                                value={editData.mobile_no || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, mobile_no: e.target.value })
                                }

                            />

                            {/* HELPLINE */}
                            <CommonInput
                                label="Helpline No"
                                name="helpLine_no"
                                value={editData.helpLine_no || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, helpLine_no: e.target.value })
                                }

                            />

                            {/* EMAIL */}
                            <CommonInput
                                label="Email"
                                name="email"
                                value={editData.email || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, email: e.target.value })
                                }

                            />

                            {/* ESTABLISHED */}
                            <FloatingInputs
                                label="date"
                                type="date"
                                value={editData.established_from || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, established_from: e.target.value })
                                }

                            />

                            {/* USERNAME */}
                            <FloatingInput
                                label="Username"
                                value={editData.username || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, username: e.target.value })
                                }

                            />

                            {/* PASSWORD */}
                            <FloatingInput
                                label="Password"
                                value={editData.password || ""}
                                onChange={(e) =>
                                    setEditData({ ...editData, password: e.target.value })
                                }
                            // className="mb-4"
                            />

                        </div>

                        {/* ADDRESS */}
                        <FloatingTextarea
                            label="Address"
                            value={editData.address || ""}
                            onChange={(e) =>
                                setEditData({ ...editData, address: e.target.value })
                            }
                            className="mb-6 mt-3"
                        />

                        {/* LOGO */}

                        <FloatingInputs type="file" label="Upload Logo" onChange={handleLogo} />
                        {(editData.logoPreview || editData.upload_logo) && (
                            <img src={getLogoUrl(editData.logoPreview || editData.upload_logo)} className="h-20 mt-2" />
                        )}



                        {/* BUTTONS */}
                        <div className="flex gap-3 mt-6">

                            <button
                                onClick={handleUpdate}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Update
                            </button>

                            <button
                                onClick={() => setEditData(null)}
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                        </div>

                    </div>
                </div>
            )}
            {/* PAGINATION */}
            <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={changeItemsPerPage}
            />

        </section>
    );
};

export default SchoolList;