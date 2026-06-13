import React, { useState, useEffect, useMemo } from "react";
import { ClassSelect, FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { FaUpload, FaFileExcel } from "react-icons/fa";
import { handleApiResponse, showError, showSuccess } from "../../Component/common/alert";
function StaffAddMainExamMarks({ setShowForm, editData, refreshTable }) {


    const [form, setForm] = useState({
        class_id: "",
        subjectHead: "",
        subject: "",
        exam: "",
        maxNo: "",
        VivaMaxNo: "",
        PracticalMaxNo: "",
    });

    const [sectionList, setSectionList] = useState([]);
    const [examList, setExamList] = useState([]);
    const [headlist, setHeadList] = useState([]);
    const [subjectlist, setSubjectList] = useState([]);


    const [marks, setMarks] = useState({});

    const [students, setStudents] = useState([]);
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    // const [showExcelModal, setShowExcelModal] = useState(false);
    // const [selectedClass, setSelectedClass] = useState("");
    // const [excelFile, setExcelFile] = useState(null);

    const handlestudentsclasstest = () => {

        if (!form.class_id) {
            showError("pls select class")

            return
        }
        if (!form.subjectHead) {
            showError("pls select subject Head")

            return
        }
        if (!form.subject) {
            showError("pls select subject")

            return
        }
        if (!form.exam) {
            showError("pls select exam")

            return
        }

        let class_id = form.class_id;
        let subject_id = form.subject;
        let test_id = form.exam;

        fetch(localurl + "student_main_exam_details/" + school_id + "/" + session_id + "/" + class_id + "/" + subject_id + "/" + test_id)
            .then(res => res.json())
            .then(data => {
                console.log("Exam class student data", data);
                if (data.success) {
                    let datatest = data.students_data || [];
                    handleApiResponse(data)
                    if (datatest.length > 0) {
                        let maxNo = datatest[0]['marks'];

                        let VivaMaxNo = datatest[0]['viva'];
                        let PracticalMaxNo = datatest[0]['practical'];

                        setForm((form) => ({ ...form, maxNo, VivaMaxNo, PracticalMaxNo }));
                    } else {
                        setForm((form) => ({ ...form, maxNo: "", VivaMaxNo: "", PracticalMaxNo: "" }));
                    }
                    setStudents(datatest);

                } else {
                    setStudents([]);
                    setForm((form) => ({ ...form, maxNo: "", VivaMaxNo: "", PracticalMaxNo: "" }));
                    showError(data.message || "No Data Found");
                }
            })
            .catch((err) => {
                console.error(err);
                setStudents([]);
                setForm((form) => ({ ...form, maxNo: "", VivaMaxNo: "", PracticalMaxNo: "" }));
                showError("Error fetching data");
            });
    }



    const [allotments, setAllotments] = useState([]);

    useEffect(() => {
        // handlestudentsclasstest();




        if (editData) {
            setForm({
                class_id: editData.class_id || "",
                subjectHead: editData.subject_head_id || "",
                subject: editData.subject_id || "",
                exam: editData.test_id || "",
                maxNo: editData.marks || ""

            });
        } else {
            setForm({
                class_id: "",
                subjectHead: "",
                subject: "",
                exam: "",

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

                // CLASS DETAIL
                fetch(localurl + "class_section/" + school_id)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            const activeData = data.row.filter(
                                (item) => item.status === "Active" && assignedClassIds.includes(String(item.id))
                            ).sort((a, b) => {
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


                // main_exam
                fetch(localurl + "main_exam/" + school_id + "/" + session_id)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            const activeData = data.row.filter(
                                (item) => item.status === "Active",
                            ).sort((a, b) => {
                                const diff = (a.display_order || 0) - (b.display_order || 0);
                                if (diff === 0) {
                                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                                    return String(nameA).localeCompare(String(nameB));
                                }
                                return diff;
                            });

                            setExamList(activeData);


                        }
                    });
                // feehead
                fetch(localurl + "subject_group/" + school_id)
                    .then((res) => res.json())
                    .then((data) => {




                        if (data.success) {
                            const activeData = data.subject_name.filter(
                                (item) => item.status === "Active",
                            ).sort((a, b) => {
                                const diff = (a.display_order || 0) - (b.display_order || 0);
                                if (diff === 0) {
                                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                                    return String(nameA).localeCompare(String(nameB));
                                }
                                return diff;
                            });

                            setHeadList(activeData);


                        }
                    });
                // subject
                fetch(localurl + "subject/" + school_id)
                    .then((res) => res.json())
                    .then((data) => {




                        if (data.success) {
                            const activeData = data.row.filter(
                                (item) => item.status === "Active",
                            ).sort((a, b) => {
                                const diff = (a.display_order || 0) - (b.display_order || 0);
                                if (diff === 0) {
                                    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                                    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                                    return String(nameA).localeCompare(String(nameB));
                                }
                                return diff;
                            });

                            setSubjectList(activeData);


                        }
                    });
            });

    }, []);
    useEffect(() => {
        if (form.class_id && form.subject && form.exam) {
            handlestudentsclasstest();
        }
    }, [form.class_id, form.subject, form.exam]);

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





    const handleMarksChange = (id, field, value) => {
        const numVal = Number(value) || 0;

        if (field === "written") {
            const maxVal = Number(form.maxNo) || 0;
            if (maxVal <= 0 && value !== "") {
                showError("Please set Written Max No. first!");
                value = "";
            } else if (value !== "" && numVal > maxVal) {
                showError(`Written marks cannot exceed maximum marks (${maxVal})!`);
                value = "";
            }
            const newstudents = students.map((d) =>
                d.student_id === id ? { ...d, student_marks: value } : d
            );
            setStudents(newstudents);
        }
        if (field === "viva") {
            const maxVal = Number(form.VivaMaxNo) || 0;
            if (maxVal <= 0 && value !== "") {
                showError("Please set Viva Max No. first!");
                value = "";
            } else if (value !== "" && numVal > maxVal) {
                showError(`Viva marks cannot exceed maximum marks (${maxVal})!`);
                value = "";
            }
            const newstudents = students.map((d) =>
                d.student_id === id ? { ...d, student_viva: value } : d
            );
            setStudents(newstudents);
        }
        if (field === "practical") {
            const maxVal = Number(form.PracticalMaxNo) || 0;
            if (maxVal <= 0 && value !== "") {
                showError("Please set Practical Max No. first!");
                value = "";
            } else if (value !== "" && numVal > maxVal) {
                showError(`Practical marks cannot exceed maximum marks (${maxVal})!`);
                value = "";
            }
            const newstudents = students.map((d) =>
                d.student_id === id ? { ...d, student_practical: value } : d
            );
            setStudents(newstudents);
        }
    };


    const handleSubmit = async (type) => {


        try {
            const { class_id,
                subjectHead,
                subject,
                exam,
                maxNo,
                VivaMaxNo,
                PracticalMaxNo } = form;

            const invalidWritten = students.some(d => Number(d.student_marks) > Number(maxNo));
            const invalidViva = students.some(d => Number(d.student_viva) > Number(VivaMaxNo));
            const invalidPractical = students.some(d => Number(d.student_practical) > Number(PracticalMaxNo));

            if (invalidWritten) {
                showError(`Some students have written marks greater than maximum marks (${maxNo})!`);
                return;
            }
            if (invalidViva) {
                showError(`Some students have viva marks greater than maximum marks (${VivaMaxNo})!`);
                return;
            }
            if (invalidPractical) {
                showError(`Some students have practical marks greater than maximum marks (${PracticalMaxNo})!`);
                return;
            }

            const payload = {
                session_id,
                school_id,
                test_id: exam,
                subject_head_id: subjectHead,
                subject_id: subject,
                marks: maxNo,
                viva: VivaMaxNo,
                practical: PracticalMaxNo,
                classsection_id: class_id,
                marks_details: students.map(d => ({
                    "student_id": d['student_id'],
                    "student_name": d['student_name'],
                    "father_name": d['father_name'],
                    "student_viva": d['student_viva'],
                    "student_practical": d['student_practical'],
                    "student_marks": d['student_marks'],
                    "total": d['total'],
                    "percentage": d['percentage']
                }))
            };




            const res = await fetch(localurl + "add_student_main_exam", {
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
                    setShowForm(false);
                    setStudents([]);


                }

                if (type === "continue") {
                    setForm({
                        class_id: "",
                        subjectHead: "",
                        subject: "",
                        exam: "",
                        maxNo: "",
                        VivaMaxNo: "",
                        PracticalMaxNo: "",
                    });

                    setStudents([]);
                }

                if (type === "update") {
                    refreshTable();
                    setShowForm(false);
                    setStudents([]);
                }

            } else {
                showError(`❌ ${data.message || "Something went wrong"}`);
            }

        } catch (err) {
            console.error("ERROR:", err);
            alert("❌ Server Error");
        }
    };





    return (
        <section className="bg-white rounded-t-2xl max-w-full p-4">


            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold ">
                    Main Exam
                </h1>

            </div>
            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-4 mb-6">

                {/* Class */}
                <div className="lg:col-span-3">
                    <ClassSelect
                        label="Class Section"
                        value={form.class_id}
                        onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                        options={[
                            { label: "---Select Class Section---", value: "" },
                            ...sectionList.map((record) => ({
                                label: `${record.class_name} - ${record.section}`,
                                value: record.id,
                            })),
                        ]}
                    />
                </div>

                {/* Subject Head */}
                <div className="lg:col-span-3">
                    <ClassSelect
                        label="Subject Group"
                        value={form.subjectHead}
                        onChange={(e) => setForm({ ...form, subjectHead: e.target.value, subject: "" })}
                        options={[
                            { label: "---Select  Subject Group ---", value: "" },
                            ...headlist.map((record) => ({
                                label: `${record.group_name}`,
                                value: record.id,
                            })),
                        ]}
                    />
                </div>

                {/* Subject */}
                <div className="lg:col-span-2">
                    <ClassSelect
                        label="Subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        options={[
                            { label: "---Select Subject---", value: "" },
                            ...filteredSubjectList.map((record) => ({
                                label: `${record.subject_name}`,
                                value: record.id,
                            })),
                        ]}
                    />
                </div>

                {/* Exam */}
                <div className="lg:col-span-2">
                    <ClassSelect
                        label="Exam"
                        value={form.exam}
                        onChange={(e) => setForm({ ...form, exam: e.target.value })}
                        options={[
                            { label: "---Select Exam---", value: "" },
                            ...examList.map((record) => ({
                                label: `${record.exam_name}`,
                                value: record.id,
                            })),
                        ]}
                    />
                </div>
                <button
                    onClick={handlestudentsclasstest}
                    className="bg-purple-600 text-white px-6 py-2 rounded whitespace-nowrap"
                >
                    Find
                </button>
                {/* Max No */}
                <div className="lg:col-span-2">
                    <FloatingInput
                        label="	Written Max No. "
                        type="number"
                        value={form.maxNo}
                        onChange={(e) => setForm({ ...form, maxNo: e.target.value })}
                    />
                </div>
                <div className="lg:col-span-2">
                    <FloatingInput
                        label="Viva Max No."
                        type="number"
                        value={form.VivaMaxNo}
                        onChange={(e) => setForm({ ...form, VivaMaxNo: e.target.value })}
                    />
                </div>
                <div className="lg:col-span-2">
                    <FloatingInput
                        label="Practical Max No. "
                        type="number"
                        value={form.PracticalMaxNo}
                        onChange={(e) => setForm({ ...form, PracticalMaxNo: e.target.value })}
                    />
                </div>

            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">

                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-[#0860C4] text-center text-white">
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">#</th>
                            <th
                                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">ST.ID</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Name</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Father Name</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Written Marks</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Viva</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Practical Marks</th>
                            <th className="px-2 md:px-3 py-2">Total</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Marks %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student, index) => {
                                const total =
                                    (Number(student.student_marks) || 0) +
                                    (Number(student.student_viva) || 0) +
                                    (Number(student.student_practical) || 0);

                                const total_mark = Number(student.marks) + Number(student.viva) + Number(student.practical)
                                const max = total_mark;
                                const percentage =
                                    max > 0 ? ((total / total_mark) * 100).toFixed(2) : "";
                                return (
                                    <tr key={student.id} className="text-center border-t">
                                        <td className="p-2 whitespace-nowrap">{index + 1}</td>
                                        <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                                            {student.stu_prefix}{student.student_ids || student.student_id}
                                        </td>
                                        <td className="p-2 whitespace-nowrap">{student.student_name}</td>
                                        <td className="p-2 whitespace-nowrap">{student.father_name}</td>
                                        <td className="p-2 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={student.student_marks}
                                                onChange={(e) => handleMarksChange(student.student_id, "written", e.target.value)}
                                                className={`border p-2 w-[80px] rounded ${Number(student.student_marks) > Number(form.maxNo) ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={student.student_viva}
                                                onChange={(e) => handleMarksChange(student.student_id, "viva", e.target.value)}
                                                className={`border p-2 w-[80px] rounded ${Number(student.student_viva) > Number(form.VivaMaxNo) ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={student.student_practical}
                                                onChange={(e) => handleMarksChange(student.student_id, "practical", e.target.value)}
                                                className={`border p-2 w-[80px] rounded ${Number(student.student_practical) > Number(form.PracticalMaxNo) ? "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                value={total}
                                                readOnly
                                                className="border p-2 w-[80px] rounded bg-gray-100"
                                            /></td>
                                        <td className="p-2">
                                            <input
                                                value={max > 0 ? `${percentage}` : "Enter Max"}
                                                readOnly
                                                className="border p-2 w-[80px] rounded bg-gray-100"
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No Data Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>

            {/* Buttons */}
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
                                // refreshTable();
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
                            className="bg-[#0860C4] text-white px-4 py-2 rounded whitespace-nowrap"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>


        </section>
    );
}

export default StaffAddMainExamMarks;
