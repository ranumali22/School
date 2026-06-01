import React, { useState, useEffect } from "react";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "../../../Component/common/FloatingInput";

import {
    create_sms_template_school,
    update_sms_template_school
} from "../../../Api";

const TemplateFormModal = ({ isOpen, onClose, onSave, editData }) => {

    const [form, setForm] = useState({
        sms_template_name: "",
        sms_message: "",
        sms_template_id: "",
        url: "",
        displayOrder: "",
        status: "Active"
    });

    // ✅ EDIT / RESET FORM
    useEffect(() => {
        if (editData) {
            setForm(editData);
        } else {
            setForm({
                sms_template_name: "",
                sms_message: "",
                sms_template_id: "",
                url: "",
                displayOrder: "",
                status: "Active"
            });
        }
    }, [editData]);

    // ✅ AUTO GENERATE URL
    useEffect(() => {
        const { sms_username, sms_password, sms_api_key, sms_sender_id, route } = form;

        if (!sms_username && !sms_api_key) return;

        const generatedUrl = `https://api.example.com/send?username=${sms_username}&password=${sms_password}&api_key=${sms_api_key}&sender=${sms_sender_id}&route=${route}`;

        setForm((prev) => ({
            ...prev,
            url: generatedUrl,
        }));
    }, [
        form.sms_username,
        form.sms_password,
        form.sms_api_key,
        form.sms_sender_id,
        form.route,
    ]);

    // ================= CHANGE =================
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // ================= SUBMIT =================
    // const handleSubmit = async () => {
    //     try {
    //         const payload = {
    //             school_id: localStorage.getItem("school_id"),
    //             sms_template_name: form.sms_template_name,
    //             sms_message: form.sms_message,
    //             sms_template_id: form.sms_template_id,
    //             displayOrder: Number(form.displayOrder) || 0,
    //             status: form.status,
    //         };

    //         let res;

    //         if (editData?.id) {
    //             // ✅ UPDATE
    //             res = await update_sms_template_school(editData.id, payload);
    //         } else {
    //             // ✅ CREATE
    //             res = await create_sms_template_school(payload);
    //         }

    //         console.log("SUCCESS:", res.data);

    //         onSave && onSave(); // refresh parent
    //         onClose();

    //     } catch (error) {
    //         console.log("ERROR:", error.response?.data);
    //     }
    // };

     const handleSubmit = async () => {
        try {
            const payload = {
                school_id: localStorage.getItem("school_id"),
                sms_template_name: form.sms_template_name,
                sms_message: form.sms_message,
                sms_template_id: form.sms_template_id,
                status: form.status,
            };

            let res;

            if (editData?.id) {
                
                // ✅ UPDATE
                res = await update_sms_template_school(editData.id, payload);
            } else {
                // ✅ CREATE
                res = await create_sms_template_school(payload);
            }

            console.log("SUCCESS:", res.data);

            onSave && onSave(); // refresh parent
            onClose();

        } catch (error) {
            console.log("ERROR:", error.response?.data);
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-2xl space-y-5">

                <h2 className="text-xl font-bold text-black">
                    {editData ? "Edit Template" : "Add Template"}
                </h2>


                {/* ================= TEMPLATE DETAILS ================= */}
                <div>


                    <div className="mb-4">

                        <FloatingTextarea
                            name="url"
                            value={form.url}
                            onChange={handleChange}
                            label="Auto API URL"
                            className="w-full h-24"
                        />

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FloatingInput
                            name="sms_template_name"
                            value={form.sms_template_name}
                            onChange={handleChange}
                            label="Template Name"
                        />
                        <FloatingInput
                            name="sms_template_id"
                            value={form.sms_template_id}
                            onChange={handleChange}
                            label="Template ID"
                        />
                        <FloatingInput
                            type="number"
                            name="displayOrder"
                            label="Display Order"
                            value={form.displayOrder}
                            onChange={handleChange}
                        />
                        <FloatingSelect
                            label="Status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            options={["Active", "Inactive"]}
                        />
                    </div>


                    <div className="mt-4">
                        <FloatingTextarea
                            name="sms_message"
                            value={form.sms_message}
                            onChange={handleChange}
                            label="Message"
                            className="w-full h-24"
                        />
                    </div>
                </div>

                {/* ================= BUTTONS ================= */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        {editData ? "Update" : "Save"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TemplateFormModal;