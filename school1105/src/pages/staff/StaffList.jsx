import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RiEdit2Fill, RiKey2Fill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { MdToggleOn } from "react-icons/md";
import { MdToggleOff } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import StaffAdd from "../staff/StaffAdd";
import BankForm from "../staff/BankForm";
import IdentityForm from "../staff/IdentityForm";
import SalaryForm from "../staff/SalaryForm";
import { FaSignInAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { localurl } from "../../api/api";
const imageBase = localurl.replace("/api", "");
import {
  showSuccess,
  showError,
  handleApiResponse,
} from "../../Component/common/alert";

const getStoredSchool = () => {
  try {
    return JSON.parse(
      localStorage.getItem("school") || localStorage.getItem("authData") || "{}",
    );
  } catch {
    return {};
  }
};

const getUploadUrl = (path, folder = "") => {
  if (!path) return "";
  const value = String(path);
  if (value.startsWith("data:") || value.startsWith("http") || value.startsWith("blob:")) {
    return value;
  }

  const cleanPath = value.replace(/^\/+/, "");
  if (cleanPath.startsWith("uploads/")) {
    return `${imageBase}${cleanPath}`;
  }

  return `${imageBase}uploads/${folder}${cleanPath}`;
};

const formatDate = (date) => {
  if (!date || date.includes("1899") || date.startsWith("0000")) return "";
  if (date.includes("T")) {
    date = date.split("T")[0];
  }
  return date.split("-").reverse().join("-");
};



function StaffList() {
  const [active, setActive] = useState({});
  const [employees, setEmployees] = useState([]);
  const [showPassword, setShowPassword] = useState({});
  const [activeForm, setActiveForm] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    currentData: paginatedEmployees,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(employees, 10);

  const openForm = (type, employee) => {
    setSelectedEmployee(employee);
    setActiveForm(type);
  };

  const closeForm = () => {
    setActiveForm(null);
    setSelectedEmployee(null);
  };

  const toggle = (id) => {
    setActive((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the specific item
    }));
  };

  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState({});

  const toggleView = (id) => {
    setActiveView((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the specific item
    }));
  };

  const togglePassword = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedData = [...employees].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setEmployees(sortedData);
  };

  const getEmployees = (school_id, session_id) => {
    fetch(localurl + `employee/${school_id}/${session_id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("API Error: " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log("EMPLOYEE API:", data);

        if (data.success) {
          setEmployees(data.row);
        }
        console.log("emplyee data", data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    console.log("school:", school_id, "session:", session_id);

    if (school_id && session_id) {
      getEmployees(school_id, session_id);
    }
  }, []);

  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === "active" ? "inactive" : "active";

      const response = await fetch(
        localurl + "status_employee/" + item.id, // ✅ NEW API
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await response.json();

      if (!handleApiResponse(data)) return;

      showSuccess("Status updated ✅");


      const school_id = localStorage.getItem("school_id");
      const session_id = localStorage.getItem("session_id");

      getEmployees(school_id, session_id);
    } catch (err) {
      console.error(err);
      showError("Server Error ❌");
    }
  };

  const handleEditPassword = async (item) => {
    const { value: newPassword } = await Swal.fire({
      title: `<span style="font-size: 1.5rem; font-weight: 700; color: #1a202c;">Update Password</span>`,
      html: `
        <div style="text-align: left; padding: 10px 5px;">
          <label for="swal-input-password" style="display: block; margin-bottom: 8px; font-weight: 600; color: #4a5568; font-size: 0.9rem;">New Password</label>
          <div style="position: relative; display: flex; align-items: center;">
            <input id="swal-input-password" type="password" value="${item.password || ""}" 
              style="width: 100%; padding: 12px 45px 12px 15px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; outline: none; transition: all 0.3s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
              onfocus="this.style.borderColor='#0860C4'; this.style.boxShadow='0 0 0 3px rgba(8, 96, 196, 0.1)';" 
              onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 1px 2px rgba(0,0,0,0.05)';">
            <button type="button" id="toggle-password-btn" style="position: absolute; right: 15px; background: none; border: none; cursor: pointer; color: #718096; display: flex; align-items: center; justify-content: center; padding: 5px; transition: color 0.2s;">
              <svg id="eye-open" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 22px; height: 22px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg id="eye-closed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 22px; height: 22px; display: none;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <p style="margin-top: 10px; font-size: 0.8rem; color: #718096;">Keep it secure. Avoid using common phrases.</p>
        </div>
      `,
      didOpen: () => {
        const input = document.getElementById("swal-input-password");
        const toggleBtn = document.getElementById("toggle-password-btn");
        const eyeOpen = document.getElementById("eye-open");
        const eyeClosed = document.getElementById("eye-closed");

        toggleBtn.addEventListener("click", () => {
          const isPassword = input.getAttribute("type") === "password";
          input.setAttribute("type", isPassword ? "text" : "password");
          eyeOpen.style.display = isPassword ? "none" : "block";
          eyeClosed.style.display = isPassword ? "block" : "none";
          toggleBtn.style.color = isPassword ? "#0860C4" : "#718096";
        });
      },
      showCancelButton: true,
      confirmButtonText: "Update Password",
      cancelButtonText: "Cancel",
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'bg-[#0860C4] text-white px-8 py-3 rounded-xl font-bold transition duration-300 hover:bg-[#064a9e] transform hover:scale-105 mx-2',
        cancelButton: 'bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold transition duration-300 hover:bg-gray-200 mx-2'
      },
      buttonsStyling: false,
      preConfirm: () => {
        const password = document.getElementById("swal-input-password").value;
        if (!password) {
          Swal.showValidationMessage("Password cannot be empty!");
        }
        return password;
      },
    });

    if (newPassword) {
      try {
        const res = await fetch(`${localurl}update_employee/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPassword }),
        });

        const data = await res.json();

        if (data.success) {
          showSuccess("Staff password updated successfully ✅");
          const school_id = localStorage.getItem("school_id");
          const session_id = localStorage.getItem("session_id");
          getEmployees(school_id, session_id);
        } else {
          showError(data.message || "Failed to update password");
        }
      } catch (err) {
        console.error(err);
        showError("Error updating password ❌");
      }
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleSaveBank = (updatedData) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === updatedData.id ? { ...emp, ...updatedData } : emp,
    );

    setEmployees(updatedEmployees);

    setActiveForm(null);
  };

  const handleSaveIdentity = (updatedData) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === updatedData.id ? { ...emp, ...updatedData } : emp,
    );

    setEmployees(updatedEmployees);

    localStorage.setItem("employees", JSON.stringify(updatedEmployees));

    setActiveForm(null);
  };

  const handleSaveSalary = (updatedData) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === updatedData.id ? { ...emp, ...updatedData } : emp,
    );

    setEmployees(updatedEmployees);

    localStorage.setItem("employees", JSON.stringify(updatedEmployees));

    setActiveForm(null);
  };

  const staffDirectLogin = (staff) => {
    const role = localStorage.getItem("authRole");

    if (role !== "admin") {
      showError("Only Admin can login as staff");
      return;
    }

    localStorage.setItem("authRole", "staff");
    localStorage.setItem("authData", JSON.stringify(staff));
    localStorage.setItem("staff_id", staff.id);

    // ✅ open dashboard
    window.open("/staff-dashboard", "_blank");
  };

  const printTable = (item) => {
    const input = document.getElementById(`student-details-${item.id}`);

    if (!input) {
      alert("Print data not found");
      return;
    }

    // 🔥 BUTTON HIDE
    const buttons = input.querySelectorAll("button");
    buttons.forEach((btn) => (btn.style.display = "none"));

    const school = getStoredSchool();
    const schoolLogo = getUploadUrl(school?.upload_logo);

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Student Details</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            font-family: 'Inter', sans-serif;
          }
          .container {
            width: 190mm;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .text-label {
            font-size: 10px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 2px;
            display: block;
          }
          .text-body {
            font-size: 14px;
            font-weight: 500;
            color: #111827;
            margin-bottom: 10px;
          }
          .grid {
            display: grid;
            gap: 15px;
          }
          .grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- 🔥 SCHOOL HEADER -->
          <div class="header">
            <div style="display:flex; justify-content:space-between; font-size:12px;">
              <span>Reg No: ${school?.registration_no || "-"}</span>
              <span>Affl No: ${school?.affiliation_no || "-"}</span>
            </div>

            <div style="display:flex; align-items:center; margin-top:10px;">
              ${schoolLogo ? `<img src="${schoolLogo}" style="height:60px; width:60px; object-fit:contain;" />` : ""}
              
              <div style="flex:1; text-align:center;">
                <h2 style="margin:0;">${school?.school_name || ""}</h2>
                <p style="margin:0; font-size:12px;">${school?.address || ""}</p>
                <p style="margin:0; font-size:12px;">Contact: ${school?.phone || school?.mobile_no || school?.helpLine_no || ""}</p>
              </div>
            </div>
          </div>

          <!-- 🔥 STUDENT DATA -->
          ${input.innerHTML}

        </div>
      </body>
    </html>
  `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();

      // 🔥 BUTTON WAPAS SHOW
      buttons.forEach((btn) => (btn.style.display = "inline-block"));
    }, 500);
  };

  if (showForm) {
    return (
      <StaffAdd
        setEmployees={setEmployees}
        setShowForm={setShowForm}
        employee={selectedEmployee}
      />
    );
  }
  return (
    <section className="p-4 rounded-t-2xl max-w-full bg-white">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">Staff List</h2>
          <button
            onClick={() => {
              setSelectedEmployee(null);
              setShowForm(true);
            }}

            className="bg-[#0860C4] py-2 px-4 text-white rounded-full"
          >
            Add Staff
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-[#0860C4] text-white">
              <tr>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">#</th>

                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Staff Id ⬍
                </th>

                <th onClick={() => handleSort("employeeFullName")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Name ⬍
                </th>

                <th onClick={() => handleSort("fatherName")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Father Name ⬍
                </th>

                <th onClick={() => handleSort("motherName")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Mother Name ⬍
                </th>

                <th onClick={() => handleSort("department")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                  Department ⬍
                </th>

                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">View</th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Allot</th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Edit PWB</th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Login</th>
                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((item, index) => (
                <tr key={item.id} className="border-t text-center">
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.stu_prefix}

                    {item.employee_id}
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.employeeFullName?.toLowerCase()}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.fatherName?.toLowerCase()}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.motherName?.toLowerCase()}
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.department_name}
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2 md:gap-4">
                      <Link
                        to={"#"}
                        className="text-blue-500  md:text-base hover:underline"
                        onClick={() => toggleView(item.id)}
                      >
                        <FaEye className="text-[1.5rem]" />
                      </Link>
                      {activeView[item.id] && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm overflow-y-hidden text-left">
                          <div className="relative w-full max-w-[95%] sm:max-w-[80%] lg:max-w-[55rem] rounded-lg shadow-2xl bg-white overflow-y-auto max-h-[90vh]">
                            {/* Basic info */}
                            <div id={`print-data-${item.id}`}>
                              <div
                                id={`student-details-${item.id}`}
                                className="p-8"
                              >
                                <div className="flex justify-between items-center mb-5">
                                  <img
                                    src={`${imageBase}uploads/employee/${item.employeePhoto}`}
                                    alt="Student"
                                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
                                  />
                                  <div className="flex items-center gap-4">
                                    <button
                                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                                      onClick={() => toggleView(item.id)}
                                    >
                                      Close
                                    </button>
                                    <button
                                      onClick={() => printTable(item)}
                                      className="bg-[#0860C4] py-2 px-4 text-white text-sm md:text-base rounded-full"
                                    >
                                      Print
                                    </button>
                                  </div>
                                </div>
                                <div className="my-5">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {/* Employee Name */}
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Employee Name</span>
                                      <p className="text-gray-700">{item.employeeFullName}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Father's Name</span>
                                      <p className="text-gray-700">{item.fatherName}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Mother's Name</span>
                                      <p className="text-gray-700">{item.motherName}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Mobile Number</span>
                                      <p className="text-gray-700">{item.mobileNumber}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Alternate Number</span>
                                      <p className="text-gray-700">{item.alternateNumber}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Email ID</span>
                                      <p className="text-gray-700">{item.email}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Date of Birth</span>
                                      <p className="text-gray-700">{formatDate(item.dob)}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Gender</span>
                                      <p className="text-gray-700">{item.gender_name}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Category</span>
                                      <p className="text-gray-700">{item.category_name}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Marital Status</span>
                                      <p className="text-gray-700">{item.maritalStatus}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Religion</span>
                                      <p className="text-gray-700">{item.religion_name}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Login Id</span>
                                      <p className="text-gray-700"> {item.stu_prefix}

                                        {item.employee_id}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900 ">Password</span>
                                      <div className="flex items-center gap-2">
                                        <p className="text-gray-700">
                                          {showPassword[item.id] ? item.password : "****"}
                                        </p>
                                        <button onClick={() => togglePassword(item.id)} className="text-slate-400">
                                          {showPassword[item.id] ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Current Address */}
                                <div className="my-5">
                                  <div className="mb-4">
                                    <h3 className="text-base font-semibold  border-l-4 border-blue-600 pl-3 leading-none py-1">
                                      Current Address
                                    </h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Address
                                      </label>
                                      <p className="text-gray-700">
                                        {item.currentAddress}
                                      </p>
                                    </div>

                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Pin Code
                                      </label>
                                      <p className="text-gray-700">
                                        {item.currentPincode}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        City
                                      </label>
                                      <p className="text-gray-700">
                                        {item.currentCity}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        State
                                      </label>
                                      <p className="text-gray-700">
                                        {item.currentState}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Nationality
                                      </label>
                                      <p className="text-gray-700">
                                        {item.nationality_name}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Permanent Address */}
                                <div className="my-5">
                                  <div className="mb-4">
                                    <h3 className="text-base font-semibold   border-l-4 border-blue-600 pl-3 leading-none py-1">
                                      Permanent Address
                                    </h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Address
                                      </label>
                                      <p className="text-gray-700">
                                        {item.permanentAddress}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Pin Code
                                      </label>
                                      <p className="text-gray-700">
                                        {item.permanentPincode}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        City
                                      </label>
                                      <p className="text-gray-700">
                                        {item.permanentCity}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        State
                                      </label>
                                      <p className="text-gray-700">
                                        {item.permanentState}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2  flex gap-2 md:gap-4 whitespace-nowrap">
                    <button
                      onClick={() => openForm("bank", item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Bank
                    </button>

                    <button
                      onClick={() => openForm("identity", item)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Ducs
                    </button>

                    <button
                      onClick={() => openForm("salary", item)}
                      className="bg-purple-500 text-white px-3 py-1 rounded"
                    >
                      Salary
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Password edit */}
                    <div
                      onClick={() => handleEditPassword(item)}
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      <RiKey2Fill className="text-[1.5rem]" />
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <FaSignInAlt
                      onClick={() => staffDirectLogin(item)}
                      className="text-[1.5rem] text-green-600 cursor-pointer"
                      title="Login as Student"
                    />
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2 md:gap-4 items-center">
                      {/* EDIT BUTTON */}
                      <Link
                        to={"#"}
                        className="text-blue-500 text-sm md:text-base hover:underline"
                      >
                        <RiEdit2Fill
                          className="text-[1.5rem] cursor-pointer"
                          onClick={() => handleEdit(item)}
                        />
                      </Link>

                      {/* ✅ TOGGLE BUTTON (SESSION STYLE) */}
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 
      ${item.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full transition 
        ${item.status === "active" ? "translate-x-6" : ""}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>



          {activeForm && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl w-[600px] p-6 relative">
                {/* Close button */}
                <button
                  onClick={closeForm}
                  className="absolute top-3 right-3 text-red-500 text-lg"
                >
                  ✕
                </button>

                {/* Dynamic Form */}

                {activeForm === "bank" && (
                  <BankForm
                    employee={selectedEmployee}
                    handleSave={handleSaveBank}
                  />
                )}

                {activeForm === "identity" && (
                  <IdentityForm
                    employee={selectedEmployee}
                    handleSave={handleSaveIdentity}
                  />
                )}

                {activeForm === "salary" && (
                  <SalaryForm
                    employee={selectedEmployee}
                    handleSave={handleSaveSalary}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={employees.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={changeItemsPerPage}
        />
      </div>
    </section >
  );
}

export default StaffList;
