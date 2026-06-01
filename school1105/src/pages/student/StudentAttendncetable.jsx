import React, { useEffect, useState } from "react";
import {
    ClassSelect,
    FloatingInputs,
    FloatingSelect
} from "../../Component/common/FloatingInput";
import { RiEdit2Fill } from "react-icons/ri";

import { FaSearch } from "react-icons/fa";
import { localurl } from "../../api/api";
import { showError } from "../../Component/common/alert";
import StudentAttendance from "./StudentAttendance";
import useSessionEffect from "../../hooks/useSessionEffect";

const StudentAttendancetable = () => {

    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);



    const school_id = localStorage.getItem("school_id");

    const today = new Date().toISOString().split("T")[0];
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    const [form, setForm] = useState({
        class: "",
        attendance_type: "All",
        date: today,
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

        const sortedData = [...sectionList].sort((a, b) => {
            if (typeof a[key] === "string") {
                return direction === "asc"
                    ? a[key].localeCompare(b[key])
                    : b[key].localeCompare(a[key]);
            }
            return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
        });

        setSectionList(sortedData);
    };

    // STATUS
    const getStatus = (s) => {
        if (s.in_status === "1" || s.in_status === true) return "Present";
        return "Absent";
    };
    const [showForm, setShowForm] = useState(false);
    const [sectionList, setSectionList] = useState([]);
    const [editData, setEditData] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [search, setSearch] = useState("");

    useSessionEffect(() => {
        handleAttendance(form.date);
    });



    const handleAttendance = (date = form.date) => {
        const session_id = localStorage.getItem("session_id");

        fetch(localurl + "class_attendance_list/" + school_id + "/" + session_id + "/" + date)
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                    console.log("data attend=>", data);


                    setSectionList(data.raw);
                }
                else {
                    setSectionList([]);
                }
            });
    }

    const handleAttendanceList = (class_id, date, attendance_type) => {
        const session_id = localStorage.getItem("session_id");

        if (!class_id) return;

        fetch(
            localurl +
            "student_attendance/" +
            school_id +
            "/" +
            session_id +
            "/" +
            class_id +
            "/" +
            date +
            "/" +
            attendance_type
        )
            .then(res => res.json())
            .then(data => {

                console.log("students_att", data);

                if (data.success) {

                    let att_st = data.students_data.filter((student) =>
                        student.attendance_status && student.attendance_status.trim() !== ""
                    );

                    // setSelectedStudents(att_st);
                    setSelectedStudents(data.students_data);
                } else {
                    setStudents([]);
                    showError(data.message);
                }
            });
    };

    const handleView = (class_id) => {
        const session_id = localStorage.getItem("session_id");

        setSelectedClassId(class_id);

        fetch(
            localurl +
            "student_attendance/" +
            school_id +
            "/" +
            session_id +
            "/" +
            class_id +
            "/" +
            form.date +
            "/All"
        )
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                    setSelectedStudents(data.students_data);
                    setIsStudentModalOpen(true);
                } else {
                    setSelectedStudents([]);
                    setIsStudentModalOpen(false);
                    showError(data.message);
                }
            });
    };



    if (showForm) {
        return (
            <StudentAttendance
                setShowForm={setShowForm}
                editData={editData}
                setEditData={setEditData}
                date={form.date}
                refreshList={handleAttendance}
            />
        );
    }


    return (
        <section className="bg-white rounded-t-2xl p-4">

            <div className="flex flex-col md:flex-row sm:flex-row md:items-center md:justify-between gap-4  mb-4">
                <h2 className="text-xl font-bold ">
                    Attendnce
                </h2>

                <div className="lg:col-span-2">
                    <FloatingInputs
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={(e) => {
                            const val = e.target.value;
                            setForm({ ...form, date: val });
                            handleAttendance(val);
                        }}
                    />
                </div>
                <div className="flex items-center border rounded-xl px-3 py-2 gap-2 w-full md:w-[350px]">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search Class...."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="outline-none w-full"

                    />
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#0860C4] py-2 px-4 text-white text-sm md:text-base rounded-lg whitespace-nowrap"
                >
                    Attendnce
                </button>

            </div>
            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full border">

                    <thead className="bg-[#0860C4] text-white">
                        <tr>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            ># </th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("section")}>Class ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                onClick={() => handleSort("date")}>Date ⬍</th>                         <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                > Students </th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Edit</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sectionList
                            .filter(c =>
                                `${c.section}`
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            )
                            .map((c, i) => (
                                <tr key={c.class_id} className="border-t text-center">

                                    <td className="px-2 md:px-4 py-2">
                                        {i + 1}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        {c.section}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        {form.date?.split("-").reverse().join("-")}
                                    </td>

                                    <td className="px-2 md:px-4 py-2">
                                        <button
                                            onClick={() => handleView(c.class_id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            View
                                        </button>
                                    </td>

                                    <td className="px-2 md:px-4 py-2 text-center">
                                        <RiEdit2Fill size={20}
                                            className="cursor-pointer text-blue-600 mx-auto"
                                            onClick={() => {
                                                setEditData(c);
                                                setShowForm(true);
                                            }}
                                        />
                                    </td>

                                </tr>
                            ))}
                    </tbody>

                </table>
            </div>



            {isStudentModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white w-[75%] md:w-[60%] max-h-[90vh] overflow-y-auto rounded-xl p-4">

                        {/* CLOSE BUTTON */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold"></h2>

                            <button
                                onClick={() => setIsStudentModalOpen(false)}
                                className="text-red-500 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* FILTERS */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">

                            <div className="w-full md:w-64">
                                <FloatingSelect
                                    label="Attendance Type"
                                    value={form.attendance_type}
                                    onChange={(e) => {
                                        const val = e.target.value;

                                        setForm({ ...form, attendance_type: val });

                                        handleAttendanceList(selectedClassId, form.date, val);
                                    }}
                                    options={["All", "Present", "Absent"]}
                                />
                            </div>

                            <div className="flex items-center border rounded-xl px-3 py-2 gap-2 w-full md:w-[350px]">
                                <FaSearch className="text-gray-500" />

                                <input
                                    type="text"
                                    placeholder="Search Student..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="outline-none w-full"
                                />
                            </div>

                        </div>

                        {/* TABLE */}
                        <table className="w-full border">
                            <thead className="bg-[#0860C4] text-white">
                                <tr>
                                    <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                    >#</th>
                                    <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                    >Name</th>
                                    <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                    >Status</th>
                                    <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                    >In</th>
                                    <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                                    >Out</th>
                                </tr>
                            </thead>

                            <tbody>
                                {selectedStudents
                                    .filter(s =>
                                        s.student_name.toLowerCase().includes(search.toLowerCase())
                                    )
                                    .map((s, i) => (
                                        <tr key={s.id} className="border-t text-center">
                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{i + 1}</td>
                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{s.student_name}</td>

                                            <td className={
                                                getStatus(s) === "Present"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }>
                                                {getStatus(s)}
                                            </td>

                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{s.in_time || "--"}</td>
                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{s.out_time || "--"}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                    </div>
                </div>
            )}
        </section>
    );
};

export default StudentAttendancetable;