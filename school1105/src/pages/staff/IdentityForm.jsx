import React, { useState } from "react";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";

function IdentityForm({ employee, handleSave  }) {

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
                <h2 className="text-xl font-bold">Identity Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">

                <FloatingSelect
                    label="ID Proof Type"
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleChange}
                    options={["--Select-Id-Proof-Type--", "Aadhar Card", "Voter Id", "Other"]}
                />

                <FloatingInput
                    label="ID Proof Number"
                    name="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={handleChange}
                />
                <FloatingInput
                    label="Upload Document"
                    name="idProofPhoto"
                    type="file"
                    onChange={handleChange}
                />

                <FloatingSelect
                    label=" Address Proof Type"
                    name="addressProofType"
                    value={formData.addressProofType}
                    onChange={handleChange}
                    options={["--Select-Address-Proof-Type--", "Aadhar Card", "Voter Id", "Other"]}
                />

                <FloatingInput
                    label="  Address Proof Number"
                    name="addressProof"
                    value={formData.addressProof}
                    onChange={handleChange}
                />

                <FloatingInput
                    label="Upload Document"
                    name="addressProofPhoto"
                    type="file"
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

export default IdentityForm;