import { useEffect, useState } from "react";
import { CommonInput } from "../../Component/common/CommonInput";
import { FloatingInput } from "../../Component/common/FloatingInput";
import { get_profile_school, update_school } from "../../Api";
import imageCompression from "browser-image-compression";
import { showError, showSuccess } from "../../Component/common/alert";
const SchoolProfilePrint = () => {
    const [admin, setAdmin] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ LOAD LOCAL + API
    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem("authData") || "{}");

        if (localData?.id) {
            setAdmin(localData);
            setFormData(localData);
        }

        fetchProfile();
    }, []);

    // ✅ FETCH PROFILE
    const fetchProfile = async () => {
        try {
            const localData = JSON.parse(localStorage.getItem("authData") || "{}");

            if (!localData?.id) return;

            const res = await get_profile_school(localData.id);

            const data = res.data?.row;

            if (data?.length > 0) {
                setAdmin(data[0]);
                setFormData(data[0]);

                localStorage.setItem("authData", JSON.stringify(data[0]));
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ HANDLE CHANGE
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ LOGO CHANGE (FILE + PREVIEW)
    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 0.1,          // 🔥 100KB max
            maxWidthOrHeight: 800,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);

            const reader = new FileReader();

            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    upload_logo: reader.result, // ✅ compressed base64
                });
            };

            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.log("Compression error:", error);
        }
    };
    // ✅ SAVE UPDATE (FormData)
    const handleSave = async () => {
        try {
            if (!formData?.id) {
                showError("ID missing ❌");
                return;
            }

            const res = await update_school(formData.id, formData);

            console.log("UPDATE RESPONSE:", res.data);

            if (res.data.success || res.data.message) {
                showSuccess("Updated Successfully ✅");

                // 🔥 instant UI update
                setAdmin({ ...formData });
                setFormData({ ...formData });

                localStorage.setItem("authData", JSON.stringify(formData));

                setIsEdit(false);

                fetchProfile();

            } else {
                showError("Update Failed ❌");
            }

        } catch (err) {
            console.error(err);
        }
    };

    // ✅ LOADING
    if (loading) return <p className="p-4">Loading...</p>;

    if (!admin) return <p className="p-4 text-red-500">No Data Found ❌</p>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="bg-white shadow-lg rounded-2xl p-6 max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center gap-4 border-b mb-6">

                    {/* LOGO */}
                    <img
                        src={
                            formData.preview_logo ||
                            (typeof formData.upload_logo === "string" && formData.upload_logo
                                ? formData.upload_logo.startsWith("data:image") || formData.upload_logo.startsWith("http")
                                    ? formData.upload_logo
                                    : `${import.meta.env.VITE_SERVER_URL}/uploads/${formData.upload_logo}`
                                : "/default-school.png")
                        }
                        className="w-16 h-16 rounded-full object-cover border"
                    />

                    {/* EDIT LOGO */}
                    {isEdit && (
                        <FloatingInput type="file" onChange={handleLogoChange} />
                    )}

                    {/* NAME */}
                    {isEdit ? (
                        <FloatingInput
                            name="school_name"
                            value={formData.school_name || ""}
                            onChange={handleChange}
                        />
                    ) : (
                        <h2 className="text-2xl font-bold">
                            {admin.school_name || "-"}
                        </h2>
                    )}
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {[
                        { label: "School Prefix", name: "school_prefix" },
                        { label: "Registration No", name: "registration_no" },
                        { label: "Affiliation No", name: "affiliation_no" },
                        { label: "Affiliated", name: "affiliated" },
                        { label: "Established", name: "established_from" },
                        { label: "Email", name: "email" },
                        { label: "Helpline No", name: "helpLine_no" }, // ✅ FIXED
                    ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-gray-500 text-sm">{item.label}</p>

                            {isEdit ? (
                                <CommonInput
                                    name={item.name}
                                    value={formData[item.name] || ""}
                                    onChange={handleChange}
                                />
                            ) : (
                                <p className="font-semibold">
                                    {item.name === "established_from"
                                        ? admin[item.name]
                                            ? new Date(admin[item.name]).toLocaleDateString("en-GB")
                                            : "-"
                                        : admin[item.name] || "-"}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* MOBILE */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-500 text-sm">Mobile</p>

                        {isEdit ? (
                            <CommonInput
                                name="mobile_no"
                                value={formData.mobile_no || ""}
                                onChange={handleChange}
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {admin.mobile_no
                                    ? admin.mobile_no.split(",").map((num, i) => (
                                        <span key={i} className="bg-blue-100 px-2 py-1 rounded text-sm">
                                            {num}
                                        </span>
                                    ))
                                    : "-"}
                            </div>
                        )}
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-500 text-sm">Address</p>

                    {isEdit ? (
                        <textarea
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    ) : (
                        <p className="font-semibold">{admin.address || "-"}</p>
                    )}
                </div>

                {/* LOGIN */}
                <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-500 text-sm">Login Info</p>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-semibold">{admin.username || "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Password</p>
                            <p className="font-semibold">********</p>
                        </div>
                    </div>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-2 mt-4">
                    {isEdit ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 text-white px-4 py-1 rounded"
                            >
                                Save
                            </button>

                            <button
                                onClick={() => setIsEdit(false)}
                                className="bg-gray-400 text-white px-4 py-1 rounded"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEdit(true)}
                            className="bg-blue-600 text-white px-4 py-1 rounded"
                        >
                            Edit
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SchoolProfilePrint;