import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const StaffProfile = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [imgError, setImgError] = useState(false);

    const imageBase = localurl.replace("/api", "");

    useEffect(() => {
        const fetchFullProfile = async () => {
            try {
                const authData = JSON.parse(localStorage.getItem("authData") || "{}");
                const school_id = localStorage.getItem("school_id");
                const session_id = localStorage.getItem("session_id");
                const employee_id = authData.id;

                if (!school_id || !session_id || !employee_id) {
                    setStaff(authData);
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${localurl}employee/${school_id}/${session_id}`);
                const data = await res.json();

                if (data.success && data.row) {
                    const fullStaff = data.row.find(emp => emp.id === employee_id);

                    if (fullStaff) {
                        setStaff(fullStaff);
                        localStorage.setItem("authData", JSON.stringify(fullStaff));
                    } else {
                        setStaff(authData);
                    }
                } else {
                    setStaff(authData);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFullProfile();
    }, []);

    const formatDate = (date) => {
        if (!date) return "—";
        try {
            return date.split("-").reverse().join("-");
        } catch {
            return date;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#0860C4] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!staff || Object.keys(staff).length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 font-medium">Profile data not found.</p>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return "S";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const photoUrl = staff.employeePhoto
        ? `${imageBase}uploads/employee/${staff.employeePhoto}`
        : null;

    const Card = ({ title, children }) => (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    {title}
                </h2>

                <div className="w-10 h-1 rounded-full bg-[#0860C4]"></div>
            </div>

            {children}
        </div>
    );

    const Field = ({ label, value }) => (
        <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-[15px] font-semibold text-gray-800 break-words">
                {value || "—"}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen ">
            <div className="max-w-7xl mx-auto">

                {/* Top Profile Card */}
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 mb-8">


                    <div className="relative px-6 md:px-10 pb-8">

                        {/* Profile Image */}
                        <div className=" flex flex-col md:flex-row md:items-end md:justify-between gap-6">

                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">

                                <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white">
                                    {!imgError && photoUrl ? (
                                        <img
                                            src={photoUrl}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-[#0860C4] flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                                            {getInitials(staff.employeeFullName)}
                                        </div>
                                    )}
                                </div>

                                <div className="text-center md:text-left md:pb-3">
                                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                                        {staff.employeeFullName || "Staff Member"}
                                    </h1>

                                    <p className="text-[#0860C4] font-semibold text-lg mt-2">
                                        {staff.designation_name || "Employee"}
                                    </p>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                        <span className="px-4 py-1.5 bg-blue-50 text-[#0860C4] rounded-full text-sm font-semibold border border-blue-100">
                                            ID : {staff.loginId || staff.employee_id || "—"}
                                        </span>

                                        <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-100">
                                            {staff.department_name || "Department"}
                                        </span>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Basic Info */}
                    <Card title="Basic Information">
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                            <Field label="Father's Name" value={staff.fatherName} />
                            <Field label="Mother's Name" value={staff.motherName} />
                            <Field label="Date of Birth" value={formatDate(staff.dob)} />
                            <Field label="Gender" value={staff.gender_name} />
                            <Field label="Category" value={staff.category_name} />
                            <Field label="Marital Status" value={staff.maritalStatus} />
                            <Field label="Religion" value={staff.religion_name} />
                            <Field label="Mobile Number" value={staff.mobileNumber} />
                            <Field label="Emergency Number" value={staff.alternateNumber} />
                            <Field label="Email Address" value={staff.email} />
                        </div>
                    </Card>

                    {/* Professional Info */}
                    <Card title="Professional Information">
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                            <Field label="Qualification" value={staff.qualification} />
                            <Field label="Experience" value={staff.workExperience} />
                            <Field label="Department" value={staff.department_name} />
                            <Field label="Joining Date" value={formatDate(staff.dateOfJoin)} />



                            <Field
                                label="Login ID"
                                value={staff.loginId}
                            />

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">
                                    Password
                                </p>

                                <div className="flex items-center gap-3">
                                    <p className="text-[15px] font-semibold text-gray-800">
                                        {showPassword
                                            ? staff.password
                                            : "••••••••"}
                                    </p>

                                    <button
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="text-gray-400 hover:text-[#0860C4] transition-colors"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash size={18} />
                                        ) : (
                                            <FaEye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </Card>

                    {/* Current Address */}
                    <Card title="Current Address">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Field
                                    label="Address"
                                    value={staff.currentAddress}
                                />
                                <Field
                                    label="State"
                                    value={staff.currentState}
                                />


                                <Field label="City" value={staff.currentCity} />
                                <Field label="Pin Code" value={staff.currentPincode} />
                            </div>
                        </div>
                    </Card>

                    {/* Permanent Address */}
                    <Card title="Permanent Address">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">

                                <Field
                                    label="Address"
                                    value={staff.permanentAddress}
                                />
                                <Field
                                    label="State"
                                    value={staff.permanentState}
                                />

                                <Field label="City" value={staff.permanentCity} />
                                <Field
                                    label="Pin Code"
                                    value={staff.permanentPincode}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Account Security */}
                    <div className="xl:col-span-2">

                    </div>

                </div>
            </div>
        </div>
    );
};

export default StaffProfile;