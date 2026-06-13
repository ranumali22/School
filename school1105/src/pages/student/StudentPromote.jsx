import React, { useState, useEffect, useMemo } from "react";
import { localurl } from "../../api/api";
import { RiEdit2Fill } from "react-icons/ri";
import {
  ClassSelect,
  FloatingInput,
} from "../../Component/common/FloatingInput";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../../Component/common/alert";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";

const StudentPromote = () => {
  // State variables
  const [sectionList, setSectionList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Filters state
const [filterClass, setFilterClass] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterFatherName, setFilterFatherName] = useState("");
  const [filterSrNo, setFilterSrNo] = useState("");

  // Promote target state
  const [targetSession, setTargetSession] = useState("");
  const [targetClass, setTargetClass] = useState("");

  // Table search & sorting state
  const [tableSearch, setTableSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Checked students tracking
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Current session & school from local storage
  const school_id = localStorage.getItem("school_id") || "";
  const current_session_id = localStorage.getItem("session_id") || "";



  // Fetch initial data
  useEffect(() => {
    if (school_id) {
      fetchClasses();
      fetchSessions();
    }
  }, [school_id]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${localurl}class_section/${school_id}`);
      const data = await res.json();
      if (data.success) {
        const activeClasses = data.row
          .filter((item) => item.status === "Active")
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setSectionList(activeClasses);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${localurl}session/${school_id}`);
      const data = await res.json();
      if (data.success) {
        const sortedSessions = data.row.sort(
          (a, b) => (a.display_order || 0) - (b.display_order || 0),
        );
        setSessionList(sortedSessions);

        const currentIndex = sortedSessions.findIndex(
          (s) => s.id.toString() === current_session_id.toString(),
        );
        if (currentIndex !== -1 && currentIndex + 1 < sortedSessions.length) {
          setTargetSession(sortedSessions[currentIndex + 1].id);
        } else if (sortedSessions.length > 0) {
          setTargetSession(sortedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchStudents = async () => {
    if (!school_id || !current_session_id) return;
    setLoading(true);
    setSelectedStudentIds(new Set()); 
    try {
      const res = await fetch(
        `${localurl}students/${school_id}/${current_session_id}`,
      );
      const data = await res.json();
      if (data.success && data.row && data.row.length > 0) {
        const activeStudents = data.row.filter(
          (student) => String(student.status || "").toLowerCase() === "active"
        );
        setStudents(activeStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    
    } finally {
      setLoading(false);
    }
  };


 const handleFind = () => {
  if (
    filterClass === "All" ||
    filterClass !== "" ||
    filterName ||
    filterFatherName ||
    filterSrNo
  ) {
    fetchStudents();
  }
};

  // Filter students based on top form parameters
  const filteredStudentsByForms = useMemo(() => {
    return students.filter((student) => {
      if (filterClass && filterClass !== "All") {
        if (student.registerClass?.toString() !== filterClass.toString()) {
          return false;
        }
      }

      if (
        filterName &&
        !student.studentName?.toLowerCase().includes(filterName.toLowerCase())
      ) {
        return false;
      }

      if (
        filterFatherName &&
        !student.fatherName
          ?.toLowerCase()
          .includes(filterFatherName.toLowerCase())
      ) {
        return false;
      }

      if (filterSrNo) {
        const sr = filterSrNo.toString();
        const registerNo = student.registerNo?.toString() || "";
        const studentIds = student.student_ids?.toString() || "";
        if (!registerNo.includes(sr) && !studentIds.includes(sr)) {
          return false;
        }
      }

      return true;
    });
  }, [students, filterClass, filterName, filterFatherName, filterSrNo]);

  // Secondary filtering via table search box
  const searchedStudents = useMemo(() => {
    if (!tableSearch) return filteredStudentsByForms;
    const term = tableSearch.toLowerCase();
    return filteredStudentsByForms.filter((s) => {
      return (
        s.studentName?.toLowerCase().includes(term) ||
        s.fatherName?.toLowerCase().includes(term) ||
        s.motherName?.toLowerCase().includes(term) ||
        s.primaryNo?.toString().includes(term) ||
        s.registerNo?.toString().includes(term) ||
        s.student_ids?.toString().includes(term)
      );
    });
  }, [filteredStudentsByForms, tableSearch]);

  // Handle table sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return searchedStudents;
    return [...searchedStudents].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
  }, [searchedStudents, sortConfig]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    currentData: paginatedStudents,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedStudents, 10);

  // Checkbox interactions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedStudents.map((s) => s.id);
      setSelectedStudentIds(new Set([...selectedStudentIds, ...allIds]));
    } else {
      const paginatedIds = new Set(paginatedStudents.map((s) => s.id));
      const nextSelection = new Set(
        [...selectedStudentIds].filter((id) => !paginatedIds.has(id)),
      );
      setSelectedStudentIds(nextSelection);
    }
  };

  const handleSelectStudent = (id) => {
    const nextSelection = new Set(selectedStudentIds);
    if (nextSelection.has(id)) {
      nextSelection.delete(id);
    } else {
      nextSelection.add(id);
    }
    setSelectedStudentIds(nextSelection);
  };

  const isAllPaginatedSelected = useMemo(() => {
    if (paginatedStudents.length === 0) return false;
    return paginatedStudents.every((s) => selectedStudentIds.has(s.id));
  }, [paginatedStudents, selectedStudentIds]);

  // Promote API Trigger
  const handlePromote = async () => {
    if (selectedStudentIds.size === 0) {
      showError("Please select at least one student to promote ❌");
      return;
    }
    if (!targetSession) {
      showError("Please select target Session ❌");
      return;
    }
    if (!targetClass) {
      showError("Please select target Class Section ❌");
      return;
    }

    const selectedList = students.filter((s) => selectedStudentIds.has(s.id));
    const targetSessionObj = sessionList.find(
      (s) => s.id.toString() === targetSession.toString(),
    );
    const targetClassObj = sectionList.find(
      (c) => c.id.toString() === targetClass.toString(),
    );

    const sessionName = targetSessionObj
      ? targetSessionObj.session_name
      : targetSession;
    const className = targetClassObj
      ? `${targetClassObj.class_name} - ${targetClassObj.section}`
      : targetClass;

    const result = await Swal.fire({
      title: "Promote Students",
      text: `Are you sure you want to promote ${selectedStudentIds.size} selected students to Session: ${sessionName} and Class: ${className}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d9534f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Promote Selected",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setPromoting(true);
      try {
        const payload = {
          school_id: Number(school_id),
          current_session_id: Number(current_session_id),
          target_session_id: Number(targetSession),
          target_class_id: Number(targetClass),
          student_ids: Array.from(selectedStudentIds),
        };

        const response = await fetch(`${localurl}promote_students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            title: "Promoted! 🎉",
            text: `Successfully promoted ${selectedStudentIds.size} students to Session ${sessionName}, Class ${className}.`,
            icon: "success",
            confirmButtonColor: "#337ab7",
          });
          setSelectedStudentIds(new Set());
          fetchStudents();
        } else {
          showError(data.message || "Failed to promote students ❌");
        }
      } catch (err) {
        console.error("Promote error:", err);
        showError("Something went wrong during promotion ❌");
      } finally {
        setPromoting(false);
      }
    }
  };

  const getClassSectionLabel = (student) => {
    if (student.section_class) return student.section_class;
    if (student.class_name && student.section)
      return `${student.class_name} - ${student.section}`;
    const cls = sectionList.find(
      (c) => c.id.toString() === student.registerClass?.toString(),
    );
    if (cls) return `${cls.class_name} - ${cls.section}`;
    return student.registerClass || "-";
  };

  return (
    <div className="bg-white p-5 min-h-[85vh] text-left school-promote-container">
      {/* Page Title */}
      <h1 className="text-xl font-bold">Student Promote</h1>

      {/* Filter Row using custom project Floating/ClassSelect components */}
      <div className="grid grid-cols-12 gap-4 mb-6 mt-4 items-end">
        {/* Class Filter */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <ClassSelect
            label="Class Section"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            options={[
              { label: "All", value: "All" },
              ...sectionList.map((c) => ({
                label: `${c.class_name} - ${c.section}`,
                value: c.id,
              })),
            ]}
          />
        </div>

        {/* Name Filter */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <FloatingInput
            label="Name"
            name="name"
            placeholder="Search by student name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>

        {/* Father Name Filter */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <FloatingInput
            label="Father Name"
            name="fatherName"
            placeholder="Search by father's name..."
            value={filterFatherName}
            onChange={(e) => setFilterFatherName(e.target.value)}
          />
        </div>

        {/* SR No. Filter */}
        <div className="col-span-12 sm:col-span-6 md:col-span-2">
          <FloatingInput
            label="SR No."
            name="srNo"
            placeholder="Search SR No..."
            value={filterSrNo}
            onChange={(e) => setFilterSrNo(e.target.value)}
          />
        </div>

        {/* Find Button */}
        <div className="col-span-12 sm:col-span-6 md:col-span-1">
          <button
            onClick={handleFind}
            disabled={loading}
            className="bg-[#0860C4] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm h-[42px] w-full hover:bg-opacity-90 active:scale-95 duration-150"
          >
            {loading ? "..." : "Find"}
          </button>
        </div>
      </div>

      {/* Target Promotion Section using custom ClassSelect components */}
      <div className="mt-6 mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          Promote In Session
        </h3>
        <div className="grid grid-cols-12 gap-4 items-end">
          {/* Target Session Select */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3">
            <ClassSelect
              label="Session"
              value={targetSession}
              onChange={(e) => setTargetSession(e.target.value)}
              options={[
                { label: "Select Session", value: "" },
                ...sessionList.map((s) => ({
                  label: s.session_name,
                  value: s.id,
                })),
              ]}
            />
          </div>

          {/* Target Class Select */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3">
            <ClassSelect
              label="Class Section"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              options={[
                { label: "Select Class Section", value: "" },
                ...sectionList.map((c) => ({
                  label: `${c.class_name} - ${c.section}`,
                  value: c.id,
                })),
              ]}
            />
          </div>

          {/* Promote Button */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3">
            <button
              onClick={handlePromote}
              disabled={promoting || selectedStudentIds.size === 0}
              className="bg-[#0860C4] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm h-[42px] w-full hover:bg-opacity-90 active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed duration-150"
            >
              {promoting ? "Promoting..." : "Permote Selected Student"}
            </button>
          </div>
        </div>
      </div>

      {/* Datatable */}
      <div style={{ overflowX: "auto" }}>
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-[#0860C4] text-center text-white">
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                #
              </th>

              <th
                onClick={() => handleSort("student_ids")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                STUDENT ID ⬍
              </th>

              <th
                onClick={() => handleSort("registerNo")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                SR. NO. ⬍
              </th>

              <th
                onClick={() => handleSort("registerClass")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Class ⬍
              </th>

              <th
                onClick={() => handleSort("studentName")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Name ⬍
              </th>

              <th
                onClick={() => handleSort("fatherName")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Father's Name ⬍
              </th>

              <th
                onClick={() => handleSort("motherName")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Mother's Name ⬍
              </th>



              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer text-center">
                <input
                  type="checkbox"
                  checked={isAllPaginatedSelected}
                  onChange={handleSelectAll}
                  className="native-checkbox"
                  style={{ accentColor: "#0860C4" }}
                />

              </th>
            </tr>
          </thead>
          <tbody>
            {
              paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, idx) => {
                  const sNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSelected = selectedStudentIds.has(student.id);
                  return (
                    <tr key={student.id} className="text-center border-t">
                      <td
                        className="px-2 md:px-4 py-2 whitespace-nowrap text-center"
                        style={{ color: "#777" }}
                      >
                        {sNumber}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-center">
                        {student.stu_prefix || ""}{student.student_ids || "-"}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-center">
                        {student.registerNo || "-"}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-left">
                        {getClassSectionLabel(student)}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-left">
                        {student.studentName}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-left">
                        {student.fatherName || "-"}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-left">
                        {student.motherName || "-"}
                      </td>


                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectStudent(student.id)}
                          className="native-checkbox"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center"
                    style={{
                      padding: "30px",
                      color: "#999",
                      fontStyle: "italic",
                    }}
                  >
                    No students found matching filters.
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
        totalItems={sortedStudents.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </div>
  );
};

export default StudentPromote;
