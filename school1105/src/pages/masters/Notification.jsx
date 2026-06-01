import React, { useState, useEffect } from "react";
import {
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  FloatingSelects,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";

const AddNotification = () => {
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [errors, setErrors] = useState({});
  const [edit_id, setedit_id] = useState("");
  const [ButtonAction, setButtonAction] = useState("");
  const [session_id, setsession_id] = useState("");
  const [school_id, setschool_id] = useState("");
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const [notificationData, setNotificationData] = useState({
    Send_to: "All",
    date: "",
    messages: "",
    title: "",
    Schedule_date: "",
    time: "",
    display_order: "",
    status: "Active",
    class: "",
    department: "",
  });

  const handleView = (item) => {
    setViewData(item);
  };

  // ================= SORT =================
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...notifications].sort((a, b) => {
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";

      if (typeof aVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return direction === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
    setNotifications(sortedData);
  };

  useEffect(() => {
    let school = localStorage.getItem("school_id");
    let session = localStorage.getItem("session_id");
    setschool_id(school);
    setsession_id(session);
    getNotifications(school, session);
    getclass(school);
    getdepartment(school);
  }, []);

  const getclass = (school_id) => {
    fetch(localurl + "class_section/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeSections = data.row.filter(
            (d) => String(d.status).toLowerCase() === "active"
          );
          setClasses(activeSections);
        }
      })
      .catch((err) => console.log(err));
  };

  const getdepartment = (school_id) => {
    fetch(localurl + "department/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeDepartments = data.row.filter((d) => d.status === "Active");
          setDepartments(activeDepartments);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "Send_to") {
        updated.class = "";
        updated.department = "";
      }
      return updated;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const resetForm = () => {
    setNotificationData({
      Send_to: "All",
      date: "",
      messages: "",
      title: "",
      Schedule_date: "",
      time: "",
      display_order: "",
      status: "Active",
      class: "",
      department: "",
    });
    setErrors({});
    setButtonAction("");
    setedit_id("");
  };

  const getNotifications = (school_id, session_id) => {
    fetch(`${localurl}notification/${school_id}/${session_id}?type=admin`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sortedNotifications = (data.row || []).sort((a, b) => {
            const diff = (a.display_order || 0) - (b.display_order || 0);
            if (diff === 0) {
              return String(a.title || "").localeCompare(String(b.title || ""));
            }
            return diff;
          });
          setNotifications(sortedNotifications);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSubmit = (type) => {
    let newErrors = {};
    if (!notificationData.Send_to || notificationData.Send_to === "Select") newErrors.Send_to = "Required";
    if (notificationData.Send_to === "Student" && !notificationData.class) newErrors.class = "Required";
    if (notificationData.Send_to === "Staff" && !notificationData.department) newErrors.department = "Required";
    if (!notificationData.date) newErrors.date = "Required";
    if (!notificationData.title?.trim()) newErrors.title = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(
        (notificationData.Send_to && notificationData.Send_to !== "Select")
          ? (notificationData.Send_to === "Student" && !notificationData.class)
            ? "Class is required"
            : (notificationData.Send_to === "Staff" && !notificationData.department)
              ? "Department is required"
              : !notificationData.date
                ? "Date is required"
                : !notificationData.title?.trim()
                  ? "Title is required"
                  : ""
          : "Send To is required"
      );
      return;
    }

    setErrors({});

    const payload = {
      school_id,
      session_id,
      Send_to: notificationData.Send_to,
      date: notificationData.date,
      messages: notificationData.messages,
      time: notificationData.time,
      Schedule_date: notificationData.Schedule_date,
      class_id: notificationData.class,
      department_id: notificationData.department,
      display_order: Number(notificationData.display_order),
      status: notificationData.status,
      title: notificationData.title,
    };

    const method = type === "edit" ? "PUT" : "POST";
    const url = type === "edit"
      ? localurl + "update_notification/" + edit_id
      : localurl + "add_notification";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        handleApiResponse(data);
        if (data.success) {
          getNotifications(school_id, session_id);
          resetForm();
          setShowForm(false);
        }
      });
  };

  const handleEdit = (index, id) => {
    const item = notifications[index];
    setedit_id(id);
    setButtonAction("edit");

    const formatDate = (date) => {
      if (!date) return "";
      return date.split("T")[0];
    };

    setNotificationData({
      Send_to: item.Send_to,
      date: formatDate(item.date),
      Schedule_date: formatDate(item.Schedule_date),
      messages: item.messages,
      title: item.title,
      display_order: item.display_order,
      status: item.status,
      time: item.time,
      class: item.class_id || "",
      department: item.department_id || "",
    });
    setShowForm(true);
  };

  const toggleStatus = async (index) => {
    try {
      const item = notifications[index];
      const res = await fetch(localurl + "status_notification/" + item.id, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        getNotifications(school_id, session_id);
        handleApiResponse(data);
      }
    } catch (err) {
      handleApiResponse(err);
    }
  };

  const sentNotification = async (id) => {
    try {
      const res = await fetch(localurl + "send_notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        handleApiResponse(data);
        getNotifications(school_id, session_id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Notification Master</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Notification
        </button>
      </div>

      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer" onClick={() => handleSort("sNo")}># ⬍</th>
              <th onClick={() => handleSort("Send_to")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Send To ⬍</th>
              <th onClick={() => handleSort("department_name")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Department ⬍</th>
              <th onClick={() => handleSort("class_name")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Class ⬍</th>
              <th onClick={() => handleSort("messages")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Messages ⬍</th>
              <th onClick={() => handleSort("Schedule_date")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Schedule Date ⬍</th>
              <th onClick={() => handleSort("display_order")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Display ⬍</th>
              <th onClick={() => handleSort("status")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Status ⬍</th>
              <th onClick={() => handleSort("notification_status")} className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">Delivery ⬍</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n, index) => (
              <tr key={index} className="text-center border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{n.Send_to}</td>
                <td className="px-4 py-2">{n.department_name || "-"}</td>
                <td className="px-4 py-2">{n.class_name || "-"}</td>
                <td className="px-4 py-2 max-w-[200px] truncate">{n.messages}</td>
                <td className="px-4 py-2">
                  {n.Schedule_date ? new Date(n.Schedule_date).toLocaleDateString("en-GB") : "-"}
                </td>
                <td className="px-4 py-2">{n.display_order}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${n.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {n.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${n.notification_status === "Sent" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    {n.notification_status || "Draft"}
                  </span>
                </td>
                <td className="flex gap-2 justify-center px-4 py-2">
                  <button onClick={() => handleView(n)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button onClick={() => handleEdit(index, n.id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleStatus(index)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${n.status === "Active" ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${n.status === "Active" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <button onClick={() => sentNotification(n.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewData && (
        <div className="fixed inset-0 z-[9998] bg-black/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative z-[60] bg-white rounded-2xl w-full max-w-[540px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Notification Details</h2>
              <button onClick={() => setViewData(null)} className="text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div><p className="text-xs text-gray-400 uppercase">Title</p><p className="text-gray-800 font-semibold">{viewData.title}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Message</p><p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{viewData.messages}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400">Send To</p><p className="font-medium">{viewData.Send_to}</p></div>
                <div><p className="text-xs text-gray-400">Status</p><span className={`px-3 py-1 text-xs rounded-full ${viewData.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{viewData.status}</span></div>
                <div><p className="text-xs text-gray-400">Class</p><p className="font-medium">{viewData.class_name || "-"}</p></div>
                <div><p className="text-xs text-gray-400">Department</p><p className="font-medium">{viewData.department_name || "-"}</p></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setViewData(null)} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 mt-16">
          <div className="bg-white rounded-xl w-[600px] p-6">
            <h2 className="text-xl font-bold text-black mb-6">
              {ButtonAction === "edit" ? "Update Notification" : "Add Notification"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingSelect
                label="Send to"
                name="Send_to"
                value={notificationData.Send_to}
                onChange={handleChange}
                options={["Select", "All", "Student", "Staff"]}
                error={errors.Send_to}
              />
              {notificationData.Send_to === "Student" && (
                <FloatingSelects
                  label={<>Class <span className="text-red-500">*</span></>}
                  name="class"
                  value={notificationData.class}
                  onChange={handleChange}
                  options={classes.map((c) => ({ label: `${c.class_name} ${c.section}`, value: c.id }))}
                  error={errors.class}
                />
              )}
              {notificationData.Send_to === "Staff" && (
                <FloatingSelects
                  label={<>Department <span className="text-red-500">*</span></>}
                  name="department"
                  value={notificationData.department}
                  onChange={handleChange}
                  options={departments.map((d) => ({ label: d.department_name, value: d.id }))}
                  error={errors.department}
                />
              )}
              <FloatingInput
                type="date"
                label={<>Date <span className="text-red-500">*</span></>}
                name="date"
                value={notificationData.date}
                onChange={handleChange}
                error={errors.date}
                required
              />
              <FloatingInput
                label="Schedule Date"
                type="date"
                name="Schedule_date"
                value={notificationData.Schedule_date}
                onChange={handleChange}
              />
              <FloatingInput
                type="time"
                label="Time"
                name="time"
                value={notificationData.time}
                onChange={handleChange}
              />
              <div className="col-span-1 md:col-span-2">
                <FloatingInput
                  label={<>Title <span className="text-red-500">*</span></>}
                  name="title"
                  value={notificationData.title}
                  onChange={handleChange}
                  error={errors.title}
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <FloatingTextarea
                  label="Messages"
                  name="messages"
                  value={notificationData.messages}
                  onChange={handleChange}
                />
              </div>
              <FloatingInput
                type="number"
                label="Display Order"
                name="display_order"
                value={notificationData.display_order}
                onChange={handleChange}
              />
              <FloatingSelect
                label="Status"
                name="status"
                value={notificationData.status}
                onChange={handleChange}
                options={["Select", "Active", "Inactive", "Draft"]}
              />
              <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                <button
                  onClick={() => handleSubmit(ButtonAction === "edit" ? "edit" : "continue")}
                  className={`text-white px-4 py-2 rounded ${ButtonAction === "edit" ? "bg-purple-600" : "bg-green-600"}`}
                >
                  {ButtonAction === "edit" ? "Update" : "Save"}
                </button>
                <button
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

export default AddNotification;
