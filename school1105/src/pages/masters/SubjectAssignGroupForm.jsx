import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { handleApiResponse, showError } from "../../Component/common/alert";
import {
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";

export default function SubjectAssignGroupForm({
  setGroups,
  groups,
  setShowForm,
  editIndex,
  setEditIndex,
  getSubjectGroup,
}) {
  const [groupData, setGroupData] = useState({
    groupName: "",
    displayOrder: "",
    subjects: [],
    status: "Active",
  });
  const [ButtonAction, setButtonAction] = useState("");
  const [errors, setErrors] = useState({});
  const [subjectsList, setSubjectsList] = useState([]);
  const [edit_id, setEditId] = useState("");

  const school_id = localStorage.getItem("school_id");

  useEffect(() => {
    fetch(localurl + "subject/" + school_id)
      .then((res) => res.json())
      .then(({ success, row }) => {
        if (success) {
          const activeData = row
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            })
            .filter((item) => item.status === "Active");
          setSubjectsList(activeData);
        }
      });
  }, []);

  useEffect(() => {
    if (editIndex !== null) {
      const editData = groups[editIndex];

      console.log("EDIT DATA 👉", editData); // 🔥 debug

      setGroupData({
        groupName: editData.group_name,
        displayOrder: editData.display_order,
        subjects: editData.subject_ids
          ? editData.subject_ids.split(",").map((id) => Number(id))
          : [],
        status: editData.status,
      });

      setEditId(editData.id);
    }
  }, [editIndex, groups]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setGroupData({
      ...groupData,
      [name]: value,
    });
  };

  const handleSubjectCheck = (id) => {
    if (groupData.subjects.includes(id)) {
      setGroupData({
        ...groupData,
        subjects: groupData.subjects.filter((s) => s !== id),
      });
    } else {
      setGroupData({
        ...groupData,
        subjects: [...groupData.subjects, id],
      });
    }
  };

  const resetForm = () => {
    setGroupData({
      groupName: "",
      displayOrder: "",
      subjects: [],
      status: "Active",
    });
    setEditId("");
    setEditIndex(null);
    setErrors({});
  };

  const handleSubmit = (action) => {
    let newErrors = {};

    if (!groupData.groupName?.trim()) {
      newErrors.groupName = "Required";
    }

    if (!groupData.displayOrder) {
      newErrors.displayOrder = "Required";
    }

    if (!groupData.status) {
      newErrors.status = "required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(
        groupData.groupName?.trim()
          ? groupData.displayOrder
            ? groupData.subjects && groupData.subjects.length > 0
              ? groupData.status
                ? ""
                : "Status is required"
              : "At least one Subject must be selected"
            : "Display Order is required"
          : "Group Name is required"
      );
      return;
    }

    setErrors({});

    const payload = {
      subject_ids: groupData.subjects.map((s) => s.id || s),
      group_name: groupData.groupName,
      display_order: Number(groupData.displayOrder),
      school_id: school_id,
      status: groupData.status.toLowerCase(),
    };

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // EDIT
    if (action === "edit") {
      fetch(localurl + "update_subject_group/" + edit_id, {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            handleApiResponse(data);
            getSubjectGroup(school_id);

            // ✅ RESET
            setGroupData({
              groupName: "",
              displayOrder: "",
              subjects: [],
              status: "Active",
            });

            setButtonAction("");
            setEditId("");
            setEditIndex(null);
            setErrors({});
            setShowForm(false);
          } else {
            const msg = data.message?.toLowerCase() || "";
            let apiErrors = {};

            if (msg.includes("group_name")) apiErrors.groupName = data.message;
            if (msg.includes("display_order"))
              apiErrors.displayOrder = data.message;
            if (msg.includes("status")) apiErrors.status = data.message;

            setErrors(apiErrors);
            handleApiResponse(data);
          }
        })
        .catch((err) => handleApiResponse(err));
    }

    // ADD
    else {
      fetch(localurl + "add_subject_group", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            handleApiResponse(data);
            getSubjectGroup(school_id);

            // ✅ RESET
            setGroupData({
              groupName: "",
              displayOrder: "",
              subjects: [],
              status: "Active",
            });

            setErrors({});

            if (action === "exit") {
              setShowForm(false);
            }
          } else {
            const msg = data.message?.toLowerCase() || "";
            let apiErrors = {};

            if (msg.includes("group_name")) apiErrors.groupName = data.message;
            if (msg.includes("display_order"))
              apiErrors.displayOrder = data.message;
            if (msg.includes("status")) apiErrors.status = data.message;

            setErrors(apiErrors);
            handleApiResponse(data);
          }
        })
        .catch((err) => handleApiResponse(err));
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white rounded-t-2xl max-w-full p-6">
        <h2 className="text-xl font-bold text-black mb-6">
          {edit_id ? "Update Subject Assign Group" : "Subject Assign Group"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FloatingInput
            label={<>Group Name <span className="text-red-500">*</span></>}
            name="groupName"
            value={groupData.groupName}
            onChange={handleChange}
            error={errors.groupName}
            required
          />

          <FloatingInput
            label={<>Display Order <span className="text-red-500">*</span></>}
            type="number"
            name="displayOrder"
            value={groupData.displayOrder}
            error={errors.displayOrder}
            onChange={handleChange}
            required
          />

          <FloatingSelect
            label="Status"
            name="status"
            value={groupData.status}
            onChange={handleChange}
            options={["Active", "Inactive"]}
          />
        </div>

        {/* Subjects */}
        <div className="mt-4">
          <label className="font-semibold">Subjects</label>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-2">
            {subjectsList.map((sub) => (
              <div key={sub.id} className="flex gap-2 capitalize">
                <input
                  type="checkbox"
                  checked={groupData.subjects.includes(sub.id)}
                  onChange={() => handleSubjectCheck(sub.id)}
                />
                <label>{sub.subject_name}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          {edit_id ? (
            <button
              onClick={() => handleSubmit("edit")}
              className="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Update
            </button>
          ) : (
            <>
              <button
                onClick={() => handleSubmit("continue")}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                Save & Continue
              </button>

              <button
                onClick={() => handleSubmit("exit")}
                className="bg-purple-600 text-white px-6 py-2 rounded"
              >
                Save & Exit
              </button>
            </>
          )}

          <button
            onClick={() => {
              resetForm();
              setShowForm(false);
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
