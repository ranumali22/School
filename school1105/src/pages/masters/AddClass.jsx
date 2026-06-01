import React, { useState, useEffect } from "react";
import {
    FloatingInput,
    FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

const AddClass = () => {
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });
    const [showForm, setShowForm] = useState(false);

    const [errors, setErrors] = useState({});

    const [school_id, setschool_id] = useState("");

    const [classData, setClassData] = useState({
        class_name: "",
        display_order: "",
        status: "Active",
    });
    const resetForm = () => {
        setButtonAction("");
        setedit_id("");
        setEditIndex(null);
        setClassData({
            class_name: "",
            display_order: "",
            status: "Active",
        });

        setErrors({});
    };

    const [classes, setClasses] = useState([]);

    useEffect(() => {
        let school_id = localStorage.getItem("school_id");
        getclass(school_id);
        setschool_id(school_id);
    }, []);

    const [ButtonAction, setButtonAction] = useState("");
    const [edit_id, setedit_id] = useState("");

    const [editIndex, setEditIndex] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setClassData({
            ...classData,
            [name]: value,
        });
    };

    const sortTable = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        const sorted = [...classes].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;

            return 0;
        });

        setClasses(sorted);
        setSortConfig({ key, direction });
    };

    const handleSubmit = (e) => {
        // e.preventDefault();

        const action = e;

        // let newErrors = {};

        // if (!classData.class_name) newErrors.class_name = "Required";
        // if (!classData.display_order) newErrors.display_order = "Required";
        // if (!classData.status) newErrors.status = "Required";

        // if (Object.keys(newErrors).length > 0) {
        //     setErrors(newErrors);
        // }



        const newErrors = {};

        if (!classData.class_name) newErrors.class_name = "Required";
        if (!classData.display_order) newErrors.display_order = "Required";


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError(classData.class_name ? classData.display_order ? "" : "Display Order is required" : "Class Name is required");
            return;
        }

        const payload = {
            school_id: school_id,
            class_name: classData.class_name,
            display_order: Number(classData.display_order),
            status: classData.status,
        };
        console.log(payload);

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
            let url = localurl + "update_class/" + edit_id;

            fetch(url, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    console.log(result);

                    const data = JSON.parse(result);
                    if (data["success"]) {
                        handleApiResponse(data);
                        getclass(school_id);
                        setClassData({
                            class_name: "",
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

                        if (msg.includes("class_name")) newErrors.class_name = data.message;
                        if (msg.includes("display_order"))
                            newErrors.display_order = data.message;
                        if (msg.includes("status")) newErrors.status = data.message;

                        setErrors(newErrors);
                    }
                })
                .catch((data) => handleApiResponse(data));
        } else {
            try {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const raw = JSON.stringify(payload);

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow",
                };

                fetch(localurl + "add_class", requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        console.log(result);

                        const data = JSON.parse(result);
                        if (data["success"]) {
                            handleApiResponse(data);
                            getclass(school_id);
                            setClassData({
                                class_name: "",
                                display_order: "",
                                status: "Active",
                            });

                            if (action === "exit") {
                                setShowForm(false);
                            }
                        } else {
                            handleApiResponse(data);

                            const msg = data.message?.toLowerCase();
                            let newErrors = {};

                            if (msg.includes("class_name"))
                                newErrors.class_name = data.message;
                            if (msg.includes("display_order"))
                                newErrors.display_order = data.message;
                            if (msg.includes("status")) newErrors.status = data.message;

                            setErrors(newErrors);
                        }
                    })
                    .catch((data) => handleApiResponse(data));

                console.log(payload);

                return;
            } catch (err) {
                console.error("Submit error:", err.response?.data || err);
            }
        }
    };

    const getclass = (school_id) => {

        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        fetch(localurl + "class/" + school_id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log("class data", result);
                const { success, message, row } = JSON.parse(result);

                if (success) {
                    setClasses(row.sort((a, b) => {
                        const diff = (a.display_order || 0) - (b.display_order || 0);
                        if (diff === 0) {
                            const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                            const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                            return String(nameA).localeCompare(String(nameB));
                        }
                        return diff;
                    })
                    );

                    localStorage.setItem("classes", JSON.stringify(row));
                }
            })
            .catch((data) => handleApiResponse(data));
    };

    console.log("****************************");
    console.log(classes);

    const handleEdit = (index, id) => {
        const item = classes[index];
        setedit_id(id);
        setClassData({
            class_name: item.class_name,
            display_order: item.display_order,
            status: item.status === "Active" ? "Active" : "Inactive",
        });
        setButtonAction("edit");

        setEditIndex(index);
        setShowForm(true);
    };


    const toggleStatus = async (index) => {
        try {
            const item = classes[index];

            const newStatus = item.status === "Active" ? "Inactive" : "Active";

            const res = await fetch(localurl + "status_class/" + item.id, {
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
                getclass(school_id);
                handleApiResponse(data);

            }
        } catch (data) {
            handleApiResponse(data);


        }
    };

    return (
        <div className=" bg-white  rounded-t-2xl max-w-full p-4 ">
            {/* Header */}

            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Class Master</h2>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#0860C4]  text-white px-4 py-2 rounded-lg"
                >
                    + Add Class
                </button>
            </div>

            {/* Table */}

            <div className="mt-6 w-full overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4]  text-white text-center">
                            <th className="whitespace-nowrap p-2">#</th>

                            <th
                                onClick={() => sortTable("class_name")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Class Name ⬍
                            </th>

                            <th
                                onClick={() => sortTable("display_order")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Display Order ⬍
                            </th>

                            <th
                                onClick={() => sortTable("status")}
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Status ⬍
                            </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.length > 0 ? (
                            classes.map((c, index) => (
                                <tr key={index} className="text-center  border-t ">
                                    <td className="p-2">{index + 1}</td>

                                    <td className="p-2">{c.class_name}</td>

                                    <td className="p-2">{c.display_order}</td>

                                    <td className="p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${c.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            {c.status}
                                        </span>
                                    </td>

                                    <td className=" p-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(index, c.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(index)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${c.status === "Active" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full transition 
                          ${c.status === "Active" ? "translate-x-6" : ""}`}
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

            {/* Modal Form */}

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[500px] rounded-xl p-6">
                        <h2 className="text-xl font-bold text-black mb-6">Add Class</h2>
                        {/* 
                        <form
                            onSubmit={handleSubmit}

                        > */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingInput
                                type="text"
                                name="class_name"
                                label={<>Class Name <span className="text-red-500">*</span></>}
                                value={classData.class_name}
                                onChange={handleChange}
                                error={errors.class_name}
                                required
                            />

                            <FloatingInput
                                onChange={handleChange}
                                value={classData.display_order}
                                id="displayOrder"
                                name="display_order"
                                label={<>Display Order <span className="text-red-500">*</span></>}
                                error={errors.display_order}
                                type="number"
                                required
                            />

                            <FloatingSelect
                                label="Status"
                                name="status"
                                value={classData.status}
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
                        {/* </form> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddClass;