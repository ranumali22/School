import React, { useState, useEffect, useMemo } from "react";
import { localurl } from "../../api/api";
import { FloatingSelect } from "../../Component/common/FloatingInput";
import { FaSearch, } from "react-icons/fa";
import CommonPagination from "../../Component/common/Pagination";
import usePagination from "../../hooks/usePagination";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

function StudentDetailReport() {
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        class: "All",
        name: "",
        fatherName: "",
        srNo: "",
    });
    const [search, setSearch] = useState("");
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [sectionList, setSectionList] = useState([]);
    const [applyFilter, setApplyFilter] = useState(false);
    const [classList, setClassList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);


    const allFields = [
        // Basic Info
        { key: "srId", label: "Student ID" },
        { key: "srNo", label: "SR No" },
        { key: "name", label: "Student Name" },
        { key: "class", label: "Class" },

        // Parents
        { key: "fatherName", label: "Father Name" },
        { key: "motherName", label: "Mother Name" },

        // Contact
        { key: "primaryNo", label: "Primary Mobile" },
        { key: "secondaryNo", label: "Secondary Mobile" },
        { key: "email", label: "Email" },

        // Personal
        { key: "dob", label: "Date of Birth" },
        { key: "gender", label: "Gender" },
        { key: "bloodgroup", label: "Blood Group" },
        { key: "nationality", label: "Nationality" },
        { key: "category", label: "Category" },
        { key: "religion", label: "Religion" },
        { key: "rte", label: "RTE" },

        // Address - Current
        { key: "currentAddress", label: "Current Address" },
        { key: "currentCity", label: "Current City" },
        { key: "currentState", label: "Current State" },
        { key: "currentPinCode", label: "Current PinCode" },

        // Address - Permanent
        { key: "permanentAddress", label: "Permanent Address" },
        { key: "permanentCity", label: "Permanent City" },
        { key: "permanentState", label: "Permanent State" },
        { key: "permanentPinCode", label: "Permanent PinCode" },

        // Academic
        { key: "medium", label: "Medium" },
        { key: "registrationEnrollNo", label: "Enroll No" },
        { key: "registerAdmissionDate", label: "Admission Date" },

        // Previous School
        { key: "previousSchool", label: "Previous School" },
        { key: "previousClass", label: "Previous Class" },
        { key: "previousSrNo", label: "Previous SR No" },

        // Login
        { key: "loginId", label: "Login ID" },
        { key: "password", label: "Password" },

        // Transport
        { key: "busRoute", label: "Bus Route" },
        { key: "busStand", label: "Bus Stand" },
        { key: "busFare", label: "Bus Fare" },
    ];

    useEffect(() => {
        fetch(localurl + "students/" + school_id + "/" + session_id)
            .then((res) => res.json())
            .then((data) => {
                console.log("API DATA 👉", data);

                if (data.success) {

                    const formatted = data.row
                        .filter((item) => item.status?.toLowerCase() === "active" || item.status === "Active")
                        .map((item, index) => ({
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
                        }));

                    setStudents(formatted);
                }
            });
    }, []);


    useEffect(() => {
        if (!school_id) {
            console.log("❌ school_id missing");
            return;
        }

        console.log("CLASS_SECTION API CALLED");

        fetch(localurl + "class_section/" + school_id)
            .then((res) => res.json())
            .then((data) => {
                console.log("SECTION DATA 👉", data);

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
    }, [school_id]);
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

    const filteredStudents = students.filter((student) => {
        return (
            (appliedFilters.class === "All" || appliedFilters.class === student.class) &&
            (appliedFilters.name === "" ||
                student.name?.toLowerCase().includes(appliedFilters.name.toLowerCase())) &&
            (appliedFilters.fatherName === "" ||
                student.fatherName
                    ?.toLowerCase()
                    .includes(appliedFilters.fatherName.toLowerCase())) &&
            (appliedFilters.srNo === "" ||
                student.srId?.toString().includes(appliedFilters.srNo) ||
                student.srNo?.toString().includes(appliedFilters.srNo))
        );
    });

    const searchStudents = useMemo(() => {
        const text = search.toLowerCase();

        return filteredStudents.filter((student) => {
            return (
                student.class?.toLowerCase().includes(text) ||
                student.name?.toLowerCase().includes(text) ||
                student.fatherName?.toLowerCase().includes(text) ||
                student.motherName?.toLowerCase().includes(text) ||
                student.srNo?.toString().includes(text) ||
                student.primaryNo?.toString().includes(text) ||
                student.srId?.toString().includes(text)
            );
        });
    }, [filteredStudents, search]);

    const {
        currentPage,
        totalPages,
        currentData,
        setCurrentPage,
        itemsPerPage,
        changeItemsPerPage,
    } = usePagination(searchStudents, 100);


    const handleFieldChange = (key) => {
        if (selectedFields.includes(key)) {
            setSelectedFields(selectedFields.filter((f) => f !== key));
        } else {
            setSelectedFields([...selectedFields, key]);
        }
    };
    const exportExcel = () => {
        if (selectedFields.length === 0) {
            alert("Please select fields");
            return;
        }




        const data = (selectedStudents.length > 0 ? selectedStudents : searchStudents).map((s) => {
            let obj = {};
            selectedFields.forEach((field) => {
                obj[field] = s[field] || "";
            });
            return obj;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");

        XLSX.writeFile(wb, "Student_Report.xlsx");

        setShowPopup(false);
    };



    console.log("school_id 👉", school_id);
    console.log("session_id 👉", session_id);
    return (
        <section className="bg-white rounded-t-2xl max-w-full p-4">

            {/* Header */}

            <div className="space-y-2">
                <div className="grid grid-cols-12 gap-3 mb-4 items-end">

                    {/* Title */}
                    <h1 className="col-span-12 md:col-span-3 text-2xl font-bold">
                        Student Detail Report</h1>


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

                    <div className="">

                        <button
                            onClick={() => setShowPopup(true)}
                            className="col-span-12 md:col-span-3 flex gap-3 justify-end bg-[#0860C4] text-white px-5 py-2 rounded-xl shadow-md flex items-center gap-2"
                        >
                            <FaFileExcel className="text-white" />   Export
                        </button>
                    </div>

                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border">

                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >#</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("srId")}>Student ID ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("srNo")}>SR No. ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("class")}>Class ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("name")}>Name ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("fatherName")}>Father Name ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("motherName")}>Mother Name ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("primaryNo")}>Mobile ⬍</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No Data Found
                                </td>
                            </tr>
                        ) : (
                            currentData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-t hover:bg-gray-100"
                                >
                                    <td className="p-2 text-center">{index + 1}</td>
                                    <td className="p-2 text-center">{item.srId}</td>
                                    <td className="p-2 text-center">{item.srNo}</td>
                                    <td className="p-2 text-center">{item.class}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">{item.fatherName}</td>
                                    <td className="p-2">{item.motherName}</td>
                                    <td className="p-2 text-center">{item.primaryNo}</td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>

                {showPopup && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

                        <div className="bg-white rounded-2xl w-[90%] max-w-5xl p-6 shadow-xl">

                            {/* Header */}
                            <h2 className="text-2xl font-bold mb-4">Export Student Data</h2>

                            {/* Fields Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap- max-h-[400px] overflow-y-auto border p-4 rounded-xl">

                                {allFields.map((field) => (
                                    <label
                                        key={field.key}
                                        className="flex items-center gap-2 text-sm  px- py-1 rounded hover:bg-gray-100 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFields.includes(field.key)}
                                            onChange={() => handleFieldChange(field.key)}
                                        />
                                        {field.label}
                                    </label>
                                ))}

                            </div>

                            {/* Buttons */}
                            <div className="flex justify-start gap-4 mt-6">
                                <button
                                    onClick={exportExcel}
                                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                                >
                                    Export
                                </button>

                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="bg-gray-500 text-white px-5 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
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

export default StudentDetailReport;