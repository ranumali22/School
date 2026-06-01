import React, { useState, useEffect } from "react";
import { ClassSelect, FloatingInputs } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import CommonPagination from "../../Component/common/Pagination";
const AttendanceReport = () => {
    const [students] = useState([
        {
            id: 1,
            name: "Aahana",

            present: 10,
            absent: 15
        },
        {
            id: 2,
            name: "Aarav Yadav",

            present: 12,
            absent: 13
        }
    ]);
    const [form, setForm] = useState({
        class: "",
        month: ""

    });
    const [sectionList, setSectionList] = useState([]);
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(students.length / itemsPerPage);



    const changeItemsPerPage = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };
    useEffect(() => {
        fetch(localurl + "class_section/" + school_id)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const activeData = data.row.filter(
                        (item) => item.status === "Active",
                    );

                    setSectionList(activeData);


                }
            });

    }, []);

    return (
        <section className=" bg-white  rounded-t-2xl max-w-full p-4 ">

            <div className="overflow-x-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 gap-4 flex-nowrap">

                    <h1 className="text-lg md:text-2xl font-bold whitespace-nowrap">
                        Attendance Report
                    </h1>

                 

                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

                    <ClassSelect
                        label="Select Class"
                        value={form.class}
                        onChange={(e) => { setForm({ ...form, class: e.target.value }) }}
                        options={[
                            { label: "---Select Class Section---", value: "" },

                            ...sectionList.map((record) => {
                                return {
                                    label: `${record.class_name} - ${record.section}`,
                                    value: record.id,
                                };
                            }),
                        ]}
                    />

                    <FloatingInputs
                        label="Month"
                        type="Month"
                        name="month"
                        value={form.month}
                        onChange={(e) => { setForm({ ...form, month: e.target.value }) }}

                    />



                    <button className="bg-[#0860C4] hover:bg-blue-700 text-white px-4 py-2 rounded-lg h-[42px] mt-auto">
                        Show
                    </button>

                </div>

                {/* Info */}
                <div className="mb-4 text-gray-600 font-medium">
                    Class : <span className="font-semibold">II - A</span> | Month :{" "}
                    <span className="font-semibold">April</span>
                </div>

                {/* Table */}
                <div className=" overflow-x-auto">
                    <table className="min-w-full table-auto border">
                        <thead className="bg-[#0860C4] text-white sticky top-0">
                            <tr>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">#</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">ST. ID ⬍</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Name ⬍</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">1</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">2</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">3</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">4</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">5</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">6</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">7</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">8</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">9</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">10</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">11</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">12</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">13</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">14</th>


                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Present ⬍</th>
                                <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Absent ⬍</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.map((s, index) => (
                                <tr
                                    key={s.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">{s.st_id}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">{s.name}</td>

                                    <td className="px-2 md:px-4 py-2 whitespace-nowra text-red-600 font-semibold">s</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap text-red-600 font-semibold">s</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap text-red-600 font-semibold">s</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap font-medium">p</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap text-green-600 font-semibold">
                                        {s.present}
                                    </td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap text-red-500 font-semibold">
                                        {s.absent}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={students.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={changeItemsPerPage}
            />
        </section>
    );
};

export default AttendanceReport;