import React, { useState } from "react";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";

function SalaryForm({ employee, handleSave }) {
    const [formData, setFormData] = useState(employee || {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
            <div className="flex justify-between border-b border-slate-200 pb-4 mb-6">
                <h1 className="!text-xl !mb-0">Salary Details</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                <FloatingInput
                    label="Joining Date"
                    name="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleChange}
                    required={true}
                />
                <FloatingInput
                    label="Start Time"
                    name="starttime"
                    type="time"
                    value={formData.starttime}
                    onChange={handleChange}
                />
                <FloatingInput
                    label="End Time"
                    name="endtime"
                    type="time"
                    value={formData.endtime}
                    onChange={handleChange}
                />
                <FloatingInput
                    label="Break Time (Min)"
                    name="breaktime"
                    type="number"
                    value={formData.breaktime}
                    onChange={handleChange}
                />

                <FloatingSelect
                    label="Working Type"
                    name="Times"
                    value={formData.Times}
                    onChange={handleChange}
                    options={["Part Time", "Full Time"]}
                />

                <FloatingInput
                    label="Monthly Salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    required={true}
                />

                <FloatingInput
                    label="Working Hours"
                    name="Hours"
                    value={formData.Hours}
                    onChange={handleChange}
                />

                <FloatingInput
                    label="Paid Leave"
                    type="number"
                    name="paidLeave"
                    value={formData.paidLeave}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-3 mt-8">
                <button
                    onClick={() => handleSave(formData)}
                    className="bg-[#0860C4] text-white px-8 py-2.5 rounded-full hover:bg-blue-700 shadow-md transition-all"
                >
                    Save Salary
                </button>
            </div>
        </div>
    );
}

export default SalaryForm;
