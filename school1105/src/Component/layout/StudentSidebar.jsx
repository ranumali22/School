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
    path: "/student-dashboard",
  },
  {
    title: "Time Table",
    icon: "courses",
    path: "/timetable",
  },
  {
    title: "Students",
    icon: "students",
    submenu: [
      { title: "Attendance", path: "/students/attendance" },
      { title: "Students Fees", path: "/student-fees" },
      { title: "Student Class Test ", path: "/student-classtest" },
      { title: "Student Main Exam", path: "/student-mainexam" },
    ],
  },

  {
    title: "Reports",
    icon: "reports",
    submenu: [
      { title: "Letter Head", path: "/letter-head" },
      { title: "Employee Report", path: "/employee-report" },
    ],
  },

  {
    title: "Notification",
    icon: "notification",
    path: "/notification-pannel",
  },
  {
    title: "Academic Work",
    icon: "courses",
    path: "/student/work",
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

const StudentSidebar = ({ mobileOpen, setMobileOpen }) => {
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
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="overlay show"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <div
        className={`sidebar 
          ${collapsed && !mobileOpen ? "collapsed" : ""} 
          ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          {(!collapsed || mobileOpen) && <h2>Student Dashboard</h2>}
          <Menu
            size={22}
            className="toggle-btn hidden md:block"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Menu */}
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
                    <div className="menu-left">
                      {iconMap[menu.icon]}
                      {(!collapsed || mobileOpen) && <span>{menu.title}</span>}
                    </div>

                    {(!collapsed || mobileOpen) && (
                      <ChevronDown
                        size={16}
                        className={`arrow ${openMenu === menu.title ? "rotate" : ""
                          }`}
                      />
                    )}
                  </div>

                  {/* Submenu */}
                  {openMenu === menu.title && (!collapsed || mobileOpen) && (
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
                  <div className="menu-left">
                    {iconMap[menu.icon]}
                    {(!collapsed || mobileOpen) && <span>{menu.title}</span>}
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

export default StudentSidebar;
