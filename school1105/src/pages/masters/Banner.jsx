import React, { useState, useEffect } from "react";
import { handleApiResponse, showSuccess, showError } from "../../Component/common/alert";
import { localurl } from "../../api/api";
import { FloatingInput, FloatingSelect } from "../../Component/common/FloatingInput";

const Banner = () => {
  const [showForm, setShowForm] = useState(false);
  const [banners, setBanners] = useState([]);
  const [errors, setErrors] = useState({});
  const [buttonAction, setButtonAction] = useState("");
  const [editId, setEditId] = useState("");
  const [schoolId, setSchoolId] = useState("");

  const [bannerData, setBannerData] = useState({
    title: "",
    image: null,
    imagePreview: "",
    display_order: "",
    status: "Active",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "display_order",
    direction: "asc",
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...banners].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });
    setBanners(sortedData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setBannerData((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
    } else {
      setBannerData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getBanners = (id) => {
    fetch(`${localurl}banners/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sorted = (data.row || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          setBanners(sorted);
        }
      })
      .catch((err) => console.error("Error fetching banners:", err));
  };

  useEffect(() => {
    const sId = localStorage.getItem("school_id");
    if (sId) {
      setSchoolId(sId);
      getBanners(sId);
    }
  }, []);

  const handleSubmit = async (action) => {
    let newErrors = {};
    if (!bannerData.title) newErrors.title = "Required";
    if (!bannerData.image && !editId) newErrors.image = "Required";
    if (!bannerData.display_order) newErrors.display_order = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }

    const formData = new FormData();
    formData.append("school_id", schoolId);
    formData.append("title", bannerData.title);
    formData.append("display_order", bannerData.display_order);
    formData.append("status", bannerData.status);
    if (bannerData.image) {
      formData.append("banner_image", bannerData.image);
    }

    const url = editId ? `${localurl}update_banner/${editId}` : `${localurl}add_banner`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        handleApiResponse(data);
        getBanners(schoolId);
        resetForm();
        if (action === "exit" || editId) {
          setShowForm(false);
        }
      } else {
        handleApiResponse(data);
      }
    } catch (err) {
      console.error("Submit error:", err);
      showError("Something went wrong");
    }
  };

  const resetForm = () => {
    setButtonAction("");
    setEditId("");
    setBannerData({
      title: "",
      image: null,
      imagePreview: "",
      display_order: "",
      status: "Active",
    });
    setErrors({});
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setButtonAction("edit");
    setBannerData({
      title: item.title,
      image: null,
      imagePreview: `${localurl.replace("/api/", "")}/uploads/banners/${item.banner_image}`,
      display_order: item.display_order,
      status: item.status,
    });
    setShowForm(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${localurl}status_banner/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "Active" ? "Inactive" : "Active",
        }),
      });
      const data = await res.json();
      handleApiResponse(data);
      getBanners(schoolId);
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const res = await fetch(`${localurl}delete_banner/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        handleApiResponse(data);
        getBanners(schoolId);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-t-2xl max-w-full p-4">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Banner Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Banner
        </button>
      </div>

      <div className="mt-6 w-full overflow-x-auto">
        <table className="min-w-full border text-center">
          <thead>
            <tr className="bg-[#0860C4] text-white">
              <th className="px-3 py-2 font-medium text-[14px]">#</th>
              <th className="px-3 py-2 font-medium text-[14px]">Preview</th>
              <th onClick={() => handleSort("title")} className="px-3 py-2 font-medium text-[14px] cursor-pointer">
                Title ⬍
              </th>
              <th onClick={() => handleSort("display_order")} className="px-3 py-2 font-medium text-[14px] cursor-pointer">
                Order ⬍
              </th>
              <th className="px-3 py-2 font-medium text-[14px]">Status</th>
              <th className="px-3 py-2 font-medium text-[14px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? (
              banners.map((b, index) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    <img
                      src={`${localurl.replace("/api/", "")}/uploads/banners/${b.banner_image}`}
                      alt={b.title}
                      className="w-20 h-10 object-cover mx-auto rounded border"
                    />
                  </td>
                  <td className="px-4 py-2">{b.title}</td>
                  <td className="px-4 py-2">{b.display_order}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-[12px] font-bold text-white ${b.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-3 justify-center items-center">
                    <button onClick={() => handleEdit(b)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium">
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(b.id, b.status)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${b.status === "Active" ? "bg-green-500" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${b.status === "Active" ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4">No Banners Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-xl w-[500px] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-black mb-6">
              {buttonAction === "edit" ? "Edit Banner" : "Add New Banner"}
            </h2>

            <div className="space-y-4">
              <FloatingInput
                label="Banner Title"
                name="title"
                value={bannerData.title}
                onChange={handleChange}
                error={errors.title}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 ml-1">Banner Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border rounded p-2 text-sm"
                />
                {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
                {bannerData.imagePreview && (
                  <img
                    src={bannerData.imagePreview}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded border"
                  />
                )}
              </div>

              <FloatingInput
                type="number"
                label="Display Order"
                name="display_order"
                value={bannerData.display_order}
                onChange={handleChange}
                error={errors.display_order}
              />



              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSubmit(buttonAction === "edit" ? "exit" : "continue")}
                  className="flex-1 bg-green-600 text-white py-2 rounded font-bold"
                >
                  {buttonAction === "edit" ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded font-bold"
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

export default Banner;
