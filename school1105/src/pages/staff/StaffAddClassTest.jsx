import React, { useState, useEffect, useMemo } from "react";
import { ClassSelect, FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { FaUpload, FaFileExcel } from "react-icons/fa";
import { handleApiResponse, showError, showSuccess } from "../../Component/common/alert";

function StaffAddClassTest({ setShowForm, editData, refreshTable }) {

    const [form, setForm] = useState({
        class_id: editData?.class_id || "",
        subjectHead: editData?.subject_head_id || "",
        subject: editData?.subject_id || "",
        test: editData?.test_id || "",
        maxNo: ""
    });
    const [marks, setMarks] = useState({});

    const [sectionList, setSectionList] = useState([]);
    const [testList, settestList] = useState([]);
    const [headlist, setHeadList] = useState([]);
    const [subjectlist, setSubjectList] = useState([]);

    const [students, setStudents] = useState([]);
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    const [showExcelModal, setShowExcelModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState("");
    const [excelFile, setExcelFile] = useState(null);

    const handlestudentsclasstest = () => {



        if (!form.class_id) {
            showError("pls select class")

            return
        }
        if (!form.subject) {
            showError("pls select subject")

            return
        }
        if (!form.test) {
            showError("pls select test")

            return
        }

        let class_id = form.class_id;
        let subject_id = form.subject;
        let test_id = form.test;

        fetch(localurl + "student_class_test_details/" + school_id + "/" + session_id + "/" + class_id + "/" + subject_id + "/" + test_id)
            .then(res => res.json())
            .then(data => {
                console.log("class test", data);

                if (data.success) {
                    let datatest = data.students_data || [];
                    handleApiResponse(data)
                    if (datatest.length > 0) {
                        let marksmacx = datatest[0]['marks'];

                        setForm((form) => ({ ...form, maxNo: marksmacx }));
                    } else {
                        setForm((form) => ({ ...form, maxNo: "" }));
                    }
                    setStudents(datatest);

                } else {
                    setStudents([]);
                    setForm((form) => ({ ...form, maxNo: "" }));
                    showError(data.message || "No Data Found");
                }
            })
            .catch((err) => {
                console.error(err);
                setStudents([]);
                setForm((form) => ({ ...form, maxNo: "" }));
                showError("Error fetching data");
            });
    }

    const [allotments, setAllotments] = useState([]);

    useEffect(() => {

        if (editData) {
            setForm({
                class_id: editData.class_id || "",
                subjectHead: editData.subject_head_id || "",
                subject: editData.subject_id || "",
                test: editData.test_id || "",
                maxNo: editData.marks || ""
            });
        } else {
            setForm({
                class_id: "",
                subjectHead: "",
                subject: "",
                test: "",
                maxNo: ""
            });
            setStudents([]);
        }

        const authData = JSON.parse(localStorage.getItem("authData") || "{}");
        const staff_id = authData?.id;

        // Fetch Staff Allotments first
        fetch(localurl + "staff_period_allot/" + school_id + "/" + session_id)
            .then(res => res.json())
            .then(allotData => {
                let myAllots = [];
                let assignedClassIds = [];
                if (allotData.success && allotData.row) {
                    myAllots = allotData.row.filter(a => String(a.staff_id) === String(staff_id));
                    assignedClassIds = myAllots.map(a => String(a.class_id));
                    setAllotments(myAllots);
                }

                // 👉 CLASS
                fetch(localurl + "class_section/" + school_id)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            const activeData = data.row.filter(
                                (item) => item.status === "Active" && assignedClassIds.includes(String(item.id))
                            )
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

                // 👉 TEST
                fetch(localurl + "class_test/" + school_id + "/" + session_id)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            settestList(data.row
                                .sort((a, b) => {
                                    const diff = (a.display_order || 0) - (b.display_order || 0);
                                    if (diff === 0) {
                                        const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                                        const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                                        return String(nameA).localeCompare(String(nameB));
                                    }
                                    return diff;
                                })
                                .filter(i => i.status === "Active"));
                        }
                    });

                // 👉 SUBJECT GROUP
                fetch(localurl + "subject_group/" + school_id)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setHeadList(data.subject_name
                                .sort((a, b) => {
                                    const diff = (a.display_order || 0) - (b.display_order || 0);
                                    if (diff === 0) {
                                        const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                                        const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                                        return String(nameA).localeCompare(String(nameB));
                                    }
                                    return diff;
                                })
                                .filter(i => i.status === "Active"));
                        }
                    });

                // 👉 SUBJECT
                fetch(localurl + "subject/" + school_id)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setSubjectList(data.row
                                .sort((a, b) => {
                                    const diff = (a.display_order || 0) - (b.display_order || 0);
                                    if (diff === 0) {
                                        const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                                        const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                                        return String(nameA).localeCompare(String(nameB));
                                    }
                                    return diff;
                                })
                                .filter(i => i.status === "Active"));
                        }
                    });
            });

    }, [editData]);

    useEffect(() => {
        if (form.class_id && form.subject && form.test) {
            handlestudentsclasstest();
        }
    }, [form.class_id, form.subject, form.test]);

    const filteredSubjectList = useMemo(() => {
        let list = subjectlist;

        if (form.subjectHead) {
            const group = headlist.find(
                (item) => String(item.id) === String(form.subjectHead)
            );

            if (group?.subject_ids) {
                const subjectIds = String(group.subject_ids)
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter(Boolean);

                list = list.filter((subject) =>
                    subjectIds.includes(Number(subject.id))
                );
            } else {
                list = [];
            }
        }

        const authData = JSON.parse(localStorage.getItem("authData") || "{}");
        const staff_id = authData?.id;

        const myClassAllots = allotments.filter(a => 
            String(a.staff_id) === String(staff_id) && 
            (!form.class_id || String(a.class_id) === String(form.class_id))
        );

        const assignedSubjectIds = myClassAllots.map(a => String(a.subject_id));

        return list.filter((subject) =>
            assignedSubjectIds.includes(String(subject.id))
        );
    }, [form.subjectHead, form.class_id, headlist, subjectlist, allotments]);


    const handleMarksChange = (id, value) => {
        let maxmarks = Number(form['maxNo']) || 0;
        const numVal = Number(value) || 0;

        if (maxmarks <= 0 && value !== "") {
            showError("Please set Max No. first!");
            return;
        }

        if (value !== "" && numVal > maxmarks) {
            showError(`Marks cannot exceed maximum marks (${maxmarks})!`);
            value = "";
        }

        const newstudents = students.map((d) =>
            d.student_id === id ? { ...d, student_marks: value, student_marks_percent: maxmarks > 0 ? (value / maxmarks) * 100 : 0 } : d
        );
        setStudents(newstudents);
    };


    const handleSubmit = async (type) => {
        try {

            const invalid = students.some(
                d => Number(d.student_marks) > Number(form.maxNo)
            );

            if (invalid) {
                showError("Some students have marks greater than max marks!");
                return;
            }

            const payload = {
                session_id,
                school_id,
                test_id: form['test'],
                subject_head_id: form['subjectHead'],
                subject_id: form['subject'],
                marks: form['maxNo'],
                classsection_id: form['class_id'],
                marks_details: students.map(d => ({
                    student_id: d.student_id,
                    student_name: d.student_name,
                    father_name: d.father_name,
                    student_marks: d.student_marks
                }))
            };

            const res = await fetch(localurl + "add_student_class_test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {

                showSuccess(`✅ ${data.message || "Saved Successfully"}`);

                if (type === "exit") {
                    // refreshTable();
                    setShowForm(false)
                    setStudents([]);
                }

                if (type === "continue") {
                    setForm({
                        test: "",
                        subjectHead: "",
                        subject: "",
                        maxNo: "",
                        class_id: ""
                    });
                    setStudents([]);
                }

                if (type === "update") {
                    refreshTable();
                    setShowForm(false)
                    setStudents([]);
                }

            } else {
                showError(`❌ ${data.message || "Something went wrong"}`);
            }

        } catch (err) {
            console.error("ERROR:", err);
        }
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

        const sortedData = [...students].sort((a, b) => {
            let valA = a[key] || "";
            let valB = b[key] || "";

            if (!isNaN(valA) && !isNaN(valB)) {
                return direction === "asc" ? valA - valB : valB - valA;
            }

            return direction === "asc"
                ? valA.toString().localeCompare(valB.toString())
                : valB.toString().localeCompare(valA.toString());
        });

        setStudents(sortedData);
    };

    return (

        <section className="bg-white rounded-t-2xl max-w-full p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Class Test
                </h1>

                {!editData && (
                    <button
                        onClick={() => setShowExcelModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                        <FaFileExcel />
                        <FaUpload />
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-4 mb-6">
                {/* Filters */}
                <div className="lg:col-span-3">

                    <ClassSelect
                        label=" Class Section"
                        value={form.class_id}
                        onChange={(e) => {

                            console.log("", e.target.value);

                            setForm({ ...form, class_id: e.target.value })


                        }}
                        options={[
                            { label: "---Select Class Section---", value: "" },

                            ...sectionList.map((record) => {
                                return {
                                    label: `${record.class_name} - ${record.section}`,
                                    value: record.id,
                                };
                            }),
                        ]}
                    />                </div>

                <div className="lg:col-span-3">

                    <ClassSelect
                        label="  Subject Group"
                        value={form.subjectHead}
                        onChange={(e) => setForm({ ...form, subjectHead: e.target.value, subject: "" })}
                        options={[
                            { label: "---Select  Subject Group ---", value: "" },

                            ...headlist.map((record) => {
                                return {
                                    label: `${record.group_name}`,
                                    value: record.id,
                                };
                            }),
                        ]}
                    />                </div>

                <div className="lg:col-span-2">

                    <ClassSelect
                        label="Subject"
                        value={form.subject}


                        onChange={(e) => { setForm({ ...form, subject: e.target.value }) }}
                        options={[
                            { label: "---Select Subject---", value: "" },

                            ...filteredSubjectList.map((record) => {
                                return {
                                    label: `${record.subject_name}`,
                                    value: record.id,
                                };
                            }),
                        ]}
                    />                </div>

                <div className="lg:col-span-2">

                    <ClassSelect
                        label="test"
                        value={form.test}

                        onChange={(e) => { setForm({ ...form, test: e.target.value }) }}
                        options={[
                            { label: "---Select test---", value: "" },

                            ...testList.map((record) => {
                                return {
                                    label: `${record.test_name}`,
                                    value: record.id,
                                };
                            }),
                        ]}
                    />
                </div>
                <button
                    onClick={handlestudentsclasstest}
                    className="bg-purple-600 text-white px-6 py-2 rounded whitespace-nowrap"
                >
                    Find
                </button>
                <div className="lg:col-span-2">

                    <div className="w-[120px]">
                        <FloatingInput
                            label="Max No."
                            type="number"
                            value={form.maxNo}
                            onChange={(e) => setForm({ ...form, maxNo: e.target.value })}
                        />
                    </div>


                    {/* Excel Buttons */}
                </div>

            </div>

            {/* Students */}

            <div className="overflow-x-auto">

                <table className="min-w-full border">

                    <thead>

                        <tr className="bg-[#0860C4] text-center text-white">

                            <th onClick={() => handleSort("id")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >#</th>
                            <th onClick={() => handleSort("student_id")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >ST.ID ⬍</th>
                            <th onClick={() => handleSort("student_name")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Name ⬍</th>
                            <th onClick={() => handleSort("father_name")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Father Name ⬍</th>
                            <th onClick={() => handleSort("student_marks")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Written Marks </th>

                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Marks %</th>

                        </tr>

                    </thead>

                    <tbody>
                        {students.length > 0 ? (
                            students.map((student, index) => {

                                const studentMarks = marks[student.id] || {};

                                const written = studentMarks.written ?? "";


                                const total =
                                    (Number(studentMarks.written) || 0)
                                const max = Number(form.maxNo) || 100;



                                return (
                                    <tr key={student.id} className="text-center border-t">
                                        <td className="p-2">{index + 1}</td>
                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap"> {student.stu_prefix}{student.student_ids}</td>

                                        <td className="p-2">{student.student_name}</td>
                                        <td className="p-2">{student.father_name}</td>
                                        <td className="p-2 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={student.student_marks}
                                                onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                                                className={`border p-2 w-[80px] rounded ${student.student_marks > form['maxNo'] ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                        </td>

                                        <td className="p-2">
                                            <input
                                                value={
                                                    max > 0
                                                        ? (Number(student.student_marks_percent ?? 0).toFixed(2))
                                                        : "Enter Max"
                                                }
                                                readOnly
                                                className="border p-2 w-[80px] rounded bg-gray-100"
                                            />
                                        </td>
                                    </tr>
                                );
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
            <div className="flex flex-col sm:flex-row gap-3 mt-6">

                {editData ? (
                    <>
                        <button
                            onClick={() => handleSubmit("update")}
                            className="bg-purple-600 text-white px-6 py-2 rounded whitespace-nowrap"
                        >
                            Update
                        </button>

                        <button
                            onClick={() => {
                                refreshTable();
                                setShowForm(false);
                            }}
                            className="bg-gray-500 text-white px-6 py-2 rounded whitespace-nowrap"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => handleSubmit("exit")}
                            className="bg-green-600 text-white px-6 py-2 rounded whitespace-nowrap"
                        >
                            Save & Exit
                        </button>

                        <button
                            onClick={() => handleSubmit("continue")}
                            className="bg-purple-600 text-white px-6 py-2 rounded whitespace-nowrap"
                        >
                            Save & Continue
                        </button>

                        <button
                            onClick={() => {
                                // refreshTable();
                                setShowForm(false);
                            }}
                            className="bg-gray-500 text-white px-6 py-2 rounded whitespace-nowrap"
                        >
                            Cancel
                        </button>
                    </>
                )}

            </div>
            {showExcelModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    onClick={() => setShowExcelModal(false)}
                >
                    <div className="absolute inset-0 bg-black/40"></div>

                    <div
                        className="relative bg-white w-[95%] md:w-[60%] max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="text-lg md:text-xl font-semibold">
                                Upload Students
                            </h2>

                            <button className="text-blue-600 font-medium">
                                Download Sample
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <ClassSelect
                                label="Select Class Section"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                options={[
                                    { label: "-- Select Class Section--", value: "" },
                                    ...sectionList.map((item) => ({
                                        label: `${item.class_name} ${item.section}`,
                                        value: item.id,
                                    })),
                                ]}
                            />
                            <ClassSelect
                                label="Select Subject Head"
                                value={form.subjectHead}
                                onChange={(e) => setForm({ ...form, subjectHead: e.target.value, subject: "" })}
                                options={[
                                    { label: "---Select Fee Head ---", value: "" },

                                    ...headlist.map((record) => {
                                        return {
                                            label: `${record.group_name}`,
                                            value: record.id,
                                        };
                                    }),
                                ]}
                            />

                            <ClassSelect
                                label="Select Subject"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                options={[
                                    { label: "---Select Subject---", value: "" },

                                    ...filteredSubjectList.map((record) => {
                                        return {
                                            label: `${record.subject_name}`,
                                            value: record.id,
                                        };
                                    }),
                                ]}
                            />

                            <ClassSelect
                                label="Select test"
                                value={form.test}
                                onChange={(e) => setForm({ ...form, test: e.target.value })}
                                options={[
                                    { label: "---Select test---", value: "" },

                                    ...testList.map((record) => {
                                        return {
                                            label: `${record.test_name}`,
                                            value: record.id,
                                        };
                                    }),
                                ]}
                            />
                            
                            {/* File Upload */}
                            <FloatingInput
                                label="Upload Excel"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setExcelFile(e.target.files[0])}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (!excelFile) {
                                            alert("Please select file");
                                            return;
                                        }
                                        console.log("File:", excelFile);
                                    }}
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
        </section>

    );

}

export default StaffAddClassTest;
