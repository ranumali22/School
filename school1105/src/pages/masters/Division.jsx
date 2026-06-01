import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";
import { FloatingSelect, FloatingInput } from "../../Component/common/FloatingInput";

function DivisionSystem() {
    const [divisions, setDivisions] = useState([]);
    const [school_id, setschool_id] = useState("");
    const [edit_id, setedit_id] = useState("");
    const [ButtonAction, setButtonAction] = useState("");
    const [errors, setErrors] = useState({});

    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    const [data, setData] = useState({
        divisionName: "",
        fromPercent: "",
        toPercent: "",
        remark: "",
        displayOrder: "",
        status: "Active"
    });

    useEffect(() => {
        let school_id = localStorage.getItem("school_id");
        setschool_id(school_id);
        getDivisions(school_id);
    }, []);

    const getDivisions = (school_id) => {
        fetch(localurl + "division/" + school_id)
            .then(res => res.text())
            .then(result => {
                const data = JSON.parse(result);
                if (data.success) {
                    setDivisions(
                        [...data.row].sort(
                            (a, b) => Number(a.display_order) - Number(b.display_order)
                        )
                    );
                }
            });
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

        if (!data.divisionName?.trim()) newErrors.divisionName = "Required";
        if (data.fromPercent === undefined || data.fromPercent === null || data.fromPercent === "") newErrors.fromPercent = "Required";
        if (data.toPercent === undefined || data.toPercent === null || data.toPercent === "") newErrors.toPercent = "Required";
        if (!data.remark?.trim()) newErrors.remark = "Required";
        if (data.displayOrder === undefined || data.displayOrder === null || data.displayOrder === "") newErrors.displayOrder = "Required";
        if (!data.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                data.divisionName?.trim()
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
                    : "Division Name is required"
            );
            return;
        }

        setErrors({});

        const payload = {
            division: data.divisionName,
            from_percent: Number(data.fromPercent),
            to_percent: Number(data.toPercent),
            remark: data.remark,
            display_order: Number(data.displayOrder),
            school_id: school_id,
            status: data.status
        };

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        // ✅ EDIT
        if (action === "edit") {
            fetch(localurl + "update_division/" + edit_id, {
                method: "PUT",
                headers: myHeaders,
                body: JSON.stringify(payload),
            })
                .then(res => res.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getDivisions(school_id);

                        // ✅ RESET
                        setData({
                            divisionName: "",
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

                        if (msg.includes("grade_name") || msg.includes("division")) newErrors.divisionName = data.message;
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
            fetch(localurl + "add_division", {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(payload),
            })
                .then(res => res.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getDivisions(school_id);

                        // ✅ RESET
                        setData({
                            divisionName: "",
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

                        if (msg.includes("grade_name") || msg.includes("division")) newErrors.divisionName = data.message;
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
    };

    const handleEdit = (item) => {
        setedit_id(item.id);
        setButtonAction("edit");

        setData({
            divisionName: item.division,
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

        fetch(localurl + "status_division/" + id, {
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
                getDivisions(school_id);
            })
            .catch((data) => handleApiResponse(data));
    };

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);

        setData({
            divisionName: "",
            fromPercent: "",
            toPercent: "",
            remark: "",
            displayOrder: "",
            status: "Active"
        });
        setErrors({});
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                    Division System
                </h2>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Division
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">#</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Division ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">From % ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">To % ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Remark ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Display ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Status ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {divisions.length > 0 ? (
                            divisions.map((d, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{d.division}</td>
                                    <td className="p-2">{d.from_percent}</td>
                                    <td className="p-2">{d.to_percent}</td>
                                    <td className="p-2">{d.remark}</td>
                                    <td className="p-2">{d.display_order}</td>
                                    <td className="p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${d.status === "Active"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="p-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(d)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(d.id, d.status)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 ${d.status === "Active"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full ${d.status === "Active"
                                                    ? "translate-x-6"
                                                    : ""
                                                    }`}
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

            {/* Popup Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-[600px]">
                        <h2 className="text-xl font-bold text-black mb-6">
                            {ButtonAction === "edit" ? "Update Division" : "Add Division"}
                        </h2>

                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput
                                    label={<>Division Name <span className="text-red-500">*</span></>}
                                    name="divisionName"
                                    value={data.divisionName}
                                    error={errors.divisionName}
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
                                    error={errors.status}
                                    options={["Active", "Inactive"]}
                                    onChange={handleChange}
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

export default DivisionSystem;