import React, { useState, useEffect } from "react";
import StudentFeeForm from "./StudentFeeForm";
import { FaEye } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";

import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";
import { ClassSelect } from "../../Component/common/FloatingInput";



const StudentFeeAllot = () => {
    const [search, setSearch] = useState("");
    const [records, setRecords] = useState([]);
    const [classList, setClassList] = useState([]);
    const [feeHeads, setFeeHeads] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [viewClass, setViewClass] = useState(null);
    const [viewStudent, setViewStudent] = useState(null);
    const [classFilter, setClassFilter] = useState("All");
    const [nameFilter, setNameFilter] = useState("");
    const [fatherFilter, setFatherFilter] = useState("");
    const [srnooFilter, setSrnoFilter] = useState("");
    const [applyFilter, setApplyFilter] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    const [sectionList, setSectionList] = useState([]);

    const [errors, setErrors] = useState({});

    const formatDate = (dateString) => {
        if (!dateString || dateString === "0000-00-00") return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [form, setForm] = useState({
        class_id: "",

    });




    const handleSubmit = (studentData, payload) => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({
                    fees: payload,
                    student_id: studentData.student_id,
                    session_id: session_id,
                    school_id: school_id,
                    class_id: form.class_id
                }),
                redirect: "follow",
            };

            fetch(localurl + "add_student_fee_allot", requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    const data = JSON.parse(result);


                    if (data.success) {
                        handleApiResponse(data);
                        getStudentAllot();

                    } else {
                        handleApiResponse(data);

                        const msg = data.message?.toLowerCase();
                        let newErrors = {};

                        if (msg.includes("subjectgroup")) newErrors.group = data.message;

                        setErrors(newErrors);
                    }
                })
                .catch((err) => handleApiResponse(err));
        } catch (err) {
            console.error("Submit error:", err);
        }

        setShowForm(false);

    };


    useEffect(() => {
        getStudentAllot();
        // CLASS DETAIL
        fetch(localurl + "class_section/" + school_id)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const activeData = data.row
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

                    setSectionList(activeData);


                }
            });

    }, []);


    const getStudentAllot = (class_id = form.class_id) => {

        const school_id = localStorage.getItem("school_id");
        const session_id = localStorage.getItem("session_id");

        fetch(localurl + "student_fee_allot/" + school_id + "/" + session_id + "/" + class_id)
            .then(res => res.json())
            .then(data => {


                console.log("data students", data);

                if (data.success) {
                    handleApiResponse(data)
                    setStudents(data.data || []);

                    setRecords(data.records || []);

                }
                else {
                    handleApiResponse(data)
                    setStudents([]);
                }
            });
    }

    const getStudentRecord = (student) => {
        return records.find(
            (r) => Number(r.student_id) === Number(student.student_id)
        );
    };

    const getStudentTotalFee = (student) => {

        const record = getStudentRecord(student);

        if (!record) return 0;

        return record.rows.reduce(
            (sum, row) => sum + Number(row.amount || 0),
            0
        );

    };


    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc"
    });

    const handleSort = (key) => {

        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedData = [...students].sort((a, b) => {

            if (typeof a[key] === "string") {
                return direction === "asc"
                    ? a[key].localeCompare(b[key])
                    : b[key].localeCompare(a[key]);
            }

            return direction === "asc"
                ? a[key] - b[key]
                : b[key] - a[key];

        });

        setStudents(sortedData);
    };




    const filteredStudents = applyFilter
        ? students.filter((s) => {

            const matchClass =
                classFilter === "All" || s.class === classFilter;

            const matchName =
                s.name?.toLowerCase().includes(nameFilter.toLowerCase());

            const matchFather =
                s.fatherName?.toLowerCase().includes(fatherFilter.toLowerCase());

            const matchSrNo =
                srnooFilter === "" || s.srNo?.toString().includes(srnooFilter);

            return matchClass && matchName && matchFather && matchSrNo;

        })
        : students;

    const searchStudents = filteredStudents.filter((student) => {

        const text = search.toLowerCase();

        return (

            student.class_section?.toLowerCase().includes(text) ||
            student.students_name?.toLowerCase().includes(text) ||
            student.fatherName?.toLowerCase().includes(text) ||
            student.motherName?.toLowerCase().includes(text) ||
            student.srNo?.toString().includes(text) ||
            student.primaryNo?.toString().includes(text)

        );

    });
    const {
        currentPage,
        totalPages,
        currentData,
        setCurrentPage,
        itemsPerPage,
        changeItemsPerPage
    } = usePagination(searchStudents, 100);


    if (showForm) {
        return (
            <StudentFeeForm
                handleSubmit={handleSubmit}
                classList={classList}
                feeHeads={feeHeads}
                setShowForm={setShowForm}
                studentData={selectedStudent}
            />

        );
    }


    console.log("students currentds", currentData);



    return (

        <div className="bg-white p-4 rounded-xl">


            <div className="grid grid-cols-12 gap-5 mb-4 items-end">

                {/* Title */}
                <h2 className="col-span-12 md:col-span-3 text-xl font-bold ">
                    Student Fee Allot
                </h2>

                {/* Class Section */}
                <div className="col-span-12 md:col-span-2">
                    <ClassSelect
                        label="Class Section"
                        value={form.class_id}
                        onChange={(e) => {



                            setForm({ ...form, class_id: e.target.value })
                            getStudentAllot(e.target.value)

                        }}
                        options={[
                            { label: "---Select Class Section---", value: "" },

                            ...sectionList.map((record) => {
                                return {
                                    label: `${record.class_name ?? ""} - ${(record.section ?? "").toUpperCase()}`,
                                    value: record.id,
                                };
                            }),
                        ]}
                    />
                </div>



                {/* Search */}
                <div className="col-span-12 md:col-span-4  flex items-center border rounded-xl px-3 h-[42px] gap-5">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search Class / Name / Father"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="outline-none w-full"
                    />
                </div>

            </div>
            <div className="mt-6 w-full overflow-x-auto">

                <table className="w-full border">

                    <thead>

                        <tr className="bg-[#0860C4]  text-white text-center">
                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                #
                            </th>
                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("ststudent_id")}
                            >
                                ST. ID ⬍ </th>


                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("class_section")}
                            >
                                Class ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("students_name")}
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
                                onClick={() => handleSort("feeamount")}
                            >
                                Total Fee ⬍
                            </th>

                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("status")}
                            >
                                Status ⬍
                            </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >
                                Action
                            </th>

                        </tr>

                    </thead>
                    <tbody>

                        {currentData.length > 0 ? (

                            currentData.map((student, index) => {

                                const record = getStudentRecord(student);

                                const totalFee = getStudentTotalFee(student);

                                const hasFee = totalFee > 0;

                                return (

                                    <tr key={index} className="text-center border-t">
                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">{index + 1}</td>
                                        <td className="p-2 whitespace-nowrap">{student.student_ids}</td>

                                        {/* <td className="p-2 whitespace-nowrap">{student.srNo}</td> */}

                                        <td className="p-2 whitespace-nowrap">{student.class_section}</td>

                                        <td className="p-2 whitespace-nowrap">{student.students_name}</td>

                                        <td className="p-2 whitespace-nowrap">{student.fatherName}</td>

                                        {/* <td className="p-2 whitespace-nowrap">{student.motherName}</td> */}

                                        <td className="p-2 font-semibold text-green-600 whitespace-nowrap">
                                            ₹ {student.feeamount}
                                        </td>

                                        <td className="p-2 whitespace-nowrap">

                                            <span className={`px-2 py-1 rounded text-white ${student.feeamount ? "bg-yellow-500" : "bg-red-500"
                                                }`}>

                                                {student.feeamount ? "Allotted" : "Not Allotted"}

                                            </span>

                                        </td>

                                        <td className="p-2 flex justify-center gap-2 whitespace-nowrap">
                                            <button
                                                // onClick={() => setViewClass(student.name)}
                                                // onClick={() => setViewClass(student.students_name)}
                                                onClick={() => {
                                                    setViewClass(student.student_id);
                                                    setViewStudent(student.students_name);
                                                }}
                                                className="bg-[#0860C4]  px-3 py-1 text-white rounded"
                                            >

                                                <FaEye className="text-[1.5rem]" />

                                            </button>
                                            <button
                                                onClick={() => {

                                                    const record = records.find(
                                                        // (r) => r.studentName === student.name
                                                        (r) => r.studentName === student.students_name
                                                    );

                                                    setSelectedStudent({
                                                        ...student,
                                                        studentName: student.students_name,
                                                        student_id: student.student_id || student.student_ids,
                                                        class_section: student.class_section,
                                                        registerClass: student.registerClass,
                                                        rows: record ? record.rows : []
                                                    });

                                                    setShowForm(true);

                                                }}
                                                className={`px-3 py-1 rounded text-white ${student.feeamount ? "bg-yellow-500" : "bg-green-600 whitespace-nowrap"
                                                    }`}
                                            >

                                                {student.feeamount ? "Edit Fee" : "Allot Fee"}

                                            </button>



                                        </td>

                                    </tr>

                                )

                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No Data Found
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>

            </div>
            <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={searchStudents.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={changeItemsPerPage}
            />
            {viewClass && (

                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

                    <div className="bg-white p-6 rounded w-[700px]">

                        <h3 className="font-semibold mb-3">

                            Fee Details For {viewStudent}

                        </h3>

                        <table className="w-full border">

                            <thead>

                                <tr className="bg-[#0860C4]  text-white">

                                    <th className="p-2">Fee Head</th>
                                    {/* <th className="p-2">Frequency</th> */}
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Amount</th>

                                </tr>

                            </thead>

                            <tbody>

                                {records
                                    .find(r => Number(r.student_id) === Number(viewClass) || r.studentName === viewStudent)
                                    ?.rows
                                    ?.map((row, i) => (
                                        <tr key={i} className="border-t text-center">

                                            <td className="p-2">{row.feeHead}</td>
                                            {/* <td className="p-2">{row.feeFrequency}</td> */}
                                            <td className="p-2">{formatDate(row.frequencyDate)}</td>
                                            <td className="p-2">₹ {row.amount}</td>

                                        </tr>
                                    ))}

                            </tbody>

                        </table>

                        <button
                            onClick={() => setViewClass(null)}
                            className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

};

export default StudentFeeAllot;
