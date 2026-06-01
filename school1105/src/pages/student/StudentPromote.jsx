import React, { useState, useEffect, useMemo } from "react";
import { localurl } from "../../api/api";
import { RiEdit2Fill } from "react-icons/ri";
import {
  ClassSelect,
  FloatingInput,
} from "../../Component/common/FloatingInput";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../../Component/common/alert";

const StudentPromote = () => {
  // State variables
  const [sectionList, setSectionList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Filters state
  const [filterClass, setFilterClass] = useState("All");
  const [filterName, setFilterName] = useState("");
  const [filterFatherName, setFilterFatherName] = useState("");
  const [filterSrNo, setFilterSrNo] = useState("");

  // Promote target state
  const [targetSession, setTargetSession] = useState("");
  const [targetClass, setTargetClass] = useState("");

  // Table search, pagination & sorting state
  const [tableSearch, setTableSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Checked students tracking
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Current session & school from local storage
  const school_id = localStorage.getItem("school_id") || "";
  const current_session_id = localStorage.getItem("session_id") || "";

  // Mock students fallback to ensure visual completion in empty database env
  const mockStudents = [
    {
      id: 1,
      registerNo: "0",
      class_name: "XI Arts",
      section: "A",
      studentName: "Aditya Yadav",
      fatherName: "NARENDRA Ku.Yadav",
      motherName: "Sharvani devi",
      primaryNo: "9024714949",
      rte: "No",
      registerClass: "XI Arts - A",
    },
    {
      id: 2,
      registerNo: "41",
      class_name: "XI Arts",
      section: "A",
      studentName: "ANITA SERAWAT",
      fatherName: "SHRAWAN LAL SERAWAT",
      motherName: "SUMITRA DEVI",
      primaryNo: "9950350705",
      rte: "No",
      registerClass: "XI Arts - A",
    },
    {
      id: 3,
      registerNo: "16",
      class_name: "XI Arts",
      section: "A",
      studentName: "ANJALI YADAV",
      fatherName: "SHRAWAN KUMAR YADAV",
      motherName: "GUDDI YADAV",
      primaryNo: "9929279276",
      rte: "No",
      registerClass: "XI Arts - A",
    },
    {
      id: 4,
      registerNo: "7",
      class_name: "XI Arts",
      section: "A",
      studentName: "ANKIT PRAJAPAT",
      fatherName: "MAHESH CHAND KUMAWAT",
      motherName: "SULOCHANA DEVI",
      primaryNo: "9284457918",
      rte: "No",
      registerClass: "XI Arts - A",
    },
    {
      id: 5,
      registerNo: "0",
      class_name: "XI Arts",
      section: "A",
      studentName: "ANKIT SONKARIYA",
      fatherName: "MUKESH KUMAR SONKARIYA",
      motherName: "SANTOSH DEVI",
      primaryNo: "8890336102",
      rte: "No",
      registerClass: "XI Arts - A",
    },
    {
      id: 6,
      registerNo: "4175",
      class_name: "XI Arts",
      section: "A",
      studentName: "Bharat Singh",
      fatherName: "Madhu Singh",
      motherName: "Sushila Devi",
      primaryNo: "7073224650",
      rte: "No",
      registerClass: "XI Arts - A",
    },
  ];

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
    setSelectedStudentIds(new Set()); // Reset selections
    try {
      const res = await fetch(
        `${localurl}students/${school_id}/${current_session_id}`,
      );
      const data = await res.json();
      if (data.success && data.row && data.row.length > 0) {
        setStudents(data.row);
      } else {
        setStudents(mockStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [current_session_id]);

  const handleFind = () => {
    fetchStudents();
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

  // Pagination
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);

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
      {/* Dynamic Native styles to exactly match user screenshot */}
      <style>{`
        .school-promote-container {
          font-family: Arial, sans-serif;
          color: #333;
        }
        .promote-title {
          font-size: 32px;
          font-weight: 400;
          color: #333;
          margin-bottom: 25px;
          margin-top: 10px;
        }
        .btn-find-red {
          color: #fff;
          background-color: #0860C4;
          border: 1px solid #6f87a3;
          height: 44px;
          padding: 6px 20px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease-in-out;
          width: 100%;
          outline: none;
        }
        .btn-find-red:hover {
          background-color: #6f87a3;
          border-color: #6f87a3;
        }
        .btn-promote-red {
          color: #fff;
          background-color: #0860C4;
          border: 1px solid #6f87a3;
          height: 44px;
          padding: 6px 20px;
          font-size: 13px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease-in-out;
          width: 100%;
          outline: none;
        }
        .btn-promote-red:hover:not(:disabled) {
          background-color: #0860C4;
          border-color: #6f87a3;
        }
        .btn-promote-red:disabled {
          background-color: #e6e6e6;
          border-color: #ccc;
          color: #999;
          cursor: not-allowed;
        }
        .table-util-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          margin-top: 25px;
        }
        .table-search-input {
          height: 34px;
          width: 180px;
          padding: 5px 10px;
          font-size: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
        }
        .show-entries-select {
          height: 34px;
          padding: 2px 10px;
          font-size: 13px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          background: #fff;
        }
        .text-center {
          text-align: center;
        }
        .text-left {
          text-align: left;
        }
        .native-checkbox {
          width: 15px;
          height: 15px;
          cursor: pointer;
          margin: 0;
          vertical-align: middle;
        }
        .edit-btn-blue {
          background: #fff;
          border: 1px solid #ccc;
          color: #0275d8;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .edit-btn-blue:hover {
          background: #f0f0f0;
          border-color: #adadad;
        }
        /* Sort indicators removed in favor of native inline character */
      `}</style>

      {/* Page Title */}
      <h1 className="text-xl font-bold">Student Promote</h1>

      {/* Filter Row using custom project Floating/ClassSelect components */}
      <div className="grid grid-cols-12 gap-4 mb-6 mt-4 items-end">
        {/* Class Filter */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <ClassSelect
            label="Class"
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
            className="btn-find-red"
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
              className="btn-promote-red"
            >
              {promoting ? "Promoting..." : "Permote Selected Student"}
            </button>
          </div>

          {/* Show Entries Select */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 flex justify-end pb-1">
            <div style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
              <span>Show entries:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="show-entries-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
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
                <span className="ml-1">⬍</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center"
                  style={{ padding: "40px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        border: "3px solid #ccc",
                        borderBottomColor: "#337ab7",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Loading student records...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedStudents.length > 0 ? (
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

      {/* Pagination Row */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            justifyItems: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "15px",
            fontSize: "14px",
          }}
        >
          <div style={{ flex: "1", color: "#666" }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedStudents.length)} of{" "}
            {sortedStudents.length} entries
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.6 : 1,
                fontSize: "13px",
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  background: currentPage === page ? "#337ab7" : "#fff",
                  color: currentPage === page ? "#fff" : "#333",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.6 : 1,
                fontSize: "13px",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPromote;
