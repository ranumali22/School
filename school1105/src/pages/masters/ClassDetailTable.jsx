import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import {
  ClassSelect,
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { handleApiResponse, showError } from "../../Component/common/alert";
function ClassDetailTable() {
  const [school_id, setschool_id] = useState("");

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

    const sortedData = [...classes].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setClasses(sortedData);
  };
  const [ButtonAction, setButtonAction] = useState("");
  const [edit_id, setedit_id] = useState("");
  const [classes, setClasses] = useState([]);
  const [classList, setClassList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [records, setRecords] = useState([]);

  const [class_id, setclass_id] = useState("");

  const [formData, setFormData] = useState({
    class_id: "",
    room_number: "",
    employeeFullName: "",
    display_order: "",
    status: "Active",
  });

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    // getsession(school_id)
    setschool_id(school_id);

    const savedClasses = localStorage.getItem("classes");
    if (savedClasses) {
      const parsed = JSON.parse(savedClasses);

      setClassList(parsed);
    }

    console.log("classList:", classList);
  }, []);

  const resetForm = () => {
    setButtonAction("");
    setedit_id("");
    setEditIndex(null);

    setFormData({
      room_number: "",
      class_id: "",
      teacher_name: "",
      display_order: "",
      status: "Active",
    });

    setErrors({});
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    const action = e;

    // let newErrors = {};

    // if (!formData.class_id) newErrors.class_id = "Required";
    // if (!formData.room_number) newErrors.room_number = "Required";
    // if (!formData.teacher_name) newErrors.teacher_name = "Required";
    // if (!formData.display_order) newErrors.display_order = "Required";
    // if (!formData.status) newErrors.status = "Required";

    // setErrors(newErrors);

    const newErrors = {};

    if (!formData.class_id) newErrors.class_id = "Required";
    if (!formData.room_number) newErrors.room_number = "Required";
    if (!formData.teacher_name) newErrors.teacher_name = "Required";
    if (!formData.display_order) newErrors.display_order = "Required";
    if (!formData.status) newErrors.status = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(
        formData.class_id
          ? formData.room_number
            ? formData.teacher_name
              ? formData.display_order

                ? ""

                : "Display Order is required"
              : "Teacher Name is required"
            : "Room Number is required"
          : "Class Section is required"
      );
      return;
    }

    setErrors({});

    const payload = {
      school_id: school_id,
      class_id: formData.class_id,
      room_number: formData.room_number,
      teacher_name: formData.teacher_name,
      display_order: Number(formData.display_order),
      status: formData.status,
    };

    if (e == "edit") {
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        redirect: "follow",
      };

      let url = localurl + "update_class_detail/" + edit_id;

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);

          if (data.success) {
            handleApiResponse(data);
            getclassdetail(school_id);

            setFormData({
              room_number: "",
              class_id: "",
              teacher_name: "",
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

            if (msg.includes("class_id")) newErrors.class_id = data.message;
            if (msg.includes("room_number"))
              newErrors.room_number = data.message;
            if (msg.includes("teacher_name"))
              newErrors.teacher_name = data.message;
            if (msg.includes("display_order"))
              newErrors.display_order = data.message;
            if (msg.includes("status")) newErrors.status = data.message;

            setErrors(newErrors);
          }
        })
        .catch((data) => handleApiResponse(data));
    } else {
      try {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          redirect: "follow",
        };

        fetch(localurl + "add_class_detail", requestOptions)
          .then((response) => response.text())
          .then((result) => {
            const data = JSON.parse(result);

            if (data.success) {
              handleApiResponse(data);
              getclassdetail(school_id);

              setFormData({
                room_number: "",
                class_id: "",
                teacher_name: "",
                display_order: "",
                status: "Active",
              });

              setErrors({});

              if (action === "exit") {
                setShowForm(false);
              }
            } else {
              handleApiResponse(data);

              const msg = data.message?.toLowerCase();
              let newErrors = {};

              if (msg.includes("class_id")) newErrors.class_id = data.message;
              if (msg.includes("room_number"))
                newErrors.room_number = data.message;
              if (msg.includes("teacher_name"))
                newErrors.teacher_name = data.message;
              if (msg.includes("display_order"))
                newErrors.display_order = data.message;
              if (msg.includes("status")) newErrors.status = data.message;

              setErrors(newErrors);
            }
          })
          .catch((data) => handleApiResponse(data));
      } catch (err) {
        console.error("Submit error:", err);
      }
    }
  };


  const getclass_section = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "class_section/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {

        const { success, message, row } = JSON.parse(result);

        if (success) {
          const activeData = row
            .filter((item) => item.status === "Active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });

          setRecords(activeData);
        }
      })
      .catch((err) => handleApiResponse(err));
  };

  const getemployee = (school_id, session_id) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(localurl + "employee/" + school_id + "/" + session_id, requestOptions)
      .then((response) => response.text())

      .then((result) => {
        console.log("oioioi", result);

        const { success, row } = JSON.parse(result);

        if (success) {
          setEmployees(row
            .filter((item) => item.status === "active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            }));
        }
      })
      .catch((data) => handleApiResponse(data));
  };

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    let class_id = localStorage.getItem("class_id");
    let session_id = localStorage.getItem("session_id");

    getemployee(school_id, session_id);

    getclass_section(school_id, class_id);

    setschool_id(school_id);
    setclass_id(class_id);
  }, []);

  const getclassdetail = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "class_detail/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log("class details", result);

        const { success, message, row } = JSON.parse(result);

        if (success) {
          setClasses(row.sort((a, b) => {
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

  useEffect(() => {
    console.log("classdata", localStorage.getItem("classes"));
  }, []);

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    setschool_id(school_id);

    if (school_id) {
      getclassdetail(school_id);
    }
  }, []);

  // console.log("ooooojj", getclassdetail);

  const handleEdit = (index, id) => {
    const item = classes[index];

    setedit_id(id);

    setButtonAction("edit");

    setFormData({
      class_id: item.class_id,
      room_number: item.room_number,
      teacher_name: item.teacher_id,
      display_order: item.display_order,
      status: item.status === "Active" ? "Active" : "Inactive",
    });

    setEditIndex(index);
    setShowForm(true);
  };

  const toggleStatus = async (index) => {
    try {
      const item = classes[index];

      const newStatus = item.status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_class_detail/" + item.id, {
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
        getclassdetail(school_id);
        handleApiResponse(data);
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Class Detail</h2>

        <button
          onClick={() => {
            setEditIndex(null);
            setShowForm(true);
          }}
          className="bg-[#0860C4] text-white px-4 py-2 rounded-lg"
        >
          + Add Class
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th className="p-2">#</th>

              <th
                onClick={() => handleSort("class_id")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Class Name ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("room_number")}
              >
                Room Number ⬍
              </th>

              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("teacher_name")}
              >
                Teacher Name ⬍
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

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {classes.length > 0 ? (
              classes.map((c, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    {c.full_class_name || c.class_id}
                  </td>
                  <td className="p-2">{c.room_number}</td>
                  <td className="p-2">{c.teacher_name}</td>
                  <td className="p-2">{c.display_order}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${c.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(index, c.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(index)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${c.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transition 
                          ${c.status === "Active" ? "translate-x-6" : ""}`}
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

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl w-[600px] p-6">
            <h2 className="text-xl font-bold text-black mb-6">Class Detail</h2>

            <div>
              <div className="grid grid-cols-1 grid-cols-2 gap-4">
                <ClassSelect
                  name="class_id"
                  label={<>Class Section <span className="text-red-500">*</span></>}
                  value={formData.class_id}
                  onChange={handleChange}
                  error={errors.class_id}
                  options={[
                    { label: "---Select Class Section---", value: "" },

                    ...records.map((record) => ({
                      label: `${record.class_name} - ${record.section}`,
                      value: record.id,
                    })),
                  ]}
                />


                <FloatingInput
                  type="number"
                  name="room_number"
                  label={<>Room Number <span className="text-red-500">*</span></>}
                  value={formData.room_number}
                  error={errors.room_number}
                  onChange={handleChange}
                  required
                />
                <ClassSelect
                  name="teacher_name"
                  label={<>Teacher Name <span className="text-red-500">*</span></>}
                  value={formData.teacher_name}
                  error={errors.teacher_name}
                  onChange={handleChange}
                  options={[
                    { label: "Select Teacher", value: "" },
                    ...employees.map((emp) => ({
                      label: emp.employeeFullName || emp.name,
                      value: emp.id,
                    })),
                  ]}
                />

                <FloatingInput
                  type="number"
                  name="display_order"
                  label={<>Display Order <span className="text-red-500">*</span></>}
                  value={formData.display_order}
                  error={errors.display_order}
                  onChange={handleChange}
                  required
                />

                <FloatingSelect
                  name="status"
                  label=" Status"
                  value={formData.status}
                  onChange={handleChange}
                  error={errors.status}
                  options={["Active", "Inactive"]}
                />
              </div>

              <div className="flex gap-3 mt-6">
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
}

export default ClassDetailTable;
