import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ClipboardCheck,
  Grid3X3,
  Home,
  Users,
  X,
} from "lucide-react";

const staffMenuData = [
  {
    title: "Dashboard",
    icon: "dashboard",
    path: "/staff-dashboard",
  },
  {
    title: "Students ",
    icon: "students",
    submenu: [
      { title: "Attendance", path: "/staff-student-attendance-table" },
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

const bottomItems = [
  {
    title: "Schedule",
    path: "/timetable",
    icon: <CalendarDays size={21} />,
    tone: "sky",
  },
  {
    title: "Attendance",
    path: "/students/attendance",
    icon: <Users size={21} />,
    tone: "emerald",
  },
  {
    title: "Home",
    path: "/staff-dashboard",
    icon: <Home size={24} />,
    tone: "home",
    center: true,
  },
  {
    title: "Academic Work",
    path: "/staff/work-upload",
    icon: <ClipboardCheck size={21} />,
    tone: "amber",
  },
];

const extraItems = staffMenuData
  .flatMap((menu) => (menu.submenu ? menu.submenu : menu))
  .filter(
    (item) => !bottomItems.some((bottomItem) => bottomItem.path === item.path),
  );

const StaffBottomBar = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  const isMoreActive = useMemo(
    () => extraItems.some((item) => item.path === location.pathname),
    [location.pathname],
  );

  const closeMore = () => setMoreOpen(false);

  return (
    <>
      {moreOpen && (
        <div
          className="student-bottom-overlay"
          onClick={closeMore}
          aria-hidden="true"
        />
      )}

      <div className={`student-more-sheet ${moreOpen ? "show" : ""}`}>
        <div className="student-more-header">
          <span>More</span>
          <button type="button" onClick={closeMore} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="student-more-grid">
          {extraItems.map((item) => (
            <NavLink
              key={item.path}
              end
              to={item.path}
              onClick={closeMore}
              className={({ isActive }) =>
                isActive ? "student-more-link active" : "student-more-link"
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      </div>

      <nav className="student-bottom-bar" aria-label="Staff mobile navigation">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            end
            to={item.path}
            onClick={closeMore}
            className={({ isActive }) =>
              [
                "student-bottom-item",
                `tone-${item.tone}`,
                item.center ? "home-center" : "",
                isActive ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span className="student-bottom-icon">{item.icon}</span>
            <span>{item.title}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen((prev) => !prev)}
          className={`student-bottom-item tone-purple ${isMoreActive || moreOpen ? "active" : ""}`}
          aria-expanded={moreOpen}
          aria-label="Open more staff menu"
        >
          <span className="student-bottom-icon">
            <Grid3X3 size={21} />
          </span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

export default StaffBottomBar;
