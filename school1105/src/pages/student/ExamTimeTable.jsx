import React, { useState, useEffect } from "react";
import { ClassSelect, FloatingInput } from "../../Component/common/FloatingInput";
import { IoClose } from "react-icons/io5";
import { localurl } from "../../api/api";
import { handleApiResponse, showError, showSuccess } from "../../Component/common/alert";

const ExamTimeTable = () => {
    const [sectionList, setSectionList] = useState([]);
    const [examList, setExamList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [subjectGroupList, setSubjectGroupList] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        class_id: "",
        exam_id: "",
        group_id: "",
    });

    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    useEffect(() => {
        if (school_id && session_id) {
            getMasters();
        }
    }, [school_id, session_id]);
    

    const getMasters = async () => {
        try {
            // Fetch Classes
            const classRes = await fetch(localurl + "class_section/" + school_id);
            const classData = await classRes.json();
            if (classData.success) {
                setSectionList(classData.row.filter(c => c.status === "Active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            }

            // Fetch Exams
            const examRes = await fetch(localurl + "main_exam/" + school_id + "/" + session_id);
            const examData = await examRes.json();
            if (examData.success) {
                setExamList(examData.row.filter(e => e.status === "Active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            }

            const subRes = await fetch(localurl + "subject/" + school_id);
            const subData = await subRes.json();
            if (subData.success) {
                setSubjectsList(subData.row || subData.rows || []);
            }

            const groupRes = await fetch(localurl + "subject_group/" + school_id);
            const groupData = await groupRes.json();
            if (groupData.success) {
                setSubjectGroupList((groupData.subject_name || []).filter(g => g.status === "Active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            }
        } catch (error) {
            console.error("Error fetching masters:", error);
        }
    };

    const handleFind = async () => {
        if (!form.class_id || !form.exam_id) {
            showError("Please select both Class and Exam");
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch saved timetable data
            const res = await fetch(`${localurl}exam_timetable/${school_id}/${session_id}/${form.class_id}/${form.exam_id}`);
            const data = await res.json();

            // 2. FETCH CLASS-SPECIFIC SUBJECTS CAREFULLY
            const allotmentRes = await fetch(`${localurl}student_subject_allot/${school_id}/${session_id}`);
            const allotmentData = await allotmentRes.json();

            const studentRes = await fetch(`${localurl}students/${school_id}/${session_id}`);
            const studentData = await studentRes.json();

            let classSubjectIds = new Set();

            if (studentData.success && allotmentData.success) {
                const classStudentIds = (studentData.row || []).filter(s => String(s.registerClass) === String(form.class_id)).map(s => s.id);
                (allotmentData.data || []).forEach(allot => {
                    if (classStudentIds.includes(allot.student_id) && allot.subject_id) {
                        allot.subject_id.split(",").forEach(id => classSubjectIds.add(String(id).trim()));
                    }
                });
            }

            let relevantSubjects = subjectsList;
            if (classSubjectIds.size > 0) {
                relevantSubjects = subjectsList.filter(sub => classSubjectIds.has(String(sub.id)));
            }

            setClassSubjects(relevantSubjects);

            // Create base list from relevant subjects
            const allSubjects = relevantSubjects.map((sub) => ({
                subject_id: sub.id,
                subject_name: sub.subject_name,
                exam_date: "",
                start_time: "",
                end_time: "",
            }));

            if (data.success && data.row && data.row.length > 0) {
                // Only show rows that have been saved in the database
                const savedData = data.row.map((saved) => {
                    const subInfo = relevantSubjects.find(s => String(s.id) === String(saved.subject_id));
                    return {
                        ...saved,
                        subject_name: subInfo ? subInfo.subject_name : saved.subject_name
                    };
                });
                setTimetable(savedData);
            } else {
                // Instead of auto-filling all subjects, start with one empty row
                setTimetable([{
                    subject_id: "",
                    subject_name: "",
                    exam_date: "",
                    start_time: "",
                    end_time: "",
                }]);
            }
        } catch (error) {
            console.error("Error fetching timetable:", error);
            setTimetable([]);
        } finally {
            setLoading(false);
        }
    };

    const addNewRow = () => {
        setTimetable([...timetable, {
            subject_id: "",
            subject_name: "",
            exam_date: "",
            start_time: "",
            end_time: "",
        }]);
    };

    const removeRow = (index) => {
        const newData = [...timetable];
        newData.splice(index, 1);
        setTimetable(newData);
    };

    const handleDataChange = (index, field, value) => {
        const newData = [...timetable];
        newData[index][field] = value;

        // If subject_id changes, update subject_name as well for consistency
        if (field === "subject_id") {
            const selected = classSubjects.find(s => String(s.id) === String(value));
            if (selected) {
                newData[index].subject_name = selected.subject_name;
            }
        }

        setTimetable(newData);
    };

    const handleSave = async () => {
        if (timetable.length === 0) {
            showError("No data to save");
            return;
        }

        const payload = {
            school_id,
            session_id,
            class_id: form.class_id,
            exam_id: form.exam_id,
            timetable_details: timetable.filter(t => t.exam_date || t.start_time || t.end_time)
        };

        try {
            const res = await fetch(localurl + "add_exam_timetable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            handleApiResponse(data);
        } catch (error) {
            showError("Failed to save Exam Time Table");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-full p-6 min-h-[80vh]">
            <h2 className="text-xl font-bold text-black mb-6">Exam Time Table</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-end">
                <div className="md:col-span-3">
                    <ClassSelect
                        label="Class Section"
                        value={form.class_id}
                        onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                        options={[
                            { label: "Select Class Section", value: "" },
                            ...sectionList.map((c) => ({
                                label: `${c.class_name} - ${c.section}`,
                                value: c.id,
                            })),
                        ]}
                    />
                </div>
                <div className="md:col-span-3">
                    <ClassSelect
                        label="Subject Group"
                        value={form.group_id}
                        onChange={(e) => setForm({ ...form, group_id: e.target.value })}
                        options={[
                            { label: "All Groups", value: "" },
                            ...subjectGroupList.map((g) => ({
                                label: g.group_name,
                                value: g.id,
                            })),
                        ]}
                    />
                </div>
                <div className="md:col-span-3">
                    <ClassSelect
                        label="Exam"
                        value={form.exam_id}
                        onChange={(e) => setForm({ ...form, exam_id: e.target.value })}
                        options={[
                            { label: "Select Exam", value: "" },
                            ...examList.map((e) => ({
                                label: e.exam_name,
                                value: e.id,
                            })),
                        ]}
                    />
                </div>
                <div className="md:col-span-3">
                    <button
                        onClick={handleFind}
                        className="w-full bg-[#0860C4] hover:bg-blue-700 text-white py-2.5 px-6 rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        Find
                    </button>
                </div>
            </div>

            {/* Table */}
            {timetable.length > 0 && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr>
                                    <th>S. No.</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {timetable.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-700 font-medium">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={row.subject_id}
                                                onChange={(e) => handleDataChange(index, "subject_id", e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 capitalize py-1.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            >
                                                <option value="">Select Subject</option>
                                                {classSubjects.filter((sub) => {
                                                    if (!form.group_id) return true;
                                                    const group = subjectGroupList.find(g => String(g.id) === String(form.group_id));
                                                    if (group && group.subject_ids) {
                                                        const groupSubjectIds = String(group.subject_ids).split(",").map(Number);
                                                        return groupSubjectIds.includes(Number(sub.id));
                                                    }
                                                    return false;
                                                }).map((sub) => (
                                                    <option key={sub.id} value={sub.id}>
                                                        {sub.subject_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="date"
                                                value={row.exam_date ? row.exam_date.split('T')[0] : ""}
                                                onChange={(e) => handleDataChange(index, "exam_date", e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                value={row.start_time || ""}
                                                onChange={(e) => handleDataChange(index, "start_time", e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                value={row.end_time || ""}
                                                onChange={(e) => handleDataChange(index, "end_time", e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => removeRow(index)}
                                                className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-full border border-red-200"
                                                title="Remove Subject"
                                            >
                                                <IoClose size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-start gap-4">
                        <button
                            onClick={handleSave}
                            className="bg-[#0860C4] hover:bg-blue-700 text-white py-2.5 px-8 rounded-xl shadow-lg active:scale-95"
                        >
                            Save Timetable
                        </button>
                        <button
                            onClick={addNewRow}
                            className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-8 rounded-xl shadow-lg active:scale-95"
                        >
                            + Add Subject
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0860C4]"></div>
                </div>
            )}
        </div>
    );
};

export default ExamTimeTable;
