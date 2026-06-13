import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import StaffAddClassTest from "./StaffAddClassTest";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";

import { localurl } from "../../api/api";
import {
  ClassSelect,
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import {
  handleApiResponse,
  showError,
  showSuccess,
} from "../../Component/common/alert";
function StaffClassTestTable() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const [editData, setEditData] = useState(null);

  const [filters, setFilters] = useState({
    class: "All",
    subject: "--All--",
    test: "All Test",
    search: "",
  });

  const [form, setForm] = useState({
    class_id: "",
    subject_head_id: "",
    subject_id: "",
    test_id: "",
  });

  const [sectionList, setSectionList] = useState([]);
  const [testList, settestList] = useState([]);
  const [headlist, setHeadList] = useState([]);
  const [subjectlist, setSubjectList] = useState([]);

  const [results, setResults] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const handlestudentsclasstest = () => {
    if (!form.class_id) {
      showError("pls select class");

      return;
    }
    if (!form.subject_head_id) {
      showError("pls select subject Head");

      return;
    }
    if (!form.subject_id) {
      showError("pls select subject");

      return;
    }
    if (!form.test_id) {
      showError("pls select Test");

      return;
    }
    const { test_id, subject_head_id, subject_id, class_id } = form;

    fetch(
      localurl +
        "student_class_test/" +
        school_id +
        "/" +
        session_id +
        "/" +
        class_id +
        "/" +
        subject_id +
        "/" +
        subject_head_id +
        "/" +
        test_id,
    )
      .then((res) => res.json())
      // .then((data) => {
      //   console.log("class_test", data);

      //   if (data.success) {
      //     setResults(data.marks_details);
      //     showSuccess(data.message);
      //   } else {
      //     setResults([]);
      //     showError(data.message);
      //   }
      // });

      .then((data) => {
        console.log("class_test", data);

        if (
          data.success &&
          data.marks_details &&
          data.marks_details.length > 0
        ) {
          setResults(data.marks_details);
          showSuccess(data.message || "Data Found");
        } else {
          setResults([]);
          showError("No Data Found");
        }
      });
  };

  useEffect(() => {
    // handlestudentsclasstest();

    // CLASS DETAIL
    fetch(localurl + "class_section/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // handleApiResponse(data)
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

    // main_test
    fetch(localurl + "class_test/" + school_id + "/" + session_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // handleApiResponse(data)
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

          settestList(activeData);
        }
      });
    // feehead
    fetch(localurl + "subject_group/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        console.log("subject groupo", data);

        if (data.success) {
          const activeData = data.subject_name
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

          setHeadList(activeData);
        }
      });
    // subject
    fetch(localurl + "subject/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        console.log("subject", data);

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

          setSubjectList(activeData);
        }
      });
  }, []);

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedData = [...results].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setResults(sortedData);
  };

  const searchedResults = useMemo(() => {
    if (!search) return results;
    const term = search.toLowerCase();
    return results.filter((item) => {
      return (
        item.test?.toLowerCase().includes(term) ||
        item.classsection?.toLowerCase().includes(term) ||
        item.subject?.toLowerCase().includes(term)
      );
    });
  }, [results, search]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    currentData: paginatedResults,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(searchedResults, 10);

  const filteredResults = results.filter((item) => {
    return (
      (filters.class === "All" || item.class === filters.class) &&
      (filters.subject === "--All--" || item.subject === filters.subject) &&
      (filters.test === "All Test" || item.test === filters.test) &&
      (filters.search === "" ||
        item.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.class?.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  if (showForm) {
    return (
      <StaffAddClassTest
        setShowForm={setShowForm}
        editData={editData}
        refreshTable={handlestudentsclasstest}
      />
    );
  }

  return (
    <section className=" bg-white  rounded-t-2xl max-w-full p-4 ">
      {/* Filters */}
      <div className="overflow-x-auto">
        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-4 mb-6 mt-4">
          {/* Filters */}
          <div className="lg:col-span-3">
            <ClassSelect
              label="Select Class Section"
              value={form.class_id}
              onChange={(e) => {
                setForm({ ...form, class_id: e.target.value });
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

          <div className="lg:col-span-3">
            <ClassSelect
              label="Select Subject Group"
              value={form.subject_head_id}
              onChange={(e) =>
                setForm({ ...form, subject_head_id: e.target.value })
              }
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
          </div>

          <div className="lg:col-span-2">
            <ClassSelect
              label="Select Subject"
              value={form.subject_id}
              onChange={(e) => {
                setForm({ ...form, subject_id: e.target.value });
              }}
              options={[
                { label: "---Select Subject---", value: "" },

                ...subjectlist
                  .filter((record) => {
                    if (!form.subject_head_id) return true; // Show all if no group selected
                    const group = headlist.find(
                      (g) => String(g.id) === String(form.subject_head_id)
                    );
                    if (group && group.subject_ids) {
                      const ids = String(group.subject_ids).split(",").map(Number);
                      return ids.includes(Number(record.id));
                    }
                    return false;
                  })
                  .map((record) => {
                    return {
                      label: `${record.subject_name}`, // 🔥 best UX
                      value: record.id, // ⚠️ IMPORTANT (not class_id)
                    };
                  }),
              ]}
            />{" "}
          </div>

          <div className="lg:col-span-2">
            <ClassSelect
              label="Select test"
              value={form.test_id}
              onChange={(e) => {
                setForm({ ...form, test_id: e.target.value });
              }}
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
            type="button"
            onClick={handlestudentsclasstest}
            className="bg-purple-600 text-white px-6 py-2 rounded whitespace-nowrap"
          >
            Find
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row sm:flex-row md:items-center md:justify-between gap-4  mb-4">
        {/* Left Title */}

        <h2 className="text-xl font-bold ">Class Test Results</h2>
        {/* Center Search */}
        <div className="flex items-center border rounded-xl px-3 py-2 gap-2 w-full md:w-[350px]">
          <FaSearch className="text-gray-500" />

          <input
            type="text"
            placeholder="Search Class / Test / Subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        {/* Right Button */}
        <button
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
          className="bg-[#0860C4] py-2 px-4 text-white text-sm md:text-base rounded-lg whitespace-nowrap"
        >
          Add Marks
        </button>
      </div>
      {/* Table */}

      <div className=" overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-[#0860C4] text-center text-white">
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                #
              </th>

              <th
                onClick={() => handleSort("test")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Test ⬍
              </th>
              <th
                onClick={() => handleSort("class")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Class ⬍
              </th>

              <th
                onClick={() => handleSort("subject")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Subject ⬍
              </th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action
              </th>
              {/* <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >Delete</th> */}
            </tr>
          </thead>

          <tbody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((item, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.test}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.classsection}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {item.subject}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <RiEdit2Fill
                      size={20}
                      className="cursor-pointer text-blue-600 mx-auto"
                      onClick={() => {
                        setEditData(item);
                        setShowForm(true);
                      }}
                    />
                  </td>
                  {/* <td className="px-2 md:px-4 py-2 whitespace-nowrap">

                    <MdDelete
                      className="cursor-pointer text-red-600 mx-auto"
                    />

                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
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
        totalItems={searchedResults.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </section>
  );
}

export default StaffClassTestTable;
