import React, { useState, useEffect } from "react";
import {
    ClassSelect,
    FloatingInput,
    FloatingSelect,
} from "../../Component/common/FloatingInput";
import { handleApiResponse } from "../../Component/common/alert";
import { localurl } from "../../api/api";

const FeeHeadMaster = () => {
    const [frequencyList, setFrequencyList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [school_id, setschool_id] = useState("");
    const [ButtonAction, setButtonAction] = useState("");
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [edit_id, setedit_id] = useState("");
    const [errors, setErrors] = useState({});

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

        const sorted = [...records].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });

        setRecords(sorted);
    };

    const [data, setData] = useState({
        feehead: "",
        feehead_date: "",
        display_order: "",
        status: "Active",
    });

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);
        setData({
            feehead: "",
            feehead_date: "",
            display_order: "",
            status: "Active",
        });

        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        const action = e;

        let newErrors = {};

        if (!data.feehead) newErrors.feehead = "Required";
        if (!data.feehead_date) newErrors.feehead_date = "Required";
        if (!data.display_order) newErrors.display_order = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        }

        const payload = {
            school_id: school_id,
            feehead: data.feehead,
            feehead_date: data.feehead_date,
            display_order: Number(data.display_order),
            status: data.status,
        };
        // ================= EDIT =================
        if (e == "edit") {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify(payload);

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };
            let url = localurl + "update_feehead/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getfeehead(school_id);

                        // ✅ RESET
                        setData({
                            feehead: "",
                            feehead_date: "",
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

                        const msg = data.message;
                        let newErrors = {};

                        if (msg.includes("feehead")) newErrors.feehead = data.message;
                        if (msg.includes("fee_frequency_id"))
                            newErrors.fee_frequency_id = data.message;
                        if (msg.includes("frequency_date"))
                            newErrors.frequency_date = data.message;
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
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: JSON.stringify(payload),
                    redirect: "follow",
                };

                fetch(localurl + "add_feehead", requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const data = JSON.parse(result);

                        if (data.success) {
                            handleApiResponse(data);
                            getfeehead(school_id);

                            setData({
                                feehead: "",
                                feehead_date: "",
                                display_order: "",
                                status: "Active",
                            });

                            // setErrors({});

                            if (action === "exit") {
                                setShowForm(false);
                            }
                        } else {
                            handleApiResponse(data);
                        }
                    })
                    .catch((data) => handleApiResponse(data));
            } catch (err) {
                console.error("Submit error:", err);
            }
        }
    };
    const getFrequency = (school_id) => {
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        fetch(localurl + "feefrequency/" + school_id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                const { success, row } = JSON.parse(result);
                if (success) {
                    setFrequencyList([...row]);
                }
            })
            .catch((data) => handleApiResponse(data));
        console.log("frequencyList:", frequencyList);
    };
    const getFrequencyName = (id) => {
        const item = frequencyList.find((f) => String(f.id) === String(id));
        return item ? item.feefrequency : "-";
    };

    const getfeehead = (school_id) => {
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        fetch(localurl + "feehead/" + school_id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                const { success, message, row } = JSON.parse(result);
                if (success) {
                    setRecords(
                        row.sort((a, b) => {
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

    useEffect(() => {
        let school_id = localStorage.getItem("school_id");
        getfeehead(school_id);
        setschool_id(school_id);
        getFrequency(school_id);
    }, []);

    const handleEdit = (index, id) => {
        const item = records[index];

        let formattedDate = "";

        if (item.frequency_date) {
            formattedDate = new Date(item.frequency_date).toISOString().split("T")[0];
        }

        setData({
            feehead: item.feehead,
            feehead_date: item.feehead_date ? item.feehead_date.split("T")[0] : "",
            display_order: item.display_order,
            status: item.status,
        });

        setedit_id(id);
        setButtonAction("edit");
        setEditIndex(index);
        setShowForm(true);
    };

    const toggleStatus = async (index) => {
        try {
            const item = records[index];

            const newStatus = item.status === "Active" ? "Inactive" : "Active";

            const res = await fetch(localurl + "status_feehead/" + item.id, {
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
                getfeehead(school_id);
                handleApiResponse(data)
            }
        } catch (data) {
            handleApiResponse(data);
        }
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            {/* Header */}

            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Fee Head Master</h2>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#0860C4]  text-white p-2 rounded"
                >
                    + Add Fee Head
                </button>
            </div>

            {/* Table */}

            <div className="mt-6 w-full overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="p-2">#</th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("feehead")}
                            >
                                Fee Head ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("feehead_date")}
                            >
                                Fee Date ⬍
                            </th>
                            <th
                                onClick={() => handleSort("display_order")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
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
                        {records.length > 0 ? (

                            records.map((r, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="p-2">{index + 1}</td>

                                    <td>{r.feehead}</td>

                                    <td>
                                        {r.feehead_date
                                            ? new Date(r.feehead_date).toLocaleDateString("en-GB")
                                            : ""}
                                    </td>
                                    <td className="p-2">{r.display_order}</td>

                                    <td className="p-2">
                                        <span
                                            className={`px-2 py-1 text-white rounded 
                                  ${r.status === "Active"
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>

                                    <td className="p-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(index, r.id)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => toggleStatus(index)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${r.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full transition 
                          ${r.status === "Active" ? "translate-x-6" : ""}`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))) : (
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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-[500px]">
                        <h2 className="text-xl font-bold text-black mb-4">Add Fee Head</h2>

                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingInput
                                    name="feehead"
                                    label={<>Fee Head <span className="text-red-500">*</span></>}
                                    value={data.feehead}
                                    onChange={handleChange}
                                    error={errors.feehead}
                                />

                                <FloatingInput
                                    name="feehead_date"
                                    label={<>Fee Head Date <span className="text-red-500">*</span></>}
                                    value={data.feehead_date}
                                    onChange={handleChange}
                                    type="date"
                                    error={errors.feehead_date}
                                />
                                <FloatingInput
                                    type="number"
                                    name="display_order"
                                    label={<>Display Order <span className="text-red-500">*</span></>}
                                    value={data.display_order}
                                    error={errors.display_order}
                                    onChange={handleChange}
                                />

                                <FloatingSelect
                                    name="status"
                                    label="Status"
                                    value={data.status}
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

export default FeeHeadMaster;
