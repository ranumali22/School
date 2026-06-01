import React, { useState, useEffect } from "react";



const FloatingInput = ({ label, name, value, onChange, type = "text" }) => {
    return (
        <div className="relative w-full">
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder=" "
                className="peer w-full border border-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <label
                htmlFor={name}
                className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-600
        peer-placeholder-shown:-top-3
        peer-placeholder-shown:text-base
        peer-focus:-top-2 peer-focus:text-sm peer-focus:text-indigo-500"
            >
                {label}
            </label>
        </div>
    );
};

/* ---------- Floating Select ---------- */

const FloatingSelect = ({ label, name, value, onChange, options }) => {
    return (
        <div className="relative w-full">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="peer w-full border border-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 bg-transparent"
            >
                {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>

            <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-600">
                {label}
            </label>
        </div>
    );
};

export default function FeeFrequencyForm({
    setFrequencies,
    frequencies,
    editIndex,
    setEditIndex,
    setShowForm
}) {

    const [formData, setFormData] = useState({
        frequencyName: "",
        date: "",
        displayOrder: "",
        status: "Active"
    });;

    useEffect(() => {

        if (editIndex !== null) {
            setFormData(frequencies[editIndex]);
        }

    }, [editIndex]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        const action = e.nativeEvent.submitter.value;

        if (editIndex !== null) {

            const updated = [...frequencies];
            updated[editIndex] = formData;

            setFrequencies(updated);
            setEditIndex(null);

        } else {

            setFrequencies([...frequencies, formData]);

        }

        if (action === "continue") {

            setFormData({
                frequencyName: "",
                date: "",
                displayOrder: "",
                status: "Active"
            });


        }

        if (action === "exit") {
            setFormData({
                frequencyName: "",
                date: "",
                displayOrder: "",
                status: "Active"
            });
            setShowForm(false);
        }


    };

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

            <div className="bg-white rounded-xl w-[600px] p-6">

                <h2 className="text-xl font-bold text-black mb-6">
                    Fee Frequency
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FloatingInput
                            type="text"
                            name="frequencyName"
                            label="Frequency Name"
                            value={formData.frequencyName}
                            onChange={handleChange}

                        />



                        <FloatingInput
                            type="date"
                            name="date"
                            label="Date"
                            value={formData.date}
                            onChange={handleChange}
                        />

                        <FloatingInput
                            type="number"
                            name="displayOrder"
                            label="Display Order"
                            value={formData.displayOrder}
                            onChange={handleChange}

                        />

                        <FloatingSelect
                            name="status"
                            label="status"
                            value={formData.status}
                            onChange={handleChange}

                            options={["Active", "Inactive"]}

                        />





                    </div>

                    <div className="flex gap-3 mt-6">

                        <button
                            type="submit"
                            name="action"
                            value="continue"
                            className="bg-green-600 text-white px-6 py-2 rounded"
                        >
                            Save & Continue
                        </button>

                        <button
                            type="submit"
                            name="action"
                            value="exit"
                            className="bg-purple-600 text-white px-6 py-2 rounded"
                        >
                            Save & Exit
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-500 text-white px-6 py-2 rounded"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}