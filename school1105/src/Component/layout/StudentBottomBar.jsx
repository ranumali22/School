import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ClipboardCheck,
  Grid3X3,
  Home,
  Receipt,
  X,
} from "lucide-react";
import { studentMenuData } from "./StudentSidebar";

const bottomItems = [
  {
    title: "Time Table",
    path: "/timetable",
    icon: <CalendarDays size={21} />,
    tone: "sky",
  },
  {
    title: "Fees",
    path: "/student-fees",
    icon: <Receipt size={21} />,
    tone: "emerald",
  },
  {
    title: "Home",
    path: "/student-dashboard",
    icon: <Home size={24} />,
    tone: "home",
    center: true,
  },
  {
    title: "Class Test",
    path: "/student-classtest",
    icon: <ClipboardCheck size={21} />,
    tone: "amber",
  },
];

const extraItems = studentMenuData
  .flatMap((menu) => (menu.submenu ? menu.submenu : menu))
  .filter(
    (item) => !bottomItems.some((bottomItem) => bottomItem.path === item.path),
  );

const StudentBottomBar = () => {
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

      <nav className="student-bottom-bar" aria-label="Student mobile navigation">
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
          aria-label="Open more student menu"
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

export default StudentBottomBar;
