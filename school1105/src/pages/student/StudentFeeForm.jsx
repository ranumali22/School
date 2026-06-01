import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { handleApiResponse } from "../../Component/common/alert";

const StudentFeeForm = ({ handleSubmit, classList, setShowForm, studentData }) => {
  const [formData, setFormData] = useState({
    registerClass: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    student_id: "",
    student_ids: "",
  });

  const [feeRows, setFeeRows] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [school_id, setSchoolId] = useState("");
  const [session_id, setSessionId] = useState("");

  const getFeeHeads = (school_id) => {
    fetch(`${localurl}feehead/${school_id}`)
      .then(res => res.json())
      .then(({ success, row }) => {
        if (success) {
          setFeeHeads(row);
        }
      })
      .catch(handleApiResponse);
  };



  console.log("studentData", studentData);


  useEffect(() => {
    if (studentData) {

      const school_id = localStorage.getItem("school_id");
      const session_id = localStorage.getItem("session_id");

      setSchoolId(school_id);
      setSessionId(session_id);

      let registerClass = studentData.registerClass;
      let student_id = studentData.student_id;





      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      fetch(localurl + "student_class_fee_head/" + school_id + "/" + session_id + "/" + registerClass + "/" + student_id, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log("fee students=>>", result)
          const { success } = JSON.parse(result);
          if (success) {
            const { feehead } = JSON.parse(result);
            setFeeRows(feehead);
          }

        })
        .catch((error) => console.error(error));


      if (school_id && studentData?.registerClass) {
        getFeeHeads(school_id, studentData.registerClass);
      }




      setFormData({
        registerClass: studentData.class_section,
        studentName: studentData.studentName,
        fatherName: studentData.fatherName,
        motherName: studentData.motherName,
        student_id: studentData.student_id,
        student_ids: studentData.student_ids || studentData.student_id
      });
    }
  }, [studentData]);

  const handleRowChange = (index, field, value) => {
    const updated = [...feeRows];
    updated[index][field] = value;
    setFeeRows(updated);
  };

  const total = feeRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );




  console.log("feeRowshead", feeRows);

  return (
    <div className="bg-white p-4 rounded-xl">



      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ">
        <div className="col-span-1">
          <h2 className="  mb-4">
            <span className="text-xl font-bold "> Student Fee : </span> {formData.student_ids}
          </h2>
        </div>
        <div className="col-span-1">
          <span className="text-sm"> <span className="text-sm font-bold ">Class:</span> {formData.registerClass}</span>
        </div>

        <div className="col-span-1">
          <span className="text-sm "> <span className="text-sm font-bold ">S.N: </span>{formData.studentName}</span>
        </div>

        <div className="col-span-1">
          <span className="text-sm "> <span className="text-sm font-bold ">F. N. :</span>  {formData.fatherName}</span>
        </div>

        <div className="col-span-1 ">
          <span className="text-sm ">  <span className="text-sm font-bold "> M. N. :  </span> {formData.motherName}</span>

        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="w-full border">

          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2">Fee Head</th>
              <th className="p-2">Date</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>

          <tbody>
            {feeRows.length > 0 ? (
              feeRows.map((row, index) => (
                <tr key={index} className="border-t">

                  <td className="p-2 font-semibold">
                    {row.feehead_name}
                  </td>

                  <td className="p-2">
                    <input
                      type="date"
                      value={row.date || ""}
                      onChange={(e) =>
                        handleRowChange(index, "date", e.target.value)
                      }
                      className="border p-2 w-full rounded"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleRowChange(index, "amount", e.target.value)
                      }
                      className="border p-2 w-full rounded"
                      placeholder="Enter Amount"
                    />
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-red-500 py-4">
                  No Fee Head Found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Total */}
      <div className="text-right mt-4 font-bold text-lg">
        Total Fee : ₹ {total}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">

        <button
          onClick={() => handleSubmit(formData, feeRows)}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Save
        </button>

        <button
          onClick={() => setShowForm(false)}
          className="bg-gray-500 text-white px-6 py-2 rounded"
        >
          Cancel
        </button>

      </div>

    </div>
  );
};

export default StudentFeeForm;