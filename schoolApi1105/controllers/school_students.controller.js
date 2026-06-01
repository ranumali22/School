const db = require("../database/database");
const { array } = require("../middleware/upload");
const {
  sendNotificationHelper,
  sendAttendanceNotification,
} = require("../utils/helper.js");

const { create, getAll, update, runCustomQuery, deleteData } = require("../model/school_account");

const formatDateForResponse = (date) => {
  if (!date || date === "0000-00-00") return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDOBPassword = (dob) => {
  if (!dob || dob === "0000-00-00") return null;
  const [year, month, day] = dob.split("-");
  return `${day}${month}${year}`;
};



exports.students = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id || !session_id) {
      return res.json({
        success: false,
        message: "school_id and session_id required",
      });
    }

    let rows = await getAll("students", "*", {
      school_id,
      session_id,
      delete_status: "show", // ✅ FIX
    });

    if (rows.length > 0) {
      let roww = await Promise.all(
        rows.map(async (rdata) => {
          try {
            let section_class = null;

            console.log("1=>", rdata["studentName"]);
            console.log("4=>", rdata["registerClass"]);

            if (rdata.registerClass) {
              // 1. Try finding by ID (Primary Key)
              let class_sec = await getAll("class_section", "*", {
                school_id,
                id: rdata.registerClass,
              });

              // 2. Fallback to finding by class_id (Foreign Key)
              if (class_sec.length === 0) {
                class_sec = await getAll("class_section", "*", {
                  school_id,
                  class_id: rdata.registerClass,
                });
              }

              console.log("class_sec2", class_sec);

              if (class_sec.length > 0) {
                let section = class_sec[0]["section"];
                let class_id = class_sec[0]["class_id"];

                console.log("class_id3", class_id);
                let class_get = await getAll("class", "*", {
                  school_id,
                  id: class_id,
                });

                console.log("class_get4", class_get);
                if (class_get.length > 0) {
                  section_class = class_get[0]["class_name"] + " " + section;
                }
              }
            }
            let dob = formatDateForResponse(rdata["dob"]);
            let registerAdmissionDate = formatDateForResponse(rdata["registerAdmissionDate"]);
            return { ...rdata, dob, registerAdmissionDate, section_class };
          } catch (err) {
            return { ...rdata, section_class: null };
          }
        }),
      );

      return res.json({
        success: true,
        message: "school_students data",
        count: roww.length,
        row: roww,
      });
    }

    return res.json({
      success: false,
      message: "No students found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.student_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.json({
        success: false,
        message: "Student ID required ❌",
      });
    }

    let result = await getAll("students", "*", {
      id,
      delete_status: "show",
    });

    if (result.length === 0) {
      return res.json({
        success: false,
        message: "Student not found ❌",
      });
    }

    let student = result[0];

    // ✅ OPTIONAL: class + section add (same like students API)
    let section_class = null;

    if (student.registerClass) {
      let class_sec = await getAll("class_section", "*", {
        school_id: student.school_id,
        id: student.registerClass,
      });

      if (class_sec.length === 0) {
        class_sec = await getAll("class_section", "*", {
          school_id: student.school_id,
          class_id: student.registerClass,
        });
      }

      if (class_sec.length > 0) {
        let section = class_sec[0].section;
        let class_id = class_sec[0].class_id;

        let class_get = await getAll("class", "*", {
          school_id: student.school_id,
          id: class_id,
        });

        if (class_get.length > 0) {
          section_class = class_get[0].class_name + " " + section;
        }
      }
    }

    return res.json({
      success: true,
      message: "Student fetched successfully ✅",
      data: {
        ...student,
        dob: formatDateForResponse(student.dob),
        registerAdmissionDate: formatDateForResponse(student.registerAdmissionDate),
        section_class,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const checkRequiredFields = (obj, fields) => {
  let missing = [];

  fields.forEach((field) => {
    if (!obj[field] || obj[field] === "") {
      missing.push(field);
    }
  });

  return missing;
};


exports.add_students = async (req, res) => {
  try {
    let data = req.body;

    console.log(data);

    const requiredFields = ["studentName", "school_id", "session_id"];

    // ================= BULK =================
    if (Array.isArray(data)) {
      let inserted = [];
      let errors = [];

      // 👉 ek baar hi max id nikal
      let last = await getAll("students", "*", {
        school_id: data[0]?.school_id,
      });

      let school_id = data[0]?.school_id;

      console.log(school_id);

      let school_prefix = await getAll("school_account", "*", {
        id: school_id,
      });
      console.log(school_prefix);

      if (school_prefix.length == 0) {
        return res.json({
          success: false,
          message: "school id is missing",
        });
      }

      let s_prefix = school_prefix[0]["school_prefix"];

      console.log(school_prefix);

      if (s_prefix == "" || s_prefix == null) {
        return res.json({
          success: false,
          message:
            "Dear User, School prefix is missing. Kindly add it to continue using the system",
        });
      }

      let student_ids = 1000001;
      if (last.length > 0) {
        let maxId = Math.max(...last.map((r) => parseInt(r.student_ids || 0)));
        student_ids = maxId + 1;
      }

      for (let i = 0; i < data.length; i++) {
        let student = data[i];

        let missing = checkRequiredFields(student, requiredFields);

        if (missing.length > 0) {
          errors.push({
            row: i + 1,
            message: `${missing.join(", ")} is missing`,
          });
          continue;
        }

        // Default DOB to null if not provided
        if (!student.dob || student.dob === "" || student.dob === "0000-00-00") {
          student.dob = null;
        }
        // Default Admission Date to null if not provided
        if (!student.registerAdmissionDate || student.registerAdmissionDate === "" || student.registerAdmissionDate === "0000-00-00") {
          student.registerAdmissionDate = null;
        }

        student.student_ids = student_ids++;
        student.loginid = s_prefix + student.student_ids.toString();
        student.password = formatDOBPassword(student.dob);
        student.stu_prefix = s_prefix;
        student.status = student.status || "active";


        let result = await create("students", student);
        if (result) inserted.push(student);
      }

      return res.json({
        success: true,
        message: "Bulk process completed",
        inserted: inserted.length,
        errors: errors,
      });
    }

    // ================= SINGLE =================
    else {
      if (req.files && req.files.photo) {
        data.photo = req.files.photo[0].filename;
      }

      let missing = checkRequiredFields(data, requiredFields);

      if (missing.length > 0) {
        return res.json({
          success: false,
          message: `${missing.join(", ")} is missing`,
        });
      }

      let last = await getAll("students", "*", { school_id: data.school_id });

      let school_id = data.school_id;

      let school_prefix = await getAll("school_account", "*", {
        id: school_id,
      });

      if (school_prefix.length == 0) {
        return res.json({
          success: false,
          message: "school id is missing",
        });
      }

      let s_prefix = school_prefix[0]["school_prefix"];

      console.log(school_prefix);

      if (s_prefix == "" || s_prefix == null) {
        return res.json({
          success: false,
          message:
            "Dear User, School prefix is missing. Kindly add it to continue using the system",
        });
      }

      let student_ids = 1000001;
      if (last.length > 0) {
        let maxId = Math.max(...last.map((r) => parseInt(r.student_ids || 0)));
        student_ids = maxId + 1;
      }

      // ✅ Default DOB to null if not provided (must be BEFORE create)
      if (!data.dob || data.dob === "" || data.dob === "0000-00-00") {
        data.dob = null;
      }

      // ✅ Default Admission Date to null if not provided
      if (!data.registerAdmissionDate || data.registerAdmissionDate === "" || data.registerAdmissionDate === "0000-00-00") {
        data.registerAdmissionDate = null;
      }

      data.student_ids = student_ids;
      data.loginid = s_prefix + student_ids.toString();
      data.password = formatDOBPassword(data.dob);
      data.stu_prefix = s_prefix;
      data.status = data.status || "active";

      let result = await create("students", data);

      return res.json({
        success: result ? true : false,
        message: result ? "Student added" : "Failed",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.upload_students_excel = async (req, res) => {
  try {
    const { school_id, session_id, class_id, students } = req.body;

    // ✅ BASIC VALIDATION
    if (!school_id || !session_id || !class_id) {
      return res.json({
        success: false,
        message: "school_id, session_id, class_id required",
      });
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.json({
        success: false,
        message: "No student data found",
      });
    }

    // ✅ SCHOOL PREFIX
    let school_prefix = await getAll("school_account", "*", {
      id: school_id,
    });

    if (school_prefix.length === 0) {
      return res.json({
        success: false,
        message: "Invalid school_id",
      });
    }

    let s_prefix = school_prefix[0]["school_prefix"];

    if (!s_prefix) {
      return res.json({
        success: false,
        message: "School prefix missing",
      });
    }

    // ✅ LAST STUDENT ID
    let last = await getAll("students", "*", { school_id });

    let student_ids = 1000001;
    if (last.length > 0) {
      let maxId = Math.max(...last.map((r) => parseInt(r.student_ids || 0)));
      student_ids = maxId + 1;
    }

    // =====================================================
    // 🔥 🔥 MOST IMPORTANT FIX (CLASS MAPPING)
    // =====================================================

    const target_class_id = Array.isArray(class_id) ? class_id[0] : class_id;

    // 1. Try finding by ID (Primary Key)
    let classData = await getAll("class_section", "*", {
      school_id,
      id: target_class_id,
    });

    // 2. If not found, try finding by class_id (Foreign Key)
    if (classData.length === 0) {
      classData = await getAll("class_section", "*", {
        school_id,
        class_id: target_class_id,
      });
    }

    if (classData.length === 0) {
      return res.json({
        success: false,
        message: "Invalid class_id (class_section not found)",
      });
    }

    const final_register_class = classData[0].id; // ✅ The actual PK to store

    let section = classData[0].section;
    let class_id_main = classData[0].class_id;

    let class_get = await getAll("class", "*", {
      school_id,
      id: class_id_main,
    });

    if (class_get.length === 0) {
      return res.json({
        success: false,
        message: "Class not found",
      });
    }

    let section_class = class_get[0].class_name + " " + section; // ✅ FINAL VALUE

    // =====================================================

    let inserted = 0;
    let errors = [];

    // ✅ LOOP
    for (let i = 0; i < students.length; i++) {
      let item = students[i];

      try {
        // ✅ REQUIRED CHECK
        if (!item.studentName || !item.primaryNo) {
          errors.push({
            row: i + 1,
            message: "studentName or primaryNo missing",
          });
          continue;
        }


        // ✅ FINAL DATA
        let student = {
          school_id,
          session_id,

          registerClass: final_register_class, // ✅ Resolved ID
          studentName: item.studentName,
          fatherName: item.fatherName || "",
          motherName: item.motherName || "",
          primaryNo: item.primaryNo,
          secondaryNo: item.secondaryNo || "",

          gender: item.gender || "",
          category: item.category || "",
          religion: item.religion || "",
          nationality: item.nationality || "",
          bloodgroup: item.bloodgroup || "",
          medium: item.medium || "",
          rte: item.rte || "No",

          currentAddress: item.currentAddress || "",
          currentCity: item.currentCity || "",
          currentState: item.currentState || "",
          currentPinCode: item.currentPinCode || "",

          permanentAddress: item.permanentAddress || "",
          permanentCity: item.permanentCity || "",
          permanentState: item.permanentState || "",
          permanentPinCode: item.permanentPinCode || "",

          student_ids: student_ids,
          loginid: s_prefix + student_ids.toString(),
          dob: item.dob && item.dob !== "" ? item.dob : null,
          password: formatDOBPassword(item.dob && item.dob !== "" ? item.dob : null),
          // password: formatDOBPassword(item.dob),
          stu_prefix: s_prefix,
          status: "active",
        };

        await create("students", student);

        student_ids++;
        inserted++;
      } catch (err) {
        errors.push({
          row: i + 1,
          message: err.message,
        });
      }
    }

    return res.json({
      success: true,
      message: "Excel upload completed",
      inserted,
      errors,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_students = async (req, res) => {
  try {
    const id = req.params.id;
    const rawData = req.body;
    const data = {};

    // Clean data: only keep strings or numbers to avoid [object Object] errors
    Object.keys(rawData).forEach(key => {
      // Exclude non-database fields
      if (['upload_type', 'id', 'logoPreview', 'logoFile'].includes(key)) return;

      if (typeof rawData[key] === 'string' || typeof rawData[key] === 'number') {
        data[key] = rawData[key];
      }
    });

    if (req.file) {
      data.photo = req.file.filename;
    }

    if (!data || Object.keys(data).length === 0) {
      return res.json({
        success: false,
        message: "No data received ❌",
      });
    }

    // ✅ FIX: only valid dob
    if (data.dob && data.dob !== "0000-00-00") {
      data.password = formatDOBPassword(data.dob);
    }

    delete data.loginid; // protect

    let result = await update("students", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Student updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Student not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_students = async (req, res) => {
  try {
    const id = req.params.id;

    let result = await update(
      "students",
      {
        delete_status: "deleted", // ✅ FIXED
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Student deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Student not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_students = async (req, res) => {
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

    let result = await update("students", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Student status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Student not found",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.student_login = async (req, res) => {
  try {
    const { loginid, password, fcm_token } = req.body; // 👈 fcm_token added

    // ✅ basic validation
    if (!loginid || !password) {
      return res.json({
        success: false,
        message: "loginid & password required ❌",
      });
    }

    // ✅ check student (Search by loginid across all schools)
    let student = await getAll("students", "*", {
      loginid,
      delete_status: "show",
    });

    if (student.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Login ID ❌",
      });
    }

    let user = student[0];

    // ✅ check if school is active
    let school = await getAll("school_account", "*", { id: user.school_id });
    if (school.length === 0 || school[0].delete_status === "delete") {
      return res.json({
        success: false,
        message: "Your school account is inactive. Please contact the administrator. ❌",
      });
    }

    // ✅ password match
    if (user.password !== password) {
      return res.json({
        success: false,
        message: "Invalid Password ❌",
      });
    }

    // ✅ SAVE FCM TOKEN IF PROVIDED
    if (fcm_token) {
      await update("students", { fcm_token: fcm_token }, user.id);

      // Also save to user_device_tokens for multi-device support or general tracking
      let existingToken = await getAll("user_device_tokens", "*", {
        school_id: user.school_id,
        user_id: user.id,
        role: "student",
        fcm_token: fcm_token
      });

      if (existingToken.length === 0) {
        await create("user_device_tokens", {
          school_id: user.school_id,
          user_id: user.id,
          role: "student",
          fcm_token: fcm_token
        });
      }
    }

    // ✅ SUCCESS
    return res.json({
      success: true,
      message: "Login successful ✅",
      data: {
        id: user.id,
        studentName: user.studentName,
        loginid: user.loginid,
        class: user.registerClass,
        school_id: user.school_id,
        session_id: user.session_id,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_student_subject_allot = async (req, res) => {
  try {
    const { student_id, subjectgroup_id, subject_ids, session_id, school_id } =
      req.body;

    // ✅ Validation
    if (
      !student_id ||
      !subjectgroup_id ||
      !subject_ids ||
      !session_id ||
      !school_id
    ) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // ✅ Convert to array
    let subjectArray = [];

    if (typeof subject_ids === "string") {
      subjectArray = subject_ids.split(",").map(Number);
    } else if (Array.isArray(subject_ids)) {
      subjectArray = subject_ids.map(Number);
    }

    if (subjectArray.length === 0) {
      return res.json({
        success: false,
        message: "subject_ids must not be empty",
      });
    }

    // 🔥 convert to string (IMPORTANT)
    const subject_ids_string = subjectArray.join(",");

    // ✅ check existing
    const existing = await getAll("student_subject_allot", "*", {
      student_id,
      session_id,
      school_id,
      delete_status: "show",
    });

    // ✅ अगर record है → UPDATE
    if (existing.length > 0) {
      await update(
        "student_subject_allot",
        {
          subjectgroup_id,
          subject_id: subject_ids_string, // 🔥 single column में store
        },
        {
          student_id,
          session_id,
          school_id,
        },
      );

      return res.json({
        success: true,
        message: "Subjects updated successfully",
      });
    }

    // ✅ INSERT (ONLY ONE ROW)
    create("student_subject_allot", {
      student_id,
      subjectgroup_id,
      subject_id: subject_ids_string, // 🔥 "1,2,3"
      session_id,
      school_id,
    });

    return res.json({
      success: true,
      message: "Subjects assigned successfully",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

//student subject alloted
exports.student_subject_allot = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    const rows = await getAll("students", "*", {
      school_id,
      session_id,

      delete_status: "show",
    });

    let rowss = [];

    rowss = await Promise.all(
      rows.map(async (data) => {
        let student_id = data["id"];
        let student_ids = data["student_ids"];

        let class_sec = "";

        id = data["registerClass"];

        let st_class = await getAll("class_section", "*", {
          school_id,
          id,
        });

        if (st_class.length === 0) {
          st_class = await getAll("class_section", "*", {
            school_id,
            class_id: id,
          });
        }

        if (st_class.length > 0) {
          let class_id_master = st_class[0]["class_id"];

          const st_class_name = await getAll("class", "*", {
            school_id,
            id: class_id_master,
          });

          if (st_class_name.length > 0) {
            class_sec =
              st_class_name[0]["class_name"] + " " + st_class[0]["section"];
          }
        }

        let allsubjects = await getAll("subject", "*", {
          school_id,
          delete_status: "show",
        });

        const st_name = await getAll("student_subject_allot", "*", {
          school_id,
          session_id,
          student_id,
          delete_status: "show",
        });
        let subject_name1 = [];

        let st_grop_gp = "";
        if (st_name.length > 0) {
          let group_id = st_name?.[0]?.["subjectgroup_id"];

          if (group_id) {
            const st_grop = await getAll("subject_group", "*", {
              school_id,
              id: group_id,
              delete_status: "show",
            });

            if (st_grop.length > 0) {
              st_grop_gp = st_grop[0]["group_name"];
            }
          }

          let subject_ids = "";

          subject_ids = st_name[0].subject_id
            ? st_name[0].subject_id.split(",")
            : [];
          subject_ids.map(async (items) => {
            allsubjects.map((subject) => {
              if (subject.id == items) {
                subject_name1.push({
                  sub_id: items,
                  subject_name: subject["subject_name"],
                });
              }
            });
          });

          return {
            ...st_name[0],
            students_name: data["studentName"],
            student_class: class_sec,
            subject_group: st_grop_gp,
            subject_name: subject_name1,
            student_ids,
          };
        }

        return {
          ...data,
          students_name: data["studentName"],
          student_id: student_id,
          student_class: class_sec,
          subject_group: [],
          subject_name: [],
          subjectgroup_id: "",
        };
      }),
    );

    if (!rowss || rowss.length === 0) {
      return res.json({
        success: true,
        message: "No data found",
        total: 0,
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Student subjects fetched successfully",
      total: rowss.length,
      data: rowss,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.update_student_subject_allot = async (req, res) => {
  try {
    const id = req.params.id;

    const { subject_ids, subjectgroup_id, student_id, session_id, school_id } =
      req.body;

    if (!id) {
      return res.json({ success: false, message: "id is required" });
    }

    // ✅ check record
    const exist = await getAll("student_subject_allot", "*", {
      id,
      delete_status: "show",
    });

    if (exist.length === 0) {
      return res.json({ success: false, message: "Record not found" });
    }

    const existingData = exist[0];

    // 🔥 convert string → array
    let subjectArray = [];

    if (typeof subject_ids === "string") {
      subjectArray = subject_ids.split(",").map(Number);
    } else if (Array.isArray(subject_ids)) {
      subjectArray = subject_ids;
    }

    if (subjectArray.length === 0) {
      return res.json({
        success: false,
        message: "subject_ids required",
      });
    }

    // 🔥 store as string again
    const finalSubjectIds = subjectArray.join(",");

    // ✅ final data
    const updateData = {
      student_id: student_id ?? existingData.student_id,
      subjectgroup_id: subjectgroup_id ?? existingData.subjectgroup_id,
      subject_id: finalSubjectIds, // 🔥 IMPORTANT
      session_id: session_id ?? existingData.session_id,
      school_id: school_id ?? existingData.school_id,
    };

    // ✅ update
    const result = await update("student_subject_allot", updateData, id);

    return res.json({
      success: true,
      message: result.affectedRows > 0 ? "Updated successfully" : "No changes",
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.json({
      success: false,
      message: "Server error",
    });
  }
};

exports.delete_student_subject_allot = async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ ID validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    // ✅ Check record exists (only active ones)
    const exist = await getAll("student_subject_allot", "*", {
      id,
      delete_status: "show",
    });

    if (!exist || exist.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or already deleted",
      });
    }

    // ✅ Soft delete
    const result = await update(
      "student_subject_allot",
      {
        delete_status: "delete",
        deleted_at: new Date(),
      },
      { id },
    );

    // ✅ Result check (extra safety)
    if (result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Deleted successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Delete failed",
      });
    }
  } catch (error) {
    console.error("DELETE student_subject_allot ERROR:", error);

    return res.json({
      success: false,
      message: "Server error",
    });
  }
};

exports.all_student_subject_allot = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    const rows = await getAll("student_subject_allot", "*", {
      school_id,
      session_id,
      delete_status: "show",
    });

    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        message: "No data found",
        total: 0,
        data: [],
      });
    }

    // 🔥 All subject fetch
    const subjects = await getAll("subject", "id, subject_name", {
      delete_status: "show",
    });

    // 🔥 map bana lo
    const subjectMap = {};
    subjects.forEach((sub) => {
      subjectMap[sub.id] = sub.subject_name;
    });

    // 🔥 attach subject_names as string
    const finalData = rows.map((item) => {
      let subjectNames = "";

      if (item.subject_id) {
        let ids = item.subject_id.split(",");

        subjectNames = ids
          .map((id) => subjectMap[id] || "")
          .filter((name) => name !== "")
          .join(",");
      }

      return {
        ...item,
        subject_names: subjectNames, // 👈 string format
      };
    });

    return res.json({
      success: true,
      message: "Student subjects fetched successfully",
      total: finalData.length,
      data: finalData,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

//student_class_fee_head
exports.student_class_fee_head = async (req, res) => {
  try {
    const { school_id, session_id, registerClass, student_id } = req.params;

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }
    if (!registerClass) {
      return res.json({ success: false, message: "registerClass is required" });
    }
    if (!student_id) {
      return res.json({ success: false, message: "student_id is required" });
    }

    let id = registerClass;

    const st_class = await getAll("class_section", "*", {
      school_id,
      id,
      delete_status: "show",
    });

    let class_id = st_class[0]["class_id"];

    const strudent_fee = await getAll("student_fee_allot", "*", {
      school_id,
      session_id,
      class_id,
      student_id,
      delete_status: "show",
    });

    if (strudent_fee.length > 0) {
      let fee_header = await Promise.all(
        strudent_fee.map(async (feehead) => {
          let id = feehead["feehead_id"];

          const _feehead = await getAll("feehead", "*", {
            school_id,
            id,
            delete_status: "show",
          });
          let date = new Date(feehead["frequency_date"])
            .toISOString()
            .split("T")[0];
          let feehead_id = _feehead[0]["id"];
          let feehead_name = _feehead[0]["feehead"];

          let amount = feehead["amount"];

          return {
            id: feehead["feehead_id"],
            feehead_id: feehead_id,
            feehead_name: feehead_name,
            date: date,
            amount: amount,
          };
        }),
      );

      return res.json({
        success: true,
        message: "fee details class by",
        feehead: fee_header,
      });
    }

    const class_fee = await getAll("classfee", "*", {
      school_id,
      class_id,
      session_id,
      delete_status: "show",
    });

    let fee_header = await Promise.all(
      class_fee.map(async (feehead) => {
        let id = feehead["feehead_id"];

        const _feehead = await getAll("feehead", "*", {
          school_id,
          id,
          delete_status: "show",
        });
        let date = new Date(feehead["date"]).toISOString().split("T")[0];
        let feehead_id = _feehead[0]["id"];
        let feehead_name = _feehead[0]["feehead"];

        let amount = feehead["amount"];

        return {
          feehead_id: feehead_id,
          feehead_name: feehead_name,
          date: date,
          amount: amount,
        };
      }),
    );

    return res.json({
      success: true,
      message: "fee details class by",
      feehead: fee_header,
    });
    // rowss = await Promise.all(
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

// ================= student fee allot =================
exports.add_student_fee_allot = async (req, res) => {
  try {
    const { student_id, school_id, session_id, fees, class_id } = req.body;

    if (!student_id) {
      return res.json({ success: false, message: "student_id is required" });
    }

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }
    if (!class_id) {
      return res.json({ success: false, message: "class_id is required" });
    }

    if (!fees) {
      return res.json({ success: false, message: "fees array is required" });
    }

    if (!Array.isArray(fees)) {
      return res.json({ success: false, message: "fees must be an array" });
    }

    if (fees.length === 0) {
      return res.json({ success: false, message: "fees array is empty" });
    }

    let insertId = "";
    if (fees.length > 0) {
      const promises = fees.map(async (feedata) => {
        const exist = await getAll("student_fee_allot", "*", {
          school_id,
          student_id,
          session_id,
          feehead_id: feedata["feehead_id"],
          delete_status: "show",
        });

        if (exist && exist.length > 0) {
          const data = {
            class_id,
            student_id,
            school_id,
            session_id,
            feehead_id: feedata["feehead_id"],
            frequency_date: feedata["date"],
            amount: feedata["amount"],
          };

          console.log("update", data);

          let id = exist[0]["id"];
          console.log("id", id);

          const result = await update("student_fee_allot", data, id);

          console.log("upddd----", result);

          if (!result) {
            message = "student_fee_allot has not been updated  successfully";
          } else {
            message = "student_fee_allot has been updated  successfully";
          }

          return result;
        } else {
          const data = {
            class_id,
            student_id,
            school_id,
            session_id,
            feehead_id: feedata["feehead_id"],
            frequency_date: feedata["date"],
            amount: feedata["amount"],
          };

          message = "student_fee_allot has been created successfully";

          return create("student_fee_allot", data);
        }
      });

      const results = await Promise.all(promises);
      insertId = results; // array of all insert IDs
    }
    if (insertId) {
      return res.json({
        success: true,
        message,
      });
    } else {
      return res.json({
        success: false,
        message: "Fees not allotted  ",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Eception" + error.message,
    });
  }
};

exports.student_fee_allot = async (req, res) => {
  try {
    const { school_id, session_id, class_id } = req.params;

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }
    const rows = await getAll("students", "*", {
      school_id,
      session_id,
      registerClass: class_id,
      delete_status: "show",
    });

    const feeHeads = await getAll("feehead", "*", { school_id });

    let rowss = [];
    let records = [];

    rowss = await Promise.all(
      rows.map(async (data) => {
        let student_id = data["id"];
        let student_ids = data["student_ids"];

        let class_sec = "";
        let class_id_val = data["registerClass"];
        const st_class = await getAll("class_section", "*", {
          school_id,
          id: class_id_val,
          delete_status: "show",
        });

        if (st_class.length > 0) {
          let cid = st_class[0]["class_id"];

          const st_class_name = await getAll("class", "*", {
            school_id,
            id: cid,
            delete_status: "show",
          });

          if (st_class_name.length > 0) {
            class_sec =
              st_class_name[0]["class_name"] +
              "-" +
              st_class[0]["section"].toUpperCase();
          }
        }

        const student_fee = await getAll("student_fee_allot", "*", {
          school_id,
          session_id,
          student_id: student_id,
          delete_status: "show",
        });

        let feeamount = 0;
        let studentRows = [];

        student_fee.forEach((fee) => {
          feeamount += parseFloat(fee["amount"] || 0);
          const head = feeHeads.find(h => Number(h.id) === Number(fee.feehead_id));
          studentRows.push({
            feeHead: head ? head.feehead : "Unknown",
            feeFrequency: head ? head.feefrequency : "",
            frequencyDate: fee.frequency_date,
            amount: fee.amount
          });
        });

        records.push({
          student_id: student_id,
          studentName: data["studentName"],
          rows: studentRows
        });

        if (student_fee.length > 0) {
          return {
            ...student_fee[0],
            student_id: student_id,
            students_name: data["studentName"],
            student_ids: data["student_ids"],
            stu_prefix: data["stu_prefix"],
            fatherName: data["fatherName"],
            class_section: class_sec,
            feeamount: feeamount,
            registerClass: data["registerClass"],
          };
        }

        return {
          ...data,
          student_id: student_id,
          students_name: data["studentName"],
          class_section: class_sec,
          feehead: "",
          feeamount: 0,
          registerClass: data["registerClass"],
        };
      }),
    );

    if (!rowss || rowss.length === 0) {
      return res.json({
        success: true,
        message: "No data found",
        total: 0,
        data: [],
        records: []
      });
    }

    return res.json({
      success: true,
      message: "Student fees fetched successfully",
      total: rowss.length,
      data: rowss,
      records: records
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error: " + error.message });
  }
};

exports.update_student_fee_allot = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.json({ success: false, message: "No data provided" });
    }

    const exist = await getAll("student_fee_allot", "*", { id });

    if (exist.length === 0) {
      return res.json({ success: false, message: "Record not found" });
    }

    const result = await update("student_fee_allot", data, id);

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: "Updated successfully" });
    }

    return res.json({ success: true, message: "No changes" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.delete_student_fee_allot = async (req, res) => {
  try {
    const id = req.params.id;

    const data = {
      delete_status: "deleted",
      deleted_at: new Date(),
    };

    const result = await update("student_fee_allot", data, id);

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: "Deleted successfully" });
    }

    return res.json({ success: false, message: "Not deleted" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.all_student_fee_allot = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    const data = await getAll("student_fee_allot", "*", {
      school_id,
      session_id,
      delete_status: "show",
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

// ================= student fee  =================
exports.add_student_fee = async (req, res) => {
  try {
    const { student_id, school_id, session_id, fees } = req.body;

    if (!student_id) {
      return res.json({ success: false, message: "student_id is required" });
    }

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    if (!fees) {
      return res.json({ success: false, message: "fees array is required" });
    }

    if (!Array.isArray(fees)) {
      return res.json({ success: false, message: "fees must be an array" });
    }

    if (fees.length === 0) {
      return res.json({ success: false, message: "fees array is empty" });
    }

    let insertId = "";
    if (fees.length > 0) {
      const promises = fees.map(async (feedata) => {
        if (feedata.fee_pay > 0) {
          const submit_fee = await getAll("students_submit_fee", "*", {
            school_id,
            student_id,
            session_id,
            delete_status: "show",
          });
          let receiptNo = 1;
          if (submit_fee.length > 0) {
            receiptNo = Number(submit_fee[0]["receiptNo"]) + 1;
          }

          const data = {
            student_id: student_id,
            school_id,
            session_id,
            fee_head_id: feedata["fee_head_id"],
            fee_date: feedata["fee_date"],
            fee_pay: feedata["fee_pay"],
            fee_discount: feedata["fee_discount"],
            pay_date: feedata["pay_date"],
            next_pay: feedata["next_pay"],
            receiptNo,
          };

          return create("students_submit_fee", data);
        }
      });

      const results = await Promise.all(promises);
      insertId = results;

      const cleaned = insertId.filter((item) => item !== undefined);

      // ✅ FIRST check success
      if (cleaned.length > 0) {
        // 🔥 STEP 1: create notification
        const notificationId = await create("notification", {
          school_id,
          session_id,
          title: "Fee Submitted 💰",
          messages: "Your fee has been successfully deposited",

          Send_to: "Single",
          student_id: student_id,

          class_id: null,
          department_id: null,
          date: new Date(),
          status: "Draft",
          delete_status: "show",
        });

        // 🔥 STEP 2: send notification
        // await exports.send_notification(
        //   { body: { notification_id: notificationId } },
        //   { json: () => {} },
        // );
        // await sendNotificationHelper(notificationData.insertId);

        console.log("NOTIFICATION ID 👉", notificationId);

        await sendNotificationHelper(notificationId);

        return res.json({
          success: true,
          message: "Fees submit successfully",
        });
      } else {
        return res.json({
          success: false,
          message: "Fees not submited",
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "" + error.message,
    });
  }
};

exports.delete_student_fee = async (req, res) => {
  try {
    const { school_id, session_id, student_id, receiptNo } = req.params;

    const data = {
      delete_status: "hide",
    };

    const result = await update("students_submit_fee", data, {
      school_id,
      session_id,
      student_id,
      receiptNo
    });

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: "Fee record deleted successfully" });
    }

    return res.json({ success: false, message: "Fee record not found" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.student_fee = async (req, res) => {
  console.log("students fee");

  try {
    const { school_id, session_id, class_id } = req.params;

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    let rows;
    if (class_id) {
      const sql = `
        SELECT s.* 
        FROM students s
        LEFT JOIN class_section cs ON s.registerClass = cs.id
        WHERE s.school_id = ? AND s.session_id = ? AND s.registerClass = ? AND s.delete_status = 'show'
        ORDER BY cs.display_order ASC, s.studentName ASC
      `;
      rows = await runCustomQuery(sql, [school_id, session_id, class_id]);
    } else {
      const sql = `
        SELECT s.* 
        FROM students s
        LEFT JOIN class_section cs ON s.registerClass = cs.id
        WHERE s.school_id = ? AND s.session_id = ? AND s.delete_status = 'show'
        ORDER BY cs.display_order ASC, s.studentName ASC
      `;
      rows = await runCustomQuery(sql, [school_id, session_id]);
    }

    console.log("fee students", rows);

    let rowss = [];
    rowss = await Promise.all(
      rows.map(async (data) => {
        let student_id = data["id"];
        let Allot = 0;
        let Fee = 0;
        let Paid = 0;
        let Rebate = 0;
        let Balance = 0;

        const student_fee_allot = await getAll("student_fee_allot", "*", {
          school_id,
          session_id,
          student_id,
          delete_status: "show",
        });

        if (student_fee_allot.length > 0) {
          student_fee_allot.map((fee) => {
            Allot += parseFloat(fee["amount"]);
          });
        }

        let deposit = [];

        let all_amount = [];
        const student_fee = await getAll("students_submit_fee", "*", {
          school_id,
          session_id,
          student_id,
          delete_status: "show",
        });

        const _feehead = await getAll("feehead", "*", {
          school_id,
          status: "active",
          delete_status: "show",
        });

        if (_feehead.length > 0) {
          _feehead.map((head) => {
            let allot = 0;
            if (student_fee_allot.length > 0) {
              student_fee_allot.map((fee) => {
                if (fee.feehead_id == head.id) {
                  allot = parseFloat(fee["amount"]);
                }
              });
            }

            let fee_pay = 0;
            if (student_fee.length > 0) {
              student_fee.map((sub_fee) => {
                if (head["id"] == sub_fee["fee_head_id"]) {
                  fee_pay += parseFloat(sub_fee.fee_pay);
                }
              });
            }
            Balance += parseFloat(allot);
            if (allot > 0) {
              deposit.push({
                fee_head_id: head["id"],
                fee_head_name: head["feehead"],
                allot: allot - fee_pay,
                feerec: 0,
                recdate: new Date().toISOString().split("T")[0],
                nextdate: new Date().toISOString().split("T")[0],
              });
            }
          });
        }

        let id = session_id;
        const session = await getAll("school_session", "*", {
          id,
          delete_status: "show",
        });
        id = data["registerClass"];
        const class_sec = await getAll("class_section", "*", {
          id,
          delete_status: "show",
        });
        let sec_name = class_sec[0]["section"];
        id = class_sec[0]["class_id"];
        const class1 = await getAll("class", "*", {
          id,
          delete_status: "show",
        });
        let class_name = class1[0]["class_name"];

        let class_section = class_name + "-" + sec_name.toUpperCase();

        if (student_fee.length > 0) {
          const grouped = {};

          await Promise.all(
            student_fee.map(async (fee) => {
              let id = fee["fee_head_id"];

              const fee_head = await getAll("feehead", "*", {
                id,
                delete_status: "show",
              });

              const receipt = fee.receiptNo;

              if (!grouped[receipt]) {
                grouped[receipt] = {
                  receiptNo: receipt,
                  fee_pay: 0,
                  pay_date: "",
                  all_fee: [],
                };
              }

              grouped[receipt].fee_pay += Number(fee.fee_pay || 0);
              grouped[receipt].pay_date = fee.pay_date;

              grouped[receipt].all_fee.push({
                fee_pay: fee["fee_pay"],
                fee_head: fee_head?.[0]?.feehead || "",
              });

              Paid += parseFloat(fee["fee_pay"] || 0);
              Rebate += parseFloat(fee["fee_discount"] || 0);
            }),
          );

          all_amount.push(grouped);

          Balance = Allot - Paid;

          return {
            ...data,
            ...student_fee[0],
            students_name: data["studentName"],
            father_name: data["fatherName"],
            student_ids: data["student_ids"],
            motherName: data["motherName"],
            primaryNo: data["primaryNo"],
            session: session[0]["session_name"],

            class: class_section,
            Allot,
            Fee,
            Paid,
            Rebate,
            Balance,
            deposit,
            all_amount,
            student_id: data["id"]
          };
        }

        return {
          ...data,
          students_name: data["studentName"],
          father_name: data["fatherName"],
          motherName: data["motherName"],
          primaryNo: data["primaryNo"],
          class: class_section,
          student_id: student_id,
          Allot,
          Fee,
          Paid,
          Rebate,
          Balance,
          deposit,
          all_amount,
        };
      }),
    );

    if (!rowss || rowss.length === 0) {
      return res.json({
        success: true,
        message: "No data found",
        total: 0,
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Student fee data fetched successfully",
      total: rowss.length,
      data: rowss,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.student_class_test = async (req, res) => {
  const {
    session_id,
    school_id,
    test_id,
    subject_head_id,
    subject_id,
    class_id,
  } = req.params;
  try {
    const datamarks_st = await getAll("student_class_test", "*", {
      school_id,
      session_id,
      test_id,
      subject_head_id,
      subject_id,
      classsection_id: class_id,
      delete_status: "show",
    });
    if (datamarks_st.length > 0) {
      let marks_data = await Promise.all(
        datamarks_st.map(async (marks) => {
          let id = marks["classsection_id"];

          const class_sec = await getAll("class_section", "*", {
            id,
            delete_status: "show",
          });

          let sec_name = class_sec[0]["section"];

          id = class_sec[0]["class_id"];

          const class1 = await getAll("class", "*", {
            id,
            delete_status: "show",
          });

          let class_name = class1[0]["class_name"];
          let classsection = class_name + "-" + sec_name.toUpperCase();

          id = marks["subject_id"];

          const subject_data = await getAll("subject", "*", {
            id,
            delete_status: "show",
          });

          let subject = subject_data[0]["subject_name"];

          id = marks["test_id"];

          const test_data = await getAll("class_test", "*", {
            id,
            delete_status: "show",
          });

          let test = "";
          if (test_data.length > 0) {
            test = test_data[0]["test_name"];
          }

          return {
            classsection,
            subject,
            test,
            subject_id: marks["subject_id"],
            class_id: marks["classsection_id"],
            test_id: marks["test_id"],
            subject_head_id: marks["subject_head_id"],
            subject_id: marks["subject_id"],
          };
        }),
      );

      const uniqueMarks = Array.from(
        new Map(
          marks_data.map((item) => [
            `${item.classsection}-${item.subject}-${item.test}`,
            item,
          ]),
        ).values(),
      );

      return res.json({
        success: true,
        message: "get student class test marks",
        marks_details: uniqueMarks,
      });
    }

    return res.json({
      success: false,
      message: "class test marks for students are not added. Kindly update.",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.student_class_test_details = async (req, res) => {
  try {
    const {
      session_id,
      school_id,
      class_id,
      test_id,
      subject_head_id,
      subject_id,
    } = req.params;

    let students;
    if (class_id != "") {
      let registerClass = class_id;
      students = await getAll("students", "*", {
        school_id,
        session_id,
        registerClass,
        delete_status: "show",
      });
    } else {
      students = await getAll("students", "*", {
        school_id,
        session_id,
        delete_status: "show",
      });
    }

    let students_marks = await getAll("student_class_test", "*", {
      school_id,
      session_id,
      classsection_id: class_id,
      test_id,
      subject_id,
      delete_status: "show",
    });

    if (students_marks.length > 0) {
      let students_data = await Promise.all(
        students_marks.map(async (datamarks) => {
          // 🔥 Student table se student_ids aur stu_prefix fetch karein (Edit functionality ke liye)
          const studInfo = await getAll("students", "student_ids, stu_prefix", { id: datamarks["student_id"] });
          const student_ids = studInfo.length > 0 ? studInfo[0].student_ids : "";
          const stu_prefix = studInfo.length > 0 ? studInfo[0].stu_prefix : "";

          let stud_object = {
            student_id: datamarks["student_id"],
            student_ids: student_ids, // Readable ID add kiya
            stu_prefix: stu_prefix,   // Prefix add kiya
            school_id,
            session_id,
            test_id: datamarks["test_id"],
            subject_head_id: datamarks["subject_head_id"],
            classsection_id: datamarks["classsection_id"],
            marks: datamarks["marks"],
            subject_id: datamarks["subject_id"],
            student_name: datamarks["student_name"],
            father_name: datamarks["father_name"],
            student_marks: datamarks["student_marks"],
            student_marks_percent:
              (datamarks["student_marks"] / datamarks["marks"]) * 100,
            exam_date: datamarks["exam_date"],
          };

          return stud_object;
        }),
      );

      return res.json({
        success: true,
        message: "get student class ",
        students_data,
      });
    } else {
      if (students.length > 0) {
        let students_data = await Promise.all(
          students.map(async (stud) => {
            let student_id = stud["id"];
            let id;
            id = stud["registerClass"];
            const class_sec = await getAll("class_section", "*", {
              id,
              delete_status: "show",
            });

            let sec_name = class_sec[0]["section"];
            id = class_sec[0]["class_id"];
            const class1 = await getAll("class", "*", {
              id,
              delete_status: "show",
            });
            let class_name1 = class1[0]["class_name"];
            let class_name = class_name1 + "-" + sec_name.toUpperCase();

            let stud_object = {
              student_id: stud["id"],
              student_ids: stud["student_ids"], // Readable ID
              stu_prefix: stud["stu_prefix"] || "", // Prefix
              student_name: stud["studentName"],
              father_name: stud["fatherName"],
              school_id,
              session_id,
              test_id: "",
              subject_head_id: "",
              classsection_id: "",
              marks: 0,
              subject_id: "",
              student_marks: 0,
              student_marks_percent: 0,
              exam_date: "",
            };
            return stud_object;
          }),
        );

        return res.json({
          success: true,
          message: "get student class ",
          students_data,
        });
      }

      return res.json({
        success: false,
        message: " students are not added. Kindly update.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.add_student_class_test = async (req, res) => {
  try {
    const {
      session_id,
      school_id,
      test_id,
      subject_head_id,
      subject_id,
      marks,
      marks_details,
      classsection_id,
    } = req.body;

    if (!classsection_id) {
      return res.json({ success: false, message: "class section is required" });
    }
    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    if (!test_id) {
      return res.json({ success: false, message: "test is required" });
    }

    if (!subject_head_id) {
      return res.json({ success: false, message: "subject head is required" });
    }

    if (!subject_id) {
      return res.json({ success: false, message: "subject is required" });
    }
    if (!marks) {
      return res.json({ success: false, message: " marks is required" });
    }
    if (!Array.isArray(marks_details)) {
      return res.json({
        success: false,
        message: " marks details array is required",
      });
    }
    if (marks_details.length == 0) {
      return res.json({
        success: false,
        message: " marks details is required",
      });
    }

    let message;
    if (marks_details.length > 0) {
      const promises = marks_details.map(async (datamarks) => {
        let student_id = datamarks["student_id"];
        const data_st = await getAll("student_class_test", "*", {
          school_id,
          student_id,
          test_id,
          subject_id,
          session_id,
          delete_status: "show",
        });

        const test_date = new Date();
        const data = {
          student_id,
          school_id,
          session_id,
          test_id,
          subject_head_id,
          classsection_id,
          marks,
          subject_id,
          student_name: datamarks["student_name"],
          father_name: datamarks["father_name"],
          student_marks: datamarks["student_marks"],
          exam_date: test_date,
        };

        if (data_st.length == 0) {
          message = " Student class test has been recorded successfully";
          return create("student_class_test", data);
        } else {
          let id = data_st[0]["id"];
          const result = await update("student_class_test", data, id);
          if (!result) {
          }
          message = " Student  class test has been updated  successfully";

          return result;
        }
      });
      const results = await Promise.all(promises);
      insertId = results;
    }

    const cleaned = insertId.filter((item) => item !== undefined);

    if (cleaned.length > 0) {
      return res.json({
        success: true,
        message,
      });
    }

    return res.json({
      success: false,
      message: "Student  class test was not recorded. Kindly update",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.student_main_exam = async (req, res) => {
  console.log("student_main_exam", req.params);

  const {
    session_id,
    school_id,
    test_id,
    subject_head_id,
    subject_id,
    class_id,
  } = req.params;
  try {
    const datamarks_st = await getAll("student_main_exam", "*", {
      school_id,
      session_id,
      test_id,
      subject_head_id,
      subject_id,
      classsection_id: class_id,
      delete_status: "show",
    });
    if (datamarks_st.length > 0) {
      let marks_data = await Promise.all(
        datamarks_st.map(async (marks) => {
          let id = marks["classsection_id"];

          const class_sec = await getAll("class_section", "*", {
            id,
            delete_status: "show",
          });

          let sec_name = class_sec[0]["section"];

          id = class_sec[0]["class_id"];

          const class1 = await getAll("class", "*", {
            id,
            delete_status: "show",
          });

          let class_name = class1[0]["class_name"];
          let classsection = class_name + "-" + sec_name.toUpperCase();

          id = marks["subject_id"];

          const subject_data = await getAll("subject", "*", {
            id,
            delete_status: "show",
          });

          let subject = subject_data[0]["subject_name"];

          id = marks["test_id"];

          const test_data = await getAll("main_exam", "*", {
            id,
            delete_status: "show",
          });

          let test = "";
          if (test_data.length > 0) {
            test = test_data[0]["exam_name"];
          }

          return {
            classsection,
            subject,
            test,
            subject_id: marks["subject_id"],
            class_id: marks["classsection_id"],
            test_id: marks["test_id"],
            subject_head_id: marks["subject_head_id"],
            subject_id: marks["subject_id"],
          };
        }),
      );

      const uniqueMarks = Array.from(
        new Map(
          marks_data.map((item) => [
            `${item.classsection}-${item.subject}-${item.test}`,
            item,
          ]),
        ).values(),
      );

      return res.json({
        success: true,
        message: "get student main exam marks",
        marks_details: uniqueMarks,
      });
    }

    return res.json({
      success: false,
      message:
        "student main exam marks for students are not added. Kindly update.",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.add_student_main_exam = async (req, res) => {
  try {
    const {
      session_id,
      school_id,
      test_id,
      subject_head_id,
      subject_id,
      marks,
      viva, // Max Viva from top level
      practical, // Max Practical from top level
      marks_details,
      classsection_id,
    } = req.body;

    // ... validation code ...

    if (marks_details.length > 0) {
      const promises = marks_details.map(async (datamarks) => {
        let student_id = datamarks["student_id"];
        const datamarks_st = await getAll("student_main_exam", "*", {
          school_id,
          student_id,
          test_id,
          session_id,
          subject_id,
          delete_status: "show",
        });

        if (datamarks_st.length == 0) {
          const data = {
            student_id,
            school_id,
            session_id,
            test_id,
            subject_head_id,
            marks, // Max Written
            viva: viva ?? 0, // Max Viva
            practical: practical ?? 0, // Max Practical
            classsection_id,
            subject_id,
            student_name: datamarks["student_name"],
            father_name: datamarks["father_name"],
            student_marks: datamarks["student_marks"],
            student_viva: datamarks["viva"] ?? datamarks["student_viva"] ?? 0,
            student_practical: datamarks["practical"] ?? datamarks["student_practical"] ?? 0,
            status: "active",
            delete_status: "show"
          };

          return create("student_main_exam", data);
        } else {
          const updateData = {
            marks, // Max Written
            viva: viva ?? 0, // Max Viva
            practical: practical ?? 0, // Max Practical
            student_marks: datamarks["student_marks"],
            student_viva: datamarks["viva"] ?? datamarks["student_viva"] ?? 0,
            student_practical: datamarks["practical"] ?? datamarks["student_practical"] ?? 0,
          };
          const existingId = datamarks_st[0].id;
          return update("student_main_exam", updateData, existingId);
        }
      });
      const results = await Promise.all(promises);
      insertId = results;
    }

    const cleaned = insertId.filter((item) => item !== undefined);

    if (cleaned.length > 0) {
      return res.json({
        success: true,
        message: "Main exam marks for students are  added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Main exam marks for students are not added. Kindly update.",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.student_main_exam_details = async (req, res) => {
  try {
    const {
      school_id,
      session_id,
      class_id,
      subject_id,
      test_id,
    } = req.params;

    let students;
    if (class_id != "") {
      let registerClass = class_id;
      students = await getAll("students", "*", {
        school_id,
        session_id,
        registerClass,
        delete_status: "show",
      });
    } else {
      students = await getAll("students", "*", {
        school_id,
        session_id,
        delete_status: "show",
      });
    }

    let students_marks = await getAll("student_main_exam", "*", {
      school_id,
      session_id,
      classsection_id: class_id,
      test_id,
      subject_id,
      delete_status: "show",
    });

    if (students_marks.length > 0) {
      let students_data = await Promise.all(
        students_marks.map(async (datamarks) => {
          const studentMarks = parseFloat(datamarks["student_marks"] || 0);
          const studentViva = parseFloat(datamarks["student_viva"] || 0);
          const studentPractical = parseFloat(datamarks["student_practical"] || 0);

          const maxWritten = parseFloat(datamarks["marks"] || 0);
          const maxViva = parseFloat(datamarks["viva"] || 0);
          const maxPractical = parseFloat(datamarks["practical"] || 0);

          let total = studentMarks + studentViva + studentPractical;
          let totalMax = maxWritten + maxViva + maxPractical;
          let parcent = totalMax > 0 ? (total / totalMax) * 100 : 0;

          stud_object = {
            student_id: datamarks["student_id"],
            school_id,
            session_id,
            test_id: datamarks["test_id"],
            subject_head_id: datamarks["subject_head_id"],
            classsection_id: datamarks["classsection_id"],
            marks: datamarks["marks"], // Max Written
            viva: datamarks["viva"], // Max Viva
            practical: datamarks["practical"], // Max Practical
            subject_id: datamarks["subject_id"],
            student_name: datamarks["student_name"],
            father_name: datamarks["father_name"],
            student_marks: datamarks["student_marks"],
            student_viva: datamarks["student_viva"],
            student_practical: datamarks["student_practical"],
            student_marks_percent: parcent,
            exam_date: datamarks["exam_date"],
          };

          return stud_object;
        }),
      );

      return res.json({
        success: true,
        message: "get student class ",
        students_data,
      });
    } else {
      if (students.length > 0) {
        let students_data = await Promise.all(
          students.map(async (stud) => {
            let student_id = stud["id"];
            let id;
            id = stud["registerClass"];
            const class_sec = await getAll("class_section", "*", {
              id,
              delete_status: "show",
            });

            let sec_name = class_sec[0]["section"];
            id = class_sec[0]["class_id"];
            const class1 = await getAll("class", "*", {
              id,
              delete_status: "show",
            });
            let class_name1 = class1[0]["class_name"];
            let class_name = class_name1 + "-" + sec_name.toUpperCase();

            stud_object = {
              student_id: stud["id"],
              student_name: stud["studentName"],
              father_name: stud["fatherName"],
              school_id,
              session_id,
              test_id: "",
              subject_head_id: "",
              classsection_id: "",
              marks: 0,
              subject_id: "",
              student_marks: 0,
              viva: 0,
              student_viva: 0,
              practical: 0,
              student_practical: 0,
              student_marks_percent: 0,
              exam_date: "",
            };
            return stud_object;
          }),
        );

        return res.json({
          success: true,
          message: "get student class ",
          students_data,
        });
      }

      return res.json({
        success: false,
        message: " students are not added. Kindly update.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.class_attendance_list = async (req, res) => {
  try {
    console.log(req.params);
    const { session_id, school_id, date } = req.params;
    if (!school_id) {
      return res.json({ success: false, message: "school id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session id is required" });
    }

    if (!date) {
      return res.json({ success: false, message: "date is required" });
    }

    let students_attendace = await getAll("student_attendance", "*", {
      school_id,
      session_id,

      attendance_date: date,
      delete_status: "show",
    });

    const uniqueClassIds = [
      ...new Set(students_attendace.map((item) => item.class_id)),
    ];

    if (uniqueClassIds.length > 0) {
      let data_section = [];

      await Promise.all(
        uniqueClassIds.map(async (class_sec_id) => {
          let id = class_sec_id;

          const class_sec = await getAll("class_section", "*", {
            id,
            delete_status: "show",
          });

          if (!class_sec.length) return;

          let sec_name = class_sec[0]?.section || "";

          id = class_sec[0]?.class_id;

          const class1 = await getAll("class", "*", {
            id,
            delete_status: "show",
          });

          if (!class1.length) return;

          let class_name = class1[0]?.class_name || "";

          let classsection = `${class_name}-${sec_name.toUpperCase()}`;

          data_section.push({
            class_id: class_sec_id,
            section: classsection,
          });
        }),
      );
      return res.json({
        success: true,
        message: "get class_section",
        raw: data_section,
      });
    } else {
      return res.json({ success: false, message: "not get class_section" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

const formatDate = (date) => {

  if (typeof date === "string") return date.split("T")[0];
  return new Date(date).toLocaleDateString("en-CA");
};

exports.student_attendance = async (req, res) => {
  try {
    const { session_id, school_id, class_id, date, attendance_type } =
      req.params;

    const formatDate = (date) => {
      return new Date(date).toISOString().split("T")[0];
    };

    const date_come = formatDate(date);
    const today_date = formatDate(new Date());

    if (date_come > today_date) {
      return res.json({
        success: false,
        message: "students not show next date",
      });
    }

    let students;
    if (class_id != "") {
      let registerClass = class_id;
      students = await getAll("students", "*", {
        school_id,
        session_id,
        registerClass,
        delete_status: "show",
      });
    } else {
      students = await getAll("students", "*", {
        school_id,
        session_id,
        delete_status: "show",
      });
    }
    let students_attendace;
    if (attendance_type.toLowerCase() === "all") {
      students_attendace = await getAll("student_attendance", "*", {
        school_id,
        session_id,
        class_id,
        attendance_date: formatDate(date),
        delete_status: "show",
      });
    } else {
      students_attendace = await getAll("student_attendance", "*", {
        school_id,
        session_id,
        class_id,
        attendance_date: formatDate(date),
        delete_status: "show",
      });

      if (students_attendace.length == 0) {
        return res.json({
          success: false,
          message: "No student records found for this class. ",
        });
      }

      let in_status = 0;
      if (attendance_type.toLowerCase() === "present") {
        in_status = 1;
      }
      students_attendace = await getAll("student_attendance", "*", {
        school_id,
        session_id,
        class_id,
        attendance_date: formatDate(date),
        in_status,
        delete_status: "show",
      });

      if (!in_status && students_attendace.length == 0) {
        let students_attendace1 = await getAll("student_attendance", "*", {
          school_id,
          session_id,
          class_id,
          attendance_date: formatDate(date),
          in_status: 0,
          delete_status: "show",
        });

        if (students_attendace1 == 0) {
          return res.json({
            success: false,
            message: "Good news! Students are present in school today ",
          });
        }
      }
    }
    let students_data = await Promise.all(
      students.map(async (stud) => {
        const attendance = students_attendace.find(
          (a) => Number(a.student_id) === Number(stud.id),
        );

        let full_class_name = "N/A";
        try {
          // 1. Get Section info (registerClass column se)
          const class_sec = await getAll("class_section", "*", {
            id: stud.registerClass,
          });
          if (class_sec && class_sec.length > 0) {
            const sec_name = class_sec[0].section;

            // 2. Get Class name using class_id from section
            const class_info = await getAll("class", "*", {
              id: class_sec[0].class_id,
            });
            if (class_info && class_info.length > 0) {
              full_class_name = `${class_info[0].class_name} - ${sec_name.toUpperCase()}`;
            }
          }
        } catch (e) {
          console.log(
            "Error fetching class name for student:",
            stud.id,
            e.message,
          );
        }

        return {
          school_id,
          session_id,
          student_id: stud.id,
          student_name: stud.studentName,
          father_name: stud.fatherName,
          class_id,
          class_name: full_class_name,
          attendance_status: attendance ? attendance.attendance_status : "Absent", // ✅ Default to Absent if not found
          in_status: attendance ? attendance.in_status : 0,
          out_status: attendance ? attendance.out_status : 0,
          in_time: attendance ? attendance.in_time : "00:00",
          out_time: attendance ? attendance.out_time : "00:00",
          attendance_date: attendance
            ? attendance.attendance_date || date
            : date,
          sms_status: attendance ? attendance.sms_status : "",
        };
      }),
    );

    // ✅ FIX: Filter the final list based on attendance_type
    if (attendance_type.toLowerCase() !== "all") {
      students_data = students_data.filter(
        (s) =>
          s.attendance_status.toLowerCase() === attendance_type.toLowerCase(),
      );
    }

    return res.json({
      success: true,
      message: "Attendance data fetched",
      count: students_data.length,
      students_data,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};

exports.add_student_attendance = async (req, res) => {
  try {
    const {
      session_id,
      school_id,
      class_id,
      attendance_date,
      attendance_details,
      class_name,
    } = req.body;

    const formattedDate = formatDate(attendance_date);

    if (!school_id || !class_id || !session_id || !attendance_date) {
      return res.json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!Array.isArray(attendance_details) || attendance_details.length === 0) {
      return res.json({
        success: false,
        message: "Attendance details required",
      });
    }

    const now = new Date();
    const timeNow = now.toTimeString().slice(0, 5);

    // 🔥 IMPORTANT: sequential loop (NO Promise.all)
    for (const attendance_detail of attendance_details) {
      const student_id = attendance_detail.student_id;

      const data_st = await getAll("student_attendance", "*", {
        school_id,
        session_id,
        attendance_date: formattedDate,
        class_id,
        student_id,
        delete_status: "show",
      });

      const old = data_st[0] || {};

      let in_time = "00:00";
      if (Number(attendance_detail.in_status) === 1) {
        in_time =
          old.in_time && old.in_time !== "00:00" && old.in_time !== "00:00:00"
            ? old.in_time
            : timeNow;
      }

      let out_time = "00:00";
      if (
        Number(attendance_detail.in_status) === 1 &&
        Number(attendance_detail.out_status) === 1
      ) {
        out_time =
          old.out_status === 1 && old.out_time && old.out_time !== "00:00"
            ? old.out_time
            : timeNow;
      } else if (
        Number(attendance_detail.in_status) === 1 &&
        old.out_time &&
        old.out_time !== "00:00"
      ) {
        out_time = old.out_time;
      }

      // 🔵 IN LOGIC
      if (Number(attendance_detail.in_status) === 1) {
        if (
          !old.in_time ||
          old.in_time === "00:00" ||
          old.in_time === "00:00:00"
        ) {
          in_time = timeNow;
        }
      }

      const data = {
        school_id,
        session_id,
        student_id,
        student_name: attendance_detail.student_name || "",
        father_name: attendance_detail.father_name || "",
        class_id,
        class_name,
        attendance_status:
          Number(attendance_detail.in_status) === 1 ? "Present" : "Absent",
        in_status: Number(attendance_detail.in_status),
        out_status: Number(attendance_detail.out_status),
        in_time,
        out_time,
        attendance_date: formattedDate,
        sms_status: attendance_detail.sms_status || "",
      };

      // ✅ INSERT / UPDATE
      if (data_st.length === 0) {
        await create("student_attendance", data);
      } else {
        // await update("student_attendance", data, { id: data_st[0].id });
        await update("student_attendance", data, data_st[0].id);
      }

      // 🔔 NOTIFICATION
      try {
        const currentStatus =
          Number(attendance_detail.in_status) === 1 ? "Present" : "Absent";

        await sendAttendanceNotification(
          student_id,
          formattedDate,
          currentStatus,
        );
      } catch (e) {
        console.log("Notification error:", e.message);
      }
    }

    // ✅ FINAL RESPONSE FIX
    return res.json({
      success: true,
      message: "Attendance saved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Server error",
    });
  }
};

exports.student_attendance_report = async (req, res) => {
  try {
    const { school_id, session_id, student_id } = req.params;

    // Fetch student info first to get student_ids, name, and class
    const studentRows = await getAll("students", "*", { id: student_id, school_id });
    if (studentRows.length === 0) {
      return res.json({ success: false, message: "Student not found" });
    }
    const student = studentRows[0];

    // Get class name (using the same logic as students API for consistency)
    let className = "-";
    if (student.registerClass) {
      // First try to find in class_section to get section name too
      let classSec = await getAll("class_section", "*", { school_id, id: student.registerClass });
      if (classSec.length === 0) {
        // Fallback to class_id
        classSec = await getAll("class_section", "*", { school_id, class_id: student.registerClass });
      }

      if (classSec.length > 0) {
        const section = classSec[0].section || "";
        const classMaster = await getAll("class", "*", { school_id, id: classSec[0].class_id });
        if (classMaster.length > 0) {
          className = classMaster[0].class_name + (section ? " " + section : "");
        }
      } else {
        // Direct fallback to class table
        const classData = await getAll("class", "*", { school_id, id: student.registerClass });
        if (classData.length > 0) {
          className = classData[0].class_name;
        }
      }
    }

    let attendances = await getAll("student_attendance", "*", { school_id, session_id, student_id });

    // Enrich attendance data with student info
    if (attendances && attendances.length > 0) {
      attendances = attendances.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));

      attendances = attendances.map(att => ({
        ...att,
        student_ids: student.student_ids, // Admission Number
        studentName: student.studentName || student.student_name,
        class_name: className,
        father_name: student.fatherName || student.father_name
      }));
    } else {
      attendances = [];
    }

    return res.json({ success: true, data: attendances });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.student_fee_report = async (req, res) => {
  try {
    const { school_id, session_id, student_id } = req.params;

    if (!school_id || !session_id || !student_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    const rows = await getAll("students", "*", { id: student_id });
    const student = rows[0];
    if (!student) return res.json({ success: false, message: "Student not found" });

    // Fetch class and session names
    const classData = await getAll("class", "*", { id: student.registerClass });
    const sessionData = await getAll("school_session", "*", { id: student.session_id });
    student.class_name = classData[0]?.class_name || "-";
    student.session_name = sessionData[0]?.session_name || "-";

    const allotments = await getAll("student_fee_allot", "*", {
      school_id, session_id, student_id, delete_status: "show"
    });

    const payments = await getAll("students_submit_fee", "*", {
      school_id, session_id, student_id, delete_status: "show"
    });

    const heads = await getAll("feehead", "*", { school_id, delete_status: "show" });

    let totalAllot = 0;
    allotments.forEach(a => totalAllot += parseFloat(a.amount || 0));

    let totalPaid = 0;
    if (payments && payments.length > 0) {
      console.log("SAMPLE PAYMENT KEYS:", Object.keys(payments[0]));
      totalPaid = payments.reduce((sum, p) => {
        const val = parseFloat(p.fee_pay || p.amount || 0);
        return sum + val;
      }, 0);
    }
    console.log("FINAL TOTAL PAID CALCULATED:", totalPaid);

    // Group payments by fee head
    const paidByHead = {};
    payments.forEach(p => {
      const hId = p.feehead_id || p.fee_head_id;
      paidByHead[hId] = (paidByHead[hId] || 0) + parseFloat(p.fee_pay || 0);
    });

    console.log("ALLOTMENTS FROM DB:", allotments);
    if (allotments && allotments.length > 0) {
      console.log("SAMPLE ALLOTMENT KEYS:", Object.keys(allotments[0]));
    }

    const breakdown = (allotments || []).map(a => {
      const hId = a.feehead_id || a.fee_head_id;
      const paid = paidByHead[hId] || 0;
      const allotted = parseFloat(a.amount || 0);
      const head = heads.find(h => String(h.id) === String(hId));
      return {
        headId: hId,
        headName: head ? (head.feehead || head.fee_head_name) : `Head ${hId}`,
        allotted,
        paid,
        balance: allotted - paid
      };
    });
    console.log("FINAL STUDENT DATA:", student);
    console.log("GENERATED BREAKDOWN:", breakdown);

    res.json({
      success: true,
      data: {
        student,
        totalAllot,
        totalPaid,
        balance: totalAllot - totalPaid,
        allotments,
        payments,
        heads,
        breakdown
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

exports.student_class_test_report = async (req, res) => {
  try {
    const { school_id, session_id, student_id } = req.params;

    if (!school_id || !session_id || !student_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    const sql = `
      SELECT 
        sct.*,
        ct.test_name,
        ct.test_date,
        sub.subject_name,
        st.student_ids,
        st.studentName,
        c.class_name
      FROM student_class_test sct
      JOIN class_test ct ON sct.test_id = ct.id
      JOIN subject sub ON sct.subject_id = sub.id
      JOIN students st ON sct.student_id = st.id
      LEFT JOIN class c ON st.registerClass = c.id
      WHERE sct.student_id = ? 
        AND sct.school_id = ? 
        AND sct.session_id = ? 
        AND sct.delete_status = 'show'
      ORDER BY ct.test_date DESC, sct.id DESC
    `;

    const results = await db.runCustomQuery(sql, [student_id, school_id, session_id]);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

exports.student_main_exam_report = async (req, res) => {
  try {
    const { school_id, session_id, student_id } = req.params;

    if (!school_id || !session_id || !student_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    const query = `
      SELECT 
        sme.*, 
        me.exam_name, 
        me.exam_date,
        sub.subject_name,
        st.student_ids,
        st.studentName,
        c.class_name
      FROM student_main_exam sme
      LEFT JOIN main_exam me ON sme.test_id = me.id
      LEFT JOIN subject sub ON sme.subject_id = sub.id
      JOIN students st ON sme.student_id = st.id
      LEFT JOIN class c ON st.registerClass = c.id
      WHERE sme.school_id = ? 
        AND sme.session_id = ? 
        AND sme.student_id = ? 
        AND sme.delete_status = 'show'
      ORDER BY me.exam_date DESC
    `;

    const results = await db.runCustomQuery(query, [school_id, session_id, student_id]);

    return res.json({
      success: true,
      message: "Student main exam report fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error in student_main_exam_report:", error);
    return res.json({ success: false, message: error.message });
  }
};

exports.student_dashboard_summary = async (req, res) => {
  try {
    const { school_id, session_id, student_id } = req.params;

    if (!school_id || !session_id || !student_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    // 1. Student Profile & Class Name
    const studentRows = await getAll("students", "*", { id: student_id, school_id });
    if (studentRows.length === 0) {
      return res.json({ success: false, message: "Student not found" });
    }
    const student = studentRows[0];

    let className = "-";
    if (student.registerClass) {
      let classSec = await getAll("class_section", "*", { school_id, id: student.registerClass });
      if (classSec.length === 0) {
        classSec = await getAll("class_section", "*", { school_id, class_id: student.registerClass });
      }

      if (classSec.length > 0) {
        const section = classSec[0].section || "";
        const classMaster = await getAll("class", "*", { school_id, id: classSec[0].class_id });
        if (classMaster.length > 0) {
          className = classMaster[0].class_name + (section ? " " + section : "");
        }
      } else {
        const classData = await getAll("class", "*", { school_id, id: student.registerClass });
        if (classData.length > 0) {
          className = classData[0].class_name;
        }
      }
    }

    // 2. Attendance Summary
    const attendances = await getAll("student_attendance", "*", { school_id, session_id, student_id });
    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.attendance_status === "Present").length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // 3. Fee Summary
    const allotments = await getAll("student_fee_allot", "*", { school_id, session_id, student_id, delete_status: "show" });
    const payments = await getAll("students_submit_fee", "*", { school_id, session_id, student_id, delete_status: "show" });

    let totalAllotted = 0;
    allotments.forEach(a => totalAllotted += parseFloat(a.amount || 0));

    let totalPaid = 0;
    payments.forEach(p => totalPaid += parseFloat(p.fee_pay || p.amount || 0));

    // 4. Notifications (Latest 3)
    const notificationSql = `
      SELECT n.* FROM notification n
      WHERE n.school_id = ? AND n.session_id = ? 
      AND (n.Send_to = 'All' OR (n.Send_to = 'Student' AND n.class_id = ?) OR (n.Send_to = 'Single' AND n.student_id = ?))
      AND n.delete_status = 'show'
      ORDER BY n.id DESC LIMIT 3
    `;
    const recentNotifications = await runCustomQuery(notificationSql, [school_id, session_id, student.registerClass, student_id]);

    // 5. Tests Summary
    const tests = await getAll("student_class_test", "*", { school_id, session_id, student_id, delete_status: "show" });

    res.json({
      success: true,
      data: {
        profile: {
          ...student,
          class_name: className
        },
        stats: {
          attendance: {
            percentage: attendancePercentage,
            total: totalDays,
            present: presentDays
          },
          fees: {
            total: totalAllotted,
            paid: totalPaid,
            balance: totalAllotted - totalPaid
          },
          tests: {
            total: tests.length
          },
          notifications: recentNotifications
        }
      }
    });

  } catch (error) {
    console.error("Summary API Error:", error);
    res.json({ success: false, message: error.message });
  }
};

exports.class_test_section_report = async (req, res) => {
  try {
    const { school_id, session_id, class_id } = req.params;
    const { from_date, to_date } = req.query;

    if (!school_id || !session_id || !class_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    // 1. Get all students of this class section
    const students = await getAll("students", "*", {
      school_id,
      session_id,
      registerClass: class_id,
      delete_status: "show"
    });

    if (students.length === 0) {
      return res.json({ success: true, students: [], subjects: [], classTests: [], marksData: [] });
    }

    // 2. Get active subjects
    let subjectsSql = `
      SELECT id, subject_name 
      FROM subject 
      WHERE school_id = ? 
        AND status = 'Active' 
        AND delete_status = 'show'
      ORDER BY display_order ASC, subject_name ASC
    `;
    const subjects = await runCustomQuery(subjectsSql, [school_id]);

    // 3. Get active class tests filtered by date
    let testsSql = `
      SELECT id, test_name, test_date 
      FROM class_test 
      WHERE school_id = ? 
        AND status = 'Active' 
        AND delete_status = 'show'
    `;
    const testsParams = [school_id];
    
    if (from_date) {
      testsSql += ` AND test_date >= ?`;
      testsParams.push(from_date);
    }
    if (to_date) {
      testsSql += ` AND test_date <= ?`;
      testsParams.push(to_date);
    }
    testsSql += ` ORDER BY display_order ASC, test_date ASC`;
    const classTests = await runCustomQuery(testsSql, testsParams);

    // 4. Get student marks data
    let marksSql = `
      SELECT 
        student_id,
        test_id,
        subject_id,
        marks AS max_marks,
        student_marks
      FROM student_class_test
      WHERE school_id = ? 
        AND classsection_id = ?
        AND delete_status = 'show'
    `;
    const marksData = await runCustomQuery(marksSql, [school_id, class_id]);

    return res.json({
      success: true,
      students: students.map(s => ({
        id: s.id,
        studentName: s.studentName,
        fatherName: s.fatherName,
        student_ids: s.student_ids,
        stu_prefix: s.stu_prefix
      })),
      subjects: subjects,
      classTests: classTests.map(t => ({
        id: t.id,
        test_name: t.test_name,
        test_date: t.test_date
      })),
      marksData: marksData
    });
  } catch (error) {
    console.error("class_test_section_report Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

exports.main_exam_section_report = async (req, res) => {
  try {
    const { school_id, session_id, class_id, exam_id } = req.params;

    if (!school_id || !session_id || !class_id || !exam_id) {
      return res.json({ success: false, message: "Missing required parameters" });
    }

    // 1. Get all students of this class section
    const students = await getAll("students", "*", {
      school_id,
      session_id,
      registerClass: class_id,
      delete_status: "show"
    });

    if (students.length === 0) {
      return res.json({ success: true, students: [], subjects: [], marksData: [] });
    }

    // 2. Get active subjects
    let subjectsSql = `
      SELECT id, subject_name 
      FROM subject 
      WHERE school_id = ? 
        AND status = 'Active' 
        AND delete_status = 'show'
      ORDER BY display_order ASC, subject_name ASC
    `;
    const subjects = await runCustomQuery(subjectsSql, [school_id]);

    // 3. Get student marks data
    let marksSql = `
      SELECT 
        student_id,
        subject_id,
        marks AS max_written,
        viva AS max_viva,
        practical AS max_practical,
        student_marks AS written_marks,
        student_viva AS viva_marks,
        student_practical AS practical_marks
      FROM student_main_exam
      WHERE school_id = ? 
        AND session_id = ?
        AND classsection_id = ?
        AND test_id = ?
        AND delete_status = 'show'
    `;
    const marksData = await runCustomQuery(marksSql, [school_id, session_id, class_id, exam_id]);

    return res.json({
      success: true,
      students: students.map(s => ({
        id: s.id,
        studentName: s.studentName,
        fatherName: s.fatherName,
        student_ids: s.student_ids,
        stu_prefix: s.stu_prefix
      })),
      subjects: subjects,
      marksData: marksData
    });
  } catch (error) {
    console.error("main_exam_section_report Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

exports.promote_students = async (req, res) => {
  try {
    const { school_id, current_session_id, target_session_id, target_class_id, student_ids } = req.body;

    if (!school_id || !current_session_id || !target_session_id || !target_class_id || !student_ids || !Array.isArray(student_ids)) {
      return res.json({
        success: false,
        message: "Missing required fields or student_ids is not an array ❌",
      });
    }

    let promotedCount = 0;
    let errors = [];

    for (let currentStudentId of student_ids) {
      try {
        // 1. Fetch student details from current record
        const studentRows = await getAll("students", "*", { id: currentStudentId, school_id, session_id: current_session_id });
        if (studentRows.length === 0) {
          errors.push(`Student ID ${currentStudentId} not found in current session`);
          continue;
        }

        const student = studentRows[0];

        // 2. Check if student already has a record in target session
        const existingRows = await getAll("students", "id", {
          student_ids: student.student_ids,
          session_id: target_session_id,
          school_id,
          delete_status: "show"
        });

        if (existingRows.length > 0) {
          // If already exists, update their class section and status
          const targetId = existingRows[0].id;
          await update("students", {
            registerClass: target_class_id,
            status: "active"
          }, targetId);
          promotedCount++;
        } else {
          // If doesn't exist, create a new record for the new session
          const newStudentData = {
            ...student,
            session_id: target_session_id,
            registerClass: target_class_id,
            status: "active"
          };
          
          // delete system/auto columns
          delete newStudentData.id;
          delete newStudentData.createdAt;
          delete newStudentData.updatedAt;

          await create("students", newStudentData);
          promotedCount++;
        }
      } catch (err) {
        errors.push(`Error promoting student ID ${currentStudentId}: ${err.message}`);
      }
    }

    return res.json({
      success: true,
      message: `Promotion completed successfully ✅`,
      promoted: promotedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("promote_students Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

exports.previous_due_fees = async (req, res) => {
  try {
    const { school_id, current_session_id } = req.params;

    if (!school_id || !current_session_id) {
      return res.json({
        success: false,
        message: "school_id and current_session_id are required",
      });
    }

    const sql = `
      SELECT 
        s.id as student_id,
        s.studentName,
        s.fatherName,
        s.primaryNo,
        s.registerNo,
        s.student_ids,
        s.stu_prefix,
        s.registerClass,
        CONCAT(c.class_name, ' - ', UPPER(cs.section)) as class,
        s.session_id,
        sess.session_name,
        COALESCE(allot.total_allot, class_fee.total_class_fee, 0) as Allot,
        COALESCE(submit.total_paid, 0) as Paid,
        COALESCE(submit.total_rebate, 0) as Rebate,
        (COALESCE(allot.total_allot, class_fee.total_class_fee, 0) - COALESCE(submit.total_paid, 0) - COALESCE(submit.total_rebate, 0)) as Balance
      FROM students s
      JOIN school_session sess ON s.session_id = sess.id
      LEFT JOIN class_section cs ON s.registerClass = cs.id
      LEFT JOIN class c ON cs.class_id = c.id
      LEFT JOIN (
        SELECT student_id, session_id, SUM(amount) as total_allot
        FROM student_fee_allot
        WHERE delete_status = 'show'
        GROUP BY student_id, session_id
      ) allot ON s.id = allot.student_id AND s.session_id = allot.session_id
      LEFT JOIN (
        SELECT class_id, session_id, SUM(amount) as total_class_fee
        FROM classfee
        WHERE delete_status = 'show'
        GROUP BY class_id, session_id
      ) class_fee ON cs.class_id = class_fee.class_id AND s.session_id = class_fee.session_id
      LEFT JOIN (
        SELECT student_id, session_id, SUM(fee_pay) as total_paid, SUM(fee_discount) as total_rebate
        FROM students_submit_fee
        WHERE delete_status = 'show'
        GROUP BY student_id, session_id
      ) submit ON s.id = submit.student_id AND s.session_id = submit.session_id
      WHERE s.school_id = ? 
        AND s.session_id != (
          SELECT id FROM school_session 
          WHERE school_id = ? AND delete_status = 'show' 
          ORDER BY display_order DESC LIMIT 1
        )
        AND s.delete_status = 'show'
        AND (COALESCE(allot.total_allot, class_fee.total_class_fee, 0) - COALESCE(submit.total_paid, 0) - COALESCE(submit.total_rebate, 0)) > 0
      ORDER BY sess.display_order ASC, c.class_name ASC, s.studentName ASC
    `;

    const rows = await runCustomQuery(sql, [school_id, school_id]);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("previous_due_fees Error:", error);
    return res.json({ success: false, message: error.message });
  }
};



