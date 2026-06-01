import React, { useEffect, useState } from "react";
import TemplateFormModal from "./TemplateFormModal";
import { get_sms_template_school, delete_sms_template_school } from "../../../Api";
const STORAGE_KEY = "whatsapp_templates";

const WhatsAppManager = () => {
    const [templates, setTemplates] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState(null);


    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedData = [...templates].sort((a, b) => {
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

        setTemplates(sortedData); // ✅ yaha change
    };

    // ================= FETCH =================
    const fetchTemplates = async () => {
        try {
            const res = await get_sms_template_school();

            console.log("API DATA:", res.data);

            // ✅ correct key use karo
            setTemplates(res.data.row || []);

        } catch (error) {
            console.error("FETCH ERROR:", error);
        }
    };
    useEffect(() => {
        fetchTemplates();
    }, []);

    // ================= SAVE =================
    const handleSave = (form) => {
        let updatedTemplates = [...templates];

        if (editData) {
            // UPDATE
            updatedTemplates = updatedTemplates.map((item) =>
                item.id === editData.id ? { ...item, ...form } : item
            );
        } else {
            // CREATE
            const newTemplate = {
                ...form,
                id: Date.now(), // unique id
                active: true,
            };
            updatedTemplates.push(newTemplate);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));

        alert("Saved Successfully ✅");
        setIsOpen(false);
        setEditData(null);
        fetchTemplates();
    };

    // ================= DELETE =================


    // ================= ACTIVE TOGGLE =================
    const toggleActive = async (item) => {
        try {
            const newStatus =
                item.delete_status === "show" ? "delete" : "show";

            const id = item.id || item.sms_template_id;

            await delete_sms_template_school(id, {
                school_id: localStorage.getItem("school_id"),
                delete_status: newStatus,
            });

            // ✅ UI update (same as your school code)
            setTemplates((prev) =>
                prev.map((t) =>
                    t.id === id
                        ? { ...t, delete_status: newStatus }
                        : t
                )
            );

        } catch (err) {
            console.log("TOGGLE ERROR:", err);
        }
    };

    return (
        <div className=" bg-white  rounded-t-2xl max-w-full p-4 ">

            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-black">WhatsApp Templates</h2>

                <button
                    onClick={() => {
                        setEditData(null);
                        setIsOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Add Template
                </button>
            </div>

            {/* TABLE */}
            <div className="mt-6 w-full overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                #
                            </th>



                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("sms_template_name")}
                            >
                                Template Name ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("sms_template_id")}
                            >
                                Template ID ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Message
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Active
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Action
                            </th>

                        </tr>
                    </thead>

                    <tbody>
                        {templates.map((item, index) => (
                            <tr key={item.id} className="text-center border-t">

                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{index + 1}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.sms_template_name}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.sms_template_id}</td>
                                <td className="px-2 md:px-4 py-2 whitespace-nowrap truncate max-w-[200px]">
                                    {item.sms_message}
                                </td>

                                <td className="p-2">
                                    <button
                                        onClick={() => toggleActive(item)}
                                        className={`w-10 h-5 flex items-center rounded-full transition-all duration-300 
                                       ${item.delete_status === "show" ? "bg-green-500" : "bg-red-500 p-1"}`}
                                    >
                                        <div
                                            className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300
                                     ${item.delete_status === "show" ? "translate-x-6" : "translate-x-0"}`}
                                        />
                                    </button>
                                </td>

                                <td className="p-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
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

            {/* MODAL */}
            <TemplateFormModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={handleSave}
                editData={editData}
            />
        </div>
    );
};

export default WhatsAppManager;