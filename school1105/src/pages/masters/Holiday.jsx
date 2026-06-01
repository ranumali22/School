import React, { useState, useEffect } from "react";
import { handleApiResponse, showError } from "../../Component/common/alert";
import { localurl } from "../../api/api";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";

const Holiday = () => {
    const [showForm, setShowForm] = useState(false);
    const [holiday, setholiday] = useState([]);
    const [errors, setErrors] = useState({});
    const [ButtonAction, setButtonAction] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [edit_id, setedit_id] = useState("");
    const [school_id, setschool_id] = useState("");
    const [session_id, setsession_id] = useState("");

    const [holidayData, setholidayData] = useState({
        holiday_name: "",
        from_date: "",
        to_date: "",
        display_order: "",
        remark: "",
        status: "Active",
    });

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

        const sortedData = [...holiday].sort((a, b) => {
            if (typeof a[key] === "string") {
                return direction === "asc"
                    ? a[key].localeCompare(b[key])
                    : b[key].localeCompare(a[key]);
            }

            return direction === "asc"
                ? a[key] - b[key]
                : b[key] - a[key];
        });

        setholiday(sortedData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setholidayData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    const handleSubmit = async (action) => {
        let newErrors = {};

        if (!holidayData.holiday_name?.trim()) newErrors.holiday_name = "Required";
        if (!holidayData.from_date) newErrors.from_date = "Required";
        if (!holidayData.to_date) newErrors.to_date = "Required";
        if (holidayData.display_order === undefined || holidayData.display_order === null || holidayData.display_order === "") newErrors.display_order = "Required";
        if (!holidayData.status) newErrors.status = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                holidayData.holiday_name?.trim()
                    ? holidayData.from_date
                        ? holidayData.to_date
                            ? (holidayData.display_order !== undefined && holidayData.display_order !== null && holidayData.display_order !== "")
                                ? holidayData.status
                                    ? ""
                                    : "Status is required"
                                : "Display Order is required"
                            : "End Date is required"
                        : "Start Date is required"
                    : "Holiday Name is required"
            );
            return;
        }

        setErrors({});

        const payload = {
            school_id: school_id,
            session_id: session_id,
            holiday_name: holidayData.holiday_name,
            from_date: holidayData.from_date,
            to_date: holidayData.to_date,
            display_order: Number(holidayData.display_order),
            status: holidayData.status,
        };

        // ================= EDIT =================
        if (action === "edit") {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: JSON.stringify(payload),
                redirect: "follow",
            };

            let url = localurl + "update_holiday_master/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);

                    if (data.success) {
                        handleApiResponse(data);
                        getholiday(school_id, session_id);

                        // ✅ RESET
                        setholidayData({
                            holiday_name: "",
                            from_date: "",
                            to_date: "",
                            display_order: "",
                            remark: "",
                            status: "Active",
                        });

                        setButtonAction("");
                        setedit_id("");
                        setEditIndex(null);
                        setErrors({});
                        setShowForm(false);
                    } else {
                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("holiday_name")) newErrors.holiday_name = data.message;
                        if (msg.includes("from_date")) newErrors.from_date = data.message;
                        if (msg.includes("to_date")) newErrors.to_date = data.message;
                        if (msg.includes("display_order")) newErrors.display_order = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                        handleApiResponse(data);
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

                fetch(localurl + "add_holiday_master", requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const data = JSON.parse(result);

                        if (data.success) {
                            handleApiResponse(data);
                            getholiday(school_id, session_id);

                            setholidayData({
                                holiday_name: "",
                                from_date: "",
                                to_date: "",
                                display_order: "",
                                remark: "",
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

                            if (msg.includes("holiday_name")) newErrors.holiday_name = data.message;
                            if (msg.includes("from_date")) newErrors.from_date = data.message;
                            if (msg.includes("to_date")) newErrors.to_date = data.message;
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

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);

        setholidayData({
            holiday_name: "",
            from_date: "",
            to_date: "",
            display_order: "",
            remark: "",
            status: "Active",
        });

        setErrors({});
    };

    const getholiday = (school_id, session_id) => {
        fetch(localurl + "holiday_master/" + school_id + "/" + session_id)
            .then((response) => response.text())
            .then((result) => {
                const { success, row } = JSON.parse(result);
                if (success) {
                    const sortedHoliday = (row || []).sort((a, b) => {
                        const diff = (a.display_order || 0) - (b.display_order || 0);
                        if (diff === 0) {
                            const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                            const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                            return String(nameA).localeCompare(String(nameB));
                        }
                        return diff;
                    });
                    setholiday(sortedHoliday);
                }
            })
            .catch((data) => handleApiResponse(data));
    };

    useEffect(() => {
        const school_id = localStorage.getItem("school_id");
        const session_id = localStorage.getItem("session_id");

        if (school_id && session_id) {
            getholiday(school_id, session_id);
            setschool_id(school_id);
            setsession_id(session_id);
        }
    }, []);

    // ================= EDIT =================
    const handleEdit = (index, id) => {
        const item = holiday[index];

        setedit_id(id);
        setButtonAction("edit");

        setholidayData({
            holiday_name: item.holiday_name,
            from_date: item.from_date,
            to_date: item.to_date,
            display_order: item.display_order,
            remark: item.remark || "",
            status: item.status,
        });

        setEditIndex(index);
        setShowForm(true);
    };

    // ================= delete =================
    const handleDelete = async (id) => {
        await fetch(localurl + "delete_holiday_master/" + id, {
            method: "DELETE"
        });

        getholiday(school_id, session_id);
    };

    const togglestatus = (id, currentstatus) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        fetch(localurl + "status_holiday_master/" + id, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify({
                status: currentstatus === "Active" ? "Inactive" : "Active"
            })
        })
            .then(res => res.text())
            .then((result) => {
                console.log(result);
                const data = JSON.parse(result);
                handleApiResponse(data);
                getholiday(school_id, session_id);
            })
            .catch((data) => handleApiResponse(data));
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Holiday</h2>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
                >
                    + Add Holiday
                </button>
            </div>

            {/* TABLE */}
            <div className="mt-6 w-full overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">#</th>
                            <th onClick={() => handleSort("holiday_name")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">holiday ⬍</th>
                            <th onClick={() => handleSort("from_date")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Start Date ⬍</th>
                            <th onClick={() => handleSort("to_date")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">End Date ⬍</th>
                            <th onClick={() => handleSort("display_order")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">display_order ⬍</th>
                            <th onClick={() => handleSort("remark")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">remark ⬍</th>
                            <th onClick={() => handleSort("holiday_status")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">status ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {holiday.length > 0 ? (
                            holiday.map((h, index) => (
                                <tr key={index} className="text-center border-t">
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{h.holiday_name}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{new Date(h.from_date).toLocaleDateString("en-GB")}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{new Date(h.to_date).toLocaleDateString("en-GB")}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{h.display_order}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{h.remark}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${h.status === "Active"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                                }`}
                                        >
                                            {h.status}
                                        </span>
                                    </td>

                                    <td className="flex gap-2 justify-center px-2 md:px-4 py-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(index, h.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
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

            {/* MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl w-[600px] p-6">
                        <h2 className="text-xl font-bold text-black mb-6">
                            {ButtonAction === "edit" ? "Update Holiday" : "Add Holiday"}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput
                                label={<>Holiday Name <span className="text-red-500">*</span></>}
                                name="holiday_name"
                                value={holidayData.holiday_name}
                                onChange={handleChange}
                                error={errors.holiday_name}
                                required
                            />

                            <FloatingInput
                                type="date"
                                label={<>Start Date <span className="text-red-500">*</span></>}
                                name="from_date"
                                value={holidayData.from_date}
                                onChange={handleChange}
                                error={errors.from_date}
                                required
                            />

                            <FloatingInput
                                type="date"
                                label={<>End Date <span className="text-red-500">*</span></>}
                                name="to_date"
                                value={holidayData.to_date}
                                onChange={handleChange}
                                error={errors.to_date}
                                required
                            />

                            <FloatingInput
                                type="number"
                                label={<>Display Order <span className="text-red-500">*</span></>}
                                name="display_order"
                                value={holidayData.display_order}
                                onChange={handleChange}
                                error={errors.display_order}
                                required
                            />

                            <FloatingInput
                                label="remark"
                                name="remark"
                                value={holidayData.remark}
                                onChange={handleChange}
                                error={errors.remark}
                            />

                            <FloatingSelect
                                label="status"
                                name="status"
                                value={holidayData.status}
                                onChange={handleChange}
                                options={["Active", "Inactive"]}
                                error={errors.status}
                            />

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
                                            Schedule
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

export default Holiday;
