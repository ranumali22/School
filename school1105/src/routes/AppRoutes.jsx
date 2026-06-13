import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperAdminLayout from "../Component/layout/SuperAdminLayout";
import SchoolList from "../pages/school/SchoolList";

import StaffAddClassTest from "../pages/staff/StaffAddClassTest";
import StaffClassTestTable from "../pages/staff/StaffClassTestTable";
import StaffMainExamTable from "../pages/staff/StaffMainExamTable";
import StaffAddMainExamMarks from "../pages/staff/StaffAddMainExamMarks";

import Layout from "../Component/layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/auth/login";
import StudentForm from "../pages/student/StudentForm";
import StudentList from "../pages/student/StudentsList";

import StudentLayout from "../Component/layout/StudentLayout";
import StaffAdd from "../pages/staff/StaffAdd";
import StaffList from "../pages/staff/StaffList";
import StaffPeriodAllot from "../pages/staff/StaffPeriodAllot";
import AddSession from "../pages/masters/AddSession";
import AddClass from "../pages/masters/AddClass";
import ClassSection from "../pages/masters/ClassSection";
import Department from "../pages/masters/Department";
import FeeHeadList from "../pages/masters/FeeHead";
import Subject from "../pages/masters/SubjectAdd";
import SubjectAssignGroup from "../pages/masters/SubjectAssignGroup";
import SubjectAssignGroupForm from "../pages/masters/SubjectAssignGroupForm";
import SubjectAssignGroupTable from "../pages/masters/SubjectAssignGroup";
import FeeFrequencyForm from "../pages/masters/FrequencyForm";
import FeeFrequencyTable from "../pages/masters/FrequencyTable";
// import ClassDetailForm from "../pages/masters/ClassDetailForm";
import ClassDetailTable from "../pages/masters/ClassDetailTable";
import GradeSystem from "../pages/masters/GradeSystem";
import DivisionSystem from "../pages/masters/Division";
import ClassFee from "../pages/masters/ClassFee";
import ClassFeeForm from "../pages/masters/ClassFeeForm";
import StudentFeeAllot from "../pages/student/StudentFeeAllot";
import StudentFeeForm from "../pages/student/StudentFeeForm";
import StudentSubjectAllot from "../pages/student/StudentSubjectAllot";
import StudentSubjectForm from "../pages/student/StudentSubjectAllotFrom";
import StudentFeeDepositForm from "../pages/student/StudentFeeDepositForm";
import StudentFeeDepositTable from "../pages/student/StudentFeeDepositTable";
import PreviousDueFeeForm from "../pages/student/PreviousDueFeeForm";
import PreviousDueFeeTable from "../pages/student/PreviousDueFeeTable";
import StudentAttendance from "../pages/student/StudentAttendance";
import BankForm from "../pages/staff/BankForm";
import IdentityForm from "../pages/staff/IdentityForm";
import SalaryForm from "../pages/staff/SalaryForm";
import StaffCredential from "../pages/staff/StaffCredential";
import StudentTimetable from "../pages/student/StudentTimetable";
import StaffLayout from "../Component/layout/StaffLayout";
import StaffDashboad from "../pages/Dashboard/StaffDashboad";
import StudentsDashboad from "../pages/Dashboard/StudentsDashboad";
import ClassTest from "../pages/masters/ClassTest";
import MainExam from "../pages/masters/MainExam";

import AddClassMarks from "../pages/student/AddClassTest";
import ClassTestTable from "../pages/student/ClassTestTable";
import ForgotPassword from "../pages/auth/ForgotPassword";
import AdminRegister from "../pages/Admin/AdminRegister";
import AdminProfile from "../pages/Admin/AdminProfile";
import ChangePassword from "../pages/auth/ChangePassword";
import WhatsAppManager from "../pages/masters/MessagesMaster/WhatsAppManager";
import AddMedium from "../pages/masters/AddMedium";
import AddGender from "../pages/masters/AddGender";
import AddCategory from "../pages/masters/AddCategory";
import AddReligion from "../pages/masters/AddReligion";
import AddNationality from "../pages/masters/AddNationality";
import Holiday from "../pages/masters/Holiday";
import MainExamTable from "../pages/student/MainExamTable";
import StudentNoDues from "../pages/student/StudentNoDues";
import StudentPromote from "../pages/student/StudentPromote";
import PermissionLetter from "../pages/student/PermissionLetter";
import AddMainExamMarks from "../pages/student/AddMainExamMarks";
import AddNotification from "../pages/masters/Notification";
import ExamTimeTable from "../pages/student/ExamTimeTable";
import FeeDepositReport from "../pages/Reports/feedeposit";
import PeriodMaster from "../pages/masters/periodMaster";
import FeeDueReport from "../pages/Reports/feedue";
import ClassTestReport from "../pages/Reports/ClassTestReport";
import MainExamReport from "../pages/Reports/MainExamReport";
import AttendanceReport from "../pages/Reports/S_AttendanceMonth";
import AttendanceSingleReports from "../pages/Reports/S_AttendanceSingle";
import StudentAttendancetable from "../pages/student/StudentAttendncetable";
import StudentAttendances from "../pages/student/AttendanceSingle";
import NotFound from "../pages/NotFound";
import NotificationDetail from "../notification/NotificationDetail";
import NotificationPage from "../notification/NotificationPanel";
import StudentProfile from "../pages/student/StudentProfile";
import StudentDetailReport from "../pages/Reports/Studentdetailreport";
import AttendanceSingle from "../pages/student/AttendanceSingle";
import FeeDepositSingle from "../pages/student/FeeDepositSingle";
import SingleStudentClassTestReport from "../pages/student/SingleStudentClassTestReport";
import SingleStudentMainExamReport from "../pages/student/SingleStudentMainExamReport";
import StaffProfile from "../pages/staff/staffProfile";
import StaffTimetable from "../pages/staff/StaffTimetable";
import WorkUpload from "../pages/staff/workUpload";
import StudentWork from "../pages/student/StudentWork";
import Banner from "../pages/masters/Banner";
import SuperAdminLogin from "../pages/auth/SuperAdminLogin";
import StaffStudentAttendancetable from "../pages/staff/StaffStudentAtteddensTable";
import StaffStudentAttendance from "../pages/staff/StaffStudentAttendance";

const RoleBasedTimetable = () => {
  const role = (localStorage.getItem("authRole") || "").toLowerCase();
  if (role === "admin")
    return (
      <Layout>
        <StudentTimetable />
      </Layout>
    );
  if (role === "staff")
    return (
      <StaffLayout>
        <StaffTimetable />
      </StaffLayout>
    );
  if (role === "student")
    return (
      <StudentLayout>
        <StudentTimetable />
      </StudentLayout>
    );
  return (
    <div className="p-4">
      <StudentTimetable />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/WhatsApp_Template"
          element={
            <SuperAdminLayout>
              <WhatsAppManager />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/School_List"
          element={
            <SuperAdminLayout>
              <SchoolList />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <StudentLayout>
              <StudentsDashboad />
            </StudentLayout>
          }
        />
        <Route
          path="/student/work"
          element={
            <StudentLayout>
              <StudentWork />
            </StudentLayout>
          }
        />

        <Route
          path="/notification-pannel"
          element={
            <StudentLayout>
              <NotificationPage />
            </StudentLayout>
          }
        />

        <Route
          path="/notification/:id"
          element={
            <StudentLayout>
              <NotificationDetail />
            </StudentLayout>
          }
        />

        <Route
          path="/student-profile"
          element={
            <StudentLayout>
              <StudentProfile />
            </StudentLayout>
          }
        />

        <Route
          path="/students/attendance"
          element={
            <StudentLayout>
              <AttendanceSingle />
            </StudentLayout>
          }
        />

        <Route
          path="/student-fees"
          element={
            <StudentLayout>
              <FeeDepositSingle />
            </StudentLayout>
          }
        />

        <Route
          path="/student-classtest"
          element={
            <StudentLayout>
              <SingleStudentClassTestReport />
            </StudentLayout>
          }
        />
        <Route
          path="/student-mainexam"
          element={
            <StudentLayout>
              <SingleStudentMainExamReport />
            </StudentLayout>
          }
        />

        <Route
          path="/staff-profile"
          element={
            <StaffLayout>
              <StaffProfile />
            </StaffLayout>
          }
        />

        <Route
          path="/staff-edit"
          element={
            <StaffLayout>
              <StaffAdd />
            </StaffLayout>
          }
        />
        <Route
          path="/staff-student-attendance-table"
          element={
            <StaffLayout>
              <StaffStudentAttendancetable />
            </StaffLayout>
          }
        />
        <Route
          path="/staff-student-attendance"
          element={
            <StaffLayout>
              <StaffStudentAttendance />
            </StaffLayout>
          }
        />


        <Route
          path="/staff-addclass-test"
          element={
            <StaffLayout>
              <StaffAddClassTest />
            </StaffLayout>
          }
        />
        <Route
          path="/staff-classtest-table"
          element={
            <StaffLayout>
              <StaffClassTestTable />
            </StaffLayout>
          }
        />
        <Route
          path="staff-addmain-exam"
          element={
            <StaffLayout>
              <StaffAddMainExamMarks />
            </StaffLayout>
          }
        />
        <Route
          path="staff-exam-table"
          element={
            <StaffLayout>
              <StaffMainExamTable />
            </StaffLayout>
          }
        />
        <Route path="/timetable" element={<RoleBasedTimetable />} />

        {/* Staff Dashboard */}
        <Route
          path="/staff-dashboard"
          element={
            <StaffLayout>
              <StaffDashboad />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/notification-pannel"
          element={
            <StaffLayout>
              <NotificationPage />
            </StaffLayout>
          }
        />

        <Route
          path="/staff/timetable"
          element={
            <StaffLayout>
              <StaffTimetable />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/work-upload"
          element={
            <StaffLayout>
              <WorkUpload />
            </StaffLayout>
          }
        />

        {/* <Route path="/notification-panel" element={<NotificationPage />} /> */}
        <Route
          path="/notification/:id"
          element={
            <StaffLayout>
              <NotificationDetail />
            </StaffLayout>
          }
        />

        <Route path="/register-admin" element={<AdminRegister />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Login />} />


        <Route
          path="/superadmin"
          element={
            <SuperAdminLogin />
          }
        />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/student-timetable"
          element={
            <Layout>
              <StudentTimetable />
            </Layout>
          }
        />
        <Route
          path="/admin-profile"
          element={
            <Layout>
              <AdminProfile />
            </Layout>
          }
        />
        <Route
          path="/change-password"
          element={
            <Layout>
              <ChangePassword />
            </Layout>
          }
        />
        <Route
          path="/studentForm"
          element={
            <Layout>
              <StudentForm />
            </Layout>
          }
        />
        <Route
          path="/student-list"
          element={
            <Layout>
              <StudentList />
            </Layout>
          }
        />

        <Route
          path="/student-feeallot"
          element={
            <Layout>
              <StudentFeeAllot />
            </Layout>
          }
        />

        <Route
          path="/student-attendance"
          element={
            <Layout>
              <StudentAttendance />
            </Layout>
          }
        />
        <Route
          path="/student-attendance-table"
          element={
            <Layout>
              <StudentAttendancetable />
            </Layout>
          }
        />

        <Route
          path="/student-feefrom"
          element={
            <Layout>
              <StudentFeeForm />
            </Layout>
          }
        />
        <Route
          path="/student-subjectallot"
          element={
            <Layout>
              <StudentSubjectAllot />
            </Layout>
          }
        />
        <Route
          path="/student-subjectfrom"
          element={
            <Layout>
              <StudentSubjectForm />
            </Layout>
          }
        />
        <Route
          path="/student-feedepositfrom"
          element={
            <Layout>
              <StudentFeeDepositForm />
            </Layout>
          }
        />
        <Route
          path="/student-feedeposittable"
          element={
            <Layout>
              <StudentFeeDepositTable />
            </Layout>
          }
        />
        <Route
          path="/previous-feeform"
          element={
            <Layout>
              <PreviousDueFeeForm />
            </Layout>
          }
        />
        <Route
          path="/previous-feetable"
          element={
            <Layout>
              <PreviousDueFeeTable />
            </Layout>
          }
        />

        <Route
          path="/class-test"
          element={
            <Layout>
              <ClassTest />
            </Layout>
          }
        />
        <Route
          path="/main-exam"
          element={
            <Layout>
              <MainExam />
            </Layout>
          }
        />
        <Route
          path="/class-test-marks"
          element={
            <Layout>
              <AddClassMarks />
            </Layout>
          }
        />
        <Route
          path="/class-test-table"
          element={
            <Layout>
              <ClassTestTable />
            </Layout>
          }
        />
        <Route
          path="/main-exam-table"
          element={
            <Layout>
              <MainExamTable />
            </Layout>
          }
        />
        <Route
          path="/main-exam-marks"
          element={
            <Layout>
              <AddMainExamMarks />
            </Layout>
          }
        />
        <Route
          path="/add-medium"
          element={
            <Layout>
              <AddMedium />
            </Layout>
          }
        />

        <Route
          path="/add-category"
          element={
            <Layout>
              <AddCategory />
            </Layout>
          }
        />
        <Route
          path="/add-gender"
          element={
            <Layout>
              <AddGender />
            </Layout>
          }
        />

        <Route
          path="/add-religion"
          element={
            <Layout>
              <AddReligion />
            </Layout>
          }
        />
        <Route
          path="/add-nationality"
          element={
            <Layout>
              <AddNationality />
            </Layout>
          }
        />
        {/* ---------------   staff ----------------*/}

        <Route
          path="/staffadd"
          element={
            <Layout>
              <StaffAdd />
            </Layout>
          }
        />

        <Route
          path="/staff-salaryform"
          element={
            <Layout>
              <SalaryForm />
            </Layout>
          }
        />
        <Route
          path="/staff-credential"
          element={
            <Layout>
              <StaffCredential />
            </Layout>
          }
        />

        <Route
          path="/staffIdentity"
          element={
            <Layout>
              <IdentityForm />
            </Layout>
          }
        />
        <Route
          path="/staffBank"
          element={
            <Layout>
              <BankForm />
            </Layout>
          }
        />
        <Route
          path="/staff-list"
          element={
            <Layout>
              <StaffList />
            </Layout>
          }
        />
        <Route
          path="/staff-period-allot"
          element={
            <Layout>
              <StaffPeriodAllot />
            </Layout>
          }
        />

        <Route
          path="/add-session"
          element={
            <Layout>
              <AddSession />
            </Layout>
          }
        />
        <Route
          path="/add-class"
          element={
            <Layout>
              <AddClass />
            </Layout>
          }
        />

        <Route
          path="/class-section"
          element={
            <Layout>
              <ClassSection />
            </Layout>
          }
        />

        <Route
          path="/department"
          element={
            <Layout>
              <Department />
            </Layout>
          }
        />

        <Route
          path="/fee-head-list"
          element={
            <Layout>
              <FeeHeadList />
            </Layout>
          }
        />
        <Route
          path="/subject_add"
          element={
            <Layout>
              <Subject />
            </Layout>
          }
        />
        <Route
          path="/SubjectAssignGroupForm"
          element={
            <Layout>
              <SubjectAssignGroupForm />
            </Layout>
          }
        />
        <Route
          path="/subject_assignGroup"
          element={
            <Layout>
              <SubjectAssignGroupTable />
            </Layout>
          }
        />
        <Route
          path="/FeeFrequencyForm"
          element={
            <Layout>
              <FeeFrequencyForm />
            </Layout>
          }
        />
        <Route
          path="/fee-frequency"
          element={
            <Layout>
              <FeeFrequencyTable />
            </Layout>
          }
        />

        <Route
          path="/notification"
          element={
            <Layout>
              <AddNotification />
            </Layout>
          }
        />

        <Route
          path="/exam-timetable"
          element={
            <Layout>
              <ExamTimeTable />
            </Layout>
          }
        />

        <Route
          path="/no-dues"
          element={
            <Layout>
              <StudentNoDues />
            </Layout>
          }
        />
        <Route
          path="/student-promote"
          element={
            <Layout>
              <StudentPromote />
            </Layout>
          }
        />

        <Route
          path="/permission-letter"
          element={
            <Layout>
              <PermissionLetter />
            </Layout>
          }
        />

        <Route
          path="/period"
          element={
            <Layout>
              <PeriodMaster />
            </Layout>
          }
        />

        <Route
          path="/class-detail"
          element={
            <Layout>
              <ClassDetailTable />
            </Layout>
          }
        />


        <Route
          path="/class-fee"
          element={
            <Layout>
              <ClassFee />
            </Layout>
          }
        />
        <Route
          path="/class-feefrom"
          element={
            <Layout>
              <ClassFeeForm />
            </Layout>
          }
        />

        <Route
          path="/grade-system"
          element={
            <Layout>
              <GradeSystem />
            </Layout>
          }
        />
        <Route
          path="/division-system"
          element={
            <Layout>
              <DivisionSystem />
            </Layout>
          }
        />
        <Route
          path="/holiday"
          element={
            <Layout>
              <Holiday />
            </Layout>
          }
        />
        <Route
          path="/banneradd"
          element={
            <Layout>
              <Banner />
            </Layout>
          }
        />

        {/* ---------------------Reports--------------------------- */}

        <Route
          path="/feedepositreport"
          element={
            <Layout>
              <FeeDepositReport />
            </Layout>
          }
        />
        <Route
          path="/student-detail-report"
          element={
            <Layout>
              <StudentDetailReport />
            </Layout>
          }
        />
        <Route
          path="/test-report"
          element={
            <Layout>
              <ClassTestReport />
            </Layout>
          }
        />
        <Route
          path="/main-exam-report"
          element={
            <Layout>
              <MainExamReport />
            </Layout>
          }
        />
        <Route
          path="/mainexam-report"
          element={
            <Layout>
              <MainExamReport />
            </Layout>
          }
        />
        <Route
          path="/feeduereport"
          element={
            <Layout>
              <FeeDueReport />
            </Layout>
          }
        />
        <Route
          path="/AttendanceMonthReport"
          element={
            <Layout>
              <AttendanceReport />
            </Layout>
          }
        />
        <Route
          path="/AttendanceSingleReport"
          element={
            <Layout>
              <AttendanceSingleReports />
            </Layout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
