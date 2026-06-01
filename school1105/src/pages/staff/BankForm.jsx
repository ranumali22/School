import React, { useState } from "react";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";

function BankForm({ employee, handleSave  }) {

    const [formData, setFormData] = useState(employee);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>

            <div className="flex justify-between border-b pb-2 mb-4">
                <h2 className="text-xl font-bold">Bank Detail</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">

                <FloatingInput
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                />

                <FloatingInput
                    label="Account Number"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                />

                <FloatingInput
                    label="IFSC Code"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                />
                <FloatingInput
                    label="Upload Passbook / Checkbook"
                    type="file"
                    name="bankPassbookOrCheckbookPhoto"
                    onChange={handleChange}
                />
            </div>
            <button
                onClick={() => handleSave(formData)}
                className="bg-[#0860C4] text-white px-4 py-2 rounded mt-4"
            >
                Save
            </button>
        </div>
    );
}

export default BankForm;