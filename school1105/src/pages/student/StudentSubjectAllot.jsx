import React, { useState, useEffect } from "react";
import StudentSubjectForm from "./StudentSubjectAllotFrom";
import { FaSearch } from "react-icons/fa";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { localurl } from "../../api/api";
import {
  FloatingInput,
  FloatingInputs,
  FloatingSelect,
} from "../../Component/common/FloatingInput";

const StudentSubjectAllot = () => {
  //   const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [nameFilter, setNameFilter] = useState("");
  const [stidFilter, setSridFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [applyFilter, setApplyFilter] = useState(false);
  const [manualFilteredData, setManualFilteredData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allotData, setAllotData] = useState([]);

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");

  const [sortField, setSortField] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  // ✅ CLASS
  useEffect(() => {
    fetch(localurl + "class_section/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row.filter(
            (item) => item.status === "Active",
          )
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

          setClassList(activeData);


        }
      });
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setApplyFilter(false);
      setFilteredData([]);
    };

    window.addEventListener("resetFilter", handleReset);

    return () => {
      window.removeEventListener("resetFilter", handleReset);
    };
  }, []);


  useEffect(() => {
    let baseData = applyFilter ? manualFilteredData : allotData;

    let data = baseData.filter((s) => {
      const searchText = search.toLowerCase();

      return (
        search === "" ||
        s.students_name?.toLowerCase().includes(searchText) ||
        String(s.student_ids || "").toLowerCase().includes(searchText) ||
        String(s.student_id || "").includes(searchText) ||
        String(s.student_class || "").toLowerCase().includes(searchText) ||
        String(s.subject_group || "").toLowerCase().includes(searchText) ||
        s.subject_name?.some((sub) =>
          String(sub.subject_name || "").toLowerCase().includes(searchText)
        )
      );
    });

    // ✅ SORTING (your logic)
    if (sortConfig.key) {
      data.sort((a, b) => {
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
    }

    setFilteredData(data);
  }, [
    search,
    manualFilteredData,
    allotData,
    sortConfig,
    applyFilter
  ]);

  const getStudentAllot = () => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch(
      localurl + "student_subject_allot/" + school_id + "/" + session_id,
      requestOptions,
    )
      .then((res) => res.json())
      .then((data) => {
        setAllotData(data.data || []);
      });
  };

  useEffect(() => {
    getStudentAllot();
  }, []);

  const {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(filteredData, 100);
  return (
    <div className="bg-white p-4 rounded-xl">

      <div className="grid grid-cols-12 gap-3 mb-4 items-end">

        {/* Title */}
        <h2 className="col-span-12 md:col-span-3 text-xl font-bold">
          Student Subject Allot
        </h2>

        {/* Class Section */}
        <div className="col-span-12 md:col-span-2">
          <FloatingSelect
            label="Class Section"
            name="classFilter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[
              "All",
              ...classList.map((c) => `${c.class_name} ${c.section}`),
            ]}
          />
        </div>

        {/* Find Button */}
        <button
          onClick={() => {
            setApplyFilter(true);

            let data = allotData.filter((s) => {
              const classMatch =
                classFilter === "All" ||
                String(s.student_class || "") === classFilter;

              const nameMatch =
                nameFilter === "" ||
                String(s.students_name || "")
                  .toLowerCase()
                  .includes(nameFilter.toLowerCase());

              const idMatch =
                stidFilter === "" ||
                String(s.student_ids || "").includes(stidFilter);

              return classMatch && nameMatch && idMatch;
            });

            setManualFilteredData(data);
            setFilteredData(data);
          }}
          className="col-span-12 md:col-span-1 bg-[#0860C4] text-white h-[42px] rounded"
        >
          Find
        </button>

        {/* Search */}
        <div className="col-span-12 md:col-span-4 flex items-center border rounded-xl px-3 h-[42px] gap-2">
          <FaSearch className="text-gray-500 size-5" />
          <input
            type="text"
            placeholder="Search Class / Name / Group"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full"
          />
        </div>

      </div>
      <div className="mt-6 w-full overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th
                onClick={() => handleSort("className")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                #
              </th>
              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("student_ids")}
              >
                ST. ID ⬍{" "}
              </th>
              <th
                onClick={() => handleSort("students_name")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Student ⬍
              </th>
              <th
                onClick={() => handleSort("student_class")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Class ⬍
              </th>
              <th
                // onClick={() => handleSort("subject_group")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Group
              </th>
              <th
                // onClick={() => handleSort("className")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Subjects
              </th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {
              currentData.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-4">
                    No Data Found
                  </td>
                </tr>
              ) : (
                currentData.map((row, i) => {
                  const hasSubjects = row.subject_name?.length > 0;

                  return (
                    <tr key={i} className="text-center border-t">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 whitespace-nowrap">{row.student_ids}</td>
                      <td className="p-2 whitespace-nowrap">
                        {" "}
                        {row.students_name}
                      </td>
                      <td className="p-2 whitespace-nowrap">{row.student_class}</td>

                      <td className="p-2 whitespace-nowrap">
                        {row.subject_group || "-"}
                      </td>

                      <td className="p-2 whitespace-nowrap">
                        {row.subject_name?.length > 0
                          ? row.subject_name.map((s) => s.subject_name).join(", ")
                          : "-"}
                      </td>

                      <td className="p-2 whitespace-nowrap">
                        <button
                          onClick={() => {

                            setSelectedStudent({
                              ...row,

                              actual_student_id: String(row.student_id),

                              allot_id:
                                row.subject_name?.length > 0 ? row.student_id : null,

                              subject_ids: row.subject_id
                                ? row.subject_id.split(",").map(Number)
                                : [],
                            });

                            setShowForm(true);
                          }}
                          className={`px-3 py-1 rounded text-white ${hasSubjects ? "bg-yellow-500" : "bg-green-600"
                            }`}
                        >
                          {hasSubjects ? "Edit" : "Allot Subjects"}
                        </button>
                      </td>
                    </tr>
                  );
                }))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <StudentSubjectForm
          studentData={selectedStudent}
          setShowForm={setShowForm}
          getStudentAllot={getStudentAllot}
        />
      )}
      <CommonPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </div>
  );
};

export default StudentSubjectAllot;
