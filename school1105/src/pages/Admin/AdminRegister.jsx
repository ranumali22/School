import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingInput, FloatingInputs, FloatingTextarea } from "../../Component/common/FloatingInput";
import { CommonInput } from "../../Component/common/CommonInput";
import imageCompression from "browser-image-compression";

import { register_school } from "../../Api";
import { handleApiResponse } from "../../Component/common/alert";
const AdminRegister = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        school_name: "",
        registration_no: "",
        affiliation_no: "",
        affiliated: "",
        phone: "",
        email: "",
        helpLine_no: "",
        mobile_no: "",
        established_from: "",
        address: "",
        username: "",
        password: "",
        upload_logo: "",
    });

    const [error, setError] = useState("");

    const [errorFields, setErrorFields] = useState([]);

    // HANDLE CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === "username" || name === "password" || name === "e") {
            newValue = value.replace(/\s/g, "");
        }

        setForm({ ...form, [name]: newValue });

        if (newValue) {
            setErrorFields((prev) => prev.filter((f) => f !== name));
        }
    };

    // HANDLE LOGO
    const handleLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setForm({
            ...form,
            logoFile: file,           // 👈 Store raw file
            logoPreview: URL.createObjectURL(file), // 👈 Store preview
        });
    };

    // REGISTER
    const handleRegister = async (type) => {

        const requiredFields = ["school_name", "mobile_no", "username", "password", "email", "address"];

        let errors = [];

        for (let field of requiredFields) {
            if (!form[field] || form[field].toString().trim() === "") {
                errors.push(field);
            }
        }

        if (errors.length > 0) {
            setErrorFields(errors);
        } else {
            setErrorFields([]);
        }

        try {
            const formData = new FormData();

            const fields = [
                "school_name", "registration_no", "affiliation_no", "affiliated",
                "phone", "email", "helpLine_no", "mobile_no", "established_from",
                "address", "username", "password"
            ];

            fields.forEach(key => {
                if (form[key] !== undefined && form[key] !== null) {
                    formData.append(key, form[key]);
                }
            });

            if (form.logoFile) {
                formData.append("upload_logo", form.logoFile);
                formData.append("upload_type", "school_logo");
            }

            const res = await register_school(formData);
            const data = res.data;

            handleApiResponse(data);

            // 🔥 EXIT LOGIC
            if (data.success && type === "exit") {
                navigate("/");
            }

        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Server Error ❌";

            handleApiResponse({
                success: false,
                message: errorMessage,
            });
        }
    };


    return (
        <div className="min-h-screen flex">

            {/* LEFT SIDE */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white items-center justify-center p-10">
                <div>
                    <h1 className="text-4xl font-bold mb-4">School ERP System</h1>
                    <p className="text-lg">
                        Manage Students, Teachers, Attendance, Exams and more with one powerful dashboard.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/ flex items-center justify-center bg-gray-100 p-3">

                <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-4xl">

                    <h2 className="text-2xl font-bold mb-4 text-center ">
                        School / College / Institute Registration Form
                    </h2>
                    <hr />


                    <div>
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 mt-5">

                            {/* FULL WIDTH MOBILE */}
                            <div className="col-span-2 md:col-span-4">
                                <FloatingInput name="school_name"
                                    label={<>School Name <span className="text-red-500">*</span></>}
                                    value={form.school_name} onChange={handleChange}
                                    className={errorFields.includes("school_name") ? "!border-red-500" : ""}
                                />
                            </div>

                            {/* HALF WIDTH MOBILE */}
                            <div className="col-span-1 md:col-span-4">
                                <FloatingInputs name="registration_no" 
                                label="Registration No"
                                
                                 value={form.registration_no} onChange={handleChange}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-4">
                                <FloatingInputs name="affiliation_no" label="Affiliation No" value={form.affiliation_no} onChange={handleChange}
                                />
                            </div>

                            {/* HALF */}
                            <div className="col-span-1 md:col-span-4">
                                <FloatingInputs name="affiliated" label="Affiliated" value={form.affiliated} onChange={handleChange} />
                            </div>
                            <div className="col-span-2 md:col-span-4">
                                <FloatingInputs name="established_from" type="date" label="Established From" value={form.established_from} onChange={handleChange} />
                            </div>
                            <div className="col-span-2 md:col-span-4">
                                <CommonInput name="email" 
                                 label={<>Email <span className="text-red-500">*</span></>}
                                 value={form.email} onChange={handleChange}
                                    className={errorFields.includes("email") ? "!border-red-500 " : ""} />
                            </div>
                            <div className="col-span-1 md:col-span-4">
                                <CommonInput name="phone" label="Phone" value={form.phone} onChange={handleChange} />
                            </div>
                            {/* FULL */}
                            <div className="col-span-1 md:col-span-4">
                                <CommonInput
                                    name="mobile_no"
                                    label={<>Mobile No <span className="text-red-500">*</span></>}
                                    value={form.mobile_no}
                                    onChange={handleChange}
                                    className={errorFields.includes("mobile_no") ? "!border-red-500" : ""}
                                />
                            </div>





                            {/* HALF */}
                            <div className="col-span-1 md:col-span-4">
                                <CommonInput name="helpLine_no" label="HelpLine No" value={form.helpLine_no} onChange={handleChange} />
                            </div>



                            {/* FULL */}


                            {/* ADDRESS FULL */}
                            <div className="col-span-2 md:col-span-12">
                                <FloatingTextarea name="address" 
                                 label={<>Address <span className="text-red-500">*</span></>}
                                 value={form.address} onChange={handleChange}
                                    className={errorFields.includes("address") ? "!border-red-500 " : ""} />
                            </div>

                            {/* LOGIN */}
                            <div className="col-span-2 md:col-span-6">
                                <FloatingInput
                                    name="username"
                                    label={<>Username <span className="text-red-500">*</span></>}
                                    value={form.username}
                                    onChange={handleChange}
                                    className={`${errorFields.includes("username") ? "!border-red-500" : ""} normal-case`}
                                />
                            </div>

                            <div className="col-span-2 md:col-span-6">
                                <FloatingInput
                                    name="password"
                                    label={<>Password <span className="text-red-500">*</span></>}
                                    value={form.password}

                                    onChange={handleChange}
                                    // className={errorFields.includes("password") ? "border-red-500" : ""}
                                    className={`${errorFields.includes("password") ? "!border-red-500" : ""} normal-case`}

                                />
                            </div>

                            {/* LOGO */}
                            <div className="col-span-2 md:col-span-6">
                                <FloatingInputs type="file" label="Upload Logo" onChange={handleLogo} />
                                {form.logoPreview && <img src={form.logoPreview} className="h-20 mt-2" />}
                            </div>

                            {/* BUTTON */}
                            <div className="col-span-2 md:col-span-12">
                                <button
                                    onClick={() => {
                                        handleRegister("exit");
                                    }}
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-2 rounded cursor-pointer"
                                >
                                    Register School
                                </button>
                            </div>

                        </div>
                    </div>

                    <p
                        onClick={() => navigate("/")}
                        className="text-center text-blue-600 mt-4 cursor-pointer"
                    >
                        Back to Login
                    </p>

                </div>
            </div >
        </div >
    );
};

export default AdminRegister;
