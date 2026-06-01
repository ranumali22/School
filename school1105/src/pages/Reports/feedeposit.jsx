import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import FeeReceipt from "../../Component/ui/FeeReceipt";
import { localurl } from "../../api/api";
import { ClassSelect } from "../../Component/common/FloatingInput";
const FloatingSelect = ({ label, name, value, onChange, options }) => {
    return (
        <div className="relative w-full">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="peer w-full border border-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 bg-transparent"
            >
                {options.map((opt, i) => (
                    <option key={i} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>

            <label
                htmlFor={name}
                className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-600"
            >
                {label}
            </label>
        </div>
    );
};
const FeeDepositReport = () => {

    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("All Class");
    const [appliedClass, setAppliedClass] = useState("All Class");
    const [receiptData, setReceiptData] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [sortedData, setSortedData] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const session_id = localStorage.getItem("session_id");
    const school_id = localStorage.getItem("school_id");

    const [form, setForm] = useState({
        class_id: "",

    });

    const filteredData = data.filter((item) => {
        const matchSearch =
            item.student_name?.toLowerCase().includes(search.toLowerCase()) ||
            item.class_name?.toLowerCase().includes(search.toLowerCase()) ||
            `${item.stu_prefix || ""}${item.student_ids || ""}`.toLowerCase().includes(search.toLowerCase()) ||
            item.receiptNo?.toString().includes(search);

        const matchClass =
            !form.class_id || item.class_id == form.class_id;

        return matchSearch && matchClass;
    });
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
    useEffect(() => {
        fetch(localurl + "class_section/" + school_id)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setSectionList(data.row);
                }
            });
    }, [school_id]);


    useEffect(() => {
        fetch(localurl + "student_fee/" + school_id + "/" + session_id)
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                    // 🔥 ALL STUDENTS
                    const students = data.data;

                    // 🔥 ALL DEPOSITS MERGE
                    let allDeposits = [];

                    students.forEach(st => {
                        const deposits = Object.values(st?.all_amount?.[0] ?? {});

                        deposits.forEach(d => {
                            allDeposits.push({
                                ...d,
                                student_name: st.students_name,
                                class_name: st.class,
                                student_id: st.student_id,
                                class_id: st.registerClass,
                                students_name: st.students_name,
                                father_name: st.father_name,
                                class: st.class,
                                session: st.session,
                                student_ids: st.student_ids,
                                stu_prefix: st.stu_prefix
                            });
                        });
                    });

                    setData(allDeposits);   // ✅ final report data
                }
            });
    }, []);

    console.log("school_id", school_id);
    console.log("session_id", session_id);
    const {
        currentPage,
        totalPages,
        currentData,
        setCurrentPage,
        itemsPerPage,
        changeItemsPerPage,
    } = usePagination(
        sortedData.length ? sortedData : filteredData
    );
    return (
        <div className="bg-white p-4 rounded-xl">
            {/* Title */}


            {/* Controls Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
                <div className="md:col-span-3">
                    <h1 className="text-xl font-semibold mb-4 whitespace-nowrap">
                        Fee Deposite Report
                    </h1>
                </div>
                {/* Class Filter */}
                <div className="md:col-span-2">
                    <ClassSelect
                        label="Select Class"
                        value={form.class_id}
                        onChange={(e) => {
                            const val = e.target.value;
                            setForm({ ...form, class_id: val });
                        }}
                        options={[
                            { label: "All Class", value: "" },
                            ...sectionList.map((record) => ({
                                label: `${record.class_name} - ${record.section}`,
                                value: record.id,
                            })),
                        ]}
                    />
                </div>



                {/* Search */}
                <div className="md:col-span-4 items-end">
                    <div className="flex items-center flex items-center border rounded-xl px-3 py-2 gap-2 w-full">
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



            </div>
            {/* Table */}
            <div className="mt-6 w-full overflow-x-auto">
                <table className="w-full border">
                    <thead >
                        <tr className="bg-[#0860C4]  text-white text-center">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >#</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("student_id")}>ST. ID ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("student_name")}>Name ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("class_name")}>Class ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("receiptNo")}>Receipt ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("fee_pay")}>Amount ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("pay_date")}>Date ⬍</th>


                        </tr>
                    </thead>


                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((d, i) => (
                                <tr key={i} className="text-center border-t hover:bg-gray-100">

                                    <td className="px-2 md:px-4 py-2">{i + 1}</td>

                                    <td className="px-2 md:px-4 py-2 capitalize">
                                        {d.stu_prefix}{d.student_ids}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        {d.student_name}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        {d.class_name}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        {d.receiptNo}
                                    </td>

                                    <td className="px-2 md:px-4 py-2 text-green-600">
                                        ₹ {d.fee_pay}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        {d.pay_date
                                            ? new Date(d.pay_date).toLocaleDateString("en-GB")
                                            : ""}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedStudent(d);
                                                setReceiptData(d);
                                            }}
                                            className="text-blue-600 text-lg"
                                        >
                                            🖨
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer */}
                <CommonPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={changeItemsPerPage}
                />


                {receiptData && (
                    <FeeReceipt
                        student={selectedStudent}
                        deposit={receiptData}
                        close={() => setReceiptData(null)}
                    />
                )}
            </div>
        </div >
    );
};

export default FeeDepositReport;