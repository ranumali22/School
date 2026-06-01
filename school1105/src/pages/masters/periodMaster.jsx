import React, { useState, useEffect } from "react";
import {
    FloatingInput,
    FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

const PeriodMaster = () => {
    const [showForm, setShowForm] = useState(false);
    const [periods, setPeriods] = useState([]);
    const [school_id, setschool_id] = useState("");
    const [edit_id, setedit_id] = useState("");
    const [ButtonAction, setButtonAction] = useState("");
    const [errors, setErrors] = useState({});

    const [periodData, setPeriodData] = useState({
        periodName: "",
        displayOrder: "",
        start_time: "",
        end_time: "",
        status: "Active",
    });

    useEffect(() => {
        let school_id = localStorage.getItem("school_id");
        setschool_id(school_id);
        getPeriod(school_id);
    }, []);

    // INPUT
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPeriodData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    // GET DATA
    const getPeriod = (school_id) => {
        fetch(localurl + "period/" + school_id)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setPeriods(
                        data.row.sort((a, b) => {
                            const diff = (a.display_order || 0) - (b.display_order || 0);
                            if (diff === 0) {
                                const nameA = (a.period || "") + (a.section ? " " + a.section : "");
                                const nameB = (b.period || "") + (b.section ? " " + b.section : "");
                                return String(nameA).localeCompare(String(nameB));
                            }
                            return diff;
                        })
                    );
                } else {
                    setPeriods([]);
                }
            })
            .catch((err) => {
                console.error(err);
                setPeriods([]);
            });
    };

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setPeriodData({
            periodName: "",
            displayOrder: "",
            start_time: "",
            end_time: "",
            status: "Active",
        });
        setErrors({});
    };

    // SUBMIT
    const handleSubmit = (action) => {
        let newErrors = {};

        if (!periodData.periodName?.trim()) newErrors.periodName = "Required";
        if (periodData.displayOrder === undefined || periodData.displayOrder === null || periodData.displayOrder === "") newErrors.displayOrder = "Required";
        if (!periodData.start_time) newErrors.start_time = "Required";
        if (!periodData.end_time) newErrors.end_time = "Required";
        if (!periodData.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                periodData.periodName?.trim()
                    ? (periodData.displayOrder !== undefined && periodData.displayOrder !== null && periodData.displayOrder !== "")
                        ? periodData.start_time
                            ? periodData.end_time
                                ? periodData.status
                                    ? ""
                                    : "Status is required"
                                : "End Time is required"
                            : "Start Time is required"
                        : "Display Order is required"
                    : "Period Name is required"
            );
            return;
        }

        setErrors({});

        const payload = {
            school_id: school_id,
            period: periodData.periodName,
            display_order: Number(periodData.displayOrder),
            start_time: periodData.start_time,
            end_time: periodData.end_time,
            status: periodData.status,
        };

        const url =
            action === "edit"
                ? localurl + "update_period/" + edit_id
                : localurl + "add_period";

        const method = action === "edit" ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                handleApiResponse(data);

                if (data.success) {
                    getPeriod(school_id);

                    setPeriodData({
                        periodName: "",
                        displayOrder: "",
                        start_time: "",
                        end_time: "",
                        status: "Active",
                    });

                    if (action === "exit" || action === "edit") {
                        setShowForm(false);
                    }
                }
            })
            .catch((err) => console.error(err));
    };


    const toggleStatus = async (index) => {
        try {
            const item = periods[index];

            const newStatus = item.status === "Active" ? "Inactive" : "Active";

            const res = await fetch(localurl + "status_period/" + item.id, {
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
                getPeriod(school_id);
                handleApiResponse(data)
            }
        } catch (data) {
            handleApiResponse(data);
        }
    };

    // EDIT
    const handleEdit = (index, id) => {
        const item = periods[index];

        setedit_id(id);
        setButtonAction("edit");

        setPeriodData({
            periodName: item.period,
            displayOrder: item.display_order,
            start_time: item.start_time || "",
            end_time: item.end_time || "",
            status: item.status === "Active" ? "Active" : "Inactive",
        });

        setShowForm(true);
    };

    // DELETE
    const handleDelete = async (index, id) => {
        if (window.confirm("Are you sure you want to delete this period?")) {
            try {
                const res = await fetch(localurl + "delete_period/" + id, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        delete_status: "deleted",
                    }),
                });

                const data = await res.json();

                if (data.success) {
                    getPeriod(school_id);
                    handleApiResponse(data);
                }
            } catch (err) {
                handleApiResponse({ success: false, message: "Error deleting period" });
            }
        }
    };

    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc"
    });

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedData = [...periods].sort((a, b) => {
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

        setPeriods(sortedData);
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Period Master</h2>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Period
                </button>
            </div>

            {/* TABLE */}
            <div className="mt-6 w-full overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th onClick={() => handleSort("sNo")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                # ⬍</th>
                            <th onClick={() => handleSort("period")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                Period ⬍</th>
                            <th onClick={() => handleSort("start_time")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                Start Time ⬍</th>
                            <th onClick={() => handleSort("end_time")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                End Time ⬍</th>
                            <th onClick={() => handleSort("display_order")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                Display Order ⬍</th>
                            <th onClick={() => handleSort("status")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                Status ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {periods.length > 0 ? (
                            periods.map((p, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="py-2">{index + 1}</td>
                                    <td className="py-2">{p.period}</td>
                                    <td className="py-2">{p.start_time || "-"}</td>
                                    <td className="py-2">{p.end_time || "-"}</td>
                                    <td className="py-2">{p.display_order}</td>

                                    <td className="py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${p.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            {p.status}
                                        </span>
                                    </td>

                                    <td className="flex gap-2 justify-center py-2">
                                        <button
                                            onClick={() => handleEdit(index, p.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => toggleStatus(index)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${p.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full transition 
                          ${p.status === "Active" ? "translate-x-6" : ""}`}
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

            {/* MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl w-[500px] p-6">
                        <h2 className="text-xl font-bold text-black mb-6">
                            {ButtonAction === "edit" ? "Update Period" : "Add Period"}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput
                                label={<>Period Name <span className="text-red-500">*</span></>}
                                required
                                name="periodName"
                                value={periodData.periodName}
                                onChange={handleChange}
                                error={errors.periodName}
                            />

                            <FloatingInput
                                type="number"
                                required
                                label={<>Display Order <span className="text-red-500">*</span></>}
                                name="displayOrder"
                                value={periodData.displayOrder}
                                onChange={handleChange}
                                error={errors.displayOrder}
                            />

                            <FloatingInput
                                type="time"
                                required
                                label={<>Start Time <span className="text-red-500">*</span></>}
                                name="start_time"
                                value={periodData.start_time}
                                onChange={handleChange}
                                error={errors.start_time}
                            />

                            <FloatingInput
                                type="time"
                                required
                                label={<>End Time <span className="text-red-500">*</span></>}
                                name="end_time"
                                value={periodData.end_time}
                                onChange={handleChange}
                                error={errors.end_time}
                            />

                            <FloatingSelect
                                label="Status"
                                name="status"
                                value={periodData.status}
                                onChange={handleChange}
                                options={["Active", "Inactive"]}
                                error={errors.status}
                            />

                            <div className="col-span-2 flex gap-3 mt-4">
                                {ButtonAction === "" ? (
                                    <>
                                        <button
                                            onClick={() => handleSubmit("continue")}
                                            className="bg-green-600 text-white px-4 py-2 rounded"
                                        >
                                            Save & Continue
                                        </button>

                                        <button
                                            onClick={() => handleSubmit("exit")}
                                            className="bg-purple-600 text-white px-4 py-2 rounded"
                                        >
                                            Save & Exit
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleSubmit("edit")}
                                        className="bg-purple-600 text-white px-4 py-2 rounded"
                                    >
                                        Update
                                    </button>
                                )}

                                <button
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

export default PeriodMaster;
