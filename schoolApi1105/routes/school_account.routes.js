const express = require("express");
const upload = require("../middleware/upload");
const controller = require("../controllers/school_account.controller");
const mastercontroller = require("../controllers/school_master.controller");
const studentcontroller = require("../controllers/school_students.controller");
const employeecontroller = require("../controllers/school_employee.controller");
const homeworkcontroller = require("../controllers/school_homework.controller");
const { getAll } = require("../model/school_account");

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Request Method: ${req.method}`);
  console.log(`Request URL: ${req.originalUrl}`);
  // console.log("Request Params:", req.params);
  // console.log("Request Body:", req.body);
  next();
});

// Middleware to check if school is inactive
router.use(async (req, res, next) => {
  try {
    const path = req.originalUrl;
    const isExcluded = [
      "/delete_school",
      "/all_school",
      "/update_school",
      "/register_school",
      "/login_school",
      "/student_login",
      "/login_employee",
      "/check_school_status"
    ].some(route => path.includes(route));

    if (isExcluded) {
      return next();
    }

    const school_id = req.params.school_id || req.body.school_id || req.query.school_id;
    if (school_id) {
      const schools = await getAll("school_account", "delete_status", { id: school_id });
      if (schools && schools.length > 0 && schools[0].delete_status === "delete") {
        return res.status(403).json({
          success: false,
          is_inactive: true,
          message: "School is inactive"
        });
      }
    }
    next();
  } catch (error) {
    console.error("Middleware school status check error:", error);
    next();
  }
});

// school
router.post("/register_school", upload.single("upload_logo"), controller.register_school);
router.get("/all_school", controller.all_school);
router.post("/login_school", controller.login_school);
router.delete("/delete_school/:id", controller.delete_school);
router.put("/update_school/:id", upload.single("upload_logo"), controller.update_school);
router.get("/profile_school/:id", controller.profile_school);
router.put("/change_password_school/:id", controller.change_password_school);
router.post("/forget_password_school", controller.forget_password_school);
router.get("/check_school_status/:school_id", controller.check_school_status);

// template
router.post("/sms_template_school", controller.sms_template_school);
router.get("/sms_template_school_get", controller.sms_template_school_get);
router.put(
  "/update_sms_template_school/:id",
  controller.update_sms_template_school,
);
router.delete(
  "/delete_sms_template_school/:id",
  controller.delete_sms_template_school,
);

//session
router.post("/add_session", mastercontroller.add_session);
router.get("/session/:id", mastercontroller.session);
router.put("/update_session/:id", mastercontroller.update_session);
router.delete("/delete_session/:id", mastercontroller.delete_session);
router.put("/status_session/:id", mastercontroller.status_session);

//department
router.post("/add_department", mastercontroller.add_department);
router.get("/department/:id", mastercontroller.department);
router.put("/update_department/:id", mastercontroller.update_department);
router.delete("/delete_department/:id", mastercontroller.delete_department);
router.put("/status_department/:id", mastercontroller.status_department);

// class
router.post("/add_class", mastercontroller.add_class);
router.get("/class/:id", mastercontroller.class);
router.put("/update_class/:id", mastercontroller.update_class);
router.delete("/delete_class/:id", mastercontroller.delete_class);
router.put("/status_class/:id", mastercontroller.status_class);

//class section
router.post("/add_class_section", mastercontroller.add_class_section);
router.get("/class_section/:id", mastercontroller.class_section);
router.put("/update_class_section/:id", mastercontroller.update_class_section);
router.delete(
  "/delete_class_section/:id",
  mastercontroller.delete_class_section,
);
router.put("/status_class_section/:id", mastercontroller.status_class_section);

//class detaills
router.post("/add_class_detail", mastercontroller.add_class_detail);
router.get("/class_detail/:id", mastercontroller.class_detail);
router.put("/update_class_detail/:id", mastercontroller.update_class_detail);
router.delete("/delete_class_detail/:id", mastercontroller.delete_class_detail);
router.put("/status_class_detail/:id", mastercontroller.status_class_detail);

//subject
router.post("/add_subject", mastercontroller.add_subject);
router.get("/subject/:id", mastercontroller.subject);
router.put("/update_subject/:id", mastercontroller.update_subject);
router.delete("/delete_subject/:id", mastercontroller.delete_subject);
router.put("/status_subject/:id", mastercontroller.status_subject);

//gander
router.post("/add_gender", mastercontroller.add_gender);
router.get("/gender/:id", mastercontroller.gender);
router.put("/update_gender/:id", mastercontroller.update_gender);
router.delete("/delete_gender/:id", mastercontroller.delete_gender);
router.put("/status_gender/:id", mastercontroller.status_gender);

//medium
router.post("/add_medium", mastercontroller.add_medium);
router.get("/medium/:id", mastercontroller.medium);
router.put("/update_medium/:id", mastercontroller.update_medium);
router.delete("/delete_medium/:id", mastercontroller.delete_medium);
router.put("/status_medium/:id", mastercontroller.status_medium);

//categary
router.post("/add_category", mastercontroller.add_category);
router.get("/category/:id", mastercontroller.category);
router.put("/update_category/:id", mastercontroller.update_category);
router.delete("/delete_category/:id", mastercontroller.delete_category);
router.put("/status_category/:id", mastercontroller.status_category);

//Religion
router.post("/add_religion", mastercontroller.add_religion);
router.get("/religion/:id", mastercontroller.religion);
router.put("/update_religion/:id", mastercontroller.update_religion);
router.delete("/delete_religion/:id", mastercontroller.delete_religion);
router.put("/status_religion/:id", mastercontroller.status_religion);

//nationality
router.post("/add_nationality", mastercontroller.add_nationality);
router.get("/nationality/:id", mastercontroller.nationality);
router.put("/update_nationality/:id", mastercontroller.update_nationality);
router.delete("/delete_nationality/:id", mastercontroller.delete_nationality);
router.put("/status_nationality/:id", mastercontroller.status_nationality);

//feefrequency
router.post("/add_feefrequency", mastercontroller.add_feefrequency);
router.get("/feefrequency/:id", mastercontroller.feefrequency);
router.put("/update_feefrequency/:id", mastercontroller.update_feefrequency);
router.delete("/delete_feefrequency/:id", mastercontroller.delete_feefrequency);

//feehead
router.post("/add_feehead", mastercontroller.add_feehead);
router.get("/feehead/:id", mastercontroller.feehead);
router.put("/update_feehead/:id", mastercontroller.update_feehead);
router.delete("/delete_feehead/:id", mastercontroller.delete_feehead);
router.put("/status_feehead/:id", mastercontroller.status_feehead);

//classfee
router.post("/add_classfee", mastercontroller.add_classfee);
router.get(
  "/classfee/:school_id/:session_id/:class_id",
  mastercontroller.classfee,
);
router.get(
  "/classfee_all/:school_id/:session_id",
  mastercontroller.classfee_all,
);
router.put("/update_classfee/:id", mastercontroller.update_classfee);
router.delete("/delete_classfee/:id", mastercontroller.delete_classfee);
router.put("/status_classfee/:id", mastercontroller.status_classfee);

//subject_group
router.post("/add_subject_group", mastercontroller.add_subject_group);
router.get("/subject_group/:id", mastercontroller.subject_group);
router.put("/update_subject_group/:id", mastercontroller.update_subject_group);
router.delete(
  "/delete_subject_group/:id",
  mastercontroller.delete_subject_group,
);
router.put("/status_subject_group/:id", mastercontroller.status_subject_group);

//grade
router.post("/add_grade", mastercontroller.add_grade);
router.get("/grade/:id", mastercontroller.grade);
router.put("/update_grade/:id", mastercontroller.update_grade);
router.delete("/delete_grade/:id", mastercontroller.delete_grade);
router.put("/status_grade/:id", mastercontroller.status_grade);

//division
router.post("/add_division", mastercontroller.add_division);
router.get("/division/:id", mastercontroller.division);
router.put("/update_division/:id", mastercontroller.update_division);
router.delete("/delete_division/:id", mastercontroller.delete_division);
router.put("/status_division/:id", mastercontroller.status_division);

//class_test
router.post("/add_class_test", mastercontroller.add_class_test);
router.get("/class_test/:school_id/:session_id", mastercontroller.class_test);
router.put("/update_class_test/:id", mastercontroller.update_class_test);
router.delete("/delete_class_test/:id", mastercontroller.delete_class_test);
router.put("/status_class_test/:id", mastercontroller.status_class_test);

//main_exam
router.post("/add_main_exam", mastercontroller.add_main_exam);
router.get("/main_exam/:school_id/:session_id", mastercontroller.main_exam);
router.put("/update_main_exam/:id", mastercontroller.update_main_exam);
router.delete("/delete_main_exam/:id", mastercontroller.delete_main_exam);
router.put("/status_main_exam/:id", mastercontroller.status_main_exam);

//holiday_master
router.post("/add_holiday_master", mastercontroller.add_holiday_master);
router.get(
  "/holiday_master/:school_id/:session_id",
  mastercontroller.holiday_master,
);
router.put(
  "/update_holiday_master/:id",
  mastercontroller.update_holiday_master,
);
router.delete(
  "/delete_holiday_master/:id",
  mastercontroller.delete_holiday_master,
);
router.put(
  "/status_holiday_master/:id",
  mastercontroller.status_holiday_master,
);

//token get flutter

//notification
router.post("/add_notification", mastercontroller.add_notification);
router.post("/send_notification", mastercontroller.send_notification);
router.post("/flutter_token", mastercontroller.flutter_token);
router.post("/read_notification", mastercontroller.read_notification);
router.get(
  "/notification/:school_id/:session_id",
  mastercontroller.get_notification,
);
router.put("/update_notification/:id", mastercontroller.update_notification);
router.put("/status_notification/:id", mastercontroller.status_notification);
router.delete("/delete_notification/:id", mastercontroller.delete_notification);

//banner
router.post("/add_banner", upload.single("banner_image"), mastercontroller.add_banner);
router.get("/banners/:school_id", mastercontroller.get_banners);
router.put("/update_banner/:id", upload.single("banner_image"), mastercontroller.update_banner);
router.put("/status_banner/:id", mastercontroller.status_banner);
router.delete("/delete_banner/:id", mastercontroller.delete_banner);

//period
router.post("/add_period", mastercontroller.add_period);
router.get("/period/:id", mastercontroller.period);
router.put("/update_period/:id", mastercontroller.update_period);
router.delete("/delete_period/:id", mastercontroller.delete_period);
router.put("/status_period/:id", mastercontroller.status_period);
//exam_timetable
router.post("/add_exam_timetable", mastercontroller.add_exam_timetable);
router.get("/exam_timetable/:school_id/:session_id/:class_id/:exam_id", mastercontroller.get_exam_timetable);


//students
router.post(
  "/add_students",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  studentcontroller.add_students,
);

router.post(
  "/upload_students_excel",

  studentcontroller.upload_students_excel,
);

router.get("/students/:school_id/:session_id", studentcontroller.students);
router.get("/student/:id", studentcontroller.student_by_id);
router.put(
  "/update_students/:id",
  upload.single("photo"),
  studentcontroller.update_students,
);
router.delete("/delete_students/:id", studentcontroller.delete_students);
router.put("/status_student/:id", studentcontroller.status_students);
router.post("/student_login", studentcontroller.student_login);
router.post("/promote_students", studentcontroller.promote_students);
router.get("/previous_due_fees/:school_id/:current_session_id", studentcontroller.previous_due_fees);

//student_subject_allot
router.post(
  "/add_student_subject_allot",
  studentcontroller.add_student_subject_allot,
);
router.get(
  "/student_subject_allot/:school_id/:session_id/:student_id",
  studentcontroller.student_subject_allot,
);
router.put(
  "/update_student_subject_allot/:id",
  studentcontroller.update_student_subject_allot,
);
router.delete(
  "/delete_student_subject_allot/:id",
  studentcontroller.delete_student_subject_allot,
);
router.get(
  "/student_subject_allot/:school_id/:session_id",
  studentcontroller.student_subject_allot,
);

//employee
router.post(
  "/add_employee",
  upload.single("employeePhoto"),
  employeecontroller.add_employee,
);
router.get("/employee/:school_id/:session_id", employeecontroller.employee);
router.put(
  "/update_employee/:id",
  upload.single("employeePhoto"),
  employeecontroller.update_employee,
);
router.put("/delete_employee/:id", employeecontroller.delete_employee);
router.put("/status_employee/:id", employeecontroller.status_employee);
router.post("/login_employee", employeecontroller.login_employee);

//staff_period_allot
router.post("/add_staff_period_allot", employeecontroller.add_staff_period_allot);
router.get("/staff_period_allot/:school_id/:session_id", employeecontroller.staff_period_allot);
router.put("/update_staff_period_allot/:id", employeecontroller.update_staff_period_allot);
router.delete("/delete_staff_period_allot/:id", employeecontroller.delete_staff_period_allot);
router.put("/status_staff_period_allot/:id", employeecontroller.status_staff_period_allot);
router.get("/student_timetable/:school_id/:session_id/:class_id", employeecontroller.get_student_timetable);

//student_fee_allot
router.get(
  "/student_class_fee_head/:school_id/:session_id/:registerClass/:student_id",
  studentcontroller.student_class_fee_head,
);
router.post("/add_student_fee_allot", studentcontroller.add_student_fee_allot);
router.get(
  "/student_fee_allot/:school_id/:session_id/:class_id",
  studentcontroller.student_fee_allot,
);

//student_fee
router.get(
  "/student_fee/:school_id/:session_id",
  studentcontroller.student_fee,
);
router.get(
  "/student_fee/:school_id/:session_id/:class_id",
  studentcontroller.student_fee,
);
router.post("/add_student_fee", studentcontroller.add_student_fee);
router.delete("/delete_student_fee/:school_id/:session_id/:student_id/:receiptNo", studentcontroller.delete_student_fee);
router.post("/save_fcm_token", controller.save_fcm_token);

//studentclass test

router.get(
  "/student_class_test/:school_id/:session_id/:class_id/:subject_id/:subject_head_id/:test_id",
  studentcontroller.student_class_test,
);
router.get(
  "/student_class_test_details/:school_id/:session_id/:class_id/:subject_id/:test_id",
  studentcontroller.student_class_test_details,
);
router.post(
  "/add_student_class_test",
  studentcontroller.add_student_class_test,
);

//student main exam test
router.get(
  "/student_main_exam/:school_id/:session_id/:class_id/:subject_id/:subject_head_id/:test_id",
  studentcontroller.student_main_exam,
);
router.post("/add_student_main_exam", studentcontroller.add_student_main_exam);
router.get(
  "/student_main_exam_details/:school_id/:session_id/:class_id/:subject_id/:test_id",
  studentcontroller.student_main_exam_details,
);

//student attendence
router.get(
  "/student_attendance/:school_id/:session_id/:class_id/:date/:attendance_type",
  studentcontroller.student_attendance,
);
router.get(
  "/class_attendance_list/:school_id/:session_id/:date/",
  studentcontroller.class_attendance_list,
);
router.post(
  "/add_student_attendance",
  studentcontroller.add_student_attendance,
);
router.get(
  "/student_attendance_report/:school_id/:session_id/:student_id",
  studentcontroller.student_attendance_report,
);
router.get(
  "/student_fee_report/:school_id/:session_id/:student_id",
  studentcontroller.student_fee_report,
);

router.get(
  "/student_class_test_report/:school_id/:session_id/:student_id",
  studentcontroller.student_class_test_report,
);

router.get(
  "/class_test_section_report/:school_id/:session_id/:class_id",
  studentcontroller.class_test_section_report,
);

router.get(
  "/main_exam_section_report/:school_id/:session_id/:class_id/:exam_id",
  studentcontroller.main_exam_section_report,
);

router.get(
  "/student_main_exam_report/:school_id/:session_id/:student_id",
  studentcontroller.student_main_exam_report,
);

// Debug logging for new routes
console.log("Checking dashboard summary handlers...");
console.log("Student Summary Handler:", typeof studentcontroller.student_dashboard_summary);
console.log("Staff Summary Handler:", typeof employeecontroller.staff_dashboard_summary);

if (typeof studentcontroller.student_dashboard_summary === "function") {
  router.get(
    "/student_dashboard_summary/:school_id/:session_id/:student_id",
    studentcontroller.student_dashboard_summary
  );
} else {
  console.error("CRITICAL: studentcontroller.student_dashboard_summary is not a function!");
}

if (typeof employeecontroller.staff_dashboard_summary === "function") {
  router.get(
    "/staff_dashboard_summary/:school_id/:session_id/:staff_id",
    employeecontroller.staff_dashboard_summary
  );
} else {
  console.error("CRITICAL: employeecontroller.staff_dashboard_summary is not a function!");
}


// Homework / Work Upload
router.post("/upload_work", upload.single("file"), homeworkcontroller.upload_work);
router.post("/update_work/:id", upload.single("file"), homeworkcontroller.update_work);
router.get("/get_staff_work/:school_id/:session_id/:staff_id", homeworkcontroller.get_staff_work);
router.get("/get_student_work/:school_id/:session_id/:class_id", homeworkcontroller.get_student_work);
router.get("/get_class_sections/:school_id", homeworkcontroller.get_class_sections);
router.put("/delete_work/:id", homeworkcontroller.delete_work);

module.exports = router;

