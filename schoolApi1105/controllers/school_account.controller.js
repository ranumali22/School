const { create, getAll, update } = require("../model/school_account");

const formatMobileNumber = (number) => {
  if (!number) return null;
  let s = String(number).trim().replace(/\s+/g, "");
  if (s.startsWith("+")) s = "+" + s.slice(1).replace(/\D/g, "");
  else s = s.replace(/\D/g, "");
  if (s.startsWith("+91")) return s;
  if (s.length === 12 && s.startsWith("91")) return "+" + s;
  if (s.length === 10) return "+91" + s;
  if (s.length === 11 && s.startsWith("0")) return "+91" + s.slice(1);
  return s.startsWith("+") ? s : "+" + s;
};

exports.register_school = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }
      if (!req.body.school_name) {
        return res
          .status(400)
          .json({ success: false, message: "School Name is required" });
      }
      if (!req.body.email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }
      if (!req.body.mobile_no) {
        return res
          .status(400)
          .json({ success: false, message: "Mobile No is required" });
      }
      if (!req.body.address) {
        return res
          .status(400)
          .json({ success: false, message: "Address is required" });
      }
      if (!req.body.username) {
        return res
          .status(400)
          .json({ success: false, message: "Username is required" });
      }
      if (!req.body.password) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }

      const { email, mobile_no, username } = req.body;
      let email1 = await getAll("school_account", "*", { email: email }, "1");
      let username1 = await getAll(
        "school_account",
        "*",
        { username: username },
        "1",
      );
      let mobile1 = await getAll(
        "school_account",
        "*",
        { mobile_no: mobile_no },
        "1",
      );
      if (email1.length > 0) {
        res.json({ success: false, message: "email is already exits" });
      } else if (mobile1.length > 0) {
        res.json({ success: false, message: "mobile is already exits" });
      } else if (username1.length > 0) {
        res.json({ success: false, message: "username is already exits" });
        return res.json({ success: false, message: "username is already exits" });
      } else {
        const { school_name } = req.body
        let school_prefix = school_name.slice(0, 4).trim();
        let data = { ...req.body, school_prefix };

        delete data.upload_type;
        delete data.logoPreview;
        delete data.logoFile;

        if (req.file) {
          const folderName = school_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          data.upload_logo = `school_logos/${folderName}/${req.file.filename}`;
        }

        if (create("school_account", data)) {
          return res.json({ success: true, message: "register school successfully" });
        }
        return res.json({ success: false, message: "register school not done " });
      }
    }
    return res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.all_school = async (req, res) => {
  try {
    let rows = await getAll("school_account");
    if (rows) {
      return res.json({ success: true, message: "all school data ", row: rows });
    }
    return res.json({ success: false, message: "school not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.profile_school = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = await getAll("school_account", "*", { id: id });
    if (rows) {
      return res.json({ success: true, message: "profile school data ", row: rows });
    }
    return res.json({ success: false, message: "school profile not get " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.change_password_school = async (req, res) => {
  try {
    const id = req.params.id;
    const { password1, password2, password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "password is required" });
    }
    if (!password1) {
      return res
        .status(400)
        .json({ success: false, message: "password1 is required" });
    }
    if (!password2) {
      return res
        .status(400)
        .json({ success: false, message: "password2 is required" });
    }
    if (password1 !== password2) {
      return res.json({
        success: false,
        message:
          "Passwords do not match. Please make sure both passwords are the same.",
      });
    }
    let rows = await getAll("school_account", "*", { id: id });
    if (rows) {
      if (rows[0]["password"] == password) {
        let result = await update(
          "school_account",
          { password: password1 },
          id,
        );

        if (result && result.affectedRows > 0) {
          return res.json({
            success: true,
            message:
              "Your school account password has been updated successfully.",
          });
        }
        return res.json({
          success: false,
          message: "Failed to change the school password. Please try again",
        });
      }
      return res.json({
        success: false,
        message: "Old password does not match. Please check and try again.",
      });
    } else {
      return res.json({
        success: false,
        message: "school not exits",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forget_password_school = async (req, res) => {
  try {
    const { email, mobile_no } = req.body;

    if (!mobile_no && !email) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Mobile number or email is required",
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const insertEmail = email?.trim() || null;
    const insertContact = contact_number?.trim() || null;

    if (insertContact) {
      const formattedNumber = formatMobileNumber(insertContact);
      const cleanNumber = formattedNumber.replace("+91", "");

      if (cleanNumber.length !== 10) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid mobile number format" });
      }

      const smsMessage = `Your one-time login password (OTP) is ${otp}. Do not share this code with anyone. It will expire in 10 minutes. Team- (DPP HEALTHCARE PRIVATE LIMITED)`;

      try {
        const smsEndpoint =
          "http://pro.mdwebsoft.com/sms-panel/api/http/index.php";
        const payload = new URLSearchParams({
          username: process.env.SMS_USERNAME,
          apikey: process.env.SMS_API_KEY,
          apirequest: "Text",
          sender: process.env.SMS_SENDER_ID,
          route: "OTP",
          format: "JSON",
          mobile: cleanNumber,
          message: smsMessage,
          TemplateID: process.env.SMS_TEMPLATE_ID,
        });

        const smsRes = await axios.post(smsEndpoint, payload, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 15000,
        });

        smsResponse = smsRes.data;
        console.log(" SMS Response:", smsResponse);

        const respStr =
          typeof smsRes.data === "string"
            ? smsRes.data.toLowerCase()
            : JSON.stringify(smsRes.data).toLowerCase();
        if (!respStr.includes("success") && !respStr.includes("queued")) {
          console.warn("SMS may not have been sent successfully:", smsRes.data);
        }
      } catch (smsErr) {
        smsResponse = smsErr.response?.data || smsErr.message;
        console.error("SMS sending failed:", smsResponse);
      }
    }

    if (insertEmail) {
      try {
        await transporter.sendMail({
          from: { name: "info", address: "info@g.c" },
          to: insertEmail,
          subject: "Your OTP for Forget",
          html: `<p>Dear Customer,</p><p>Your OTP is: <b>${otp}</b></p><p>It expires in 5 minutes.</p>`,
        });
        console.log(" OTP email sent to:", insertEmail);
      } catch (e) {
        console.warn("Email send failed:", e.message);
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

function parseDate(dateStr) {
  if (dateStr instanceof Date) {
    return dateStr;
  }


  if (typeof dateStr !== "string") {
    console.error("Invalid date:", dateStr);
    return new Date("Invalid");
  }

  if (dateStr.includes("-") && dateStr.length === 10) {
    return new Date(dateStr);
  }

  if (dateStr.includes("-")) {
    const [d, m, y] = dateStr.split("-");
    return new Date(`${y}-${m}-${d}`);
  }

  return new Date(dateStr);
}

exports.login_school = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }
      if (!req.body.username) {
        return res
          .status(400)
          .json({ success: false, message: "Username is required" });
      }
      if (!req.body.password) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }

      let rows = await getAll("school_account", "*", req.body, "1");
      if (!rows || rows.length === 0) {
        return res.json({
          success: false,
          message: "Invalid Username or Password ❌",
        });
      }

      if (rows[0]["delete_status"] === "delete") {
        return res.json({
          success: false,
          message: "This school account is inactive. Please contact the administrator. ❌",
        });
      }

      let school_id = rows[0]["id"];

      console.log("rowschool login", rows);

      let rowsseesion = await getAll("school_session", "*", { school_id }, "1");
      console.log("rowschool login session", rowsseesion);

      let today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentSession = rowsseesion.find((data) => {
        const start = parseDate(data.start_date);
        const end = parseDate(data.end_date);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return start <= today && today <= end;
      });

      if (currentSession) {
        if (rows.length > 0) {
          return res.json({
            success: true,
            message: "Welcome! You’ve successfully signed in",
            user: rows,
            session: [currentSession],
          });
        }
      } else {
        if (rows.length > 0) {
          return res.json({
            success: true,
            message: "Welcome! You’ve successfully signed in",
            user: rows,
            session: [],
          });
        }
      }

      res.json({
        success: false,
        message: "You are not signed in. Please log in to continue ",
      });
    }
    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {

    return res.json({ success: false, message: error.message });
  }
};

exports.update_school = async (req, res) => {
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

    if (req.file) {
      const schoolName = (data.school_name || "default").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      data.upload_logo = `school_logos/${schoolName}/${req.file.filename}`;
    }

    console.log("Updating School ID:", id, "with data:", data);
    if (req.file) console.log("File uploaded:", req.file.filename);

    let result = await update("school_account", data, id);
    console.log("Update Result:", result);

    if (result && (result.affectedRows > 0 || result.changedRows > 0)) {
      return res.json({
        success: true,
        message: "School updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "School not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_school = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    let result = await update("school_account", data, id);
    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "School updated successfully",
      });
    }
    return res.json({
      success: false,
      message: "School not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.sms_template_school = async (req, res) => {
  try {
    if (req.method == "POST") {
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).send("Data is empty!");
      }
      const { school_id } = req.body;
      if (!req.body.school_id) {
        return res
          .status(400)
          .json({ success: false, message: "School id is required" });
      }
      let school_details = await getAll(
        "sms_template",
        "*",
        { school_id: school_id },
        "1",
      );
      if (school_details.length > 0) {
        res.json({ success: false, message: "school_id is already exits" });
      } else {
        if (create("sms_template", req.body)) {
          res.json({
            success: true,
            message: "School SMS template created successfully.",
          });
        }
        res.json({
          success: false,
          message: "School SMS template could not be saved successfully.",
        });
      }
    }

    res.json({ success: false, message: "Other request type:" + req.method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.sms_template_school_get = async (req, res) => {
  try {
    let rows = await getAll("sms_template");
    if (rows) {
      res.json({
        success: true,
        message: "all school sms_template data ",
        row: rows,
      });
    }
    res.json({ success: false, message: "school sms_template not done " });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_sms_template_school = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let result = await update("sms_template", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "update_sms_template_school updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "update_sms_template_school not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.delete_sms_template_school = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    let result = await update("sms_template", data, id);

    if (result && result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "sms_template updated successfully",
      });
    }

    return res.json({
      success: false,
      message: "sms_template not found or not updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.save_fcm_token = async (req, res) => {
  try {
    const { school_id, user_id, role, fcm_token } = req.body;

    if (!school_id || !user_id || !role || !fcm_token) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    let existing = await getAll("user_device_tokens", "*", { school_id, user_id, role, fcm_token });

    if (existing.length > 0) {
      return res.json({ success: true, message: "Token already registered" });
    }


    await create("user_device_tokens", {
      school_id,
      user_id,
      role,
      fcm_token
    });

    // 🔥 ALSO Update the main user table (students or employee)
    const userRole = String(role).toLowerCase();
    if (userRole === "student") {
      await update("students", { fcm_token }, user_id);
    } else if (userRole === "employee" || userRole === "staff") {
      await update("employee", { fcm_token }, user_id);
    }


    console.log("user token save in device");


    return res.json({ success: true, message: "Token saved successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.check_school_status = async (req, res) => {
  try {
    const { school_id } = req.params;
    if (!school_id) {
      return res.json({ success: false, message: "School ID is required" });
    }
    let rows = await getAll("school_account", "delete_status", { id: school_id });
    if (rows && rows.length > 0) {
      const is_active = rows[0].delete_status !== "delete";
      return res.json({
        success: true,
        active: is_active,
        is_inactive: !is_active
      });
    }
    return res.json({ success: false, message: "School not found", is_inactive: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
