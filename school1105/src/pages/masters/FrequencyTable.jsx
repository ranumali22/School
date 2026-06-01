import React, { useState, useEffect } from "react";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";

function FeeFrequencyTable() {

    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc"
    });

    const [frequencies, setFrequencies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [edit_id, setedit_id] = useState("");
    const [school_id, setschool_id] = useState("");
    const [ButtonAction, setButtonAction] = useState("");

    const [formData, setFormData] = useState({
        frequencyName: "",
        date: "",
        displayOrder: "",
        status: "Active"
    });

    // ================= GET =================
    useEffect(() => {
        let id = localStorage.getItem("school_id");
        setschool_id(id);
        getFrequency(id);
    }, []);

    const getFrequency = (school_id) => {

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(localurl + "feefrequency/" + school_id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                const { success, row } = JSON.parse(result);
                if (success) {
                    setFrequencies([...row]);
                }
            })
            .catch((data) => handleApiResponse(data));
    };

    // ================= SORT =================
    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedData = [...frequencies].sort((a, b) => {

            if (key === "date") {
                return direction === "asc"
                    ? new Date(a.date) - new Date(b.date)
                    : new Date(b.date) - new Date(a.date);
            }

            if (typeof a[key] === "string") {
                return direction === "asc"
                    ? a[key].localeCompare(b[key])
                    : b[key].localeCompare(a[key]);
            }

            return direction === "asc"
                ? a[key] - b[key]
                : b[key] - a[key];

        });

        setFrequencies(sortedData);
    };

    // ================= INPUT =================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {

        const action = e;

        let newErrors = {};

        // ================= VALIDATION =================
        if (!formData.frequencyName) newErrors.frequencyName = "Required";
        if (!formData.date) newErrors.date = "Required";
        if (!formData.displayOrder) newErrors.displayOrder = "Required";
        if (!formData.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
    }

        const payload = {
            feefrequency: formData.frequencyName,
            date: formData.date,
            display_order: Number(formData.displayOrder),
            school_id: school_id,
            status: formData.status.toLowerCase()
        };

        // ================= EDIT =================
        if (ButtonAction === "edit") {

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify(payload);

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            fetch(localurl + "update_feefrequency/" + edit_id, requestOptions)
                .then((response) => response.text())
                .then((result) => {

                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getFrequency(school_id);

                        setFormData({
                            frequencyName: "",
                            date: "",
                            displayOrder: "",
                            status: "Active"
                        });

                        setButtonAction("");
                        setedit_id("");
                        setEditIndex(null);
                        setErrors({});
                        setShowForm(false);

                    } else {
                        handleApiResponse(data);

                        // ================= ERROR MAPPING =================
                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("feefrequency")) newErrors.frequencyName = data.message;
                        if (msg.includes("date")) newErrors.date = data.message;
                        if (msg.includes("display_order")) newErrors.displayOrder = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                    }

                })
                .catch((data) => handleApiResponse(data));
        }

        // ================= ADD =================
        else {

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify(payload);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            fetch(localurl + "add_feefrequency", requestOptions)
                .then((response) => response.text())
                .then((result) => {

                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getFrequency(school_id);

                        setFormData({
                            frequencyName: "",
                            date: "",
                            displayOrder: "",
                            status: "Active"
                        });

                        setErrors({});

                        if (action === "exit") {
                            setShowForm(false);
                        }

                    } else {
                        handleApiResponse(data);

                        // ================= ERROR MAPPING =================
                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("feefrequency")) newErrors.frequencyName = data.message;
                        if (msg.includes("date")) newErrors.date = data.message;
                        if (msg.includes("display_order")) newErrors.displayOrder = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                    }

                })
                .catch((data) => handleApiResponse(data));
        }
    };

    const resetForm = () => {
        setFormData({
            frequencyName: "",
            date: "",
            displayOrder: "",
            status: "Active"
        });
        setEditIndex(null);
        setedit_id("");
        setButtonAction("");
    };

    // ================= EDIT =================
    const handleEdit = (index, id) => {
        const item = frequencies[index];

        setFormData({
            frequencyName: item.feefrequency,
            date: item.date,
            displayOrder: item.display_order,
            status: item.status === "active" ? "Active" : "Inactive"
        });

        setEditIndex(index);
        setedit_id(id);
        setButtonAction("edit");
        setShowForm(true);
    };

    // ================= DELETE =================
    const toggleStatus = (id) => {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            delete_status: "delete"
        });

        const requestOptions = {
            method: "DELETE",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(localurl + "delete_feefrequency/" + id, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                handleApiResponse(result);
                getFrequency(school_id);
            })
            .catch((data) => handleApiResponse(data));
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">

            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                    Fee Frequency Master
                </h2>

                <button
                    onClick={() => {
                        setEditIndex(null);
                        setShowForm(true);
                    }}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Frequency
                </button>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border">

                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="p-2">#</th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("feefrequency")}>
                                Frequency Name ⬍
                            </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("date")}>
                                Date ⬍
                            </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("display_order")}>
                                Display Order ⬍
                            </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("status")}>
                                Status ⬍
                            </th>

                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {frequencies.length > 0 ? (
                            frequencies.map((f, index) => (
                                <tr key={index} className="text-center border-t">

                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{f.feefrequency}</td>
                                    <td className="p-2">{f.date}</td>
                                    <td className="p-2">{f.display_order}</td>

                                    <td className="p-2">
                                        <span className={`px-2 py-1 rounded text-white ${f.status === "active" ? "bg-green-500" : "bg-red-500"}`}>
                                            {f.status}
                                        </span>
                                    </td>

                                    <td className="p-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(index, f.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => toggleStatus(f.id)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 ${f.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full ${f.status === "active" ? "translate-x-6" : ""}`} />
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

            {/* MODAL SAME AS YOUR */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

                    <div className="bg-white rounded-xl w-[600px] p-6">

                        <h2 className="text-xl font-bold text-black mb-6">
                            Fee Frequency
                        </h2>

                        <div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <FloatingInput
                                    name="frequencyName"
                                    label="Frequency Name"
                                    error={errors.status}

                                    value={formData.frequencyName}
                                    onChange={handleChange}
                                />

                                <FloatingInput
                                    type="date"
                                    name="date"
                                    label="Date"
                                    error={errors.status}

                                    value={formData.date}
                                    onChange={handleChange}
                                />

                                <FloatingInput
                                    type="number"
                                    name="displayOrder"
                                    label="Display Order"
                                    error={errors.status}

                                    value={formData.displayOrder}
                                    onChange={handleChange}
                                />

                                <FloatingSelect
                                    name="status"
                                    label="status"
                                    value={formData.status}
                                    onChange={handleChange}
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
}

export default FeeFrequencyTable;