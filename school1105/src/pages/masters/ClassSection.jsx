import React, { useState, useEffect } from "react";
import {
  ClassSelect,
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

const ClassSection = () => {
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const sortTable = (key) => {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...records].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;

      return 0;
    });

    setRecords(sorted);
    setSortConfig({ key, direction });
  };
  const [errors, setErrors] = useState({});

  const [school_id, setschool_id] = useState("");

  const [class_id, setclass_id] = useState("");

  const [classes, setClasses] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [classsection, setclasssection] = useState({
    class_id: "",
    section: "",
    display_order: "",
    status: "Active",
  });

  const [records, setRecords] = useState([]);
  const [ButtonAction, setButtonAction] = useState("");
  const [edit_id, setedit_id] = useState("");

  const [editIndex, setEditIndex] = useState(null);

  const resetForm = () => {
    setButtonAction("");
    setedit_id("");
    setEditIndex(null);

    setclasssection({
      class_id: "",
      section: "",
      display_order: "",
      status: "Active",
    });

    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setclasssection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    let class_id = localStorage.getItem("class_id");

    getclass_section(school_id, class_id);

    setschool_id(school_id);
    setclass_id(class_id);
  }, []);

  const handleSubmit = (e) => {
    const action = e;

    // ================= VALIDATION =================
    let newErrors = {};

    if (!classsection.class_id) newErrors.class_id = "Required";
    if (!classsection.section) newErrors.section = "Required";
    if (!classsection.display_order) newErrors.display_order = "Required";
    if (!classsection.status) newErrors.status = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(classsection.class_id ? classsection.section ? classsection.display_order ? classsection.status ? "" : "Status is required" : "Display Order is required" : "Section is required" : "Class is required");
      return;
    }

    const payload = {
      school_id: school_id,
      class_id: classsection.class_id,
      section: classsection.section,
      display_order: Number(classsection.display_order),
      status: classsection.status,
    };

    // ================= EDIT =================
    if (e == "edit") {
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };

      let url = localurl + "update_class_section/" + edit_id;

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);

          if (data.success) {
            handleApiResponse(data);
            getclass_section(school_id);

            // ✅ RESET
            setclasssection({
              class_id: "",
              section: "",
              display_order: "",
              status: "Active",
            });

            setButtonAction("");
            setedit_id("");
            setEditIndex(null);
            setErrors({});

            // ✅ popup fix (no await)
            setTimeout(() => {
              setShowForm(false);
            }, 300);
          } else {
            handleApiResponse(data);

            // ✅ error mapping
            const msg = data.message?.toLowerCase();
            let newErrors = {};

            if (msg.includes("class_id")) newErrors.class_id = data.message;
            if (msg.includes("section")) newErrors.section = data.message;
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
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        };

        fetch(localurl + "add_class_section", requestOptions)
          .then((response) => response.text())
          .then((result) => {
            const data = JSON.parse(result);

            if (data.success) {
              handleApiResponse(data);
              getclass_section(school_id);

              // ✅ RESET
              setclasssection({
                class_id: "",
                section: "",
                display_order: "",
                status: "Active",
              });

              setErrors({});

              if (action === "exit") {
                setTimeout(() => {
                  setShowForm(false);
                }, 300);
              }
            } else {
              handleApiResponse(data);

              // ✅ error mapping
              const msg = data.message?.toLowerCase();
              let newErrors = {};

              if (msg.includes("class_id")) newErrors.class_id = data.message;
              if (msg.includes("section")) newErrors.section = data.message;
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

  const getClassName = (id) => {
    return classes.find((c) => c.id == id)?.class_name || "";
  };

  const getclass = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "class/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
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
    let school_id = localStorage.getItem("school_id");
    getclass(school_id);
    setschool_id(school_id);
  }, []);

  const getclass_section = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "class_section/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        const { success, message, row } = JSON.parse(result);

        if (success) {
          setRecords(row.sort((a, b) => {
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
    const item = records[index];

    setedit_id(id);

    setButtonAction("edit");

    setclasssection({
      class_id: item.class_id,
      section: item.section,
      display_order: item.display_order,
      status: item.status === "Active" ? "Active" : "Inactive",
    });

    setEditIndex(index);
    setShowForm(true);
  };

  const toggleStatus = async (index) => {
    try {
      const item = records[index];

      const newStatus = item.status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_class_section/" + item.id, {
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
        getclass_section(school_id);
        handleApiResponse(data);
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };

  return (
    <div className=" bg-white  rounded-t-2xl max-w-full p-4 ">
      {/* Header */}

      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Class Section Master</h2>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[#0860C4]  text-white p-2 rounded  "
        >
          + Add Class Section
        </button>
      </div>

      {/* Table */}

      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th className="whitespace-nowrap p-2">#</th>

              <th
                onClick={() => sortTable("class_id")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Class Name ⬍
              </th>

              <th
                onClick={() => sortTable("section")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Section ⬍
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

              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.map((r, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="p-2">{index + 1}</td>

                  <td>{getClassName(r.class_id)}</td>

                  <td className="p-2">{r.section}</td>

                  <td className="p-2">{r.display_order}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-white rounded ${r.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className=" p-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(index, r.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(index)}
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

      {/* Popup Form */}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-bold text-black mb-4">Add Class Section</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClassSelect
                name="class_id"
                label={<>Class <span className="text-red-500">*</span></>}
                value={classsection.class_id}
                error={errors.class_id}
                onChange={handleChange}
                options={[
                  { label: "Select Class", value: "" },
                  ...classes
                    .filter((c) => c.status === "Active")
                    .map((c) => ({
                      label: c.class_name,
                      value: c.id,
                    })),
                ]}
              />
              <FloatingInput
                type="text"
                name="section"
                label={<>Section <span className="text-red-500">*</span></>}
                error={errors.section}
                value={classsection.section}
                onChange={handleChange}
              />

              <FloatingInput
                type="number"
                name="display_order"
                label={<>Display Order <span className="text-red-500">*</span></>}
                error={errors.display_order}
                value={classsection.display_order}
                onChange={handleChange}
              />

              <FloatingSelect
                label="Status"
                name="status"
                error={errors.status}
                value={classsection.status}
                onChange={handleChange}
                options={["Active", "Inactive"]}
              />
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

export default ClassSection;
