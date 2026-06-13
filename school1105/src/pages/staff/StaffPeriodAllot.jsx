import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";
import { FloatingInput, FloatingSelect, FloatingSelects } from "../../Component/common/FloatingInput";
import usePagination from "../../hooks/usePagination";
import CommonPagination from "../../Component/common/Pagination";

const StaffPeriodAllot = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [allotments, setAllotments] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [school_id, setschool_id] = useState("");
  const [session_id, setsession_id] = useState("");
  const [edit_id, setedit_id] = useState("");
  const [ButtonAction, setButtonAction] = useState("");
  const [errors, setErrors] = useState({});

  // Pagination hook
  const {
    currentPage,
    totalPages,
    currentData: paginatedAllotments,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(allotments, 10);

  const [formData, setFormData] = useState({
    staff_id: "",
    class_id: "",
    period_id: "",
    subject_id: "",
    room_no: "",
    status: "Active",
  });

  useEffect(() => {
    let sid = localStorage.getItem("school_id");
    let sess_id = localStorage.getItem("session_id");
    setschool_id(sid);
    setsession_id(sess_id);

    if (sid && sess_id) {
      getAllotments(sid, sess_id);
      getMasters(sid, sess_id);
    }
  }, []);

  const getMasters = (sid, sess_id) => {
    // fetch(localurl + "employee/" + sid + "/" + sess_id)
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.row) {
    //       setEmployees(data.row
    //         .sort((a, b) => String(a.employeeFullName).localeCompare(String(b.employeeFullName))));
    //     }

    // Employees
    fetch(localurl + "employee/" + sid + "/" + sess_id)
      .then(res => res.json())
      .then(data => {
        if (data.row) {
          // Filtering active employees and sorting alphabetically
          const activeEmployees = data.row.filter(emp => emp.status && emp.status.toLowerCase() === "active");
          setEmployees(activeEmployees.sort((a, b) => String(a.employeeFullName).localeCompare(String(b.employeeFullName))));
        }

      });


    // Classes
    fetch(localurl + "class_section/" + sid)
      .then(res => res.json())
      .then(data => {
        if (data.row) {

          setClasses(data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || []);
        }
      });

    // Periods
    fetch(localurl + "period/" + sid)
      .then(res => res.json())
      .then(data => {
        if (data.row) {
          setPeriods(data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
        }
      });

    // Subjects
    fetch(localurl + "subject/" + sid)
      .then(res => res.json())
      .then(data => {
        let sList = (data.rows || data.row || [])
          .filter((item) => item.status === "Active")
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        setSubjects(sList);
      });
  };

  const getAllotments = (sid, sess_id) => {
    fetch(localurl + "staff_period_allot/" + sid + "/" + sess_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllotments(data.row);
        } else {
          setAllotments([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setAllotments([]);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = (action) => {
    // Validation
    const newErrors = {};
    if (!formData.staff_id) newErrors.staff_id = "Staff is required";
    if (!formData.class_id) newErrors.class_id = "Class is required";
    if (!formData.period_id) newErrors.period_id = "Period is required";
    if (!formData.room_no) newErrors.room_no = "Room No is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      let validationMessage = "";
      if (!formData.staff_id) validationMessage = "Staff Name is required";
      else if (!formData.class_id) validationMessage = "Class is required";
      else if (!formData.period_id) validationMessage = "Period is required";
      else if (!formData.room_no) validationMessage = "Room No is required";
      showError(validationMessage);
      return;
    }

    const payload = {
      school_id: school_id,
      session_id: session_id,
      staff_id: formData.staff_id,
      class_id: formData.class_id,
      period_id: formData.period_id,
      subject_id: formData.subject_id || null,
      room_no: formData.room_no,
      status: formData.status,
    };

    const url =
      action === "edit"
        ? localurl + "update_staff_period_allot/" + edit_id
        : localurl + "add_staff_period_allot";

    const method = action === "edit" ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        handleApiResponse(data);

        if (data.success) {
          getAllotments(school_id, session_id);

          setFormData({
            staff_id: "",
            class_id: "",
            period_id: "",
            subject_id: "",
            room_no: "",
            status: "Active",
          });

          if (action === "exit" || action === "edit") {
            setShowForm(false);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  const toggleStatus = async (index) => {
    try {
      const item = allotments[index];
      const newStatus = item.status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_staff_period_allot/" + item.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        getAllotments(school_id, session_id);
        handleApiResponse(data)
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };

  const handleEdit = (index, id) => {
    const item = allotments[index];
    setedit_id(id);
    setButtonAction("edit");

    setFormData({
      staff_id: item.staff_id,
      class_id: item.class_id,
      period_id: item.period_id,
      subject_id: item.subject_id || "",
      room_no: item.room_no || "",
      status: item.status === "Active" ? "Active" : "Inactive",
    });

    setShowForm(true);
  };

  const handleDelete = async (index, id) => {
    if (window.confirm("Are you sure you want to delete this allotment?")) {
      try {
        const res = await fetch(localurl + "delete_staff_period_allot/" + id, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        if (data.success) {
          getAllotments(school_id, session_id);
          handleApiResponse(data);
        }
      } catch (err) {
        handleApiResponse({ success: false, message: "Error deleting allotment" });
      }
    }
  };

  // Helper functions for table display
  const getStaffName = (id) => employees.find(e => e.id == id)?.employeeFullName || id;

  const getClassName = (id) => {
    const c = classes.find(c => c.id == id);
    return c ? `${c.class_name} ${c.section}` : id;
  };
  const getPeriodName = (id) => periods.find(p => p.id == id)?.period || id;
  const getSubjectName = (id) => subjects.find(s => s.id == id)?.subject_name || id;

  const handlePrintTimetable = () => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const sessionData = JSON.parse(localStorage.getItem("session_data") || "{}");

    const schoolName = authData.school_name || "SCHOOL";
    const sessionName = sessionData.session_name || "Current Session";
    const schoolAddress = authData.address || authData.school_address || "";

    // Logo logic same as topbar
    const rawLogo = authData.upload_logo;
    const logoUrl = rawLogo
      ? (rawLogo.startsWith("data:") ? rawLogo : `${import.meta.env.VITE_SERVER_URL}/${rawLogo}`)
      : null;

    const logoHtml = logoUrl ? `<img src="${logoUrl}" style="height: 60px; margin-bottom: 10px; border-radius: 50%;" />` : "";

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>School Timetable</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 20px; 
            color: #334155;
            background-color: #ffffff;
          }
          .page-border {
            padding: 20px;
            min-height: 95vh;
          }
          .header { 
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: end;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px double #0f172a;
            gap: 30px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
            text-align: left;
          }
          .main-title {
            font-size: 13px;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-align: center;
            padding-bottom: 5px;
          }
          .logo-container {
            flex-shrink: 0;
            width: 75px;
            height: 75px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #e2e8f0;
          }
          .logo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .school-info {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }
          .school-name { 
            font-size: 24px; 
            font-weight: 800; 
            color: #0f172a; 
            margin: 0; 
            line-height: 1.1;
            white-space: nowrap;
          }
          .school-address {
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
            margin: 2px 0;
          }
          .session-info {
            font-size: 12px;
            color: #0860C4;
            font-weight: 700;
            margin-top: 2px;
            text-transform: uppercase;
          }
          .header-right {
            text-align: right;
          }
          .date-info {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
          }
          .date-info span { color: #0f172a; }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            table-layout: fixed;
            border: 1.5px solid #e2e8f0;
          }
          th, td { 
            border: 1px solid #e2e8f0;
            padding: 10px 5px; 
            text-align: center; 
            vertical-align: middle;
            word-wrap: break-word;
          }
          th { 
            background-color: #f8fafc; 
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9px;
            height: 45px;
          }
          .period-name {
            display: block;
            color: #0f172a;
            font-size: 10px;
            margin-bottom: 2px;
          }
          .period-time {
            display: block;
            font-size: 8.5px;
            color: #64748b;
            font-weight: 500;
          }
          .class-cell { 
            background-color: #f8fafc; 
            font-weight: 700;
            color: #0f172a;
            width: 80px;
            font-size: 11px;
            border-right: 1.5px solid #e2e8f0;
          }
          .subject { 
            font-weight: 700; 
            color: #0f172a;
            display: block;
            font-size: 11px;
            line-height: 1.1;
          }
          .teacher { 
            font-size: 9px; 
            color: #64748b;
            font-weight: 500;
            display: block;
            margin-top: 2px;
          }
          .room {
            font-size: 8px;
            color: #0860C4;
            font-weight: 700;
            display: block;
            margin-top: 4px;
            opacity: 0.8;
          }
          .watermark {
            position: fixed;
            top: 55%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 80px;
            font-weight: 900;
            color: rgba(0, 0, 0, 0.03);
            white-space: nowrap;
            pointer-events: none;
            z-index: -1;
            text-transform: uppercase;
          }
          footer {
            margin-top: 20px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="watermark">${schoolName}</div>
        <div class="page-border">
          <div class="header">
            <div class="header-left">
              ${logoUrl ? `
                <div class="logo-container">
                  <img src="${logoUrl}" />
                </div>
              ` : ""}
              <div class="school-info">
                <h1 class="school-name">${schoolName}</h1>
                ${schoolAddress ? `<p class="school-address">${schoolAddress}</p>` : ""}
                <div class="session-info">Session: ${sessionName}</div>
              </div>
            </div>
            <div class="main-title">Academic Timetable</div>
            <div class="header-right">
              <div class="date-info">Date: <span>${new Date().toLocaleDateString()}</span></div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="class-cell">CLASS \\ PERIOD</th>
                ${periods.map(p => `
                  <th>
                    <span class="period-name">${p.period}</span>
                    <span class="period-time">${p.start_time} - ${p.end_time}</span>
                  </th>
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${classes.map(cls => `
                <tr>
                  <td class="class-cell">${cls.class_name} ${cls.section}</td>
                  ${periods.map(p => {
      const allot = allotments.find(a => a.class_id == cls.id && a.period_id == p.id && a.status === "Active");
      return `
                      <td>
                        ${allot ? `
                          <span class="subject">${getSubjectName(allot.subject_id)}</span>
                          <span class="teacher">${getStaffName(allot.staff_id)}</span>
                          ${allot.room_no ? `<span class="room">RM: ${allot.room_no}</span>` : ""}
                        ` : '<span class="empty-cell">.</span>'}
                      </td>
                    `;
    }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          <footer>
            <div>${schoolName} Management System</div>
            <div>Official Academic Document - Page 1 of 1</div>
          </footer>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-black">Staff Period Allotment</h2>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/student-timetable")}
            className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            View Timetable
          </button>

          <button
            onClick={() => {
              setShowForm(true);
              setButtonAction("");
              setFormData({ staff_id: "", class_id: "", period_id: "", subject_id: "", room_no: "", status: "Active" });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Period Allotment
          </button>
        </div>
      </div>

      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">#</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Staff</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Class</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Room No</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Period</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Subject</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Status</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedAllotments.length > 0 ? (
              paginatedAllotments.map((item, index) => (
                <tr key={index} className="text-center border-t">
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{getStaffName(item.staff_id)}</td>
                  <td>{getClassName(item.class_id)}</td>
                  <td>{item.room_no || "-"}</td>
                  <td>{getPeriodName(item.period_id)}</td>
                  <td>{item.subject_id ? getSubjectName(item.subject_id) : "-"}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-white ${item.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="flex gap-2 justify-center py-2">
                    <button onClick={() => handleEdit(index, item.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                    {/* <button onClick={() => handleDelete(index, item.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button> */}
                    <button onClick={() => toggleStatus(index)} className={`w-12 h-6 flex items-center rounded-full p-1 ${item.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                      <div className={`bg-white w-4 h-4 rounded-full transition ${item.status === "Active" ? "translate-x-6" : ""}`} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center py-4">No Data Found</td></tr>
            )}
          </tbody>
        </table>

        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={allotments.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={changeItemsPerPage}
        />
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[500px] p-6">
            <h2 className="text-xl font-bold text-black border-b-2 border-blue-600 pb-1 inline-block mb-8">
              {ButtonAction === "edit" ? "Edit Allotment" : "Period Allotment"}
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <FloatingSelects
                  label={<>Staff <span className="text-red-500">*</span></>}
                  name="staff_id"
                  value={formData.staff_id}
                  onChange={handleChange}
                  required
                  options={
                    employees.map(e => ({ value: e.id, label: `${e.employeeFullName}` }))}
                  error={errors.staff_id}
                />

              </div>

              <div className="col-span-1">
                <FloatingSelects
                  label={<>Class <span className="text-red-500">*</span></>}
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  required
                  options={classes.map(c => ({ value: c.id, label: `${c.class_name} ${c.section}` }))}
                  error={errors.class_id}
                />
              </div>

              <div className="col-span-1">
                <FloatingSelects
                  label={<>Period <span className="text-red-500">*</span></>}
                  name="period_id"
                  value={formData.period_id}
                  onChange={handleChange}
                  required
                  options={periods.map(p => ({ value: p.id, label: p.period }))}
                  error={errors.period_id}
                />
              </div>

              <div className="col-span-1">
                <FloatingInput
                  label={<>Room No <span className="text-red-500">*</span></>}
                  name="room_no"
                  value={formData.room_no}
                  onChange={handleChange}
                  error={errors.room_no}
                />
              </div>

              <div className="col-span-1">
                <FloatingSelects
                  label="Subject (Optional)"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  options={subjects.map(s => ({ value: s.id, label: s.subject_name }))}
                />
              </div>

              <FloatingSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={["Active", "Inactive"]}
              />

              <div className="col-span-2 flex gap-3 mt-4">
                {ButtonAction === "" ? (
                  <>
                    <button onClick={() => handleSubmit("continue")} className="bg-green-600 text-white px-4 py-2 rounded">Save & Continue</button>
                    <button onClick={() => handleSubmit("exit")} className="bg-purple-600 text-white px-4 py-2 rounded">Save & Exit</button>
                  </>
                ) : (
                  <button onClick={() => handleSubmit("edit")} className="bg-purple-600 text-white px-4 py-2 rounded">Update</button>
                )}
                <button onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Timetable Preview
              </h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-8" id="printable-area">
              <div className="bg-white shadow-lg mx-auto p-12 min-h-[1100px] w-[1000px] relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* WATERMARK */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] text-[80px] font-black opacity-[0.03] select-none pointer-events-none uppercase whitespace-nowrap z-0">
                  {JSON.parse(localStorage.getItem("authData") || "{}").school_name}
                </div>

                {/* HEADER */}
                <div className="grid grid-cols-[auto,1fr,auto] items-end mb-6 pb-4 border-b-[3px] border-double border-slate-900 gap-8 relative z-10">
                  <div className="flex items-center gap-4">
                    {JSON.parse(localStorage.getItem("authData") || "{}").upload_logo && (
                      <div className="w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={JSON.parse(localStorage.getItem("authData") || "{}").upload_logo.startsWith("data:")
                            ? JSON.parse(localStorage.getItem("authData") || "{}").upload_logo
                            : `${import.meta.env.VITE_SERVER_URL}/${JSON.parse(localStorage.getItem("authData") || "{}").upload_logo}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <h1 className="text-2xl font-black text-slate-900 leading-tight whitespace-nowrap">
                        {JSON.parse(localStorage.getItem("authData") || "{}").school_name}
                      </h1>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {JSON.parse(localStorage.getItem("authData") || "{}").address || JSON.parse(localStorage.getItem("authData") || "{}").school_address}
                      </p>
                      <div className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">
                        Session: {JSON.parse(localStorage.getItem("session_data") || "{}").session_name}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[4px] text-center pb-1">
                    Academic Timetable
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Date: <span className="text-slate-900 ml-1">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* TABLE */}
                <table className="w-full border-collapse border border-slate-200 relative z-10">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 text-[10px] font-black text-slate-900 uppercase">Class \ Period</th>
                      {periods.map(p => (
                        <th key={p.id} className="border border-slate-200 p-3 text-center">
                          <div className="text-[10px] font-black text-slate-900 uppercase">{p.period}</div>
                          <div className="text-[9px] font-bold text-slate-400 mt-0.5">{p.start_time} - {p.end_time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(cls => (
                      <tr key={cls.id}>
                        <td className="border border-slate-200 p-3 text-[10px] font-black text-slate-700 bg-slate-50/50">
                          {cls.class_name} {cls.section}
                        </td>
                        {periods.map(p => {
                          const allot = allotments.find(a => a.class_id == cls.id && a.period_id == p.id && a.status === "Active");
                          return (
                            <td key={p.id} className="border border-slate-200 p-2 text-center min-w-[100px]">
                              {allot ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-[11px] font-bold text-slate-900 leading-tight">
                                    {getSubjectName(allot.subject_id)}
                                  </div>
                                  <div className="text-[9px] font-semibold text-slate-500 italic">
                                    {getStaffName(allot.staff_id)}
                                  </div>
                                  <div className="text-[8px] font-black text-blue-600 uppercase tracking-tighter mt-0.5">
                                    RM: {allot.room_no || "---"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-200 text-[10px]">.</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* FOOTER */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[9px] font-bold text-slate-400 uppercase relative z-10">
                  <div>{JSON.parse(localStorage.getItem("authData") || "{}").school_name} Management System</div>
                  <div>Official Academic Document - Page 1 of 1</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintTimetable}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPeriodAllot;
