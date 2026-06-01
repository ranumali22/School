import React, { useState, useEffect } from "react";
import ClassFeeForm from "./ClassFeeForm";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";
import { FaSearch } from "react-icons/fa";
import { FloatingSelect } from "../../Component/common/FloatingInput";
import useSessionEffect from "../../hooks/useSessionEffect";
const ClassFee = () => {
  const [search, setSearch] = useState("");
  const [classList, setClassList] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [session_id, setsession_id] = useState("");
  const [school_id, setschool_id] = useState("");
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [viewClass, setViewClass] = useState(null);
  const [classFilter, setClassFilter] = useState("All");



  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const [frequencyList, setFrequencyList] = useState([]);

  const getclass_section = (school_id) => {
    fetch(localurl + "class/" + school_id)
      .then((res) => res.json())
      .then(({ success, row }) => {
        if (success) {
          const filteredData =
            row
              .sort((a, b) => {
  const diff = (a.display_order || 0) - (b.display_order || 0);
  if (diff === 0) {
    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
    return String(nameA).localeCompare(String(nameB));
  }
  return diff;
})
              .filter((item) => item.status === "Active");

          setClassList(filteredData);
        }
      })
      .catch(handleApiResponse);
  };


  const getfeehead = (school_id) => {
    fetch(localurl + "feehead/" + school_id)
      .then((res) => res.json())
      .then(({ success, row }) => {
        if (success) {
          const filteredData = row
            .sort((a, b) => {
  const diff = (a.display_order || 0) - (b.display_order || 0);
  if (diff === 0) {
    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
    return String(nameA).localeCompare(String(nameB));
  }
  return diff;
})
            .filter((item) => item.status === "Active" && item.delete_status === "show",
            );

          setFeeHeads(filteredData);
        }
      })
      .catch(handleApiResponse);
  };

  const getClassFee = (school_id, session_id, class_id) => {
    fetch(
      localurl + "classfee/" + school_id + "/" + session_id + "/" + class_id,
    )
      .then((res) => res.json())
      .then(({ success, row }) => {
        if (success && row.length > 0) {
          setRecords(row);
        } else {
          setRecords([]);
        }
        console.log("class fee:", row);
      })
      .catch(handleApiResponse);
  };

  const getAllClassFee = (school_id, session_id) => {
    fetch(localurl + "classfee_all/" + school_id + "/" + session_id)
      .then((res) => res.json())
      .then(({ success, row }) => {
        if (success && row.length > 0) {
          setRecords(row);
        } else {
          setRecords([]);
        }

      })
      .catch(handleApiResponse);
  };

  useSessionEffect(() => {
    const session_id = localStorage.getItem("session_id");
    const school_id = localStorage.getItem("school_id");

    setsession_id(session_id);
    setschool_id(school_id);

    if (school_id && session_id) {
      getclass_section(school_id);
      getfeehead(school_id);
      getAllClassFee(school_id, session_id);
    }
  });

  const toggleStatus = async (class_id) => {
    try {
      const classRecords = records.filter(
        (r) => String(r.class_id) === String(class_id),
      );

      if (classRecords.length === 0) return;

      const currentStatus = classRecords[0].status;

      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      for (let item of classRecords) {
        await fetch(localurl + "status_classfee/" + item.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        });
      }

      getAllClassFee(school_id, session_id);
    } catch (err) {
      console.error(err);
    }
  };

  if (showForm) {
    return (
      <ClassFeeForm
        classList={classList}
        feeHeads={feeHeads}
        frequencyList={frequencyList}
        setShowForm={setShowForm}
        school_id={school_id}
        session_id={session_id}
        records={records}
        setRecords={setRecords}
        getClassFee={getClassFee}
        getAllClassFee={getAllClassFee}
        editData={editIndex}
        setEditIndex={setEditIndex}
      />
    );
  }

  const filteredRecords = records.filter((r) => {
    const className = r.class_name || "";

    const matchSearch = className.toLowerCase().includes(search.toLowerCase());

    const matchClass = classFilter === "All" || className === classFilter;

    return matchSearch && matchClass;
  });

  console.log("records:", records);
  console.log("classList:", classList);

  const classSummary = {};

  filteredRecords.forEach((r) => {
    const key = r.class_id;

    if (!classSummary[key]) {
      classSummary[key] = {
        class_id: r.class_id,
        class_name: r.class_name,
        totalAmount: 0,
        status: r.status,
      };
    }

    classSummary[key].totalAmount += Number(r.amount);
  });
  // ✅ 2. GROUP + SORT
  const sortedData = Object.values(
    filteredRecords.reduce((acc, r) => {
      const key = r.class_id;

      if (!acc[key]) {
        acc[key] = {
          class_id: r.class_id,
          class_name: r.class_name,
          totalAmount: 0,
          status: r.status,
        };
      }

      acc[key].totalAmount += Number(r.amount);
      return acc;
    }, {})
  ).sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (typeof valA === "string") {
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortConfig.direction === "asc"
      ? valA - valB
      : valB - valA;
  });
  return (
    <div className="bg-white rounded-t-2xl p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-black">Class Fee Setup</h2>
        <div className="hidden sm:flex items-center px-3 py-2 gap-2 w-50 md:max-w-sm md:mx-auto">
          <FloatingSelect
            label="Class"
            name="classFilter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={["All", ...classList.map((c) => c.class_name)]}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className=" border gap-5 rounded-xl px-4 py-3 border-gray-400 focus:border-indigo-500 flex items-center w-full md:max-w-sm md:mx-auto">
            <FaSearch className="text-gray-500 size-5 " />

            <input
              type="text"
              placeholder="Search Class "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-full"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0860C4]  text-white px-4 py-2 rounded whitespace-nowrap"
          >
            + New Fee
          </button>
        </div>
      </div>
      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th className="whitespace-nowrap p-2">#</th>
              <th
                onClick={() => handleSort("class_name")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Class ⬍
              </th>

              <th
                onClick={() => handleSort("totalAmount")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Amount ⬍
              </th>

              <th
                onClick={() => handleSort("status")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Status ⬍
              </th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Viwe
              </th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedData.map((r, index) => (
              <tr key={index} className="text-center border-t">
                <td className="p-2">{index + 1}</td>

                <td>{r.class_name || "-"}</td>

                <td className="p-2">₹ {r.totalAmount}</td>

                <td className="px-2 md:px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white 
                               ${r.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="p-2">
                  <button onClick={() => setViewClass(r)}>
                    <FaEye className="text-[1.5rem] text-blue-500" />
                  </button>
                </td>

                <td className="p-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      const firstRecord = records.find(
                        (rec) => String(rec.class_id) === String(r.class_id),
                      );

                      setEditIndex(firstRecord); // ✅ correct data
                      setShowForm(true);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(r.class_id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${r.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full transition 
                          ${r.status === "Active" ? "translate-x-6" : ""}`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {viewClass && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] md:w-[800px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Fee Heads For {viewClass.class_name || "-"}
                </h3>

                <button
                  onClick={() => setViewClass(null)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-[#0860C4] text-white text-center">
                      <th className="p-2">Class</th>
                      <th className="p-2">Fee Head</th>

                      <th className="p-2"> Date</th>
                      <th className="p-2">Display Order</th>

                      <th className="p-2">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records
                      .filter(
                        (r) => String(r.class_id) === String(viewClass.class_id)
                      )
                      .sort((a, b) => {
  const diff = (a.display_order || 0) - (b.display_order || 0);
  if (diff === 0) {
    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
    return String(nameA).localeCompare(String(nameB));
  }
  return diff;
})
                      .map((r, index) => (
                        <tr key={index} className="text-center border-t">
                          <td className="p-2">{viewClass.class_name || "-"}</td>

                          <td className="p-2">{r.feehead_name || "-"}</td>

                          {r.date
                          }
                          <td className="p-2">{r.display_order}</td>
                          <td className="p-2">₹ {r.amount}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassFee;
