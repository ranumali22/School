import React, { useState, useEffect, useMemo } from "react";
import { localurl } from "../../api/api";
import { ClassSelect } from "../../Component/common/FloatingInput";
import { showError } from "../../Component/common/alert";
import { FaSearch, FaFilePdf, FaClipboardList } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ClassTestReport = () => {
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState("All");
  const [appliedTest, setAppliedTest] = useState("All");
  const [allTestsList, setAllTestsList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classTests, setClassTests] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);

  const school_id = localStorage.getItem("school_id");

  const getSessionId = () => {
    const sId = localStorage.getItem("session_id");
    if (sId && sId !== "undefined" && sId !== "null") return sId;
    try {
      const sData = JSON.parse(localStorage.getItem("session_data") || "{}");
      if (sData && sData.id) return String(sData.id);
    } catch (e) { }
    return "";
  };
  const session_id = getSessionId();

  const getOffsetDate = (dateStr, days) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (school_id) {
      fetchClassSections();
      fetchSchoolInfo();
      if (session_id) {
        fetchClassTests();
      }
    }
  }, [school_id, session_id]);

  const fetchSchoolInfo = () => {
    fetch(`${localurl}all_school`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.row) {
          const currentSchool = data.row.find(
            (s) => String(s.id) === String(school_id),
          );
          setSchoolInfo(currentSchool);
        }
      })
      .catch(console.error);
  };

  // const fetchClassTests = () => {
  //   fetch(`${localurl}class_test/${school_id}/${session_id}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.success && data.row) {

  //         const activeTests = data.row.filter((t) => t.status === "Active");

  //         const formattedTests = activeTests.map((t) => ({
  //           ...t,
  //           test_name: t.test_name
  //             ? t.test_name.charAt(0).toUpperCase() + t.test_name.slice(1)
  //             : "Test",
  //         }));
  //         setAllTestsList(formattedTests);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching all class tests:", err);
  //     });
  // };


  const fetchClassTests = () => {
    fetch(`${localurl}class_test/${school_id}/${session_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.row)) {

          const formattedTests = data.row
            .filter((t) => t.status === "Active")
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((t) => ({
              ...t,
              test_name: t.test_name
                ? t.test_name.charAt(0).toUpperCase() + t.test_name.slice(1)
                : "Test",
            }));

          setAllTestsList(formattedTests);
        }
      })
      .catch((err) => {
        console.error("Error fetching all class tests:", err);
      });
  };

  const fetchClassSections = () => {
    fetch(`${localurl}class_section/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || "") + " " + (a.section || "");
                const nameB = (b.class_name || "") + " " + (b.section || "");
                return nameA.localeCompare(nameB);
              }
              return diff;
            });
          setSectionList(activeData);
        }
      })
      .catch((err) => {
        console.error("Error fetching class sections:", err);
        showError("Failed to fetch class sections");
      });
  };

  const handleSearch = () => {
    if (!selectedClass || !selectedTest || !fromDate || !toDate) {
      showError(
        "Please select all filters (Class Section, Test, From Date, and To Date) first",
      );
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      showError("Date range cannot exceed 30 days");
      return;
    }

    setLoading(true);
    setAppliedTest(selectedTest);
    let url = `${localurl}class_test_section_report/${school_id}/${session_id}/${selectedClass}`;

    const params = new URLSearchParams();
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.students || []);
          setSubjects(data.subjects || []);
          setClassTests(data.classTests || []);
          setMarksData(data.marksData || []);
        } else {
          showError(data.message || "Failed to fetch report data");
          setStudents([]);
          setSubjects([]);
          setClassTests([]);
          setMarksData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching report:", err);
        showError("Server error occurred while fetching report");
        setLoading(false);
      });
  };

  // Create O(1) lookup table for marks
  const marksLookup = useMemo(() => {
    const lookup = {};
    marksData.forEach((item) => {
      const key = `${item.student_id}-${item.subject_id}-${item.test_id}`;
      lookup[key] = {
        student_marks: item.student_marks,
        max_marks: item.max_marks,
      };
    });
    return lookup;
  }, [marksData]);

  const displayTests = useMemo(() => {
    if (appliedTest === "All") return classTests;
    return classTests.filter((t) => String(t.id) === String(appliedTest));
  }, [classTests, appliedTest]);

  // For each subject, find which tests have at least one valid mark entered
  const visibleTestsBySubject = useMemo(() => {
    const map = {};
    subjects.forEach((sub) => {
      const subTests = displayTests.filter((test) => {
        return students.some((student) => {
          const key = `${student.id}-${sub.id}-${test.id}`;
          const score = marksLookup[key];
          return (
            score &&
            score.student_marks !== undefined &&
            score.student_marks !== null &&
            String(score.student_marks).trim() !== "" &&
            String(score.student_marks).trim() !== "-"
          );
        });
      });
      map[sub.id] = subTests;
    });
    return map;
  }, [students, subjects, displayTests, marksLookup]);

  // Filter subjects to only those that have at least one test with entered marks
  const visibleSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const subTests = visibleTestsBySubject[sub.id];
      return subTests && subTests.length > 0;
    });
  }, [subjects, visibleTestsBySubject]);

  // Helper to get max marks for a combination from marksData
  const getMaxMarks = (subjectId, testId) => {
    const record = marksData.find(
      (m) => m.subject_id === subjectId && m.test_id === testId,
    );
    return record ? record.max_marks : null;
  };

  // Calculate total marks and ranks for all students based on currently loaded criteria
  const studentTotalsAndRanks = useMemo(() => {
    const studentTotals = students.map((student) => {
      let totalObtained = 0;
      let totalMax = 0;
      visibleSubjects.forEach((sub) => {
        const subTests = visibleTestsBySubject[sub.id] || [];
        subTests.forEach((test) => {
          const key = `${student.id}-${sub.id}-${test.id}`;
          const score = marksLookup[key];
          if (
            score &&
            score.student_marks !== undefined &&
            score.student_marks !== null &&
            String(score.student_marks).trim() !== "" &&
            String(score.student_marks).trim() !== "-"
          ) {
            totalObtained += Number(score.student_marks) || 0;
          }
          const max = getMaxMarks(sub.id, test.id);
          if (max) {
            totalMax += Number(max);
          }
        });
      });
      return {
        studentId: student.id,
        totalObtained,
        totalMax,
      };
    });

    const sorted = [...studentTotals].sort(
      (a, b) => b.totalObtained - a.totalObtained,
    );

    const ranks = {};
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].totalObtained < sorted[i - 1].totalObtained) {
        currentRank = i + 1;
      }
      ranks[sorted[i].studentId] = currentRank;
    }

    const totalsLookup = {};
    studentTotals.forEach((item) => {
      totalsLookup[item.studentId] = {
        obtained: item.totalObtained,
        max: item.totalMax,
      };
    });

    return {
      totals: totalsLookup,
      ranks,
    };
  }, [students, visibleSubjects, visibleTestsBySubject, marksLookup]);

  // Filtered class tests to display based on selected test filter

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

  const getBase64ImageFromUrl = async (url) => {
    if (!url) return null;
    try {
      if (url.startsWith("data:")) return url;

      let targetUrl = url;
      if (!url.startsWith("http") && !url.startsWith("data:")) {
        const serverBase = (
          import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
        ).replace(/\/$/, "");
        targetUrl = `${serverBase}/uploads/${url}`;
      }

      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();

      if (!blob.type.startsWith("image/")) {
        throw new Error("Response is not an image");
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Logo fetch failed", e);
      return null;
    }
  };

  const exportPDF = async () => {
    if (filteredStudents.length === 0) {
      showError("No data to export");
      return;
    }

    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      const school =
        schoolInfo || JSON.parse(localStorage.getItem("school") || "{}");
      const classObj = sectionList.find(
        (c) => String(c.id) === String(selectedClass),
      );
      const className = classObj
        ? `${classObj.class_name} - ${classObj.section}`
        : "N/A";

      const pageWidth = doc.internal.pageSize.width;
      let currentY = 15;

      const logoUrl = school?.upload_logo;
      if (logoUrl) {
        const base64Logo = await getBase64ImageFromUrl(logoUrl);
        if (base64Logo) {
          try {
            const img = new Image();
            img.src = base64Logo;
            const loaded = await new Promise((resolve) => {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            });
            if (loaded) {
              const logoHeight = 15;
              const ratio = img.width / img.height;
              const logoWidth = logoHeight * ratio;
              doc.addImage(
                base64Logo,
                "PNG",
                (pageWidth - logoWidth) / 2,
                currentY,
                logoWidth,
                logoHeight,
              );
              currentY += logoHeight + 9;
            }
          } catch (e) { }
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      const schoolName = school?.school_name?.toUpperCase() || "SCHOOL NAME";
      doc.text(schoolName, pageWidth / 2, currentY, { align: "center" });

      currentY += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(school?.address || "", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 4;
      doc.text(
        `Contact: ${school?.mobile_no || "-"} | Reg No: ${school?.registration_no || "-"}`,
        pageWidth / 2,
        currentY,
        { align: "center" },
      );

      currentY += 6;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);

      currentY += 8;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("CLASS TEST  REPORT", pageWidth / 2, currentY, {
        align: "center",
      });

      // Helper to format date strings
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-");
        return `${d}-${m}-${y}`;
      };

      // Helper to load session name
      const getSessionName = () => {
        try {
          const sData = JSON.parse(
            localStorage.getItem("session_data") || "{}",
          );
          return sData.session_name || "Current";
        } catch (e) {
          return "Current";
        }
      };

      currentY += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Class Section: ${className}`, 15, currentY);
      doc.text(`Session: ${getSessionName()}`, pageWidth / 2, currentY, { align: "center" });

      doc.setFont("helvetica", "normal");
      const dateRangeText = `Date: ${fromDate ? formatDate(fromDate) : "All"} to ${toDate ? formatDate(toDate) : "Today"}`;
      doc.text(dateRangeText, pageWidth - 15, currentY, { align: "right" });

      currentY += 8;

      // Helper to convert text to Title Case
      const formatTitleCase = (str) => {
        if (!str) return "";
        return str
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      };

      const firstHeaderRow = [
        {
          content: "", // Draw custom diagonal header in didDrawCell
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center",
            fillColor: [8, 96, 196]
          },
        },
      ];

      const secondHeaderRow = [];

      visibleSubjects.forEach((sub) => {
        const subTests = visibleTestsBySubject[sub.id] || [];
        firstHeaderRow.push({
          content: formatTitleCase(sub.subject_name),
          colSpan: subTests.length,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: [8, 96, 196],
            textColor: 255,
          },
        });

        subTests.forEach((test) => {
          const max = getMaxMarks(sub.id, test.id);
          const maxLabel = max ? ` (${max})` : "";
          secondHeaderRow.push({
            content: `${formatTitleCase(test.test_name)}${maxLabel}`,
            styles: {
              halign: "center",
              fontSize: 7.5,
              fillColor: [248, 250, 252], // bg-[#f8fafc]
              textColor: [51, 65, 85], // text-slate-700
              fontStyle: "bold",
            },
          });
        });
      });

      // Append Total Marks and Rank headers to the first row (span 1 row)
      firstHeaderRow.push(
        {
          content: "Total Marks",
          rowSpan: 1,
          styles: {
            valign: "middle",
            halign: "center",
            fontStyle: "bold",
            fillColor: [8, 96, 196],
            textColor: 255,
          },
        },
        {
          content: "Rank",
          rowSpan: 1,
          styles: {
            valign: "middle",
            halign: "center",
            fontStyle: "bold",
            fillColor: [8, 96, 196],
            textColor: 255,
          },
        },
      );

      // Add two empty cells to the second header row for Total Marks and Rank
      secondHeaderRow.push(
        {
          content: "",
          styles: {
            fillColor: [248, 250, 252], // bg-[#f8fafc]
          },
        },
        {
          content: "",
          styles: {
            fillColor: [248, 250, 252], // bg-[#f8fafc]
          },
        },
      );

      const bodyRows = filteredStudents.map((student) => {
        const row = [formatTitleCase(student.studentName)];

        visibleSubjects.forEach((sub) => {
          const subTests = visibleTestsBySubject[sub.id] || [];
          subTests.forEach((test) => {
            const key = `${student.id}-${sub.id}-${test.id}`;
            const score = marksLookup[key];
            row.push(score ? `${score.student_marks}` : "-");
          });
        });

        // Add calculated Total Marks and Rank values to row
        const total = studentTotalsAndRanks.totals[student.id];
        const rank = studentTotalsAndRanks.ranks[student.id];
        row.push(total ? `${total.obtained} / ${total.max}` : "0");
        row.push(rank ? `${rank}` : "-");

        return row;
      });

      autoTable(doc, {
        startY: currentY,
        head: [firstHeaderRow, secondHeaderRow],
        body: bodyRows,
        theme: "grid",
        headStyles: {
          fillColor: [8, 96, 196],
          textColor: 255,
          fontSize: 8.5,
          cellPadding: 3,
          valign: "middle",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
          cellPadding: 3.5,
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [250, 251, 253],
        },
        styles: {
          overflow: "linebreak",
          lineColor: [203, 213, 225], // slate-300 borders
          lineWidth: 0.4,
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          // Draw diagonal line and labels in the first header cell to match UI
          if (data.section === "head" && data.column.index === 0 && data.row.index === 0) {
            const { x, y, width, height } = data.cell;

            // Draw diagonal line
            data.doc.setDrawColor(255, 255, 255);
            data.doc.setLineWidth(0.35);
            data.doc.line(x, y, x + width, y + height);

            // Draw SUB (Top Right)
            data.doc.setFont("helvetica", "bold");
            data.doc.setFontSize(7.5);
            data.doc.setTextColor(219, 234, 254); // text-blue-100
            data.doc.text("SUB", x + width - 3, y + 4.5, { align: "right" });

            // Draw STU (Bottom Left)
            data.doc.text("STU", x + 3, y + height - 3.5, { align: "left" });
          }
        }
      });

      doc.save(`ClassTest_Report_Class_${className.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    }
  };

  const getRankBadge = (rank) => {
    if (!rank) return "-";
    return (
      <span className="text-slate-500 font-semibold text-sm">
        {rank}
      </span>
    );
  };

  return (
    <section className="bg-white rounded-t-2xl max-w-full p-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pt-1">
        {/* Title */}
        <h1 className="text-2xl font-bold shrink-0 md:mt-2">
          Class Test Report
        </h1>

        {/* Controls Container */}
        <div className="flex flex-wrap items-end gap-3 flex-grow justify-end mt-2 md:mt-3">
          {/* Class Section */}
          <div className="w-full sm:w-[180px] shrink-0">
            <ClassSelect
              label="Class Section"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { label: "---Select Class Section---", value: "" },
                ...sectionList.map((record) => ({
                  label: `${record.class_name} - ${record.section}`,
                  value: record.id,
                })),
              ]}
            />
          </div>

          {/* Select Test Filter Dropdown */}
          <div className="w-full sm:w-[160px] flex flex-col relative shrink-0">
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full border rounded-xl px-4 py-2 text-sm text-slate-900 outline-none border-slate-300 focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10 h-[42px] bg-white appearance-none cursor-pointer pr-8 font-medium shadow-sm"
            >
              <option value="All">All Tests</option>
              {allTestsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.test_name}
                </option>
              ))}
            </select>
            <span className="absolute left-3 -top-2 bg-white px-1 text-[12px] font-medium text-slate-700">
              Select Test
            </span>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* From Date */}
          <div className="w-full sm:w-[140px] flex flex-col relative shrink-0">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              min={toDate ? getOffsetDate(toDate, -30) : undefined}
              max={toDate ? toDate : undefined}
              className="peer w-full border rounded-xl px-3 py-2 text-sm text-slate-900 outline-none border-slate-300 focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10 h-[42px] font-medium shadow-sm"
            />
            <span className="absolute left-3 -top-2 bg-white px-1 text-[12px] font-medium text-slate-700">
              From Date
            </span>
          </div>

          {/* To Date */}
          <div className="w-full sm:w-[140px] flex flex-col relative shrink-0">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate ? fromDate : undefined}
              max={fromDate ? getOffsetDate(fromDate, 30) : undefined}
              className="peer w-full border rounded-xl px-3 py-2 text-sm text-slate-900 outline-none border-slate-300 focus:border-[#0860C4] focus:ring-2 focus:ring-blue-500/10 h-[42px] font-medium shadow-sm"
            />
            <span className="absolute left-3 -top-2 bg-white px-1 text-[12px] font-medium text-slate-700">
              To Date
            </span>
          </div>

          {/* Find Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={!selectedClass || !selectedTest || !fromDate || !toDate}
            className="w-full sm:w-[80px] bg-[#0860C4] disabled:bg-slate-300 disabled:cursor-not-allowed text-white h-[42px] rounded-xl font-semibold hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
          >
            Find
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
          {/* Search */}
          <div className="flex items-center border rounded-xl px-3 h-[42px] gap-2 w-full sm:w-[320px] focus-within:border-[#0860C4] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all bg-white shadow-sm">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search student by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none w-full text-sm bg-transparent"
            />
          </div>

          {/* Export PDF Button */}
          <button
            onClick={exportPDF}
            disabled={filteredStudents.length === 0}
            className="flex gap-2 justify-center bg-[#0860C4] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl shadow-sm items-center hover:bg-blue-700 transition-colors h-[42px] w-full sm:w-[130px] text-sm font-medium cursor-pointer shrink-0"
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      )}

      {/* Table grid / Loader / Placeholder */}
      {loading ? (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white">
            <div className="w-10 h-10 border-4 border-[#0860C4] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-semibold">
              Generating report matrix...
            </p>
          </div>
        </div>
      ) : students.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm mt-4">
          {filteredStudents.length > 0 ? (
            <table className="min-w-full table-auto border-separate border-spacing-0">
              <thead>
                {/* Top Level Subject Row */}
                <tr className="bg-[#0860C4] text-white text-center">
                  <th
                    rowSpan={2}
                    className="relative px-3 py-3 bg-[#0860C4] text-white w-[130px] min-w-[130px] max-w-[130px] h-[78px] align-middle sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] overflow-hidden border-t border-l border-r border-b border-slate-300"
                  >
                    {/* Diagonal Split Line */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="100%"
                        y2="100%"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="1.2"
                      />
                    </svg>

                    {/* Top Right Label (Subject) */}
                    <span className="absolute top-2.5 right-3 text-[11px] font-extrabold uppercase tracking-wider text-blue-100 select-none">
                      Sub
                    </span>

                    {/* Bottom Left Label (Student) */}
                    <span className="absolute bottom-2.5 left-3 text-[11px] font-extrabold uppercase tracking-wider text-blue-100 select-none">
                      Stu
                    </span>
                  </th>
                  {visibleSubjects.map((sub) => (
                    <th
                      key={sub.id}
                      colSpan={visibleTestsBySubject[sub.id]?.length || 1}
                      className="px-3 py-2 font-medium text-[14px] bg-[#0860C4] text-center tracking-wide border-t border-r border-b border-slate-300"
                    >
                      {sub.subject_name}
                    </th>
                  ))}
                  <th
                    className="px-3 py-2 font-semibold text-[14px] bg-[#0860C4] text-white text-center align-middle border-t border-r border-b border-slate-300 min-w-[100px]"
                  >
                    Total Marks
                  </th>
                  <th
                    className="px-3 py-2 font-semibold text-[14px] bg-[#0860C4] text-white text-center align-middle border-t border-r border-b border-slate-300 min-w-[80px]"
                  >
                    Rank
                  </th>
                </tr>

                {/* Sub Header Test Row */}
                <tr className="bg-[#f8fafc] text-slate-700 text-center">
                  {visibleSubjects.map((sub) =>
                    (visibleTestsBySubject[sub.id] || []).map((test) => {
                      const max = getMaxMarks(sub.id, test.id);
                      return (
                        <th
                          key={`${sub.id}-${test.id}`}
                          className="px-2 py-2 font-medium text-[12px] min-w-[100px] text-center bg-[#f8fafc] border-r border-b border-slate-300"
                        >
                          <div
                            className="text-slate-800 font-semibold text-xs"
                            title={test.test_name}
                          >
                            {test.test_name} {max !== null ? `(${max})` : ""}
                          </div>
                        </th>
                      );
                    }),
                  )}
                  {/* Empty cells under Total Marks and Rank in sub-header row */}
                  <th className="bg-[#f8fafc] border-r border-b border-slate-300"></th>
                  <th className="bg-[#f8fafc] border-r border-b border-slate-300"></th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-100 transition-colors group"
                  >
                    <td
                      className="px-3 py-2 font-semibold text-slate-800 text-sm sticky left-0 bg-white group-hover:bg-gray-100 transition-colors z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[130px] min-w-[130px] max-w-[130px] truncate border-l border-r border-b border-slate-300"
                      title={student.studentName}
                    >
                      {student.studentName}
                    </td>
                    {visibleSubjects.map((sub) =>
                      (visibleTestsBySubject[sub.id] || []).map((test) => {
                        const key = `${student.id}-${sub.id}-${test.id}`;
                        const score = marksLookup[key];
                        return (
                          <td
                            key={`${sub.id}-${test.id}`}
                            className="p-2 text-center align-middle border-r border-b border-slate-300"
                          >
                            {score ? (
                              <span className="font-semibold text-slate-800 text-sm">
                                {score.student_marks}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-medium">
                                -
                              </span>
                            )}
                          </td>
                        );
                      }),
                    )}
                    <td className="p-2 text-center align-middle font-semibold border-r border-b border-slate-300 bg-slate-50/50 group-hover:bg-gray-100 transition-colors">
                      <span className="text-slate-900 font-bold">{studentTotalsAndRanks.totals[student.id]?.obtained}</span>
                      <span className="text-slate-400 text-xs font-normal"> / {studentTotalsAndRanks.totals[student.id]?.max}</span>
                    </td>
                    <td className="p-2 text-center align-middle border-r border-b border-slate-300 bg-slate-50/50 group-hover:bg-gray-100 transition-colors">
                      {getRankBadge(studentTotalsAndRanks.ranks[student.id])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium text-sm bg-white">
              No students match your search query "{searchQuery}"
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-8 max-w-lg mx-auto my-12 shadow-sm">
          <FaClipboardList className="text-[#0860C4]/20 mb-4" size={54} />
          <h4 className="text-slate-700 font-bold text-lg mb-2">
            No Test Records Found
          </h4>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            Please select a class section and click{" "}
            <span className="font-semibold text-[#0860C4]">"Find"</span> to
            retrieve the class test consolidated report.
          </p>
        </div>
      )}
    </section>
  );
};

export default ClassTestReport;
