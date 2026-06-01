import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { localurl } from "../../api/api";
import { useLocation } from "react-router-dom";
import {
  ClassSelect,
  FloatingInput,
  FloatingInputs,
  FloatingSelect,
  FloatingSelectR,
} from "../../Component/common/FloatingInput";
import {
  showSuccess,
  showError,
  handleApiResponse,
} from "../../Component/common/alert";
import { CommonInput } from "../../Component/common/CommonInput";

export default function StudentForm({
  setStudents,
  students,
  setShowForm,
  refreshStudents,
}) {
  const navigate = useNavigate();
  const [classList, setClassList] = useState([]);
  const [mediumList, setMediumList] = useState([]);
  const [genderList, setGenderList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [nationalityList, setNationalityList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const editData = location.state?.student;
  // const editData = location.state?.student;


  useEffect(() => {
    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    // MEDIUM
    fetch(localurl + "medium/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });

          setMediumList(activeData);
        }
      });

    // GENDER
    fetch(localurl + "gender/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active")
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });
          setGenderList(activeData);
        }
      });

    // CATEGORY
    fetch(localurl + "category/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active",)
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });

          setCategoryList(activeData);
        }
      });
    // RELIGION
    fetch(localurl + "religion/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active",)
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });


          setReligionList(activeData);
        }
      });

    // CLASS DETAIL
    fetch(localurl + "class_section/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter(
              (item) => item.status === "Active",
            )
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });


          setSectionList(activeData);

          const uniqueClasses = [
            ...new Map(data.row.map((item) => [item.class_id, item])).values(),
          ];

          setClassList(uniqueClasses);
        }
      });

    // NATIONALITY
    fetch(localurl + "nationality/" + school_id)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeData = data.row
            .filter((item) => item.status === "Active",)
            .sort((a, b) => {
              const diff = (a.display_order || 0) - (b.display_order || 0);
              if (diff === 0) {
                const nameA = (a.class_name || a.className || a.name || a.category || a.gender || a.medium || a.nationality || a.religion || a.busRoute_name || a.busStand_name || a.subject_name || a.department || a.designation || a.shift || a.title || "") + (a.section ? " " + a.section : "");
                const nameB = (b.class_name || b.className || b.name || b.category || b.gender || b.medium || b.nationality || b.religion || b.busRoute_name || b.busStand_name || b.subject_name || b.department || b.designation || b.shift || b.title || "") + (b.section ? " " + b.section : "");
                return String(nameA).localeCompare(String(nameB));
              }
              return diff;
            });


          setNationalityList(activeData);
        }
      });
  }, []);

  const [studentFormData, setStudentFormData] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    primaryNo: "",
    secondaryNo: "",
    medium: "",
    email: "",
    dob: "",
    gender: "",
    category: "",
    photo: "",
    photoName: "",
    religion: "",
    nationality: "",
    rte: "",
    currentAddress: "",
    currentCity: "",
    currentState: "",
    currentPinCode: "",
    permanentAddress: "",
    permanentCity: "",
    permanentState: "",
    permanentPinCode: "",
    registerNo: "",
    registrationEnrollNo: "",
    registerAdmissionDate: "",
    registerClass: "",
    previousSchoolName: "",
    previousSrNo: "",
    previousClass: "",
    secondaryNo: "",
    busStand: "",
    busFare: "",
  });

  useEffect(() => {
    if (editData) {
      setStudentFormData({
        studentName: editData.name || "",
        fatherName: editData.fatherName || "",
        motherName: editData.motherName || "",
        primaryNo: editData.primaryNo || "",
        secondaryNo: editData.secondaryNo || "",
        medium: editData.medium || "None",
        email: editData.email || "",
        dob: editData.dob && !editData.dob.includes("1899") && !editData.dob.startsWith("0000") ? editData.dob.split("T")[0] : "",
        registerAdmissionDate: editData.registerAdmissionDate && !editData.registerAdmissionDate.includes("1899") && !editData.registerAdmissionDate.startsWith("0000")
          ? editData.registerAdmissionDate.split("T")[0]
          : "",
        gender: editData.gender || "",
        category: editData.category || "",
        rte:
          editData.rte === "Yes" || editData.rte === 1 || editData.rte === "1"
            ? "Yes"
            : "No",
        bloodgroup: editData.bloodgroup || "",
        photo: editData.photo || "",
        religion: editData.religion || "",
        nationality: editData.nationality || "",
        currentAddress: editData.currentAddress || "",
        currentCity: editData.currentCity || "",
        currentState: editData.currentState || "",
        currentPinCode: editData.currentPinCode || "",
        permanentAddress: editData.permanentAddress || "",
        permanentCity: editData.permanentCity || "",
        permanentState: editData.permanentState || "",
        permanentPinCode: editData.permanentPinCode || "",
        registerNo: editData.srNo || "",
        registrationEnrollNo: editData.registrationEnrollNo || "",
        registerClass: editData.classId || "",
        Class: editData.class || "",
        previousSchoolName: editData.previousSchool || "",
        previousSrNo: editData.previousSrNo || "",
        previousClass: editData.previousClass || "",
        busRoute: editData.busRoute || "",
        bussStand: editData.busStand || "",
        bussFare: editData.busFare || "",
      });
    }
  }, [editData]);

  console.log("edit dataaaaaaa", editData);
  const changeInputHandle = (e) => {
    const { name, value } = e.target;

    setStudentFormData({
      ...studentFormData,
      [name]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setStudentFormData((prev) => ({
        ...prev,
        photo: file,
        photoName: file.name,
      }));
    }

    console.log("student photo", studentFormData.photo);
  };

  const handleSubmit = async (action) => {
    let newErrors = {};

    if (!studentFormData.studentName) {
      newErrors.studentName = "Required";
    }

    if (!studentFormData.registerClass) {
      newErrors.registerClass = "Required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(studentFormData.studentName ? studentFormData.registerClass ? "" : "Class is required" : "Student Name is required");
      return;
    }

    const isEdit = !!editData;

    try {
      const school_id = localStorage.getItem("school_id");
      const session_id = localStorage.getItem("session_id");

      const payload = {
        studentName: studentFormData.studentName,
        school_id,
        session_id,
        fatherName: studentFormData.fatherName,
        motherName: studentFormData.motherName,
        primaryNo: studentFormData.primaryNo,
        secondaryNo: studentFormData.secondaryNo,
        medium: studentFormData.medium,
        email: studentFormData.email,
        dob: studentFormData.dob,
        bloodgroup: studentFormData.bloodgroup,
        rte: studentFormData.rte || "No",
        gender: studentFormData.gender,
        category: studentFormData.category,
        photo: studentFormData.photo,
        religion: studentFormData.religion,
        nationality: studentFormData.nationality,
        currentAddress: studentFormData.currentAddress,
        currentCity: studentFormData.currentCity,
        currentState: studentFormData.currentState,
        currentPinCode: studentFormData.currentPinCode,
        permanentAddress: studentFormData.permanentAddress,
        permanentCity: studentFormData.permanentCity,
        permanentState: studentFormData.permanentState,
        permanentPinCode: studentFormData.permanentPinCode,
        registerNo: studentFormData.registerNo,
        registrationEnrollNo: studentFormData.registrationEnrollNo,
        registerAdmissionDate: studentFormData.registerAdmissionDate,
        registerClass: studentFormData.registerClass,
        previousSchoolName: studentFormData.previousSchoolName,
        previousSrNo: studentFormData.previousSrNo,
        previousClass: studentFormData.previousClass,
        busRoute: studentFormData.busRoute,
        busStand: studentFormData.busStand,
        busFare: studentFormData.busFare
      };


      console.log("edit=payload", payload);


      const url = isEdit
        ? `${localurl}update_students/${editData.id}`
        : `${localurl}add_students`;

      const method = isEdit ? "PUT" : "POST";

      const formData = new FormData();

      // 🔥 ALL fields automatically add
      Object.keys(payload).forEach((key) => {
        if (key !== "photo") {
          // photo alag handle karenge
          formData.append(key, payload[key] || "");
        }
      });

      // 🔥 photo safely handle
      if (studentFormData.photo instanceof File) {
        formData.append("photo", studentFormData.photo);
      }
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (data?.success) {
        // ✅ ONLY THIS (NO EXTRA FETCH)
        if (typeof refreshStudents === "function") {
          refreshStudents();
        }

        showSuccess(
          data.message ||
          (isEdit
            ? "Student Updated Successfully ✅"
            : "Student Added Successfully ✅"),
        );

        // ✅ RESET ONLY WHEN ADD
        if (!isEdit && action === "continue") {
          setStudentFormData({
            studentName: "",
            fatherName: "",
            motherName: "",
            primaryNo: "",
            secondaryNo: "",
            medium: "",
            email: "",
            dob: "",
            gender: "",
            rte: "",
            category: "",
            photo: "",
            religion: "",
            nationality: "",
            currentAddress: "",
            currentCity: "",
            currentState: "",
            currentPinCode: "",
            permanentAddress: "",
            permanentCity: "",
            permanentState: "",
            permanentPinCode: "",
            registerNo: "",
            registrationEnrollNo: "",
            registerAdmissionDate: "",
            registerClass: "",
            previousSchoolName: "",
            previousSrNo: "",
            previousClass: "",
            busRoute: "",
            busStand: "",
            busFare: "",
          });
        }

        // ✅ EXIT / CLOSE
        if (action === "exit" || isEdit) {
          if (typeof setShowForm === "function") {
            setShowForm(false);
          } else {
            navigate("/student-list");
          }
        }
      } else {
        handleApiResponse(data || { message: "Something went wrong ❌" });
      }
    } catch (err) {
      console.error(err);
      showError("Something went wrong ❌");
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen  ">

      {editData ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-3">
            Update Admission Form
          </h1>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-3">
            New Admission Form
          </h1>
        </>
      )}
      <div>
        {/* Card 1 Basic Info */}

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <FloatingInput
              label={<>Student Name <span className="text-red-500">*</span></>}

              required
              name="studentName"
              value={studentFormData.studentName}
              error={errors.studentName}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Father Name"
              name="fatherName"
              value={studentFormData.fatherName}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Mother Name"
              name="motherName"
              value={studentFormData.motherName}
              onChange={changeInputHandle}
            />

            <CommonInput
              label="Primary No"
              name="primaryNo"
              value={studentFormData.primaryNo}
              onChange={changeInputHandle}
            />

            <CommonInput
              label="Secendery No"
              name="secondaryNo"
              value={studentFormData.secondaryNo}
              onChange={changeInputHandle}
            />

            <FloatingSelect
              label="Medium"
              name="medium"
              value={studentFormData.medium || "---Select Medium---"}
              onChange={changeInputHandle}
              options={[
                "---Select Medium---",
                ...mediumList
                  .map((item) => item.medium)
                  .filter((m) => m !== "None"),
              ]}
            />

            <CommonInput
              label="Email"
              name="email"
              value={studentFormData.email}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="DOB"
              name="dob"
              type="date"
              value={studentFormData.dob}
              onChange={changeInputHandle}
            />

            <FloatingSelect
              label="Gender"
              name="gender"
              value={studentFormData.gender || "---Select Gender---"}
              onChange={changeInputHandle}
              options={[
                "---Select Gender---",
                ...genderList.map((item) => item.gender),
              ]}
            />

            <FloatingSelect
              label="Category"
              name="category"
              value={studentFormData.category || "---Select Category---"}
              onChange={changeInputHandle}
              options={[
                "---Select Category---",
                ...categoryList.map((item) => item.category),
              ]}
            />

            <FloatingSelect
              label="Religion"
              name="religion"
              value={studentFormData.religion || "---Select Religion---"}
              onChange={changeInputHandle}
              options={[
                "---Select Religion---",
                ...religionList.map((item) => item.religion),
              ]}
            />

            <FloatingSelect
              label="Nationality"
              name="nationality"
              value={studentFormData.nationality || "---Select Nationality---"}
              onChange={changeInputHandle}
              options={[
                "---Select Nationality---",
                ...nationalityList
                  .map((item) => item.nationality)
                  .filter((n) => n !== "None"),
              ]}
            />
            {/* <FloatingInputs
              label="Profile Photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            /> */}


            <div className="flex flex-col gap-2">
              <FloatingInputs
                label="Profile Photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
              />

              {(studentFormData.photo || editData?.photo) && (
                <img
                  src={
                    studentFormData.photo instanceof File
                      ? URL.createObjectURL(studentFormData.photo)
                      : `${localurl.replace("/api/", "")}/uploads/student/${studentFormData.photo || editData?.photo}`
                  }
                  alt="Student Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                />
              )}
            </div>

            <FloatingInputs
              label="Blood Group"
              name="bloodgroup"
              value={studentFormData.bloodgroup}
              onChange={changeInputHandle}
            />
            <div className="flex items-center gap-2">
              <span>RTE</span>
              <input
                type="checkbox"
                checked={studentFormData.rte === "Yes"}
                onChange={(e) =>
                  setStudentFormData({
                    ...studentFormData,
                    rte: e.target.checked ? "Yes" : "No",
                  })
                }
              />
            </div>
          </div>
          <hr className="mt-4" />
          <h3 className="font-medium mb-4 mt-2 ">Admission Class Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ClassSelect
              label={<>Class Section <span className="text-red-500">*</span></>}
              required
              name="registerClass"
              value={
                studentFormData.registerClass || "---Select Class Section---"
              }
              onChange={changeInputHandle}
              error={errors.registerClass}
              options={[
                { label: "---Select Class Section---", value: "" },

                ...sectionList.map((record) => {
                  return {
                    label: `${record.class_name} - ${record.section}`, // 🔥 best UX
                    value: record.id, // ⚠️ IMPORTANT (not class_id)
                  };
                }),
              ]}
            />

            <FloatingInputs
              label="Admission Date"
              name="registerAdmissionDate"
              type="date"
              value={studentFormData.registerAdmissionDate}
              onChange={changeInputHandle}
            />
            <FloatingInputs
              label="Register Page No"
              name="registerNo"
              value={studentFormData.registerNo}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Enrollment No"
              name="registrationEnrollNo"
              value={studentFormData.registrationEnrollNo}
              onChange={changeInputHandle}
            />
          </div>
          {/* Card 2 Address */}

          <h2 className="text-xl font-semibold mb-2 mt-5">Address Details</h2>

          <h3 className="font-medium mb-4">Current Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FloatingInputs
              label="Address"
              name="currentAddress"
              value={studentFormData.currentAddress}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="City"
              name="currentCity"
              value={studentFormData.currentCity}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="State"
              name="currentState"
              value={studentFormData.currentState}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Pin Code"
              name="currentPinCode"
              value={studentFormData.currentPinCode}
              onChange={changeInputHandle}
            />
          </div>

          <h3 className="font-medium mb-4 mt-2">Permanent Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
            <FloatingInputs
              label="Address"
              name="permanentAddress"
              value={studentFormData.permanentAddress}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="City"
              name="permanentCity"
              value={studentFormData.permanentCity}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="State"
              name="permanentState"
              value={studentFormData.permanentState}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Pin Code"
              name="permanentPinCode"
              value={studentFormData.permanentPinCode}
              onChange={changeInputHandle}
            />
          </div>

          <hr className="mt-4" />

          <h3 className="font-medium mt-2 mb-4">Previous School Detail</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
            <FloatingInputs
              label="Previous School"
              name="previousSchoolName"
              value={studentFormData.previousSchoolName}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="SR No"
              name="previousSrNo"
              value={studentFormData.previousSrNo}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Previous Class"
              name="previousClass"
              value={studentFormData.previousClass}
              onChange={changeInputHandle}
            />
          </div>

          <h3 className="font-medium mb-4 mt-2">Bus Detail</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FloatingInputs
              label="Bus Route"
              name="busRoute"
              value={studentFormData.busRoute}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Bus Stand"
              name="busStand"
              value={studentFormData.busStand}
              onChange={changeInputHandle}
            />

            <FloatingInputs
              label="Bus Fare"
              name="busFare"
              value={studentFormData.busFare}
              onChange={changeInputHandle}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {editData ? (
              <>
                {/* UPDATE BUTTON */}
                <button
                  onClick={() => handleSubmit()}
                  className="bg-purple-600 text-white px-6 py-2 rounded"
                >
                  Update
                </button>

                {/* CANCEL BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof setShowForm === "function") {
                      setShowForm(false);
                    } else {
                      navigate("/student-list");
                    }
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {/* SAVE & CONTINUE */}
                <button
                  onClick={() => handleSubmit("continue")}
                  className="bg-green-600 text-white px-6 py-2 rounded"
                >
                  Save & Continue
                </button>

                {/* SAVE & EXIT */}
                <button
                  onClick={() => handleSubmit("exit")}
                  className="bg-purple-600 text-white px-6 py-2 rounded"
                >
                  Save & Exit
                </button>

                {/* CANCEL */}
                <button
                  type="button"
                  onClick={() => {
                    // handleSubmit("continue")
                    setShowForm(false);
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        {/* Buttons */}
      </div>
    </div>
  );
}
