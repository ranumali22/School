import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingInput } from "../../Component/common/FloatingInput";
import { showError } from "../../Component/common/alert";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        school: "",
        username: "",
        email: "",
        otp: "",
        newPassword: "",
    });

    const [generatedOTP, setGeneratedOTP] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // STEP 1 → VERIFY USER + SEND OTP
    const handleSendOTP = () => {
        const admins = JSON.parse(localStorage.getItem("admins")) || [];

        const user = admins.find(
            (a) =>
                a.name === form.school &&
                a.username === form.username &&
                a.email === form.email
        );

        if (!user) {
            setError("User not found ❌");
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(otp);

        showError("Your OTP is: " + otp); // 👉 replace with Gmail API later
        setStep(2);
        setError("");
    };

    // STEP 2 → VERIFY OTP
    const handleVerifyOTP = () => {
        if (form.otp !== generatedOTP) {
            setError("Invalid OTP ❌");
            return;
        }

        setStep(3);
        setError("");
    };

    // STEP 3 → RESET PASSWORD
    const handleResetPassword = () => {
        const admins = JSON.parse(localStorage.getItem("admins")) || [];

        const updated = admins.map((a) => {
            if (
                a.username === form.username &&
                a.email === form.email
            ) {
                return { ...a, password: form.newPassword };
            }
            return a;
        });

        localStorage.setItem("admins", JSON.stringify(updated));

        showError("Password Reset Successful ✅");
        navigate("/");
    };

    return (
        <div className="min-h-screen flex">

            {/* LEFT */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white items-center justify-center p-10">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Reset Your Password</h1>
                    <p className="text-lg">
                        Securely recover your admin account using OTP verification.
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-6">
                <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md">

                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Forgot Password
                    </h2>

                    {error && <p className="text-red-500 text-center mb-3">{error}</p>}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-1 gap-4">

                                <FloatingInput name="username" label="Username" onChange={handleChange} />
                                <FloatingInput name="email" label="Email/Number" onChange={handleChange} />
                            </div>
                            <button
                                onClick={handleSendOTP}
                                className="w-full bg-blue-600 text-white py-2 rounded mt-4"
                            >
                                Send OTP
                            </button>
                        </>
                    )}
                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <FloatingInput name="otp" label="Enter OTP" onChange={handleChange} />

                            <button
                                onClick={handleVerifyOTP}
                                className="w-full bg-green-600 text-white py-2 rounded mt-4"
                            >
                                Verify OTP
                            </button>
                        </>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <>
                            <FloatingInput
                                name="newPassword"
                                label="New Password"
                                type="password"
                                onChange={handleChange}
                            />

                            <button
                                onClick={handleResetPassword}
                                className="w-full bg-purple-600 text-white py-2 rounded mt-4"
                            >
                                Reset Password
                            </button>
                        </>
                    )}

                    <p
                        onClick={() => navigate("/")}
                        className="text-center text-blue-600 mt-4 cursor-pointer"
                    >
                        Back to Login
                    </p>

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;