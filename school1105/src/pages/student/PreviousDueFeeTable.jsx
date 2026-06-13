import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { FaSearch, FaEye } from "react-icons/fa";
import { FloatingSelect } from "../../Component/common/FloatingInput";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";

const PreviousDueFeeTable = () => {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    class: "Select Class Section",
    search: "",
  });

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");

  // Fetch dues and sessions on mount
  useEffect(() => {
    if (!school_id || !session_id) return;
    setLoading(true);

    // Fetch previous due fees
    // fetch(`${localurl}previous_due_fees/${school_id}/${session_id}`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (data.success) {
    //       setStudents(data.data || []);
    //     }
    //     setLoading(false);
    //   })
    //   .catch((err) => {
    //     console.error("Error fetching previous due fees:", err);
    //     setLoading(false);
    //   });

    // Fetch sessions
    fetch(`${localurl}session/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSessions(data.row || []);
        }
      });

    // Fetch class list
    fetch(`${localurl}class/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClassList(data.row || []);
        }
      });

    // Fetch class sections
    fetch(`${localurl}class_section/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sortedActiveSections = (data.row || [])
            .filter((item) => item.status === "Active")
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          setSectionList(sortedActiveSections);
        }
      });
  }, [school_id, session_id]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFind = () => {
    setLoading(true);

    fetch(`${localurl}previous_due_fees/${school_id}/${session_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.data || []);
        } else {
          setStudents([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setStudents([]);
        setLoading(false);
      });
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
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      if (typeof aValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    setStudents(sortedData);
  };

  const handleDetailClick = (stu) => {
    const targetSession = sessions.find(
      (s) => String(s.id) === String(stu.session_id),
    );
    if (!targetSession) {
      alert("Target session not found!");
      return;
    }
    // Set localStorage variables to switch session
    localStorage.setItem("session_id", targetSession.id);
    localStorage.setItem("session_data", JSON.stringify(targetSession));
    localStorage.setItem("autoSelectStudentId", stu.student_id);

    // Redirect to trigger full context refresh
    window.location.href = "/student-feedeposittable";
  };

  const filteredStudents = students.filter((student) => {
    const classMatch =
      filters.class === "All" || student.class === filters.class;

    const text = filters.search.toLowerCase();
    const searchMatch =
      !text ||
      (student.studentName || "").toLowerCase().includes(text) ||
      (student.fatherName || "").toLowerCase().includes(text) ||
      (student.primaryNo || "").toString().includes(text) ||
      (student.registerNo || "").toString().toLowerCase().includes(text) ||
      ((student.stu_prefix || "") + (student.student_ids || ""))
        .toLowerCase()
        .includes(text) ||
      (student.student_ids || "").toString().includes(text);

    return classMatch && searchMatch;
  });

  // Pagination hook integration
  const {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(filteredStudents);

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      {/* Title */}
      <h2 className="text-xl font-bold mb-6">Previous Sessions Due Fees</h2>

      {/* Controls Row - Class Section placed first, entries selector top right */}
      <div className="grid grid-cols-12 gap-5 mb-6 items-end">
        {/* Class Select Dropdown */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2">
          <FloatingSelect
            label="Class Section"
            name="class"
            value={filters.class}
            onChange={handleFilterChange}
            options={[
              "Select Class Section",
              ...sectionList.map((record) => {
                const cls = classList.find(
                  (c) => String(c.id) === String(record.class_id),
                );
                const className = cls?.class_name || "Class";
                return `${className} - ${record.section.toUpperCase()}`;
              }),
            ]}
          />
        </div>

        {/* Search Bar */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 flex items-center border rounded-xl px-3 h-[42px] gap-2 bg-white">
          <FaSearch className="text-gray-400 size-4" />
          <input
            name="search"
            placeholder="Search by Student Name / Mobile No / Fathers Name"
            value={filters.search}
            onChange={handleFilterChange}
            className="outline-none w-full text-sm bg-transparent text-slate-700"
          />
        </div>

        {/* Find Button */}
        <div className="col-span-12 md:col-span-2">
          <button
            onClick={handleFind}
            className="bg-[#0860C4] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm h-[42px] w-full"
          >
            Find
          </button>
        </div>

        {/* Show Entries Dropdown (Top Right Corner) */}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center text-xs font-semibold uppercase tracking-wider">
              <th className="px-3 py-3 ">S.N.</th>
              <th
                className="px-3 py-3  cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("student_ids")}
              >
                ST ID ⬍
              </th>
              <th
                className="px-3 py-3  cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("registerNo")}
              >
                SR. NO. ⬍
              </th>
              <th
                className="px-3 py-3  text-left cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("studentName")}
              >
                Name ⬍
              </th>
              <th
                className="px-3 py-3  text-left cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("fatherName")}
              >
                Father's Name ⬍
              </th>
              <th
                className="px-3 py-3  cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("primaryNo")}
              >
                Mobile No. ⬍
              </th>
              <th
                className="px-3 py-3  cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("class")}
              >
                Class ⬍
              </th>
              <th
                className="px-3 py-3  cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("session_name")}
              >
                Session ⬍
              </th>
              <th
                className="px-3 py-3  text-right cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("Allot")}
              >
                Allot Fees ⬍
              </th>
              <th
                className="px-3 py-3  text-right cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("Paid")}
              >
                Deposited ⬍
              </th>
              <th
                className="px-3 py-3  text-right cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("Balance")}
              >
                Pending ⬍
              </th>
              <th className="px-3 py-3 ">Detail</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 text-center">
            {currentData.length > 0 ? (
              currentData.map((stu, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-colors border-t"
                >
                  <td className="px-3 py-3  font-medium text-slate-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-3 py-3  font-medium">
                    {stu.stu_prefix}
                    {stu.student_ids}
                  </td>
                  <td className="px-3 py-3  font-medium">
                    {stu.registerNo || ""}
                  </td>
                  <td className="px-3 py-3  text-left font-semibold text-slate-800">
                    {stu.studentName}
                  </td>
                  <td className="px-3 py-3  text-left">{stu.fatherName}</td>
                  <td className="px-3 py-3 ">{stu.primaryNo}</td>
                  <td className="px-3 py-3 ">{stu.class}</td>
                  <td className="px-3 py-3  font-medium text-slate-600">
                    {stu.session_name}
                  </td>
                  <td className="px-3 py-3  text-right font-medium">
                    {Number(stu.Allot).toFixed(2)}
                  </td>
                  <td className="px-3 py-3  text-right text-green-600 font-semibold">
                    {Number(stu.Paid).toFixed(2)}
                  </td>
                  <td className="px-3 py-3  text-right text-red-600 font-bold">
                    {Number(stu.Balance).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 ">
                    <button
                      onClick={() => handleDetailClick(stu)}
                      title="View Student Pending Fees Detail"
                      className={`w-[100px] px-3 py-1 rounded text-white transition-all ${
                        stu.Balance > 0
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      Fee Collect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="py-8  text-slate-400">
                  No previous sessions due fees found.
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
        totalItems={filteredStudents.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </div>
  );
};

export default PreviousDueFeeTable;
