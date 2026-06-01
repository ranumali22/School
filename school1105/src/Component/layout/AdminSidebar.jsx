import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ChevronDown,
  Menu,
} from "lucide-react";

/* ================= MENU DATA ================= */

const menuData = [
  {
    title: "Dashboard",
    icon: "dashboard",
    path: "/dashboard",
  },
  {
    title: "Students",
    icon: "students",
    submenu: [
      { title: "Student Directory", path: "/student-list" },
      { title: "Subject Allot", path: "/student-subjectallot" },
      { title: "Fee Allot", path: "/student-feeallot" },
      { title: "Attendance", path: "/student-attendance-table" },
      { title: "Students Fees", path: "/student-feedeposittable" },
      { title: "Previous Sessions Due Fees", path: "/previous-feetable" },
      { title: "Student Promote", path: "/student-promote" },
      { title: "Student Class Test", path: "/class-test-table" },
      { title: "Student Main Exam ", path: "/main-exam-table" },
      { title: "Permission Letter", path: "/permission-letter" },
      { title: "Students Bus Fare", path: "student-bus-fare" },

      { title: "Exam Roll No.", path: "exam-rollNo" },
      { title: "Mark Sheet", path: "/mark-sheet" },
      { title: "Student Timetable", path: "/student-timetable" },
      { title: "Exam Time Table", path: "/exam-timetable" },
      { title: "No Dues Certificate", path: "/no-dues" },
    ],
  },
  {
    title: "Staff",
    icon: "teachers",
    submenu: [
      { title: "All Staff", path: "/staff-list" },
         { title: "Staff Credentials", path: "/staff-credential" },
      { title: "Staff Attendance", path: "/emp-attendance" },
      { title: "Attendance Report", path: "/attendance-report" },
      { title: "Generate Salary", path: "/generate-salary" },
      { title: "Staff Ledger", path: "/staff-ledger" },
      { title: "Staff Period Allot", path: "/staff-period-allot" },
    ],
  },

  {
    title: "Reports",
    icon: "reports",
    submenu: [
      { title: "Student Detail Report", path: "/student-detail-report" },
      { title: "Class Test Report", path: "/test-report" },
      { title: "Main Exam Report", path: "/mainexam-report" },
      { title: "Fee Deposit Report", path: "/feedepositreport" },
      { title: "Fee Due Report", path: "/feeduereport" },
      { title: "Attendance Month Report", path: "/AttendanceMonthReport" },
      { title: "Attendance Single Report", path: "/AttendanceSingleReport" },
    ],
  },
  {
    title: "Master",
    icon: "master",
    submenu: [
      { title: "Roll Master", path: "/add-roll-master" },
      { title: "Session", path: "/add-session" },
      { title: "Medium", path: "/add-medium" },
      { title: "Gender", path: "/add-gender" },
      { title: "Category", path: "/add-category" },
      { title: "Religion", path: "/add-religion" },
      { title: "Nationality", path: "/add-nationality" },
      { title: "Departments", path: "/department" },
      { title: "Add Class", path: "/add-class" },
      { title: "Class Section", path: "/class-section" },
      { title: "Class Details", path: "/class-detail" },

      { title: "Subject", path: "/subject_add" },
      { title: "Subject Assign Group", path: "/subject_assignGroup" },
      { title: "Grade System", path: "/grade-system" },
      { title: "Division", path: "/division-system" },
      { title: "Class Test", path: "/class-test" },
      { title: "Main Exam", path: "/main-exam" },
      { title: "Holiday", path: "/holiday" },
      { title: "Notification", path: "/notification" },
      { title: "Period Master", path: "/period" },
      { title: "Bus Stations", path: "/Bus-station" },
      { title: "Bus", path: "/add-bus" },
      { title: "Bus Root Station", path: "/add-bus-root-station" },
    ],
  },
  {
    title: "Fee Master",
    icon: "master",
    submenu: [
      // { title: "Fee Frequency", path: "/fee-frequency" },
      { title: "Fee Heads", path: "/fee-head-list" },
      { title: "Class Fee", path: "/class-fee" },
    ],
  },
  {
    title: "Banner",
    icon: "dashboard",
    path: "/banneradd",
  },
];

/* ================= ICON MAP ================= */

const iconMap = {
  dashboard: <LayoutDashboard size={20} />,
  students: <Users size={20} />,
  teachers: <GraduationCap size={20} />,
  courses: <BookOpen size={20} />,
  reports: <ClipboardList size={20} />,
  master: <GraduationCap size={20} />,
};

/* ================= COMPONENT ================= */

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  /* ===== Auto open correct submenu ===== */
  useEffect(() => {
    menuData.forEach((menu) => {
      if (menu.submenu) {
        const match = menu.submenu.find(
          (sub) => sub.path === location.pathname,
        );
        if (match) {
          setOpenMenu(menu.title);
        }
      }
    });
  }, [location.pathname]);

  return (
    <>
      {mobileOpen && (
        <div
          className="overlay show"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <div
        className={`sidebar shrink-0
        ${collapsed ? "collapsed" : ""} 
         ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          {!collapsed && <h4>School Admin</h4>}
          <Menu
            size={22}
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>

        <ul className="menu">
          {menuData.map((menu, index) => (
            <li key={index}>
              {menu.submenu ? (
                <>
                  <div
                    className="menu-item"
                    onClick={() =>
                      setOpenMenu(openMenu === menu.title ? null : menu.title)
                    }
                  >
                    <div className="menu-left flex items-center gap-3">
                      {iconMap[menu.icon]}
                      {!collapsed && <span>{menu.title}</span>}
                    </div>

                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`arrow ${
                          openMenu === menu.title ? "rotate" : ""
                        }`}
                      />
                    )}
                  </div>

                  {openMenu === menu.title && !collapsed && (
                    <ul className="submenu">
                      {menu.submenu.map((sub, i) => (
                        <li key={i}>
                          <NavLink
                            end
                            to={sub.path}
                            onClick={() => setMobileOpen?.(false)}
                            className={({ isActive }) =>
                              isActive ? "submenu-item active" : "submenu-item"
                            }
                          >
                            {sub.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  end
                  to={menu.path}
                  onClick={() => setMobileOpen?.(false)}
                  className={({ isActive }) =>
                    isActive ? "menu-item active" : "menu-item"
                  }
                >
                  <div className="menu-left flex items-center gap-3">
                    {iconMap[menu.icon]}
                    {!collapsed && <span>{menu.title}</span>}
                  </div>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
