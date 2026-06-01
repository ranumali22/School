import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

const MainExam = () => {
    const [showForm, setShowForm] = useState(false);
    const [examData, setExamData] = useState({
        exam_name: "",
        exam_date: "",
        examType: "Main Exam",
        display_order: "",
        status: "Active",
    });

    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedData = [...test].sort((a, b) => {
            if (key === "createdOn") {
                const parseDate = (d) => {
                    const [day, month, year] = d.split("/");
                    return new Date(`${year}-${month}-${day}`);
                };

                return direction === "asc"
                    ? parseDate(a[key]) - parseDate(b[key])
                    : parseDate(b[key]) - parseDate(a[key]);
            }

            const aVal = a[key] ?? "";
            const bVal = b[key] ?? "";

            if (typeof aVal === "string") {
                return direction === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return direction === "asc"
                ? Number(aVal) - Number(bVal)
                : Number(bVal) - Number(aVal);
        });

        setTest(sortedData);
    };

    const [editIndex, setEditIndex] = useState(null);
    const [test, setTest] = useState([]);
    const [school_id, setschool_id] = useState("");
    const [edit_id, setedit_id] = useState("");
    const [errors, setErrors] = useState({});
    const [ButtonAction, setButtonAction] = useState("");
    const [session_id, setsession_id] = useState("");

    useEffect(() => {
        const school_id = localStorage.getItem("school_id");
        const session_id = localStorage.getItem("session_id");

        if (school_id && session_id) {
            setschool_id(school_id);
            setsession_id(session_id);
            getMainExam(school_id, session_id);
        }
    }, []);

    const getMainExam = (school_id, session_id) => {
        fetch(localurl + "main_exam/" + school_id + "/" + session_id)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTest(data.row.sort((a, b) => {
                        const diff = (a.display_order || 0) - (b.display_order || 0);
                        if (diff === 0) {
                            const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                            const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                            return String(nameA).localeCompare(String(nameB));
                        }
                        return diff;
                    }));
                }
            })
            .catch(handleApiResponse);
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.split("-").reverse().join("-");
    };

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);

        setExamData({
            exam_name: "",
            exam_date: "",
            exam_type: "Main Exam",
            display_order: "",
            status: "Active",
        });

        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setExamData({
            ...examData,
            [name]: name === "display_order" ? Number(value) : value
        });
    };

    const handleSubmit = async (action) => {
        let newErrors = {};

        if (!examData.exam_name?.trim()) newErrors.exam_name = "Required";
        if (!examData.exam_date) newErrors.exam_date = "Required";
        if (examData.display_order === undefined || examData.display_order === null || examData.display_order === "") newErrors.display_order = "Required";
        if (!examData.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                examData.exam_name?.trim()
                    ? examData.exam_date
                        ? (examData.display_order !== undefined && examData.display_order !== null && examData.display_order !== "")
                            ? examData.status
                                ? ""
                                : "Status is required"
                            : "Display Order is required"
                        : "Exam Date is required"
                    : "Exam Name is required"
            );
            return;
        }

        setErrors({});

        const payload = {
            school_id: school_id,
            exam_name: examData.exam_name,
            exam_date: examData.exam_date,
            display_order: Number(examData.display_order),
            session_id: session_id,
            status: examData.status
        };

        if (action === "edit") {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: JSON.stringify(payload),
                redirect: "follow",
            };

            let url = localurl + "update_main_exam/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getMainExam(school_id, session_id);
                        // ✅ RESET
                        setExamData({
                            exam_name: "",
                            exam_date: "",
                            exam_type: "Main Exam",
                            display_order: "",
                            status: "Active"
                        });

                        setButtonAction("");
                        setedit_id("");
                        setEditIndex(null);
                        setErrors({});
                        setShowForm(false);
                    } else {
                        handleApiResponse(data);

                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("exam_name")) newErrors.exam_name = data.message;
                        if (msg.includes("exam_date")) newErrors.exam_date = data.message;
                        if (msg.includes("display_order")) newErrors.display_order = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                    }
                })
                .catch((data) => handleApiResponse(data));
        }
        // ================= ADD =================
        else {
            try {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: JSON.stringify(payload),
                    redirect: "follow",
                };

                fetch(localurl + "add_main_exam", requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const data = JSON.parse(result);

                        if (data.success) {
                            handleApiResponse(data);
                            getMainExam(school_id, session_id);
                            setExamData({
                                exam_name: "",
                                exam_date: "",
                                exam_type: "Main Exam",
                                display_order: "",
                                status: "Active"
                            });

                            setErrors({});

                            if (action === "exit") {
                                setShowForm(false);
                            }
                        } else {
                            handleApiResponse(data);

                            const msg = data.message?.toLowerCase();
                            let newErrors = {};

                            if (msg.includes("exam_name")) newErrors.exam_name = data.message;
                            if (msg.includes("exam_date")) newErrors.exam_date = data.message;
                            if (msg.includes("display_order")) newErrors.display_order = data.message;
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

    const handleEdit = (index, id) => {
        const item = test[index];

        setedit_id(id);
        setButtonAction("edit");
        setExamData({
            exam_name: item.exam_name,
            exam_date: item.exam_date,
            exam_type: item.exam_type || "Main Exam",
            display_order: item.display_order,
            status: item.status === "Active" ? "Active" : "Inactive"
        });

        setEditIndex(index);
        setShowForm(true);
    };

    const toggleStatus = (id, currentStatus) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        fetch(localurl + "status_main_exam/" + id, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify({
                status: currentStatus === "Active" ? "Inactive" : "Active"
            })
        })
            .then(res => res.text())
            .then((result) => {
                console.log(result);
                const data = JSON.parse(result);
                handleApiResponse(data);
                getMainExam(school_id, session_id);
            })
            .catch((data) => handleApiResponse(data));
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            {/* Header */}
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                    Main Exam
                </h2>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Exam
                </button>
            </div>

            {/* Table */}
            <div className="mt-6 w-full overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-center text-white">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer" onClick={() => handleSort("sNo")}># ⬍</th>
                            <th onClick={() => handleSort("exam_name")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Exam Name ⬍</th>
                            <th onClick={() => handleSort("exam_type")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Exam Type ⬍</th>
                            <th onClick={() => handleSort("exam_date")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Exam Date ⬍</th>
                            <th onClick={() => handleSort("display_order")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Display ⬍</th>
                            <th onClick={() => handleSort("status")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Status ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {test.length > 0 ? (
                            test.map((e, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2 ">{e.exam_name}</td>
                                    <td className="p-2">{e.exam_type}</td>
                                    <td className="p-2">{formatDate(e.exam_date)}</td>
                                    <td className="p-2">{e.display_order}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${e.status === "Active"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        >
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="flex gap-2 justify-center px-2 md:px-4 py-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(index, e.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(e.id, e.status)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 ${e.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full transition ${e.status === "Active" ? "translate-x-6" : ""}`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl w-[600px] p-6">
                        <h2 className="text-xl font-bold text-black mb-6">
                            {ButtonAction === "edit" ? "Update Main Exam" : "Add Main Exam"}
                        </h2>

                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput
                                    label={<>Exam Name <span className="text-red-500">*</span></>}
                                    name="exam_name"
                                    type="text"
                                    value={examData.exam_name}
                                    onChange={handleChange}
                                    error={errors.exam_name}
                                    required
                                />

                                <FloatingInput
                                    label={<>Exam Date <span className="text-red-500">*</span></>}
                                    name="exam_date"
                                    type="date"
                                    value={examData.exam_date}
                                    onChange={handleChange}
                                    error={errors.exam_date}
                                    required
                                />

                                <FloatingInput
                                    label={<>Display Order <span className="text-red-500">*</span></>}
                                    name="display_order"
                                    type="number"
                                    value={examData.display_order}
                                    onChange={handleChange}
                                    error={errors.display_order}
                                    required
                                />

                                <FloatingSelect
                                    label="Status"
                                    name="status"
                                    value={examData.status}
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
};

export default MainExam;