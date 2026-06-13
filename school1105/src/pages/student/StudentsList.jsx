import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { FaSignInAlt, FaUpload } from "react-icons/fa";

import { MdDelete } from "react-icons/md";
import { RiEdit2Fill, RiMickeyLine, RiKey2Fill } from "react-icons/ri";
import { MdToggleOn } from "react-icons/md";
import { MdToggleOff } from "react-icons/md";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StudentForm from "./StudentForm";
import { FaSearch, FaFileExcel } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { useNavigate } from "react-router-dom";
import { localurl } from "../../api/api";
const imageBase = localurl.replace("/api", "");
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import SchoolHeader from "../../Component/ui/SchoolHeader";
import {
  ClassSelect,
  FloatingInput,
  FloatingInputs,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import Swal from "sweetalert2";
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

function StudentList() {
  // Initial states for filters
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [students, setStudents] = useState([]);
  const [showPassword, setShowPassword] = useState({});
  const [classList, setClassList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const [applyFilter, setApplyFilter] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  const [genderList, setGenderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [mediumList, setMediumList] = useState([]);

  const togglePassword = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (date) => {
    if (!date || date.includes("1899") || date.startsWith("0000")) return "";
    if (date.includes("T")) {
      date = date.split("T")[0];
    }
    return date.split("-").reverse().join("-");
  };

  const studentDirectLogin = (student) => {
    const role = localStorage.getItem("authRole");

    if (role !== "admin") {
      showError("Only Admin can login as student");
      return;
    }

    // ✅ FULL student session set karo
    localStorage.setItem("authRole", "student");
    localStorage.setItem("authData", JSON.stringify(student));
    localStorage.setItem("student_id", student.id);
    // localStorage.setItem("school_id", student.school_id);
    // localStorage.setItem("session_id", student.session_id);

    // ✅ open dashboard
    window.open("/student-dashboard", "_blank");
  };

  const [filters, setFilters] = useState({
    class: "All",
    name: "",
    fatherName: "",
    srNo: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedData = [...students].sort((a, b) => {
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";

      if (typeof aVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return direction === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });

    setStudents(sortedData);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setApplyFilter(false);

  };

  const searchStudents = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return students.filter((student) => {
      const matchesFilters =
        (appliedFilters.class === "All" || appliedFilters.class === student.class) &&
        (!appliedFilters.name ||
          student.name?.toLowerCase().includes(appliedFilters.name.toLowerCase())) &&
        (!appliedFilters.fatherName ||
          student.fatherName?.toLowerCase().includes(appliedFilters.fatherName.toLowerCase())) &&
        (!appliedFilters.srNo ||
          student.srId?.toString().includes(appliedFilters.srNo) ||
          student.srNo?.toString().includes(appliedFilters.srNo));

      const matchesSearch =
        !searchTerm ||
        student.name?.toLowerCase().includes(searchTerm) ||
        student.srId?.toString().includes(searchTerm) ||
        student.primaryNo?.toString().includes(searchTerm);

      return matchesFilters && matchesSearch;
    });
  }, [students, appliedFilters, search]);

  const {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(searchStudents, 100);

  const [active, setActive] = useState({});

  const toggle = (id) => {
    setActive((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`${localurl}status_student/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        showSuccess("Status updated ✅");

        // 🔥 refresh list
        fetchStudents();
      } else {
        showError(data.message);
      }
    } catch (err) {
      console.error(err);
      showError("Error updating status");
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
        const res = await fetch(`${localurl}update_students/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPassword }),
        });

        const data = await res.json();

        if (data.success) {
          showSuccess("Student password updated successfully ✅");
          fetchStudents(); // Refresh the list to show updated password if needed
        } else {
          showError(data.message || "Failed to update password");
        }
      } catch (err) {
        console.error(err);
        showError("Error updating password ❌");
      }
    }
  };

  const [activeView, setActiveView] = useState({});
  const toggleView = (id) => {
    setActiveView((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const printTable = (item) => {
    const input = document.getElementById(`student-details-${item.id}`);
    if (!input) return;

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
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            font-family: Arial;
          }
          .container {
            width: 190mm;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 10px;
            margin-bottom: 3px;
          }
          .text-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .text-body {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
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

      buttons.forEach((btn) => (btn.style.display = "block"));
    }, 500);
  };

  useEffect(() => {
    if (!school_id) {
      console.log("❌ school_id missing");
      return;
    }


    fetch(localurl + "class_section/" + school_id)
      .then((res) => res.json())
      .then((data) => {

        if (data.success) {

          const activeSorted = data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });

          setSectionList(activeSorted);

          const uniqueClasses = [
            ...new Map(data.row.map((item) => [item.class_id, item])).values(),
          ];

          setClassList(uniqueClasses);
        }
      })
      .catch((err) => {
        console.error("❌ API ERROR:", err);
      });

    // FETCH GENDER
    fetch(`${localurl}gender/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGenderList(data.row.filter(i => i.status === "Active"));
      });

    // FETCH CATEGORY
    fetch(`${localurl}category/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategoryList(data.row.filter(i => i.status === "Active"));
      });

    // FETCH RELIGION
    fetch(`${localurl}religion/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReligionList(data.row.filter(i => i.status === "Active"));
      });

    // FETCH NATIONALITY
    fetch(`${localurl}nationality/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNationalityList(data.row.filter(i => i.status === "Active"));
      });

    // FETCH MEDIUM
    fetch(`${localurl}medium/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMediumList(data.row.filter(i => i.status === "Active"));
      });
  }, [school_id]);

  const fetchStudents = () => {
    fetch(localurl + "students/" + school_id + "/" + session_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.error("Student data->>:", data);
          const formatted = data.row.map((item, index) => ({
            id: item.id,
            sNo: index + 1,
            srId: item.student_ids,
            srNo: item.registerNo,
            stu_prefix: item.stu_prefix,
            class: item.section_class,
            classId: item.registerClass,
            name: item.studentName,
            fatherName: item.fatherName,
            motherName: item.motherName,
            primaryNo: item.primaryNo,
            secondaryNo: item.secondaryNo,
            email: item.email,
            dob: item.dob,
            bloodgroup: item.bloodgroup,
            rte: item.rte,
            gender: item.gender,
            nationality: item.nationality,
            category: item.category,
            religion: item.religion,
            photo: item.photo,
            currentAddress: item.currentAddress,
            currentCity: item.currentCity,
            currentState: item.currentState,
            currentPinCode: item.currentPinCode,
            permanentAddress: item.permanentAddress,
            permanentCity: item.permanentCity,
            permanentState: item.permanentState,
            permanentPinCode: item.permanentPinCode,
            medium: item.medium,
            registrationEnrollNo: item.registrationEnrollNo,
            registerAdmissionDate: item.registerAdmissionDate,
            previousSchool: item.previousSchoolName,
            previousClass: item.previousClass,
            previousSrNo: item.previousSrNo,
            loginId: item.loginid,
            password: item.password,
            busRoute: item.busRoute,
            busStand: item.busStand,
            busFare: item.busFare,
            status: item.status,
          }));

          setStudents(formatted);
        }
      })
      .catch((err) => {
        console.error("Student API Error:", err);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  console.log("FILTER:", filters.class);
  // console.log("STUDENT:", student.class, student.section);
  if (showForm) {
    return (
      <StudentForm
        setStudents={setStudents}
        setShowForm={setShowForm}
        students={students}
        refreshStudents={fetchStudents}
      />
    );
  }

  const handleSampleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Student Sample");
    const dataSheet = workbook.addWorksheet("Lists");
    dataSheet.state = 'hidden'; // Hide the helper sheet

    // Define Headers
    const columns = [
      { header: "studentName", key: "studentName", width: 20 },
      { header: "fatherName", key: "fatherName", width: 20 },
      { header: "motherName", key: "motherName", width: 20 },
      { header: "primaryNo", key: "primaryNo", width: 15 },
      { header: "secondaryNo", key: "secondaryNo", width: 15 },
      { header: "gender", key: "gender", width: 15 },
      { header: "category", key: "category", width: 15 },
      { header: "religion", key: "religion", width: 15 },
      { header: "nationality", key: "nationality", width: 15 },
      { header: "medium", key: "medium", width: 15 },
      { header: "bloodgroup", key: "bloodgroup", width: 15 },
      { header: "rte", key: "rte", width: 10 },
      { header: "currentAddress", key: "currentAddress", width: 25 },
      { header: "currentCity", key: "currentCity", width: 15 },
      { header: "currentState", key: "currentState", width: 15 },
      { header: "currentPinCode", key: "currentPinCode", width: 12 },
      { header: "permanentAddress", key: "permanentAddress", width: 25 },
      { header: "permanentCity", key: "permanentCity", width: 15 },
      { header: "permanentState", key: "permanentState", width: 15 },
      { header: "permanentPinCode", key: "permanentPinCode", width: 12 },
    ];

    worksheet.columns = columns;

    // Add Styling to Header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Prepare helper data in hidden sheet
    const genderOptions = genderList.length > 0 ? genderList.map(i => i.gender) : ["Male", "Female", "Other"];
    const categoryOptions = categoryList.length > 0 ? categoryList.map(i => i.category) : ["General", "OBC", "SC", "ST"];
    const religionOptions = religionList.length > 0 ? religionList.map(i => i.religion) : ["Hindu", "Muslim", "Sikh", "Christian"];
    const nationalityOptions = nationalityList.length > 0 ? nationalityList.map(i => i.nationality) : ["Indian", "Other"];
    const mediumOptions = mediumList.length > 0 ? mediumList.map(i => i.medium) : ["Hindi", "English"];
    const rteOptions = ["Yes", "No"];

    // Fill helper sheet columns
    genderOptions.forEach((val, idx) => dataSheet.getCell(idx + 1, 1).value = val);
    categoryOptions.forEach((val, idx) => dataSheet.getCell(idx + 1, 2).value = val);
    religionOptions.forEach((val, idx) => dataSheet.getCell(idx + 1, 3).value = val);
    nationalityOptions.forEach((val, idx) => dataSheet.getCell(idx + 1, 4).value = val);
    mediumOptions.forEach((val, idx) => dataSheet.getCell(idx + 1, 5).value = val);
    rteOptions.forEach((val, idx) => dataSheet.getCell(idx + 1, 6).value = val);

    // Add Dummy Data right after headers
    worksheet.addRow({
      studentName: "John Doe",
      fatherName: "Richard Doe",
      motherName: "Jane Doe",
      primaryNo: "9876543210",
      secondaryNo: "9876543211",
      gender: genderOptions[0] || "Male",
      category: categoryOptions[0] || "General",
      religion: religionOptions[0] || "Hindu",
      nationality: nationalityOptions[0] || "Indian",
      medium: mediumOptions[0] || "English",
      bloodgroup: "O+",
      rte: rteOptions[0] || "No",
      currentAddress: "123 Main St",
      currentCity: "Jaipur",
      currentState: "Rajasthan",
      currentPinCode: "302001",
      permanentAddress: "123 Main St",
      permanentCity: "Jaipur",
      permanentState: "Rajasthan",
      permanentPinCode: "302001",
    });

    // Apply validations to 100 rows
    for (let i = 2; i <= 101; i++) {
      worksheet.getCell(`F${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Lists!$A$1:$A$${genderOptions.length}`] };
      worksheet.getCell(`G${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Lists!$B$1:$B$${categoryOptions.length}`] };
      worksheet.getCell(`H${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Lists!$C$1:$C$${religionOptions.length}`] };
      worksheet.getCell(`I${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Lists!$D$1:$D$${nationalityOptions.length}`] };
      worksheet.getCell(`J${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Lists!$E$1:$E$${mediumOptions.length}`] };
      worksheet.getCell(`L${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Lists!$F$1:$F$${rteOptions.length}`] };
    }

    // Write to Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "student_sample.xlsx");
  };

  const handleUploadExcel = async () => {
    // ✅ VALIDATION
    if (!excelFile) {
      showError("Please select Excel file");
      return;
    }

    if (!selectedClass) {
      showError("Please select class");
      return;
    }

    // ✅ VALUE FREEZE (VERY IMPORTANT)
    const classValue = selectedClass;
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    if (!school_id || !session_id) {
      showError("School or session missing");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let jsonData = XLSX.utils.sheet_to_json(sheet);

        console.log("Excel Data 👉", jsonData);

        // ✅ EMPTY CHECK
        if (!jsonData || jsonData.length === 0) {
          showError("Excel file is empty");
          return;
        }

        // ✅ CLEAN DATA (IMPORTANT)
        jsonData = jsonData.map((item) => ({
          studentName: item.studentName || "",
          fatherName: item.fatherName || "",
          motherName: item.motherName || "",
          primaryNo: item.primaryNo || "",
          secondaryNo: item.secondaryNo || "",
          gender: item.gender || "",
          category: item.category || "",
          religion: item.religion || "",
          nationality: item.nationality || "",
          medium: item.medium || "",
          bloodgroup: item.bloodgroup || "",
          rte: item.rte || "No",
          dob: item.dob || "",
          currentAddress: item.currentAddress || "",
          currentCity: item.currentCity || "",
          currentState: item.currentState || "",
          currentPinCode: item.currentPinCode || "",
          permanentAddress: item.permanentAddress || "",
          permanentCity: item.permanentCity || "",
          permanentState: item.permanentState || "",
          permanentPinCode: item.permanentPinCode || "",
        }));

        // ✅ FINAL PAYLOAD (BEST PRACTICE)
        const payload = {
          school_id,
          session_id,
          class_id: classValue,
          students: jsonData,
        };

        console.log("FINAL PAYLOAD 👉", payload);

        const res = await fetch(`${localurl}upload_students_excel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        console.log("API Response 👉", result);

        if (result.success) {
          if (result.errors && result.errors.length > 0) {
            console.log("Row Errors 👉", result.errors);
            const errorDetails = result.errors.map(err => `Row ${err.row}: ${err.message}`).join("<br/>");

            Swal.fire({
              icon: 'warning',
              title: `Uploaded: ${result.inserted} | Failed: ${result.errors.length}`,
              html: `<p style="margin-bottom: 10px;">The following rows had issues:</p>
                     <div style="max-height: 200px; overflow-y: auto; text-align: left; font-size: 0.9em; background: #fdf2f2; border: 1px solid #f8b4b4; color: #c81e1e; padding: 10px; border-radius: 8px;">
                       ${errorDetails}
                     </div>`,
              confirmButtonText: 'Got it',
              confirmButtonColor: '#0860C4'
            });
          } else {
            showSuccess(`Successfully uploaded ${result.inserted} students!`);
          }

          // ✅ RESET (IMPORTANT)
          setSelectedClass("");
          setExcelFile(null);
          setShowExcelModal(false);

          fetchStudents(); // refresh list
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: result.message || "Unknown error occurred on the server.",
            confirmButtonColor: '#0860C4'
          });
        }
      } catch (err) {
        console.error("Upload Error 👉", err);
        Swal.fire({
          icon: 'error',
          title: 'System Error',
          text: err.message || "Something went wrong while processing the Excel file.",
          confirmButtonColor: '#0860C4'
        });
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };
  return (
    <section className=" bg-white  rounded-t-2xl max-w-full p-4 ">
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-3 mb-4 items-end">

          {/* Title */}
          <h1 className="col-span-12 md:col-span-2 text-2xl font-bold">
            Students
          </h1>

          {/* Class Section */}
          <div className="col-span-12 md:col-span-2">
            <FloatingSelect
              label="Class Section"
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              options={[
                "All",
                ...sectionList.map(
                  (record) => `${record.class_name} ${record.section}`
                ),
              ]}
            />
          </div>

          {/* Find Button */}
          <button
            type="button"
            onClick={() => setAppliedFilters(filters)}
            className="col-span-12 md:col-span-1 bg-[#0860C4] text-white h-[42px] rounded"
          >
            Find
          </button>

          {/* Search */}
          <div className="col-span-12 md:col-span-4 flex items-center border rounded-xl px-3 h-[42px] gap-2">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search Id / Name / Father / Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-full"
            />
          </div>

          {/* Buttons */}
          <div className="col-span-12 md:col-span-3 flex gap-3 justify-end">
            <button
              onClick={() => setShowExcelModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 h-[42px] rounded-lg flex items-center gap-2"
            >
              <FaFileExcel />
              <FaUpload />
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="bg-[#0860C4] px-4 h-[42px] text-white rounded-lg whitespace-nowrap"
            >
              Add Student
            </button>
          </div>

        </div>
      </div>

      <div className=" overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-[#0860C4] text-center text-white">
              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("sNo")}
              >
                #
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("srId")}
              >
                ST. ID ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("srNo")}
              >
                SR No. ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("class")}
              >
                Class ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("fatherName")}
              >
                Father Name ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("motherName")}
              >
                Mother Name ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("primaryNo")}
              >
                Mobile No. ⬍
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                View
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                Edit
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                Edit PWB
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                Login
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {
              currentData.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-4">
                    No Data Found
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={index} className="bg-white border-t hover:bg-gray-100 ">
                    
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>

                    <td className="p-2 whitespace-nowrap">
                      {" "}
                      {item.stu_prefix}
                      {item.srId}
                    </td>

                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {item.srNo}
                    </td>
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {item.class}
                    </td>
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {item.fatherName}
                    </td>
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {item.motherName}
                    </td>
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {item.primaryNo}
                    </td>

                    <td className="px-2 md:px-4 py-2">
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
                              <div
                                id={`student-details-${item.id}`}
                                className="p-8"
                              >
                                <div className="flex justify-between items-center mb-5">
                                  <img
                                    src={`${imageBase}uploads/student/${item.photo}`}
                                    alt="Student"
                                    className="h-20 w-20 rounded-full object-cover"
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
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                                    {/* Student Name */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Student Name
                                      </h1>
                                      <p className="text-gray-700">{item.name}</p>
                                    </div>
                                    {/* Father's Name */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Father's Name
                                      </h1>
                                      <p className="text-gray-700">
                                        {item.fatherName}
                                      </p>
                                    </div>
                                    {/* Mother's Name */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Mother's Name
                                      </h1>
                                      <p className="text-gray-700">
                                        {item.motherName}
                                      </p>
                                    </div>
                                    {/* Mobile No. */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Primary No.
                                      </h1>
                                      <p className="text-gray-700">
                                        {item.primaryNo}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Second Row of fields */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-4">
                                    {/* Email ID */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Secendery No.
                                      </h1>
                                      <p className="text-gray-700">
                                        {item.secondaryNo}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Email ID
                                      </h1>
                                      <p className="text-gray-700">{item.email}</p>
                                    </div>
                                    {/* Date of Birth */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Date of Birth
                                      </h1>
                                      <p className="text-gray-700">
                                        {formatDate(item.dob)}
                                      </p>
                                    </div>
                                    {/* Gender */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Gender
                                      </h1>
                                      <p className="text-gray-700">{item.gender}</p>
                                    </div>
                                    {/* Category */}
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Category
                                      </h1>
                                      <p className="text-gray-700">
                                        {item.category}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <h1 className="text-sm font-semibold text-gray-900">
                                        Religion
                                      </h1>
                                      <p className="text-gray-700">
                                        {item.religion}
                                      </p>
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
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                        {item.currentPinCode}
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
                                  </div>
                                </div>

                                {/* Permanent Address */}
                                <div className="my-5">
                                  <div className="mb-4">
                                    <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-3 leading-none py-1">
                                      Permanent Address
                                    </h3>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Pin Code
                                      </label>
                                      <p className="text-gray-700">
                                        {item.permanentPinCode}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Fields */}
                                <div className="my-5">
                                  <div className="mb-4">
                                    <h3 className="text-base font-semibold  border-l-4 border-blue-600 pl-3 leading-none py-1">
                                      Register Information
                                    </h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Register No.
                                      </label>
                                      <p className="text-gray-700">{item.srNo}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        medium.
                                      </label>
                                      <p className="text-gray-700">{item.medium}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Class
                                      </label>
                                      <p className="text-gray-700">{item.class}</p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Admission Date
                                      </label>

                                      <p className="text-gray-700">
                                        {formatDate(item.registerAdmissionDate)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Previous School Information */}
                                  <div className="mb-4 mt-5">
                                    <h3 className=" font-semibold border-l-4 border-blue-600 pl-3 leading-none py-1">
                                      Previous School Information
                                    </h3>
                                  </div>
                                  <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Previous School
                                      </label>
                                      <p className="text-gray-700">
                                        {item.previousSchool}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Previous Class
                                      </label>
                                      <p className="text-gray-700">
                                        {item.previousClass}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Previous SrNo
                                      </label>
                                      <p className="text-gray-700">
                                        {item.previousSrNo}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 border-t-2 border-[#0860C4]">
                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Login Id
                                      </label>
                                      <p className="text-gray-700">
                                        {item.loginId}
                                      </p>
                                    </div>

                                    <div className="flex flex-col">
                                      <label className="text-sm font-semibold text-gray-900">
                                        Password
                                      </label>

                                      <div className="flex items-center gap-2">
                                        <p className="text-gray-700">
                                          {showPassword[item.id]
                                            ? item.password
                                            : "****"}
                                        </p>

                                        <button
                                          onClick={() => togglePassword(item.id)}
                                          className="text-gray-500"
                                        >
                                          {showPassword[item.id] ? (
                                            <FaEyeSlash />
                                          ) : (
                                            <FaEye />
                                          )}
                                        </button>
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

                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <Link to={`/student-edit`} state={{ student: item }}> */}
                      <Link to={`/studentForm`} state={{ student: item }}>
                        <RiEdit2Fill className="text-[1.5rem]" />
                      </Link>
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
                        onClick={() => studentDirectLogin(item)}
                        className="text-[1.5rem] text-green-600 cursor-pointer"
                        title="Login as Student"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                  </tr>
                )))}
          </tbody>
        </table>
      </div>

      {showExcelModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setShowExcelModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 "></div>

          {/* Modal */}
          <div
            className="relative bg-white w-[95%] md:w-[60%] max-w-4xl rounded-2xl shadow-2xl animate-[fadeIn_0.2s_ease] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg md:text-xl font-semibold">
                Upload Students
              </h2>

              <button
                onClick={handleSampleDownload}
                className="text-blue-600 font-medium "
              >
                Download Sample
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <ClassSelect
                  label="Select Class Section"
                  name="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { label: "-- Select Class Section --", value: "" },
                    ...sectionList.map((item) => ({
                      label: `${item.class_name} ${item.section}`,
                      value: item.id,
                    })),
                  ]}
                />
              </div>

              <div>
                <FloatingInputs
                  label="Upload Excel"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={handleUploadExcel}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Upload
                </button>

                <button
                  onClick={() => setShowExcelModal(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommonPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={searchStudents.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </section>
  );
}

export default StudentList;
