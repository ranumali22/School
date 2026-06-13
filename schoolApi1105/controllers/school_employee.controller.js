const { create, getAll, update, runCustomQuery } = require("../model/school_account");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const formatDateForResponse = (date) => {
  if (!date || date === "0000-00-00") return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const formatDOBPassword = (dob) => {
  if (!dob || dob === "0000-00-00") return "";
  const parts = dob.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  return `${day}${month}${year}`;
};

exports.employee = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id || !session_id) {
      return res.json({
        success: false,
        message: "school_id and session_id required",
      });
    }

    let rows = await getAll("employee", "*", {
      school_id,
      session_id,
      status: "active",
    });

    if (rows.length > 0) {
      let finalData = await Promise.all(
        rows.map(async (emp) => {
          try {
            let department_name = null;
            let religion_name = null;
            let category_name = null;
            let nationality_name = null;
            let gender_name = null;

            // ✅ Department
            if (emp.department) {
              let dept = await getAll("department", "*", {
                id: emp.department,
                school_id,
              });

              if (dept.length > 0) {
                department_name = dept[0].department_name;
              }
            }

            // ✅ Religion
            if (emp.religion) {
              let religion = await getAll("religion", "*", {
                id: emp.religion,
                school_id,
              });

              if (religion.length > 0) {
                // religion_name = religion[0].religion_name;
                religion_name = religion[0]?.religion || null;
              }
            }

            // ✅ Category
            if (emp.category) {
              let category = await getAll("category", "*", {
                id: emp.category,
                school_id,
              });

              if (category.length > 0) {
                // category_name = category[0].category_name;
                category_name = category[0]?.category || null;
              }
            }

            // ✅ Nationality
            if (emp.nationality) {
              let nationality = await getAll("nationality", "*", {
                id: emp.nationality,
                school_id,
              });

              if (nationality.length > 0) {
                // nationality_name = nationality[0].nationality_name;
                nationality_name = nationality[0]?.nationality || null;
              }
            }

            // ✅ Gender
            if (emp.gender) {
              let gender = await getAll("gender", "*", {
                id: emp.gender,
                school_id,
              });

              if (gender.length > 0) {
                // gender_name = gender[0].gender_name;
                gender_name = gender[0]?.gender || null;
              }
            }
            let dob = formatDateForResponse(emp['dob']);
            // let dob = new Date(emp['dob']).toISOString().split('T')[0];


            return {
              ...emp,
              dob,
              department_name,
              religion_name,
              category_name,
              nationality_name,
              gender_name,
            };
          } catch (err) {
            return {
              ...emp,
              dob: null,
              department_name: null,
              religion_name: null,
              category_name: null,
              nationality_name: null,
              gender_name: null,
            };
          }
        }),
      );

      return res.json({
        success: true,
        message: "employee data",
        count: finalData.length,
        row: finalData,
      });
    }

    return res.json({
      success: false,
      message: "employee not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_employee = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.json({
        success: false,
        message: "Status is required",
      });
    }

    let result = await update("employee", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Employee not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_employee = async (req, res) => {
  try {
    const id = req.params.id;
    const rawData = req.body;
    const data = {};
    Object.keys(rawData).forEach(key => {

      if (['upload_type', 'id', 'logoPreview', 'logoFile'].includes(key)) return;

      if (typeof rawData[key] === 'string' || typeof rawData[key] === 'number') {
        data[key] = rawData[key];
      }
    });

    // Fix for dates saving as 1899 when empty
    if (data.dob === "") data.dob = null;
    if (data.dateOfJoining === "") data.dateOfJoining = null;
    if (data.dateOfLeaving === "") data.dateOfLeaving = null;

    // if (req.file) {
    //   data.employeePhoto = req.file.filename; // 🔥 FIX
    // }

    if (req.file) {
      const employeeFolder = path.join(
        __dirname,
        "../uploads/employee"
      );

      if (!fs.existsSync(employeeFolder)) {
        fs.mkdirSync(employeeFolder, { recursive: true });
      }

      const fileName = Date.now() + ".jpg";
      const outputPath = path.join(employeeFolder, fileName);

      let quality = 80;
      let buffer;

      do {
        buffer = await sharp(req.file.buffer)
          .resize({
            width: 800,
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toBuffer();

        quality -= 5;
      } while (buffer.length > 100 * 1024 && quality > 10);

      fs.writeFileSync(outputPath, buffer);

      data.employeePhoto = fileName;
    }

    // Password validation
    if (data.password && data.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    let result = await update("employee", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "employee updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "employee not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_employee = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;



      // if (req.file) {
      //   photo = req.file.filename;
      // }


      let photo = "";

      if (req.file) {
        const employeeFolder = path.join(
          __dirname,
          "../uploads/employee"
        );

        if (!fs.existsSync(employeeFolder)) {
          fs.mkdirSync(employeeFolder, { recursive: true });
        }

        const fileName = Date.now() + ".jpg";
        const outputPath = path.join(employeeFolder, fileName);

        let quality = 80;
        let buffer;

        do {
          buffer = await sharp(req.file.buffer)
            .resize({
              width: 800,
              withoutEnlargement: true,
            })
            .jpeg({ quality })
            .toBuffer();

          quality -= 5;
        } while (buffer.length > 100 * 1024 && quality > 10);

        fs.writeFileSync(outputPath, buffer);

        photo = fileName;

        console.log(
          "Compressed Employee Photo:",
          (buffer.length / 1024).toFixed(2),
          "KB"
        );
      }

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      if (!data.dob || data.dob.trim() === "") {
        data.dob = null;
      }
      data.password = formatDOBPassword(data.dob);
      const { employeeFullName, school_id, session_id, email } = req.body;

      if (!employeeFullName) {
        return res
          .status(400)
          .json({ success: false, message: "employeeFullName is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school id  is required" });
      }
      if (!session_id) {
        return res
          .status(400)
          .json({ success: false, message: "session id is required" });
      }



      let school_email = [];

      if (email && email.trim() !== "") {
        school_email = await getAll(
          "employee",
          "*",
          { school_id: school_id, email: email },
          "1",
        );
      }

      if (school_email.length > 0) {
        return res.json({
          success: false,
          message: "This employee email already exists in our records.",
        });
      } else {
        let school_students_name = await getAll(
          "employee",
          "*",
          { school_id: school_id },
          "1",
        );

        let school_prefix = await getAll("school_account", "*", { id: school_id });
        if (school_prefix.length == 0) {
          return res.json({
            success: false,
            message: "school id is missing",
          });
        }

        let s_prefix = school_prefix[0]['school_prefix'];

        console.log(school_prefix);

        if (s_prefix == "" || s_prefix == null) {
          return res.json({
            success: false,
            message: "Dear User, School prefix is missing. Kindly add it to continue using the system",
          });
        }
        let employee_id = 1000001;
        if (school_students_name.length > 0) {
          employee_id = parseInt(school_students_name[0]["employee_id"]);
          if (employee_id != "") {
            employee_id += 1;
          }
        }

        req.body = {
          ...req.body,
          employeePhoto: photo,
          employee_id: employee_id,
          loginId: s_prefix + employee_id,
          stu_prefix: s_prefix,
        };

        let result = "";
        try {
          result = create("employee", req.body);
        } catch (error) {
          return res
            .status(500)
            .json({ success: false, message: error.message });
        }
        if (result) {
          res.json({ success: true, message: "school employee successfully" });
        }
        res.json({ success: false, message: "school employee not done " });

      }
      res.json({ success: false, message: "Other request type:" + req.method });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.status_employee = async (req, res) => {
  try {
    const id = req.params.id;
    let { status } = req.body;

    status = status?.toLowerCase();

    if (!status || !["active", "inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Valid status required (active / inactive)",
      });
    }

    let result = await update("employee", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Employee status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Employee not found",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.login_employee = async (req, res) => {
  try {
    const { loginid, password, fcm_token } = req.body; // ✅ fcm_token added

    if (!loginid || !password) {
      return res.json({
        success: false,
        message: "Login ID & Password required ❌",
      });
    }

    let result = await getAll("employee", "*", {
      loginid: loginid,
      status: "active",
    });

    if (result.length === 0) {
      return res.json({
        success: false,
        message: "Employee not found ❌",
      });
    }

    let employee = result[0];

    // ✅ check if school is active
    let school = await getAll("school_account", "*", { id: employee.school_id });
    if (school.length === 0 || school[0].delete_status === "delete") {
      return res.json({
        success: false,
        message: "Your school account is inactive. Please contact the administrator. ❌",
      });
    }

    if (String(employee.password).trim() !== String(password).trim()) {
      return res.json({
        success: false,
        message: "Invalid password ❌",
      });
    }

    // ✅ SAVE FCM TOKEN IF PROVIDED
    if (fcm_token) {
      await update("employee", { fcm_token: fcm_token }, employee.id);

      // Also save to user_device_tokens
      let existingToken = await getAll("user_device_tokens", "*", {
        school_id: employee.school_id,
        user_id: employee.id,
        role: "staff",
        fcm_token: fcm_token
      });

      if (existingToken.length === 0) {
        await create("user_device_tokens", {
          school_id: employee.school_id,
          user_id: employee.id,
          role: "staff",
          fcm_token: fcm_token
        });
      }
    }

    return res.json({
      success: true,
      message: "Login successful ✅",
      data: employee,
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_staff_period_allot = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({ success: false, message: "Other request type: " + req.method });
    }

    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send("Data is empty!");
    }

    const { school_id, session_id, staff_id, class_id, period_id } = data;

    if (!school_id || !session_id || !staff_id || !class_id || !period_id) {
      return res.json({
        success: false,
        message: "school_id, session_id, staff_id, class_id, and period_id are required",
      });
    }

    let existingAllotments = await getAll("staff_period_allot", "*", {
      school_id,
      session_id,
      class_id,
      period_id,
      delete_status: "show"
    });

    if (existingAllotments.length > 0) {
      return res.json({
        success: false,
        message: `This class already has a subject assigned for this period.`
      });
    }

    let result = await create("staff_period_allot", data);
    if (result) {
      return res.json({ success: true, message: "Staff period allotted successfully" });
    }
    return res.json({ success: false, message: "Failed to allot period" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.staff_period_allot = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id || !session_id) {
      return res.json({ success: false, message: "school_id and session_id required" });
    }

    let rows = await getAll("staff_period_allot", "*", { school_id, session_id, delete_status: "show" });

    if (rows.length > 0) {
      return res.json({ success: true, message: "Data fetched", row: rows });
    }

    return res.json({ success: false, message: "No data found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_staff_period_allot = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let result = await update("staff_period_allot", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({ success: true, message: "Allotment updated successfully" });
    }

    return res.json({ success: false, message: "Data not found or not updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete_staff_period_allot = async (req, res) => {
  try {
    const id = req.params.id;
    let result = await update("staff_period_allot", { delete_status: "deleted" }, id);

    if (result && result.affectedRows > 0) {
      return res.json({ success: true, message: "Allotment deleted successfully" });
    }
    return res.json({ success: false, message: "Data not found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.status_staff_period_allot = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status || !["Active", "Inactive"].includes(status)) {
      return res.json({ success: false, message: "Valid status required (Active / Inactive)" });
    }

    let result = await update("staff_period_allot", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({ success: true, message: "Status updated successfully" });
    }
    return res.json({ success: false, message: "Data not found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.get_student_timetable = async (req, res) => {
  try {
    const { school_id, session_id, class_id } = req.params;

    if (!school_id || !session_id || !class_id) {
      return res.json({ success: false, message: "school_id, session_id, and class_id are required" });
    }

    let rows = await getAll("staff_period_allot", "*", { school_id, session_id, class_id, delete_status: "show", status: "Active" });

    if (rows && rows.length > 0) {
      return res.json({ success: true, message: "Timetable fetched successfully", data: rows });
    }

    return res.json({ success: false, message: "No timetable found for this class" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const staff_dashboard_summary = async (req, res) => {
  try {
    const { school_id, session_id, staff_id } = req.params;

    if (!school_id || !session_id || !staff_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    const staffRows = await getAll("employee", "*", { id: staff_id, school_id });
    if (staffRows.length === 0) {
      return res.json({ success: false, message: "Staff not found" });
    }
    const staff = staffRows[0];


    const allotments = await getAll("staff_period_allot", "*", {
      school_id,
      session_id,
      staff_id,
      delete_status: "show",
      status: "Active"
    });

    const uniqueClasses = [...new Set(allotments.map(a => a.class_id))];


    const notificationSql = `
      SELECT n.* FROM notification n
      WHERE n.school_id = ? AND n.session_id = ? 
      AND (
        n.Send_to = 'All' OR 
        (n.Send_to = 'Staff' AND (n.department_id IS NULL OR n.department_id = '' OR n.department_id = '0' OR n.department_id = ?))
      )
      AND n.delete_status = 'show'
      ORDER BY n.id DESC LIMIT 3
    `;
    const recentNotifications = await runCustomQuery(notificationSql, [school_id, session_id, staff.department || 0]);

    res.json({
      success: true,
      data: {
        profile: staff,
        stats: {
          totalClasses: uniqueClasses.length,
          totalPeriods: allotments.length,
          notifications: recentNotifications
        }
      }
    });

  } catch (error) {
    console.error("Staff Summary API Error:", error);
    res.json({ success: false, message: error.message });
  }
};

exports.staff_dashboard_summary = staff_dashboard_summary;


