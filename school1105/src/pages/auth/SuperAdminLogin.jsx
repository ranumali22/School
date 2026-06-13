import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import logo from "../../assets/e-gyanpath.png";
import { superAdminLogin } from "../../Api";
import { handleApiResponse } from "../../Component/common/alert";

const SuperAdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                login_id: username,
                password: password,
            };

            const response = await superAdminLogin(payload);

            console.log("Login Success:", response.data);
            handleApiResponse(response.data)

            // token agar aa raha hai
            localStorage.setItem("token", response.data.token);

            navigate("/school_list");
        } catch (error) {
            console.error("Login Error:", error);

            alert(
                error?.response?.data?.message ||
                "Login Failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex">
                <div className="flex w-full bg-[#4b5bbf] items-center justify-center">
                    <div className="w-full max-w-xl bg-white rounded-tl-[150px] rounded-br-[100px] px-6 py-1 relative flex flex-col justify-between">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <img src={logo} alt="logo" className="w-50 h-40" />
                        </div>

                        {/* Login Form */}
                        <div>
                            <h1 className="text-2xl font-bold text-center mb-6">SuperAdmin Login</h1>

                            <form

                                className="space-y-6"
                            >
                                {/* USERNAME */}
                                <div className="flex items-center border-b-2 border-indigo-400 pb-2">
                                    <User className="text-gray-400 mr-2" size={20} />
                                    <input
                                        type="text"
                                        placeholder="SuperAdmin Username"
                                        className="w-full bg-transparent outline-none"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                                        disabled={loading}
                                    />
                                </div>

                                {/* PASSWORD */}
                                <div className="flex items-center border-b-2 border-indigo-400 pb-2">
                                    <Lock className="text-gray-400 mr-2" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full bg-transparent outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                                        disabled={loading}
                                    />
                                </div>

                                {/* LOGIN BUTTON */}
                                <button
                                    onClick={handleLogin}
                                    type="submit"
                                    disabled={loading}
                                    className="w-[70%] mx-auto mt-10 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </form>
                        </div>

                        {/* Footer Links */}


                        {/* Footer Info */}
                        <div className="text-center mt-2">
                            <h4 className="text-xl font-bold mb-2">Student Management System</h4>
                            <p className="text-gray-600 text-sm px-4">
                                Manage Students, Teachers, Attendance, Exams and more with one powerful dashboard.
                            </p>
                            <p className="text-sm text-black">© 2026 E-GyanPath. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuperAdminLogin;
