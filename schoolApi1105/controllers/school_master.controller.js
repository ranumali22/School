const { create, getAll, update, runCustomQuery, deleteData } = require("../model/school_account");
const { sendPushNotification } = require("../utils/fcm");
//const admin = require("../config/firebaseAdmin");
const admin = require("firebase-admin");

const formatDateForResponse = (date) => {
  if (!date || date === "0000-00-00") return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
//session
exports.session = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = await getAll("school_session", "*", { school_id: id });

    let row =
      rows.length > 0 &&
      rows.map((data) => {
        let start_date = new Date(data["start_date"]).toLocaleDateString(
          "en-GB",
        );
        let end_date = new Date(data["end_date"]).toLocaleDateString("en-GB");

        return {
          id: data["id"],
          session_name: data["session_name"],
          display_order: data["display_order"],
          delete_status: data["delete_status"],
          session_status: data["session_status"],
          school_id: data["school_id"],
          start_date: start_date,
          end_date: end_date,
        };
      });

    if (row.length > 0) {
      return res.json({ success: true, message: "school_session data ", row: row });
    }
    return res.json({ success: false, message: "school_session not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete_session = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("school_session", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "School session has been updated successfully",
      });
    }
    return res.json({
      success: false,
      message:
        "School session not found or could not be updated. Please try again.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_session = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("school_session", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "School session has been updated successfully",
      });
    }

    return res.json({
      success: false,
      message:
        "School session not found or could not be updated. Please try again.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function isOverlapping(s1, e1, s2, e2) {
  const start1 = new Date(s1);
  const end1 = new Date(e1);
  const start2 = new Date(s2);
  const end2 = new Date(e2);

  return !(end1 < start2 || start1 > end2);
}

exports.add_session = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const {
        session_name,
        start_date,
        end_date,
        display_order,
        session_status,
        school_id,
      } = req.body;

      if (!session_name) {
        return res
          .status(400)
          .json({ success: false, message: "session_name is required" });
      }
      if (!start_date) {
        return res
          .status(400)
          .json({ success: false, message: "start_date is required" });
      }
      if (!end_date) {
        return res
          .status(400)
          .json({ success: false, message: "end_date is required" });
      }
      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }
      if (!session_status) {
        return res
          .status(400)
          .json({ success: false, message: "session_status is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      let school_session = await getAll(
        "school_session",
        "*",
        { school_id: school_id, session_name: session_name },
        "1",
      );
      if (school_session.length > 0) {
        res.json({
          success: false,
          message: "School session already exists. No changes made.",
        });
      } else {
        let school_session = await getAll(
          "school_session",
          "*",
          { school_id: school_id },
          "1",
        );
        const isExist = school_session.some((data) =>
          isOverlapping(start_date, end_date, data.start_date, data.end_date),
        );

        if (isExist) {
          return res.json({
            success: false,
            message: "School session already exists!!!.",
          });
        }

        try {
          const result = await create("school_session", req.body);

          if (!result || result.affectedRows === 0) {
            throw new Error("Insert failed");
          }

          await update(
            "school_account",
            { session_create_status: "yes" },
            school_id,
          );

          res.json({ success: true, message: "Created ✅" });
        } catch (err) {
          res.json({ success: false, message: err.message });
        }

        res.json({
          success: false,
          message:
            "School session operation failed. Please contact support if the issue persists. ",
        });
      }
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.status_session = async (req, res) => {
  try {
    const id = req.params.id;
    const { session_status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!session_status) {
      return res.json({
        success: false,
        message: "session_status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(session_status)) {
      return res.json({
        success: false,
        message: "Invalid session_status value",
      });
    }

    // ✅ Update
    const result = await update("school_session", { session_status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Session status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Session not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//class
exports.class = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    // Fetch directly from class table (Master List)
    let classes = await getAll("class", "*", {
      school_id: id,
    });

    if (classes && classes.length > 0) {
      return res.json({
        success: true,
        message: "class data fetched successfully",
        row: classes,
      });
    }

    return res.json({ success: false, message: "No classes found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete_class = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("class", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "class not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_class = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("class", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "class not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_class = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const { class_name, display_order, status, school_id } = req.body;

      if (!class_name) {
        return res
          .status(400)
          .json({ success: false, message: "class_name is required" });
      }
      if (!status) {
        return res
          .status(400)
          .json({ success: false, message: "status is required" });
      }
      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      let school_class = await getAll(
        "class",
        "*",
        { school_id: school_id, class_name: class_name },
        "1",
      );
      if (school_class.length > 0) {
        res.json({ success: false, message: "class_name is already exits" });
      } else {
        if (create("class", req.body)) {
          res.json({ success: true, message: "class successfully" });
        }
        res.json({ success: false, message: "class not done " });
      }
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.status_class = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update status
    const result = await update("class", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Class  status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Class not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.class_detail = async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Step 1: class_detail
    let classDetails = await getAll("class_detail", "*", {
      school_id: id,
    });

    if (classDetails.length === 0) {
      return res.json({
        success: false,
        message: "class_detail not found",
      });
    }

    // ✅ Step 2: class_section
    let classSections = await getAll("class_section", "*", {
      school_id: id,
    });

    // ✅ Step 3: class master (jaha class_name hai)
    let classes = await getAll("class", "*", {
      school_id: id,
    });

    // ✅ Step 4: employee
    let employees = await getAll("employee", "*", {
      school_id: id,
    });

    // ✅ Step 5: combine data (manual JOIN)
    let finalData = classDetails.map((cd) => {
      // class_section find
      let sectionData = classSections.find(
        (cs) => cs.id == cd.class_id
      );

      // class find
      let classData = classes.find(
        (c) => c.id == sectionData?.class_id
      );

      // teacher find
      let teacher = employees.find(
        (e) => e.id == cd.teacher_id
      );

      return {
        ...cd,
        section: sectionData?.section || null,
        class_name: classData?.class_name || null,
        teacher_name: teacher ? teacher.employeeFullName : null,

        // 🔥 final output (frontend ready)
        full_class_name: `${classData?.class_name || "Class"} - ${sectionData?.section || ""}`,
      };
    });

    return res.json({
      success: true,
      message: "class_detail get",
      row: finalData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_class_detail = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("class_detail", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class_detail updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "class_detail not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_class_detail = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("class_detail", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class_detail updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "class_detail not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.add_class_detail = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({
        success: false,
        message: "Invalid request method: " + req.method,
      });
    }

    let data = req.body;

    // ✅ EMPTY CHECK
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data is empty!",
      });
    }

    // ✅ DESTRUCTURE (IMPORTANT: teacher_id use karo)
    const {
      class_id,
      room_number,
      teacher_name, // frontend se aa raha hai (id actually)
      display_order,
      status,
      school_id,
    } = data;

    // ✅ VALIDATIONS
    if (!class_id) {
      return res.status(400).json({
        success: false,
        message: "class_id is required",
      });
    }

    if (!room_number) {
      return res.status(400).json({
        success: false,
        message: "room_number is required",
      });
    }

    if (!teacher_name) {
      return res.status(400).json({
        success: false,
        message: "teacher is required",
      });
    }

    if (!display_order) {
      return res.status(400).json({
        success: false,
        message: "display_order is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: "school_id is required",
      });
    }

    // ✅ DUPLICATE CHECK
    let exist = await getAll(
      "class_detail",
      "*",
      {
        school_id: school_id,
        class_id: class_id,
        room_number: room_number,
      },
      "1",
    );

    if (exist && exist.length > 0) {
      return res.json({
        success: false,
        message: "class_detail already exists",
      });
    }

    // ✅ IMPORTANT FIX (teacher_name → teacher_id)
    data = {
      ...data,
      teacher_id: teacher_name, // 🔥 mapping
    };

    delete data.teacher_name; // optional clean

    // ✅ INSERT (await must)
    const result = create("class_detail", data);

    if (result) {
      return res.json({
        success: true,
        message: "class_detail successfully added",
      });
    }

    return res.json({
      success: false,
      message: "class_detail not added",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_class_detail = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update
    const result = await update("class_detail", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Class Detail  status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Class Detail not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.class_section = async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ step 1: get class_section
    let sections = await getAll("class_section", "*", {
      school_id: id,
    });

    if (sections.length === 0) {
      return res.json({
        success: false,
        message: "class_section not done",
      });
    }

    // ✅ step 2: get classes
    let classes = await getAll("class", "*", {
      school_id: id,
    });

    // ✅ step 3: map class_name
    let finalData = sections.map((sec) => {
      let classData = classes.find((c) => c.id == sec.class_id);

      return {
        ...sec,
        class_name: classData ? classData.class_name : null,
      };
    });

    return res.json({
      success: true,
      message: "class_section get",
      row: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_class_section = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("class_section", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class_section updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "class_section not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_class_section = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("class_section", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class_section updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "class_section not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_class_section = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const { class_id, section, display_order, status, school_id } = req.body;

      if (!class_id) {
        return res
          .status(400)
          .json({ success: false, message: "class_id is required" });
      }
      if (!status) {
        return res
          .status(400)
          .json({ success: false, message: "status is required" });
      }
      if (!section) {
        return res
          .status(400)
          .json({ success: false, message: "section is required" });
      }

      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      let school_session = await getAll(
        "class_section",
        "*",
        { school_id: school_id, class_id: class_id, section: section },
        "1",
      );

      if (school_session > 0) {
        res.json({ success: false, message: "class_detail is already exits" });
      } else {
        if (create("class_section", req.body)) {
          res.json({ success: true, message: "class_section successfully" });
        }
        res.json({ success: false, message: "class_section not done " });
      }
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.status_class_section = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update status
    const result = await update("class_section", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Class Section status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Class Section not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//subject
exports.subject = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = await getAll("subject", "*", { school_id: id });
    if (rows.length > 0) {
      return res.json({ success: true, message: "subject get ", row: rows });
    }
    return res.json({ success: false, message: "subject not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete_subject = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("subject", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "subject updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "subject not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_subject = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { subject_name, school_id } = data;

    if (!subject_name || !school_id) {
      return res.status(400).json({
        success: false,
        message: "subject_name and school_id are required",
      });
    }

    // ✅ Check duplicate (exclude current ID)
    let existingSubject = await getAll(
      "subject",
      "*",
      {
        school_id: school_id,
        subject_name: subject_name,
      },
      "1"
    );

    if (
      existingSubject &&
      existingSubject.length > 0 &&
      existingSubject[0].id != id
    ) {
      return res.json({
        success: false,
        message: "Subject name already exists",
      });
    }

    // ✅ Update
    let result = await update("subject", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Subject updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Subject not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.add_subject = async (req, res) => {
  try {
    const {
      subject_name,
      subject_short_name,
      subject_code,
      display_order,
      status,
      school_id,
    } = req.body;

    // Validation
    if (!subject_code)
      return res.status(400).json({ success: false, message: "subject_code is required" });

    if (!subject_name)
      return res.status(400).json({ success: false, message: "subject_name is required" });

    if (!status)
      return res.status(400).json({ success: false, message: "status is required" });

    if (!subject_short_name)
      return res.status(400).json({ success: false, message: "subject_short_name is required" });

    if (!display_order)
      return res.status(400).json({ success: false, message: "display_order is required" });

    if (!school_id)
      return res.status(400).json({ success: false, message: "school_id is required" });

    // ✅ Duplicate check (ONLY subject_name + school_id)
    let existingSubject = await getAll(
      "subject",
      "*",
      {
        school_id: school_id,
        subject_name: subject_name,
      },
      "1"
    );

    if (existingSubject && existingSubject.length > 0) {
      return res.json({
        success: false,
        message: "Subject name already exists",
      });
    }

    // Insert
    let result = await create("subject", req.body);

    if (result) {
      return res.json({
        success: true,
        message: "Subject added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Subject not added",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_subject = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update
    const result = await update("subject", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Subject status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Subject not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//department
exports.department = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("department", "*", { school_id: id });

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        message: "Department fetched",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No department found",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_department = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("department", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "department updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "department not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_department = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { department_name, school_id } = data;

    if (!department_name || !school_id) {
      return res.json({
        success: false,
        message: "department_name and school_id are required",
      });
    }

    // ✅ Duplicate check (exclude current record)
    let existing = await getAll(
      "department",
      "*",
      { school_id, department_name },
      "1"
    );

    if (
      existing &&
      existing.length > 0 &&
      existing[0].id != id
    ) {
      return res.json({
        success: false,
        message: "Department already exists",
      });
    }

    // ✅ Update
    let result = await update("department", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Department updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Department not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_department = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({
        success: false,
        message: "Other request type: " + req.method,
      });
    }

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send("Data is empty!");
    }

    const { department_name, display_order, status, school_id } = data;

    if (!department_name) {
      return res.status(400).json({
        success: false,
        message: "department_name is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    if (!display_order) {
      return res.status(400).json({
        success: false,
        message: "display_order is required",
      });
    }

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: "school_id is required",
      });
    }

    // ✅ Duplicate check
    let existing = await getAll(
      "department",
      "*",
      { school_id, department_name },
      "1"
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        message: "Department already exists",
      });
    }

    // ✅ Insert
    const result = await create("department", data);

    if (result) {
      return res.json({
        success: true,
        message: "Department added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Department not added",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_department = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update
    const result = await update("department", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Department status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Department not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//gender
exports.add_gender = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const { gender, display_order, school_id } = req.body;

      if (!gender) {
        return res
          .status(400)
          .json({ success: false, message: "gender is required" });
      }

      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      let school_session = await getAll(
        "gender",
        "*",
        { school_id: school_id, gender: gender },
        "1",
      );
      if (school_session > 0) {
        res.json({ success: false, message: "gender is already exits" });
      } else {
        if (create("gender", req.body)) {
          res.json({ success: true, message: "gender successfully" });
        }
        res.json({ success: false, message: "gender not done " });
      }
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.gender = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = await getAll("gender", "*", { school_id: id });

    if (rows.length > 0) {
      res.json({ success: true, message: "gender get ", row: rows });
    }
    res.json({ success: false, message: "gender not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_gender = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("gender", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "gender updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "gender not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_gender = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("gender", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "gender  updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "gender  not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_gender = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    // ✅ Only allow valid values
    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update query
    let result = await update("gender", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Gender status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Gender not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//medium
exports.add_medium = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const { medium, display_order, school_id } = req.body;

      if (!medium) {
        return res
          .status(400)
          .json({ success: false, message: "medium is required" });
      }

      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      let school_session = await getAll(
        "medium",
        "*",
        { school_id: school_id, medium: medium },
        "1",
      );
      if (school_session && school_session.length > 0) {
        res.json({ success: false, message: "medium is already exits" });
      } else {
        if (create("medium", req.body)) {
          res.json({ success: true, message: "medium successfully" });
        }
        res.json({ success: false, message: "medium not done " });
      }
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.medium = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = await getAll("medium", "*", { school_id: id });

    if (rows.length > 0) {
      res.json({ success: true, message: "medium get ", row: rows });
    }
    res.json({ success: false, message: "medium not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_medium = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { medium, school_id } = data;

    if (!medium || !school_id) {
      return res.json({
        success: false,
        message: "medium and school_id are required",
      });
    }

    // ✅ Check duplicate (exclude current id)
    let existing = await getAll(
      "medium",
      "*",
      {
        school_id: school_id,
        medium: medium,
      },
      "1"
    );

    if (
      existing &&
      existing.length > 0 &&
      existing[0].id != id // 👈 important
    ) {
      return res.json({
        success: false,
        message: "Medium already exists",
      });
    }

    // ✅ Update
    let result = await update("medium", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Medium updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "medium not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_medium = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("medium", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "medium  updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "medium  not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_medium = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    // ✅ Allow only valid values
    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update
    let result = await update("medium", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Medium status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Medium not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//category
exports.add_category = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({
        success: false,
        message: "Other request type: " + req.method,
      });
    }

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send("Data is empty!");
    }

    const { category, display_order, school_id } = data;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "category is required",
      });
    }

    if (!display_order) {
      return res.status(400).json({
        success: false,
        message: "display_order is required",
      });
    }

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: "school_id is required",
      });
    }

    // ✅ Duplicate check
    let existing = await getAll(
      "category",
      "*",
      { school_id, category },
      "1"
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        message: "Category already exists",
      });
    }

    // ✅ Insert
    const result = await create("category", data);

    if (result) {
      return res.json({
        success: true,
        message: "Category added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Category not added",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.category = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("category", "*", { school_id: id });

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        message: "Category fetched",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No category found",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_category = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { category, school_id } = data;

    if (!category || !school_id) {
      return res.json({
        success: false,
        message: "category and school_id are required",
      });
    }

    // ✅ Duplicate check (exclude current id)
    let existing = await getAll(
      "category",
      "*",
      { school_id, category },
      "1"
    );

    if (
      existing &&
      existing.length > 0 &&
      existing[0].id != id
    ) {
      return res.json({
        success: false,
        message: "Category already exists",
      });
    }

    // ✅ Update
    let result = await update("category", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Category updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Category not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.delete_category = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("category", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "category  updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "category  not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_category = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    // ✅ Allow only valid values
    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update status
    let result = await update("category", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Category status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Category not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//religion
exports.add_religion = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({
        success: false,
        message: "Other request type: " + req.method,
      });
    }

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send("Data is empty!");
    }

    const { religion, display_order, school_id } = data;

    if (!religion) {
      return res.status(400).json({
        success: false,
        message: "religion is required",
      });
    }

    if (!display_order) {
      return res.status(400).json({
        success: false,
        message: "display_order is required",
      });
    }

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: "school_id is required",
      });
    }

    // ✅ Duplicate check
    let existing = await getAll(
      "religion",
      "*",
      { school_id, religion },
      "1"
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        message: "Religion already exists",
      });
    }

    // ✅ Insert
    const result = await create("religion", data);

    if (result) {
      return res.json({
        success: true,
        message: "Religion added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Religion not added",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.religion = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("religion", "*", { school_id: id });

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        message: "Religion fetched",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No religion found",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_religion = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { religion, school_id } = data;

    if (!religion || !school_id) {
      return res.json({
        success: false,
        message: "religion and school_id are required",
      });
    }

    // ✅ Duplicate check (exclude current id)
    let existing = await getAll(
      "religion",
      "*",
      { school_id, religion },
      "1"
    );

    if (
      existing &&
      existing.length > 0 &&
      existing[0].id != id
    ) {
      return res.json({
        success: false,
        message: "Religion already exists",
      });
    }

    // ✅ Update
    let result = await update("religion", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Religion updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Religion not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_religion = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("religion", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "religion  updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "religion not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_religion = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    // ✅ Only valid values allowed
    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update status
    let result = await update("religion", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Religion status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Religion not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//nationality
exports.add_nationality = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({
        success: false,
        message: "Other request type: " + req.method,
      });
    }

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send("Data is empty!");
    }

    const { nationality, display_order, school_id } = data;

    if (!nationality) {
      return res.status(400).json({
        success: false,
        message: "nationality is required",
      });
    }

    if (!display_order) {
      return res.status(400).json({
        success: false,
        message: "display_order is required",
      });
    }

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: "school_id is required",
      });
    }

    // ✅ Correct duplicate check
    let existing = await getAll(
      "nationality",
      "*",
      { school_id, nationality },
      "1"
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        message: "Nationality already exists",
      });
    }

    // ✅ Insert
    const result = await create("nationality", data);

    if (result) {
      return res.json({
        success: true,
        message: "Nationality added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Nationality not added",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.nationality = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("nationality", "*", { school_id: id });

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        message: "Nationality fetched",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No nationality found",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_nationality = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { nationality, school_id } = data;

    if (!nationality || !school_id) {
      return res.json({
        success: false,
        message: "nationality and school_id are required",
      });
    }

    // ✅ Duplicate check (exclude current record)
    let existing = await getAll(
      "nationality",
      "*",
      { school_id, nationality },
      "1"
    );

    if (
      existing &&
      existing.length > 0 &&
      existing[0].id != id
    ) {
      return res.json({
        success: false,
        message: "Nationality already exists",
      });
    }

    // ✅ Update
    let result = await update("nationality", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Nationality updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Nationality not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_nationality = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("nationality", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "nationality  updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "nationality not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_nationality = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    // ✅ Only valid values
    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update
    let result = await update("nationality", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Nationality status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Nationality not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//feefrequency
exports.add_feefrequency = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const { feefrequency, display_order, school_id } = req.body;

      if (!feefrequency) {
        return res
          .status(400)
          .json({ success: false, message: "feefrequency is required" });
      }

      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }
      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      let school_session = await getAll(
        "feefrequency",
        "*",
        { school_id: school_id, feefrequency: feefrequency },
        "1",
      );
      if (school_session > 0) {
        res.json({ success: false, message: "feefrequency is already exits" });
      } else {
        if (create("feefrequency", req.body)) {
          res.json({ success: true, message: "feefrequency successfully" });
        }
        res.json({ success: false, message: "feefrequency not done " });
      }
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.feefrequency = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = await getAll("feefrequency", "*", { school_id: id });

    if (rows.length > 0) {
      res.json({ success: true, message: "feefrequency get ", row: rows });
    }
    res.json({ success: false, message: "feefrequency not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_feefrequency = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("feefrequency", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "feefrequency updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "feefrequency not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_feefrequency = async (req, res) => {
  try {
    const id = req.params.id; // /update-school/:id
    const data = req.body;
    let result = await update("feefrequency", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "feefrequency  updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "feefrequency not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//feehead

exports.add_feehead = async (req, res) => {
  try {
    const { feehead, display_order, school_id, feehead_date } = req.body;

    // ✅ VALIDATION
    if (!feehead) {
      return res
        .status(400)
        .json({ success: false, message: "feehead is required" });
    }

    if (!display_order) {
      return res
        .status(400)
        .json({ success: false, message: "display_order is required" });
    }

    if (!school_id) {
      return res
        .status(400)
        .json({ success: false, message: "school_id is required" });
    }

    if (!feehead_date) {
      return res
        .status(400)
        .json({ success: false, message: "feehead_date is required" });
    }

    // ✅ CHECK DUPLICATE
    let exist = await getAll("feehead", "*", {
      school_id: school_id,
      feehead: feehead,
      delete_status: "show",
    });

    if (exist && exist.length > 0) {
      return res.json({ success: false, message: "feehead already exists" });
    }

    // ✅ PAYLOAD
    let payload = {
      feehead,
      display_order: Number(display_order),
      school_id,
      feehead_date,
      status: "Active",
      delete_status: "show",
    };

    // ✅ INSERT
    let result = create("feehead", payload);

    if (!result) {
      return res.json({ success: false, message: "feehead not added" });
    }

    return res.json({ success: true, message: "feehead added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.feehead = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll(
      "feehead",
      "*",
      {
        school_id: id,
        delete_status: "show",
      },
      "",
      "display_order ASC", // ✅ SORTING
    );

    if (rows && rows.length > 0) {
      return res.json({ success: true, message: "feehead get", row: rows });
    }

    return res.json({ success: false, message: "No feehead found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_feehead = async (req, res) => {
  try {
    const id = req.params.id;
    const { feehead, display_order, feehead_date, status } = req.body;

    // ✅ SAFE PAYLOAD (only update provided fields)
    let payload = {};

    if (feehead !== undefined) payload.feehead = feehead;
    if (display_order !== undefined)
      payload.display_order = Number(display_order);
    if (feehead_date !== undefined) payload.feehead_date = feehead_date;
    if (status !== undefined) payload.status = status;

    let result = await update("feehead", payload, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "feehead updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "feehead not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_feehead = async (req, res) => {
  try {
    const id = req.params.id;

    let result = await update("feehead", { delete_status: "delete" }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "feehead deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "feehead not found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_feehead = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update
    const result = await update("feehead", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: `Feehead status updated successfully`,
      });
    }

    return res.json({
      success: false,
      message: "Feehead not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//classfee
exports.add_classfee = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const {
        class_id,
        session_id,
        feehead_id,
        date,
        display_order,
        school_id,
        amount,
      } = req.body;

      // ✅ validations
      if (!class_id) {
        return res
          .status(400)
          .json({ success: false, message: "class_id is required" });
      }

      if (!session_id) {
        return res
          .status(400)
          .json({ success: false, message: "session_id is required" });
      }

      if (!feehead_id) {
        return res
          .status(400)
          .json({ success: false, message: "feehead_id is required" });
      }

      if (!date) {
        return res
          .status(400)
          .json({ success: false, message: "date is required" });
      }

      if (!display_order) {
        return res
          .status(400)
          .json({ success: false, message: "display_order is required" });
      }

      if (!school_id) {
        return res
          .status(400)
          .json({ success: false, message: "school_id is required" });
      }

      if (!amount) {
        return res
          .status(400)
          .json({ success: false, message: "amount is required" });
      }

      // ✅ duplicate check (UPDATED)
      let check = await getAll(
        "classfee",
        "*",
        {
          class_id,
          session_id,
          feehead_id,
          date, // ✅ IMPORTANT
          school_id,
        },
        "1",
      );

      if (check.length > 0) {
        return res.json({
          success: false,
          message: "Class fee already exists",
        });
      }

      // ✅ insert
      if (
        create("classfee", {
          ...req.body,
          status: "Active",
          delete_status: "show",
        })
      ) {
        return res.json({
          success: true,
          message: "Class fee added successfully",
        });
      }

      return res.json({
        success: false,
        message: "Class fee not added",
      });
    }

    return res.json({
      success: false,
      message: "Other request type: " + req.method,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.classfee = async (req, res) => {
  try {
    const { school_id, session_id, class_id } = req.params;

    // ✅ validations
    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    if (!class_id) {
      return res.json({ success: false, message: "class_id is required" });
    }

    // ✅ Step 1: get classfee data
    let rows = await getAll("classfee", "*", {
      school_id,
      session_id,
      class_id,
      delete_status: "show",
    });

    if (!rows || rows.length === 0) {
      return res.json({
        success: false,
        message: "No class fee found",
      });
    }

    // ✅ Step 2: get class list
    let classes = await getAll("class", "*", {
      school_id,
      delete_status: "show",
    });

    // ✅ Step 3: get feehead list
    let feeheads = await getAll("feehead", "*", {
      school_id,
      delete_status: "show",
    });

    // 🔥 DEBUG (optional)
    console.log("CLASSFEE:", rows);
    console.log("CLASSES:", classes);
    console.log("FEEHEADS:", feeheads);

    // ✅ Step 4: map data (manual join)
    let finalData = rows.map((item) => {
      let classData = classes.find(
        (c) => Number(c.id) === Number(item.class_id),
      );

      let feeheadData = feeheads.find(
        (f) => Number(f.id) === Number(item.feehead_id),
      );

      return {
        ...item,

        // ✅ class name
        class_name: classData ? classData.class_name : "Not Found",

        // ✅ feehead name (IMPORTANT 🔥)
        feehead_name: feeheadData
          ? feeheadData.feehead || feeheadData.feehead_name || feeheadData.name
          : "Not Found",
      };
    });

    return res.json({
      success: true,
      message: "Class fee list",
      count: finalData.length,
      row: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.classfee_all = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    // ✅ Step 1: classfee data
    let rows = await getAll("classfee", "*", {
      school_id,
      session_id,
      delete_status: "show",
    });

    if (!rows || rows.length === 0) {
      return res.json({
        success: false,
        message: "No class fee found",
      });
    }

    // ✅ Step 2: class table
    let classes = await getAll("class", "*", { school_id });

    // ✅ Step 3: feehead table
    let feeheads = await getAll("feehead", "*", {
      school_id,
      delete_status: "show",
    });

    // ✅ Step 4: manual join (IMPORTANT FIX: Number())
    let finalData = rows.map((item) => {
      let classData = classes.find(
        (c) => Number(c.id) === Number(item.class_id),
      );

      let feeheadData = feeheads.find(
        (f) => Number(f.id) === Number(item.feehead_id),
      );

      return {
        ...item,
        date: formatDateForResponse(item.date),
        class_name: classData ? classData.class_name : null,
        feehead_name: feeheadData ? feeheadData.feehead : null,
      };
    });

    return res.json({
      success: true,
      message: "All class fee list",
      row: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_classfee = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // ❗ empty check
    if (!data || Object.keys(data).length === 0) {
      return res.json({
        success: false,
        message: "No data provided for update",
      });
    }

    // ✅ remove undefined fields
    let updateData = {};

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    });

    let result = await update("classfee", updateData, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Class fee updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Class fee not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_classfee = async (req, res) => {
  try {
    const id = req.params.id;

    let result = await update("classfee", { delete_status: "hide" }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Class fee deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Class fee not found or not deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_classfee = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ validations
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ update
    let result = await update("classfee", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Class fee status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Class fee not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//subject_group
exports.subject_group = async (req, res) => {
  try {
    const school_id = req.params.id;

    let rows = await getAll("subject_group", "*", {
      school_id,
      delete_status: "show",
    });

    let allsubjects = await getAll("subject", "*", {
      school_id,
      delete_status: "show",
    });

    let subject_name = [];

    subjectid = (rows || []).map((item) => {
      let subject_ids = "";
      let subject_name1 = [];
      subject_ids = item.subject_ids ? item.subject_ids.split(",") : [];
      subject_ids.map(async (items) => {
        allsubjects.map((subject) => {
          if (subject.id == items) {
            subject_name1.push(subject["subject_name"]);
          }
        });
      });
      subject_name.push({ ...item, subject_name: subject_name1 });
    });

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "No subject groups found",
      });
    }

    return res.json({
      success: true,
      message: "Subject groups fetched successfully",
      subject_name,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_subject_group = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("subject_group", "*", {
      id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    let result = await update(
      "subject_group",
      {
        delete_status: "hide",
        deleted_at: new Date(),
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Subject group deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Delete failed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_subject_group = async (req, res) => {
  try {
    const { subject_ids, group_name, display_order, school_id } = req.body;

    console.log("BODY:", req.body);

    // ✅ validation
    if (!subject_ids) {
      return res.json({ success: false, message: "subject_ids is required" });
    }

    if (!group_name) {
      return res.json({ success: false, message: "group_name is required" });
    }

    if (display_order === undefined || display_order === null) {
      return res.json({ success: false, message: "display_order is required" });
    }

    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    // ✅ duplicate check
    let check = await getAll("subject_group", "*", {
      school_id,
      group_name,
      delete_status: "show",
    });

    if (check.length > 0) {
      return res.json({
        success: false,
        message: "subject_group already exists",
      });
    }

    // ✅ convert subject_ids properly
    let subject_ids_string = "";

    if (Array.isArray(subject_ids)) {
      subject_ids_string = subject_ids.join(",");
    } else {
      subject_ids_string = subject_ids; // already string
    }

    // ✅ proper data (not raw req.body)
    let data = {
      subject_ids: subject_ids_string,
      group_name,
      display_order,
      school_id,
    };

    // ✅ insert (no await - tere pattern me)
    let result = create("subject_group", data);

    if (result) {
      return res.json({
        success: true,
        message: "subject_group created successfully",
      });
    }

    return res.json({
      success: false,
      message: "subject_group not created",
    });
  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_subject_group = async (req, res) => {
  try {
    const id = req.params.id;
    const { subject_ids, group_name, display_order } = req.body;

    // ✅ Check record exists
    let check = await getAll("subject_group", "*", {
      id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found",
      });
    }

    const existing = check[0];

    // ✅ Convert subject_ids array → string
    const finalSubjectIds =
      subject_ids && subject_ids.length > 0
        ? subject_ids.join(",")
        : existing.subject_ids;

    // ✅ Duplicate check (same group_name + school_id)
    let duplicate = await getAll("subject_group", "*", {
      group_name: group_name || existing.group_name,
      school_id: existing.school_id,
      delete_status: "show",
    });

    let isDuplicate = duplicate.some((item) => item.id != id);

    if (isDuplicate) {
      return res.json({
        success: false,
        message: "Group name already exists",
      });
    }

    // ✅ Update data
    let result = await update(
      "subject_group",
      {
        subject_ids: finalSubjectIds, // ✅ FIXED KEY
        group_name: group_name || existing.group_name,
        display_order:
          display_order !== undefined ? display_order : existing.display_order,
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Subject group updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "No changes made",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_subject_group = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.json({
        success: false,
        message: "status is required",
      });
    }

    let result = await update("subject_group", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Subject group status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "No change or already same status",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//grade
exports.add_grade = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const {
        grade_name,
        from_percent,
        to_percent,
        remark,
        display_order,
        school_id,
      } = data;

      if (!grade_name)
        return res.json({ success: false, message: "grade_name is required" });

      if (!from_percent)
        return res.json({
          success: false,
          message: "from_percent is required",
        });

      if (!to_percent)
        return res.json({ success: false, message: "to_percent is required" });

      if (!display_order)
        return res.json({
          success: false,
          message: "display_order is required",
        });

      if (!school_id)
        return res.json({ success: false, message: "school_id is required" });

      let check = await getAll(
        "grade",
        "*",
        { school_id: school_id, grade_name: grade_name },
        "1",
      );

      if (check.length > 0) {
        return res.json({
          success: false,
          message: "Grade already exists",
        });
      } else {
        create("grade", {
          ...req.body,
          status: "Active",
          delete_status: "show",
        });

        return res.json({
          success: true,
          message: "Grade created  successfully",
        });
      }
    }

    return res.json({
      success: false,
      message: "Other request type: " + req.method,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.grade = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("grade", "*", {
      school_id: id,
      delete_status: "show",
    });

    if (rows.length > 0) {
      return res.json({
        success: true,
        message: "Grade list",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No grade found",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_grade = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let check = await getAll("grade", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("grade", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Grade updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Grade not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_grade = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("grade", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    let result = await update(
      "grade",
      {
        delete_status: "hide",
        deleted_at: new Date(),
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Grade deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Delete failed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_grade = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let check = await getAll("grade", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("grade", { status: status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Grade status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Status not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//division
exports.add_division = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const {
        division,
        from_percent,
        to_percent,
        remark,
        display_order,
        school_id,
      } = data;

      if (!division)
        return res.json({ success: false, message: "division is required" });

      if (!from_percent)
        return res.json({
          success: false,
          message: "from_percent is required",
        });

      if (!to_percent)
        return res.json({ success: false, message: "to_percent is required" });

      if (!display_order)
        return res.json({
          success: false,
          message: "display_order is required",
        });

      if (!school_id)
        return res.json({ success: false, message: "school_id is required" });

      let check = await getAll(
        "division",
        "*",
        { school_id: school_id, division: division },
        "1",
      );

      if (check.length > 0) {
        return res.json({
          success: false,
          message: "division already exists",
        });
      } else {
        create("division", {
          ...req.body,
          status: "Active",
          delete_status: "show",
        });

        return res.json({
          success: true,
          message: "division created  successfully",
        });
      }
    }

    return res.json({
      success: false,
      message: "Other request type: " + req.method,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.division = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("division", "*", {
      school_id: id,
      delete_status: "show",
    });

    if (rows.length > 0) {
      return res.json({
        success: true,
        message: "Division list",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No division found",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_division = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let check = await getAll("division", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("division", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "division updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "division not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_division = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("division", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    let result = await update(
      "division",
      {
        delete_status: "hide",
        deleted_at: new Date(),
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Division deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Delete failed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_division = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let check = await getAll("division", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("division", { status: status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Division status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Status not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//class_test

exports.add_class_test = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      let { test_name, display_order, session_id, school_id, test_date } =
        data;

      if (!test_name)
        return res.json({ success: false, message: "class_test is required" });

      if (display_order === undefined)
        return res.json({
          success: false,
          message: "display_order is required",
        });

      if (!school_id)
        return res.json({ success: false, message: "school_id is required" });

      if (!session_id)
        return res.json({ success: false, message: "session_id is required" });

      if (!test_date)
        return res.json({ success: false, message: "test_date is required" });

      // ✅ normalize
      const normalizedTestName = test_name.trim().toLowerCase();

      let check = await getAll(
        "class_test",
        "*",
        {
          school_id,
          session_id,
          test_name: normalizedTestName,
        },
        "1"
      );

      if (check.length > 0) {
        return res.json({
          success: false,
          message: "Same test already exists in this session",
        });
      }

      await create("class_test", {
        ...data,
        test_name: normalizedTestName,
        test_date,
        status: "Active",
        delete_status: "show",
      });

      return res.json({
        success: true,
        message: "class_test created successfully",
      });
    }

    return res.json({
      success: false,
      message: "Other request type: " + req.method,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.update_class_test = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let check = await getAll("class_test", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("class_test", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class_test updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "class_test not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.class_test = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    // ✅ validation
    if (!school_id || !session_id) {
      return res.json({
        success: false,
        message: "school_id and session_id required",
      });
    }

    // ✅ correct filter
    let rows = await getAll("class_test", "*", {
      school_id,
      session_id,
      delete_status: "show",
    });

    if (rows.length > 0) {
      let datarow = [];
      rows.map((data) => {
        let date = formatDateForResponse(data["test_date"]);
        datarow.push({ ...data, test_date: date });
      });

      return res.json({
        success: true,
        message: "class_test list",
        count: rows.length,
        row: datarow,
      });
    }

    return res.json({
      success: false,
      message: "No class_test found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_class_test = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("class_test", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    let result = await update(
      "class_test",
      {
        delete_status: "delete",
        deleted_at: new Date(),
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "class_test deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Delete failed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_class_test = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let check = await getAll("class_test", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("class_test", { status: status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Class test status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Status not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//main_exam
exports.add_main_exam = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }

      const { exam_name, display_order, session_id, school_id, exam_date } =
        data;

      if (!exam_name)
        return res.json({ success: false, message: "class_test is required" });

      if (display_order === undefined)
        return res.json({
          success: false,
          message: "display_order is required",
        });

      if (!school_id)
        return res.json({ success: false, message: "school_id is required" });

      if (!session_id)
        return res.json({ success: false, message: "session_id is required" });

      if (!exam_date)
        return res.json({ success: false, message: "exam_date is required" });

      // ✅ IMPORTANT: await lagao
      // ✅ normalize
      const normalizedExamName = exam_name.trim().toLowerCase();

      // ✅ Check within SAME session
      let check = await getAll(
        "main_exam",
        "*",
        {
          school_id: school_id,
          session_id: session_id, // 🔥 Session based check
          exam_name: normalizedExamName
        },
        "1",
      );

      if (check.length > 0) {
        return res.json({
          success: false,
          message: "This exam name already exists in the current session",
        });
      }

      await create("main_exam", {
        ...data,
        exam_name: normalizedExamName,
        exam_date: exam_date,
        status: "Active",
        delete_status: "show",
      });

      return res.json({
        success: true,
        message: "main_exam created successfully",
      });
    }

    return res.json({
      success: false,
      message: "Other request type: " + req.method,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.update_main_exam = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let check = await getAll("main_exam", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("main_exam", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "main_exam updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "main_exam not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.main_exam = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    // ✅ validation
    if (!school_id || !session_id) {
      return res.json({
        success: false,
        message: "school_id and session_id required",
      });
    }

    // ✅ correct filter
    let rows = await getAll("main_exam", "*", {
      school_id,
      session_id,
      delete_status: "show",
    });

    if (rows.length > 0) {
      let datarow = [];
      rows.map((data) => {
        let date = formatDateForResponse(data["exam_date"]);
        datarow.push({ ...data, exam_date: date });
      });

      return res.json({
        success: true,
        message: "main_exam list",
        count: rows.length,
        row: datarow,
      });
    }

    return res.json({
      success: false,
      message: "No main_exam found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.delete_main_exam = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("main_exam", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    let result = await update(
      "main_exam",
      {
        delete_status: "hide",
        deleted_at: new Date(),
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "main_exam deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Delete failed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_main_exam = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let check = await getAll("main_exam", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("main_exam", { status: status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Main exam status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Status not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//holidat_master
exports.add_holiday_master = async (req, res) => {
  try {
    const {
      school_id,
      session_id,
      holiday_name,
      from_date,
      to_date,
      remark,
      display_order,
      status,
    } = req.body;

    // ✅ validation
    if (!school_id) {
      return res.json({ success: false, message: "school_id is required" });
    }

    if (!session_id) {
      return res.json({ success: false, message: "session_id is required" });
    }

    if (!holiday_name) {
      return res.json({ success: false, message: "holiday_name is required" });
    }

    if (!from_date) {
      return res.json({ success: false, message: "from_date is required" });
    }

    if (!to_date) {
      return res.json({ success: false, message: "to_date is required" });
    }

    if (new Date(from_date) > new Date(to_date)) {
      return res.json({
        success: false,
        message: "from_date cannot be greater than to_date",
      });
    }

    // ✅ duplicate check
    let check = await getAll("holiday_master", "*", {
      school_id,
      session_id,
      holiday_name,
      from_date,
      to_date,
      delete_status: "show",
    });

    if (check.length > 0) {
      return res.json({
        success: false,
        message: "Holiday already exists",
      });
    }

    // ✅ insert
    create("holiday_master", {
      school_id,
      session_id,
      holiday_name,
      from_date,
      to_date,
      remark: remark || "",
      display_order: display_order || 0,
      status: status || "Active",
      delete_status: "show",
    });

    return res.json({
      success: true,
      message: "Holiday added successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.update_holiday_master = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let check = await getAll("holiday_master", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    let result = await update("holiday_master", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Holiday updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Holiday not updated",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.delete_holiday_master = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("holiday_master", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    let result = await update(
      "holiday_master",
      {
        delete_status: "hide",
        deleted_at: new Date(),
      },
      id,
    );

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Holiday deleted successfully",
      });
    }

    return res.json({
      success: false,
      message: "Delete failed",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.holiday_master = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;

    if (!school_id || !session_id) {
      return res.json({
        success: false,
        message: "school_id and session_id required",
      });
    }

    let rows = await getAll("holiday_master", "*", {
      school_id,
      session_id,
      delete_status: "show",
    });

    if (rows.length > 0) {
      let datarow = [];
      rows.map((data) => {
        let from_date = formatDateForResponse(data["from_date"]);
        let to_date = formatDateForResponse(data["to_date"]);
        datarow.push({ ...data, to_date, from_date });
      });
      return res.json({
        success: true,
        message: "Holiday list",
        count: rows.length,
        row: datarow,
      });
    }

    return res.json({
      success: false,
      message: "No holidays found",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.status_holiday_master = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let check = await getAll("holiday_master", "*", {
      id: id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found or deleted",
      });
    }

    if (!status || !["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Valid status required (Active / Inactive)",
      });
    }

    let result = await update("holiday_master", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Holiday status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Status not updated",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};





//notification
exports.add_notification = async (req, res) => {
  try {
    const {
      school_id,
      session_id,
      title,
      messages,
      Send_to,
      class_id,
      department_id,
      date,
      Schedule_date,
      time,
      display_order,
    } = req.body;

    if (!school_id) {
      return res.json({
        success: false,
        message: "school_id is required",
      });
    }
    if (!session_id) {
      return res.json({
        success: false,
        message: "session_id is required",
      });
    }
    if (!title) {
      return res.json({
        success: false,
        message: "title is required",
      });
    }
    if (!date) {
      return res.json({
        success: false,
        message: "date is required",
      });
    }
    if (!messages) {
      return res.json({
        success: false,
        message: "messages is required",
      });
    }
    if (!Send_to) {
      return res.json({
        success: false,
        message: "Send_to is required",
      });
    }

    await create("notification", {
      school_id,
      session_id,
      title,
      messages,

      Send_to: Send_to || "All",
      class_id: class_id || null,
      department_id: department_id || null,
      date,
      Schedule_date,
      time,
      display_order,
      status: "Active",
      notification_status: "Draft"
    });

    // --- PUSH NOTIFICATION LOGIC ---
    try {
      let targetTokens = [];

      const normalizedSendTo = String(Send_to).toLowerCase();

      // 1. Fetch tokens based on Send_to
      let legacyTokens = [];
      let deviceTokens = [];

      if (normalizedSendTo === "all") {
        const dTokens = await getAll("user_device_tokens", "fcm_token", { school_id });
        deviceTokens = dTokens.map(t => t.fcm_token);

        const sResult = await getAll("students", "fcm_token", { school_id });
        const eResult = await getAll("employee", "fcm_token", { school_id });
        legacyTokens.push(...sResult.map(s => s.fcm_token), ...eResult.map(e => e.fcm_token));

      } else if (normalizedSendTo === "student") {
        let studentFilter = { school_id };
        if (class_id) studentFilter.registerClass = class_id;

        const students = await getAll("students", "id, fcm_token", studentFilter);
        legacyTokens = students.map(s => s.fcm_token);

        let dQuery = { school_id, role: ["IN", ["student", "Student"]] };
        if (class_id) {
          const studentIds = students.map(s => s.id);
          if (studentIds.length > 0) dQuery.user_id = ["IN", studentIds];
          else dQuery.user_id = 0;
        }

        const tokens = await getAll("user_device_tokens", "fcm_token", dQuery);
        deviceTokens = tokens.map(t => t.fcm_token);

      } else if (normalizedSendTo === "staff") {
        let employeeFilter = { school_id };
        if (department_id) employeeFilter.department = department_id;

        const employees = await getAll("employee", "id, fcm_token", employeeFilter);
        legacyTokens = employees.map(e => e.fcm_token);

        let dQuery = { school_id, role: ["IN", ["staff", "Staff", "employee", "Employee"]] };
        if (department_id) {
          const employeeIds = employees.map(e => e.id);
          if (employeeIds.length > 0) dQuery.user_id = ["IN", employeeIds];
          else dQuery.user_id = 0;
        }

        const tokens = await getAll("user_device_tokens", "fcm_token", dQuery);
        deviceTokens = tokens.map(t => t.fcm_token);
      }

      targetTokens = [...new Set([...deviceTokens, ...legacyTokens])].filter(Boolean);


      // 2. Send via FCM Utility
      if (targetTokens.length > 0) {
        await sendPushNotification(targetTokens, {
          title: title,
          body: messages,
          data: { type: "general", school_id: String(school_id) }
        });
      }
    } catch (pushErr) {
      console.error("Push notification failed ❌:", pushErr.message);
    }

    return res.json({ success: true, message: "Notification added & sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.send_notification = async (req, res) => {
  console.log("BODY 👉", req.body);
  try {
    const { notification_id } = req.body;

    if (!notification_id) {
      return res.json({
        success: false,
        message: "notification_id required",
      });
    }

    // 🔹 Fetch notification
    const result = await getAll("notification", "*", {
      id: notification_id,
      delete_status: "show",
    });

    const notification = result?.[0];

    if (!notification) {
      return res.json({
        success: false,
        message: "Notification not found",
      });
    }

    // ✅ STATUS CHECK: Only Active or Sent can be re-sent (Draft needs activation usually, but here we allow Active)
    if (notification.status !== "Active" && notification.status !== "Sent") {
      return res.json({
        success: false,
        message: `Notification is ${notification.status}. Please change status to 'Active' to send.`,
      });
    }

    const normalizedSendTo = String(notification.Send_to).toLowerCase();
    let targetTokens = [];

    // 🔹 COLLECT TOKENS FROM BOTH SOURCES (Migration Bridge)
    let tokenQuery = { school_id: notification.school_id };
    let legacyTokens = [];
    let deviceTokens = [];

    if (normalizedSendTo === "all") {
      // From device tokens table
      const dResult = await getAll("user_device_tokens", "fcm_token", tokenQuery);
      deviceTokens = dResult.map(t => t.fcm_token);

      // From students table
      const sResult = await getAll("students", "fcm_token", { school_id: notification.school_id });
      legacyTokens.push(...sResult.map(s => s.fcm_token));

      // From employee table
      const eResult = await getAll("employee", "fcm_token", { school_id: notification.school_id });
      legacyTokens.push(...eResult.map(e => e.fcm_token));

    } else if (normalizedSendTo === "student") {
      // From device tokens table
      const dQuery = { ...tokenQuery, role: ["IN", ["student", "Student"]] };

      // Specific Class filtering
      let studentFilter = { school_id: notification.school_id };
      if (notification.class_id) studentFilter.registerClass = notification.class_id;

      const students = await getAll("students", "id, fcm_token", studentFilter);
      legacyTokens = students.map(s => s.fcm_token);

      if (notification.class_id) {
        const studentIds = students.map(s => s.id);
        if (studentIds.length > 0) dQuery.user_id = ["IN", studentIds];
        else dQuery.user_id = 0;
      }

      const dResult = await getAll("user_device_tokens", "fcm_token", dQuery);
      deviceTokens = dResult.map(t => t.fcm_token);

    } else if (normalizedSendTo === "staff") {
      // From device tokens table
      const dQuery = { ...tokenQuery, role: ["IN", ["staff", "Staff", "employee", "Employee"]] };

      // Specific Department filtering
      let employeeFilter = { school_id: notification.school_id };
      if (notification.department_id) employeeFilter.department = notification.department_id;

      const employees = await getAll("employee", "id, fcm_token", employeeFilter);
      legacyTokens = employees.map(e => e.fcm_token);

      if (notification.department_id) {
        const employeeIds = employees.map(e => e.id);
        if (employeeIds.length > 0) dQuery.user_id = ["IN", employeeIds];
        else dQuery.user_id = 0;
      }

      const dResult = await getAll("user_device_tokens", "fcm_token", dQuery);
      deviceTokens = dResult.map(t => t.fcm_token);

    } else if (normalizedSendTo === "single") {
      // Personal notification
      const sResult = await getAll("students", "fcm_token", { id: notification.student_id });
      legacyTokens = sResult.map(s => s.fcm_token);

      const dResult = await getAll("user_device_tokens", "fcm_token", "");
      deviceTokens = dResult.map(t => t.fcm_token);
    }
    let totalSuccess = 0;
    let totalFailure = 0;

    console.log("notification", notification);

    // 🔥 HANDLE 500 TOKEN LIMIT
    const chunkSize = 500;

    // Combine legacyTokens and deviceTokens uniquely
    let allValidTokens = [...deviceTokens, ...legacyTokens].filter(Boolean);
    let tokens1 = [...new Set(allValidTokens)];

    try {

      for (let i = 0; i < tokens1.length; i += chunkSize) {

        const chunk = tokens1.slice(i, i + chunkSize);

        console.log("Sending to:", chunk);

        const response = await admin.messaging().sendEachForMulticast({
          tokens: chunk,

          notification: {
            title: notification.title,
            body: notification.messages,
          },

          data: {
            title: notification.title,
            body: notification.messages,
            type: "general",
          },

          webpush: {
            notification: {
              title: notification.title,
              body: notification.messages,
              icon: "/icon.png",
            },
          },
        });

        console.log("Success Count(3):", response.successCount);
        console.log("Failure Count(44):", response.failureCount);

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(
              `Failed token ${chunk[idx]}:`,
              resp.error
            );
          }
        });
      }

    } catch (error) {
      console.log("FCM Error:", error);
    }



    // 🔹 Update notification status to 'Sent' and set to 'Active' for visibility
    await update("notification", {
      notification_status: "Sent",
      status: "Active",
      date: new Date()
    }, notification_id);

    return res.json({
      success: true,
      message: "Notification sent successfully 🚀",
      successCount: totalSuccess,
      failureCount: totalFailure,
    });
  } catch (err) {
    console.log("ERROR 👉", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.flutter_token = async (req, res) => {
  try {
    const { school_id, user_id, token, type } = req.body;

    console.log("BODY 👉", req.body);

    const role = String(type).toLowerCase();
    await create("user_device_tokens", {

      fcm_token: token
    });
    console.log("Token saved in user_device_tokens ✅");
    // }

    // 2. Also Update the main user table (students or employee) for backward compatibility
    if (role === "student") {
      await update("students", { fcm_token: token }, user_id);
    } else if (role === "employee" || role === "staff") {
      await update("employee", { fcm_token: token }, user_id);
    }

    return res.json({
      success: true,
      message: "Token saved successfully ✅",
    });
  } catch (err) {
    console.log("ERROR 👉", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.read_notification = async (req, res) => {
  try {
    const { id, type, school_id, session_id } = req.body;

    if (!type) {
      return res.json({
        success: false,
        message: "type required (single / all)",
      });
    }

    // 🔥 SINGLE READ
    if (type === "single") {
      if (!id) {
        return res.json({
          success: false,
          message: "id required for single",
        });
      }

      await update("notification", { read_status: "read" }, id);

      return res.json({
        success: true,
        message: "Notification marked as read",
      });
    }

    // 🔥 MARK ALL READ (NO DB)
    if (type === "all") {
      if (!school_id || !session_id) {
        return res.json({
          success: false,
          message: "school_id & session_id required",
        });
      }

      // 🔥 GET ALL NOTIFICATIONS
      const rows = await getAll("notification", "*", {
        school_id,
        session_id,
        delete_status: "show",
      });

      // 🔥 LOOP UPDATE
      for (let item of rows) {
        await update("notification", { read_status: "read" }, item.id);
      }

      return res.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    return res.json({
      success: false,
      message: "Invalid type",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.get_notification = async (req, res) => {
  try {
    const { school_id, session_id } = req.params;
    const { type, class_id, department_id, student_id } = req.query;

    if (!school_id || !session_id) {
      return res.json({
        success: false,
        message: "school_id and session_id required",
      });
    }

    let where = {
      school_id,
      session_id,
      delete_status: "show",
    };

    let notifications = await getAll("notification", "*", where);

    // ✅ JS FILTERING FOR ROBUSTNESS
    if (type !== "admin") {
      notifications = notifications.filter(n =>
        n.status?.toLowerCase() === "active" &&
        n.notification_status?.toLowerCase() === "sent"
      );
    }

    // ✅ SORT: Latest first (Date then ID)
    notifications.sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });

    // ✅ ADMIN UNIQUE
    if (type === "admin") {
      const uniqueMap = new Map();

      notifications.forEach((n) => {
        const key = `${n.title}_${n.class_id}_${n.department_id}_${n.Send_to}`;

        if (
          !uniqueMap.has(key) ||
          uniqueMap.get(key).id < n.id
        ) {
          uniqueMap.set(key, n);
        }
      });

      notifications = Array.from(uniqueMap.values());
    }

    if (type === "student" || (type === "user" && student_id)) {
      let studentSectionId = class_id;
      let studentMainClassId = null;

      // 🔥 GET STUDENT'S SECTION AND CLASS
      if (student_id) {
        const studentData = await getAll("students", "registerClass", { id: student_id });
        if (studentData.length > 0) {
          studentSectionId = studentData[0].registerClass;
          const sectionData = await getAll("class_section", "class_id", { id: studentSectionId });
          if (sectionData.length > 0) {
            studentMainClassId = sectionData[0].class_id;
          }
        }
      }

      notifications = notifications.filter(
        (n) =>
          // 🔵 Matches Specific Section
          (n.Send_to === "Student" && studentSectionId && Number(n.class_id) === Number(studentSectionId)) ||
          // 🟠 Matches Main Class (for backward compatibility or all-sections)
          (n.Send_to === "Student" && studentMainClassId && Number(n.class_id) === Number(studentMainClassId)) ||
          // 🟢 personal notification
          (n.Send_to === "Single" && student_id && Number(n.student_id) === Number(student_id)) ||
          // ⚪ all students
          (n.Send_to === "All")
      );
    }

    if (type === "staff") {
      notifications = notifications.filter(
        (n) =>
          // 🔵 Specific Department
          (n.Send_to === "Staff" && n.department_id && Number(n.department_id) === Number(department_id)) ||
          // 🟠 All Departments (Staff but no dept ID)
          (n.Send_to === "Staff" && !n.department_id) ||
          // 🟢 All Users
          (n.Send_to === "All")
      );
    }

    let sections = await getAll("class_section", "*", { school_id });
    let classes = await getAll("class", "*", { school_id });
    let departments = await getAll("department", "*", { school_id });

    const updatedRows = notifications.map((n) => {
      let class_name = null;
      if (n.class_id) {
        const sectionData = sections.find((s) => s.id == n.class_id);
        if (sectionData) {
          const classData = classes.find((c) => c.id == sectionData.class_id);
          class_name = classData ? `${classData.class_name} ${sectionData.section}` : sectionData.section;
        }
      }
      const deptData = departments.find((d) => d.id == n.department_id);

      return {
        ...n,
        class_name: class_name,
        department_name: deptData ? deptData.department_name : null,
      };
    });

    return res.json({
      success: true,
      message: "Notification list",
      count: updatedRows.length,
      row: updatedRows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.update_notification = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let check = await getAll("notification", "*", {
      id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found",
      });
    }

    let result = await update("notification", data, id);

    return res.json({
      success: true,
      message: "Notification updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.delete_notification = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("notification", "*", {
      id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Already deleted or not found",
      });
    }

    await update(
      "notification",
      {
        delete_status: "hide",
        deleted_at: new Date(),
      },
      id,
    );

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

exports.status_notification = async (req, res) => {
  try {
    const id = req.params.id;

    let check = await getAll("notification", "*", {
      id,
      delete_status: "show",
    });

    if (check.length === 0) {
      return res.json({
        success: false,
        message: "Record not found",
      });
    }

    const currentStatus = check[0].status;

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    await update("notification", { status: newStatus }, id);

    return res.json({
      success: true,
      message: "Status updated",
      status: newStatus,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};



//period
exports.add_period = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.json({
        success: false,
        message: "Other request type: " + req.method,
      });
    }

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send("Data is empty!");
    }

    const { period, display_order, school_id } = data;

    if (!period) {
      return res.status(400).json({
        success: false,
        message: "period is required",
      });
    }

    if (!display_order) {
      return res.status(400).json({
        success: false,
        message: "display_order is required",
      });
    }

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: "school_id is required",
      });
    }

    // ✅ Duplicate check
    let existing = await getAll(
      "period",
      "*",
      { school_id, period },
      "1"
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: false,
        message: "Period already exists",
      });
    }

    // ✅ Insert
    const result = await create("period", data);

    if (result) {
      return res.json({
        success: true,
        message: "Period added successfully",
      });
    }

    return res.json({
      success: false,
      message: "Period not added",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.period = async (req, res) => {
  try {
    const id = req.params.id;

    let rows = await getAll("period", "*", { school_id: id });

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        message: "Period fetched",
        row: rows,
      });
    }

    return res.json({
      success: false,
      message: "No period found",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_period = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const { period, school_id } = data;

    if (!period || !school_id) {
      return res.json({
        success: false,
        message: "period and school_id are required",
      });
    }

    // ✅ Duplicate check (exclude current id)
    let existing = await getAll(
      "period",
      "*",
      { school_id, period },
      "1"
    );

    if (
      existing &&
      existing.length > 0 &&
      existing[0].id != id
    ) {
      return res.json({
        success: false,
        message: "Period already exists",
      });
    }

    // ✅ Update
    let result = await update("period", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Period updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Period not found or not updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_period = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    let result = await update("period", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Period updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "Period not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.status_period = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    // ✅ Validation
    if (!id) {
      return res.json({
        success: false,
        message: "id is required",
      });
    }

    if (!status) {
      return res.json({
        success: false,
        message: "status is required (Active / Inactive)",
      });
    }

    // ✅ Allow only valid values
    if (!["Active", "Inactive"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Update status
    let result = await update("period", { status }, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Period status updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "Period not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.add_exam_timetable = async (req, res) => {
  try {
    const { school_id, session_id, class_id, exam_id, timetable_details } = req.body;

    if (!school_id || !session_id || !class_id || !exam_id || !timetable_details) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Delete existing entries for this class and exam to overwrite
    await deleteData("exam_timetable", { school_id, session_id, class_id, exam_id });

    // Insert new entries
    for (const item of timetable_details) {
      if (item.exam_date || item.start_time || item.end_time) {
        await create("exam_timetable", {
          school_id,
          session_id,
          class_id,
          exam_id,
          subject_id: item.subject_id,
          exam_date: item.exam_date || null,
          start_time: item.start_time || null,
          end_time: item.end_time || null
        });
      }
    }

    res.json({ success: true, message: "Exam Time Table saved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.get_exam_timetable = async (req, res) => {
  try {
    const { school_id, session_id, class_id, exam_id } = req.params;

    const sql = `
      SELECT et.*, s.subject_name 
      FROM exam_timetable et
      JOIN subject s ON et.subject_id = s.id
      WHERE et.school_id = ? AND et.session_id = ? AND et.class_id = ? AND et.exam_id = ?
      ORDER BY s.display_order ASC
    `;

    const rows = await runCustomQuery(sql, [school_id, session_id, class_id, exam_id]);

    const formattedRows = rows.map(row => ({
      ...row,
      exam_date: formatDateForResponse(row.exam_date)
    }));

    res.json({ success: true, row: formattedRows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- BANNER MANAGEMENT ---
exports.add_banner = async (req, res) => {
  try {
    const { school_id, title, display_order, status } = req.body;
    const banner_image = req.file ? req.file.filename : null;

    if (!school_id || !banner_image) {
      return res.json({ success: false, message: "school_id and banner_image are required" });
    }

    const result = await create("banners", {
      school_id,
      title,
      banner_image,
      display_order: display_order || 0,
      status: status || "Active"
    });

    if (result) {
      return res.json({ success: true, message: "Banner added successfully" });
    }
    return res.json({ success: false, message: "Failed to add banner" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.get_banners = async (req, res) => {
  try {
    const { school_id } = req.params;
    const rows = await getAll("banners", "*", { school_id, delete_status: "show" });
    res.json({ success: true, row: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update_banner = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { ...req.body };
    if (req.file) {
      data.banner_image = req.file.filename;
    }

    const result = await update("banners", data, id);
    if (result) {
      return res.json({ success: true, message: "Banner updated successfully" });
    }
    return res.json({ success: false, message: "Update failed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.status_banner = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const result = await update("banners", { status }, id);
    if (result) {
      return res.json({ success: true, message: "Status updated" });
    }
    return res.json({ success: false, message: "Status update failed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete_banner = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await update("banners", { delete_status: "hide" }, id);
    if (result) {
      return res.json({ success: true, message: "Banner deleted" });
    }
    return res.json({ success: false, message: "Delete failed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

