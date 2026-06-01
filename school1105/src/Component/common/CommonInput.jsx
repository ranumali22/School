import React, { useState } from "react";

export const CommonInput = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    maxLength,
    className,
}) => {
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        let val = e.target.value;

        if (["primaryNo", "secondaryNo",].includes(name)) {
            val = val.replace(/\D/g, ""); 
            if (val.length > 10) return;

            if (val.length > 0 && val.length < 10) {
                setError("Must be 10 digits");
            } else {
                setError("");
            }
        }
        if (["mobileNumber", "alternateNumber",].includes(name)) {
            val = val.replace(/\D/g, ""); 
            if (val.length > 10) return;

            if (val.length > 0 && val.length < 10) {
                setError("Must be 10 digits");
            } else {
                setError("");
            }
        }
        // 🔥 Registration  / Phone / number validation
        if (["phone", "mobile_no", "helpLine_no"].includes(name)) {
            let val = e.target.value;

            // Allow only digits + comma
            val = val.replace(/[^0-9,]/g, "");

            // Split numbers by comma
            const parts = val.split(",");

            // Validate each number
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].length > 10) return; // max 10 digit per number
            }

            // Optional: max 2 numbers allow
            // if (parts.length > 2) return;

            // Validation message
            if (parts.some(num => num.length > 0 && num.length < 10)) {
                setError("Each number must be 10 digits");
            } else {
                setError("");
            }

            // Final value
            val = parts.join(",");

            // set value
            onChange({
                target: {
                    name,
                    value: val,
                },
            });

            return;
        }

        // 🔥 Email validation
        if (name === "email") {
            val = val.replace(/\s/g, "");

            if (val && !/\S+@\S+\.\S+/.test(val)) {
                setError("Invalid email");
            } else {
                setError("");
            }
        }

        onChange({
            target: {
                name,
                value: val,
            },
        });
    };

    return (
        <div className="relative w-full">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={handleInputChange}
                maxLength={maxLength}
                required={required}
                className={`peer w-full border capitalize rounded-xl px-4 py-3 text-sm text-slate-900 outline-none 
                   ${className || "border-gray-200"} 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all`}
            />

            <label
                htmlFor={name}
                className="absolute left-3 -top-2 bg-white px-1 text-[12px] font-medium text-slate-700 transition-all peer-placeholder-shown:-top-3 peer-placeholder-shown:text-slate-700 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2 peer-focus:text-[12px] peer-focus:font-medium peer-focus:text-slate-700
                "
            >
                <span className="flex items-center gap-0.5">
                    {label}
                    {required && typeof label === "string" && <span className="text-red-500 ml-0.5 text-[10px]">*</span>}
                </span>
            </label>

            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

