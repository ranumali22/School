// import { useState } from "react";
// import { change_password_school } from "../../Api";
// import { showError, showSuccess } from "../../Component/common/alert";

// const ChangePasswordModal = ({ onClose }) => {
//   const [form, setForm] = useState({
//     oldPass: "",
//     newPass: "",
//     confirmPass: "",
//   });

//   const [error, setError] = useState("");
//   const [show, setShow] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };


//   const handleChangePassword = async () => {
//     try {
//       setLoading(true);

//       const admin = JSON.parse(localStorage.getItem("authData"));

//       const payload = {
//         password: form.oldPass,
//         password1: form.newPass,
//         password2: form.confirmPass,
//       };

//       const response = await change_password_school(admin.id, payload);

//       if (response?.data?.success === true) {
//         showSuccess(response?.data?.message); 
//         onClose();
//       } else {
//         showError(response?.data?.message); 
//       }
//     } catch (err) {
//       console.log(err);

//       showError(
//         err?.response?.data?.message, 
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-xl shadow w-[350px] relative">
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-3 text-gray-500 text-lg"
//         >
//           ✖
//         </button>

//         <h2 className="text-xl font-bold mb-4 text-center">Change Password</h2>

//         {/* {error && (
//           <p className="text-red-500 text-sm text-center mb-3">
//             {error}
//           </p>
//         )} */}

//         <input
//           type={show ? "text" : "password"}
//           name="oldPass"
//           placeholder="Old Password"
//           className="w-full border p-2 mb-3 rounded"
//           onChange={handleChange}
//         />

//         <input
//           type={show ? "text" : "password"}
//           name="newPass"
//           placeholder="New Password"
//           className="w-full border p-2 mb-3 rounded"
//           onChange={handleChange}
//         />

//         <input
//           type={show ? "text" : "password"}
//           name="confirmPass"
//           placeholder="Confirm Password"
//           className="w-full border p-2 mb-3 rounded"
//           onChange={handleChange}
//         />

//         <div className="flex items-center gap-2 mb-3">
//           <input type="checkbox" onChange={() => setShow(!show)} />
//           <span className="text-sm">Show Password</span>
//         </div>

//         <button
//           onClick={handleChangePassword}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 rounded"
//         >
//           {loading ? "Updating..." : "Update Password"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChangePasswordModal;


import { useState } from "react";
import { change_password_school } from "../../Api";
import { showError, showSuccess } from "../../Component/common/alert";
import { useNavigate } from "react-router-dom";

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleChangePassword = async () => {
  //   setError("");

  //   if (!form.oldPass || !form.newPass || !form.confirmPass) {
  //     setError("All fields are required ❌");
  //     return;
  //   }

  //   if (form.newPass !== form.confirmPass) {
  //     setError("Passwords do not match ❌");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const admin = JSON.parse(localStorage.getItem("authData"));

  //     const payload = {
  //       password: form.oldPass,
  //       password1: form.newPass,
  //       password2: form.confirmPass,
  //     };

  //     // await change_password_school(admin.id, payload);

  //     // alert("Password Changed Successfully ✅");
  //     // onClose();

  //     const response = await change_password_school(admin.id, payload);

  //     if (response?.data?.status === true) {
  //       alert(response.data.message || "Password Changed Successfully ✅");
  //       onClose();
  //     } else {
  //       setError(response?.data?.message || "Old password incorrect ❌");
  //     }
  //   } catch (err) {
  //     console.log(err);

  //     setError(
  //       err?.response?.data?.message ||
  //       "Password change failed ❌"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      const admin = JSON.parse(localStorage.getItem("authData"));

      const payload = {
        password: form.oldPass,
        password1: form.newPass,
        password2: form.confirmPass,
      };

      const response = await change_password_school(admin.id, payload);

      if (response?.data?.success === true) {
        showSuccess(response?.data?.message);
        localStorage.removeItem("authData");
        sessionStorage.clear();

        navigate("/", { replace: true });
      } else {
        showError(response?.data?.message);
      }
    } catch (err) {
      console.log(err);

      showError(
        err?.response?.data?.message,
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow w-[350px] relative">

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 text-lg"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          Change Password
        </h2>

        {/* {error && (
          <p className="text-red-500 text-sm text-center mb-3">
            {error}
          </p>
        )} */}

        <input
          type={show ? "text" : "password"}
          name="oldPass"
          placeholder="Old Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
        />

        <input
          type={show ? "text" : "password"}
          name="newPass"
          placeholder="New Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
        />

        <input
          type={show ? "text" : "password"}
          name="confirmPass"
          placeholder="Confirm Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
        />

        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" onChange={() => setShow(!show)} />
          <span className="text-sm">Show Password</span>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </div>
    </div>
  );
};

export default ChangePasswordModal;