import React, { useState, useEffect } from "react";
import {
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";

const AddReligion = () => {
  const [showForm, setShowForm] = useState(false);
  const [religions, setReligions] = useState([]);
  const [school_id, setschool_id] = useState("");
  const [edit_id, setedit_id] = useState("");
  const [ButtonAction, setButtonAction] = useState("");
  const [errors, setErrors] = useState({});

  const [religionData, setReligionData] = useState({
    religionName: "",
    displayOrder: "",
    status: "Active",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc"
  });

  const handleSort = (key) => {

    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedData = [...religions].sort((a, b) => {

      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc"
        ? a[key] - b[key]
        : b[key] - a[key];

    });

    setReligions(sortedData);
  };

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    setschool_id(school_id);
    getReligion(school_id);
  }, []);

  // INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReligionData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // GET DATA
  const getReligion = (school_id) => {
    fetch(localurl + "religion/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // setReligions(data.row);
          setReligions(
            data.row.sort((a, b) => {
  const diff = (a.display_order || 0) - (b.display_order || 0);
  if (diff === 0) {
    const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
    const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
    return String(nameA).localeCompare(String(nameB));
  }
  return diff;
})
          );
        }
      })
      .catch((err) => console.error(err));
  };

  // SUBMIT
  const handleSubmit = (action) => {
    const newErrors = {};

    if (!religionData.religionName) newErrors.religionName = "Required";
    if (!religionData.displayOrder) newErrors.displayOrder = "Required";

    setErrors(newErrors);

    const payload = {
      school_id: school_id,
      religion: religionData.religionName,
      display_order: Number(religionData.displayOrder),
      status: religionData.status,
    };

    const url =
      action === "edit"
        ? localurl + "update_religion/" + edit_id
        : localurl + "add_religion";

    const method = action === "edit" ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        handleApiResponse(data);

        if (data.success) {
          getReligion(school_id);

          setReligionData({
            religionName: "",
            displayOrder: "",
            status: "Active",
          });
          setErrors({});

          if (action === "exit" || action === "edit") {
            setShowForm(false);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  // EDIT
  const handleEdit = (index, id) => {
    const item = religions[index];

    setedit_id(id);
    setButtonAction("edit");

    setReligionData({
      religionName: item.religion,
      displayOrder: item.display_order,
      status: item.status === "Active" ? "Active" : "Inactive",
    });

    setShowForm(true);
  };


  const toggleStatus = async (index) => {
    try {
      const item = religions[index];

      const newStatus = item.status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_religion/" + item.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        getReligion(school_id);
        handleApiResponse(data)
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };
  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Religion Master</h2>

        <button
          onClick={() => {
            setShowForm(true);
            setButtonAction("");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Religion
        </button>
      </div>

      {/* TABLE */}
      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-[#0860C4] text-white text-center">
              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                # </th>
              <th onClick={() => handleSort("religion")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Religion ⬍</th>
              <th onClick={() => handleSort("display_order")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Display Order ⬍</th>
              <th onClick={() => handleSort("status")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Status ⬍</th>
              <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action</th>
            </tr>
          </thead>

          <tbody>
            {religions.length > 0 ? (
              religions.map((r, index) => (
                <tr key={index} className="text-center border-t">
                  <td>{index + 1}</td>
                  <td>{r.religion}</td>
                  <td>{r.display_order}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded text-white ${r.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {r.status === "Active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="flex gap-2 justify-center py-2">
                    <button
                      onClick={() => handleEdit(index, r.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(index)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${r.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transition 
                          ${r.status === "Active" ? "translate-x-6" : ""}`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No Data Found</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl w-[500px] p-6">
            <h2 className="text-xl font-bold text-black mb-6">Add Religion</h2>

            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label={<>Religion Name <span className="text-red-500">*</span></>}
                required
                name="religionName"
                value={religionData.religionName}
                error={errors.religionName}
                onChange={handleChange}
              />

              <FloatingInput
                type="number"
                required
                label={<>Display Order <span className="text-red-500">*</span></>}
                name="displayOrder"
                value={religionData.displayOrder}
                error={errors.displayOrder}
                onChange={handleChange}
              />

              <FloatingSelect
                label="Status"
                name="status"
                value={religionData.status}
                onChange={handleChange}
                options={["Active", "Inactive"]}
              />

              <div className="col-span-2 flex gap-3 mt-4">
                {ButtonAction === "" ? (
                  <>
                    <button
                      onClick={() => handleSubmit("continue")}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Save & Continue
                    </button>

                    <button
                      onClick={() => handleSubmit("exit")}
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Save & Exit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSubmit("edit")}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                )}

                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReligion;
