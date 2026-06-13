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

const StaffStudentAttendance = ({
  setShowForm,
  editData,
  setEditData,
  date,
  refreshList,
}) => {


  const [sectionList, setSectionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

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

    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const staff_id = authData?.id;

    // Fetch CLASS DETAIL to find assigned classes
    fetch(localurl + "class_detail/" + school_id)
      .then((res) => res.json())
      .then((detailData) => {
        let assignedClassIds = [];
        if (detailData.success && detailData.row) {
          assignedClassIds = detailData.row
            .filter((cd) => String(cd.teacher_id) === String(staff_id))
            .map((cd) => String(cd.class_id));
        }

        // Fetch CLASS SECTION and filter by assigned classes
        fetch(localurl + "class_section/" + school_id)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              const activeData = data.row
                .filter((item) => item.status === "Active" && assignedClassIds.includes(String(item.id)))
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
  const searchedStudents = React.useMemo(() => {
    if (!search) return students;
    const term = search.toLowerCase();
    return students.filter((s) => {
      return (
        s.class_name?.toLowerCase().includes(term) ||
        s.student_name?.toLowerCase().includes(term) ||
        s.father_name?.toLowerCase().includes(term) ||
        s.student_id?.toString().includes(term)
      );
    });
  }, [students, search]);

  const {
    currentPage,
    totalPages,
    currentData: paginatedStudents,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(searchedStudents, 100);


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
              {paginatedStudents.map((s, index) => (
                <tr key={s.student_id + "_" + index} className="border-t">
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
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
        totalItems={searchedStudents.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </section>
  );
};

export default StaffStudentAttendance;




