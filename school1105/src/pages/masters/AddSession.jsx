import React, { useState, useEffect } from "react";
import {
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";
import { useNavigate } from "react-router-dom";

const AddSession = () => {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [school_id, setschool_id] = useState("");
  const [ButtonAction, setButtonAction] = useState("");
  const [errors, setErrors] = useState({});
  const [edit_id, setedit_id] = useState("");
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState({
    sessionName: "",
    startDate: "",
    endDate: "",
    displayOrder: "",

    status: "Active",
  });

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

    const sortedData = [...sessions].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setSessions(sortedData);
  };

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    getsession(school_id);
    setschool_id(school_id);
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSessionData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const resetForm = () => {
    setButtonAction("");
    setedit_id("");
    setEditIndex(null);

    setSessionData({
      sessionName: "",
      startDate: "",
      endDate: "",
      displayOrder: "",
      status: "Active",
    });

    setErrors({});
  };
  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    const action = e;

    let newErrors = {};

    if (!sessionData.sessionName) newErrors.sessionName = "Required";
    if (!sessionData.startDate) newErrors.startDate = "Required";
    if (!sessionData.endDate) newErrors.endDate = "Required";
    if (!sessionData.displayOrder) newErrors.displayOrder = "Required";
    if (!sessionData.status) newErrors.status = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(sessionData.sessionName ? sessionData.startDate ? sessionData.endDate ? sessionData.displayOrder ? "" : "Display Order is required" : "End Date is required" : "Start Date is required" : "Session Name is required");
      return;
    }

    const payload = {
      school_id: school_id,
      session_name: sessionData.sessionName,
      start_date: sessionData.startDate,
      end_date: sessionData.endDate,
      display_order: Number(sessionData.displayOrder),
      session_status: sessionData.status,
    };

    // ================= EDIT =================
    if (e == "edit") {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow",
      };

      let url = localurl + "update_session/" + edit_id;

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);

          if (data.success) {
            handleApiResponse(data);
            getsession(school_id);

            // ✅ RESET
            setSessionData({
              sessionName: "",
              startDate: "",
              endDate: "",
              displayOrder: "",
              status: "Active",
            });

            setButtonAction("");
            setedit_id("");
            setEditIndex(null);
            setErrors({});
            setShowForm(false);
          } else {
            const msg = data.message?.toLowerCase();
            let newErrors = {};

            if (msg.includes("session_name"))
              newErrors.sessionName = data.message;
            if (msg.includes("start_date")) newErrors.startDate = data.message;
            if (msg.includes("end_date")) newErrors.endDate = data.message;
            if (msg.includes("display_order"))
              newErrors.displayOrder = data.message;
            if (msg.includes("session_status")) newErrors.status = data.message;

            setErrors(newErrors);
            handleApiResponse(data);
          }
        })
        .catch((data) => handleApiResponse(data));
    }

    // ================= ADD =================
    else {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(payload),
          redirect: "follow",
        };

        fetch(localurl + "add_session", requestOptions)
          .then((response) => response.text())
          .then(async (result) => {
            const data = JSON.parse(result);

            if (data.success) {

              handleApiResponse(data);

              localStorage.removeItem("manual_session");

              getsession(school_id);

              setSessionData({
                sessionName: "",
                startDate: "",
                endDate: "",
                displayOrder: "",
                status: "Active",
              });

              setErrors({});

              if (action === "exit") {
                window.location.href = "/dashboard";
              }

            } else {
              handleApiResponse(data);

              const msg = data.message?.toLowerCase();
              let newErrors = {};

              if (msg.includes("session_name"))
                newErrors.sessionName = data.message;
              if (msg.includes("start_date"))
                newErrors.startDate = data.message;
              if (msg.includes("end_date")) newErrors.endDate = data.message;
              if (msg.includes("display_order"))
                newErrors.displayOrder = data.message;
              if (msg.includes("session_status"))
                newErrors.status = data.message;

              setErrors(newErrors);
            }
          })
          .catch((data) => handleApiResponse(data));
      } catch (err) {
        console.error("Submit error:", err);
      }
    }
  };

  const getsession = (school_id) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(localurl + "session/" + school_id, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);

        const { success, message, row } = JSON.parse(result);

        if (success) {
          setSessions(
            row.sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            })
          );

          // ✅ LOCAL STORAGE SAVE
          if (row && row.length > 0) {
            localStorage.setItem("session_id", row[0].id);
          }
        }
      })
      .catch((data) => handleApiResponse(data));
  };
  // ================= EDIT =================
  const handleEdit = (index, id) => {
    const item = sessions[index];

    setedit_id(id);

    setButtonAction("edit");

    setSessionData({
      sessionName: item.session_name,
      startDate: item.start_date.split("/").reverse().join("-"),
      endDate: item.end_date.split("/").reverse().join("-"),
      displayOrder: item.display_order,
      status: item.session_status === "Active" ? "Active" : "Inactive",
    });

    setEditIndex(index);
    setShowForm(true);
  };

  // ================= STATUS =================
  const toggleStatus = async (index) => {
    try {
      const item = sessions[index];

      const newStatus =
        item.session_status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_session/" + item.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_status: newStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        handleApiResponse(data);

        localStorage.removeItem("manual_session");

        getsession(school_id);

        window.location.href = "/dashboard";
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };

  console.log("****************************");
  console.log(sessions);
  console.log("****************************");

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Session Master</h2>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Session
        </button>
      </div>

      {/* TABLE */}
      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                #
              </th>
              <th
                onClick={() => handleSort("session_name")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Session ⬍
              </th>

              <th
                onClick={() => handleSort("start_date")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                Start Date ⬍
              </th>
              <th
                onClick={() => handleSort("end_date")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                End Date ⬍
              </th>
              <th
                onClick={() => handleSort("display_order")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
              >
                DisplayOrder ⬍
              </th>
              <th
                onClick={() => handleSort("session_status")}
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
            {sessions.length > 0 ? (
              sessions.map((s, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.session_name}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.start_date}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.end_date}
                  </td>
                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {s.display_order}
                  </td>

                  <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-white ${s.session_status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                        }`}
                    >
                      {s.session_status}
                    </span>
                  </td>

                  <td className="flex gap-2 justify-center px-2 md:px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(index, s.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(index)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${s.session_status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transition 
                          ${s.session_status === "Active" ? "translate-x-6" : ""}`}
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

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl w-[600px] p-6">
            <h2 className="text-xl font-bold text-black mb-6">
              {ButtonAction === "edit" ? "Update Session" : "Add Session"}
            </h2>

            {/* <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4"> */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label={<>Session Name <span className="text-red-500">*</span></>}
                name="sessionName"
                required
                value={sessionData.sessionName}
                onChange={handleChange}
                error={errors.sessionName}
              />

              <FloatingInput
                type="date"
                required
                label={<>Start Date <span className="text-red-500">*</span></>}
                name="startDate"
                value={sessionData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />

              <FloatingInput
                type="date"
                label={<>End Date <span className="text-red-500">*</span></>}
                name="endDate"
                required
                value={sessionData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />

              <FloatingInput
                type="number"
                required
                label={<>Display Order <span className="text-red-500">*</span></>}
                name="displayOrder"
                value={sessionData.displayOrder}
                onChange={handleChange}
                error={errors.displayOrder}
              />

              <FloatingSelect
                label="Status"
                name="status"
                type="select"
                value={sessionData.status}
                onChange={handleChange}
                options={["Active", "Inactive"]}
                error={errors.status}
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
                        if (typeof handleSubmit === "function") {
                          handleSubmit("exit");

                        }
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

            {/* </form> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSession;


