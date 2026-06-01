import React, { useState, useEffect } from "react";
import {
    ClassSelect,
    FloatingInput,
    FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

const ClassFeeForm = ({
    classList,
    feeHeads,
    setShowForm,
    records,
    setRecords,
    school_id,
    session_id,
    getClassFee,
    getAllClassFee,
    editData,
    setEditIndex,
}) => {
    const [data, setData] = useState({
        class_id: "",
        feehead_id: "",
        date: "", // ✅ NEW
        amount: "",
        display_order: "",
        status: "Active",
    });
    const [errors, setErrors] = useState({});

    const [edit_id, setedit_id] = useState("");

    const [ButtonAction, setButtonAction] = useState("");

    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);

        setData({
            class_id: "",
            feehead_id: "",
            date: "",
            amount: "",
            display_order: "",
            status: "Active",
        });

        setErrors({});
    };

    const getFeeHeadName = (id) => {
        return feeHeads.find((f) => String(f.id) === String(id))?.feehead || "-";
    };

    const handleEdit = (item) => {
        let formattedDate = "";

        if (item.date) {
            const d = new Date(item.date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            formattedDate = d.toISOString().split("T")[0];
        }

        setedit_id(item.id);
        setButtonAction("edit");

        setData({
            class_id: item.class_id,
            feehead_id: item.feehead_id,
            date: formattedDate,
            amount: item.amount,
            display_order: item.display_order,
            status: item.status,
        });
    };
    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedData = {
            ...data,
            [name]: value,
        };

        // ✅ AUTO FILL DATE WHEN FEEHEAD SELECTED
        if (name === "feehead_id") {
            const selectedHead = feeHeads.find((f) => String(f.id) === String(value));
            if (selectedHead && selectedHead.feehead_date) {
                const d = new Date(selectedHead.feehead_date);

                // ✅ FIX TIMEZONE SHIFT
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

                const formattedDate = d.toISOString().split("T")[0];

                updatedData.date = formattedDate;
            }
        }

        setData(updatedData);

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    useEffect(() => {
        if (editData !== null) {
            //   const item = records[editData];
            const item = editData; // ✅ direct object

            let formattedDate = "";
            if (item.date) {
                const d = new Date(item.date);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                formattedDate = d.toISOString().split("T")[0];
            }

            setedit_id(item.id);
            setButtonAction("edit");

            setData({
                class_id: item.class_id,
                feehead_id: item.feehead_id,
                date: formattedDate,
                amount: item.amount,
                display_order: item.display_order,
                status: item.status,
            });
        }
    }, [editData, records]);

    const handleSubmit = async (e) => {
        const action = e;

        let newErrors = {};

        if (!data.class_id) newErrors.class_id = "Required";
        if (!data.feehead_id) newErrors.feehead_id = "Required";
        if (!data.date) newErrors.date = "Required";
        if (!data.amount) newErrors.amount = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(
                data.class_id
                    ? data.feehead_id
                        ? data.date
                            ? "Amount is required"
                            : "Fee Head Date is required"
                        : "Fee Head is required"
                    : "Class is required"
            );
            return;
        }

        setErrors({});

        const payload = {
            school_id,
            session_id,
            class_id: data.class_id,
            feehead_id: data.feehead_id,
            date: data.date, // ✅
            display_order: Number(data.display_order),
            amount: Number(data.amount),
            status: data.status,
        };

        // ================= EDIT =================
        if (e == "edit") {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: JSON.stringify(payload),
                redirect: "follow",
            };

            let url = localurl + "update_classfee/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);
                    console.log("FULL API RESPONSE:", data); // 👈 ADD THIS

                    if (data.success) {
                        handleApiResponse(data);
                        // getClassFee(school_id, session_id, payload.class_id);
                        getAllClassFee(school_id, session_id);

                        // ✅ RESET
                        setData({
                            class_id: "",
                            feehead_id: "",
                            date: "",
                            amount: "",
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

                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("class_id")) newErrors.class_id = data.message;
                        if (msg.includes("feehead_id")) newErrors.feehead_id = data.message;
                        if (msg.includes("fee_frequency_id"))
                            newErrors.fee_frequency_id = data.message;
                        if (msg.includes("amount")) newErrors.amount = data.message;

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

                fetch(localurl + "add_classfee", requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const data = JSON.parse(result);
                        console.log("ppp API RESPONSE:", data); // 👈 ADD THIS

                        if (data.success) {
                            handleApiResponse(data);
                            //   getClassFee(school_id, session_id, payload.class_id);
                            getAllClassFee(school_id, session_id);

                            // ✅ RESET
                            setData({
                                class_id: "",
                                feehead_id: "",
                                fee_frequency_id: "",
                                frequency_date: "",
                                amount: "",
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

                            if (msg.includes("class_id")) newErrors.class_id = data.message;
                            if (msg.includes("feehead_id"))
                                newErrors.feehead_id = data.message;
                            if (msg.includes("fee_frequency_id"))
                                newErrors.fee_frequency_id = data.message;
                            if (msg.includes("amount")) newErrors.amount = data.message;

                            setErrors(newErrors);
                        }
                    })
                    .catch((data) => handleApiResponse(data));
            } catch (err) {
                console.error("Submit error:", err);
            }
            console.log("Payload:", payload);
        }
    };

    // console.log("rfgret", frequencyList);
    return (
        <div className="bg-white rounded-t-2xl p-4">
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">
                    {ButtonAction === "edit" ? "Update Class Fee" : "Add Class Fee"}
                </h2>
            </div>

            <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ClassSelect
                        name="class_id"
                        label={<>Class <span className="text-red-500">*</span></>}
                        value={data.class_id}
                        onChange={handleChange}
                        error={errors.class_id}
                        options={[
                            { label: "Select Class", value: "" },
                            ...classList.map((c) => ({
                                label: c.class_name,
                                value: c.id,
                            })),
                        ]}
                    />

                    <ClassSelect
                        name="feehead_id"
                        label={<>Fee Head <span className="text-red-500">*</span></>}
                        value={data.feehead_id}
                        onChange={handleChange}
                        error={errors.feehead_id}
                        options={[
                            { label: "Select Head", value: "" },
                            ...feeHeads.map((h) => ({
                                label: h.feehead,
                                value: h.id,
                            })),
                        ]}
                    />

                    <FloatingInput
                        name="date"
                        label={<>Fee Head Date <span className="text-red-500">*</span></>}
                        value={data.date}
                        onChange={handleChange}
                        type="date"
                        error={errors.date}
                        readOnly
                    />

                    <FloatingInput
                        type="number"
                        name="amount"
                        label={<>Amount <span className="text-red-500">*</span></>}
                        error={errors.amount}
                        value={data.amount}
                        onChange={handleChange}
                    />

                    <FloatingInput
                        type="number"
                        name="display_order"
                        label="Display Order"
                        value={data.display_order}
                        error={errors.display_order}
                        onChange={handleChange}
                    />

                    <FloatingSelect
                        name="status"
                        label="Status"
                        value={data.status}
                        onChange={handleChange}
                        options={["Active", "Inactive"]}
                        error={errors.status}
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
            {/* Fee Heads Table */}
            {data.class_id && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">
                        Fee Heads For{" "}
                        {records.find((r) => String(r.class_id) === String(data.class_id))
                            ?.class_name || "-"}
                    </h3>

                    <div className="mt-6 w-full overflow-x-auto">
                        <table className="min-w-full border">
                            <thead>
                                <tr className="bg-[#0860C4] text-white text-center">
                                    <th className="p-2">Class</th>
                                    <th className="p-2">Fee Head</th>
                                    <th className="p-2"> Date</th>
                                    <th className="p-2">Amount</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records
                                    .map((r, i) => ({ ...r, realIndex: i }))
                                    .filter((r) => String(r.class_id) === String(data.class_id))
                                    .map((r) => (
                                        <tr key={r.realIndex} className="text-center border-t">
                                            <td className="p-2">{r.class_name || "-"}</td>

                                            <td className="p-2">{getFeeHeadName(r.feehead_id)}</td>

                                            <td className="p-2">
                                                {r.date
                                                    ? (() => {
                                                        const d = new Date(r.date);
                                                        d.setMinutes(
                                                            d.getMinutes() - d.getTimezoneOffset(),
                                                        );
                                                        return d.toISOString().split("T")[0];
                                                    })()
                                                    : ""}
                                            </td>

                                            <td className="p-2">₹ {r.amount}</td>

                                            <td>
                                                <button
                                                    onClick={() => handleEdit(r)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-right mt-3 font-bold">
                        Total Fee : ₹{" "}
                        {records
                            .filter((r) => String(r.class_id) === String(data.class_id))
                            .reduce((sum, r) => sum + Number(r.amount), 0)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassFeeForm;