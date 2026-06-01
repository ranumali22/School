// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   FloatingInput,
//   FloatingSelect,
//   FloatingInputs,
//   ClassSelect,
// } from "../../Component/common/FloatingInput";
// import {
//   showSuccess,
//   showError,
//   handleApiResponse,
// } from "../../Component/common/alert";

// import { localurl } from "../../api/api";
// import { CommonInput } from "../../Component/common/CommonInput";

// const StaffAdd = ({ setEmployees, setShowForm, employee: propEmployee }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Support both props and navigation state
//   const employee = propEmployee || location.state?.employee || location.state?.staff;

//   const [employeeFormData, setEmployeeFormData] = useState({
//     employeePhoto: "",
//     employeeFullName: "",
//     fatherName: "",
//     motherName: "",
//     dob: "",
//     gender: "",
//     email: "",
//     mobileNumber: "",
//     alternateNumber: "",
//     department: "",
//     maritalStatus: "",
//     qualification: "",
//     experience: "",
//     reference: "",
//     currentAddress: "",
//     currentCity: "",
//     currentState: "",
//     currentPincode: "",
//     permanentAddress: "",
//     permanentCity: "",
//     permanentState: "",
//     permanentPincode: "",
//     religion: "",
//     category: "",
//     nationality: "",
//     employee_id: "",
//     loginId: "",
//     password: "",
//   });

//   const [departments, setDepartments] = useState([]);
//   const [genders, setGenders] = useState([]);
//   const [religions, setReligions] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [nationalities, setNationalities] = useState([]);
//   const [loginId, setLoginId] = useState([]);
//   const [studentFormData, setStudentFormData] = useState({});

//   const [selectedFile, setSelectedFile] = useState(null);
//   // State to track upload success

//   const handlePhotoUpload = (e) => {
//     const file = e.target.files[0];

//     if (file) {
//       setSelectedFile(file);
//       setStudentFormData((prev) => ({
//         ...prev,
//         photoName: file.name,
//       }));
//     }
//   };

//   const changeInputHandle = (e) => {
//     const { name, value, files } = e.target;

//     if (files) {
//       setEmployeeFormData((prev) => ({
//         ...prev,
//         [name]: URL.createObjectURL(files[0]),
//       }));
//     } else {
//       setEmployeeFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const [showDetails, setShowDetails] = useState(null);

//   const toggleDetails = (index) => {
//     setShowDetails((prevIndex) => (prevIndex === index ? null : index));
//   };

//   const dob = employeeFormData.dob;
//   let password = "";

//   if (dob && typeof dob === "string") {
//     const onlyDate = dob.split("T")[0]; // 🔥 safe fix

//     const [year, month, day] = onlyDate.split("-");

//     password = day + month + year; // ✅ ddmmyyyy
//   }

//   const isEdit = employee && employee.employee_id;

//   const handleSubmit = () => {


//     if (!employeeFormData.employeeFullName) {
//       showError("Employee Name required");
//       return;
//     }

//     const formData = new FormData();

//     // 👇 normal fields
//     formData.append("employeeFullName", employeeFormData.employeeFullName);
//     formData.append("fatherName", employeeFormData.fatherName);
//     formData.append("motherName", employeeFormData.motherName);

//     // 🔥 Safety Check for DOB split
//     formData.append(
//       "dob",
//       employeeFormData.dob && typeof employeeFormData.dob === "string" && employeeFormData.dob.includes("/")
//         ? employeeFormData.dob.split("/").reverse().join("-")
//         : employeeFormData.dob || ""
//     );

//     formData.append("gender", employeeFormData.gender);
//     formData.append("email", employeeFormData.email);
//     formData.append("mobileNumber", employeeFormData.mobileNumber);
//     formData.append("alternateNumber", employeeFormData.alternateNumber);
//     formData.append("department", employeeFormData.department);
//     formData.append("maritalStatus", employeeFormData.maritalStatus);

//     formData.append("qualification", employeeFormData.qualification);
//     formData.append("experience", employeeFormData.experience);
//     formData.append("reference", employeeFormData.reference);
//     formData.append("category", employeeFormData.category);
//     formData.append("nationality", employeeFormData.nationality);

//     formData.append("religion", employeeFormData.religion);

//     formData.append("currentAddress", employeeFormData.currentAddress);
//     formData.append("currentCity", employeeFormData.currentCity);
//     formData.append("currentState", employeeFormData.currentState);
//     formData.append("currentPincode", employeeFormData.currentPincode);

//     formData.append("permanentAddress", employeeFormData.permanentAddress);
//     formData.append("permanentCity", employeeFormData.permanentCity);
//     formData.append("permanentState", employeeFormData.permanentState);
//     formData.append("permanentPincode", employeeFormData.permanentPincode);

//     formData.append("loginId", employeeFormData.employee_id);
//     formData.append("employee_id", employeeFormData.employee_id);
//     formData.append("password", password);

//     formData.append("school_id", localStorage.getItem("school_id"));
//     formData.append("session_id", localStorage.getItem("session_id"));



//     if (selectedFile) {
//       formData.append("employeePhoto", selectedFile);
//     }

//     const url = isEdit
//       ? localurl + `update_employee/${employee.id}`
//       : localurl + "add_employee";

//     fetch(url, {
//       method: isEdit ? "PUT" : "POST",
//       body: formData,
//     })
//       .then(async (res) => {
//         const text = await res.text();

//         try {
//           return JSON.parse(text);
//         } catch (e) {
//           console.error("❌ NOT JSON RESPONSE:", text);
//           throw new Error("Server returned HTML (check backend)");
//         }
//       })
//       .then((data) => {
//         if (data.success) {
//           showSuccess(isEdit ? data.message : data.message);
//           const school_id = localStorage.getItem("school_id");
//           const session_id = localStorage.getItem("session_id");
//           fetch(localurl + `employee/${school_id}/${session_id}`)
//             .then(async (res) => {
//               const text = await res.text();

//               try {
//                 return JSON.parse(text);
//               } catch (e) {
//                 console.error("❌ NOT JSON RESPONSE:", text);
//                 throw new Error("Server returned HTML (check backend)");
//               }
//             })
//             .then((d) => {
//               if (setEmployees) setEmployees(d.row);
//             });

//           if (setShowForm) {
//             setShowForm(false);
//           } else {
//             navigate(-1);
//           }
//         } else {
//           showError(data.message || "Error ❌");
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         showError("Server Error ❌");
//       });
//   };

//   useEffect(() => {
//     if (employee) {
//       setEmployeeFormData(employee);
//     } else {
//       // 🔥 ADD MODE → RESET FORM
//       setEmployeeFormData({
//         employeePhoto: "",
//         employeeFullName: "",
//         fatherName: "",
//         motherName: "",
//         dob: "",
//         gender: "",
//         email: "",
//         mobileNumber: "",
//         alternateNumber: "",
//         department: "",
//         maritalStatus: "",
//         qualification: "",
//         experience: "",
//         reference: "",
//         currentAddress: "",
//         currentCity: "",
//         currentState: "",
//         currentPincode: "",
//         permanentAddress: "",
//         permanentCity: "",
//         permanentState: "",
//         permanentPincode: "",
//         religion: "",
//         category: "",
//         nationality: "",
//         employee_id: "",
//         loginId: "",
//         password: "",
//       });
//     }
//   }, [employee]);

//   const getdepartment = (school_id) => {
//     const requestOptions = {
//       method: "GET",
//       redirect: "follow",
//     };

//     fetch(localurl + "department/" + school_id, requestOptions)
//       .then((response) => response.text())
//       .then((result) => {
//         const { success, row } = JSON.parse(result);
//         if (success) {
//           setDepartments(row);
//         }
//       })
//       .catch((data) => handleApiResponse(data));
//   };

//   const getGender = (school_id) => {
//     fetch(localurl + "gender/" + school_id)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setGenders(data.row);
//         console.log("gender data", data);
//       });
//   };

//   const getReligion = (school_id) => {
//     fetch(localurl + "religion/" + school_id)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setReligions(data.row);
//       });
//   };

//   const getCategory = (school_id) => {
//     fetch(localurl + "category/" + school_id)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setCategories(data.row);
//       });
//   };

//   const getNationality = (school_id) => {
//     fetch(localurl + "nationality/" + school_id)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setNationalities(data.row);
//       });
//   };

//   useEffect(() => {
//     const school_id = localStorage.getItem("school_id");

//     if (school_id) {
//       getGender(school_id);
//       getReligion(school_id);
//       getCategory(school_id);
//       getNationality(school_id);
//       getdepartment(school_id);
//     }
//   }, []);

//   return (
//     <div
//       className="shadow-xl p-6 rounded-3xl max-w-full bg-white border-[#055294] border-opacity-15 overflow-clip"
//     >
//       <div className="space-y-12">

//         {isEdit ? (
//           <div>
//             <h1>Update Staff</h1>
//           </div>
//         ) : (
//           <div>
//             <h1>Add New Staff</h1>
//           </div>
//         )}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           <FloatingInput
//             label="Employee Name"
//             name="employeeFullName"
//             value={employeeFormData.employeeFullName}
//             onChange={changeInputHandle}
//           />
//           {/* father name */}
//           <FloatingInputs
//             label="Father Name"
//             name="fatherName"
//             value={employeeFormData.fatherName}
//             onChange={changeInputHandle}
//           />
//           <FloatingInputs
//             label="Mother Name"
//             name="motherName"
//             value={employeeFormData.motherName}
//             onChange={changeInputHandle}
//           />
//           <CommonInput
//             label="Mobile Number"
//             name="mobileNumber"
//             value={employeeFormData.mobileNumber}
//             onChange={changeInputHandle}
//           />
//           {/* </div> */}

//           <CommonInput
//             label="Alternate Number"
//             name="alternateNumber"
//             value={employeeFormData.alternateNumber}
//             onChange={changeInputHandle}
//           />

//           <CommonInput
//             label="Email"
//             name="email"
//             value={employeeFormData.email}
//             onChange={changeInputHandle}
//           />
//           <FloatingInputs
//             label="DOB"
//             name="dob"
//             type="date"
//             value={employeeFormData.dob}
//             onChange={changeInputHandle}
//           />
//           <ClassSelect
//             label="Department"
//             name="department"
//             value={employeeFormData.department || ""}
//             onChange={changeInputHandle}
//             options={[
//               { label: "---Select Department---", value: "" },
//               ...departments
//                 .filter((d) => d.status === "Active")
//                 .sort((a, b) => {
//                   const diff = (a.display_order || 0) - (b.display_order || 0);
//                   if (diff === 0) {
//                     const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
//                     const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
//                     return String(nameA).localeCompare(String(nameB));
//                   }
//                   return diff;
//                 })
//                 .map((d) => ({
//                   label: d.department_name,
//                   value: d.id,
//                 })),
//             ]}
//           />
//           <ClassSelect
//             label="Gender"
//             name="gender"
//             value={employeeFormData.gender || ""}
//             onChange={changeInputHandle}
//             options={[
//               { label: "---Select Gender---", value: "" },
//               ...genders
//                 .filter((g) => g.status === "Active")
//                 .sort((a, b) => {
//                   const diff = (a.display_order || 0) - (b.display_order || 0);
//                   if (diff === 0) {
//                     const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
//                     const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
//                     return String(nameA).localeCompare(String(nameB));
//                   }
//                   return diff;
//                 })
//                 .map((g) => ({
//                   label: g.gender,
//                   value: g.id,
//                 })),
//             ]}
//           />
//           <FloatingSelect
//             label="Marital Status"
//             name="maritalStatus"
//             value={
//               employeeFormData.maritalStatus || "---Select Marital Status---"
//             }
//             onChange={changeInputHandle}
//             options={["----Select Marital Status----", "Married", "Unmarried"]}
//           />

//           <ClassSelect
//             label="Religion"
//             name="religion"
//             value={employeeFormData.religion || ""}
//             onChange={changeInputHandle}
//             options={[
//               { label: "---Select Religion---", value: "" },
//               ...religions
//                 .filter((r) => r.status === "Active")
//                 .sort((a, b) => {
//                   const diff = (a.display_order || 0) - (b.display_order || 0);
//                   if (diff === 0) {
//                     const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
//                     const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
//                     return String(nameA).localeCompare(String(nameB));
//                   }
//                   return diff;
//                 })
//                 .map((r) => ({
//                   label: r.religion,
//                   value: r.id,
//                 })),
//             ]}
//           />
//           <ClassSelect
//             label="Category"
//             name="category"
//             value={employeeFormData.category || ""}
//             onChange={changeInputHandle}
//             options={[
//               { label: "---Select Category---", value: "" },
//               ...categories
//                 .filter((c) => c.status === "Active")
//                 .sort((a, b) => {
//                   const diff = (a.display_order || 0) - (b.display_order || 0);
//                   if (diff === 0) {
//                     const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
//                     const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
//                     return String(nameA).localeCompare(String(nameB));
//                   }
//                   return diff;
//                 })
//                 .map((c) => ({
//                   label: c.category,
//                   value: c.id,
//                 })),
//             ]}
//           />
//           <ClassSelect
//             label="Nationality"
//             name="nationality"
//             value={employeeFormData.nationality || ""}
//             onChange={changeInputHandle}
//             options={[
//               { label: "---Select Nationality---", value: "" },
//               ...nationalities
//                 .filter((n) => n.status === "Active")
//                 .sort((a, b) => {
//                   const diff = (a.display_order || 0) - (b.display_order || 0);
//                   if (diff === 0) {
//                     const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
//                     const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
//                     return String(nameA).localeCompare(String(nameB));
//                   }
//                   return diff;
//                 })
//                 .map((n) => ({
//                   label: n.nationality,
//                   value: n.id,
//                 })),
//             ]}
//           />

//           <FloatingInputs
//             label=" Profile Photo"
//             type="file"
//             accept="image/*"
//             onChange={handlePhotoUpload}
//           />
//         </div>

//         {/* education  */}
//         <div>
//           <h2>Education Details</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
//             <FloatingInputs
//               label="Qualification"
//               name="qualification"
//               value={employeeFormData.qualification}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="Experience"
//               name="experience"
//               value={employeeFormData.experience}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="Reference"
//               name="reference"
//               value={employeeFormData.reference}
//               onChange={changeInputHandle}
//             />
//           </div>
//         </div>
//         {/* current address */}
//         <div>
//           <div
//             className="border-b-2 border-[#0860C4] sm:col-span-5 text-xl font-bold  flex justify-between items-center cursor-pointer"
//             onClick={() => toggleDetails(2)}
//           >
//             <h2>Current Address</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
//             <FloatingInputs
//               label="Address"
//               name="currentAddress"
//               value={employeeFormData.currentAddress}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="City"
//               name="currentCity"
//               value={employeeFormData.currentCity}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="State"
//               name="currentState"
//               value={employeeFormData.currentState}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="Pincode"
//               name="currentPincode"
//               value={employeeFormData.currentPincode}
//               onChange={(e) => {
//                 let value = e.target.value;
//                 if (/^\d{0,6}$/.test(value)) {
//                   changeInputHandle(e);
//                 }
//               }}
//             />
//           </div>
//         </div>
//         {/* Parmanent address */}
//         <div>
//           <div
//             className="border-b-2 border-[#0860C4] text-xl font-bold  flex justify-between items-center cursor-pointer"
//             onClick={() => toggleDetails(3)}
//           >
//             <h2>Permanent Address</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
//             <FloatingInputs
//               label="Address"
//               name="permanentAddress"
//               value={employeeFormData.permanentAddress}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="City"
//               name="permanentCity"
//               value={employeeFormData.permanentCity}
//               onChange={changeInputHandle}
//             />

//             <FloatingInputs
//               label="State"
//               name="permanentState"
//               value={employeeFormData.permanentState}
//               onChange={changeInputHandle}
//             />
//             {/* <FloatingInputs
//               label="Pin code"
//               type="Number"
//               name="permanentPincode"
//               value={employeeFormData.permanentPincode}
//               onChange={changeInputHandle}
//             /> */}
//             <FloatingInputs
//               label="Pin code"
//               type="text"
//               name="permanentPincode"
//               value={employeeFormData.permanentPincode}
//               onChange={(e) => {
//                 let value = e.target.value;
//                 if (/^\d{0,6}$/.test(value)) {
//                   changeInputHandle(e);
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </div>
//       <div className="flex flex-col sm:flex-row gap-3 mt-6">
//         {isEdit ? (
//           <>
//             <button
//               onClick={() => handleSubmit()}
//               className="bg-purple-600 text-white px-6 py-2 rounded"
//             >
//               Update
//             </button>

//             <button
//               onClick={() => {
//                 if (setShowForm) setShowForm(false);
//                 else navigate(-1);
//               }}
//               className="bg-gray-500 text-white px-6 py-2 rounded"
//             >
//               Cancel
//             </button>
//           </>
//         ) : (
//           <>
//             <button
//               onClick={() => handleSubmit("continue")}
//               className="bg-green-600 text-white px-6 py-2 rounded"
//             >
//               Save & Continue
//             </button>

//             <button
//               onClick={() => handleSubmit("exit")}
//               className="bg-purple-600 text-white px-6 py-2 rounded"
//             >
//               Save & Exit
//             </button>

//             <button
//               onClick={() => {
//                 if (setShowForm) setShowForm(false);
//                 else navigate(-1);
//               }}
//               className="bg-gray-500 text-white px-6 py-2 rounded"
//             >
//               Cancel
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };
// export default StaffAdd;




import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FloatingInput,
  FloatingSelect,
  FloatingInputs,
  ClassSelect,
} from "../../Component/common/FloatingInput";
import {
  showSuccess,
  showError,
  handleApiResponse,
} from "../../Component/common/alert";

import { useEffect } from "react";
import { localurl } from "../../api/api";
import { CommonInput } from "../../Component/common/CommonInput";

const StaffAdd = ({ setEmployees, setShowForm, employee }) => {
  const [employeeFormData, setEmployeeFormData] = useState({
    employeePhoto: "",
    employeeFullName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    email: "",
    mobileNumber: "",
    alternateNumber: "",
    department: "",
    maritalStatus: "",
    qualification: "",
    experience: "",
    reference: "",
    currentAddress: "",
    currentCity: "",
    currentState: "",
    currentPincode: "",
    permanentAddress: "",
    permanentCity: "",
    permanentState: "",
    permanentPincode: "",
    religion: "",
    category: "",
    nationality: "",
    employee_id: "",
    loginId: "",
    password: "",
  });

  const [departments, setDepartments] = useState([]);
  const [genders, setGenders] = useState([]);
  const [religions, setReligions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [loginId, setLoginId] = useState([]);
  const [studentFormData, setStudentFormData] = useState({});
  const [errors, setErrors] = useState({});

  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  // State to track upload success

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setStudentFormData((prev) => ({
        ...prev,
        photoName: file.name,
      }));
    }
  };

  const changeInputHandle = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setEmployeeFormData((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(files[0]),
      }));
    } else {
      setEmployeeFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const [showDetails, setShowDetails] = useState(null);

  const toggleDetails = (index) => {
    setShowDetails((prevIndex) => (prevIndex === index ? null : index));
  };

  const dob = employeeFormData.dob;
  let password = "";

  if (dob) {
    const onlyDate = dob.split("T")[0]; // 🔥 safe fix

    const [year, month, day] = onlyDate.split("-");

    password = day + month + year; // ✅ ddmmyyyy
  }

  const isEdit = employee && employee.employee_id;

  const handleSubmit = (action) => {


    if (!employeeFormData.employeeFullName) {
      setErrors({
        employeeFullName: "Required",
      });
      showError("Employee Name required");
      return;
    }

    const formData = new FormData();

    // 👇 normal fields
    formData.append("employeeFullName", employeeFormData.employeeFullName);
    formData.append("fatherName", employeeFormData.fatherName);
    formData.append("motherName", employeeFormData.motherName);
    formData.append("dob", employeeFormData.dob);

    formData.append("gender", employeeFormData.gender);
    formData.append("email", employeeFormData.email);
    formData.append("mobileNumber", employeeFormData.mobileNumber);
    formData.append("alternateNumber", employeeFormData.alternateNumber);
    formData.append("department", employeeFormData.department);
    formData.append("maritalStatus", employeeFormData.maritalStatus);

    formData.append("qualification", employeeFormData.qualification);
    formData.append("experience", employeeFormData.experience);
    formData.append("reference", employeeFormData.reference);
    formData.append("category", employeeFormData.category);
    formData.append("nationality", employeeFormData.nationality);

    formData.append("religion", employeeFormData.religion);

    formData.append("currentAddress", employeeFormData.currentAddress);
    formData.append("currentCity", employeeFormData.currentCity);
    formData.append("currentState", employeeFormData.currentState);
    formData.append("currentPincode", employeeFormData.currentPincode);

    formData.append("permanentAddress", employeeFormData.permanentAddress);
    formData.append("permanentCity", employeeFormData.permanentCity);
    formData.append("permanentState", employeeFormData.permanentState);
    formData.append("permanentPincode", employeeFormData.permanentPincode);

    formData.append("loginId", employeeFormData.employee_id);
    formData.append("employee_id", employeeFormData.employee_id);
    formData.append("password", password);

    formData.append("school_id", localStorage.getItem("school_id"));
    formData.append("session_id", localStorage.getItem("session_id"));



    if (selectedFile) {
      formData.append("employeePhoto", selectedFile);
    }

    const url = isEdit
      ? localurl + `update_employee/${employee.id}`
      : localurl + "add_employee";

    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      body: formData,
    })
      .then(async (res) => {
        const text = await res.text();

        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("❌ NOT JSON RESPONSE:", text);
          throw new Error("Server returned HTML (check backend)");
        }
      })
      .then((data) => {
        if (data.success) {
          showSuccess(isEdit ? data.message : data.message);
          const school_id = localStorage.getItem("school_id");
          const session_id = localStorage.getItem("session_id");
          fetch(localurl + `employee/${school_id}/${session_id}`)
            .then(async (res) => {
              const text = await res.text();

              try {
                return JSON.parse(text);
              } catch (e) {
                console.error("❌ NOT JSON RESPONSE:", text);
                throw new Error("Server returned HTML (check backend)");
              }
            })
            .then((d) => setEmployees(d.row));

          if (isEdit) {
            if (setShowForm) setShowForm(false);
            else navigate(-1);
          } else if (action === "exit") {
            if (setShowForm) setShowForm(false);
            else navigate(-1);
          } else {
            setEmployeeFormData({
              employeePhoto: "",
              employeeFullName: "",
              fatherName: "",
              motherName: "",
              dob: "",
              gender: "",
              email: "",
              mobileNumber: "",
              alternateNumber: "",
              department: "",
              maritalStatus: "",
              qualification: "",
              experience: "",
              reference: "",
              currentAddress: "",
              currentCity: "",
              currentState: "",
              currentPincode: "",
              permanentAddress: "",
              permanentCity: "",
              permanentState: "",
              permanentPincode: "",
              religion: "",
              category: "",
              nationality: "",
              employee_id: "",
              loginId: "",
              password: "",
            });
            setSelectedFile(null);
            setErrors({});
          }
        } else {
          showError(data.message || "Error ❌");
        }
      })
      .catch((err) => {
        console.error(err);
        showError("Server Error ❌");
      });
  };

  useEffect(() => {
    if (employee) {
      setEmployeeFormData(employee);
    } else {
      // 🔥 ADD MODE → RESET FORM
      setEmployeeFormData({
        employeePhoto: "",
        employeeFullName: "",
        fatherName: "",
        motherName: "",
        dob: "",
        gender: "",
        email: "",
        mobileNumber: "",
        alternateNumber: "",
        department: "",
        maritalStatus: "",
        qualification: "",
        experience: "",
        reference: "",
        currentAddress: "",
        currentCity: "",
        currentState: "",
        currentPincode: "",
        permanentAddress: "",
        permanentCity: "",
        permanentState: "",
        permanentPincode: "",
        religion: "",
        category: "",
        nationality: "",
        employee_id: "",
        loginId: "",
        password: "",
      });
    }
  }, [employee]);

  const getdepartment = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "department/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const { success, row } = JSON.parse(result);
        if (success) {
          setDepartments(row);
        }
      })
      .catch((data) => handleApiResponse(data));
  };

  const getGender = (school_id) => {
    fetch(localurl + "gender/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGenders(data.row);
        console.log("gender data", data);
      });
  };

  const getReligion = (school_id) => {
    fetch(localurl + "religion/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReligions(data.row);
      });
  };

  const getCategory = (school_id) => {
    fetch(localurl + "category/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.row);
      });
  };

  const getNationality = (school_id) => {
    fetch(localurl + "nationality/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNationalities(data.row);
      });
  };

  useEffect(() => {
    const school_id = localStorage.getItem("school_id");

    if (school_id) {
      getGender(school_id);
      getReligion(school_id);
      getCategory(school_id);
      getNationality(school_id);
      getdepartment(school_id);
    }
  }, []);

  return (
    <div
      className="shadow-xl p-6 rounded-3xl max-w-full bg-white border-[#055294] border-opacity-15 overflow-clip"
    >
      <div className="space-y-12">

        {isEdit ? (
          <div>
            <h1 className="text-md sm:text-xl md:text-3xl font-bold">
              Update Staff
            </h1>
          </div>
        ) : (
          <div>
            <h1 className="text-md sm:text-xl md:text-3xl font-bold">
              Add New Staff
            </h1>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <FloatingInput
            label={<>Employee Name <span className="text-red-500">*</span></>}
            name="employeeFullName"
            value={employeeFormData.employeeFullName}
            onChange={changeInputHandle}
            error={errors.employeeFullName}
          />
          {/* father name */}
          <FloatingInputs
            label="Father Name"
            name="fatherName"
            value={employeeFormData.fatherName}
            onChange={changeInputHandle}
          />
          <FloatingInputs
            label="Mother Name"
            name="motherName"
            value={employeeFormData.motherName}
            onChange={changeInputHandle}
          />
          <CommonInput
            label="Mobile Number"
            name="mobileNumber"
            value={employeeFormData.mobileNumber}
            onChange={changeInputHandle}
          />
          {/* </div> */}

          <CommonInput
            label="Alternate Number"
            name="alternateNumber"
            value={employeeFormData.alternateNumber}
            onChange={changeInputHandle}
          />

          <CommonInput
            label="Email"
            name="email"
            value={employeeFormData.email}
            onChange={changeInputHandle}
          />
          <FloatingInputs
            label="DOB"
            name="dob"
            type="date"
            value={employeeFormData.dob}
            onChange={changeInputHandle}
          />
          <ClassSelect
            label="Department"
            name="department"
            value={employeeFormData.department || ""}
            onChange={changeInputHandle}
            options={[
              { label: "---Select Department---", value: "" },
              ...departments
                .filter((d) => d.status === "Active")
                .sort((a, b) => {
                  const diff = (a.display_order || 0) - (b.display_order || 0);
                  if (diff === 0) {
                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                    return String(nameA).localeCompare(String(nameB));
                  }
                  return diff;
                })
                .map((d) => ({
                  label: d.department_name,
                  value: d.id,
                })),
            ]}
          />
          <ClassSelect
            label="Gender"
            name="gender"
            value={employeeFormData.gender || ""}
            onChange={changeInputHandle}
            options={[
              { label: "---Select Gender---", value: "" },
              ...genders
                .filter((g) => g.status === "Active")
                .sort((a, b) => {
                  const diff = (a.display_order || 0) - (b.display_order || 0);
                  if (diff === 0) {
                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                    return String(nameA).localeCompare(String(nameB));
                  }
                  return diff;
                })
                .map((g) => ({
                  label: g.gender,
                  value: g.id,
                })),
            ]}
          />
          <FloatingSelect
            label="Marital Status"
            name="maritalStatus"
            value={
              employeeFormData.maritalStatus || "---Select Marital Status---"
            }
            onChange={changeInputHandle}
            options={["----Select Marital Status----", "Married", "Unmarried"]}
          />

          <ClassSelect
            label="Religion"
            name="religion"
            value={employeeFormData.religion || ""}
            onChange={changeInputHandle}
            options={[
              { label: "---Select Religion---", value: "" },
              ...religions
                .filter((r) => r.status === "Active")
                .sort((a, b) => {
                  const diff = (a.display_order || 0) - (b.display_order || 0);
                  if (diff === 0) {
                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                    return String(nameA).localeCompare(String(nameB));
                  }
                  return diff;
                })
                .map((r) => ({
                  label: r.religion,
                  value: r.id,
                })),
            ]}
          />
          <ClassSelect
            label="Category"
            name="category"
            value={employeeFormData.category || ""}
            onChange={changeInputHandle}
            options={[
              { label: "---Select Category---", value: "" },
              ...categories
                .filter((c) => c.status === "Active")
                .sort((a, b) => {
                  const diff = (a.display_order || 0) - (b.display_order || 0);
                  if (diff === 0) {
                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                    return String(nameA).localeCompare(String(nameB));
                  }
                  return diff;
                })
                .map((c) => ({
                  label: c.category,
                  value: c.id,
                })),
            ]}
          />
          <ClassSelect
            label="Nationality"
            name="nationality"
            value={employeeFormData.nationality || ""}
            onChange={changeInputHandle}
            options={[
              { label: "---Select Nationality---", value: "" },
              ...nationalities
                .filter((n) => n.status === "Active")
                .sort((a, b) => {
                  const diff = (a.display_order || 0) - (b.display_order || 0);
                  if (diff === 0) {
                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                    return String(nameA).localeCompare(String(nameB));
                  }
                  return diff;
                })
                .map((n) => ({
                  label: n.nationality,
                  value: n.id,
                })),
            ]}
          />

          {/* <FloatingInputs
            label=" Profile Photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
          /> */}

          <div className="flex flex-col gap-2">
            <FloatingInputs
              label="Profile Photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />

            {(selectedFile || employee?.employeePhoto) && (
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : `${localurl.replace("/api/", "")}/uploads/employee/${employee?.employeePhoto}`
                }
                alt="Employee Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
              />
            )}
          </div>
        </div>

        {/* education  */}
        <div>
          <div className="border-b-2 border-[#0860C4]  text-xl font-bold flex justify-between items-center cursor-pointer">
            <h2>Education Details</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
            <FloatingInputs
              label="Qualification"
              name="qualification"
              value={employeeFormData.qualification}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Experience"
              name="experience"
              value={employeeFormData.experience}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Reference"
              name="reference"
              value={employeeFormData.reference}
              onChange={changeInputHandle}
            />
          </div>
        </div>
        {/* current address */}
        <div>
          <div
            className="border-b-2 border-[#0860C4] sm:col-span-5 text-xl font-bold  flex justify-between items-center cursor-pointer"
            onClick={() => toggleDetails(2)}
          >
            <h2>Current Address</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            <FloatingInputs
              label="Address"
              name="currentAddress"
              value={employeeFormData.currentAddress}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="City"
              name="currentCity"
              value={employeeFormData.currentCity}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="State"
              name="currentState"
              value={employeeFormData.currentState}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Pincode"
              name="currentPincode"
              value={employeeFormData.currentPincode}
              onChange={(e) => {
                let value = e.target.value;
                if (/^\d{0,6}$/.test(value)) {
                  changeInputHandle(e);
                }
              }}
            />
          </div>
        </div>
        {/* Parmanent address */}
        <div>
          <div
            className="border-b-2 border-[#0860C4] text-xl font-bold  flex justify-between items-center cursor-pointer"
            onClick={() => toggleDetails(3)}
          >
            <h2>Parmanent Address</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            <FloatingInputs
              label="Address"
              name="permanentAddress"
              value={employeeFormData.permanentAddress}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="City"
              name="permanentCity"
              value={employeeFormData.permanentCity}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="State"
              name="permanentState"
              value={employeeFormData.permanentState}
              onChange={changeInputHandle}
            />
            {/* <FloatingInputs
              label="Pin code"
              type="Number"
              name="permanentPincode"
              value={employeeFormData.permanentPincode}
              onChange={changeInputHandle}
            /> */}
            <FloatingInputs
              label="Pin code"
              type="text"
              name="permanentPincode"
              value={employeeFormData.permanentPincode}
              onChange={(e) => {
                let value = e.target.value;
                if (/^\d{0,6}$/.test(value)) {
                  changeInputHandle(e);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {isEdit ? (
          <>
            <button
              onClick={() => handleSubmit()}
              className="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Update
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSubmit("continue")}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Save & Continue
            </button>

            <button
              onClick={() => handleSubmit("exit")}
              className="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Save & Exit
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};
export default StaffAdd;
