import React, { useState, useEffect } from "react";
import { FaSearch, FaDownload } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import FeeReceipt from "../../Component/ui/FeeReceipt";
import { localurl } from "../../api/api";
import { ClassSelect } from "../../Component/common/FloatingInput";

const FeeDueReport = () => {
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    const [data, setData] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [appliedClass, setAppliedClass] = useState("");
    const [dueData, setDueData] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Fetch classes and student due balance on load
    useEffect(() => {
        if (!school_id) return;

        // Fetch Class Sections
        fetch(localurl + "class_section/" + school_id)
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    setSectionList(resData.row || []);
                }
            });

        // Fetch Student Fee Records
        // fetch(localurl + "student_fee/" + school_id + "/" + session_id)
        fetch(
            localurl +
            "student_fee/" +
            school_id +
            "/" +
            session_id +
            "/" +
            (appliedClass || 0)
        )
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    // Filter students with outstanding balance
                    const dueStudents = resData.data
                        .filter(st => parseFloat(st.Balance || 0) > 0)
                        .map(st => ({
                            id: st.student_id,
                            student_ids: st.student_ids,
                            stu_prefix: st.stu_prefix,
                            name: st.students_name,
                            father: st.father_name,
                            class: st.class,
                            class_id: st.registerClass,
                            recNo: st.primaryNo || "-", // Use primaryNo as mobile contact
                            amount: parseFloat(st.Balance || 0).toFixed(2),
                            date: new Date().toLocaleDateString("en-GB"),
                            // Extra fields for compatibility with FeeReceipt
                            students_name: st.students_name,
                            father_name: st.father_name,
                            session: st.session
                        }));
                    setData(dueStudents);
                }
            });
    }, [school_id, session_id]);

    const filteredData = data.filter((item) => {
        const matchSearch =
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.father?.toLowerCase().includes(search.toLowerCase()) ||
            item.class?.toLowerCase().includes(search.toLowerCase()) ||
            `${item.stu_prefix || ""}${item.student_ids || ""}`.toLowerCase().includes(search.toLowerCase());

        const matchClass =
            !appliedClass || item.class_id == appliedClass;

        return matchSearch && matchClass;
    });

    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const [sortedData, setSortedData] = useState([]);

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });

        const sorted = [...filteredData].sort((a, b) => {
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

        setSortedData(sorted);
    };

    const {
        currentPage,
        totalPages,
        currentData,
        setCurrentPage,
        itemsPerPage,
        changeItemsPerPage,
    } = usePagination(sortedData.length ? sortedData : filteredData);

    return (
        <div className="bg-white p-4 rounded-xl">

            {/* Controls Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">

                <div className="md:col-span-2">
                    <h1 className="text-xl font-semibold mb-4 whitespace-nowrap">
                        Fee Due Report
                    </h1>
                </div>

                {/* Class Filter */}
                <div className="md:col-span-2">
                    <ClassSelect
                        label="Class Section"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        // options={[
                        //     { label: "All Class", value: "" },
                        //     ...(sectionList || []).map((record) => ({
                        //         label: `${record.class_name} - ${record.section}`,
                        //         value: record.id,
                        //     })),
                        // ]}

                        options={[
                            { label: "All Class", value: "" },
                            ...(sectionList || []).map((record) => ({
                                label: `${record.class_name} - ${record.section}`,
                                value: record.class_id,
                            })),
                        ]}
                    />
                </div>

                {/* Find Button */}
                <div className="md:col-span-1">
                    <button
                        type="button"
                        onClick={() => setAppliedClass(selectedClass)}
                        className="bg-[#0860C4] text-white px-4 py-2 rounded w-full"
                    >
                        Find
                    </button>
                </div>

                {/* Search */}
                <div className="md:col-span-4">
                    <div className="flex items-center border rounded-xl px-3 py-2 gap-2 w-full">
                        <FaSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search Class / Name / Father"
                            className="outline-none w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* ✅ Send Notification Button */}
                <div className="md:col-span-2">
                    <button
                        onClick={() => {
                            if (selectedStudents.length === 0) {
                                alert("Please select at least one student");
                            } else {
                                alert(`Notification sent to ${selectedStudents.length} selected students.`);
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                    >
                        Send
                    </button>
                </div>
                <div className="">
                    <button
                        className=" text-white p-2 rounded"
                    >
                        <FaDownload size={25} color="green" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="mt-6 w-full overflow-x-auto">
                <table className="w-full border text-[14px]">
                    <thead>
                        <tr className="bg-[#0860C4] text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">S. No. ⬍</th>
                            <th onClick={() => handleSort("student_ids")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">ST. ID. ⬍</th>
                            <th onClick={() => handleSort("name")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">Name ⬍</th>
                            <th onClick={() => handleSort("father")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">F'Name ⬍</th>
                            <th onClick={() => handleSort("class")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">Class ⬍</th>
                            <th onClick={() => handleSort("recNo")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">Mobile No. ⬍</th>
                            <th onClick={() => handleSort("amount")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">Due Amt. ⬍</th>
                            <th onClick={() => handleSort("date")} className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer"> Due Date ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium whitespace-nowrap cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filteredData.length > 0 && selectedStudents.length === filteredData.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedStudents(filteredData.map(item => item.id));
                                        } else {
                                            setSelectedStudents([]);
                                        }
                                    }}
                                />
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((item, index) => (
                                <tr key={index} className="text-center border-t hover:bg-gray-100">
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap capitalize">
                                        {item.stu_prefix}{item.student_ids}
                                    </td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.name}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.father}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.class}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.recNo}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">₹ {item.amount}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item.date}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(item.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudents([...selectedStudents, item.id]);
                                                } else {
                                                    setSelectedStudents(selectedStudents.filter(id => id !== item.id));
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="py-4 text-center text-gray-500 font-medium">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>

                {/* Pagination */}
                <CommonPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={changeItemsPerPage}
                />

                {/* Receipt */}
                {dueData && (
                    <FeeReceipt
                        student={selectedStudent}
                        due={dueData}
                        close={() => setDueData(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default FeeDueReport;