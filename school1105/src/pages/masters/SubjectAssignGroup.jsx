import React, { useState, useEffect } from "react";
import SubjectAssignGroupForm from "./SubjectAssignGroupForm";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";

function SubjectAssignGroupTable() {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const school_id = localStorage.getItem("school_id");
  const [editData, setEditData] = useState(null);

  const getsubject = (school_id) => {
    fetch(localurl + "subject/" + school_id)
      .then((res) => res.json())
      .then(({ success, row }) => {
        if (success) setSubjects(row);
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

    const sortedData = [...groups].sort((a, b) => {
      if (key === "subjectName") {
        const aSubjects = a.subjects.join(", ");
        const bSubjects = b.subjects.join(", ");

        return direction === "asc"
          ? aSubjects.localeCompare(bSubjects)
          : bSubjects.localeCompare(aSubjects);
      }

      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setGroups(sortedData);
  };

  // ✅ GET GROUP
  const getSubjectGroup = (school_id) => {
    fetch(localurl + "subject_group/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        console.log("FULL API RESPONSE:", data);

        const { success, subject_name } = data;

        if (success) setGroups(subject_name);
      })
      .catch(handleApiResponse);
  };
  useEffect(() => {
    getSubjectGroup(school_id);
    getsubject(school_id);
  }, []);

  const getSubjectName = (id) => {
    return (
      subjects.find((s) => String(s.id) === String(id))?.subject_name || "-"
    );
  };

  const handleEdit = (index) => {
    const selected = groups[index];

    setEditIndex(index);

    setEditData({
      ...selected,
      subject_ids: selected.subject_ids ? selected.subject_ids.split(",") : [],
    });

    setShowForm(true);
  };

  const toggleStatus = (id, currentStatus) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      status: currentStatus === "Active" ? "Inactive" : "Active",
    });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(localurl + `status_subject_group/` + id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        const data = JSON.parse(result);
        handleApiResponse(data);
        getSubjectGroup(school_id);
      })
      .catch((data) => handleApiResponse(data));
  };

  // ✅ DELETE
  const deleteGroup = (id) => {
    fetch(localurl + "delete_subject_group/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject_ids: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        handleApiResponse(data);
        getSubjectGroup(school_id);
      });
  };

  const {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(groups, 10);

  if (showForm) {
    return (
      <SubjectAssignGroupForm
        setShowForm={setShowForm}
        groups={groups}
        editIndex={editIndex}
        setEditIndex={setEditIndex}
        getSubjectGroup={getSubjectGroup}
        subjects={subjects}
        editData={editData}
      />
    );
  }

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold text-black">Subject Assign Group</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
        >
          + Assign Group
        </button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-center text-white">
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                #
              </th>
              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("group_name")}
              >
                Group Name ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("subject_ids")}
              >
                Subject Name ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("display_order")}
              >
                Display Order ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status ⬍
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((g, index) => (
              <tr key={g.id} className="text-center border-t">
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                  {index + 1}
                </td>

                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                  {g.group_name}
                </td>

                <td className="px-2 md:px-4 py-2 whitespace-nowrap">

                  {g.subject_ids
                    ?.split(",")
                    .map((id) => getSubjectName(id))
                    .join(", ")}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                  {g.display_order}
                </td>

                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-white rounded ${g.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {g.status}
                  </span>
                </td>

                <td className="flex gap-2 justify-center px-2 md:px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(g.id, g.status)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 ${g.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full ${g.status === "Active" ? "translate-x-6" : ""}`}
                    />
                  </button>


                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CommonPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={changeItemsPerPage}
      />
    </div>
  );
}

export default SubjectAssignGroupTable;
