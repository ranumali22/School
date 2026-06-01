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
    title: "All School",
    icon: "dashboard",
    path: "/School_List",
  },
  {
    title: "WhatsApp Template",
    icon: "dashboard",
    path: "/WhatsApp_Template",
  },


  {
    title: "Reports",
    icon: "reports",
    submenu: [
      { title: "Letter Head", path: "/letter-head" },
      { title: "Employee Report", path: "/employee-report" },
    ],
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

const SuperAdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  /* ===== Auto open correct submenu ===== */
  useEffect(() => {
    menuData.forEach((menu) => {
      if (menu.submenu) {
        const match = menu.submenu.find(
          (sub) => sub.path === location.pathname
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
        className={`sidebar shrink-0
        ${collapsed ? "collapsed" : ""} 
         ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          {!collapsed && <h2>School Admin</h2>}
          <Menu
            size={22}
            className="toggle-btn"
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

                  {/* Submenu */}
                  {openMenu === menu.title && !collapsed && (
                    <ul className="submenu">
                      {menu.submenu.map((sub, i) => (
                        <li key={i}>
                          <NavLink
                            end
                            to={sub.path}
                            onClick={() => setMobileOpen?.(false)}
                            className={({ isActive }) =>
                              isActive
                                ? "submenu-item active"
                                : "submenu-item"
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

export default SuperAdminSidebar;