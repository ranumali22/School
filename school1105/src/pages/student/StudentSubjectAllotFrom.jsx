

import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";

const StudentSubjectForm = ({ studentData, setShowForm, getStudentAllot }) => {
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [errors, setErrors] = useState({});
  const [edit_id, setedit_id] = useState("");
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  useEffect(() => {
    fetch(localurl + "subject_group/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        console.log("subject _group", data);

        setGroups(data.subject_name);
      });

    fetch(localurl + "subject/" + school_id)
      .then((res) => res.json())
      .then((data) => setAllSubjects(data.rows || data.row || []));



  }, []);


  useEffect(() => {
    if (!studentData) return;

    // group set
    setGroupId(studentData.subjectgroup_id || "");

    // edit id set
    if (studentData.subjectgroup_id) {

      setedit_id(studentData.id);
    }
    else {
      setedit_id(studentData.subjectgroup_id || "");

    }

    // subject ids convert
    const ids = studentData.subject_id
      ? String(studentData.subject_id).split(",").map(Number)
      : [];

    setSelectedSubjects(ids);
  }, [studentData]);



  const handleChange = (value) => {
    setGroupId(value);
  };

  useEffect(() => {
    if (!groupId || groups.length === 0 || allSubjects.length === 0) return;

    const group = groups.find((g) => g.id == groupId);

    if (group?.subject_ids) {
      const ids = group.subject_ids.split(",").map(Number);

      const filtered = allSubjects.filter((s) => ids.includes(s.id));

      setSubjects(filtered);
    }
  }, [groupId, groups, allSubjects]);



  console.log("SelectedSubjects 👉", selectedSubjects);


  const handleCheck = (subject) => {
    if (selectedSubjects.includes(subject.id)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
    } else {
      setSelectedSubjects([...selectedSubjects, subject.id]);
    }
  };

  const handleSubmit = async (e) => {
    const action = e;

    let newErrors = {};

    if (!groupId) newErrors.group = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const payload = {
      subjectgroup_id: groupId,
      subject_ids: selectedSubjects,
    };
    // ================= EDIT =================





    if (e == "edit") {
      console.log("edit_innnerrr", e);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow",
      };


      console.log("edit_id", edit_id);
      console.log("requestOptions", requestOptions);


      let url = localurl + "update_student_subject_allot/" + edit_id;

      fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);

          if (data.success) {
            handleApiResponse(data);

            // 🔥 reload list
            getStudentAllot();

            window.dispatchEvent(new Event("resetFilter"));

            // ✅ RESET
            setGroupId("");
            setSubjects([]);
            setErrors({});
            setShowForm(false);
            setedit_id("");
          } else {
            handleApiResponse(data);

            const msg = data.message?.toLowerCase();
            let newErrors = {};

            if (msg.includes("subjectgroup")) newErrors.group = data.message;

            setErrors(newErrors);
          }
        })
        .catch((err) => handleApiResponse(err));
    }

    // ================= ADD =================
    else {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            ...payload,
            //  student_id: studentData.student_id,
            student_id: studentData.student_id,
            session_id: session_id,
            school_id: school_id,
          }),
          redirect: "follow",
        };

        fetch(localurl + "add_student_subject_allot", requestOptions)
          .then((response) => response.text())
          .then((result) => {
            const data = JSON.parse(result);

            if (data.success) {
              handleApiResponse(data);

              // 🔥 reload list
              getStudentAllot();

              // ✅ RESET
              setGroupId("");
              setSubjects([]);
              setErrors({});
              setShowForm(false);
              setedit_id("");
            } else {
              handleApiResponse(data);

              const msg = data.message?.toLowerCase();
              let newErrors = {};

              if (msg.includes("subjectgroup")) newErrors.group = data.message;

              setErrors(newErrors);
            }
          })
          .catch((err) => handleApiResponse(err));
      } catch (err) {
        console.error("Submit error:", err);
      }
    }
  };

  console.log("subjects", subjects["subject_name"]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[400px]">
        <h2 className="font-bold mb-4">Select Group</h2>

        <select
          value={groupId} // 🔥 IMPORTANT
          className="w-full border p-2 mb-4"
          onChange={(e) => handleChange(e.target.value)}
        >
          <option>Select</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.group_name}
            </option>
          ))}
        </select>

        <div>
          {/* {subjects["subject_name"] &&
            subjects["subject_name"].map((s, i) => ( */}
          {subjects.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(s.id)}
                onChange={() => handleCheck(s)}
              />

              <span>{s.subject_name}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleSubmit(edit_id ? "edit" : "save")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {edit_id ? "Update" : "Save"}
          </button>

          <button
            onClick={() => setShowForm(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSubjectForm;
