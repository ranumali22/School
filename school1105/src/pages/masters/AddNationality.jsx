import React, { useState, useEffect } from "react";
import {
  FloatingInput,
  FloatingSelect,
} from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";

const AddNationality = () => {
  const [showForm, setShowForm] = useState(false);
  const [nationalities, setNationalities] = useState([]);
  const [school_id, setschool_id] = useState("");
  const [edit_id, setedit_id] = useState("");
  const [ButtonAction, setButtonAction] = useState("");
  const [errors, setErrors] = useState({});

  const [nationData, setNationData] = useState({
    nationName: "",
    displayOrder: "",
    status: "Active",
  });

  useEffect(() => {
    let school_id = localStorage.getItem("school_id");
    setschool_id(school_id);
    getNationality(school_id);
  }, []);

  // INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNationData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // GET DATA
  const getNationality = (school_id) => {
    fetch(localurl + "nationality/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // setNationalities(data.row);
          setNationalities(
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

    if (!nationData.nationName) newErrors.nationName = "Required";
    if (!nationData.displayOrder) newErrors.displayOrder = "Required";

    setErrors(newErrors);

    const payload = {
      school_id: school_id,
      nationality: nationData.nationName,
      display_order: Number(nationData.displayOrder),
      status: nationData.status,
    };

    const url =
      action === "edit"
        ? localurl + "update_nationality/" + edit_id
        : localurl + "add_nationality";

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
          getNationality(school_id);

          setNationData({
            nationName: "", // ✅ FIX
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


  const toggleStatus = async (index) => {
    try {
      const item = nationalities[index];

      const newStatus = item.status === "Active" ? "Inactive" : "Active";

      const res = await fetch(localurl + "status_nationality/" + item.id, {
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
        getNationality(school_id);
        handleApiResponse(data)
      }
    } catch (data) {
      handleApiResponse(data);
    }
  };


  const handleEdit = (index, id) => {
    const item = nationalities[index];

    setedit_id(id);
    setButtonAction("edit");

    setNationData({
      nationName: item.nationality,
      displayOrder: item.display_order,
      status: item.status === "Active" ? "Active" : "Inactive",
    });

    setShowForm(true);
  };
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

    const sortedData = [...nationalities].sort((a, b) => {

      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return direction === "asc"
        ? a[key] - b[key]
        : b[key] - a[key];

    });

    setNationalities(sortedData);
  };
  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Nationality Master</h2>

        <button
          onClick={() => {
            setShowForm(true);
            setButtonAction("");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Nationality
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
              <th onClick={() => handleSort("nationality")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Nationality ⬍</th>
              <th onClick={() => handleSort("display_order")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Display Order ⬍</th>
              <th onClick={() => handleSort("status")}
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Status ⬍</th>
              <th
                className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                Action </th>
            </tr>
          </thead>
          <tbody>
            {nationalities.length > 0 ? (
              nationalities.map((n, index) => (
                <tr key={index} className="text-center border-t">
                  <td>{index + 1}</td>
                  <td>{n.nationality}</td>
                  <td>{n.display_order}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded text-white ${n.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {n.status === "Active" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="flex gap-2 justify-center py-2">
                    <button
                      onClick={() => handleEdit(index, n.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(index)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 
                        ${n.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transition 
                          ${n.status === "Active" ? "translate-x-6" : ""}`}
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
            <h2 className="text-xl font-bold text-black mb-6">Add Nationality</h2>

            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label={<>Nation Name <span className="text-red-500">*</span></>}
                required
                name="nationName"
                value={nationData.nationName}
                error={errors.nationName}
                onChange={handleChange}
              />

              <FloatingInput
                type="number"
                label={<>Display Order <span className="text-red-500">*</span></>}
                required
                name="displayOrder"
                value={nationData.displayOrder}
                error={errors.displayOrder}
                onChange={handleChange}
              />

              <FloatingSelect
                label="Status"
                name="status"
                value={nationData.status}
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

export default AddNationality;
