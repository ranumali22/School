import React, { useState, useEffect } from "react";
import StudentFeeDepositForm from "./StudentFeeDepositForm";
import { FaSearch } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { localurl } from "../../api/api";
import { ClassSelect } from "../../Component/common/FloatingInput";
import { useNavigate } from "react-router-dom";
import { handleApiResponse } from "../../Component/common/alert";

const StudentFeeDepositTable = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [feeAllot, setFeeAllot] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [applyFilter, setApplyFilter] = useState(false);
  const [classList, setClassList] = useState([]);
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [stidFilter, setSridFilter] = useState("");
  const [sectionList, setSectionList] = useState([]);
  const [filters, setFilters] = useState({
    class: "All",
    name: "",
    fatherName: "",
    srno: "",
    search: "",
  });

  const [form, setForm] = useState({
    class_id: "",
  });

  const handlestudentsfee = (class_id = form.class_id) => {
    fetch(
      localurl + "student_fee/" + school_id + "/" + session_id + "/" + class_id,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        if (data.success) {
          setStudents(data.data);
          handleApiResponse(data);
        }
      });
  };
  useEffect(() => {
    handlestudentsfee();
  }, []);

  useEffect(() => {
    const autoSelectId = localStorage.getItem("autoSelectStudentId");
    if (autoSelectId && students.length > 0) {
      const studentToSelect = students.find(
        (s) => String(s.student_id) === String(autoSelectId),
      );
      if (studentToSelect) {
        setSelectedStudent(studentToSelect);
      }
      localStorage.removeItem("autoSelectStudentId");
    }
  }, [students]);

  useEffect(() => {
    fetch(localurl + "class_section/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA =
                  (a.class_name ||
                    a.className ||
                    a.name ||
                    a.category ||
                    a.gender ||
                    a.medium ||
                    a.nationality ||
                    a.religion ||
                    a.busRoute_name ||
                    a.busStand_name ||
                    a.subject_name ||
                    a.department ||
                    a.designation ||
                    a.shift ||
                    a.title ||
                    "") + (a.section ? " " + a.section : "");
                const nameB =
                  (b.class_name ||
                    b.className ||
                    b.name ||
                    b.category ||
                    b.gender ||
                    b.medium ||
                    b.nationality ||
                    b.religion ||
                    b.busRoute_name ||
                    b.busStand_name ||
                    b.subject_name ||
                    b.department ||
                    b.designation ||
                    b.shift ||
                    b.title ||
                    "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });

          setSectionList(activeData);
        }
      });
  }, [school_id]);

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

  const handleFilterChange = (e) => {
    console.log(e.target.value);

    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getTotalFee = (student) => {
    const record = feeAllot.find((r) => r.studentName === student.studentName);

    if (!record) return 0;

    return record.rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  };

  const getPaidFee = (student) => {
    const studentDeposits = deposits.filter(
      (d) => d.studentId === student.student_id,
    );

    return studentDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  };
  const getTotalRebate = (student) => {
    const studentDeposits = deposits.filter(
      (d) => d.studentId === student.student_id,
    );

    return studentDeposits.reduce((sum, d) => sum + Number(d.rebate || 0), 0);
  };

  const filteredStudents = applyFilter
    ? students.filter((student) => {
        const matchClass =
          filters.class === "All" || student.class === filters.class;

        return (
          matchClass &&
          (filters.name === "" ||
            (student.students_name || "")
              .toLowerCase()
              .includes(filters.name.toLowerCase())) &&
          (filters.fatherName === "" ||
            (student.father_name || "")
              .toLowerCase()
              .includes(filters.fatherName.toLowerCase())) &&
          (filters.srno === "" ||
            (student.student_ids || "").toString().includes(filters.srno) ||
            (student.srNo || "").toString().includes(filters.srno))
        );
      })
    : students;
  console.log("koloi", applyFilter);

  const searchStudents = filteredStudents.filter((student) => {
    const text = filters.search.toLowerCase();

    return (
      student.registerClass?.toLowerCase().includes(text) ||
      student.studentName?.toLowerCase().includes(text) ||
      student.fatherName?.toLowerCase().includes(text) ||
      student.motherName?.toLowerCase().includes(text) ||
      student.srNo?.toString().includes(text) ||
      student.primaryNo?.toString().includes(text) ||
      student.student_ids?.toString().includes(text)
    );
  });

  const {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(searchStudents);

  if (selectedStudent) {
    return (
      <StudentFeeDepositForm
        student={selectedStudent}
        deposits={deposits}
        setDeposits={setDeposits}
        feeAllot={feeAllot}
        closeForm={() => setSelectedStudent(null)}
        apicallback={handlestudentsfee}
      />
    );
  }

  return (
    <section className=" bg-white  rounded-t-2xl max-w-full p-4 ">
      {/* Search */}
      <div className="grid grid-cols-12 gap-5 mb-4 items-end">
        {/* Title */}
        <h2 className="col-span-12 md:col-span-3 text-xl font-bold">
          Student Fee Deposit
        </h2>

        {/* Class Select */}
        <div className="col-span-12 md:col-span-2">
          <ClassSelect
            label=" Class Section"
            value={form.class_id}
            onChange={(e) => {
              setForm({ ...form, class_id: e.target.value });
              handlestudentsfee(e.target.value);
            }}
            options={[
              { label: "---Select Class Section---", value: "" },
              "All",
              ...sectionList.map((record) => ({
                label: `${record.class_name ?? ""} - ${(record.section ?? "").toUpperCase()}`,
                value: record.id,
              })),
            ]}
          />
        </div>

        {/* Search */}
        <div className="col-span-12 md:col-span-4 flex items-center border rounded-xl px-3 h-[42px] gap-2">
          <FaSearch className="text-gray-500 size-5" />
          <input
            name="search"
            placeholder="Search Id / Name / Father / Number"
            value={filters.search}
            onChange={handleFilterChange}
            className="outline-none w-full"
          />
        </div>

        {/* Show Entries Dropdown (Top Right Corner) */}
        <div className="col-span-12 md:col-span-3 md:col-start-10 flex justify-end items-center gap-2">
          <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
            Show
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => changeItemsPerPage(Number(e.target.value))}
            className="border border-slate-300 px-2 h-[38px] rounded-xl text-sm outline-none focus:border-[#0860C4] bg-white font-medium text-slate-700 min-w-[85px] text-center"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      {/* Table */}

      <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm mb-4 overflow-hidden">
        <table className="min-w-full border-collapse border border-slate-200">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center text-xs font-semibold uppercase tracking-wider">
              <th
                className="px-3 py-3 border border-slate-200 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("sNo")}
              >
                # ⬍
              </th>

              <th
                className="px-3 py-3 border border-slate-200 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("student_ids")}
              >
                ST ID ⬍
              </th>

              <th
                className="px-3 py-3 border border-slate-200 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("srNo")}
              >
                SR No ⬍
              </th>

              <th
                className="px-3 py-3 border border-slate-200 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("class")}
              >
                Class ⬍
              </th>

              <th
                className="px-3 py-3 border border-slate-200 text-left whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("students_name")}
              >
                Name ⬍
              </th>

              <th
                className="px-3 py-3 border border-slate-200 text-left whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("fatherName")}
              >
                Father ⬍
              </th>

              <th
                className="px-3 py-3 border border-slate-200 text-right whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("allotFee")}
              >
                Allot Fee
              </th>

              <th
                className="px-3 py-3 border border-slate-200 text-right whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("paid")}
              >
                Paid
              </th>

              <th
                className="px-3 py-3 border border-slate-200 text-right whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("balance")}
              >
                Balance
              </th>

              <th className="px-3 py-3 border border-slate-200 whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="text-sm text-slate-700 text-center">
            {currentData.length > 0 ? (
              currentData.map((student, index) => {
                const total = getTotalFee(student);
                const paid = getPaidFee(student);
                const rebate = getTotalRebate(student);
                const balance = total - paid - rebate;

                return (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors capitalize"
                  >
                    <td className="px-3 py-3 border border-slate-200 font-medium text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td className="px-3 py-3 border border-slate-200 font-medium">
                      {student.stu_prefix}
                      {student.student_ids}
                    </td>

                    <td className="px-3 py-3 border border-slate-200 font-medium">
                      {student.srNo}
                    </td>
                    <td className="px-3 py-3 border border-slate-200">
                      {student.class}
                    </td>
                    <td className="px-3 py-3 border border-slate-200 text-left font-semibold text-slate-800">
                      {student.students_name}
                    </td>
                    <td className="px-3 py-3 border border-slate-200 text-left">
                      {student.father_name}
                    </td>
                    <td className="px-3 py-3 border border-slate-200 text-right font-medium">
                      {student.Allot}
                    </td>
                    <td className="px-3 py-3 border border-slate-200 text-right text-green-600 font-semibold">
                      {student.Paid}
                    </td>
                    <td className="px-3 py-3 border border-slate-200 text-right text-red-600 font-bold">
                      {student.Balance}
                    </td>
                    <td className="px-3 py-3 border border-slate-200">
                      <div className="flex justify-center gap-2 whitespace-nowrap">
                        {student.Allot > 0 ? (
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className={` w-[100px] ${student.Balance > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"} text-white px-3 py-1 rounded transition-colors`}
                          >
                            {student.Balance > 0 ? "Fee Collect" : "View"}
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/student-feeallot")}
                            className="w-[100px] bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors"
                          >
                            Fee Allot
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="py-8 border border-slate-200 text-slate-400">
                  No Data Found
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
        totalItems={searchStudents.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
        showShowEntries={false}
      />
      {/* Deposit Form */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[800px]">
            <h3 className="font-bold text-xl mb-4">
              Fee Details - {viewStudent.studentName}
            </h3>

            {/* Student Details */}

            <div className="grid grid-cols-4 gap-4 mb-6 border-b pb-4">
              <div>
                <label className="text-gray-500 text-sm">Student Name</label>
                <p className="font-semibold">{viewStudent.studentName}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Class</label>
                <p className="font-semibold">{viewStudent.registerClass}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">ST Id</label>
                <p className="font-semibold">{viewStudent.stId}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">SR No</label>
                <p className="font-semibold">{viewStudent.srNo}</p>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Father Name</label>
                <p className="font-semibold">{viewStudent.fatherName}</p>
              </div>
            </div>

            {/* Fee Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 p-3 rounded">
                <label className="text-sm text-gray-500">Total Fee</label>
                <p className="font-bold text-lg">
                  ₹ {getTotalFee(viewStudent)}
                </p>
              </div>

              <div className="bg-green-100 p-3 rounded">
                <label className="text-sm text-gray-500">Paid Fee</label>
                <p className="font-bold text-lg text-green-600">
                  ₹ {getPaidFee(viewStudent)}
                </p>
              </div>

              <div className="bg-red-100 p-3 rounded">
                <label className="text-sm text-gray-500">Balance</label>
                <p className="font-bold text-lg text-red-600">
                  ₹ {getTotalFee(viewStudent) - getPaidFee(viewStudent)}
                </p>
              </div>
            </div>

            {/* Receipt Table */}

            <table className="w-full border">
              <thead className="bg-[#0860C4]  text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-2">Receipt No</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Payment Mode</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {deposits
                  .filter((d) => d.studentName === viewStudent.studentName)
                  .map((d, i) => (
                    <tr key={i} className="border-t text-center">
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                        {d.sNo}
                      </td>

                      <td className="p-2">{d.receiptNo}</td>

                      <td className="p-2">{d.date}</td>

                      <td className="p-2">{d.mode}</td>

                      <td className="p-2 font-semibold text-green-600">
                        ₹ {d.amount}
                      </td>

                      <td className="p-2">
                        <button
                          onClick={() => window.print()}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewStudent(null)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentFeeDepositTable;
