import React, { useState, useEffect } from "react";
import {
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError, showSuccess } from "../../Component/common/alert";

/* ---------- Main Component ---------- */

const Department = () => {
  const [showForm, setShowForm] = useState(false);
  const [school_id, setschool_id] = useState("");
  const [ButtonAction, setButtonAction] = useState("");
  const [edit_id, setedit_id] = useState("");
  const [errors, setErrors] = useState({});

  const [deptData, setDeptData] = useState({
    department_name: "",
    display_order: "",
    status: "Active",
  });

  const [departments, setDepartments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDeptData({
      ...deptData,
      [name]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const resetForm = () => {
    setButtonAction("");
    setedit_id("");
    setEditIndex(null);

    setDeptData({
      department_name: "",
      display_order: "",
      status: "Active",
    });

    setErrors({});
  };
  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    getdepartment(school_id);
    setschool_id(school_id);
  }, []);

  const handleSubmit = async (e) => {
    const action = e;

    // ================= VALIDATION =================
    let newErrors = {};

    if (!deptData.department_name) newErrors.department_name = "Required";
    if (!deptData.display_order) newErrors.display_order = "Required";
    if (!deptData.status) newErrors.status = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(deptData.department_name ? deptData.display_order ?  ""  : "Display Order is required" : "Department Name is required");

      return;
    }

    const payload = {
      school_id: school_id,
      department_name: deptData.department_name,
      display_order: Number(deptData.display_order),
      status: deptData.status,
    };

    // ================= EDIT =================
    if (e == "edit") {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify(payload);

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      let url = localurl + "update_department/" + edit_id;

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log(result);

          const data = JSON.parse(result);
          if (data["success"]) {
            handleApiResponse(data);

            getdepartment(school_id);
            // alert(message)
            setDeptData({
              department_name: "",
              display_order: "",
              status: "Active",
            });
            setButtonAction("");
            setedit_id("");
            setEditIndex(null);
            setErrors({});
            setShowForm(false);
          } else {
            handleApiResponse(data);
            const msg = data.message?.toLowerCase();
            let newErrors = {};

            if (msg.includes("department_name"))
              newErrors.department_name = data.message;
            if (msg.includes("display_order"))
              newErrors.display_order = data.message;
            if (msg.includes("status")) newErrors.status = data.message;

            setErrors(newErrors);
          }
        })
        .catch((data) => handleApiResponse(data));
    }

    // ================= ADD =================
    else {
      try {
        console.log(payload);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify(payload);

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch(localurl + "add_department", requestOptions)
          .then((response) => response.text())
          .then((result) => {
            console.log(result);

            const data = JSON.parse(result);
            if (data["success"]) {
              handleApiResponse(data);

              getdepartment(school_id);
              // alert(message)
              setDeptData({
                department_name: "",
                display_order: "",
                status: "Active",
              });
              if (action === "exit") {
                setShowForm(false);
              }
            } else {
              handleApiResponse(data);
              const msg = data.message?.toLowerCase();
              let newErrors = {};

              if (msg.includes("department_name"))
                newErrors.department_name = data.message;
              if (msg.includes("display_order"))
                newErrors.display_order = data.message;
              if (msg.includes("status")) newErrors.status = data.message;

              setErrors(newErrors);
            }
          })
          .catch((data) => handleApiResponse(data));

        return;
      } catch (err) {
        console.error("Submit error:", err.response?.data || err);
      }
    }
  };

  const getdepartment = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "department/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        const { success, message, row } = JSON.parse(result);
        if (success) {
          setDepartments(row.sort((a, b) => {
            const diff = (a.display_order || 0) - (b.display_order || 0);
            if (diff === 0) {
              const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
              const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
              return String(nameA).localeCompare(String(nameB));
            }
            return diff;
          })
          );

        }
      })
      .catch((data) => handleApiResponse(data));
  };

  const handleEdit = (index, id) => {
    const item = departments[index];

    setedit_id(id);

    setButtonAction("edit");

    setDeptData({
      department_name: item.department_name,
      display_order: item.display_order,
      status: item.status === "Active" ? "Active" : "Inactive",
    });

    setEditIndex(index);
    setShowForm(true);
  };


  const toggleStatus = async (index) => {
    try {
      const item = departments[index];

      const newStatus =
        item.status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_department/" + item.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        getdepartment(school_id);
        handleApiResponse(data)
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };

  const sortTable = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...departments].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;

      return 0;
    });

    setDepartments(sorted);
    setSortConfig({ key, direction });
  };
  console.log("****************************");
  console.log(departments);
  console.log("****************************");
  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      {/* Header */}

      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Department Master</h2>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
        >
          + Add Department
        </button>
      </div>

      {/* Table */}

      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-center text-white">
              <th className="p-2">#</th>

              <th
                onClick={() => sortTable("department_name")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Department ⬍
              </th>

              <th
                onClick={() => sortTable("display_order")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Display Order ⬍
              </th>

              <th
                onClick={() => sortTable("status")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Status ⬍
              </th>

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {departments.length > 0 ? (
              departments.map((d, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="p-2">{index + 1}</td>

                  <td className="p-2">{d.department_name}</td>

                  <td className="p-2">{d.display_order}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${d.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {d.status}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(index, d.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(index)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${d.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transition 
                          ${d.status === "Active" ? "translate-x-6" : ""}`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[600px] p-6">
            <h2 className="text-xl font-bold text-black mb-6">Add Department</h2>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  required
                  label={
                    <>
                      Department Name <span className="text-red-500">*</span>
                    </>
                  }
                  name="department_name"
                  value={deptData.department_name}
                  onChange={handleChange}
                  error={errors.department_name}
                />

                <FloatingInput
                  required
                  label={
                    <>
                      Display Order <span className="text-red-500">*</span>
                    </>
                  }
                  type="number"
                  name="display_order"
                  value={deptData.display_order}
                  error={errors.display_order}
                  onChange={handleChange}
                />

                <FloatingSelect
                  label="Status"
                  name="status"
                  value={deptData.status}
                  error={errors.status}
                  onChange={handleChange}
                  options={["Active", "Inactive"]}
                />
              </div>

              <div className="col-span-2 flex gap-3 mt-4">
                {ButtonAction == "" ? (
                  <>
                    <button
                      value="continue"
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        handleSubmit("continue");
                      }}
                    >
                      Save & Continue
                    </button>

                    <button
                      onClick={() => {
                        handleSubmit("exit");
                      }}
                      value="exit"
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Save & Exit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleSubmit("edit");
                    }}
                    value="exit"
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;