// import React, { useEffect, useState } from "react";
// import {
//   ClassSelect,
//   FloatingInputs,
//   FloatingSelect,
// } from "../../Component/common/FloatingInput";
// import { FaSearch } from "react-icons/fa";
// import CommonPagination from "../../Component/common/Pagination";
// import { localurl } from "../../api/api";
// import { showError, showSuccess } from "../../Component/common/alert";

// const StudentAttendance = ({
//   setShowForm,
//   editData,
//   setEditData,
//   date,
//   refreshList,
// }) => {
//   const [sectionList, setSectionList] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(100);
//   const [search, setSearch] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

//   const school_id = localStorage.getItem("school_id");
//   const session_id = localStorage.getItem("session_id");

//   const [form, setForm] = useState({
//     class: editData?.class_id || "",
//     attendance_type: "All",
//     date: date ?? new Date().toISOString().split("T")[0],
//     sms: "None",
//   });

//   const handlestudentsclasstest = (class_id, date, attendance_type) => {
//     if (!class_id) return;
//     fetch(
//       `${localurl}student_attendance/${school_id}/${session_id}/${class_id}/${date}/${attendance_type}`
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           setStudents(data.students_data);
//         } else {
//           setStudents([]);
//           showError(data.message);
//         }
//       });
//   };

//   useEffect(() => {
//     // Initial fetch if class is already selected
//     if (form.class) {
//       handlestudentsclasstest(form.class, form.date, form.attendance_type);
//     }

//     // Fetch Class List
//     fetch(`${localurl}class_section/${school_id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           const activeData = data.row
//             .filter((item) => item.status === "Active")
//             .sort((a, b) => {
//               const diff = (a.display_order || 0) - (b.display_order || 0);
//               if (diff === 0) {
//                 const nameA = (a.class_name || "") + (a.section ? " " + a.section : "");
//                 const nameB = (b.class_name || "") + (b.section ? " " + b.section : "");
//                 return String(nameA).localeCompare(String(nameB));
//               }
//               return diff;
//             });
//           setSectionList(activeData);
//         }
//       });
//   }, []);

//   const handleSave = () => {
//     if (!form.class) {
//       showError("Please select a class first");
//       return;
//     }

//     const raw = JSON.stringify({
//       session_id,
//       class_id: form.class,
//       class_name: form.class,
//       school_id,
//       attendance_date: form.date,
//       attendance_details: students,
//     });

//     fetch(`${localurl}add_student_attendance`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: raw,
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         if (result.success) {
//           showSuccess(result.message);
//           handlestudentsclasstest(form.class, form.date, form.attendance_type);
//         } else {
//           showError(result.message);
//         }
//       })
//       .catch((err) => console.error(err));
//   };

//   const handleChange = (id, checked, status) => {
//     setStudents((prev) =>
//       prev.map((d) => {
//         if (Number(d.student_id) !== Number(id)) return d;

//         if (status === "in") {
//           return {
//             ...d,
//             in_status: checked ? 1 : 0,
//             out_status: checked ? d.out_status : 0,
//             attendance_status: checked ? "Present" : "Absent",
//           };
//         }

//         if (status === "out") {
//           if (Number(d.in_status) !== 1) {
//             showError("Please mark IN first");
//             return d;
//           }
//           return {
//             ...d,
//             out_status: checked ? 1 : 0,
//             attendance_status: "Present",
//           };
//         }
//         return d;
//       })
//     );
//   };

//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });

//     const sortedData = [...students].sort((a, b) => {
//       const valA = a[key] || "";
//       const valB = b[key] || "";
//       if (typeof valA === "string") {
//         return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
//       }
//       return direction === "asc" ? valA - valB : valB - valA;
//     });
//     setStudents(sortedData);
//   };

//   const filteredStudents = students.filter((s) =>
//     Object.values(s).some((val) =>
//       String(val).toLowerCase().includes(search.toLowerCase())
//     )
//   );

//   const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
//   const currentStudents = filteredStudents.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   return (
//     <section className="bg-white rounded-t-2xl max-w-full p-4">
//       <h2 className="text-3xl font-bold mb-8 text-gray-800">Students Attendance</h2>

//       {/* FILTERS GRID */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-4 mb-6">
//         <div className="lg:col-span-3">
//           <ClassSelect
//             label="Select Class"
//             value={form.class}
//             onChange={(e) => {
//               setForm({ ...form, class: e.target.value });
//               handlestudentsclasstest(e.target.value, form.date, form.attendance_type);
//             }}
//             options={[
//               { label: "---Select Class Section---", value: "" },
//               ...sectionList.map((record) => ({
//                 label: `${record.class_name} - ${record.section}`,
//                 value: record.id,
//               })),
//             ]}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <FloatingSelect
//             label="Attendance Type"
//             value={form.attendance_type}
//             onChange={(e) => {
//               setForm({ ...form, attendance_type: e.target.value });
//               handlestudentsclasstest(form.class, form.date, e.target.value);
//             }}
//             options={["All", "Present", "Absent"]}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <FloatingInputs
//             label="Date"
//             type="date"
//             value={form.date}
//             onChange={(e) => {
//               setForm({ ...form, date: e.target.value });
//               handlestudentsclasstest(form.class, e.target.value, form.attendance_type);
//             }}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <FloatingSelect
//             label="Send SMS"
//             value={form.sms}
//             onChange={(e) => setForm({ ...form, sms: e.target.value })}
//             options={["None", "All Students", "Present", "Absent Student"]}
//           />
//         </div>
//       </div>

//       {/* ACTIONS ROW */}
//         <div className="flex flex-col md:flex-row md:items-center justify-start gap-6 mb-6">
//         <div className="flex items-center border rounded-xl px-3 py-2 gap-2 w-full md:w-[400px] bg-gray-50">
//           <FaSearch className="text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search student details..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="outline-none w-full bg-transparent"
//           />
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => {
//               refreshList(form.date);
//               setShowForm(false);
//               setEditData(null);
//             }}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all"
//           >
//             Back to List
//           </button>
//           <button
//             onClick={handleSave}
//             className="bg-[#0860C4] hover:bg-[#064a9e] px-8 py-2 text-white rounded-lg font-medium transition-all"
//           >
//             Save Attendance
//           </button>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="overflow-x-auto border rounded-xl shadow-sm">
//         <table className="w-full text-sm">
//           <thead className="bg-white border-b-2 border-slate-100">
//             <tr>
//               <th className="p-3 text-center w-12">#</th>
//               <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("class_name")}>Class ↕</th>
//               <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("student_name")}>Student Name ↕</th>
//               <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("father_name")}>Father Name ↕</th>
//               <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("in_status")}>In ↕</th>
//               <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("in_time")}>Time ↕</th>
//               <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("out_status")}>Out ↕</th>
//               <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("out_time")}>Time ↕</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentStudents.length > 0 ? (
//               currentStudents.map((s, index) => (
//                 <tr key={s.student_id} className="border-t hover:bg-gray-50 transition-colors">
//                   <td className="p-3 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                   <td className="p-3 uppercase">{s.class_name}</td>
//                   <td className="p-3 font-semibold capitalize">{s.student_name?.toLowerCase()}</td>
//                   <td className="p-3 text-slate-600 capitalize">{s.father_name?.toLowerCase()}</td>
//                   <td className="p-3 text-center">
//                     <input
//                       type="checkbox"
//                       className="w-4 h-4 rounded cursor-pointer"
//                       checked={Number(s.in_status) === 1}
//                       onChange={(e) => handleChange(s.student_id, e.target.checked, "in")}
//                     />
//                   </td>
//                   <td className="p-3 text-center text-gray-500">{s.in_time || "-"}</td>
//                   <td className="p-3 text-center">
//                     <input
//                       type="checkbox"
//                       className="w-4 h-4 rounded cursor-pointer"
//                       checked={Number(s.out_status) === 1}
//                       onChange={(e) => handleChange(s.student_id, e.target.checked, "out")}
//                     />
//                   </td>
//                   <td className="p-3 text-center text-gray-500">{s.out_time || "-"}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" className="p-8 text-center text-gray-500 font-medium">
//                   No students found. Please select a class or adjust filters.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <CommonPagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//         totalItems={filteredStudents.length}
//         itemsPerPage={itemsPerPage}
//         onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
//       />
//     </section>
//   );
// };

// export default StudentAttendance;


import React, { useEffect, useState } from "react";
import {
  ClassSelect,
  FloatingInputs,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { FaSearch, FaFileExcel } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { localurl } from "../../api/api";
import { showError, showSuccess } from "../../Component/common/alert";

const StudentAttendance = ({
  setShowForm,
  editData,
  setEditData,
  date,
  refreshList,
}) => {


  const [sectionList, setSectionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [search, setSearch] = useState("");

  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    class: editData?.class_id || "",
    attendance_type: "All",
    date: date ?? new Date().toISOString().split("T")[0],
    sms: "None",
  });

  const handlestudentsclasstest = (class_id, date, attendance_type) => {
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
      attendance_type,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("dataattendance", data);

        if (data.success) {
          setStudents(data.students_data);
        } else {
          setStudents([]);
          showError(data.message);
        }
      });
  };

  useEffect(() => {

    setTimeout(() => {
      handlestudentsclasstest(form.class, form.date, form.attendance_type);
    }, 500);

    // CLASS DETAIL
    fetch(localurl + "class_section/" + school_id)
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
          })

          setSectionList(activeData);
        }
      });
  }, []);

  const handleSave = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");



    const raw = JSON.stringify({
      session_id,
      class_id: form.class,
      class_name: form.class,
      school_id,
      attendance_date: form.date,
      attendance_details: students,
    });

    console.log("payload->>>", raw);
    console.log("FINAL STUDENTS 👉", students);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(localurl + "add_student_attendance", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        const { success, message } = result;
        if (success) {
          showSuccess(message);
          handlestudentsclasstest(form.class, form.date, form.attendance_type);
        }
      })
      .catch((error) => console.error(error));
  };
  const changeItemsPerPage = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };


  const handleChange = (id, checked, status) => {
    setStudents((prev) =>
      prev.map((d) => {
        if (Number(d.student_id) !== Number(id)) return d;

        // 🔵 IN
        if (status === "in") {
          return {
            ...d,
            in_status: checked ? 1 : 0,
            out_status: checked ? d.out_status : 0,
            attendance_status: checked ? "Present" : "Absent",
          };
        }

        // 🔴 OUT
        if (status === "out") {
          if (Number(d.in_status) !== 1) {
            showError("Please mark IN first");
            return d;
          }

          return {
            ...d,
            out_status: checked ? 1 : 0,
            attendance_status: "Present", // 🔥 IMPORTANT
          };
        }

        return d;
      }),
    );
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
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setStudents(sortedData);
  };
  return (
    <section className=" bg-white  rounded-t-2xl max-w-full p-4 ">
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-2">
            <ClassSelect
              label=" Class Section"
              value={form.class}
              onChange={(e) => {
                (setForm({ ...form, class: e.target.value }),
                  handlestudentsclasstest(
                    e.target.value,
                    form.date,
                    form.attendance_type,
                  ));
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
            />
          </div>
          <div className="lg:col-span-2">
            <FloatingSelect
              label="Attendance Type"
              name="attendance_type"
              value={form.attendance_type}
              onChange={(e) => {
                (setForm({ ...form, attendance_type: e.target.value }),
                  handlestudentsclasstest(
                    form.class,
                    form.date,
                    e.target.value,
                  ));
              }}
              options={["All", "Present", "Absent"]}
            />
          </div>

          <div className="lg:col-span-2">
            <FloatingInputs
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={(e) => {
                (setForm({ ...form, date: e.target.value }),
                  handlestudentsclasstest(
                    form.class,
                    e.target.value,
                    form.attendance_type,
                  ));
              }}
            />
          </div>

          <div className="lg:col-span-2">
            <FloatingSelect
              label="Send SMS"
              name="sms"
              value={form.sms}
              onChange={(e) => setForm({ ...form, sms: e.target.value })}
              options={["None", "All Students", "Present", "Absent Student"]}
            />
          </div>
          <div className="lg:col-span-2"></div>
        </div>

        <div className="flex flex-col md:flex-row sm:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold">Students Attendance</h1>

          <div className="flex items-center border rounded-xl px-3 py-2 gap-2 w-full md:w-[350px]">
            <FaSearch className="text-gray-500" />

            <input
              type="text"
              placeholder="Search Id/Sr no / Name / Father/Nubmer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-full"
            />
          </div>
          <button
            onClick={() => {
              refreshList(form.date);
              setShowForm(false);
              setEditData(null);
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Back to List
          </button>
          <div className="flex gap-2">
            <button
              // onClick={() => handleSave(true)}
              onClick={handleSave}
              className="bg-[#0860C4] py-2 px-4 text-white text-sm md:text-base rounded-lg whitespace-nowrap"
            >
              Save Attendance
            </button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full border">
            <thead className="bg-[#0860C4] text-white">
              <tr>
                <th className="p-3">#</th>
                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("class_name")}
                >
                  Class ⬍
                </th>
                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("student_name")}
                >
                  Name ⬍
                </th>
                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("father_name")}
                >
                  Father Name ⬍
                </th>

                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("in_status")}
                >
                  In ⬍
                </th>
                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("in_time")}
                >
                  Time ⬍
                </th>
                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("out_status")}
                >
                  Out ⬍{" "}
                </th>
                <th
                  className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort("out_time")}
                >
                  Time ⬍
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, index) => (
                <tr key={s.student_id + "_" + index} className="border-t">
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.class_name}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.student_name}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.father_name}
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      // checked={s.in_status === "1" || s.in_status === true}
                      checked={Number(s.in_status) === 1}
                      onChange={(e) =>
                        handleChange(s.student_id, e.target.checked, "in")
                      }
                    />
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {" "}
                    {s.in_time}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      // checked={s.out_status === "1" || s.out_status === true}
                      checked={Number(s.out_status) === 1}
                      onChange={(e) =>
                        handleChange(s.student_id, e.target.checked, "out")
                      }
                    />
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {" "}
                    {s.out_time}
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

export default StudentAttendance;




