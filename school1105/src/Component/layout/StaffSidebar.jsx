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
  Bell,
} from "lucide-react";

/* ================= MENU DATA ================= */

const menuData = [
  {
    title: "Dashboard",
    icon: "dashboard",
    path: "/staff-dashboard",
  },
  {
    title: "Students",
    icon: "students",
    submenu: [
      { title: "Attendance", path: "/staff-student-attendance-table" },
      { title: "Class Test", path: "/staff-classtest-table" },
      { title: "Main Exam ", path: "/staff-exam-table" },
      // { title: "Students Bus Fare", path: "/student-bus-rent" },
      // { title: "Student Internal Exam Results", path: "/student-result" },
      // { title: "Student Main Exam Results", path: "/student-main-marks" },
      // { title: "Permission Letter", path: "/permission-letter" },
      // { title: "Exam Roll No.", path: "/generate-roll-no" },
      // { title: "Mark Sheet", path: "/main-exam-result" },
      // { title: "Time Table", path: "/staff/timetable" },
    ],
  },

  {
    title: "Time Table",
    icon: "courses",
    path: "/timetable",
  },

  {
    title: "Notification",
    icon: "notification",
    path: "/staff/notification-pannel",
  },
  {
    title: "Academic Work",
    icon: "courses",
    path: "/staff/work-upload",
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
  notification: <Bell size={20} />,
};

/* ================= COMPONENT ================= */

const StaffSidebar = ({ mobileOpen, setMobileOpen }) => {
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
                        className={`arrow ${openMenu === menu.title ? "rotate" : ""
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

export default StaffSidebar;
