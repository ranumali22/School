import React, { useState, useEffect } from "react";
import {
    FloatingInput,
    FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

/* ---------- Main Component ---------- */

const Subject = () => {
    const [school_id, setschool_id] = useState("");
    const [ButtonAction, setButtonAction] = useState("");
    const [edit_id, setedit_id] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [subjectData, setSubjectData] = useState({
        subject_name: "",
        subject_short_name: "",
        subject_code: "",
        display_order: "",
        status: "Active",
    });

    const [editIndex, setEditIndex] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setSubjectData({
            ...subjectData,
            [name]: value,
        });
    };
    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);

        setSubjectData({
            subject_name: "",
            subject_short_name: "",
            subject_code: "",
            display_order: "",

            status: "Active",
        });

        setErrors({});
    };

    const handleSubmit = (e) => {
        const action = e;

        // ✅ FRONTEND VALIDATION
        let newErrors = {};

        if (!subjectData.subject_name) newErrors.subject_name = "Required";
        if (!subjectData.subject_short_name)
            newErrors.subject_short_name = "Required";
        if (!subjectData.subject_code) newErrors.subject_code = "Required";
        if (!subjectData.display_order) newErrors.display_order = "Required";
        if (!subjectData.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                subjectData.subject_name
                    ? subjectData.subject_short_name
                        ? subjectData.subject_code
                            ? subjectData.display_order

                                ? ""

                            : "Display Order is required"
                        : "Subject Code is required"
                    : "Subject Short Name is required"
                    : "Subject Name is required"
            );
            return;
        }

        const payload = {
            school_id: school_id,
            subject_name: subjectData.subject_name,
            subject_short_name: subjectData.subject_short_name,
            subject_code: subjectData.subject_code,
            display_order: Number(subjectData.display_order),
            status: subjectData.status,
        };

        // ================= EDIT =================
        if (e == "edit") {
            const requestOptions = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                redirect: "follow",
            };

            let url = localurl + "update_subject/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getsubject(school_id);

                        // ✅ RESET
                        setSubjectData({
                            subject_name: "",
                            subject_short_name: "",
                            subject_code: "",
                            display_order: "",
                            status: "Active",
                        });

                        setButtonAction("");
                        setedit_id("");
                        setEditIndex(null);
                        setErrors({});
                        setShowForm(false);
                    } else {
                        handleApiResponse(data);

                        // ✅ backend error mapping
                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("subject_name"))
                            newErrors.subject_name = data.message;
                        if (msg.includes("subject_short_name"))
                            newErrors.subject_short_name = data.message;
                        if (msg.includes("subject_code"))
                            newErrors.subject_code = data.message;
                        if (msg.includes("display_order"))
                            newErrors.display_order = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                    }
                })
                .catch((data) => handleApiResponse(data));
        }

        // ================= ADD =================
        else {
            try {
                const requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    redirect: "follow",
                };

                fetch(localurl + "add_subject", requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const data = JSON.parse(result);

                        if (data.success) {
                            handleApiResponse(data);
                            getsubject(school_id);

                            setSubjectData({
                                subject_name: "",
                                subject_short_name: "",
                                subject_code: "",
                                display_order: "",
                                status: "Active",
                            });

                            setErrors({});

                            if (action === "exit") {
                                setShowForm(false);
                            }
                        } else {
                            handleApiResponse(data);

                            const msg = data.message?.toLowerCase();
                            let newErrors = {};

                            if (msg.includes("subject_name"))
                                newErrors.subject_name = data.message;
                            if (msg.includes("subject_short_name"))
                                newErrors.subject_short_name = data.message;
                            if (msg.includes("subject_code"))
                                newErrors.subject_code = data.message;
                            if (msg.includes("display_order"))
                                newErrors.display_order = data.message;
                            if (msg.includes("status")) newErrors.status = data.message;

                            setErrors(newErrors);
                        }
                    })
                    .catch((data) => handleApiResponse(data));
            } catch (err) {
                console.error("Submit error:", err);
            }
        }
    };

    const getsubject = (school_id) => {
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        fetch(localurl + "subject/" + school_id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                const { success, message, row } = JSON.parse(result);
                if (success) {
                    // setSubjects(row);
                    setSubjects(row.sort((a, b) => {
                        const diff = (a.display_order || 0) - (b.display_order || 0);
                        if (diff === 0) {
                            const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                            const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                            return String(nameA).localeCompare(String(nameB));
                        }
                        return diff;
                    })
                    );

                }
            })
            .catch((data) => handleApiResponse(data));
    };

    const handleEdit = (index, id) => {
        const item = subjects[index];

        setedit_id(id);

        setButtonAction("edit");

        setSubjectData({
            subject_name: item.subject_name,
            subject_short_name: item.subject_short_name,
            subject_code: item.subject_code,
            display_order: item.display_order,
            status: item.status === "Active" ? "Active" : "Inactive",
        });

        setEditIndex(index);
        setShowForm(true);
    };

    const [subjects, setSubjects] = useState(() => {
        const savedSubjects = localStorage.getItem("subjects");
        return savedSubjects ? JSON.parse(savedSubjects) : [];
    });


    const toggleStatus = async (index) => {
        try {
            const item = subjects[index];

            const newStatus = item.status === "Active" ? "Inactive" : "Active";

            const res = await fetch(localurl + "status_subject/" + item.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            const data = await res.json();

            if (data.success) {
                getsubject(school_id);
                handleApiResponse(data)
            }
        } catch (data) {
            handleApiResponse(data);
        }
    };



    useEffect(() => {
        let school_id = localStorage.getItem("school_id");
        getsubject(school_id);
        setschool_id(school_id);
    }, []);

    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedData = [...subjects].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;

            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;

            return 0;
        });

        setSubjects(sortedData);
    };
    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            {/* Header */}

            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Subject Master</h2>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Subject
                </button>
            </div>

            {/* Table */}

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-center text-white">
                            <th className="p-2">#</th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("subject_name")}
                            >
                                Subject Name ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("subject_short_name")}
                            >
                                Short Name ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("subject_code")}
                            >
                                Subject Code ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("display_order")}
                            >
                                Display Order ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("status")}
                            >
                                Status ⬍
                            </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {subjects.length > 0 ? (
                            subjects.map((s, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{s.subject_name}</td>
                                    <td className="p-2">{s.subject_short_name}</td>
                                    <td className="p-2">{s.subject_code}</td>
                                    <td className="p-2">{s.display_order}</td>

                                    <td className="p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${s.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            {s.status}
                                        </span>
                                    </td>

                                    <td className="p-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(index, s.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => toggleStatus(index)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${s.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full transition 
                          ${s.status === "Active" ? "translate-x-6" : ""}`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white rounded-xl w-[600px] p-6">
                        <h2 className="text-xl font-bold text-black mb-6">
                            {ButtonAction === "edit" ? "Update Subject" : "Add Subject"}
                        </h2>

                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput
                                    label={<>Subject Name <span className="text-red-500">*</span></>}
                                    name="subject_name"
                                    value={subjectData.subject_name}
                                    onChange={handleChange}
                                    error={errors.subject_name}
                                    required
                                />
                                <FloatingInput
                                    label={<>Subject Short Name <span className="text-red-500">*</span></>}
                                    name="subject_short_name"
                                    value={subjectData.subject_short_name}
                                    onChange={handleChange}
                                    error={errors.subject_short_name}
                                    required
                                />

                                <FloatingInput
                                    label={<>Subject Code <span className="text-red-500">*</span></>}
                                    name="subject_code"
                                    value={subjectData.subject_code}
                                    onChange={handleChange}
                                    error={errors.subject_code}
                                    required
                                />

                                <FloatingInput
                                    label={<>Display Order <span className="text-red-500">*</span></>}
                                    type="number"
                                    name="display_order"
                                    value={subjectData.display_order}
                                    onChange={handleChange}
                                    error={errors.display_order}
                                    required
                                />

                                <FloatingSelect
                                    label=" Status"
                                     name="status"
                                    value={subjectData.status}
                                    onChange={handleChange}
                                    error={errors.status}
                                    options={["Active", "Inactive"]}
                                />
                            </div>
                            <div className="col-span-2 flex gap-3 mt-4">
                                {ButtonAction == "" ? (
                                    <>
                                        <button
                                            value="continue"
                                            className="bg-green-600 text-white px-4 py-2 rounded"
                                            onClick={() => {
                                                handleSubmit("continue");
                                            }}
                                        >
                                            Save & Continue
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleSubmit("exit");
                                            }}
                                            value="exit"
                                            className="bg-purple-600 text-white px-4 py-2 rounded"
                                        >
                                            Save & Exit
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            handleSubmit("edit");
                                        }}
                                        value="exit"
                                        className="bg-purple-600 text-white px-4 py-2 rounded"
                                    >
                                        Update
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(false);
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subject;