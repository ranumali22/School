import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";
import { FloatingSelect, FloatingInput } from "../../Component/common/FloatingInput";
/* Floating Input */

function GradeSystem() {
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [grades, setGrades] = useState([]);
    const [school_id, setschool_id] = useState("");
    const [edit_id, setedit_id] = useState("");
    const [ButtonAction, setButtonAction] = useState("");
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({
        gradeName: "",
        fromPercent: "",
        toPercent: "",
        remark: "",
        displayOrder: "",
        status: "Active"
    });

    useEffect(() => {
        let school_id = localStorage.getItem("school_id");
        setschool_id(school_id);
        getGrades(school_id);
    }, []);

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);

        setData({
            gradeName: "",
            fromPercent: "",
            toPercent: "",
            remark: "",
            displayOrder: "",
            status: "Active"
        });
        setErrors({});
    };

    const getGrades = (school_id) => {
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };
        fetch(localurl + "grade/" + school_id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                const { success, message, row } = JSON.parse(result);
                if (success) {
                    setGrades(
                        [...row].sort((a, b) => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setData({
            ...data,
            [name]: value
        });
    };
    const handleSubmit = (action) => {
        let newErrors = {};

        if (!data.gradeName?.trim()) newErrors.gradeName = "Required";
        if (data.fromPercent === undefined || data.fromPercent === null || data.fromPercent === "") newErrors.fromPercent = "Required";
        if (data.toPercent === undefined || data.toPercent === null || data.toPercent === "") newErrors.toPercent = "Required";
        if (!data.remark?.trim()) newErrors.remark = "Required";
        if (data.displayOrder === undefined || data.displayOrder === null || data.displayOrder === "") newErrors.displayOrder = "Required";
        if (!data.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                data.gradeName?.trim()
                    ? (data.fromPercent !== undefined && data.fromPercent !== null && data.fromPercent !== "")
                        ? (data.toPercent !== undefined && data.toPercent !== null && data.toPercent !== "")
                            ? data.remark?.trim()
                                ? (data.displayOrder !== undefined && data.displayOrder !== null && data.displayOrder !== "")
                                    ? data.status
                                        ? ""
                                        : "Status is required"
                                    : "Display Order is required"
                                : "Remark is required"
                            : "To Percentage is required"
                        : "From Percentage is required"
                    : "Grade Name is required"
            );
            return;
        }

        setErrors({});

        const payload = {
            grade_name: data.gradeName,
            from_percent: Number(data.fromPercent),
            to_percent: Number(data.toPercent),
            remark: data.remark,
            display_order: Number(data.displayOrder),
            school_id: school_id,
            status: data.status
        };

        // ✅ EDIT
        if (action === "edit") {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify(payload);

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            let url = localurl + "update_grade/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getGrades(school_id);

                        // ✅ RESET
                        setData({
                            gradeName: "",
                            fromPercent: "",
                            toPercent: "",
                            remark: "",
                            displayOrder: "",
                            status: "Active"
                        });

                        setButtonAction("");
                        setedit_id("");
                        setEditIndex(null);
                        setErrors({});
                        setShowForm(false);
                    } else {
                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("grade_name")) newErrors.gradeName = data.message;
                        if (msg.includes("from_percent")) newErrors.fromPercent = data.message;
                        if (msg.includes("to_percent")) newErrors.toPercent = data.message;
                        if (msg.includes("remark")) newErrors.remark = data.message;
                        if (msg.includes("display_order")) newErrors.displayOrder = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                        handleApiResponse(data);
                    }
                })
                .catch((data) => handleApiResponse(data));
        }
        // ✅ ADD
        else {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            fetch(localurl + "add_grade", {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(payload),
                redirect: "follow",
            })
                .then(res => res.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getGrades(school_id);

                        setData({
                            gradeName: "",
                            fromPercent: "",
                            toPercent: "",
                            remark: "",
                            displayOrder: "",
                            status: "Active"
                        });

                        setErrors({});

                        if (action === "exit") {
                            setShowForm(false);
                        }
                    } else {
                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("grade_name")) newErrors.gradeName = data.message;
                        if (msg.includes("from_percent")) newErrors.fromPercent = data.message;
                        if (msg.includes("to_percent")) newErrors.toPercent = data.message;
                        if (msg.includes("remark")) newErrors.remark = data.message;
                        if (msg.includes("display_order")) newErrors.displayOrder = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                        handleApiResponse(data);
                    }
                });
        }
    };

    const handleEdit = (item) => {
        setedit_id(item.id);
        setButtonAction("edit");

        setData({
            gradeName: item.grade_name,
            fromPercent: item.from_percent,
            toPercent: item.to_percent,
            remark: item.remark,
            displayOrder: item.display_order,
            status: item.status
        });

        setShowForm(true);
    };

    const toggleStatus = (id, currentStatus) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            status: currentStatus === "Active" ? "Inactive" : "Active"
        });

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(localurl + `status_grade/` + id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                const data = JSON.parse(result);
                handleApiResponse(data);
                getGrades(school_id);
            })
            .catch((data) => handleApiResponse(data));
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                    Grade System
                </h2>

                <button
                    onClick={() => {
                        setEditIndex(null);
                        setShowForm(true);
                    }}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Grade
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">#</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Grade ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">From % ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">To % ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Remark ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Display ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Status ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {grades.length > 0 ? (
                            grades.map((g, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{g.grade_name}</td>
                                    <td className="p-2">{g.from_percent}</td>
                                    <td className="p-2">{g.to_percent}</td>
                                    <td className="p-2">{g.remark}</td>
                                    <td className="p-2">{g.display_order}</td>
                                    <td className="p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${g.status === "Active"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        >
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="p-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(g)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(g.id, g.status)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 ${g.status === "Active"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full ${g.status === "Active"
                                                    ? "translate-x-6"
                                                    : ""
                                                    }`}
                                            />
                                        </button>
                                            {/* <button
                                        onClick={() => deleteGrade(g.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button> */}
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

            {/* Popup Form */}

            {showForm && (

                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

                    <div className="bg-white p-6 rounded-xl w-[600px]">

                        <h2 className="text-xl font-bold text-black mb-6">
                            {ButtonAction === "edit" ? "Update Grade" : "Add Grade"}
                        </h2>

                        <div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <FloatingInput
                                    label={<>Grade Name <span className="text-red-500">*</span></>}
                                    name="gradeName"
                                    value={data.gradeName}
                                    error={errors.gradeName}
                                    onChange={handleChange}
                                    required
                                />

                                <FloatingInput
                                    label={<>From % <span className="text-red-500">*</span></>}
                                    name="fromPercent"
                                    type="number"
                                    value={data.fromPercent}
                                    error={errors.fromPercent}
                                    onChange={handleChange}
                                    required
                                />

                                <FloatingInput
                                    label={<>To % <span className="text-red-500">*</span></>}
                                    name="toPercent"
                                    type="number"
                                    value={data.toPercent}
                                    error={errors.toPercent}
                                    onChange={handleChange}
                                    required
                                />



                                <FloatingInput
                                    label={<>Remark <span className="text-red-500">*</span></>}
                                    name="remark"
                                    value={data.remark}
                                    error={errors.remark}
                                    onChange={handleChange}
                                    required
                                />

                                <FloatingInput
                                    label={<>Display Order <span className="text-red-500">*</span></>}
                                    name="displayOrder"
                                    type="number"
                                    value={data.displayOrder}
                                    error={errors.displayOrder}
                                    onChange={handleChange}
                                    required
                                />

                                <FloatingSelect
                                   label=" Status"
                                    name="status"
                                    value={data.status}
                                    onChange={handleChange}
                                    options={["Active", "Inactive"]}
                                    error={errors.status}
                                />
                            </div>

                            <div className="col-span-2 flex gap-3 mt-4">
                                {ButtonAction === "" ? (
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
                                        value="edit"
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
}

export default GradeSystem;