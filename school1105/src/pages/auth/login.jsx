import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { login_admin, student_login, staff_login } from "../../Api";
import { generateToken } from "../../notification/firebase";
import { handleApiResponse, showError, showSuccess } from "../../Component/common/alert";
import logo from "../../assets/e-gyanpath.png";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState(
    typeof window !== "undefined" && window.innerWidth <= 850 ? "student" : "admin"
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Mobile responsive check
    const handleResize = () => {
      setLoginType((prev) => {
        if (window.innerWidth <= 850) {
          if (prev === "admin") return "student";
          return prev;
        } else {
          if (prev === "student") return "admin";
          return prev;
        }
      });
    };

    window.addEventListener("resize", handleResize);

    // 2. Persistent Session Check (Auto-Redirect)
    const authRole = localStorage.getItem("authRole");
    const authData = localStorage.getItem("authData");

    if (authRole && authData) {
      if (authRole === "admin") navigate("/dashboard", { replace: true });
      else if (authRole === "student") navigate("/student-dashboard", { replace: true });
      else if (authRole === "staff") navigate("/staff-dashboard", { replace: true });
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      let data;

      if (loginType === "admin") {
        const res = await login_admin({
          username: username.trim(),
          password: password.trim(),
        });

        data = res.data;
        const school = data.user?.[0];

        localStorage.setItem("school", JSON.stringify(school));

        console.log("LOGIN SCHOOL:", school);


      } else if (loginType === "student") {
        const res = await student_login({
          loginid: username.trim(),
          password: password.trim(),
          school_id: localStorage.getItem("school_id") || 1,
        });

        data = res.data;
        console.log("login data", data);

        if (data.success && data.data?.session_name) {
          localStorage.setItem("session_name", data.data.session_name);
        }
      } else if (loginType === "staff") {
        const res = await staff_login({
          loginid: username.trim(),
          password: password.trim(),
          school_id: localStorage.getItem("school_id") || 1,
        });

        data = res.data;
      }

      console.log("LOGIN RESPONSE:", data);
      handleApiResponse(data);
      if (data?.success) {
        const userData = data.data || data.user?.[0] || data.admin;

        if (!userData) {
          // handleApiResponse(data);
          setLoading(false);
          return;
        }

        handleApiResponse(data);

        localStorage.setItem("authRole", loginType);
        localStorage.setItem("authData", JSON.stringify(userData));

        if (loginType === "admin") {
          localStorage.setItem("school_id", userData.id);
          localStorage.setItem("user_id", userData.id);
          let session_data = data.session
          if (session_data.length > 0) {

            localStorage.setItem("session_id", session_data[0].id);
            navigate("/dashboard", { replace: true });
            showSuccess("New session")
          }

          else {
            // alert("Old session")

            navigate("/add-session", { replace: true });
          }
        } else if (loginType === "student") {
          localStorage.setItem("student_id", userData.id);
          localStorage.setItem("school_id", userData.school_id);
          localStorage.setItem("session_id", userData.session_id);
          localStorage.setItem("user_id", userData.id);
          localStorage.setItem("student_class_id", userData.class); // 👈 Save class ID

          // 🔥 force string save
          const sessionName = data?.data?.session_name || "";
          localStorage.setItem("session_name", sessionName);

          // 🔥 DEBUG
          console.log("Saved session:", sessionName);

          navigate("/student-dashboard", { replace: true });
        } else if (loginType === "staff") {
          localStorage.setItem("employee_id", userData.id);
          localStorage.setItem("school_id", userData.school_id);
          localStorage.setItem("session_id", userData.session_id);
          localStorage.setItem("user_id", userData.id);
          navigate("/staff-dashboard", { replace: true });
        }

        setTimeout(() => {
          generateToken();
        }, 1000);
      } else {
        handleApiResponse(data);
        setLoading(false);

      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const backendMsg = err?.response?.data?.message || "Server Error ❌";


      showError(backendMsg);
      setLoading(false);

    }
  };

  return (
    <>
      <div className="min-h-screen flex">



        <div className="flex w-full  bg-[#4b5bbf] items-center justify-center">
          <div className="w-full max-w-xl  bg-white rounded-tl-[150px] rounded-br-[100px] px-6 py-1 relative flex flex-col justify-between">
            <div className="flex justify-center">
              <img
                src={logo}
                alt="logo"
                className="w-50 h-40 " />
            </div>

            <div>

              <div className="flex bg-gray-200 rounded-xl overflow-hidden mb-3">
                {["admin", "staff", "student"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setLoginType(type)}
                    className={`flex-1 py-2 
                      ${loginType === type ? "bg-indigo-600 text-white" : "text-gray-700"}
                      ${type === "admin" ? "max-[850px]:hidden" : ""}
                      ${type === "student" ? "min-[851px]:hidden" : ""}
                    `}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>


              <h1 className="text-2xl font-bold text-center mb-6">
                {loginType === "staff"
                  ? "Staff Login"
                  : loginType === "student"
                    ? "Student Login"
                    : "Admin Login"}
              </h1>

              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">

                {/* USERNAME */}
                <div className="flex items-center border-b-2 border-indigo-400 pb-2">
                  <User className="text-gray-400 mr-2" size={20} />


                  <input
                    type="text"
                    placeholder={
                      loginType === "admin"
                        ? "Admin Username"
                        : loginType === "student"
                          ? "Student Login ID"
                          : "Staff Login ID"
                    }
                    className="w-full bg-transparent outline-none"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/\s/g, ""))
                    }
                  />
                </div>


                <div className="flex items-center border-b-2 border-indigo-400 pb-2">
                  <Lock className="text-gray-400 mr-2" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-transparent outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[70%] mx-auto mt-10 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg shadow-lg"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
            <div className="flex justify-between mt-4 text-sm">

              {loginType === "admin" && (
                < button
                  type="button"
                  onClick={() => navigate("/register-admin")}
                  className="text-green-600 cursor-pointer"
                >
                  New Register
                </button>
              )}

              <button
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 cursor-pointer"
              >
                Forgot Password?
              </button>

            </div>
            <div className="text-center mt-2">
              <h4 className="text-xl font-bold mb-2">
                Student Mangement System
              </h4>

              <p className="text-gray-600 text-sm px-4">
                Manage Students, Teachers, Attendance, Exams and more with one powerful dashboard.
              </p>

              <p className="text-sm text-black">
                © 2026 E-GyanPath. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;